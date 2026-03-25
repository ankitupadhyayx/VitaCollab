const API_VERSION_PREFIX = "/api/v1";
const PRODUCTION_API_ORIGIN = "https://api.vitacollab.in";

export const normalizeApiBaseUrl = (url) => (url || "").trim().replace(/\/+$/, "");

export const ensureVersionedApiBaseUrl = (url) => {
  const normalized = normalizeApiBaseUrl(url);
  if (!normalized) {
    return "";
  }

  return normalized.endsWith(API_VERSION_PREFIX)
    ? normalized
    : `${normalized}${API_VERSION_PREFIX}`;
};

const defaultProductionApiBaseUrl = ensureVersionedApiBaseUrl(PRODUCTION_API_ORIGIN);

export const resolvePublicApiBaseUrl = () => {
  const fromEnv = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

  return ensureVersionedApiBaseUrl(fromEnv || defaultProductionApiBaseUrl);
};

export const resolveServerApiBaseUrl = () => {
  const fromEnv = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

  return ensureVersionedApiBaseUrl(fromEnv || defaultProductionApiBaseUrl);
};

export const API_BASE_URL = resolvePublicApiBaseUrl();
