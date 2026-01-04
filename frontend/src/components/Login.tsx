import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';

interface LoginFormData {
    email: string;
    password: string;
    name?: string;
}

export const Login: React.FC = () => {
    const { login, register: registerUser, isLoading, error, clearError } = useAuthStore();
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginFormData>();

    const switchMode = () => {
        setIsRegisterMode(!isRegisterMode);
        clearError();
        reset();
    };

    const handleGoogleLogin = () => {
        // TODO: Implement Google OAuth
        alert('Google login coming soon!');
    };

    const onSubmit = async (data: LoginFormData) => {
        clearError();
        try {
            if (isRegisterMode) {
                if (!data.name || !data.name.trim()) {
                    return;
                }
                await registerUser(data.email, data.password, data.name.trim());
            } else {
                await login(data.email, data.password);
            }
        } catch (err) {
            console.error(isRegisterMode ? 'Registration failed:' : 'Login failed:', err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Momentum</h1>

                {/* Google Login Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="google-login-button"
                    disabled={isLoading}
                >
                    <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                </button>

                <div className="divider">
                    <span>or</span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                    {isRegisterMode && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                {...register('name', {
                                    required: isRegisterMode ? 'Name is required' : false,
                                    minLength: {
                                        value: 2,
                                        message: 'Name must be at least 2 characters',
                                    },
                                })}
                                placeholder="John Doe"
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <span className="error-message">{errors.name.message}</span>
                            )}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                            placeholder="you@example.com"
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <span className="error-message">{errors.email.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters',
                                    },
                                })}
                                placeholder="Enter your password"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {!isRegisterMode && (
                            <a href="#" className="forgot-password-link" onClick={(e) => { e.preventDefault(); alert('Forgot password feature coming soon!'); }}>
                                Forgot password?
                            </a>
                        )}
                        {errors.password && (
                            <span className="error-message">{errors.password.message}</span>
                        )}
                    </div>

                    {error && (
                        <div className="error-banner">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading 
                            ? (isRegisterMode ? 'Creating Account...' : 'Logging in...') 
                            : (isRegisterMode ? 'Register' : 'Login')
                        }
                    </button>
                </form>

                <p className="register-link">
                    {isRegisterMode ? (
                        <>
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={switchMode}
                                className="link-button"
                            >
                                Login
                            </button>
                        </>
                    ) : (
                        <>
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={switchMode}
                                className="link-button"
                            >
                                Register now
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};