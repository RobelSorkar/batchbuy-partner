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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      batch_participations: {
        Row: {
          batch_id: string
          id: string
          inventory_mode: string
          joined_at: string
          total_invested: number
          units_owned: number
          units_sold: number
          user_id: string
        }
        Insert: {
          batch_id: string
          id?: string
          inventory_mode?: string
          joined_at?: string
          total_invested: number
          units_owned: number
          units_sold?: number
          user_id: string
        }
        Update: {
          batch_id?: string
          id?: string
          inventory_mode?: string
          joined_at?: string
          total_invested?: number
          units_owned?: number
          units_sold?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_participations_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          batch_name: string
          category: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          funded_units: number
          id: string
          image: string | null
          logistics_cost_per_unit: number
          manufacturer: string | null
          min_participation: number
          partners_joined: number
          product_name: string
          production_cost_per_unit: number
          production_time_days: number | null
          remaining_units: number
          retail_price: number
          status: string
          total_quantity: number
          updated_at: string
          warehouse: string | null
          wholesale_price: number
        }
        Insert: {
          batch_name: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          funded_units?: number
          id?: string
          image?: string | null
          logistics_cost_per_unit?: number
          manufacturer?: string | null
          min_participation?: number
          partners_joined?: number
          product_name: string
          production_cost_per_unit: number
          production_time_days?: number | null
          remaining_units: number
          retail_price: number
          status?: string
          total_quantity: number
          updated_at?: string
          warehouse?: string | null
          wholesale_price: number
        }
        Update: {
          batch_name?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          funded_units?: number
          id?: string
          image?: string | null
          logistics_cost_per_unit?: number
          manufacturer?: string | null
          min_participation?: number
          partners_joined?: number
          product_name?: string
          production_cost_per_unit?: number
          production_time_days?: number | null
          remaining_units?: number
          retail_price?: number
          status?: string
          total_quantity?: number
          updated_at?: string
          warehouse?: string | null
          wholesale_price?: number
        }
        Relationships: []
      }
      distribution_channels: {
        Row: {
          allocated_stock: number
          channel: string
          created_at: string
          enabled: boolean
          id: string
          inventory_id: string
          max_price: number
          min_price: number
          price: number
          sold_units: number
          updated_at: string
        }
        Insert: {
          allocated_stock?: number
          channel: string
          created_at?: string
          enabled?: boolean
          id?: string
          inventory_id: string
          max_price?: number
          min_price?: number
          price?: number
          sold_units?: number
          updated_at?: string
        }
        Update: {
          allocated_stock?: number
          channel?: string
          created_at?: string
          enabled?: boolean
          id?: string
          inventory_id?: string
          max_price?: number
          min_price?: number
          price?: number
          sold_units?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "distribution_channels_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          allocated_stock: number
          batch_id: string | null
          created_at: string
          id: string
          product_name: string
          shelf_location: string | null
          sku: string | null
          sold_units: number
          status: string
          total_stock: number
          updated_at: string
          warehouse_location: string | null
        }
        Insert: {
          allocated_stock?: number
          batch_id?: string | null
          created_at?: string
          id?: string
          product_name: string
          shelf_location?: string | null
          sku?: string | null
          sold_units?: number
          status?: string
          total_stock?: number
          updated_at?: string
          warehouse_location?: string | null
        }
        Update: {
          allocated_stock?: number
          batch_id?: string | null
          created_at?: string
          id?: string
          product_name?: string
          shelf_location?: string | null
          sku?: string | null
          sold_units?: number
          status?: string
          total_stock?: number
          updated_at?: string
          warehouse_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: true
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          reference_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          batch_id: string | null
          channel: string
          commission: number | null
          created_at: string
          customer_address: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          order_number: string
          seller_id: string | null
          status: string
          total_amount: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          batch_id?: string | null
          channel: string
          commission?: number | null
          created_at?: string
          customer_address?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number: string
          seller_id?: string | null
          status?: string
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          batch_id?: string | null
          channel?: string
          commission?: number | null
          created_at?: string
          customer_address?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          seller_id?: string | null
          status?: string
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string
          type?: string
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
      wallets: {
        Row: {
          balance: number
          created_at: string
          daily_withdrawal_limit: number | null
          daily_withdrawn: number | null
          id: string
          last_withdrawal_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          daily_withdrawal_limit?: number | null
          daily_withdrawn?: number | null
          id?: string
          last_withdrawal_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          daily_withdrawal_limit?: number | null
          daily_withdrawn?: number | null
          id?: string
          last_withdrawal_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_sync_batch_stats: { Args: never; Returns: undefined }
      calculate_ledger_balance: { Args: { p_user_id: string }; Returns: number }
      create_order_with_stock_check: {
        Args: {
          p_batch_id?: string
          p_channel: string
          p_commission: number
          p_customer_address: string
          p_customer_name: string
          p_customer_phone: string
          p_items?: Json
          p_total_amount: number
        }
        Returns: Json
      }
      generate_order_number: { Args: { p_channel: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      join_batch:
        | {
            Args: {
              p_batch_id: string
              p_total_invested: number
              p_units: number
            }
            Returns: Json
          }
        | {
            Args: {
              p_batch_id: string
              p_selling_preference?: string
              p_total_invested: number
              p_units: number
            }
            Returns: Json
          }
      log_audit_event: {
        Args: {
          p_action: string
          p_new_values?: Json
          p_old_values?: Json
          p_record_id: string
          p_table_name: string
        }
        Returns: undefined
      }
      process_deposit: {
        Args: { p_account: string; p_amount: number; p_method: string }
        Returns: Json
      }
      process_withdrawal: {
        Args: { p_account: string; p_amount: number; p_method: string }
        Returns: Json
      }
      reconcile_wallet_balances: { Args: never; Returns: Json }
      refund_withdrawal: { Args: { p_transaction_id: string }; Returns: Json }
    }
    Enums: {
      app_role:
        | "admin"
        | "partner"
        | "dropshipper"
        | "distributor"
        | "warehouse"
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
      app_role: ["admin", "partner", "dropshipper", "distributor", "warehouse"],
    },
  },
} as const
