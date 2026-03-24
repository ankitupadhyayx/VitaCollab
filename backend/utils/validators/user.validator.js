const { z } = require("zod");
const { ADMIN_ROLES } = require("../../constants/admin-rbac");

const qrResolveSchema = z.object({
  token: z
    .string({
      required_error: "Please provide the QR token.",
      invalid_type_error: "Please provide the QR token."
    })
    .trim()
    .min(20, "The QR token is invalid or has expired.")
});

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    phone: z.string().min(6).max(20).optional(),
    age: z.coerce.number().int().min(0).max(140).optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    bloodGroup: z.string().min(2).max(3).optional(),
    address: z.string().min(2).max(260).optional(),
    emergencyContact: z.string().min(6).max(40).optional(),
    dob: z.string().optional(),
    allergies: z.union([z.string(), z.array(z.string())]).optional(),
    medicalConditions: z.union([z.string(), z.array(z.string())]).optional(),
    medications: z.union([z.string(), z.array(z.string())]).optional(),
    hospitalName: z.string().min(2).max(180).optional(),
    licenseNumber: z.string().min(3).max(80).optional(),
    specialization: z.string().min(2).max(160).optional(),
    departments: z.union([z.string(), z.array(z.string())]).optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().min(6).max(20).optional()
  })
  .strict();

const adminAuditQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  user: z.string().regex(objectIdRegex, "Please provide a valid user ID.").optional(),
  action: z.string().min(2).max(100).optional(),
  role: z.enum(["patient", "hospital", "admin", "anonymous"]).optional(),
  resourceId: z.string().min(2).max(300).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

const adminUserQuerySchema = z.object({
  role: z.enum(["patient", "hospital", "admin"]).optional(),
  status: z.enum(["active", "suspended", "blocked"]).optional(),
  search: z.string().min(1).max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

const adminUpdateUserStatusSchema = z.object({
  status: z.enum(["active", "suspended", "blocked"]),
  reason: z.string().max(300).optional(),
  suspendedUntil: z.string().datetime().optional()
});

const adminBroadcastSchema = z.object({
  message: z
    .string({
      required_error: "Please enter a message.",
      invalid_type_error: "Please enter a message."
    })
    .min(10, "Please enter at least 10 characters.")
    .max(600, "Please keep the message within 600 characters.")
});

const adminCreateSchema = z.object({
  name: z
    .string({
      required_error: "Please enter the admin name.",
      invalid_type_error: "Please enter the admin name."
    })
    .min(2, "Please enter at least 2 characters for the name.")
    .max(120, "Please keep the name within 120 characters."),
  email: z
    .string({
      required_error: "Please enter the admin email address.",
      invalid_type_error: "Please enter the admin email address."
    })
    .email("Please enter a valid email address."),
  password: z
    .string({
      required_error: "Please enter a password.",
      invalid_type_error: "Please enter a password."
    })
    .min(8, "Please use at least 8 characters for the password.")
    .max(72, "Password is too long."),
  adminRole: z.enum(ADMIN_ROLES)
});

const adminUpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  adminRole: z.enum(ADMIN_ROLES).optional(),
  accountStatus: z.enum(["active", "suspended", "blocked"]).optional()
});

const adminBulkUserActionSchema = z.object({
  action: z.enum(["SUSPEND", "ACTIVATE", "BLOCK", "VERIFY_HOSPITAL"]),
  ids: z
    .array(z.string().regex(objectIdRegex, "Please provide valid user IDs."))
    .min(1, "Please select at least one user.")
    .max(500, "You can update up to 500 users at a time."),
  reason: z.string().max(300).optional()
});

const adminExportQuerySchema = z.object({
  type: z.enum(["users", "records", "activity", "audit"]),
  mode: z.enum(["current", "filtered", "full"]).default("filtered"),
  filters: z.string().optional()
});

module.exports = {
  qrResolveSchema,
  updateProfileSchema,
  adminAuditQuerySchema,
  adminUserQuerySchema,
  adminUpdateUserStatusSchema,
  adminBroadcastSchema,
  adminCreateSchema,
  adminUpdateSchema,
  adminBulkUserActionSchema,
  adminExportQuerySchema
};
