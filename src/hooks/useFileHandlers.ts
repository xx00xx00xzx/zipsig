import { useCallback } from 'react';
import { unzipSync } from 'fflate';
import type { ZipsigData } from '../types';

interface UseFileHandlersOptions {
  setFiles: (files: File[]) => void;
  setFolderName: (name: string) => void;
  setVerificationResult: (result: any) => void;
  setExtractedZipsig: (zipsig: ZipsigData | null) => void;
  setExtractedFiles: (files: {[path: string]: Uint8Array}) => void;
  t: any;
}

/**
 * ファイル・フォルダ選択および抽出処理のイベントハンドラーを管理するカスタムフック
 */
export const useFileHandlers = ({
  setFiles,
  setFolderName,
  setVerificationResult,
  setExtractedZipsig,
  setExtractedFiles,
  t
}: UseFileHandlersOptions) => {
  
  const handleFolderSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const filesArray = Array.from(fileList);
      setFiles(filesArray);
      setVerificationResult(null);
      
      if (filesArray.length > 0 && (filesArray[0] as any).webkitRelativePath) {
        const relativePath = (filesArray[0] as any).webkitRelativePath;
        const folderName = relativePath.split('/')[0];
        setFolderName(folderName);
      } else {
        setFolderName('Selected Folder');
      }
    }
  }, [setFiles, setFolderName, setVerificationResult]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const filesArray = Array.from(fileList);
      setFiles(filesArray);
      setVerificationResult(null);
      setFolderName('');
    }
  }, [setFiles, setFolderName, setVerificationResult]);

  const handleExtractDrop = useCallback(async (droppedFiles: File[]) => {
    const zipFile = droppedFiles[0];
    if (!zipFile || !zipFile.name.endsWith('.zip')) return;

    try {
      const arrayBuffer = await zipFile.arrayBuffer();
      const unzipped = unzipSync(new Uint8Array(arrayBuffer));
      
      const zipsigEntry = Object.entries(unzipped).find(([name]) => name === '.zipsig');
      if (!zipsigEntry) {
        alert(t.noZipsigFile);
        return;
      }

      const zipsigText = new TextDecoder().decode(zipsigEntry[1]);
      const zipsig: ZipsigData = JSON.parse(zipsigText);
      
      setExtractedZipsig(zipsig);
      
      // Extract files (without .zipsig)
      const files: {[path: string]: Uint8Array} = {};
      Object.entries(unzipped).forEach(([path, data]) => {
        if (path !== '.zipsig') {
          files[path] = data;
        }
      });
      
      setExtractedFiles(files);
    } catch (error) {
      alert(`${t.error}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [setExtractedZipsig, setExtractedFiles, t]);

  return {
    handleFolderSelect,
    handleFileSelect,
    handleExtractDrop
  };
};