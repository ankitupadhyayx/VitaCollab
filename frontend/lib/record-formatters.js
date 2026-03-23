import { Activity, FileBarChart2, FileHeart } from "lucide-react";

const STATUS_MAP = {
  approved: {
    key: "approved",
    label: "Approved",
    badgeClass: "bg-success/15 text-success"
  },
  pending: {
    key: "pending",
    label: "Pending",
    badgeClass: "bg-warning/15 text-warning"
  },
  rejected: {
    key: "rejected",
    label: "Rejected",
    badgeClass: "bg-danger/15 text-danger"
  }
};

export const normalizeRecordStatus = (status) => {
  const normalized = String(status || "").toLowerCase();
  return STATUS_MAP[normalized]?.key || "pending";
};

export const getRecordStatusMeta = (status) => {
  const key = normalizeRecordStatus(status);
  return STATUS_MAP[key];
};

export const formatRecordDate = (value, fallback = "-") => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleString();
};

export const formatRecordShortDate = (value, fallback = "-") => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString();
};

export const getRecordTypeIcon = (type) => {
  const normalized = String(type || "").toLowerCase();
  if (["lab", "report", "diagnosis"].includes(normalized)) {
    return FileBarChart2;
  }

  if (normalized === "bill") {
    return FileHeart;
  }

  return Activity;
};
