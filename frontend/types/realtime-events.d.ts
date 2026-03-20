export type RealtimeEventName =
  | "notification:new"
  | "record:updated"
  | "approval:changed"
  | "chat:message";

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

export type RealtimeEventPayloadMap = {
  "notification:new": NotificationEventPayload | NotificationEventPayload[];
  "record:updated": RecordUpdatedEventPayload;
  "approval:changed": ApprovalChangedEventPayload;
  "chat:message": ChatMessageEventPayload;
};
