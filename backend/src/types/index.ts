export interface User {
    id: number;
    phone: string;
    full_name: string;
    role: 'admin' | 'member' | 'guest';
    avatar_url?: string;
    member_id?: number;
    is_active: boolean;
    created_at: Date;
}

export interface Member {
    id: number;
    full_name: string;
    birth_name?: string;
    generation_in_branch: number;
    gender: 'male' | 'female';
    birth_date?: Date;
    death_date?: Date;
    is_deceased: boolean;
    occupation?: string;
    avatar_url?: string;
    bio?: string;
    burial_place?: string;
    father_id?: number;
    mother_id?: number;
    spouse_id?: number;
    spouse_type?: string;
    created_at: Date;
    updated_at: Date;
    created_by?: number;
    children?: Member[];
    spouse?: Member;
}
