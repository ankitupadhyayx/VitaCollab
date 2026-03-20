const isObject = (value) => typeof value === "object" && value !== null;

export const REALTIME_EVENT_TYPES = {
  NOTIFICATION_NEW: "notification:new",
  RECORD_UPDATED: "record:updated",
  APPROVAL_CHANGED: "approval:changed",
  CHAT_MESSAGE: "chat:message"
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
  [REALTIME_EVENT_TYPES.CHAT_MESSAGE]: (payload) => isObject(payload) && typeof payload.conversationId === "string" && typeof payload.text === "string"
};

export const validateRealtimeEventPayload = (eventName, payload) => {
  const validator = validators[eventName];
  if (!validator) {
    return false;
  }

  return Boolean(validator(payload));
};
