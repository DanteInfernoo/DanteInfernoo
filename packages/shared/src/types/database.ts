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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          owner_id?: string | null;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          owner_id?: string | null;
          custom_fields?: Json;
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
    };
    Enums: {
      workspace_role: WorkspaceRole;
      custom_field_type: CustomFieldType;
      deal_status: DealStatus;
      recurrence_interval: RecurrenceInterval;
      email_sync_status: EmailSyncStatus;
      email_direction: EmailDirection;
    };
  };
}
