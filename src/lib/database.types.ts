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
          telegram_id: string
          username: string
          wilaya: string
          score: number
          weekly_study_time: number
          total_study_time: number
          created_at: string
        }
        Insert: {
          id?: string
          telegram_id: string
          username: string
          wilaya: string
          score?: number
          weekly_study_time?: number
          total_study_time?: number
          created_at?: string
        }
        Update: {
          id?: string
          telegram_id?: string
          username?: string
          wilaya?: string
          score?: number
          weekly_study_time?: number
          total_study_time?: number
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
      subject_progress: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          specialization: string
          year: number
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          specialization: string
          year: number
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          specialization?: string
          year?: number
          completed?: boolean
          created_at?: string
        }
      }
    }
  }
}