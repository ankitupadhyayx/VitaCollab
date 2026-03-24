const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const tokenRegex = /^[a-fA-F0-9]{64}$/;

const createShareLinkSchema = z
  .object({
    expiresInMinutes: z.coerce.number().int().min(15).max(30).optional(),
    recipientBound: z.boolean().optional(),
    oneTimeUse: z.boolean().optional(),
    maxUses: z.coerce.number().int().min(1).max(3).optional(),
    recipientEmail: z.string().email().max(254).optional(),
    recipientUserId: z.string().regex(objectIdRegex, "Please provide a valid recipient user ID.").optional()
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.oneTimeUse === true && typeof value.maxUses !== "undefined" && value.maxUses !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxUses"],
        message: "maxUses must be 1 when oneTimeUse is enabled."
      });
    }

    if (value.recipientBound === true && !value.recipientUserId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recipientUserId"],
        message: "recipientUserId is required when recipientBound mode is enabled."
      });
    }
  });

const shareTokenParamSchema = z
  .object({
    token: z.string().regex(tokenRegex, "Invalid share token format.")
  })
  .strict();

const revokeShareLinkParamSchema = z
  .object({
    shareId: z.string().regex(objectIdRegex, "Please provide a valid share link ID.")
  })
  .strict();

const fileAccessParamSchema = z
  .object({
    id: z.string().regex(objectIdRegex, "Please provide a valid file ID.")
  })
  .strict();

const fileAccessQuerySchema = z
  .object({
    download: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((value) => {
        if (typeof value === "undefined") {
          return false;
        }
        if (typeof value === "boolean") {
          return value;
        }
        return ["1", "true", "yes"].includes(String(value).toLowerCase());
      })
  })
  .strict();

module.exports = {
  createShareLinkSchema,
  shareTokenParamSchema,
  revokeShareLinkParamSchema,
  fileAccessParamSchema,
  fileAccessQuerySchema
};
