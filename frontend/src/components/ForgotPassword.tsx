import { useState } from "react";
import { useForm } from "react-hook-form";

interface ForgotPasswordForm {
  email: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export const ForgotPassword: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      // Always show success even if email doesn't exist (security best practice)
      setSubmitted(true);
    } catch (error) {
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Momentum</h1>
        {submitted ? (
          <div>
            <h2>Check your email</h2>
            <p style={{ color: "#666", marginTop: "8px" }}>
              If an account exists for that email, you'll receive a password
              reset link shortly.
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
            <h2>Forgot password</h2>
            <p style={{ color: "#666", margin: "8px 0 24px" }}>
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <span className="error-message">{errors.email.message}</span>
                )}
              </div>
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send reset link"}
              </button>
            </form>
            <a
              href="/login"
              style={{
                display: "block",
                marginTop: "16px",
                color: "#666",
                fontSize: "14px",
              }}
            >
              Back to login
            </a>
          </>
        )}
      </div>
    </div>
  );
};
