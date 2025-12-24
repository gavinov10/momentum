import React from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../services/api';
import type { CreateApplication, Application } from '../services/api';

interface ApplicationFormProps {
    onSuccess: (application: Application) => void;
    onCancel?: () => void;
}

type ApplicationFormData = CreateApplication;

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSuccess, onCancel }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ApplicationFormData>({
        defaultValues: {
            status: 'saved',
        },
    });

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const onSubmit = async (data: ApplicationFormData) => {
        setIsSubmitting(true);
        setError(null);
        
        try {
            // Clean up the data: remove empty strings for optional fields
            const cleanedData: CreateApplication = {
                company_name: data.company_name,
                role: data.role,
                status: data.status || 'saved',
            };
            
            // Only include optional fields if they have values
            if (data.company_size?.trim()) {
                cleanedData.company_size = data.company_size.trim();
            }
            if (data.job_url?.trim()) {
                cleanedData.job_url = data.job_url.trim();
            }
            if (data.date_applied) {
                // Convert date string (YYYY-MM-DD) to ISO datetime format
                // Add time component to make it a valid datetime
                cleanedData.date_applied = `${data.date_applied}T00:00:00`;
            }
            if (data.notes?.trim()) {
                cleanedData.notes = data.notes.trim();
            }
            
            const newApplication = await api.createApplication(cleanedData);
            onSuccess(newApplication);
            reset(); // Clear form after success
            if (onCancel) {
                onCancel(); // Close modal/form if provided
            }
        } catch (err) {
            let errorMessage = 'Failed to create application';
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            } else {
                errorMessage = JSON.stringify(err);
            }
            setError(errorMessage);
            console.error('Application creation error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="application-form">
            <h3>Add New Application</h3>

            <div className="form-group">
                <label htmlFor="company_name">Company Name *</label>
                <input
                    id="company_name"
                    type="text"
                    {...register('company_name', {
                        required: 'Company name is required',
                    })}
                    placeholder="e.g., Tech Corp"
                    disabled={isSubmitting}
                />
                {errors.company_name && (
                    <span className="error-message">{errors.company_name.message}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="role">Role/Position *</label>
                <input
                    id="role"
                    type="text"
                    {...register('role', {
                        required: 'Role is required',
                    })}
                    placeholder="e.g., Software Engineer"
                    disabled={isSubmitting}
                />
                {errors.role && (
                    <span className="error-message">{errors.role.message}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                    id="status"
                    {...register('status')}
                    disabled={isSubmitting}
                >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="oa">Online Assessment</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="company_size">Company Size</label>
                <input
                    id="company_size"
                    type="text"
                    {...register('company_size')}
                    placeholder="e.g., 50-100 employees"
                    disabled={isSubmitting}
                />
            </div>

            <div className="form-group">
                <label htmlFor="job_url">Job Posting URL</label>
                <input
                    id="job_url"
                    type="url"
                    {...register('job_url')}
                    placeholder="https://..."
                    disabled={isSubmitting}
                />
                {errors.job_url && (
                    <span className="error-message">{errors.job_url.message}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="date_applied">Date Applied</label>
                <input
                    id="date_applied"
                    type="date"
                    {...register('date_applied')}
                    disabled={isSubmitting}
                />
            </div>

            <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Any additional notes..."
                    rows={4}
                    disabled={isSubmitting}
                />
            </div>

            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}

            <div className="form-actions">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="cancel-button"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating...' : 'Add Application'}
                </button>
            </div>
        </form>
    );
};