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
      activities: {
        Row: {
          activity_type: string
          actor_user_id: string | null
          archived_at: string | null
          body: string | null
          communication_id: string | null
          contact_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          occurred_at: string
          offering_id: string | null
          organization_id: string
          partnership_id: string | null
          summary: string
          visibility: Database["public"]["Enums"]["activity_visibility"]
        }
        Insert: {
          activity_type: string
          actor_user_id?: string | null
          archived_at?: string | null
          body?: string | null
          communication_id?: string | null
          contact_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          offering_id?: string | null
          organization_id: string
          partnership_id?: string | null
          summary: string
          visibility?: Database["public"]["Enums"]["activity_visibility"]
        }
        Update: {
          activity_type?: string
          actor_user_id?: string | null
          archived_at?: string | null
          body?: string | null
          communication_id?: string | null
          contact_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          offering_id?: string | null
          organization_id?: string
          partnership_id?: string | null
          summary?: string
          visibility?: Database["public"]["Enums"]["activity_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "activities_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "organization_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["primary_contact_id"]
          },
          {
            foreignKeyName: "activities_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["offering_id"]
          },
          {
            foreignKeyName: "activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "activities_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["partnership_id"]
          }]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          after_state: Json | null
          before_state: Json | null
          entity_id: string | null
          entity_table: string
          id: string
          ip: string | null
          occurred_at: string
          organization_id: string | null
          request_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          entity_id?: string | null
          entity_table: string
          id?: string
          ip?: string | null
          occurred_at?: string
          organization_id?: string | null
          request_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          entity_id?: string | null
          entity_table?: string
          id?: string
          ip?: string | null
          occurred_at?: string
          organization_id?: string | null
          request_id?: string | null
        }
        Relationships: []
      }
      communications: {
        Row: {
          action_type: Database["public"]["Enums"]["communication_action_type"]
          actor_user_id: string | null
          body_snapshot: string | null
          channel: Database["public"]["Enums"]["communication_channel"]
          contact_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          occurred_at: string
          organization_id: string
          subject: string | null
          template_id: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["communication_action_type"]
          actor_user_id?: string | null
          body_snapshot?: string | null
          channel: Database["public"]["Enums"]["communication_channel"]
          contact_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          organization_id: string
          subject?: string | null
          template_id?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["communication_action_type"]
          actor_user_id?: string | null
          body_snapshot?: string | null
          channel?: Database["public"]["Enums"]["communication_channel"]
          contact_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          organization_id?: string
          subject?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "organization_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["primary_contact_id"]
          },
          {
            foreignKeyName: "communications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "communications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "communications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          }]
      }
      document_types: {
        Row: {
          code: string
          created_at: string
          default_scope: Database["public"]["Enums"]["document_scope"]
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          default_scope: Database["public"]["Enums"]["document_scope"]
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          default_scope?: Database["public"]["Enums"]["document_scope"]
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          archived_at: string | null
          created_at: string
          document_type_id: string
          expires_on: string | null
          file_name: string | null
          fleet_declaration_id: string | null
          fleet_unit_id: string | null
          id: string
          issued_on: string | null
          mime_type: string | null
          offering_id: string | null
          organization_id: string
          rejection_reason: string | null
          scope: Database["public"]["Enums"]["document_scope"]
          storage_path: string
          updated_at: string
          verification_status: Database["public"]["Enums"]["document_verification_status"]
          verified_at: string | null
          verified_by_user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          document_type_id: string
          expires_on?: string | null
          file_name?: string | null
          fleet_declaration_id?: string | null
          fleet_unit_id?: string | null
          id?: string
          issued_on?: string | null
          mime_type?: string | null
          offering_id?: string | null
          organization_id: string
          rejection_reason?: string | null
          scope: Database["public"]["Enums"]["document_scope"]
          storage_path: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["document_verification_status"]
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          document_type_id?: string
          expires_on?: string | null
          file_name?: string | null
          fleet_declaration_id?: string | null
          fleet_unit_id?: string | null
          id?: string
          issued_on?: string | null
          mime_type?: string | null
          offering_id?: string | null
          organization_id?: string
          rejection_reason?: string | null
          scope?: Database["public"]["Enums"]["document_scope"]
          storage_path?: string
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["document_verification_status"]
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_fleet_declaration_id_fkey"
            columns: ["fleet_declaration_id"]
            isOneToOne: false
            referencedRelation: "gt_fleet_declarations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_fleet_unit_id_fkey"
            columns: ["fleet_unit_id"]
            isOneToOne: false
            referencedRelation: "gt_fleet_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["offering_id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "documents_verified_by_user_id_fkey"
            columns: ["verified_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }]
      }
      follow_ups: {
        Row: {
          archived_at: string | null
          assigned_to_user_id: string | null
          body: string | null
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          due_at: string
          id: string
          organization_id: string
          partnership_id: string | null
          status: Database["public"]["Enums"]["follow_up_status"]
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          assigned_to_user_id?: string | null
          body?: string | null
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          due_at: string
          id?: string
          organization_id: string
          partnership_id?: string | null
          status?: Database["public"]["Enums"]["follow_up_status"]
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          assigned_to_user_id?: string | null
          body?: string | null
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          due_at?: string
          id?: string
          organization_id?: string
          partnership_id?: string | null
          status?: Database["public"]["Enums"]["follow_up_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "follow_ups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "follow_ups_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["partnership_id"]
          }]
      }
      gt_fleet_declarations: {
        Row: {
          archived_at: string | null
          compliance_notes: string | null
          compliance_status: Database["public"]["Enums"]["compliance_status"]
          created_at: string
          declaration_status: Database["public"]["Enums"]["declaration_status"]
          id: string
          luggage_capacity_typical: number | null
          make: string | null
          model_family: string | null
          offering_id: string
          organization_id: string
          organization_location_id: string | null
          pax_capacity_typical: number | null
          quantity: number
          quantity_verified_units: number
          source: Database["public"]["Enums"]["fleet_source"]
          updated_at: string
          vehicle_category_id: string
          year_from: number | null
          year_to: number | null
        }
        Insert: {
          archived_at?: string | null
          compliance_notes?: string | null
          compliance_status?: Database["public"]["Enums"]["compliance_status"]
          created_at?: string
          declaration_status?: Database["public"]["Enums"]["declaration_status"]
          id?: string
          luggage_capacity_typical?: number | null
          make?: string | null
          model_family?: string | null
          offering_id: string
          organization_id: string
          organization_location_id?: string | null
          pax_capacity_typical?: number | null
          quantity: number
          quantity_verified_units?: number
          source?: Database["public"]["Enums"]["fleet_source"]
          updated_at?: string
          vehicle_category_id: string
          year_from?: number | null
          year_to?: number | null
        }
        Update: {
          archived_at?: string | null
          compliance_notes?: string | null
          compliance_status?: Database["public"]["Enums"]["compliance_status"]
          created_at?: string
          declaration_status?: Database["public"]["Enums"]["declaration_status"]
          id?: string
          luggage_capacity_typical?: number | null
          make?: string | null
          model_family?: string | null
          offering_id?: string
          organization_id?: string
          organization_location_id?: string | null
          pax_capacity_typical?: number | null
          quantity?: number
          quantity_verified_units?: number
          source?: Database["public"]["Enums"]["fleet_source"]
          updated_at?: string
          vehicle_category_id?: string
          year_from?: number | null
          year_to?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gt_fleet_declarations_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gt_fleet_declarations_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["offering_id"]
          },
          {
            foreignKeyName: "gt_fleet_declarations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gt_fleet_declarations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "gt_fleet_declarations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "gt_fleet_declarations_organization_location_id_fkey"
            columns: ["organization_location_id"]
            isOneToOne: false
            referencedRelation: "organization_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gt_fleet_declarations_organization_location_id_fkey"
            columns: ["organization_location_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["primary_base_id"]
          },
          {
            foreignKeyName: "gt_fleet_declarations_vehicle_category_id_fkey"
            columns: ["vehicle_category_id"]
            isOneToOne: false
            referencedRelation: "vehicle_categories"
            referencedColumns: ["id"]
          }]
      }
      gt_fleet_units: {
        Row: {
          archived_at: string | null
          color: string | null
          compliance_notes: string | null
          compliance_status: Database["public"]["Enums"]["compliance_status"]
          created_at: string
          declaration_id: string | null
          id: string
          lifecycle_status: Database["public"]["Enums"]["fleet_lifecycle_status"]
          luggage_capacity: number | null
          make: string | null
          model: string | null
          model_year: number | null
          offering_id: string
          organization_id: string
          organization_location_id: string | null
          pax_capacity: number | null
          registration_plate: string | null
          updated_at: string
          vehicle_category_id: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
          verified_by_user_id: string | null
          vin: string | null
        }
        Insert: {
          archived_at?: string | null
          color?: string | null
          compliance_notes?: string | null
          compliance_status?: Database["public"]["Enums"]["compliance_status"]
          created_at?: string
          declaration_id?: string | null
          id?: string
          lifecycle_status?: Database["public"]["Enums"]["fleet_lifecycle_status"]
          luggage_capacity?: number | null
          make?: string | null
          model?: string | null
          model_year?: number | null
          offering_id: string
          organization_id: string
          organization_location_id?: string | null
          pax_capacity?: number | null
          registration_plate?: string | null
          updated_at?: string
          vehicle_category_id: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by_user_id?: string | null
          vin?: string | null
        }
        Update: {
          archived_at?: string | null
          color?: string | null
          compliance_notes?: string | null
          compliance_status?: Database["public"]["Enums"]["compliance_status"]
          created_at?: string
          declaration_id?: string | null
          id?: string
          lifecycle_status?: Database["public"]["Enums"]["fleet_lifecycle_status"]
          luggage_capacity?: number | null
          make?: string | null
          model?: string | null
          model_year?: number | null
          offering_id?: string
          organization_id?: string
          organization_location_id?: string | null
          pax_capacity?: number | null
          registration_plate?: string | null
          updated_at?: string
          vehicle_category_id?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by_user_id?: string | null
          vin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gt_fleet_units_declaration_id_fkey"
            columns: ["declaration_id"]
            isOneToOne: false
            referencedRelation: "gt_fleet_declarations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gt_fleet_units_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gt_fleet_units_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["offering_id"]
          },
          {
            foreignKeyName: "gt_fleet_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gt_fleet_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "gt_fleet_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "gt_fleet_units_organization_location_id_fkey"
            columns: ["organization_location_id"]
            isOneToOne: false
            referencedRelation: "organization_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gt_fleet_units_organization_location_id_fkey"
            columns: ["organization_location_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["primary_base_id"]
          },
          {
            foreignKeyName: "gt_fleet_units_vehicle_category_id_fkey"
            columns: ["vehicle_category_id"]
            isOneToOne: false
            referencedRelation: "vehicle_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gt_fleet_units_verified_by_user_id_fkey"
            columns: ["verified_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }]
      }
      location_edges: {
        Row: {
          child_location_id: string
          id: string
          parent_location_id: string
          relation: Database["public"]["Enums"]["location_edge_relation"]
        }
        Insert: {
          child_location_id: string
          id?: string
          parent_location_id: string
          relation?: Database["public"]["Enums"]["location_edge_relation"]
        }
        Update: {
          child_location_id?: string
          id?: string
          parent_location_id?: string
          relation?: Database["public"]["Enums"]["location_edge_relation"]
        }
        Relationships: [
          {
            foreignKeyName: "location_edges_child_location_id_fkey"
            columns: ["child_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_edges_parent_location_id_fkey"
            columns: ["parent_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          }]
      }
      locations: {
        Row: {
          country_code: string | null
          created_at: string
          google_place_id: string | null
          iata: string | null
          icao: string | null
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["location_kind"]
          lat: number | null
          lng: number | null
          metadata: Json | null
          name: string
          name_normalized: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          google_place_id?: string | null
          iata?: string | null
          icao?: string | null
          id?: string
          is_active?: boolean
          kind: Database["public"]["Enums"]["location_kind"]
          lat?: number | null
          lng?: number | null
          metadata?: Json | null
          name: string
          name_normalized?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          google_place_id?: string | null
          iata?: string | null
          icao?: string | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["location_kind"]
          lat?: number | null
          lng?: number | null
          metadata?: Json | null
          name?: string
          name_normalized?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      membership_roles: {
        Row: {
          membership_id: string
          role_id: string
        }
        Insert: {
          membership_id: string
          role_id: string
        }
        Update: {
          membership_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_roles_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }]
      }
      message_templates: {
        Row: {
          archived_at: string | null
          body: string
          channel: Database["public"]["Enums"]["communication_channel"]
          code: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          organization_id: string | null
          owner_type: Database["public"]["Enums"]["template_owner_type"]
          subject: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          body: string
          channel: Database["public"]["Enums"]["communication_channel"]
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          organization_id?: string | null
          owner_type?: Database["public"]["Enums"]["template_owner_type"]
          subject?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          body?: string
          channel?: Database["public"]["Enums"]["communication_channel"]
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string | null
          owner_type?: Database["public"]["Enums"]["template_owner_type"]
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "message_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          }]
      }
      offering_coverages: {
        Row: {
          archived_at: string | null
          coverage_mode: Database["public"]["Enums"]["coverage_mode"]
          created_at: string
          id: string
          is_informational_only: boolean
          location_id: string | null
          offering_id: string
          organization_id: string
          organization_location_id: string | null
          radius_unit: Database["public"]["Enums"]["distance_unit"] | null
          radius_value: number | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          coverage_mode: Database["public"]["Enums"]["coverage_mode"]
          created_at?: string
          id?: string
          is_informational_only?: boolean
          location_id?: string | null
          offering_id: string
          organization_id: string
          organization_location_id?: string | null
          radius_unit?: Database["public"]["Enums"]["distance_unit"] | null
          radius_value?: number | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          coverage_mode?: Database["public"]["Enums"]["coverage_mode"]
          created_at?: string
          id?: string
          is_informational_only?: boolean
          location_id?: string | null
          offering_id?: string
          organization_id?: string
          organization_location_id?: string | null
          radius_unit?: Database["public"]["Enums"]["distance_unit"] | null
          radius_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offering_coverages_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offering_coverages_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offering_coverages_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["offering_id"]
          },
          {
            foreignKeyName: "offering_coverages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offering_coverages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "offering_coverages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "offering_coverages_organization_location_id_fkey"
            columns: ["organization_location_id"]
            isOneToOne: false
            referencedRelation: "organization_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offering_coverages_organization_location_id_fkey"
            columns: ["organization_location_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["primary_base_id"]
          }]
      }
      offering_standard_assessments: {
        Row: {
          assessed_at: string | null
          assessed_by_user_id: string | null
          created_at: string
          evidence_document_id: string | null
          id: string
          notes: string | null
          offering_id: string
          organization_id: string
          standard_definition_id: string
          status: Database["public"]["Enums"]["assessment_status"]
          updated_at: string
        }
        Insert: {
          assessed_at?: string | null
          assessed_by_user_id?: string | null
          created_at?: string
          evidence_document_id?: string | null
          id?: string
          notes?: string | null
          offering_id: string
          organization_id: string
          standard_definition_id: string
          status?: Database["public"]["Enums"]["assessment_status"]
          updated_at?: string
        }
        Update: {
          assessed_at?: string | null
          assessed_by_user_id?: string | null
          created_at?: string
          evidence_document_id?: string | null
          id?: string
          notes?: string | null
          offering_id?: string
          organization_id?: string
          standard_definition_id?: string
          status?: Database["public"]["Enums"]["assessment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offering_standard_assessments_assessed_by_user_id_fkey"
            columns: ["assessed_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offering_standard_assessments_evidence_document_id_fkey"
            columns: ["evidence_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offering_standard_assessments_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offering_standard_assessments_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["offering_id"]
          },
          {
            foreignKeyName: "offering_standard_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offering_standard_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "offering_standard_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "offering_standard_assessments_standard_definition_id_fkey"
            columns: ["standard_definition_id"]
            isOneToOne: false
            referencedRelation: "standard_definitions"
            referencedColumns: ["id"]
          }]
      }
      offerings: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          label: string | null
          operational_status: Database["public"]["Enums"]["operational_status"]
          organization_id: string
          service_type_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          label?: string | null
          operational_status?: Database["public"]["Enums"]["operational_status"]
          organization_id: string
          service_type_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          label?: string | null
          operational_status?: Database["public"]["Enums"]["operational_status"]
          organization_id?: string
          service_type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offerings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offerings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "offerings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "offerings_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          }]
      }
      organization_capabilities: {
        Row: {
          capability: Database["public"]["Enums"]["organization_capability"]
          created_at: string
          id: string
          organization_id: string
        }
        Insert: {
          capability: Database["public"]["Enums"]["organization_capability"]
          created_at?: string
          id?: string
          organization_id: string
        }
        Update: {
          capability?: Database["public"]["Enums"]["organization_capability"]
          created_at?: string
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_capabilities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_capabilities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_capabilities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          }]
      }
      organization_contacts: {
        Row: {
          archived_at: string | null
          contact_type: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_primary: boolean
          linked_user_id: string | null
          organization_id: string
          phone_e164: string | null
          title: string | null
          updated_at: string
          whatsapp_e164: string | null
        }
        Insert: {
          archived_at?: string | null
          contact_type: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean
          linked_user_id?: string | null
          organization_id: string
          phone_e164?: string | null
          title?: string | null
          updated_at?: string
          whatsapp_e164?: string | null
        }
        Update: {
          archived_at?: string | null
          contact_type?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean
          linked_user_id?: string | null
          organization_id?: string
          phone_e164?: string | null
          title?: string | null
          updated_at?: string
          whatsapp_e164?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_contacts_linked_user_id_fkey"
            columns: ["linked_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          }]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          contact_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          intended_role_id: string | null
          invited_by_user_id: string | null
          organization_id: string
          revoked_at: string | null
          scopes: Json | null
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          contact_id?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          intended_role_id?: string | null
          invited_by_user_id?: string | null
          organization_id: string
          revoked_at?: string | null
          scopes?: Json | null
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          contact_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          intended_role_id?: string | null
          invited_by_user_id?: string | null
          organization_id?: string
          revoked_at?: string | null
          scopes?: Json | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "organization_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["primary_contact_id"]
          },
          {
            foreignKeyName: "organization_invitations_intended_role_id_fkey"
            columns: ["intended_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          }]
      }
      organization_locations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          archived_at: string | null
          city: string | null
          country_code: string | null
          created_at: string
          formatted_address: string | null
          google_place_id: string | null
          id: string
          is_primary: boolean
          label: string
          lat: number | null
          lng: number | null
          location_kind: Database["public"]["Enums"]["org_location_kind"]
          organization_id: string
          place_id: string | null
          postal_code: string | null
          region: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          archived_at?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          formatted_address?: string | null
          google_place_id?: string | null
          id?: string
          is_primary?: boolean
          label: string
          lat?: number | null
          lng?: number | null
          location_kind?: Database["public"]["Enums"]["org_location_kind"]
          organization_id: string
          place_id?: string | null
          postal_code?: string | null
          region?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          archived_at?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          formatted_address?: string | null
          google_place_id?: string | null
          id?: string
          is_primary?: boolean
          label?: string
          lat?: number | null
          lng?: number | null
          location_kind?: Database["public"]["Enums"]["org_location_kind"]
          organization_id?: string
          place_id?: string | null
          postal_code?: string | null
          region?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          }]
      }
      organization_memberships: {
        Row: {
          accepted_at: string | null
          archived_at: string | null
          created_at: string
          id: string
          invited_at: string | null
          organization_id: string
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          archived_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          archived_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }]
      }
      organization_standard_assessments: {
        Row: {
          assessed_at: string | null
          assessed_by_user_id: string | null
          created_at: string
          evidence_document_id: string | null
          id: string
          notes: string | null
          organization_id: string
          standard_definition_id: string
          status: Database["public"]["Enums"]["assessment_status"]
          updated_at: string
        }
        Insert: {
          assessed_at?: string | null
          assessed_by_user_id?: string | null
          created_at?: string
          evidence_document_id?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          standard_definition_id: string
          status?: Database["public"]["Enums"]["assessment_status"]
          updated_at?: string
        }
        Update: {
          assessed_at?: string | null
          assessed_by_user_id?: string | null
          created_at?: string
          evidence_document_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          standard_definition_id?: string
          status?: Database["public"]["Enums"]["assessment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_standard_assessments_assessed_by_user_id_fkey"
            columns: ["assessed_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_standard_assessments_evidence_document_id_fkey"
            columns: ["evidence_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_standard_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_standard_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_standard_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_standard_assessments_standard_definition_id_fkey"
            columns: ["standard_definition_id"]
            isOneToOne: false
            referencedRelation: "standard_definitions"
            referencedColumns: ["id"]
          }]
      }
      organizations: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by_user_id: string | null
          display_name: string
          google_place_id: string | null
          google_rating: number | null
          google_review_count: number | null
          google_reviews_checked_at: string | null
          google_reviews_note: string | null
          id: string
          is_test: boolean
          legal_address_line1: string | null
          legal_address_line2: string | null
          legal_city: string | null
          legal_country_code: string | null
          legal_lat: number | null
          legal_lng: number | null
          legal_name: string | null
          legal_postal_code: string | null
          legal_region: string | null
          logo_url: string | null
          notes_public: string | null
          primary_email: string | null
          primary_phone_e164: string | null
          primary_whatsapp_e164: string | null
          updated_at: string
          website_domain: string | null
          website_url: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          display_name: string
          google_place_id?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          google_reviews_checked_at?: string | null
          google_reviews_note?: string | null
          id?: string
          is_test?: boolean
          legal_address_line1?: string | null
          legal_address_line2?: string | null
          legal_city?: string | null
          legal_country_code?: string | null
          legal_lat?: number | null
          legal_lng?: number | null
          legal_name?: string | null
          legal_postal_code?: string | null
          legal_region?: string | null
          logo_url?: string | null
          notes_public?: string | null
          primary_email?: string | null
          primary_phone_e164?: string | null
          primary_whatsapp_e164?: string | null
          updated_at?: string
          website_domain?: string | null
          website_url?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          display_name?: string
          google_place_id?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          google_reviews_checked_at?: string | null
          google_reviews_note?: string | null
          id?: string
          is_test?: boolean
          legal_address_line1?: string | null
          legal_address_line2?: string | null
          legal_city?: string | null
          legal_country_code?: string | null
          legal_lat?: number | null
          legal_lng?: number | null
          legal_name?: string | null
          legal_postal_code?: string | null
          legal_region?: string | null
          logo_url?: string | null
          notes_public?: string | null
          primary_email?: string | null
          primary_phone_e164?: string | null
          primary_whatsapp_e164?: string | null
          updated_at?: string
          website_domain?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }]
      }
      partnership_notes: {
        Row: {
          archived_at: string | null
          body: string
          created_at: string
          created_by_user_id: string | null
          id: string
          organization_id: string
          partnership_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          body: string
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          organization_id: string
          partnership_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          body?: string
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          organization_id?: string
          partnership_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partnership_notes_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnership_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnership_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "partnership_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "partnership_notes_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnership_notes_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["partnership_id"]
          }]
      }
      partnerships: {
        Row: {
          became_active_at: string | null
          created_at: string
          first_contacted_at: string | null
          id: string
          inactive_reason: string | null
          organization_id: string
          paused_at: string | null
          priority: number | null
          rejected_at: string | null
          rejected_reason: string | null
          relationship_status: Database["public"]["Enums"]["relationship_status"]
          status_changed_at: string
          updated_at: string
        }
        Insert: {
          became_active_at?: string | null
          created_at?: string
          first_contacted_at?: string | null
          id?: string
          inactive_reason?: string | null
          organization_id: string
          paused_at?: string | null
          priority?: number | null
          rejected_at?: string | null
          rejected_reason?: string | null
          relationship_status?: Database["public"]["Enums"]["relationship_status"]
          status_changed_at?: string
          updated_at?: string
        }
        Update: {
          became_active_at?: string | null
          created_at?: string
          first_contacted_at?: string | null
          id?: string
          inactive_reason?: string | null
          organization_id?: string
          paused_at?: string | null
          priority?: number | null
          rejected_at?: string | null
          rejected_reason?: string | null
          relationship_status?: Database["public"]["Enums"]["relationship_status"]
          status_changed_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partnerships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnerships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "partnerships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          }]
      }
      permissions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          scope: Database["public"]["Enums"]["permission_scope"]
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          scope: Database["public"]["Enums"]["permission_scope"]
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          scope?: Database["public"]["Enums"]["permission_scope"]
        }
        Relationships: []
      }
      platform_role_assignments: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_role_assignments_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_role_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_role_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_platform_user: boolean
          locale: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          is_platform_user?: boolean
          locale?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_platform_user?: boolean
          locale?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }]
      }
      roles: {
        Row: {
          code: string
          created_at: string
          id: string
          is_system: boolean
          name: string
          scope: Database["public"]["Enums"]["permission_scope"]
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_system?: boolean
          name: string
          scope: Database["public"]["Enums"]["permission_scope"]
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_system?: boolean
          name?: string
          scope?: Database["public"]["Enums"]["permission_scope"]
        }
        Relationships: []
      }
      service_types: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      standard_definitions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          level: Database["public"]["Enums"]["standard_level"]
          parameters: Json | null
          scope: Database["public"]["Enums"]["standard_scope"]
          service_type_id: string | null
          supersedes_id: string | null
          title: string
          version: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          level: Database["public"]["Enums"]["standard_level"]
          parameters?: Json | null
          scope: Database["public"]["Enums"]["standard_scope"]
          service_type_id?: string | null
          supersedes_id?: string | null
          title: string
          version?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          level?: Database["public"]["Enums"]["standard_level"]
          parameters?: Json | null
          scope?: Database["public"]["Enums"]["standard_scope"]
          service_type_id?: string | null
          supersedes_id?: string | null
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "standard_definitions_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standard_definitions_supersedes_id_fkey"
            columns: ["supersedes_id"]
            isOneToOne: false
            referencedRelation: "standard_definitions"
            referencedColumns: ["id"]
          }]
      }
      vehicle_categories: {
        Row: {
          code: string
          created_at: string
          description: string | null
          example_models: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          example_models?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          example_models?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      vehicle_standard_assessments: {
        Row: {
          assessed_at: string | null
          assessed_by_user_id: string | null
          created_at: string
          evidence_document_id: string | null
          fleet_declaration_id: string | null
          fleet_unit_id: string | null
          id: string
          notes: string | null
          organization_id: string
          standard_definition_id: string
          status: Database["public"]["Enums"]["assessment_status"]
          updated_at: string
        }
        Insert: {
          assessed_at?: string | null
          assessed_by_user_id?: string | null
          created_at?: string
          evidence_document_id?: string | null
          fleet_declaration_id?: string | null
          fleet_unit_id?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          standard_definition_id: string
          status?: Database["public"]["Enums"]["assessment_status"]
          updated_at?: string
        }
        Update: {
          assessed_at?: string | null
          assessed_by_user_id?: string | null
          created_at?: string
          evidence_document_id?: string | null
          fleet_declaration_id?: string | null
          fleet_unit_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          standard_definition_id?: string
          status?: Database["public"]["Enums"]["assessment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_standard_assessments_assessed_by_user_id_fkey"
            columns: ["assessed_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_standard_assessments_evidence_document_id_fkey"
            columns: ["evidence_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_standard_assessments_fleet_declaration_id_fkey"
            columns: ["fleet_declaration_id"]
            isOneToOne: false
            referencedRelation: "gt_fleet_declarations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_standard_assessments_fleet_unit_id_fkey"
            columns: ["fleet_unit_id"]
            isOneToOne: false
            referencedRelation: "gt_fleet_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_standard_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_standard_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_overview"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "vehicle_standard_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_organization_summary"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "vehicle_standard_assessments_standard_definition_id_fkey"
            columns: ["standard_definition_id"]
            isOneToOne: false
            referencedRelation: "standard_definitions"
            referencedColumns: ["id"]
          }]
      }
    }
    Views: {
      v_organization_overview: {
        Row: {
          archived_at: string | null
          became_active_at: string | null
          capabilities: string[] | null
          coverage_airport_iatas: string[] | null
          coverage_count: number | null
          created_at: string | null
          display_name: string | null
          is_test: boolean | null
          last_activity_at: string | null
          legal_country_code: string | null
          legal_name: string | null
          next_action_due_at: string | null
          next_action_title: string | null
          next_follow_up_id: string | null
          offering_id: string | null
          operational_status:
            | Database["public"]["Enums"]["operational_status"]
            | null
          organization_id: string | null
          partnership_id: string | null
          primary_base_city: string | null
          primary_base_country_code: string | null
          primary_base_id: string | null
          primary_base_label: string | null
          primary_base_lat: number | null
          primary_base_lng: number | null
          primary_base_region: string | null
          primary_contact_email: string | null
          primary_contact_id: string | null
          primary_contact_name: string | null
          primary_contact_phone_e164: string | null
          primary_contact_type: string | null
          primary_contact_whatsapp_e164: string | null
          primary_email: string | null
          primary_phone_e164: string | null
          primary_whatsapp_e164: string | null
          relationship_status:
            | Database["public"]["Enums"]["relationship_status"]
            | null
          relationship_status_changed_at: string | null
          service_code: string | null
          service_name: string | null
          updated_at: string | null
          website_domain: string | null
          website_url: string | null
        }
        Relationships: []
      }
      v_organization_summary: {
        Row: {
          archived_at: string | null
          coverage_count: number | null
          created_at: string | null
          display_name: string | null
          is_test: boolean | null
          last_activity_at: string | null
          legal_country_code: string | null
          legal_name: string | null
          next_action_due_at: string | null
          next_action_title: string | null
          next_follow_up_id: string | null
          operational_status:
            | Database["public"]["Enums"]["operational_status"]
            | null
          organization_id: string | null
          primary_base_city: string | null
          primary_base_country_code: string | null
          primary_base_label: string | null
          relationship_status:
            | Database["public"]["Enums"]["relationship_status"]
            | null
          relationship_status_changed_at: string | null
          service_code: string | null
          service_name: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_network_place_suppliers: {
        Row: {
          location_id: string | null
          location_name: string | null
          location_kind:
            | Database["public"]["Enums"]["location_kind"]
            | null
          iata: string | null
          icao: string | null
          location_country_code: string | null
          location_lat: number | null
          location_lng: number | null
          organization_id: string | null
          display_name: string | null
          legal_name: string | null
          legal_country_code: string | null
          is_test: boolean | null
          archived_at: string | null
          partnership_id: string | null
          relationship_status:
            | Database["public"]["Enums"]["relationship_status"]
            | null
          relationship_status_changed_at: string | null
          offering_id: string | null
          operational_status:
            | Database["public"]["Enums"]["operational_status"]
            | null
          service_code: string | null
          service_name: string | null
          coverage_id: string | null
          coverage_mode: Database["public"]["Enums"]["coverage_mode"] | null
          is_informational_only: boolean | null
          primary_base_id: string | null
          primary_base_label: string | null
          primary_base_city: string | null
          primary_base_country_code: string | null
          primary_base_lat: number | null
          primary_base_lng: number | null
        }
        Relationships: []
      }
      v_network_organizations: {
        Row: {
          organization_id: string | null
          display_name: string | null
          legal_name: string | null
          legal_country_code: string | null
          is_test: boolean | null
          archived_at: string | null
          created_at: string | null
          google_rating: number | null
          google_review_count: number | null
          google_reviews_note: string | null
          partnership_id: string | null
          relationship_status:
            | Database["public"]["Enums"]["relationship_status"]
            | null
          relationship_status_changed_at: string | null
          offering_id: string | null
          operational_status:
            | Database["public"]["Enums"]["operational_status"]
            | null
          service_code: string | null
          service_name: string | null
          primary_base_id: string | null
          primary_base_label: string | null
          primary_base_city: string | null
          primary_base_region: string | null
          primary_base_country_code: string | null
          primary_base_lat: number | null
          primary_base_lng: number | null
          coverage_count: number | null
          coverage_airport_iatas: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_outreach_dashboard_stats: { Args: Record<string, never>; Returns: Json }
      has_org_permission: {
        Args: { org_id: string; perm_code: string }
        Returns: boolean
      }
      has_platform_permission: { Args: { perm_code: string }; Returns: boolean }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      is_platform_user: { Args: never; Returns: boolean }
      rpc_change_relationship_status: {
        Args: {
          p_new_status: Database["public"]["Enums"]["relationship_status"]
          p_note?: string
          p_organization_id: string
        }
        Returns: Json
      }
      rpc_quick_add_operator: { Args: { p_payload: Json }; Returns: Json }
    }
    Enums: {
      activity_visibility: "VL_ONLY" | "ORG_SHARED"
      assessment_status:
        | "NOT_STARTED"
        | "PENDING"
        | "SATISFIED"
        | "FAILED"
        | "WAIVED"
      communication_action_type:
        | "OPEN_WHATSAPP"
        | "COPY_WHATSAPP"
        | "OPEN_EMAIL"
        | "COPY_EMAIL"
        | "LOGGED_MANUAL"
        | "SENT_EMAIL"
      communication_channel: "EMAIL" | "WHATSAPP"
      compliance_status:
        | "COMPLIANT"
        | "NON_COMPLIANT"
        | "UNKNOWN"
        | "EXEMPT_AUDITED"
      coverage_mode: "AIRPORT_EXPLICIT" | "CITY_OR_REGION" | "RADIUS"
      declaration_status: "DECLARED" | "PARTIALLY_VERIFIED" | "SUPERSEDED"
      distance_unit: "KM" | "MILE"
      document_scope:
        | "ORGANIZATION"
        | "OFFERING"
        | "VEHICLE_UNIT"
        | "VEHICLE_DECLARATION"
      document_verification_status:
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "EXPIRED"
      fleet_lifecycle_status: "ACTIVE" | "INACTIVE" | "RETIRED"
      fleet_source: "OPERATOR_CLAIM" | "VL_ENTERED" | "IMPORT"
      follow_up_status: "OPEN" | "DONE" | "CANCELLED"
      location_edge_relation: "CONTAINS"
      location_kind: "COUNTRY" | "REGION" | "LOCALITY" | "AIRPORT" | "POI"
      membership_status: "INVITED" | "ACTIVE" | "DISABLED"
      operational_status: "AVAILABLE" | "LIMITED" | "UNAVAILABLE" | "UNKNOWN"
      org_location_kind: "HQ" | "OPS_BASE" | "DEPOT" | "OTHER"
      organization_capability: "SUPPLIER" | "BUYER"
      permission_scope: "PLATFORM" | "ORGANIZATION"
      relationship_status:
        | "LEAD"
        | "CONTACTED"
        | "INTERESTED"
        | "ONBOARDING"
        | "UNDER_REVIEW"
        | "ACTIVE"
        | "PAUSED"
        | "REJECTED"
        | "INACTIVE"
      standard_level: "REQUIRED" | "RECOMMENDED" | "OPTIONAL"
      standard_scope: "ORGANIZATION" | "OFFERING" | "VEHICLE"
      template_owner_type: "PLATFORM" | "ORGANIZATION"
      verification_status: "UNVERIFIED" | "VERIFIED" | "REJECTED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Database

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      activity_visibility: ["VL_ONLY", "ORG_SHARED"],
      assessment_status: [
        "NOT_STARTED",
        "PENDING",
        "SATISFIED",
        "FAILED",
        "WAIVED"],
      communication_action_type: [
        "OPEN_WHATSAPP",
        "COPY_WHATSAPP",
        "OPEN_EMAIL",
        "COPY_EMAIL",
        "LOGGED_MANUAL",
        "SENT_EMAIL"],
      communication_channel: ["EMAIL", "WHATSAPP"],
      compliance_status: [
        "COMPLIANT",
        "NON_COMPLIANT",
        "UNKNOWN",
        "EXEMPT_AUDITED"],
      coverage_mode: ["AIRPORT_EXPLICIT", "CITY_OR_REGION", "RADIUS"],
      declaration_status: ["DECLARED", "PARTIALLY_VERIFIED", "SUPERSEDED"],
      distance_unit: ["KM", "MILE"],
      document_scope: [
        "ORGANIZATION",
        "OFFERING",
        "VEHICLE_UNIT",
        "VEHICLE_DECLARATION"],
      document_verification_status: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "EXPIRED"],
      fleet_lifecycle_status: ["ACTIVE", "INACTIVE", "RETIRED"],
      fleet_source: ["OPERATOR_CLAIM", "VL_ENTERED", "IMPORT"],
      follow_up_status: ["OPEN", "DONE", "CANCELLED"],
      location_edge_relation: ["CONTAINS"],
      location_kind: ["COUNTRY", "REGION", "LOCALITY", "AIRPORT", "POI"],
      membership_status: ["INVITED", "ACTIVE", "DISABLED"],
      operational_status: ["AVAILABLE", "LIMITED", "UNAVAILABLE", "UNKNOWN"],
      org_location_kind: ["HQ", "OPS_BASE", "DEPOT", "OTHER"],
      organization_capability: ["SUPPLIER", "BUYER"],
      permission_scope: ["PLATFORM", "ORGANIZATION"],
      relationship_status: [
        "LEAD",
        "CONTACTED",
        "INTERESTED",
        "ONBOARDING",
        "UNDER_REVIEW",
        "ACTIVE",
        "PAUSED",
        "REJECTED",
        "INACTIVE"],
      standard_level: ["REQUIRED", "RECOMMENDED", "OPTIONAL"],
      standard_scope: ["ORGANIZATION", "OFFERING", "VEHICLE"],
      template_owner_type: ["PLATFORM", "ORGANIZATION"],
      verification_status: ["UNVERIFIED", "VERIFIED", "REJECTED"],
    },
  },
} as const
