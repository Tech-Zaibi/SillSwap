// DEMO ONLY. This is not real security. A real backend must use bcrypt or argon2.
export const hashPassword = (text) => btoa(encodeURIComponent(text));
