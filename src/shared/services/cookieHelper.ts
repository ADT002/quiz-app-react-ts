type SetCookieFn = (name: string, value: unknown, options?: Record<string, unknown>) => void;

export const setCookieWithExpiry = (
  setCookie: SetCookieFn,
  key: string,
  value: unknown,
  options: Record<string, unknown> = {},
) => {
  const defaultOptions = {
    path: '/',
    ...options,
  };

  const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;

  setCookie(key, valueToStore, defaultOptions);
};

export const getCookieValue = (cookies: Record<string, string>, key: string) => {
  const value = cookies[key];
  try {
    return value ? value : null;
  } catch (error) {
    console.error(`Error parsing cookie value for key "${key}":`, error);
    return null;
  }
};

export const isCookieExpired = (expireDate: Date) => {
  const currentTime = new Date().getTime();
  return expireDate.getTime() < currentTime;
};
