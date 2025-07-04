/**
 * パスワード関連のバリデーション関数群
 */

/**
 * 暗号化パスワードを検証する
 * @param enableEncryption - 暗号化が有効かどうか
 * @param password - パスワード
 * @param confirmPassword - 確認用パスワード
 * @param t - 翻訳オブジェクト
 * @returns エラーメッセージまたはnull
 */
export const validateEncryptionPasswords = (
  enableEncryption: boolean,
  password: string,
  confirmPassword: string,
  t: any
): string | null => {
  if (!enableEncryption) return null;
  if (!password) return t.passwordRequired;
  if (password.length < 8) return t.passwordTooShort;
  if (password !== confirmPassword) return t.passwordMismatch;
  return null;
};