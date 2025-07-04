import { useState, useCallback } from 'react';
import { zipSync } from 'fflate';
import { decryptFile } from '../utils/crypto';
import type { ZipsigData } from '../types';

export const useExtraction = () => {
  const [extractPassword, setExtractPassword] = useState('');
  const [extractedFiles, setExtractedFiles] = useState<{[path: string]: Uint8Array}>({});
  const [extractedZipsig, setExtractedZipsig] = useState<ZipsigData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const extractAndDecrypt = useCallback(async (t: any) => {
    if (!extractedZipsig || !extractPassword) return;
    
    setIsExtracting(true);
    try {
      const decryptedFiles: {[path: string]: Uint8Array} = {};
      
      for (const [path, encryptedData] of Object.entries(extractedFiles)) {
        if (extractedZipsig.encrypted && extractedZipsig.file_structure) {
          // Find file metadata
          const fileInfo = extractedZipsig.file_structure.find(f => f.path === path);
          if (fileInfo && fileInfo.encrypted && fileInfo.iv && fileInfo.salt) {
            try {
              const iv = Uint8Array.from(atob(fileInfo.iv), c => c.charCodeAt(0));
              const salt = Uint8Array.from(atob(fileInfo.salt), c => c.charCodeAt(0));
              
              const decryptedData = await decryptFile(encryptedData, extractPassword, salt, iv);
              decryptedFiles[path] = decryptedData;
            } catch (error) {
              console.error(`Failed to decrypt ${path}:`, error);
              alert(`${t.decryptionFailed}: ${path}`);
              setIsExtracting(false);
              return;
            }
          } else {
            // File is not encrypted
            decryptedFiles[path] = encryptedData;
          }
        } else {
          // No encryption
          decryptedFiles[path] = encryptedData;
        }
      }
      
      // Create a new ZIP file with decrypted content maintaining folder structure
      const zipFileData: { [path: string]: Uint8Array } = {};
      Object.entries(decryptedFiles).forEach(([path, data]) => {
        zipFileData[path] = data;
      });

      // Generate filename based on folder name or fallback
      const folderName = extractedZipsig.creator_id || 'files';
      const zipFileName = `${folderName}_extracted.zip`;

      // Create ZIP file
      const zipBlob = new Blob([zipSync(zipFileData)], { type: 'application/zip' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const zipLink = document.createElement('a');
      zipLink.href = zipUrl;
      zipLink.download = zipFileName;
      document.body.appendChild(zipLink);
      zipLink.click();
      document.body.removeChild(zipLink);
      URL.revokeObjectURL(zipUrl);
      
    } catch (error) {
      alert(`${t.error}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExtracting(false);
    }
  }, [extractedZipsig, extractPassword, extractedFiles]);

  return {
    extractPassword,
    setExtractPassword,
    extractedFiles,
    setExtractedFiles,
    extractedZipsig,
    setExtractedZipsig,
    isExtracting,
    setIsExtracting,
    extractAndDecrypt
  };
};