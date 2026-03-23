const { z } = require("zod");
const { BLOOD_GROUPS } = require("../../models/user.model");
const { AUTH_MESSAGES } = require("../authMessages");

const emailSchema = z
  .string({
    required_error: AUTH_MESSAGES.EMAIL_REQUIRED,
    invalid_type_error: AUTH_MESSAGES.EMAIL_REQUIRED
  })
  .trim()
  .min(1, AUTH_MESSAGES.EMAIL_REQUIRED)
  .email(AUTH_MESSAGES.INVALID_EMAIL)
  .toLowerCase();

const passwordSchema = z
  .string({
    required_error: AUTH_MESSAGES.PASSWORD_REQUIRED,
    invalid_type_error: AUTH_MESSAGES.PASSWORD_REQUIRED
  })
  .min(8, AUTH_MESSAGES.PASSWORD_MIN_LENGTH)
  .max(72, AUTH_MESSAGES.PASSWORD_TOO_LONG);

const registerSchema = z
  .object({
    name: z
      .string({
        required_error: AUTH_MESSAGES.SIGNUP_NAME_REQUIRED,
        invalid_type_error: AUTH_MESSAGES.SIGNUP_NAME_REQUIRED
      })
      .trim()
      .min(2, AUTH_MESSAGES.SIGNUP_NAME_REQUIRED)
      .max(120),
    email: emailSchema,
    password: passwordSchema,
    role: z.enum(["patient", "hospital"]).default("patient"),
    age: z.coerce.number().int().min(0).max(140).optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    bloodGroup: z.enum(BLOOD_GROUPS).optional(),
    phone: z.string().trim().min(6).max(20).optional(),
    hospitalName: z.string().trim().min(2).max(180).optional(),
    licenseNumber: z.string().trim().min(3).max(80).optional(),
    specialization: z.string().trim().min(2).max(160).optional(),
    address: z.string().trim().min(5).max(260).optional()
  })
  .superRefine((value, ctx) => {
    if (value.role === "patient") {
      if (typeof value.age === "undefined") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["age"],
          message: AUTH_MESSAGES.AGE_REQUIRED_PATIENT
        });
      }
      if (!value.gender) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gender"],
          message: AUTH_MESSAGES.GENDER_REQUIRED_PATIENT
        });
      }
      if (!value.bloodGroup) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bloodGroup"],
          message: AUTH_MESSAGES.BLOOD_GROUP_REQUIRED_PATIENT
        });
      }
      if (!value.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: AUTH_MESSAGES.PHONE_REQUIRED_PATIENT
        });
      }
    }

    if (value.role === "hospital") {
      const required = [
        ["hospitalName", AUTH_MESSAGES.HOSPITAL_NAME_REQUIRED],
        ["licenseNumber", AUTH_MESSAGES.LICENSE_NUMBER_REQUIRED],
        ["specialization", AUTH_MESSAGES.SPECIALIZATION_REQUIRED],
        ["address", AUTH_MESSAGES.ADDRESS_REQUIRED],
        ["phone", AUTH_MESSAGES.PHONE_REQUIRED_HOSPITAL]
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
  password: z
    .string({
      required_error: AUTH_MESSAGES.LOGIN_PASSWORD_REQUIRED,
      invalid_type_error: AUTH_MESSAGES.LOGIN_PASSWORD_REQUIRED
    })
    .min(1, AUTH_MESSAGES.LOGIN_PASSWORD_REQUIRED)
});

const emailOnlySchema = z.object({
  email: emailSchema
});

const resetPasswordSchema = z.object({
  token: z
    .string({
      required_error: AUTH_MESSAGES.RESET_TOKEN_REQUIRED,
      invalid_type_error: AUTH_MESSAGES.RESET_TOKEN_REQUIRED
    })
    .trim()
    .min(20, AUTH_MESSAGES.RESET_TOKEN_INVALID_OR_EXPIRED),
  newPassword: z
    .string({
      required_error: AUTH_MESSAGES.RESET_PASSWORD_REQUIRED,
      invalid_type_error: AUTH_MESSAGES.RESET_PASSWORD_REQUIRED
    })
    .min(8, AUTH_MESSAGES.PASSWORD_MIN_LENGTH)
    .max(72, AUTH_MESSAGES.PASSWORD_TOO_LONG)
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
