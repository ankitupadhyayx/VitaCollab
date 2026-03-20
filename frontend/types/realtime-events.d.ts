export type RealtimeEventName =
  | "notification:new"
  | "record:updated"
  | "approval:changed"
  | "chat:message"
  | "admin:user:updated"
  | "admin:record:updated"
  | "admin:audit:new";

export type NotificationEventPayload = {
  id: string;
  type?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: string;
};

export type RecordUpdatedEventPayload = {
  id: string;
  status?: "pending" | "approved" | "rejected";
  updatedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
};

export type ApprovalChangedEventPayload = {
  id: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  updatedAt?: string;
};

export type ChatMessageEventPayload = {
  conversationId: string;
  messageId?: string;
  senderId?: string;
  text: string;
  createdAt?: string;
  deliveryStatus?: "sent" | "delivered" | "read";
};

export type AdminUserUpdatedEventPayload = {
  id: string;
  accountStatus?: "active" | "suspended" | "blocked";
  adminRole?: "SUPER_ADMIN" | "ADMIN" | "MODERATOR";
  deleted?: boolean;
  updatedAt?: string;
};

export type AdminRecordUpdatedEventPayload = {
  id: string;
  status?: "pending" | "approved" | "rejected";
  flaggedSuspicious?: boolean;
  updatedAt?: string;
};

export type AdminAuditNewEventPayload = {
  actionType: string;
  targetType?: "USER" | "RECORD" | "SYSTEM" | "ADMIN";
  targetId?: string | null;
  timestamp?: string;
};

export type RealtimeEventPayloadMap = {
  "notification:new": NotificationEventPayload | NotificationEventPayload[];
  "record:updated": RecordUpdatedEventPayload;
  "approval:changed": ApprovalChangedEventPayload;
  "chat:message": ChatMessageEventPayload;
  "admin:user:updated": AdminUserUpdatedEventPayload;
  "admin:record:updated": AdminRecordUpdatedEventPayload;
  "admin:audit:new": AdminAuditNewEventPayload;
};
