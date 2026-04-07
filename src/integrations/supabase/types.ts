export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          user_id: string
          name: string | null
          card_number: string | null
          cpf: string | null
          birth_date: string | null
          mother_name: string | null
          holder: string | null
          health_plan: string | null
          guide_expiration: string | null
          amount: string | null
          status: 'active' | 'inactive'
          last_session_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          card_number?: string | null
          cpf?: string | null
          birth_date?: string | null
          mother_name?: string | null
          holder?: string | null
          health_plan?: string | null
          guide_expiration?: string | null
          amount?: string | null
          status?: 'active' | 'inactive'
          last_session_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          card_number?: string | null
          cpf?: string | null
          birth_date?: string | null
          mother_name?: string | null
          holder?: string | null
          health_plan?: string | null
          guide_expiration?: string | null
          amount?: string | null
          status?: 'active' | 'inactive'
          last_session_date?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          date: string
          description: string
          category: 'income' | 'expense'
          amount: number
          professional: string | null
          payment_method: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          description: string
          category: 'income' | 'expense'
          amount: number
          professional?: string | null
          payment_method?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          description?: string
          category?: 'income' | 'expense'
          amount?: number
          professional?: string | null
          payment_method?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      goals: {
        Row: {
          id: string
          user_id: string
          month: string
          revenue_goal: number | null
          new_patients_goal: number | null
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          revenue_goal?: number | null
          new_patients_goal?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          revenue_goal?: number | null
          new_patients_goal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          due_date: string | null
          completed: boolean | null
          priority: 'low' | 'medium' | 'high'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          due_date?: string | null
          completed?: boolean | null
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          completed?: boolean | null
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      waitlist: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string | null
          health_plan: string | null
          notes: string | null
          status: 'waiting' | 'scheduled' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone?: string | null
          health_plan?: string | null
          notes?: string | null
          status?: 'waiting' | 'scheduled' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone?: string | null
          health_plan?: string | null
          notes?: string | null
          status?: 'waiting' | 'scheduled' | 'cancelled'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_user_id_fkey"
            columns: ["user_id"]
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
