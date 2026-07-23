// Hand-written to mirror supabase/migrations exactly, in the same shape
// `supabase gen types typescript` would produce. Regenerate with that command
// once a live Supabase instance (local or hosted) is reachable; keep this file
// in sync with new migrations until then.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WorkspaceRole = "owner" | "admin" | "member";

export type CustomFieldType =
  | "text"
  | "number"
  | "date"
  | "dropdown"
  | "multiselect"
  | "currency"
  | "checkbox";

export type DealStatus = "open" | "won" | "lost";

export type RecurrenceInterval = "none" | "daily" | "weekly" | "monthly";

export type EmailSyncStatus = "not_connected" | "connected" | "error";

export type EmailDirection = "outbound" | "inbound";

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "in_production"
  | "delivered"
  | "invoiced"
  | "paid";

export type StandingOrderInterval = "weekly" | "biweekly" | "monthly";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          enabled_modules: Json;
          settings: Json;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          enabled_modules?: Json;
          settings?: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          enabled_modules?: Json;
          settings?: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspaces_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      workspace_members: {
        Row: {
          workspace_id: string;
          user_id: string;
          role: WorkspaceRole;
          created_at: string;
        };
        Insert: {
          workspace_id: string;
          user_id: string;
          role?: WorkspaceRole;
          created_at?: string;
        };
        Update: {
          workspace_id?: string;
          user_id?: string;
          role?: WorkspaceRole;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_members_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      custom_field_definitions: {
        Row: {
          id: string;
          workspace_id: string;
          entity_type: string;
          key: string;
          label: string;
          field_type: CustomFieldType;
          options: Json;
          is_required: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          entity_type: string;
          key: string;
          label: string;
          field_type: CustomFieldType;
          options?: Json;
          is_required?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          entity_type?: string;
          key?: string;
          label?: string;
          field_type?: CustomFieldType;
          options?: Json;
          is_required?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "custom_field_definitions_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      labels: {
        Row: {
          id: string;
          workspace_id: string;
          entity_type: string;
          name: string;
          color: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          entity_type: string;
          name: string;
          color?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          entity_type?: string;
          name?: string;
          color?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "labels_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          owner_id: string | null;
          custom_fields: Json;
          territory_id: string | null;
          delivery_day: number | null;
          account_type: string | null;
          parent_organization_id: string | null;
          payment_terms: string | null;
          credit_limit: number | null;
          outstanding_balance: number;
          is_tax_exempt: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          owner_id?: string | null;
          custom_fields?: Json;
          territory_id?: string | null;
          delivery_day?: number | null;
          account_type?: string | null;
          parent_organization_id?: string | null;
          payment_terms?: string | null;
          credit_limit?: number | null;
          outstanding_balance?: number;
          is_tax_exempt?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          owner_id?: string | null;
          custom_fields?: Json;
          territory_id?: string | null;
          delivery_day?: number | null;
          account_type?: string | null;
          parent_organization_id?: string | null;
          payment_terms?: string | null;
          credit_limit?: number | null;
          outstanding_balance?: number;
          is_tax_exempt?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organizations_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organizations_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organizations_territory_id_fkey";
            columns: ["territory_id"];
            referencedRelation: "territories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organizations_parent_organization_id_fkey";
            columns: ["parent_organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      persons: {
        Row: {
          id: string;
          workspace_id: string;
          organization_id: string | null;
          name: string;
          email: string | null;
          phone: string | null;
          owner_id: string | null;
          custom_fields: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          organization_id?: string | null;
          name: string;
          email?: string | null;
          phone?: string | null;
          owner_id?: string | null;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          organization_id?: string | null;
          name?: string;
          email?: string | null;
          phone?: string | null;
          owner_id?: string | null;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "persons_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "persons_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "persons_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      pipelines: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          is_default: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          is_default?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          is_default?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pipelines_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      stages: {
        Row: {
          id: string;
          pipeline_id: string;
          name: string;
          probability: number;
          rotten_days: number | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          pipeline_id: string;
          name: string;
          probability?: number;
          rotten_days?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          pipeline_id?: string;
          name?: string;
          probability?: number;
          rotten_days?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stages_pipeline_id_fkey";
            columns: ["pipeline_id"];
            referencedRelation: "pipelines";
            referencedColumns: ["id"];
          },
        ];
      };
      deals: {
        Row: {
          id: string;
          workspace_id: string;
          pipeline_id: string;
          stage_id: string;
          title: string;
          value: number;
          currency: string;
          organization_id: string | null;
          person_id: string | null;
          owner_id: string | null;
          status: DealStatus;
          lost_reason: string | null;
          expected_close_date: string | null;
          stage_entered_at: string;
          closed_at: string | null;
          source: string | null;
          custom_fields: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          pipeline_id: string;
          stage_id: string;
          title: string;
          value?: number;
          currency?: string;
          organization_id?: string | null;
          person_id?: string | null;
          owner_id?: string | null;
          status?: DealStatus;
          lost_reason?: string | null;
          expected_close_date?: string | null;
          stage_entered_at?: string;
          closed_at?: string | null;
          source?: string | null;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          pipeline_id?: string;
          stage_id?: string;
          title?: string;
          value?: number;
          currency?: string;
          organization_id?: string | null;
          person_id?: string | null;
          owner_id?: string | null;
          status?: DealStatus;
          lost_reason?: string | null;
          expected_close_date?: string | null;
          stage_entered_at?: string;
          closed_at?: string | null;
          source?: string | null;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deals_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey";
            columns: ["pipeline_id"];
            referencedRelation: "pipelines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_stage_id_fkey";
            columns: ["stage_id"];
            referencedRelation: "stages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_person_id_fkey";
            columns: ["person_id"];
            referencedRelation: "persons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_types: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          icon: string;
          color: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          icon?: string;
          color?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          icon?: string;
          color?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_types_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      activities: {
        Row: {
          id: string;
          workspace_id: string;
          type_id: string;
          subject: string;
          notes: string | null;
          due_date: string;
          due_time: string | null;
          duration_minutes: number | null;
          is_done: boolean;
          done_at: string | null;
          owner_id: string | null;
          deal_id: string | null;
          person_id: string | null;
          organization_id: string | null;
          recurrence_interval: RecurrenceInterval;
          recurrence_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          type_id: string;
          subject: string;
          notes?: string | null;
          due_date: string;
          due_time?: string | null;
          duration_minutes?: number | null;
          is_done?: boolean;
          done_at?: string | null;
          owner_id?: string | null;
          deal_id?: string | null;
          person_id?: string | null;
          organization_id?: string | null;
          recurrence_interval?: RecurrenceInterval;
          recurrence_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          type_id?: string;
          subject?: string;
          notes?: string | null;
          due_date?: string;
          due_time?: string | null;
          duration_minutes?: number | null;
          is_done?: boolean;
          done_at?: string | null;
          owner_id?: string | null;
          deal_id?: string | null;
          person_id?: string | null;
          organization_id?: string | null;
          recurrence_interval?: RecurrenceInterval;
          recurrence_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_type_id_fkey";
            columns: ["type_id"];
            referencedRelation: "activity_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_deal_id_fkey";
            columns: ["deal_id"];
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_person_id_fkey";
            columns: ["person_id"];
            referencedRelation: "persons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notes: {
        Row: {
          id: string;
          workspace_id: string;
          entity_type: string;
          entity_id: string;
          body: string;
          mentioned_user_ids: string[];
          author_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          entity_type: string;
          entity_id: string;
          body: string;
          mentioned_user_ids?: string[];
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          entity_type?: string;
          entity_id?: string;
          body?: string;
          mentioned_user_ids?: string[];
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notes_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      files: {
        Row: {
          id: string;
          workspace_id: string;
          entity_type: string;
          entity_id: string;
          filename: string;
          storage_path: string;
          content_type: string | null;
          size_bytes: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          entity_type: string;
          entity_id: string;
          filename: string;
          storage_path: string;
          content_type?: string | null;
          size_bytes?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          entity_type?: string;
          entity_id?: string;
          filename?: string;
          storage_path?: string;
          content_type?: string | null;
          size_bytes?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "files_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "files_uploaded_by_fkey";
            columns: ["uploaded_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      email_templates: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          subject: string;
          body: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          subject: string;
          body: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          subject?: string;
          body?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "email_templates_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      email_accounts: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          provider: string;
          email_address: string;
          access_token: string | null;
          refresh_token: string | null;
          token_expires_at: string | null;
          sync_status: EmailSyncStatus;
          last_synced_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          provider: string;
          email_address: string;
          access_token?: string | null;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          sync_status?: EmailSyncStatus;
          last_synced_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          provider?: string;
          email_address?: string;
          access_token?: string | null;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          sync_status?: EmailSyncStatus;
          last_synced_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "email_accounts_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "email_accounts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      emails: {
        Row: {
          id: string;
          workspace_id: string;
          direction: EmailDirection;
          subject: string | null;
          body: string;
          from_address: string | null;
          to_addresses: string[];
          sent_at: string;
          deal_id: string | null;
          person_id: string | null;
          organization_id: string | null;
          logged_by: string | null;
          email_account_id: string | null;
          external_message_id: string | null;
          thread_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          direction?: EmailDirection;
          subject?: string | null;
          body: string;
          from_address?: string | null;
          to_addresses?: string[];
          sent_at?: string;
          deal_id?: string | null;
          person_id?: string | null;
          organization_id?: string | null;
          logged_by?: string | null;
          email_account_id?: string | null;
          external_message_id?: string | null;
          thread_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          direction?: EmailDirection;
          subject?: string | null;
          body?: string;
          from_address?: string | null;
          to_addresses?: string[];
          sent_at?: string;
          deal_id?: string | null;
          person_id?: string | null;
          organization_id?: string | null;
          logged_by?: string | null;
          email_account_id?: string | null;
          external_message_id?: string | null;
          thread_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "emails_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "emails_deal_id_fkey";
            columns: ["deal_id"];
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "emails_person_id_fkey";
            columns: ["person_id"];
            referencedRelation: "persons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "emails_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "emails_logged_by_fkey";
            columns: ["logged_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "emails_email_account_id_fkey";
            columns: ["email_account_id"];
            referencedRelation: "email_accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      automation_rules: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          entity_type: string;
          trigger_type: string;
          trigger_config: Json;
          conditions: Json;
          actions: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          entity_type?: string;
          trigger_type: string;
          trigger_config?: Json;
          conditions?: Json;
          actions?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          entity_type?: string;
          trigger_type?: string;
          trigger_config?: Json;
          conditions?: Json;
          actions?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "automation_rules_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      automation_logs: {
        Row: {
          id: string;
          rule_id: string;
          entity_id: string;
          result: string;
          detail: string | null;
          ran_at: string;
        };
        Insert: {
          id?: string;
          rule_id: string;
          entity_id: string;
          result: string;
          detail?: string | null;
          ran_at?: string;
        };
        Update: {
          id?: string;
          rule_id?: string;
          entity_id?: string;
          result?: string;
          detail?: string | null;
          ran_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "automation_logs_rule_id_fkey";
            columns: ["rule_id"];
            referencedRelation: "automation_rules";
            referencedColumns: ["id"];
          },
        ];
      };
      deal_stage_history: {
        Row: {
          id: string;
          deal_id: string;
          stage_id: string;
          entered_at: string;
          exited_at: string | null;
        };
        Insert: {
          id?: string;
          deal_id: string;
          stage_id: string;
          entered_at?: string;
          exited_at?: string | null;
        };
        Update: {
          id?: string;
          deal_id?: string;
          stage_id?: string;
          entered_at?: string;
          exited_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "deal_stage_history_deal_id_fkey";
            columns: ["deal_id"];
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_stage_history_stage_id_fkey";
            columns: ["stage_id"];
            referencedRelation: "stages";
            referencedColumns: ["id"];
          },
        ];
      };
      goals: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string | null;
          metric_type: string;
          period: string;
          target_value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id?: string | null;
          metric_type: string;
          period: string;
          target_value: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string | null;
          metric_type?: string;
          period?: string;
          target_value?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goals_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goals_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_filters: {
        Row: {
          id: string;
          workspace_id: string;
          owner_id: string;
          entity_type: string;
          name: string;
          filter_params: Json;
          is_shared: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          owner_id: string;
          entity_type: string;
          name: string;
          filter_params?: Json;
          is_shared?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          owner_id?: string;
          entity_type?: string;
          name?: string;
          filter_params?: Json;
          is_shared?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_filters_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_filters_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          workspace_id: string;
          sku: string;
          name: string;
          description: string | null;
          uom: string;
          case_pack: number | null;
          case_weight: number | null;
          cost: number | null;
          base_price: number;
          is_active: boolean;
          custom_fields: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          sku: string;
          name: string;
          description?: string | null;
          uom?: string;
          case_pack?: number | null;
          case_weight?: number | null;
          cost?: number | null;
          base_price?: number;
          is_active?: boolean;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          sku?: string;
          name?: string;
          description?: string | null;
          uom?: string;
          case_pack?: number | null;
          case_weight?: number | null;
          cost?: number | null;
          base_price?: number;
          is_active?: boolean;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      price_lists: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "price_lists_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      price_list_items: {
        Row: {
          id: string;
          price_list_id: string;
          product_id: string;
          price: number;
          volume_tiers: Json;
        };
        Insert: {
          id?: string;
          price_list_id: string;
          product_id: string;
          price: number;
          volume_tiers?: Json;
        };
        Update: {
          id?: string;
          price_list_id?: string;
          product_id?: string;
          price?: number;
          volume_tiers?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "price_list_items_price_list_id_fkey";
            columns: ["price_list_id"];
            referencedRelation: "price_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "price_list_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      account_price_overrides: {
        Row: {
          id: string;
          organization_id: string;
          product_id: string;
          price: number | null;
          discount_pct: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          product_id: string;
          price?: number | null;
          discount_pct?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          product_id?: string;
          price?: number | null;
          discount_pct?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "account_price_overrides_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "account_price_overrides_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      line_items: {
        Row: {
          id: string;
          workspace_id: string;
          entity_type: string;
          entity_id: string;
          product_id: string | null;
          description: string | null;
          quantity: number;
          unit_price: number;
          unit_cost: number | null;
          line_total: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          entity_type: string;
          entity_id: string;
          product_id?: string | null;
          description?: string | null;
          quantity?: number;
          unit_price?: number;
          unit_cost?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          entity_type?: string;
          entity_id?: string;
          product_id?: string | null;
          description?: string | null;
          quantity?: number;
          unit_price?: number;
          unit_cost?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "line_items_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "line_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          workspace_id: string;
          organization_id: string;
          deal_id: string | null;
          po_number: string | null;
          order_date: string;
          requested_delivery_date: string | null;
          status: OrderStatus;
          tax_rate: number;
          subtotal: number;
          tax: number;
          total: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          organization_id: string;
          deal_id?: string | null;
          po_number?: string | null;
          order_date?: string;
          requested_delivery_date?: string | null;
          status?: OrderStatus;
          tax_rate?: number;
          subtotal?: number;
          tax?: number;
          total?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          organization_id?: string;
          deal_id?: string | null;
          po_number?: string | null;
          order_date?: string;
          requested_delivery_date?: string | null;
          status?: OrderStatus;
          tax_rate?: number;
          subtotal?: number;
          tax?: number;
          total?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_deal_id_fkey";
            columns: ["deal_id"];
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
        ];
      };
      standing_orders: {
        Row: {
          id: string;
          workspace_id: string;
          organization_id: string;
          name: string;
          interval: StandingOrderInterval;
          line_items_template: Json;
          next_generation_date: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          organization_id: string;
          name: string;
          interval?: StandingOrderInterval;
          line_items_template?: Json;
          next_generation_date: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          organization_id?: string;
          name?: string;
          interval?: StandingOrderInterval;
          line_items_template?: Json;
          next_generation_date?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "standing_orders_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "standing_orders_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      samples: {
        Row: {
          id: string;
          workspace_id: string;
          organization_id: string;
          person_id: string | null;
          product_id: string;
          dropped_date: string;
          feedback: string | null;
          follow_up_activity_id: string | null;
          converted_order_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          organization_id: string;
          person_id?: string | null;
          product_id: string;
          dropped_date?: string;
          feedback?: string | null;
          follow_up_activity_id?: string | null;
          converted_order_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          organization_id?: string;
          person_id?: string | null;
          product_id?: string;
          dropped_date?: string;
          feedback?: string | null;
          follow_up_activity_id?: string | null;
          converted_order_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "samples_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "samples_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "samples_person_id_fkey";
            columns: ["person_id"];
            referencedRelation: "persons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "samples_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "samples_follow_up_activity_id_fkey";
            columns: ["follow_up_activity_id"];
            referencedRelation: "activities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "samples_converted_order_id_fkey";
            columns: ["converted_order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      territories: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "territories_workspace_id_fkey";
            columns: ["workspace_id"];
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      distributor_sku_terms: {
        Row: {
          id: string;
          organization_id: string;
          product_id: string;
          margin_pct: number | null;
          listing_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          product_id: string;
          margin_pct?: number | null;
          listing_status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          product_id?: string;
          margin_pct?: number | null;
          listing_status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "distributor_sku_terms_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "distributor_sku_terms_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      entity_labels: {
        Row: {
          label_id: string;
          entity_type: string;
          entity_id: string;
          created_at: string;
        };
        Insert: {
          label_id: string;
          entity_type: string;
          entity_id: string;
          created_at?: string;
        };
        Update: {
          label_id?: string;
          entity_type?: string;
          entity_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "entity_labels_label_id_fkey";
            columns: ["label_id"];
            referencedRelation: "labels";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      merge_organizations: {
        Args: { primary_id: string; duplicate_id: string };
        Returns: undefined;
      };
      merge_persons: {
        Args: { primary_id: string; duplicate_id: string };
        Returns: undefined;
      };
      run_automations: {
        Args: {
          p_workspace_id: string;
          p_entity_type: string;
          p_entity_id: string;
          p_event_type: string;
        };
        Returns: undefined;
      };
      recalculate_order_totals: {
        Args: { p_order_id: string };
        Returns: undefined;
      };
      generate_due_standing_orders: {
        Args: { p_workspace_id: string };
        Returns: number;
      };
    };
    Enums: {
      workspace_role: WorkspaceRole;
      custom_field_type: CustomFieldType;
      deal_status: DealStatus;
      recurrence_interval: RecurrenceInterval;
      email_sync_status: EmailSyncStatus;
      email_direction: EmailDirection;
      order_status: OrderStatus;
      standing_order_interval: StandingOrderInterval;
    };
  };
}
