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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contracts: {
        Row: {
          ativo: boolean
          centro_custo: string
          contrato: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          centro_custo: string
          contrato: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          centro_custo?: string
          contrato?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipment_terms: {
        Row: {
          acessorios: string | null
          centro_custo: string
          contrato: string
          cpf: string | null
          created_at: string
          created_by: string | null
          data_entrega: string
          data_manutencao: string | null
          em_manutencao: boolean
          encarregado: string | null
          estado_entrega: string | null
          funcao: string
          funcionario_nome: string
          id: string
          is_draft: boolean
          marca: string | null
          matricula: string
          modelo: string | null
          numero_serie: string | null
          numero_termo: string
          observacao_manutencao: string | null
          observacoes: string | null
          patrimonio: string
          status: Database["public"]["Enums"]["term_status"]
          supervisor: string
          tipo_equipamento: string
          updated_at: string
        }
        Insert: {
          acessorios?: string | null
          centro_custo: string
          contrato: string
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          data_entrega?: string
          data_manutencao?: string | null
          em_manutencao?: boolean
          encarregado?: string | null
          estado_entrega?: string | null
          funcao: string
          funcionario_nome: string
          id?: string
          is_draft?: boolean
          marca?: string | null
          matricula: string
          modelo?: string | null
          numero_serie?: string | null
          numero_termo: string
          observacao_manutencao?: string | null
          observacoes?: string | null
          patrimonio: string
          status?: Database["public"]["Enums"]["term_status"]
          supervisor: string
          tipo_equipamento: string
          updated_at?: string
        }
        Update: {
          acessorios?: string | null
          centro_custo?: string
          contrato?: string
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          data_entrega?: string
          data_manutencao?: string | null
          em_manutencao?: boolean
          encarregado?: string | null
          estado_entrega?: string | null
          funcao?: string
          funcionario_nome?: string
          id?: string
          is_draft?: boolean
          marca?: string | null
          matricula?: string
          modelo?: string | null
          numero_serie?: string | null
          numero_termo?: string
          observacao_manutencao?: string | null
          observacoes?: string | null
          patrimonio?: string
          status?: Database["public"]["Enums"]["term_status"]
          supervisor?: string
          tipo_equipamento?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipment_types: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          marca: string
          modelo: string
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          marca: string
          modelo: string
          tipo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          marca?: string
          modelo?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_functions: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      term_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_type: string
          id: string
          term_id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_type: string
          id?: string
          term_id: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_type?: string
          id?: string
          term_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "term_events_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "equipment_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      term_returns: {
        Row: {
          condicao: Database["public"]["Enums"]["return_condition"]
          created_at: string
          created_by: string | null
          data_devolucao: string
          id: string
          observacoes: string | null
          responsavel_recebimento: string
          term_id: string
        }
        Insert: {
          condicao: Database["public"]["Enums"]["return_condition"]
          created_at?: string
          created_by?: string | null
          data_devolucao: string
          id?: string
          observacoes?: string | null
          responsavel_recebimento: string
          term_id: string
        }
        Update: {
          condicao?: Database["public"]["Enums"]["return_condition"]
          created_at?: string
          created_by?: string | null
          data_devolucao?: string
          id?: string
          observacoes?: string | null
          responsavel_recebimento?: string
          term_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "term_returns_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: true
            referencedRelation: "equipment_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_contracts: {
        Row: {
          centro_custo: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          centro_custo?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          centro_custo?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_contracts_centro_custo_fkey"
            columns: ["centro_custo"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["centro_custo"]
          },
          {
            foreignKeyName: "user_contracts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_app_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "admin" | "supervisor" | "encarregado" | "superadmin"
      return_condition: "EM_PERFEITO_ESTADO" | "COM_DEFEITO" | "FALTANDO_PECAS"
      term_status: "ENTREGUE" | "DEVOLVIDO"
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
      app_role: ["admin", "supervisor", "encarregado", "superadmin"],
      return_condition: ["EM_PERFEITO_ESTADO", "COM_DEFEITO", "FALTANDO_PECAS"],
      term_status: ["ENTREGUE", "DEVOLVIDO"],
    },
  },
} as const
