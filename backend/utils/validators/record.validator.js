const { z } = require("zod");
const { RECORD_TYPES } = require("../../models/record.model");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createRecordSchema = z.object({
  patientId: z
    .string({
      required_error: "Please provide a patient ID or email address.",
      invalid_type_error: "Please provide a patient ID or email address."
    })
    .min(3, "Please provide a patient ID or email address.")
    .refine((value) => objectIdRegex.test(value) || z.string().email().safeParse(value).success, {
      message: "Please provide a valid patient ID or email address."
    }),
  type: z.enum(RECORD_TYPES),
  description: z
    .string({
      required_error: "Please enter a record description.",
      invalid_type_error: "Please enter a record description."
    })
    .min(4, "Please enter at least 4 characters in the description.")
    .max(2000, "Please keep the description within 2000 characters."),
  recordDate: z.string().datetime().optional()
});

const listRecordQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  type: z.enum(RECORD_TYPES).optional(),
  search: z.string().max(100).optional(),
  patientId: z.string().regex(objectIdRegex, "Please provide a valid patient ID.").optional(),
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
        message: "Please provide a rejection reason when rejecting a record."
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
        message: "Please provide a rejection reason when rejecting a record."
      });
    }

    if (value.action === "flag_suspicious" && !value.flagReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["flagReason"],
        message: "Please provide a reason when flagging a record as suspicious."
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
        message: "Please provide a rejection reason when rejecting records."
      });
    }

    if (value.action === "FLAG" && !value.flagReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["flagReason"],
        message: "Please provide a reason when flagging records."
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
