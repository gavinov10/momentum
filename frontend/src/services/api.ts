const API_BASE_URL = 'http://127.0.0.1:8000';

// ===== AUTH INTERFACES =====
export interface User {
    id: number;
    email: string;
    name: string;
    is_active: boolean;
    is_superuser: boolean;
    is_verified: boolean;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

// ===== APPLICATION INTERFACES =====
export interface Application {
    id: number;
    user_id: number;
    company_name: string;
    company_size?: string;
    role: string;
    date_applied?: string;
    status?: "saved" | "applied" | "oa" | "interview" | "offer" | "rejected" | "withdrawn";
    job_url?: string;
    notes?: string;
    last_activity?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateApplication {
    company_name: string;
    role: string;
    company_size?: string;
    date_applied?: string;
    job_url?: string;
    notes?: string;
    status?: "saved" | "applied" | "oa" | "interview" | "offer" | "rejected" | "withdrawn";
}

// ===== TOKEN HELPERS =====
const getToken = (): string | null => {
    return localStorage.getItem('access_token');
};

const getAuthHeaders = (): HeadersInit => {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};

// ===== AUTH API FUNCTIONS =====
export const authApi = {
    // Register a new user
    register: async (data: RegisterRequest): Promise<User> => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Registration failed');
        }
        
        return response.json();
    },

    // Login and get token
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const formData = new URLSearchParams();
        formData.append('username', email);  // fastapi-users expects 'username' field
        formData.append('password', password);
        
        const response = await fetch(`${API_BASE_URL}/auth/jwt/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }
        
        return response.json();
    },

    // Get current user (requires token)
    getCurrentUser: async (): Promise<User> => {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid, clear it
                localStorage.removeItem('access_token');
                throw new Error('Session expired. Please login again.');
            }
            const error = await response.json();
            throw new Error(error.detail || 'Failed to get user');
        }
        
        return response.json();
    },

    // Logout (just clears token on frontend)
    logout: (): void => {
        localStorage.removeItem('access_token');
    },
};

// ===== APPLICATION API FUNCTIONS =====
export const api = {
    // Get all applications (requires token)
    getApplications: async (): Promise<Application[]> => {
        const response = await fetch(`${API_BASE_URL}/applications/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('access_token');
                throw new Error('Session expired. Please login again.');
            }
            const error = await response.json();
            throw new Error(error.detail || 'Failed to load applications');
        }
        
        return response.json();
    },

    // Create new application (requires token)
    createApplication: async (application: CreateApplication): Promise<Application> => {
        const response = await fetch(`${API_BASE_URL}/applications/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(application),
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('access_token');
                throw new Error('Session expired. Please login again.');
            }
            
            // Handle FastAPI validation errors
            const errorData = await response.json();
            let errorMessage = 'Failed to create application';
            
            if (errorData.detail) {
                if (Array.isArray(errorData.detail)) {
                    // Validation errors come as an array
                    errorMessage = errorData.detail
                        .map((err: any) => `${err.loc?.join('.')}: ${err.msg}`)
                        .join(', ');
                } else if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else {
                    errorMessage = JSON.stringify(errorData.detail);
                }
            }
            
            throw new Error(errorMessage);
        }
        
        return response.json();
    },
};