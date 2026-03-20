const { z } = require("zod");

const qrResolveSchema = z.object({
  token: z.string().min(20)
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
  user: z.string().regex(objectIdRegex).optional(),
  action: z.string().min(2).max(100).optional(),
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
  message: z.string().min(10).max(600)
});

module.exports = {
  qrResolveSchema,
  updateProfileSchema,
  adminAuditQuerySchema,
  adminUserQuerySchema,
  adminUpdateUserStatusSchema,
  adminBroadcastSchema
};
