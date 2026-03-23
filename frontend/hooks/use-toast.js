"use client";

import { useMemo } from "react";
import { toast } from "sonner";

export const useToast = () =>
  useMemo(
    () => ({
      success: (message, options) => toast.success(message, options),
      error: (message, options) => toast.error(message, options),
      info: (message, options) => toast.info(message, options)
    }),
    []
  );
