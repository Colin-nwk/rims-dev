import { z } from "zod";

/**
 * Staff Validation Schemas
 * Matches backend validation rules
 */

// Staff Detail Schema
export const staffDetailSchema = z
  .object({
    nin: z.string().optional(),
    bvn: z.string().optional(),
    place_of_birth: z.string().optional(),
    contact_address: z.string().optional(),
    permanent_home_address: z.string().optional(),
    height: z.string().optional(),
    blood_group: z.string().optional(),
    genotype: z.string().optional(),
    complexion: z.string().optional(),
    hair_colour: z.string().optional(),
    is_deformed: z.boolean().optional(),
    deformity: z.string().optional(),
    is_convicted: z.boolean().optional(),
    previous_convictions: z.string().optional(),
    pfa_name: z.string().optional(),
    pension_pin: z.string().optional(),
    ippis: z.string().optional(),
    next_of_kin_name: z.string().optional(),
    next_of_kin_phone: z.string().optional(),
    next_of_kin_relationship: z.string().optional(),
    next_of_kin_address: z.string().optional(),
    marital_status: z.string().optional(),
    spouse_name: z.string().optional(),
    spouse_phone: z.string().optional(),
    number_of_children: z.number().int().min(0).optional(),
    bank_name: z.string().optional(),
    account_number: z.string().optional(),
    account_name: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.is_deformed && !data.deformity) {
        return false;
      }
      return true;
    },
    {
      message: "Deformity description is required when is_deformed is true",
      path: ["deformity"],
    },
  )
  .refine(
    (data) => {
      if (data.is_convicted && !data.previous_convictions) {
        return false;
      }
      return true;
    },
    {
      message:
        "Previous convictions description is required when is_convicted is true",
      path: ["previous_convictions"],
    },
  );

// Education type values
export const educationTypes = [
  "Primary",
  "Secondary",
  "Tertiary",
  "Professional",
  "Other",
] as const;

export type EducationType = (typeof educationTypes)[number];

// Sex/Gender values (still hardcoded as it's a simple binary field)
export const sexOptions = ["Male", "Female"] as const;
export type SexOption = (typeof sexOptions)[number];

// Next of kin relationship options (common relationships, can be hardcoded)
export const relationshipOptions = [
  "Spouse",
  "Parent",
  "Sibling",
  "Child",
  "Relative",
  "Friend",
  "Other"
] as const;
export type RelationshipOption = (typeof relationshipOptions)[number];

// Staff Education Schema
export const staffEducationSchema = z
  .object({
    institution: z.string().min(1, "Institution is required"),
    course: z.string().optional(),
    type: z.enum(educationTypes, {
      message: "Education type is required",
    }),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().optional(),
    url: z.union([z.instanceof(File), z.string()]).optional(), // File or string URL
  })
  .refine(
    (data) => {
      if (data.end_date && data.start_date) {
        return new Date(data.end_date) >= new Date(data.start_date);
      }
      return true;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["end_date"],
    },
  );

// Base Staff Schema (shared fields)
const baseStaffSchema = z.object({
  service_no: z.string().min(1, "Service number is required"),
  surname: z.string().min(1, "Surname is required"),
  first_name: z.string().min(1, "First name is required"),
  other_names: z.string().optional(),
  email: z.email("Invalid email address").optional().or(z.literal("")),
  phone_number: z.string().optional(),
  sex: z
    .enum(sexOptions, {
      message: "Please select a gender",
    })
    .optional(),
  status: z.number().int().min(0).max(1),

  // Work Information
  department: z.string().optional(),
  duty: z.string().optional(),
  work_distribution_id: z.number().int().optional(),
  training_institute_id: z.number().int().optional(),
  directorate_id: z.number().int().optional(),
  staff_status_id: z.number().int().optional(),
  present_rank: z.string().optional(),
  initial_rank: z.string().optional(),
  level: z
    .number()
    .int()
    .min(1)
    .max(17)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  step: z.string().optional(),
  assigned_state: z.string().optional(),
  prison: z.string().optional(),

  // Dates
  dob: z.string().optional(),
  date_of_first_appointment: z.string().optional(),
  present_appointment_date: z.string().optional(),
  command_post_date: z.string().optional(),

  // Location
  state_of_origin: z.string().optional(),
  lga: z.string().optional(),
  initial_command: z.string().optional(),
  present_command: z.string().optional(),

  // Administrative
  file_no: z.string().optional(),
  ippis: z.string().optional(),
  description: z.string().optional(),
  is_verified: z.boolean().optional(),
});

// Create Staff Schema
export const createStaffSchema = baseStaffSchema.extend({
  details: staffDetailSchema.optional(),
  education: z.array(staffEducationSchema).optional(),
  photo: z.instanceof(File).optional(),
});

// Update Staff Schema
export const updateStaffSchema = baseStaffSchema.partial().extend({
  details: staffDetailSchema.optional(),
  education: z.array(staffEducationSchema).optional(),
  photo: z.union([z.instanceof(File), z.string()]).optional(),
});

// Step 1: Official Info (legacy - kept for reference)
export const officialInfoSchema = z.object({
  service_no: z.string().min(1, "Service number is required"),
  ippis: z.string().optional(),
  file_no: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  duty: z.string().optional(),
  work_distribution_id: z.number().int().optional(),
  training_institute_id: z.number().int().optional(),
  directorate_id: z.number().int().optional(),
  staff_status_id: z.number().int().optional(),
  present_rank: z.string().min(1, "Present rank is required"),
  initial_rank: z.string().optional(),
  level: z
    .number()
    .int()
    .min(1)
    .max(17)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  step: z.string().optional(),
});

export type OfficialInfoFormData = z.infer<typeof officialInfoSchema>;

// Step 2: Personal Details (legacy - kept for reference)
export const personalDetailsSchema = z.object({
  surname: z.string().min(1, "Surname is required"),
  first_name: z.string().min(1, "First name is required"),
  other_names: z.string().optional(),
  sex: z
    .enum(sexOptions, {
      message: "Please select a gender",
    })
    .optional(),
  dob: z.string().optional(),
  email: z.email("Invalid email address").optional().or(z.literal("")),
  phone_number: z.string().optional(),
});

export type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;

// Step 1: Basic Info (Combined Official + Personal)
export const basicInfoSchema = z.object({
  // Official Info
  service_no: z.string().min(1, "Service number is required"),
  ippis: z.string().optional(),
  file_no: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  duty: z.string().optional(),
  work_distribution_id: z.number().int().optional(),
  training_institute_id: z.number().int().optional(),
  directorate_id: z.number().int().optional(),
  staff_status_id: z.number().int().optional(),
  present_rank: z.string().min(1, "Present rank is required"),
  initial_rank: z.string().optional(),
  level: z
    .number()
    .int()
    .min(1)
    .max(17)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  // Personal Details
  surname: z.string().min(1, "Surname is required"),
  first_name: z.string().min(1, "First name is required"),
  other_names: z.string().optional(),
  sex: z
    .enum(sexOptions, {
      message: "Please select a gender",
    })
    .optional(),
  dob: z.string().optional(),
  email: z.email("Invalid email address").optional().or(z.literal("")),
  phone_number: z.string().optional(),
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

// Step 3: Posting & Origin
export const postingOriginSchema = z.object({
  state_of_origin: z.string().optional(),
  lga: z.string().optional(),
  assigned_state: z.string().optional(),
  prison: z.string().optional(),
  initial_command: z.number().optional(),
  present_command: z.number().optional(),
  command_post_date: z.string().optional(),
});

export type PostingOriginFormData = z.infer<typeof postingOriginSchema>;

// Step 4: Identity & Documents
export const identityDocumentsSchema = z.object({
  nin: z.string().optional(),
  bvn: z.string().optional(),
  ippis: z.string().optional(),
  pfa_name: z.string().optional(),
  pension_pin: z.string().optional(),
  date_of_first_appointment: z.string().optional(),
  present_appointment_date: z.string().optional(),
  photo: z.union([z.instanceof(File), z.string()]).optional(),
});

export type IdentityDocumentsFormData = z.infer<
  typeof identityDocumentsSchema
>;

// Step 5: Physical & Medical Info
export const physicalMedicalSchema = z.object({
  place_of_birth: z.string().optional(),
  height: z.string().optional(),
  blood_group: z.string().optional(),
  genotype: z.string().optional(),
  complexion: z.string().optional(),
  hair_colour: z.string().optional(),
  is_deformed: z.boolean().optional(),
  deformity: z.string().optional(),
  is_convicted: z.boolean().optional(),
  previous_convictions: z.string().optional(),
}).refine(
  (data) => {
    if (data.is_deformed && !data.deformity) {
      return false;
    }
    return true;
  },
  {
    message: "Deformity description is required when marked as deformed",
    path: ["deformity"],
  },
).refine(
  (data) => {
    if (data.is_convicted && !data.previous_convictions) {
      return false;
    }
    return true;
  },
  {
    message: "Previous convictions description is required when marked as convicted",
    path: ["previous_convictions"],
  },
);

export type PhysicalMedicalFormData = z.infer<typeof physicalMedicalSchema>;

// Step 6: Addresses
export const addressesSchema = z.object({
  contact_address: z.string().optional(),
  permanent_home_address: z.string().optional(),
});

export type AddressesFormData = z.infer<typeof addressesSchema>;

// Step 7: Family & Next of Kin
export const familyNextOfKinSchema = z.object({
  marital_status: z.string().optional(),
  spouse_name: z.string().optional(),
  spouse_phone: z.string().optional(),
  number_of_children: z.number().int().min(0).optional().or(z.literal("").transform(() => undefined)),
  next_of_kin_name: z.string().optional(),
  next_of_kin_phone: z.string().optional(),
  next_of_kin_relationship: z.string().optional(),
  next_of_kin_address: z.string().optional(),
});

export type FamilyNextOfKinFormData = z.infer<typeof familyNextOfKinSchema>;

// Step 8: Banking & Financial
export const bankingFinancialSchema = z.object({
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  account_name: z.string().optional(),
});

export type BankingFinancialFormData = z.infer<typeof bankingFinancialSchema>;

// Step 9: Education/Qualifications
export const educationQualificationsSchema = z.object({
  education: z.array(staffEducationSchema).optional(),
});

export type EducationQualificationsFormData = z.infer<
  typeof educationQualificationsSchema
>;

// Step 10: Review & Status
export const reviewStatusSchema = z.object({
  status: z.number().int().min(0).max(1),
  is_verified: z.boolean().optional(),
});

export type ReviewStatusFormData = z.infer<typeof reviewStatusSchema>;

// Complete form data (all steps combined)
export type CreateStaffFormData = z.infer<typeof createStaffSchema>;
export type UpdateStaffFormData = z.infer<typeof updateStaffSchema>;

// Assign Role Schema
export const assignRoleSchema = z.object({
  role_id: z.number().int().min(1, "Please select a role"),
});

export type AssignRoleFormData = z.infer<typeof assignRoleSchema>;
