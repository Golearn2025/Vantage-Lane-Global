import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password required"),
});

export const quickAddSchema = z.object({
  display_name: z.string().min(2, "Company name is required"),
  legal_country_code: z
    .string()
    .length(2, "Use ISO-2 country code")
    .transform((v) => v.toUpperCase()),
  legal_name: z.string().optional().or(z.literal("")),
  website_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  primary_whatsapp_e164: z.string().optional().or(z.literal("")),
  primary_email: z.string().email().optional().or(z.literal("")),
  primary_phone_e164: z.string().optional().or(z.literal("")),
  base_label: z.string().optional().or(z.literal("")),
  base_city: z.string().optional().or(z.literal("")),
  google_place_id: z.string().optional().or(z.literal("")),
  lead_source: z.string().optional().or(z.literal("")),
  internal_note: z.string().optional().or(z.literal("")),
  coverage_location_id: z.string().uuid().optional().or(z.literal("")),
  is_test: z.boolean().optional().default(false),
});

export type QuickAddFormValues = z.input<typeof quickAddSchema>;
export type QuickAddParsedValues = z.output<typeof quickAddSchema>;

export const contactSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  contact_type: z.string().optional().or(z.literal("")),
  title: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone_e164: z.string().optional().or(z.literal("")),
  whatsapp_e164: z.string().optional().or(z.literal("")),
  is_primary: z.boolean().default(false),
});

export const baseSchema = z.object({
  label: z.string().min(2, "Label is required"),
  city: z.string().optional().or(z.literal("")),
  country_code: z
    .string()
    .length(2)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v.toUpperCase() : "")),
  address_line1: z.string().optional().or(z.literal("")),
  is_primary: z.boolean().default(false),
  location_kind: z.enum(["HQ", "OPS_BASE", "DEPOT", "OTHER"]).default("OPS_BASE"),
});
