"""add_location_and_recruiter_remove_company_size

Revision ID: a1b2c3d4e5f6
Revises: c5f10b4fbf6a
Create Date: 2025-01-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '0b132f621fb5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add location column
    op.add_column('applications', sa.Column('location', sa.String(), nullable=True))
    # Add recruiter column
    op.add_column('applications', sa.Column('recruiter', sa.String(), nullable=True))
    # Remove company_size column
    op.drop_column('applications', 'company_size')


def downgrade() -> None:
    # Restore company_size column
    op.add_column('applications', sa.Column('company_size', sa.String(), nullable=True))
    # Remove recruiter column
    op.drop_column('applications', 'recruiter')
    # Remove location column
    op.drop_column('applications', 'location')

