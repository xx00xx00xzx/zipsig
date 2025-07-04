import { useState, useCallback } from 'react';
import { unzipSync } from 'fflate';
import type { ZipsigData, VerificationResult } from '../types';

export const useVerification = () => {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const verifySignature = useCallback(async (droppedFiles: File[], t: any) => {
    const zipFile = droppedFiles[0];
    if (!zipFile || !zipFile.name.endsWith('.zip')) return;

    try {
      const arrayBuffer = await zipFile.arrayBuffer();
      const unzipped = unzipSync(new Uint8Array(arrayBuffer));
      
      const zipsigEntry = Object.entries(unzipped).find(([name]) => name === '.zipsig');
      if (!zipsigEntry) {
        setVerificationResult({
          isValid: false,
          zipsig: null,
          message: t.noZipsigFile
        });
        return;
      }

      const zipsig: ZipsigData = JSON.parse(new TextDecoder().decode(zipsigEntry[1]));
      
      const filesToHash = Object.entries(unzipped)
        .filter(([name]) => name !== '.zipsig')
        .sort(([a], [b]) => a.localeCompare(b));
      
      const combinedData = new Uint8Array(
        filesToHash.reduce((acc, [, data]) => acc + data.length, 0)
      );
      
      let offset = 0;
      for (const [, data] of filesToHash) {
        combinedData.set(data, offset);
        offset += data.length;
      }
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', combinedData);
      const calculatedHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      if (calculatedHash !== zipsig.file_hash) {
        setVerificationResult({
          isValid: false,
          zipsig,
          message: t.fileModified
        });
        return;
      }

      const publicKeyPem = zipsig.public_key
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\s/g, '');
      
      const publicKeyBuffer = Uint8Array.from(atob(publicKeyPem), c => c.charCodeAt(0));
      const publicKey = await crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        { name: 'RSA-PSS', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const signatureBuffer = Uint8Array.from(atob(zipsig.signature), c => c.charCodeAt(0));
      
      // Try both verification methods for backward compatibility
      let isValid = false;
      
      // First try the new method (JSON signature)
      if (zipsig.file_structure !== undefined || zipsig.encrypted !== undefined) {
        try {
          const { signature, public_key, ...dataToVerifyObj } = zipsig;
          // Ensure consistent JSON serialization
          const orderedObj = {
            creator_id: dataToVerifyObj.creator_id,
            timestamp: dataToVerifyObj.timestamp,
            file_hash: dataToVerifyObj.file_hash,
            tool: dataToVerifyObj.tool,
            ...(dataToVerifyObj.file_structure && { file_structure: dataToVerifyObj.file_structure }),
            ...(dataToVerifyObj.encrypted !== undefined && { encrypted: dataToVerifyObj.encrypted })
          };
          const dataToVerify = new TextEncoder().encode(JSON.stringify(orderedObj));
          
          isValid = await crypto.subtle.verify(
            { name: 'RSA-PSS', saltLength: 32 },
            publicKey,
            signatureBuffer,
            dataToVerify
          );
        } catch (e) {
          // console.warn('New verification method failed, trying legacy method');
        }
      }
      
      // If new method failed or not applicable, try legacy method
      if (!isValid) {
        const dataToVerify = new TextEncoder().encode(
          zipsig.creator_id + zipsig.timestamp + zipsig.file_hash
        );
        
        isValid = await crypto.subtle.verify(
          { name: 'RSA-PSS', saltLength: 32 },
          publicKey,
          signatureBuffer,
          dataToVerify
        );
      }

      setVerificationResult({
        isValid,
        zipsig,
        message: isValid 
          ? t.verificationSuccess
          : t.invalidSignature
      });
    } catch (error) {
      setVerificationResult({
        isValid: false,
        zipsig: null,
        message: `${t.error}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }, []);

  return {
    verificationResult,
    setVerificationResult,
    verifySignature
  };
};