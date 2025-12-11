// src/utils/tokenStorage.js
const STORAGE_KEY = "ic_t"; // Not obvious like "token"

export const saveToken = (token) => {
  try {
    const encoded = window.btoa(token); // base64 encoding
    localStorage.setItem(STORAGE_KEY, encoded);
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

export const clearToken = () => {
  localStorage.removeItem(STORAGE_KEY);
};
