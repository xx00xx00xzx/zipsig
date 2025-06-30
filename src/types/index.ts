// File structure types
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

// ZipSig data types
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

// Application modes
export type Mode = 'sign' | 'verify' | 'extract' | 'faq';

// Verification result
export interface VerificationResult {
  isValid: boolean;
  zipsig: ZipsigData | null;
  message: string;
}

// Time status
export interface TimeStatus {
  utcTime: string;
  localTime: string;
  apiStatus: 'checking' | 'online' | 'offline';
}

// Extended File type with webkitRelativePath
export interface FileWithRelativePath extends File {
  webkitRelativePath: string;
}