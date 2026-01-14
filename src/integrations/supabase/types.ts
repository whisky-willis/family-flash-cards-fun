export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      card_collections: {
        Row: {
          cards: Json
          created_at: string
          deck_design: Json | null
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cards?: Json
          created_at?: string
          deck_design?: Json | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cards?: Json
          created_at?: string
          deck_design?: Json | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          back_image_url: string | null
          created_at: string
          date_of_birth: string | null
          favorite_color: string | null
          front_image_url: string | null
          fun_fact: string | null
          guest_session_id: string | null
          hobbies: string | null
          id: string
          image_position: Json | null
          name: string
          order_id: string | null
          photo: string | null
          print_ready: boolean | null
          relationship: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          back_image_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          favorite_color?: string | null
          front_image_url?: string | null
          fun_fact?: string | null
          guest_session_id?: string | null
          hobbies?: string | null
          id?: string
          image_position?: Json | null
          name: string
          order_id?: string | null
          photo?: string | null
          print_ready?: boolean | null
          relationship?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          back_image_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          favorite_color?: string | null
          front_image_url?: string | null
          fun_fact?: string | null
          guest_session_id?: string | null
          hobbies?: string | null
          id?: string
          image_position?: Json | null
          name?: string
          order_id?: string | null
          photo?: string | null
          print_ready?: boolean | null
          relationship?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          card_count: number | null
          cards_data: Json
          completed_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          fulfillment_status: string | null
          id: string
          order_details: Json
          payment_status: string | null
          processing_status: string | null
          shipping_address: Json | null
          special_instructions: string | null
          status: string | null
          stripe_session_id: string | null
          total_amount: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          card_count?: number | null
          cards_data: Json
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          fulfillment_status?: string | null
          id?: string
          order_details: Json
          payment_status?: string | null
          processing_status?: string | null
          shipping_address?: Json | null
          special_instructions?: string | null
          status?: string | null
          stripe_session_id?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          card_count?: number | null
          cards_data?: Json
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          fulfillment_status?: string | null
          id?: string
          order_details?: Json
          payment_status?: string | null
          processing_status?: string | null
          shipping_address?: Json | null
          special_instructions?: string | null
          status?: string | null
          stripe_session_id?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_guest_sessions: { Args: never; Returns: undefined }
      get_guest_session_id: { Args: never; Returns: string }
      get_request_header: { Args: { _name: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_security_event: {
        Args: { details?: Json; event_type: string; user_id_param?: string }
        Returns: undefined
      }
      migrate_guest_cards_to_user: {
        Args: { guest_session_id_param: string; user_id_param: string }
        Returns: number
      }
      update_order_status: {
        Args: {
          new_fulfillment_status?: string
          new_payment_status?: string
          order_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
