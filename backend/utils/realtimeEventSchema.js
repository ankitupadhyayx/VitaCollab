const REALTIME_EVENTS = {
  NOTIFICATION_NEW: "notification:new",
  RECORD_UPDATED: "record:updated",
  APPROVAL_CHANGED: "approval:changed",
  CHAT_MESSAGE: "chat:message",
  ADMIN_USER_UPDATED: "admin:user:updated",
  ADMIN_RECORD_UPDATED: "admin:record:updated",
  ADMIN_AUDIT_NEW: "admin:audit:new"
};

const isObject = (value) => typeof value === "object" && value !== null;

const validators = {
  [REALTIME_EVENTS.NOTIFICATION_NEW]: (payload) => isObject(payload) && typeof payload.id === "string",
  [REALTIME_EVENTS.RECORD_UPDATED]: (payload) => isObject(payload) && typeof payload.id === "string",
  [REALTIME_EVENTS.APPROVAL_CHANGED]: (payload) => isObject(payload) && typeof payload.id === "string" && typeof payload.status === "string",
  [REALTIME_EVENTS.CHAT_MESSAGE]: (payload) => isObject(payload) && typeof payload.conversationId === "string" && typeof payload.text === "string",
  [REALTIME_EVENTS.ADMIN_USER_UPDATED]: (payload) => isObject(payload) && typeof payload.id === "string",
  [REALTIME_EVENTS.ADMIN_RECORD_UPDATED]: (payload) => isObject(payload) && typeof payload.id === "string",
  [REALTIME_EVENTS.ADMIN_AUDIT_NEW]: (payload) => isObject(payload) && typeof payload.actionType === "string"
};

const validateRealtimeEvent = (eventName, payload) => {
  const validator = validators[eventName];
  if (!validator) {
    return false;
  }

  return Boolean(validator(payload));
};

module.exports = {
  REALTIME_EVENTS,
  validateRealtimeEvent
};
