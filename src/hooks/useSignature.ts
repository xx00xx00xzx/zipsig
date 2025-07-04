import { useState, useCallback } from 'react';
import { strToU8, zipSync } from 'fflate';
import { encryptFile } from '../utils/crypto';
import type { FileStructureItem, ZipsigData } from '../types';

interface UseSignatureOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useSignature = (options?: UseSignatureOptions) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSignedZip = useCallback(async (
    files: File[],
    creatorId: string,
    folderName: string,
    enableEncryption: boolean,
    encryptionPassword: string,
    encryptionPasswordConfirm: string
  ) => {
    if (!creatorId || files.length === 0) return;
    if (enableEncryption && (!encryptionPassword || encryptionPassword !== encryptionPasswordConfirm)) return;
    
    setIsGenerating(true);
    try {
      let timestamp: string;
      
      // Try to get UTC time with unlimited retries - critical for signature integrity
      const getTimestamp = async (retryCount = 0): Promise<string> => {
        const retryDelay = Math.min(2000 * Math.pow(1.5, retryCount), 30000); // Max 30s delay
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
          
          const timeResponse = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (!timeResponse.ok) {
            throw new Error(`HTTP ${timeResponse.status}`);
          }
          
          const timeData = await timeResponse.json();
          // console.log(`UTC timestamp retrieved successfully on attempt ${retryCount + 1}`);
          return timeData.datetime.split('.')[0] + 'Z';
        } catch (error) {
          // console.warn(`Timestamp API attempt ${retryCount + 1} failed:`, error);
          // console.log(`Will retry in ${retryDelay}ms...`);
          
          // Wait before retry - this will continue indefinitely until success
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return getTimestamp(retryCount + 1);
        }
      };
      
      timestamp = await getTimestamp();

      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'RSA-PSS',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['sign', 'verify']
      );

      const zipContents: Record<string, Uint8Array> = {};
      const fileStructure: FileStructureItem[] = [];
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let uint8Array = new Uint8Array(arrayBuffer);
        const fileName = (file as any).webkitRelativePath || file.name;
        
        let salt: Uint8Array | undefined;
        let iv: Uint8Array | undefined;
        
        if (enableEncryption && encryptionPassword) {
          const encrypted = await encryptFile(uint8Array, encryptionPassword);
          uint8Array = encrypted.encryptedData;
          salt = encrypted.salt;
          iv = encrypted.iv;
        }
        
        zipContents[fileName] = uint8Array;
        
        fileStructure.push({
          path: fileName,
          size: file.size,
          iv: iv ? btoa(String.fromCharCode(...iv)) : undefined,
          salt: salt ? btoa(String.fromCharCode(...salt)) : undefined,
          encrypted: enableEncryption
        });
      }

      const sortedEntries = Object.entries(zipContents)
        .sort(([a], [b]) => a.localeCompare(b));
      
      const combinedData = new Uint8Array(
        sortedEntries.reduce((acc, [, data]) => acc + data.length, 0)
      );
      
      let offset = 0;
      for (const [, data] of sortedEntries) {
        combinedData.set(data, offset);
        offset += data.length;
      }
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', combinedData);
      const fileHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const zipsig: ZipsigData = {
        creator_id: creatorId,
        timestamp,
        file_hash: fileHash,
        signature: '', // Will be filled after signing
        public_key: '', // Will be filled after key export
        tool: 'zipsig',
        file_structure: fileStructure,
        encrypted: enableEncryption
      };

      // Sign the metadata (excluding signature and public_key fields)
      const { signature, public_key, ...dataToSignObj } = zipsig;
      // Ensure consistent JSON serialization
      const orderedObj = {
        creator_id: dataToSignObj.creator_id,
        timestamp: dataToSignObj.timestamp,
        file_hash: dataToSignObj.file_hash,
        tool: dataToSignObj.tool,
        ...(dataToSignObj.file_structure && { file_structure: dataToSignObj.file_structure }),
        ...(dataToSignObj.encrypted !== undefined && { encrypted: dataToSignObj.encrypted })
      };
      const dataToSign = new TextEncoder().encode(JSON.stringify(orderedObj));
      const signatureBuffer = await crypto.subtle.sign(
        { name: 'RSA-PSS', saltLength: 32 },
        keyPair.privateKey,
        dataToSign
      );

      const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const publicKeyPem = '-----BEGIN PUBLIC KEY-----\n' +
        btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)))
          .match(/.{1,64}/g)!.join('\n') +
        '\n-----END PUBLIC KEY-----';

      // Complete the zipsig object
      zipsig.signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
      zipsig.public_key = publicKeyPem;

      const zipsigData = strToU8(JSON.stringify(zipsig, null, 2));
      const finalZipContents = { ...zipContents, '.zipsig': zipsigData };
      
      const zippedData = zipSync(finalZipContents);
      const blob = new Blob([zippedData], { type: 'application/zip' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = folderName ? `${folderName}_signed.zip` : 'signed_files.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Prepare private key
      const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const privateKeyPem = '-----BEGIN PRIVATE KEY-----\n' +
        btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)))
          .match(/.{1,64}/g)!.join('\n') +
        '\n-----END PRIVATE KEY-----';

      // Download private key after 100ms
      setTimeout(() => {
        const privateKeyBlob = new Blob([privateKeyPem], { type: 'text/plain' });
        const privateKeyUrl = URL.createObjectURL(privateKeyBlob);
        const privateKeyLink = document.createElement('a');
        privateKeyLink.href = privateKeyUrl;
        privateKeyLink.download = `${folderName || 'files'}_private_key.pem`;
        document.body.appendChild(privateKeyLink);
        privateKeyLink.click();
        document.body.removeChild(privateKeyLink);
        URL.revokeObjectURL(privateKeyUrl);
      }, 100);
      
      // Download password file after 200ms if encryption is enabled
      if (enableEncryption && encryptionPassword) {
        setTimeout(() => {
          const passwordBlob = new Blob([encryptionPassword], { type: 'text/plain' });
          const passwordUrl = URL.createObjectURL(passwordBlob);
          const passwordLink = document.createElement('a');
          passwordLink.href = passwordUrl;
          const passwordFileName = folderName ? `${folderName}_password.txt` : 'files_password.txt';
          passwordLink.download = passwordFileName;
          document.body.appendChild(passwordLink);
          passwordLink.click();
          document.body.removeChild(passwordLink);
          URL.revokeObjectURL(passwordUrl);
        }, 200);
      }

      options?.onSuccess?.();
    } catch (error) {
      console.error('Error generating signed zip:', error);
      options?.onError?.(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  }, [options]);

  return {
    isGenerating,
    setIsGenerating,
    generateSignedZip
  };
};