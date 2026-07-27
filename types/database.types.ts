/**
 * Tipos generados manualmente a partir del esquema en supabase/migrations.
 *
 * En un entorno real, regenerar con:
 *   npx supabase gen types typescript --project-id <ID> --schema public > types/database.types.ts
 *
 * Mientras el proyecto Supabase no exista, este archivo se mantiene a mano
 * y debe reflejar exactamente las tablas definidas en supabase/migrations/0001_init.sql.
 *
 * Nota: cada tabla incluye `Relationships` (aunque esté vacío) porque las
 * versiones recientes de @supabase/postgrest-js exigen esa forma exacta
 * (GenericTable) para poder tipar `.from()`; sin ella, TypeScript colapsa
 * las operaciones a `never`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "13";
  };
  public: {
    Tables: {
      administrators: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      guests: {
        Row: {
          id: string;
          full_name: string;
          token: string;
          family_group: string | null;
          phone: string | null;
          email: string | null;
          maximum_guests: number;
          children_allowed: boolean;
          plus_one_allowed: boolean;
          table_number: number | null;
          internal_notes: string | null;
          invitation_delivered: boolean;
          invitation_active: boolean;
          response_deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          token: string;
          family_group?: string | null;
          phone?: string | null;
          email?: string | null;
          maximum_guests?: number;
          children_allowed?: boolean;
          plus_one_allowed?: boolean;
          table_number?: number | null;
          internal_notes?: string | null;
          invitation_delivered?: boolean;
          invitation_active?: boolean;
          response_deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          token?: string;
          family_group?: string | null;
          phone?: string | null;
          email?: string | null;
          maximum_guests?: number;
          children_allowed?: boolean;
          plus_one_allowed?: boolean;
          table_number?: number | null;
          internal_notes?: string | null;
          invitation_delivered?: boolean;
          invitation_active?: boolean;
          response_deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rsvps: {
        Row: {
          id: string;
          guest_id: string;
          attendance_status: "confirmed" | "declined";
          attendee_count: number;
          children_count: number;
          dietary_restrictions: string | null;
          allergies: string | null;
          accessibility_requirements: string | null;
          message: string | null;
          privacy_consent: boolean;
          submitted_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_id: string;
          attendance_status: "confirmed" | "declined";
          attendee_count?: number;
          children_count?: number;
          dietary_restrictions?: string | null;
          allergies?: string | null;
          accessibility_requirements?: string | null;
          message?: string | null;
          privacy_consent?: boolean;
          submitted_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guest_id?: string;
          attendance_status?: "confirmed" | "declined";
          attendee_count?: number;
          children_count?: number;
          dietary_restrictions?: string | null;
          allergies?: string | null;
          accessibility_requirements?: string | null;
          message?: string | null;
          privacy_consent?: boolean;
          submitted_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rsvps_guest_id_fkey";
            columns: ["guest_id"];
            isOneToOne: true;
            referencedRelation: "guests";
            referencedColumns: ["id"];
          },
        ];
      };
      companions: {
        Row: {
          id: string;
          rsvp_id: string;
          full_name: string;
          is_child: boolean;
          dietary_restrictions: string | null;
          allergies: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          rsvp_id: string;
          full_name: string;
          is_child?: boolean;
          dietary_restrictions?: string | null;
          allergies?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          rsvp_id?: string;
          full_name?: string;
          is_child?: boolean;
          dietary_restrictions?: string | null;
          allergies?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "companions_rsvp_id_fkey";
            columns: ["rsvp_id"];
            isOneToOne: false;
            referencedRelation: "rsvps";
            referencedColumns: ["id"];
          },
        ];
      };
      rate_limits: {
        Row: {
          id: number;
          identifier: string;
          action: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          identifier: string;
          action: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          identifier?: string;
          action?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          admin_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string | null;
          action?: string;
          entity?: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "administrators";
            referencedColumns: ["id"];
          },
        ];
      };
      site_content: {
        Row: {
          id: number;
          content: Json;
          updated_at: string;
        };
        Insert: {
          id?: number;
          content: Json;
          updated_at?: string;
        };
        Update: {
          id?: number;
          content?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
