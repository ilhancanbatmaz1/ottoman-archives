export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    password_hash: string
                    username: string
                    created_at: string
                    last_login: string | null
                    is_admin: boolean
                }
                Insert: {
                    id?: string
                    email: string
                    password_hash?: string
                    username: string
                    created_at?: string
                    last_login?: string | null
                    is_admin?: boolean
                }
                Update: {
                    id?: string
                    email?: string
                    password_hash?: string
                    username?: string
                    created_at?: string
                    last_login?: string | null
                    is_admin?: boolean
                }
                Relationships: []
            }
            user_progress: {
                Row: {
                    id: string
                    user_id: string
                    total_words_learned: number
                    documents_completed: number
                    practice_sessions: number
                    current_streak: number
                    longest_streak: number
                    last_practice_date: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    total_words_learned?: number
                    documents_completed?: number
                    practice_sessions?: number
                    current_streak?: number
                    longest_streak?: number
                    last_practice_date?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    total_words_learned?: number
                    documents_completed?: number
                    practice_sessions?: number
                    current_streak?: number
                    longest_streak?: number
                    last_practice_date?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_progress_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            badges: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    icon: string | null
                    requirement_type: string | null
                    requirement_count: number | null
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    icon?: string | null
                    requirement_type?: string | null
                    requirement_count?: number | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    icon?: string | null
                    requirement_type?: string | null
                    requirement_count?: number | null
                }
                Relationships: []
            }
            user_badges: {
                Row: {
                    user_id: string
                    badge_id: string
                    earned_at: string
                }
                Insert: {
                    user_id: string
                    badge_id: string
                    earned_at?: string
                }
                Update: {
                    user_id?: string
                    badge_id?: string
                    earned_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_badges_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_badges_badge_id_fkey"
                        columns: ["badge_id"]
                        isOneToOne: false
                        referencedRelation: "badges"
                        referencedColumns: ["id"]
                    }
                ]
            }
            documents: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    image_url: string
                    difficulty: 'kolay' | 'orta' | 'zor' | null
                    category: string | null
                    year: number | null
                    transcription: Json | null
                    uploaded_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    image_url: string
                    difficulty?: 'kolay' | 'orta' | 'zor' | null
                    category?: string | null
                    year?: number | null
                    transcription?: Json | null
                    uploaded_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    image_url?: string
                    difficulty?: 'kolay' | 'orta' | 'zor' | null
                    category?: string | null
                    year?: number | null
                    transcription?: Json | null
                    uploaded_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "documents_uploaded_by_fkey"
                        columns: ["uploaded_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_word_progress: {
                Row: {
                    id: string
                    user_id: string
                    word_ottoman: string
                    word_latin: string
                    word_translation: string | null
                    mastery_level: number
                    times_practiced: number
                    last_practiced: string | null
                    marked_difficult: boolean
                }
                Insert: {
                    id?: string
                    user_id: string
                    word_ottoman: string
                    word_latin: string
                    word_translation?: string | null
                    mastery_level?: number
                    times_practiced?: number
                    last_practiced?: string | null
                    marked_difficult?: boolean
                }
                Update: {
                    id?: string
                    user_id?: string
                    word_ottoman?: string
                    word_latin?: string
                    word_translation?: string | null
                    mastery_level?: number
                    times_practiced?: number
                    last_practiced?: string | null
                    marked_difficult?: boolean
                }
                Relationships: [
                    {
                        foreignKeyName: "user_word_progress_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_document_progress: {
                Row: {
                    id: string
                    user_id: string
                    document_id: string
                    completed: boolean
                    last_read_at: string
                    practice_count: number
                }
                Insert: {
                    id?: string
                    user_id: string
                    document_id: string
                    completed?: boolean
                    last_read_at?: string
                    practice_count?: number
                }
                Update: {
                    id?: string
                    user_id?: string
                    document_id?: string
                    completed?: boolean
                    last_read_at?: string
                    practice_count?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "user_document_progress_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_document_progress_document_id_fkey"
                        columns: ["document_id"]
                        isOneToOne: false
                        referencedRelation: "documents"
                        referencedColumns: ["id"]
                    }
                ]
            }
            error_reports: {
                Row: {
                    id: string
                    document_id: string
                    word_ottoman: string
                    word_latin_current: string
                    word_latin_suggested: string
                    description: string | null
                    reported_by: string | null
                    status: 'pending' | 'reviewed' | 'fixed' | 'rejected'
                    admin_notes: string | null
                    created_at: string
                    resolved_at: string | null
                }
                Insert: {
                    id?: string
                    document_id: string
                    word_ottoman: string
                    word_latin_current: string
                    word_latin_suggested: string
                    description?: string | null
                    reported_by?: string | null
                    status?: 'pending' | 'reviewed' | 'fixed' | 'rejected'
                    admin_notes?: string | null
                    created_at?: string
                    resolved_at?: string | null
                }
                Update: {
                    id?: string
                    document_id?: string
                    word_ottoman?: string
                    word_latin_current?: string
                    word_latin_suggested?: string
                    description?: string | null
                    reported_by?: string | null
                    status?: 'pending' | 'reviewed' | 'fixed' | 'rejected'
                    admin_notes?: string | null
                    created_at?: string
                    resolved_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "error_reports_document_id_fkey"
                        columns: ["document_id"]
                        isOneToOne: false
                        referencedRelation: "documents"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "error_reports_reported_by_fkey"
                        columns: ["reported_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
