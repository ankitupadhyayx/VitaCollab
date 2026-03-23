const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createReviewSchema = z.object({
  target: z.enum(["hospital", "platform"]),
  targetHospitalId: z.string().regex(objectIdRegex, "Please provide a valid hospital ID.").optional(),
  rating: z.coerce.number().int().min(1, "Please provide a rating between 1 and 5.").max(5, "Please provide a rating between 1 and 5."),
  comment: z
    .string({
      required_error: "Please write your feedback.",
      invalid_type_error: "Please write your feedback."
    })
    .trim()
    .min(5, "Please write at least 5 characters.")
    .max(1200, "Please keep feedback within 1200 characters.")
}).superRefine((value, ctx) => {
  if (value.target === "hospital" && !value.targetHospitalId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["targetHospitalId"],
      message: "Please select a hospital."
    });
  }
});

const listPublicReviewsQuerySchema = z.object({
  target: z.enum(["hospital", "platform"]).optional(),
  hospitalId: z.string().regex(objectIdRegex, "Please provide a valid hospital ID.").optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

const adminListReviewsQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

const adminModerateReviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  moderationNote: z.string().max(300).optional()
});

module.exports = {
  createReviewSchema,
  listPublicReviewsQuerySchema,
  adminListReviewsQuerySchema,
  adminModerateReviewSchema
};
