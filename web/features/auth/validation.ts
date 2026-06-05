export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: "Şifre en az 8 karakter olmalıdır." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Şifre en az bir büyük harf içermelidir." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Şifre en az bir rakam içermelidir." };
  }
  return { valid: true, message: "" };
}

export function validateDisplayName(name: string): { valid: boolean; message: string } {
  const t = name.trim();
  if (t.length < 2) {
    return { valid: false, message: "İsim en az 2 karakter olmalıdır." };
  }
  return { valid: true, message: "" };
}
