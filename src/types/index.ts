// ZipSig共通型定義

export interface FileStructureItem {
  path: string;
  size: number;
  iv?: string;
  salt?: string;
  encrypted?: boolean;
}

export interface TreeNode {
  name: string;
  path: string;
  isFile: boolean;
  size?: number;
  children: TreeNode[];
  encrypted?: boolean;
}

export interface ZipsigData {
  creator_id: string;
  timestamp: string;
  file_hash: string;
  signature: string;
  public_key: string;
  tool: string;
  file_structure?: FileStructureItem[];
  encrypted?: boolean;
}

export type Mode = 'sign' | 'verify' | 'extract' | 'faq';
export type Language = 'ja' | 'en';

// 検証結果の型
export interface VerificationResult {
  isValid: boolean;
  zipsig: ZipsigData | null;
  message: string;
}

// 時刻API状態の型
export interface TimeStatus {
  utcTime: string;
  localTime: string;
  apiStatus: 'checking' | 'online' | 'offline';
}

// ファイルの型
export interface FileWithRelativePath extends File {
  webkitRelativePath: string;
}