// src/utils/tokenStorage.js
const STORAGE_KEY = "ic_t";

// 🔐 in-memory fingerprint (not visible in DevTools)
let trustedEncodedToken = null;

export const saveToken = (token) => {
  try {
    const encoded = window.btoa(token);
    localStorage.setItem(STORAGE_KEY, encoded);
    trustedEncodedToken = encoded; // snapshot in memory
  } catch {}
};

export const loadToken = () => {
  try {
    const encoded = localStorage.getItem(STORAGE_KEY);
    if (!encoded) return null;
    return window.atob(encoded);
  } catch {
    return null;
  }
};

export const hasTokenChanged = () => {
  const current = localStorage.getItem(STORAGE_KEY);

  // if we once trusted a token and it changes → tamper
  if (trustedEncodedToken && current !== trustedEncodedToken) {
    return true;
  }

  return false;
};

export const clearToken = () => {
  localStorage.removeItem(STORAGE_KEY);
  trustedEncodedToken = null;
};
