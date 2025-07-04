import type { Language } from '../translations';

/**
 * ブラウザの言語設定からデフォルト言語を取得する
 * @returns 'ja' または 'en'
 */
export const getDefaultLanguage = (): Language => {
  const browserLanguage = navigator.language || navigator.languages[0];
  return browserLanguage.startsWith('ja') ? 'ja' : 'en';
};