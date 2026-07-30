export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          note: string | null;
          priority: 'high' | 'medium' | 'low';
          status: 'todo' | 'in_progress' | 'done';
          due_date: string | null;
          due_time: string | null;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          note?: string | null;
          priority?: 'high' | 'medium' | 'low';
          status?: 'todo' | 'in_progress' | 'done';
          due_date?: string | null;
          due_time?: string | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          note?: string | null;
          priority?: 'high' | 'medium' | 'low';
          status?: 'todo' | 'in_progress' | 'done';
          due_date?: string | null;
          due_time?: string | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          frequency: 'daily' | 'weekly' | 'monthly';
          target_count: number;
          color: string | null;
          icon: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          frequency?: 'daily' | 'weekly' | 'monthly';
          target_count?: number;
          color?: string | null;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          frequency?: 'daily' | 'weekly' | 'monthly';
          target_count?: number;
          color?: string | null;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_at: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          completed_at?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          completed_at?: string;
          note?: string | null;
          created_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string | null;
          target_date: string | null;
          progress: number;
          status: 'active' | 'completed' | 'paused' | 'archived';
          milestones: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category?: string | null;
          target_date?: string | null;
          progress?: number;
          status?: 'active' | 'completed' | 'paused' | 'archived';
          milestones?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          target_date?: string | null;
          progress?: number;
          status?: 'active' | 'completed' | 'paused' | 'archived';
          milestones?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          location: string | null;
          start_at: string;
          end_at: string;
          all_day: boolean;
          color: string | null;
          recurrence: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          location?: string | null;
          start_at: string;
          end_at: string;
          all_day?: boolean;
          color?: string | null;
          recurrence?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          location?: string | null;
          start_at?: string;
          end_at?: string;
          all_day?: boolean;
          color?: string | null;
          recurrence?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      beauty_routines: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'morning' | 'evening' | 'weekly' | 'custom';
          steps: Json;
          products: Json | null;
          notes: string | null;
          completed_today: boolean;
          streak: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: 'morning' | 'evening' | 'weekly' | 'custom';
          steps?: Json;
          products?: Json | null;
          notes?: string | null;
          completed_today?: boolean;
          streak?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: 'morning' | 'evening' | 'weekly' | 'custom';
          steps?: Json;
          products?: Json | null;
          notes?: string | null;
          completed_today?: boolean;
          streak?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      wellness_tracking: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          mood: number | null;
          energy: number | null;
          sleep_hours: number | null;
          sleep_quality: number | null;
          water_glasses: number | null;
          steps: number | null;
          workout_minutes: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          mood?: number | null;
          energy?: number | null;
          sleep_hours?: number | null;
          sleep_quality?: number | null;
          water_glasses?: number | null;
          steps?: number | null;
          workout_minutes?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          mood?: number | null;
          energy?: number | null;
          sleep_hours?: number | null;
          sleep_quality?: number | null;
          water_glasses?: number | null;
          steps?: number | null;
          workout_minutes?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      finance: {
        Row: {
          id: string;
          user_id: string;
          type: 'income' | 'expense' | 'saving' | 'investment';
          category: string;
          amount: number;
          currency: string;
          description: string | null;
          date: string;
          recurring: boolean;
          recurrence_period: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'income' | 'expense' | 'saving' | 'investment';
          category: string;
          amount: number;
          currency?: string;
          description?: string | null;
          date: string;
          recurring?: boolean;
          recurrence_period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          user_id?: string;
          type?: 'income' | 'expense' | 'saving' | 'investment';
          category?: string;
          amount?: number;
          currency?: string;
          description?: string | null;
          date?: string;
          recurring?: boolean;
          recurrence_period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string | null;
          tags: string[] | null;
          pinned: boolean;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content?: string | null;
          tags?: string[] | null;
          pinned?: boolean;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string | null;
          tags?: string[] | null;
          pinned?: boolean;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      task_priority: 'high' | 'medium' | 'low';
      task_status: 'todo' | 'in_progress' | 'done';
      habit_frequency: 'daily' | 'weekly' | 'monthly';
      goal_status: 'active' | 'completed' | 'paused' | 'archived';
      finance_type: 'income' | 'expense' | 'saving' | 'investment';
      beauty_routine_type: 'morning' | 'evening' | 'weekly' | 'custom';
      recurrence_period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    };
  };
}

// Convenience row types
export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitInsert = Database['public']['Tables']['habits']['Insert'];
export type HabitUpdate = Database['public']['Tables']['habits']['Update'];

export type HabitLog = Database['public']['Tables']['habit_logs']['Row'];
export type HabitLogInsert = Database['public']['Tables']['habit_logs']['Insert'];

export type Goal = Database['public']['Tables']['goals']['Row'];
export type GoalInsert = Database['public']['Tables']['goals']['Insert'];
export type GoalUpdate = Database['public']['Tables']['goals']['Update'];

export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];
export type CalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert'];
export type CalendarEventUpdate = Database['public']['Tables']['calendar_events']['Update'];

export type BeautyRoutine = Database['public']['Tables']['beauty_routines']['Row'];
export type BeautyRoutineInsert = Database['public']['Tables']['beauty_routines']['Insert'];
export type BeautyRoutineUpdate = Database['public']['Tables']['beauty_routines']['Update'];

export type WellnessEntry = Database['public']['Tables']['wellness_tracking']['Row'];
export type WellnessEntryInsert = Database['public']['Tables']['wellness_tracking']['Insert'];
export type WellnessEntryUpdate = Database['public']['Tables']['wellness_tracking']['Update'];

export type FinanceEntry = Database['public']['Tables']['finance']['Row'];
export type FinanceEntryInsert = Database['public']['Tables']['finance']['Insert'];
export type FinanceEntryUpdate = Database['public']['Tables']['finance']['Update'];

export type Note = Database['public']['Tables']['notes']['Row'];
export type NoteInsert = Database['public']['Tables']['notes']['Insert'];
export type NoteUpdate = Database['public']['Tables']['notes']['Update'];
