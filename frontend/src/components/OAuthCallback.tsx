import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, loadUser } = useAuthStore();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      navigate("/login?error=oauth_failed", { replace: true });
      return;
    }

    // Exchange the code for a token via the backend
    const exchangeCode = async () => {
      try {
        const params = new URLSearchParams({
          code,
          state,
        });

        const response = await fetch(
          `${API_BASE_URL}/auth/google/callback?${params.toString()}`,
          { method: "GET" },
        );

        if (!response.ok) {
          throw new Error("Token exchange failed");
        }

        const data = await response.json();

        if (data.access_token) {
          setToken(data.access_token);
          await loadUser();
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/login?error=oauth_failed", { replace: true });
        }
      } catch (error) {
        navigate("/login?error=oauth_failed", { replace: true });
      }
    };

    exchangeCode();
  }, []);

  return (
    <div className="login-container">
      <div className="login-card">
        <p>Signing you in...</p>
      </div>
    </div>
  );
};
