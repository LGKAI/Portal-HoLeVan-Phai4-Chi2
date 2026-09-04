export interface User {
  id: number;
  phone: string;
  full_name: string;
  role: 'admin' | 'member' | 'guest';
  avatar_url?: string;
  member_id?: number;
}

export interface Member {
  id: number;
  full_name: string;
  birth_name?: string;
  generation_in_branch: number; // 1-8
  gender: 'male' | 'female' | 'unknown';
  birth_date?: string;
  death_date?: string;
  is_deceased: boolean;
  occupation?: string;
  avatar_url?: string;
  bio?: string;
  burial_place?: string;
  father_id?: number;
  mother_id?: number;
  spouse_id?: number;
  spouse_type?: string;
  spouses?: Member[];
  children?: Member[];
  hometown?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnail_url?: string;
  category: 'news' | 'event' | 'announcement';
  author_id: number;
  published_at: string;
  view_count: number;
  is_published?: boolean;
}

export interface Document {
  id: number;
  title: string;
  description?: string;
  file_url?: string;
  thumbnail_url?: string;
  doc_type: 'text' | 'image' | 'video' | 'pdf';
  created_at: string;
}

export interface Donation {
  id: number;
  donor_name: string;
  amount: number;
  message?: string;
  donated_at: string;
  is_verified: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
