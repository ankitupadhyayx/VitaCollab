let inMemoryAccessToken = null;

export const getAccessTokenInMemory = () => inMemoryAccessToken;

export const setAccessTokenInMemory = (value) => {
  inMemoryAccessToken = value || null;
};
