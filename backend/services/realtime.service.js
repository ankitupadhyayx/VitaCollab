const { EventEmitter } = require("events");

const ADMIN_EVENTS = {
  USER_UPDATED: "admin:user:updated",
  RECORD_UPDATED: "admin:record:updated",
  AUDIT_NEW: "admin:audit:new"
};

class RealtimeBroker {
  constructor() {
    this.emitter = new EventEmitter();
    this.clients = new Set();
  }

  registerClient(client) {
    this.clients.add(client);
    return () => {
      this.clients.delete(client);
    };
  }

  publish(event, data) {
    this.emitter.emit(event, data);

    const payload = JSON.stringify({ event, data });
    this.clients.forEach((client) => {
      try {
        if (client.readyState === 1) {
          client.send(payload);
        }
      } catch {
        // Ignore client disconnect races.
      }
    });
  }
}

const realtimeBroker = new RealtimeBroker();

module.exports = {
  ADMIN_EVENTS,
  realtimeBroker
};
