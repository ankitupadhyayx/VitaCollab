const isObject = (value) => typeof value === "object" && value !== null;

export const REALTIME_EVENT_TYPES = {
  NOTIFICATION_NEW: "notification:new",
  RECORD_UPDATED: "record:updated",
  APPROVAL_CHANGED: "approval:changed",
  CHAT_MESSAGE: "chat:message",
  ADMIN_USER_UPDATED: "admin:user:updated",
  ADMIN_RECORD_UPDATED: "admin:record:updated",
  ADMIN_AUDIT_NEW: "admin:audit:new"
};

const validators = {
  [REALTIME_EVENT_TYPES.NOTIFICATION_NEW]: (payload) => {
    if (Array.isArray(payload)) {
      return payload.every((item) => isObject(item) && typeof item.id === "string");
    }
    return isObject(payload) && typeof payload.id === "string";
  },
  [REALTIME_EVENT_TYPES.RECORD_UPDATED]: (payload) => isObject(payload) && typeof payload.id === "string",
  [REALTIME_EVENT_TYPES.APPROVAL_CHANGED]: (payload) => isObject(payload) && typeof payload.id === "string" && typeof payload.status === "string",
  [REALTIME_EVENT_TYPES.CHAT_MESSAGE]: (payload) => isObject(payload) && typeof payload.conversationId === "string" && typeof payload.text === "string",
  [REALTIME_EVENT_TYPES.ADMIN_USER_UPDATED]: (payload) => isObject(payload) && typeof payload.id === "string",
  [REALTIME_EVENT_TYPES.ADMIN_RECORD_UPDATED]: (payload) => isObject(payload) && typeof payload.id === "string",
  [REALTIME_EVENT_TYPES.ADMIN_AUDIT_NEW]: (payload) => isObject(payload) && typeof payload.actionType === "string"
};

export const validateRealtimeEventPayload = (eventName, payload) => {
  const validator = validators[eventName];
  if (!validator) {
    return false;
  }

  return Boolean(validator(payload));
};
