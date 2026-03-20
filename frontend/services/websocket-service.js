import { validateRealtimeEventPayload } from "@/lib/realtime-event-schema";

const toWebsocketUrl = (apiBaseUrl) => {
  if (!apiBaseUrl) {
    return null;
  }

  try {
    const parsed = new URL(apiBaseUrl);
    parsed.protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
    parsed.pathname = "/ws";
    parsed.search = "";
    return parsed.toString();
  } catch {
    return null;
  }
};

class WebsocketService {
  constructor() {
    this.socket = null;
    this.apiBaseUrl = null;
    this.url = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 6;
    this.listeners = new Map();
    this.fallbacks = new Map();
    this.fallbackTimers = new Map();
    this.connected = false;
  }

  connect(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl || this.apiBaseUrl;
    if (this.connected) {
      return;
    }

    const resolvedUrl = toWebsocketUrl(apiBaseUrl);
    if (!resolvedUrl || typeof window === "undefined" || typeof WebSocket === "undefined") {
      this.startFallbacks();
      return;
    }

    this.url = resolvedUrl;

    try {
      this.socket = new WebSocket(this.url);
    } catch {
      this.startFallbacks();
      return;
    }

    this.socket.onopen = () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      this.stopFallbacks();
    };

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.event && validateRealtimeEventPayload(payload.event, payload.data)) {
          this.emit(payload.event, payload.data);
        }
      } catch {
        // Ignore malformed payloads from upstream.
      }
    };

    this.socket.onerror = () => {
      this.connected = false;
      this.startFallbacks();
    };

    this.socket.onclose = () => {
      this.connected = false;
      this.startFallbacks();
      this.tryReconnect();
    };
  }

  tryReconnect() {
    if (!this.apiBaseUrl || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }
    this.reconnectAttempts += 1;
    const delay = Math.min(1500 * this.reconnectAttempts, 8000);
    window.setTimeout(() => this.connect(this.apiBaseUrl), delay);
  }

  subscribe(eventName, callback) {
    const current = this.listeners.get(eventName) || new Set();
    current.add(callback);
    this.listeners.set(eventName, current);

    return () => {
      const updated = this.listeners.get(eventName);
      if (!updated) {
        return;
      }
      updated.delete(callback);
      if (!updated.size) {
        this.listeners.delete(eventName);
      }
    };
  }

  emit(eventName, payload) {
    if (!validateRealtimeEventPayload(eventName, payload)) {
      return;
    }

    const subscribers = this.listeners.get(eventName);
    if (!subscribers) {
      return;
    }

    subscribers.forEach((handler) => handler(payload));
  }

  registerFallback(eventName, poller, interval = 15000) {
    this.fallbacks.set(eventName, { poller, interval });
    if (!this.connected) {
      this.startFallback(eventName);
    }

    return () => {
      this.fallbacks.delete(eventName);
      const existing = this.fallbackTimers.get(eventName);
      if (existing) {
        clearInterval(existing);
        this.fallbackTimers.delete(eventName);
      }
    };
  }

  startFallback(eventName) {
    const config = this.fallbacks.get(eventName);
    if (!config || this.fallbackTimers.has(eventName)) {
      return;
    }

    const run = async () => {
      try {
        const data = await config.poller();
        this.emit(eventName, data);
      } catch {
        // Keep fallback resilient to transient failures.
      }
    };

    run();
    const timer = setInterval(run, config.interval);
    this.fallbackTimers.set(eventName, timer);
  }

  startFallbacks() {
    this.fallbacks.forEach((_, eventName) => this.startFallback(eventName));
  }

  stopFallbacks() {
    this.fallbackTimers.forEach((timer) => clearInterval(timer));
    this.fallbackTimers.clear();
  }
}

export const websocketService = new WebsocketService();
