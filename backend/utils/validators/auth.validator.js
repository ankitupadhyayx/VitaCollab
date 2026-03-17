const { z } = require("zod");
const { BLOOD_GROUPS } = require("../../models/user.model");

const emailSchema = z.string().email().toLowerCase().trim();

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long");

const registerSchema = z
  .object({
    name: z.string().min(2).max(120),
    email: emailSchema,
    password: passwordSchema,
    role: z.enum(["patient", "hospital"]).default("patient"),
    age: z.coerce.number().int().min(0).max(140).optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    bloodGroup: z.enum(BLOOD_GROUPS).optional(),
    phone: z.string().min(6).max(20).optional(),
    hospitalName: z.string().min(2).max(180).optional(),
    licenseNumber: z.string().min(3).max(80).optional(),
    specialization: z.string().min(2).max(160).optional(),
    address: z.string().min(5).max(260).optional()
  })
  .superRefine((value, ctx) => {
    if (value.role === "patient") {
      if (typeof value.age === "undefined") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["age"],
          message: "age is required for patient"
        });
      }
      if (!value.gender) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gender"],
          message: "gender is required for patient"
        });
      }
      if (!value.bloodGroup) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bloodGroup"],
          message: "bloodGroup is required for patient"
        });
      }
      if (!value.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "phone is required for patient"
        });
      }
    }

    if (value.role === "hospital") {
      const required = [
        ["hospitalName", "hospitalName is required for hospital"],
        ["licenseNumber", "licenseNumber is required for hospital"],
        ["specialization", "specialization is required for hospital"],
        ["address", "address is required for hospital"],
        ["phone", "phone is required for hospital"]
      ];

      required.forEach(([field, message]) => {
        if (!value[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message
          });
        }
      });
    }
  });

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

const emailOnlySchema = z.object({
  email: emailSchema
});

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  newPassword: passwordSchema
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  emailOnlySchema,
  resetPasswordSchema,
  refreshSchema
};
