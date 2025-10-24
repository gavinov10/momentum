const API_BASE_URL = 'http://127.0.0.1:8000';

export interface Application {
    id: number;
    user_id: number;
    company_name: string;
    company_size?: string;
    role: string;
    date_applied?: string;
    status?: "SAVED" | "APPLIED" | "OA" | "INTERVIEW" | "OFFER" | "REJECTED" | "WITHDRAWN";
    job_url?: string;
    notes?: string;
    last_activity?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateApplication {
    user_id: number;
    company_name: string;
    role: string;
    company_size?: string;
    date_applied?: string;
    job_url?: string;
    notes?: string;
    status?: "SAVED" | "APPLIED" | "OA" | "INTERVIEW" | "OFFER" | "REJECTED" | "WITHDRAWN";
}

export const api = {
    // get all applications
    getApplications: async (): Promise<Application[]> => {
        const response = await fetch(`${API_BASE_URL}/applications/`);
        return response.json();
    },

    //Create New Application
    createApplication: async (application: CreateApplication): Promise<Application> => {
        const response = await fetch(`${API_BASE_URL}/applications/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(application),
        });
        return response.json();
    },
};