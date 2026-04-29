import re
import base64
import json
from datetime import datetime, timezone
from typing import Optional

from anthropic import Anthropic
from fastapi import APIRouter, Depends, HTTPException
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.config import fastapi_users
from app.db.database import get_db
from app.db.models import Application, ApplicationStatus, OAuthAccount, User

router = APIRouter()
anthropic_client = Anthropic()

get_current_user = fastapi_users.current_user()


def normalize_role(role: str) -> str:
    """Normalize role for duplicate detection."""
    role = re.sub(r',?\s*(Austin|TX|CA|NY|Remote|Hybrid|Summer \d+|Spring \d+|Fall \d+)[^,]*', '', role)
    return role.strip().lower()


async def get_gmail_service(user: User, db: AsyncSession):
    result = await db.execute(
        select(OAuthAccount).where(
            OAuthAccount.user_id == user.id,
            OAuthAccount.oauth_name == "google"
        )
    )
    oauth_account = result.scalar_one_or_none()
    if not oauth_account:
        raise HTTPException(status_code=400, detail="Google account not connected")
    credentials = Credentials(token=oauth_account.access_token)
    service = build("gmail", "v1", credentials=credentials)
    return service


def parse_email_with_claude(email_subject: str, email_body: str) -> Optional[dict]:
    prompt = f"""Extract job application info from this email.

Email Subject: {email_subject}
Email Body (first 1000 chars): {email_body[:1000]}

Rules:
- company_name: the company the person applied to. If not in body, extract from subject line (e.g. "Thank you for applying to Horace Mann" → "Horace Mann", "Proofpoint - Thank you for applying!" → "Proofpoint", "Thank you for applying to EarnIn!" → "EarnIn")
- role: the job title they applied for. Do NOT include location, city, state, or season/year (e.g. "Summer 2026") in the role. If not mentioned anywhere, use "Not specified"
- status: "applied" for confirmations, "rejected" if they say no, "interview" if scheduling interview, "offer" if job offer

IMPORTANT: Return {{"is_job_application": false}} if this email is:
- A job alert or job recommendation email
- A newsletter or marketing email
- A reminder to apply somewhere
- Anything where the person did NOT already submit an application

Only return application data if the email confirms the person already submitted an application.

Respond ONLY with JSON:
{{"company_name": "Acme Corp", "role": "Software Engineer", "status": "applied"}}
or
{{"is_job_application": false}}"""

    message = anthropic_client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}]
    )

    try:
        response_text = message.content[0].text.strip()
        response_text = response_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(response_text)
        if data.get("is_job_application") is False:
            return None
        if not data.get("company_name"):
            return None
        return data
    except (json.JSONDecodeError, KeyError, IndexError):
        return None


@router.post("/sync")
async def sync_gmail(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = await get_gmail_service(user, db)

    query = (
        "subject:(\"thank you for applying\" OR \"thank you for your application\" OR "
        "\"we received your application\" OR \"your application has been received\" OR "
        "\"application confirmation\" OR \"application submitted\" OR "
        "\"next steps for your application\" OR \"update regarding your\" OR "
        "\"your application with\") "
        "-from:(linkedin.com OR glassdoor.com OR indeed.com OR ziprecruiter.com OR "
        "monster.com OR careerbuilder.com OR dice.com OR wellfound.com)"
    )

    if user.last_gmail_sync:
        since_timestamp = int(user.last_gmail_sync.timestamp())
        query += f" after:{since_timestamp}"

    try:
        results = service.users().messages().list(
            userId="me",
            q=query,
            maxResults=10
        ).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gmail API error: {str(e)}")

    messages = results.get("messages", [])

    if not messages:
        user.last_gmail_sync = datetime.now(timezone.utc)
        await db.commit()
        return {"synced": 0, "message": "No new job application emails found"}

    new_applications = 0
    skipped = 0

    for msg in messages:
        try:
            msg_data = service.users().messages().get(
                userId="me",
                id=msg["id"],
                format="full"
            ).execute()

            internal_date_ms = int(msg_data.get("internalDate", 0))
            date_applied = datetime.fromtimestamp(internal_date_ms / 1000, tz=timezone.utc) if internal_date_ms else None

            headers = msg_data.get("payload", {}).get("headers", [])
            subject = next(
                (h["value"] for h in headers if h["name"].lower() == "subject"),
                ""
            )

            payload = msg_data.get("payload", {})

            def extract_body(p):
                if "parts" in p:
                    for part in p["parts"]:
                        if part.get("mimeType") == "text/plain":
                            data = part.get("body", {}).get("data", "")
                            if data:
                                return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
                    for part in p["parts"]:
                        if part.get("mimeType") == "text/html":
                            data = part.get("body", {}).get("data", "")
                            if data:
                                html = base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
                                return re.sub(r'<[^>]+>', ' ', html)
                    for part in p["parts"]:
                        result = extract_body(part)
                        if result:
                            return result
                else:
                    data = p.get("body", {}).get("data", "")
                    if data:
                        return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
                return ""

            body = extract_body(payload)

            parsed = parse_email_with_claude(subject, body)

            if not parsed:
                skipped += 1
                continue

            company_name = parsed.get("company_name", "").strip()
            role = parsed.get("role", "").strip()

            if not company_name:
                skipped += 1
                continue

            if not role or role.lower() in ("unknown", "not specified", ""):
                role = "Not specified"

            # Check for duplicate using Gmail message ID first
            existing_by_id = await db.execute(
                select(Application).where(
                    Application.user_id == user.id,
                    Application.gmail_message_id == msg["id"],
                )
            )
            if existing_by_id.scalar_one_or_none():
                skipped += 1
                continue

            # Map status string to enum
            status_map = {
                "applied": ApplicationStatus.APPLIED,
                "interview": ApplicationStatus.INTERVIEW,
                "offer": ApplicationStatus.OFFER,
                "rejected": ApplicationStatus.REJECTED,
                "withdrawn": ApplicationStatus.WITHDRAWN,
            }
            status = status_map.get(parsed.get("status", "applied"), ApplicationStatus.APPLIED)

            # Secondary check — same company and similar role (normalized)
            existing_apps_result = await db.execute(
                select(Application).where(
                    Application.user_id == user.id,
                    Application.company_name == company_name,
                )
            )
            existing_apps = existing_apps_result.scalars().all()
            normalized_new_role = normalize_role(role)
            is_duplicate = any(
                normalize_role(app.role) == normalized_new_role
                for app in existing_apps
            )
            if is_duplicate:
                skipped += 1
                continue

            application = Application(
                user_id=user.id,
                company_name=company_name,
                role=role,
                status=status,
                gmail_message_id=msg["id"],
                date_applied=date_applied,
                last_activity=datetime.now(timezone.utc),
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(application)
            new_applications += 1

        except Exception as e:
            skipped += 1
            continue

    user.last_gmail_sync = datetime.now(timezone.utc)
    await db.commit()

    return {
        "synced": new_applications,
        "skipped": skipped,
        "message": f"Added {new_applications} new application{'s' if new_applications != 1 else ''}",
        "last_synced": user.last_gmail_sync.isoformat() if user.last_gmail_sync else None,
    }


@router.get("/last-sync")
async def get_last_sync(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return {
        "last_synced": user.last_gmail_sync.isoformat() if user.last_gmail_sync else None,
    }