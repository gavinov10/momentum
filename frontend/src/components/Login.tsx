import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';

interface LoginFormData {
    email: string;
    password: string;
}

export const Login: React.FC = () => {
    const { login, isLoading, error, clearError } = useAuthStore();
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        clearError();
        try {
            if (isRegisterMode) {
                // For registration, we'd need a name field
                // For now, just show login
                alert('Registration form coming soon! Use login for now.');
            } else {
                await login(data.email, data.password);
            }
        } catch (err) {
            // Error is handled by the store
            console.error('Login failed:', err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>🚀 Momentum</h1>
                <p className="subtitle">Job Application Tracker</p>

                <form onSubmit={handleSubmit(onSubmit)} className="login-form">
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
                        <input
                            id="password"
                            type="password"
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
                        {isLoading ? 'Loading...' : 'Login'}
                    </button>
                </form>

                <p className="register-link">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={() => setIsRegisterMode(!isRegisterMode)}
                        className="link-button"
                    >
                        {isRegisterMode ? 'Login instead' : 'Register'}
                    </button>
                </p>
            </div>
        </div>
    );
};