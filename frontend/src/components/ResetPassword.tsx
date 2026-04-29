import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });

      if (!response.ok) {
        const err = await response.json();
        setError(err.detail || "Reset failed. Your link may have expired.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Momentum</h1>
          <p style={{ color: "red" }}>
            Invalid reset link. Please request a new one.
          </p>
          <a
            href="/forgot-password"
            style={{ color: "#000", marginTop: "16px", display: "block" }}
          >
            Request new link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Momentum</h1>
        {success ? (
          <div>
            <h2>Password updated</h2>
            <p style={{ color: "#666", marginTop: "8px" }}>
              Your password has been reset successfully.
            </p>
            <a
              href="/login"
              style={{ display: "block", marginTop: "24px", color: "#000" }}
            >
              Back to login
            </a>
          </div>
        ) : (
          <>
            <h2>Reset password</h2>
            <p style={{ color: "#666", margin: "8px 0 24px" }}>
              Enter your new password below.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  placeholder="Enter new password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <span className="error-message">
                    {errors.password.message}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) =>
                      val === watch("password") || "Passwords do not match",
                  })}
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>
              {error && <div className="error-banner">{error}</div>}
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Reset password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
