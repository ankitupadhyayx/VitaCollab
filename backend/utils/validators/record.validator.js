const { z } = require("zod");
const { RECORD_TYPES } = require("../../models/record.model");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createRecordSchema = z.object({
  patientId: z
    .string()
    .min(3)
    .refine((value) => objectIdRegex.test(value) || z.string().email().safeParse(value).success, {
      message: "patientId must be a valid patient id or email"
    }),
  type: z.enum(RECORD_TYPES),
  description: z.string().min(4).max(2000),
  recordDate: z.string().datetime().optional()
});

const listRecordQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  type: z.enum(RECORD_TYPES).optional(),
  search: z.string().max(100).optional(),
  patientId: z.string().regex(objectIdRegex).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
});

const decisionSchema = z
  .object({
    decision: z.enum(["approved", "rejected"]),
    rejectionReason: z.string().max(1000).optional()
  })
  .superRefine((value, ctx) => {
    if (value.decision === "rejected" && !value.rejectionReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rejectionReason"],
        message: "rejectionReason is required when decision is rejected"
      });
    }
  });

const adminRecordActionSchema = z
  .object({
    action: z.enum(["approved", "rejected", "flag_suspicious"]),
    rejectionReason: z.string().max(1000).optional(),
    flagReason: z.string().max(500).optional()
  })
  .superRefine((value, ctx) => {
    if (value.action === "rejected" && !value.rejectionReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rejectionReason"],
        message: "rejectionReason is required when action is rejected"
      });
    }

    if (value.action === "flag_suspicious" && !value.flagReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["flagReason"],
        message: "flagReason is required when action is flag_suspicious"
      });
    }
  });

const adminBulkRecordActionSchema = z
  .object({
    action: z.enum(["APPROVE", "REJECT", "FLAG"]),
    ids: z.array(z.string().regex(objectIdRegex)).min(1).max(500),
    rejectionReason: z.string().max(1000).optional(),
    flagReason: z.string().max(500).optional()
  })
  .superRefine((value, ctx) => {
    if (value.action === "REJECT" && !value.rejectionReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rejectionReason"],
        message: "rejectionReason is required when action is REJECT"
      });
    }

    if (value.action === "FLAG" && !value.flagReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["flagReason"],
        message: "flagReason is required when action is FLAG"
      });
    }
  });

module.exports = {
  createRecordSchema,
  listRecordQuerySchema,
  decisionSchema,
  adminRecordActionSchema,
  adminBulkRecordActionSchema
};
