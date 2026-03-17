"use client";

import { toast } from "sonner";

export const useToast = () => ({
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast.info(message)
});
