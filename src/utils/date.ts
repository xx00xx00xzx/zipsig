// 日付・時刻フォーマットユーティリティ

import type { Language } from '../translations';

/**
 * 言語に応じて日時をフォーマットする
 * @param dateString - ISO形式の日時文字列
 * @param language - 言語設定
 * @param timeZone - タイムゾーン（オプション）
 * @returns フォーマットされた日時文字列
 */
export const formatDateTime = (
  dateString: string, 
  language: Language, 
  timeZone?: string
): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const locale = language === 'ja' ? 'ja-JP' : 'en-US';
    const options: Intl.DateTimeFormatOptions = timeZone ? { timeZone } : {};
    
    return date.toLocaleString(locale, options);
  } catch {
    return '';
  }
};

/**
 * UTC時刻をフォーマットする
 * @param dateString - ISO形式の日時文字列
 * @param language - 言語設定
 * @returns UTC時刻としてフォーマットされた文字列
 */
export const formatUTCDateTime = (dateString: string, language: Language): string => {
  return formatDateTime(dateString, language, 'UTC');
};

/**
 * ローカル時刻をフォーマットする
 * @param dateString - ISO形式の日時文字列
 * @param language - 言語設定
 * @returns ローカル時刻としてフォーマットされた文字列
 */
export const formatLocalDateTime = (dateString: string, language: Language): string => {
  return formatDateTime(dateString, language);
};

/**
 * 日本語ロケールで日時をフォーマットする（後方互換性のため）
 * @param dateString - ISO形式の日時文字列
 * @returns 日本語でフォーマットされた日時文字列
 */
export const formatDateTimeJP = (dateString: string): string => {
  return formatDateTime(dateString, 'ja');
};