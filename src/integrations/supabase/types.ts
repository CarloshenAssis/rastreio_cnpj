export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          id: string
          user_id: string
          company_id: string
          event_type: string
          description: string
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          event_type: string
          description: string
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          event_type?: string
          description?: string
          created_at?: string
          read_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      cnpj_history: {
        Row: {
          changed_at: string
          cnpj_id: string
          field_changed: string
          id: string
          new_value: string | null
          old_value: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string
          cnpj_id: string
          field_changed: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string
          cnpj_id?: string
          field_changed?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cnpj_history_cnpj_id_fkey"
            columns: ["cnpj_id"]
            isOneToOne: false
            referencedRelation: "cnpjs"
            referencedColumns: ["id"]
          },
        ]
      }
      cnpjs: {
        Row: {
          cnpj: string
          created_at: string
          data_inicio_regime: string | null
          id: string
          last_checked_at: string | null
          municipio: string | null
          nome_fantasia: string | null
          porte: string | null
          razao_social: string | null
          regime_tributario: string | null
          simples_nacional: boolean | null
          status_cadastral: string | null
          uf: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cnpj: string
          created_at?: string
          data_inicio_regime?: string | null
          id?: string
          last_checked_at?: string | null
          municipio?: string | null
          nome_fantasia?: string | null
          porte?: string | null
          razao_social?: string | null
          regime_tributario?: string | null
          simples_nacional?: boolean | null
          status_cadastral?: string | null
          uf?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cnpj?: string
          created_at?: string
          data_inicio_regime?: string | null
          id?: string
          last_checked_at?: string | null
          municipio?: string | null
          nome_fantasia?: string | null
          porte?: string | null
          razao_social?: string | null
          regime_tributario?: string | null
          simples_nacional?: boolean | null
          status_cadastral?: string | null
          uf?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      company_changes: {
        Row: {
          id: string
          company_id: string
          user_id: string
          field_name: string
          old_value: string | null
          new_value: string | null
          changed_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          field_name: string
          old_value?: string | null
          new_value?: string | null
          changed_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          field_name?: string
          old_value?: string | null
          new_value?: string | null
          changed_at?: string
        }
        Relationships: []
      }
      company_tags: {
        Row: {
          company_id: string
          tag_id: string
        }
        Insert: {
          company_id: string
          tag_id: string
        }
        Update: {
          company_id?: string
          tag_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          company_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          created_at?: string
        }
        Relationships: []
      }
      monitor_settings: {
        Row: {
          id: string
          company_id: string
          user_id: string
          frequency: string
          last_check: string | null
          next_check: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          frequency?: string
          last_check?: string | null
          next_check?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          frequency?: string
          last_check?: string | null
          next_check?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          email_notifications: boolean
          monitoring_frequency: string
          notification_email: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          monitoring_frequency?: string
          notification_email?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          monitoring_frequency?: string
          notification_email?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          id: string
          name: string
          max_queries: number
          max_monitored: number
          price_cents: number
          features: Json
        }
        Insert: {
          id?: string
          name: string
          max_queries: number
          max_monitored: number
          price_cents?: number
          features?: Json
        }
        Update: {
          id?: string
          name?: string
          max_queries?: number
          max_monitored?: number
          price_cents?: number
          features?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          quantity?: number
          created_at?: string
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: string
          current_period_start?: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
