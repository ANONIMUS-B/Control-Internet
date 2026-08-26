export type * from './auth';
export type * from './navigation';
export type * from './ui';

export interface EducationalInstitution {
    id: number;
    modular_code: string;
    name: string;
    district: string;
    populated_center?: string;
    current_provider_id?: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}