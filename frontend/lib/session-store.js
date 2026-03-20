const ACCESS_TOKEN_KEY = "vc_access_token";
const REMEMBER_SESSION_KEY = "vc_remember_session";

export const getRememberSession = () => {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(REMEMBER_SESSION_KEY) !== "false";
};

export const setRememberSession = (value) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(REMEMBER_SESSION_KEY, value ? "true" : "false");
};

export const getStoredAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY) || window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setStoredAccessToken = (value, remember = getRememberSession()) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!value) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  if (remember) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, value);
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } else {
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, value);
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};
