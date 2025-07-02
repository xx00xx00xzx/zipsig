import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Shield,
  FileText,
  Upload,
  Check,
  AlertCircle,
  Folder,
  Lock,
  Clock,
  HelpCircle,
  Globe,
  Mail,
  Unlock,
  Info
} from 'lucide-react';
import { zipSync, unzipSync, strToU8 } from 'fflate';
import { formatFileSize, buildFileTree } from './utils/file';
import { generateSecurePassword, encryptFile, decryptFile } from './utils/crypto';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

import ContactForm from './components/ContactForm';
import { InfoPopup } from './components/ui/InfoPopup';
import { ExtractSection } from './components/sections/ExtractSection';
import { TreeItem } from './components/ui/TreeItem';
// ZipSig Logo Component
const ZipSigLogo = ({ className }: { className?: string }) => (
  <svg width="40" height="40" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" fill="none" className={className}>
    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8"/>
    <path d="M64 28c4.418 0 8 3.582 8 8v12h-16V36c0-4.418 3.582-8 8-8z" fill="currentColor"/>
    <rect x="60" y="52" width="8" height="8" rx="2" fill="currentColor"/>
    <rect x="60" y="64" width="8" height="8" rx="2" fill="currentColor"/>
    <rect x="60" y="76" width="8" height="8" rx="2" fill="currentColor"/>
  </svg>
);
import './App.css';
import { useTranslation, type Language } from './translations';

interface FileStructureItem {
  path: string;
  size: number;
  iv?: string;
  salt?: string;
  encrypted?: boolean;
}

interface TreeNode {
  name: string;
  path: string;
  isFile: boolean;
  size?: number;
  children: TreeNode[];
}

interface ZipsigData {
  creator_id: string;
  timestamp: string;
  file_hash: string;
  signature: string;
  public_key: string;
  tool: string;
  file_structure?: FileStructureItem[];
  encrypted?: boolean;
}

type Mode = 'sign' | 'verify' | 'extract' | 'faq';

function App() {
  // Detect browser language and set default language
  const getDefaultLanguage = (): Language => {
    const browserLanguage = navigator.language || navigator.languages[0];
    return browserLanguage.startsWith('ja') ? 'ja' : 'en';
  };

  const [mode, setMode] = useState<Mode>('sign');
  const [language, setLanguage] = useState<Language>(getDefaultLanguage());
  const [files, setFiles] = useState<File[]>([]);
  const [creatorId, setCreatorId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    zipsig: ZipsigData | null;
    message: string;
  } | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [folderName, setFolderName] = useState<string>('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [timeStatus, setTimeStatus] = useState<{
    utcTime: string;
    localTime: string;
    apiStatus: 'checking' | 'online' | 'offline';
  }>({
    utcTime: '',
    localTime: '',
    apiStatus: 'checking'
  });
  const [enableEncryption, setEnableEncryption] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [encryptionPasswordConfirm, setEncryptionPasswordConfirm] = useState('');
  const [showEncryptionInfo, setShowEncryptionInfo] = useState(false);
  // const [decryptedFiles, setDecryptedFiles] = useState<{[path: string]: Uint8Array}>({});
  const [extractPassword, setExtractPassword] = useState('');
  const [extractedFiles, setExtractedFiles] = useState<{[path: string]: Uint8Array}>({});
  const [extractedZipsig, setExtractedZipsig] = useState<ZipsigData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = useTranslation(language);

  const handleGeneratePassword = useCallback(() => {
    const newPassword = generateSecurePassword(16);
    setEncryptionPassword(newPassword);
    setEncryptionPasswordConfirm(newPassword);
  }, []);

  const extractAndDecrypt = async () => {
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
  };

  // SEO: Update page title and meta description based on mode
  React.useEffect(() => {
    const titles = {
      sign: 'ZipSig - ファイル署名 | デジタル署名システム',
      verify: 'ZipSig - 署名検証 | デジタル署名システム',
      extract: 'ZipSig - ファイル解凍 | デジタル署名システム',
      faq: 'ZipSig - よくある質問 | デジタル署名システム'
    };

    const descriptions = {
      sign: 'ファイルをデジタル署名してZIPに作成。改ざん検知機能付きで作品の著作権保護を実現します。',
      verify: 'デジタル署名されたZIPファイルの検証。改ざんの有無を確認し、ファイルの信頼性を検証します。',
      extract: '暗号化されたZipSigファイルを復号・解凍してオリジナルファイルを取得します。',
      faq: 'ZipSigの使い方、技術仕様、セキュリティに関するよくある質問と回答。'
    };

    document.title = titles[mode];
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', descriptions[mode]);
    }

    // Update Open Graph meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.setAttribute('content', titles[mode]);
    if (ogDescription) ogDescription.setAttribute('content', descriptions[mode]);

    // Update Twitter meta tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterTitle) twitterTitle.setAttribute('content', titles[mode]);
    if (twitterDescription) twitterDescription.setAttribute('content', descriptions[mode]);
  }, [mode]);

  // Check API status and update time on load
  React.useEffect(() => {
    const checkTimeAPI = async (retryCount = 0) => {
      const retryDelay = Math.min(2000 * Math.pow(1.5, retryCount), 30000); // Exponential backoff with max 30s
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
        
        const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const utcTime = new Date(data.datetime).toISOString();
        const localTime = new Date().toISOString();
        
        setTimeStatus({
          utcTime,
          localTime,
          apiStatus: 'online'
        });
        
        // console.log(`WorldTimeAPI connected successfully after ${retryCount + 1} attempts`);
      } catch (error) {
        // console.warn(`WorldTimeAPI attempt ${retryCount + 1} failed:`, error);
        
        // Show checking status during retries
        setTimeStatus(prev => ({
          ...prev,
          apiStatus: 'checking'
        }));
        
        // Retry indefinitely with exponential backoff
        setTimeout(() => {
          checkTimeAPI(retryCount + 1);
        }, retryDelay);
      }
    };

    checkTimeAPI();
    
    // Update local time every second
    const interval = setInterval(() => {
      setTimeStatus(prev => ({
        ...prev,
        localTime: new Date().toISOString()
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const filesArray = Array.from(fileList);
      setFiles(filesArray);
      setVerificationResult(null);
      setFolderName('');
    }
  }, []);

  const handleExtractDrop = async (droppedFiles: File[]) => {
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
  };

  const handleZipDrop = async (droppedFiles: File[]) => {
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
  };

  const generateSignedZip = async () => {
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

      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);

    } catch (error) {
      console.error('Error generating signed zip:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (showContactForm) {
    return <ContactForm onClose={() => setShowContactForm(false)} t={t} />;
  }

  return (
    <div className="app-container">
      {/* Wave Background */}
      <div className="wave-background">
        <svg className="wave-svg" viewBox="0 0 1200 320" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave1Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0, 122, 255, 0.4)" />
              <stop offset="100%" stopColor="rgba(0, 122, 255, 0.1)" />
            </linearGradient>
            <linearGradient id="wave2Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(52, 199, 89, 0.3)" />
              <stop offset="100%" stopColor="rgba(52, 199, 89, 0.05)" />
            </linearGradient>
            <linearGradient id="wave3Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 149, 0, 0.25)" />
              <stop offset="100%" stopColor="rgba(255, 149, 0, 0.03)" />
            </linearGradient>
          </defs>
          
          {/* Wave 1 - Blue */}
          <motion.path 
            className="wave-path wave-1"
            d="M0,0 L1200,0 L1200,200 C900,150 600,100 300,150 C200,170 100,180 0,160 Z"
            fill="url(#wave1Gradient)"
            animate={{
              d: [
                "M0,0 L1200,0 L1200,200 C900,150 600,100 300,150 C200,170 100,180 0,160 Z",
                "M0,0 L1200,0 L1200,180 C900,130 600,120 300,170 C200,190 100,160 0,140 Z",
                "M0,0 L1200,0 L1200,220 C900,170 600,80 300,130 C200,150 100,200 0,180 Z",
                "M0,0 L1200,0 L1200,200 C900,150 600,100 300,150 C200,170 100,180 0,160 Z"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Wave 2 - Green */}
          <motion.path 
            className="wave-path wave-2"
            d="M0,40 C300,60 600,20 900,40 C1000,50 1100,30 1200,40 L1200,240 C900,200 600,160 300,180 C200,190 100,200 0,180 Z"
            fill="url(#wave2Gradient)"
            animate={{
              d: [
                "M0,40 C300,60 600,20 900,40 C1000,50 1100,30 1200,40 L1200,240 C900,200 600,160 300,180 C200,190 100,200 0,180 Z",
                "M0,20 C300,40 600,0 900,20 C1000,30 1100,10 1200,20 L1200,220 C900,180 600,140 300,160 C200,170 100,180 0,160 Z",
                "M0,60 C300,80 600,40 900,60 C1000,70 1100,50 1200,60 L1200,260 C900,220 600,180 300,200 C200,210 100,220 0,200 Z",
                "M0,40 C300,60 600,20 900,40 C1000,50 1100,30 1200,40 L1200,240 C900,200 600,160 300,180 C200,190 100,200 0,180 Z"
              ]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          {/* Wave 3 - Orange */}
          <motion.path 
            className="wave-path wave-3"
            d="M0,80 C200,100 400,60 600,80 C800,100 1000,60 1200,80 L1200,280 C1000,240 800,200 600,220 C400,240 200,260 0,220 Z"
            fill="url(#wave3Gradient)"
            animate={{
              d: [
                "M0,80 C200,100 400,60 600,80 C800,100 1000,60 1200,80 L1200,280 C1000,240 800,200 600,220 C400,240 200,260 0,220 Z",
                "M0,100 C200,120 400,80 600,100 C800,120 1000,80 1200,100 L1200,300 C1000,260 800,220 600,240 C400,260 200,280 0,240 Z",
                "M0,60 C200,80 400,40 600,60 C800,80 1000,40 1200,60 L1200,260 C1000,220 800,180 600,200 C400,220 200,240 0,200 Z",
                "M0,80 C200,100 400,60 600,80 C800,100 1000,60 1200,80 L1200,280 C1000,240 800,200 600,220 C400,240 200,260 0,220 Z"
              ]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </svg>
      </div>

      <motion.div 
        className="main-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Hero Header */}
        <div className="hero-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '12px' }}>
            <div className="logo-container">
              <ZipSigLogo className="hero-logo" />
            </div>
            <h1 className="hero-title">{t.title}</h1>
            <motion.button
              className="language-toggle"
              onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={language === 'ja' ? 'Switch to English' : '日本語に切り替え'}
            >
              <Globe size={20} />
              <span>{language === 'ja' ? 'EN' : 'JP'}</span>
            </motion.button>
          </div>
          <p className="hero-subtitle">{t.subtitle}</p>
          
          {/* Time Status Display */}
          <div className="time-status">
            <div className="time-display">
              <div className="time-row">
                <span className="time-label">{t.utcTime}</span>
                <span className="time-value">{timeStatus.utcTime ? new Date(timeStatus.utcTime).toLocaleString(language === 'ja' ? 'ja-JP' : 'en-US', { timeZone: 'UTC' }) : t.checking}</span>
                <motion.div 
                  className={`api-status ${timeStatus.apiStatus}`}
                  animate={{ 
                    scale: timeStatus.apiStatus === 'checking' ? [1, 1.1, 1] : 1,
                    opacity: timeStatus.apiStatus === 'checking' ? [1, 0.5, 1] : 1
                  }}
                  transition={{ duration: 1, repeat: timeStatus.apiStatus === 'checking' ? Infinity : 0 }}
                >
                  {timeStatus.apiStatus === 'online' && <Check size={12} />}
                  {timeStatus.apiStatus === 'offline' && <AlertCircle size={12} />}
                  {timeStatus.apiStatus === 'checking' && <Clock size={12} />}
                  <span>
                    {timeStatus.apiStatus === 'online' && t.apiOnline}
                    {timeStatus.apiStatus === 'offline' && t.apiOffline}
                    {timeStatus.apiStatus === 'checking' && t.checking}
                  </span>
                </motion.div>
              </div>
              <div className="time-row">
                <span className="time-label">{t.localTime}</span>
                <span className="time-value">{timeStatus.localTime ? new Date(timeStatus.localTime).toLocaleString(language === 'ja' ? 'ja-JP' : 'en-US') : t.checking}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="mode-switcher-container">
          <div className="mode-switcher">
            <motion.button
              className={`mode-button ${mode === 'sign' ? 'active' : ''}`}
              onClick={() => setMode('sign')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Lock size={18} />
              <span>{t.sign}</span>
            </motion.button>
            <motion.button
              className={`mode-button ${mode === 'verify' ? 'active' : ''}`}
              onClick={() => setMode('verify')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Shield size={18} />
              <span>{t.verify}</span>
            </motion.button>
            <motion.button
              className={`mode-button ${mode === 'extract' ? 'active' : ''}`}
              onClick={() => setMode('extract')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Unlock size={18} />
              <span>{t.extract}</span>
            </motion.button>
            <motion.button
              className={`mode-button ${mode === 'faq' ? 'active' : ''}`}
              onClick={() => setMode('faq')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <HelpCircle size={18} />
              <span>{t.faq}</span>
            </motion.button>
            <motion.button
              className="mode-button contact-button"
              onClick={() => setShowContactForm(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title={t.contact}
            >
              <Mail size={18} />
            </motion.button>
          </div>
        </div>

        {/* Main Content and Notifications */}
        <AnimatePresence mode="wait">
          {mode === 'sign' ? (
            <SignSection
              key="sign"
              files={files}
              folderName={folderName}
              creatorId={creatorId}
              setCreatorId={setCreatorId}
              onFolderSelect={handleFolderSelect}
              onFileSelect={handleFileSelect}
              onGenerate={generateSignedZip}
              isGenerating={isGenerating}
              folderInputRef={folderInputRef}
              fileInputRef={fileInputRef}
              enableEncryption={enableEncryption}
              setEnableEncryption={setEnableEncryption}
              encryptionPassword={encryptionPassword}
              setEncryptionPassword={setEncryptionPassword}
              encryptionPasswordConfirm={encryptionPasswordConfirm}
              setEncryptionPasswordConfirm={setEncryptionPasswordConfirm}
              onGeneratePassword={handleGeneratePassword}
              showEncryptionInfo={showEncryptionInfo}
              setShowEncryptionInfo={setShowEncryptionInfo}
              t={t}
            />
          ) : mode === 'verify' ? (
            <VerifySection
              key="verify"
              onDrop={handleZipDrop}
              verificationResult={verificationResult}
              t={t}
            />
          ) : mode === 'extract' ? (
            <ExtractSection
              key="extract"
              language={language}
              onDrop={handleExtractDrop}
              extractedZipsig={extractedZipsig}
              extractedFiles={extractedFiles}
              extractPassword={extractPassword}
              setExtractPassword={setExtractPassword}
              onExtract={extractAndDecrypt}
              isExtracting={isExtracting}
            />
          ) : (
            <FAQSection
              key="faq"
              t={t}
            />
          )}
          
          {/* Success Notification - moved inside same AnimatePresence */}
          {showNotification && (
            <motion.div
              key="notification"
              className="success-notification"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30 
              }}
            >
              <Check size={20} />
              <span>{t.signedZipGenerated}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Sign Section Component
interface SignSectionProps {
  files: File[];
  folderName: string;
  creatorId: string;
  setCreatorId: (id: string) => void;
  onFolderSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  folderInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  enableEncryption: boolean;
  setEnableEncryption: (enabled: boolean) => void;
  encryptionPassword: string;
  setEncryptionPassword: (password: string) => void;
  encryptionPasswordConfirm: string;
  setEncryptionPasswordConfirm: (password: string) => void;
  onGeneratePassword: () => void;
  showEncryptionInfo: boolean;
  setShowEncryptionInfo: (show: boolean) => void;
  t: any;
}

const SignSection = React.memo(function SignSection({ 
  files, 
  folderName, 
  creatorId, 
  setCreatorId, 
  onFolderSelect, 
  onFileSelect, 
  onGenerate, 
  isGenerating,
  folderInputRef,
  fileInputRef,
  enableEncryption,
  setEnableEncryption,
  encryptionPassword,
  setEncryptionPassword,
  encryptionPasswordConfirm,
  setEncryptionPasswordConfirm,
  onGeneratePassword,
  showEncryptionInfo,
  setShowEncryptionInfo,
  t
}: SignSectionProps) {
  const { getRootProps, isDragActive } = useDropzone({
    onDrop: () => {
      // Handle dropped files
    },
    noClick: true
  });

  const validatePasswords = () => {
    if (!enableEncryption) return null;
    if (!encryptionPassword) return t.passwordRequired;
    if (encryptionPassword.length < 8) return t.passwordTooShort;
    if (encryptionPassword !== encryptionPasswordConfirm) return t.passwordMismatch;
    return null;
  };

  const passwordError = validatePasswords();
  const canGenerate = creatorId && files.length > 0 && !passwordError;

  // Calculate total file size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <motion.div
      className="content-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* File Upload Area */}
      <div 
        className={`dropzone-container ${isDragActive ? 'drag-active' : ''}`}
        {...getRootProps()}
      >
        <div className="dropzone-content">
          <motion.div 
            className="dropzone-icon"
            animate={{ 
              y: isDragActive ? -5 : 0,
              scale: isDragActive ? 1.1 : 1 
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Upload size={48} />
          </motion.div>
          <h3>{t.selectFilesOrFolder}</h3>
          <p>{t.dragAndDrop}</p>
          
          <div className="upload-buttons">
            <motion.button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FileText size={16} />
              {t.selectFiles}
            </motion.button>
            <motion.button
              className="upload-btn"
              onClick={() => folderInputRef.current?.click()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Folder size={16} />
              {t.selectFolder}
            </motion.button>
          </div>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          multiple
          style={{ display: 'none' }}
        />
        <input
          type="file"
          ref={folderInputRef}
          onChange={onFolderSelect}
          {...({ webkitdirectory: '', directory: '' } as any)}
          multiple
          style={{ display: 'none' }}
        />
      </div>

      {/* Selected Files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            className="files-display"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="files-header">
              <h4>{t.selectedFiles}</h4>
              <div className="files-stats">
                <span className="total-size">{formatFileSize(totalSize)}</span>
                <span className="file-count">{files.length}{t.filesCount}</span>
              </div>
            </div>
            
            {folderName && (
              <motion.div 
                className="folder-badge"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Folder size={16} />
                {folderName}
              </motion.div>
            )}
            
            <div className="files-tree">
              {(() => {
                const tree = buildFileTree(files);
                // If files have paths (folder selection), show tree view
                if (tree.children.length > 0 && tree.children[0].children.length > 0) {
                  return tree.children.map((child: TreeNode, index: number) => (
                    <TreeItem
                      key={child.path || index}
                      node={child}
                      level={0}
                      expanded={index === 0} // Expand first folder by default
                      onToggle={() => {}}
                    />
                  ));
                } else {
                  // For individual files, show simple list
                  return files.map((file, index) => (
                    <motion.div
                      key={file.name}
                      className="tree-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="tree-item-content">
                        <div className="tree-icon">
                          <FileText size={16} />
                        </div>
                        <span className="tree-name">{file.name}</span>
                        <span className="tree-size">
                          {(() => {
                            const bytes = file.size;
                            if (bytes === 0) return '0 B';
                            const k = 1024;
                            const sizes = ['B', 'KB', 'MB', 'GB'];
                            const i = Math.floor(Math.log(bytes) / Math.log(k));
                            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
                          })()}
                        </span>
                      </div>
                    </motion.div>
                  ));
                }
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creator ID Input */}
      <motion.div 
        className="creator-input-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="input-label">{t.creatorId}</label>
        <motion.input
          type="text"
          value={creatorId}
          onChange={(e) => setCreatorId(e.target.value)}
          placeholder={t.creatorIdPlaceholder}
          className="creator-input"
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </motion.div>

      {/* Encryption Section */}
      <motion.div 
        className="encryption-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.label 
          className="encryption-checkbox"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <input
            type="checkbox"
            checked={enableEncryption}
            onChange={(e) => setEnableEncryption(e.target.checked)}
          />
          <span className="checkmark"></span>
          <span className="checkbox-label">{t.enableEncryption}</span>
        </motion.label>

        {/* Encryption Info Link */}
        <motion.button
          type="button"
          className="encryption-info-link"
          onClick={() => setShowEncryptionInfo(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <Info size={16} />
          <span>{t.encryptionInfo}</span>
        </motion.button>

        <AnimatePresence>
          {enableEncryption && (
            <motion.div
              className="password-inputs"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="password-field">
                <label className="input-label">{t.encryptionPassword}</label>
                <div className="password-input-container">
                  <motion.input
                    type="password"
                    value={encryptionPassword}
                    onChange={(e) => setEncryptionPassword(e.target.value)}
                    placeholder={t.encryptionPasswordPlaceholder}
                    className="creator-input password-input"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                  <motion.button
                    type="button"
                    className="generate-password-btn"
                    onClick={onGeneratePassword}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    {t.generatePassword}
                  </motion.button>
                </div>
              </div>
              
              <div className="password-field">
                <label className="input-label">{t.encryptionPasswordConfirm}</label>
                <motion.input
                  type="password"
                  value={encryptionPasswordConfirm}
                  onChange={(e) => setEncryptionPasswordConfirm(e.target.value)}
                  placeholder={t.encryptionPasswordConfirmPlaceholder}
                  className="creator-input"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </div>

              {passwordError && (
                <motion.div
                  className="password-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AlertCircle size={16} />
                  <span>{passwordError}</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        className="action-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          className={`generate-button ${!canGenerate ? 'disabled' : ''}`}
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          whileHover={{ scale: !canGenerate ? 1 : 1.05 }}
          whileTap={{ scale: !canGenerate ? 1 : 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                className="button-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="loading-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                {t.generating}
              </motion.div>
            ) : (
              <motion.div
                key="generate"
                className="button-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Lock size={18} />
                {t.generateSignedZip}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Encryption Info Popup */}
      <InfoPopup
        isOpen={showEncryptionInfo}
        onClose={() => setShowEncryptionInfo(false)}
        title={t.encryptionInfoTitle}
        content={t.encryptionInfoContent}
      />
    </motion.div>
  );
});

// Verify Section Component
interface VerifyProps {
  onDrop: (files: File[]) => void;
  verificationResult: {
    isValid: boolean;
    zipsig: ZipsigData | null;
    message: string;
  } | null;
  t: any;
}

const VerifySection = React.memo(function VerifySection({ onDrop, verificationResult, t }: VerifyProps) {
  const [privateKeyResult, setPrivateKeyResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip']
    }
  });

  const { getRootProps: getPrivateKeyRootProps, getInputProps: getPrivateKeyInputProps, isDragActive: isPrivateKeyDragActive } = useDropzone({
    onDrop: handlePrivateKeyDrop,
    accept: {
      'application/x-pem-file': ['.pem'],
      'text/plain': ['.pem']
    }
  });

  async function handlePrivateKeyDrop(droppedFiles: File[]) {
    if (!verificationResult?.zipsig) return;
    
    const pemFile = droppedFiles[0];
    if (!pemFile || !pemFile.name.endsWith('.pem')) return;

    try {
      const pemContent = await pemFile.text();
      
      const privateKeyPem = pemContent
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s/g, '');
      
      const privateKeyBuffer = Uint8Array.from(atob(privateKeyPem), c => c.charCodeAt(0));
      const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        { name: 'RSA-PSS', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const testData = new TextEncoder().encode('test_verification_data');
      const signature = await crypto.subtle.sign(
        { name: 'RSA-PSS', saltLength: 32 },
        privateKey,
        testData
      );

      const publicKeyPem = verificationResult.zipsig.public_key
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

      const isMatched = await crypto.subtle.verify(
        { name: 'RSA-PSS', saltLength: 32 },
        publicKey,
        signature,
        testData
      );

      setPrivateKeyResult({
        isValid: isMatched,
        message: isMatched ? t.privateKeyMatched : t.privateKeyNotMatched
      });
    } catch (error) {
      setPrivateKeyResult({
        isValid: false,
        message: `${t.error}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  return (
    <motion.div
      className="content-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Dropzone */}
      <div 
        className={`dropzone-container verify ${isDragActive ? 'drag-active' : ''}`}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <motion.div 
            className="dropzone-icon"
            animate={{ 
              y: isDragActive ? -5 : 0,
              scale: isDragActive ? 1.1 : 1 
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Shield size={48} />
          </motion.div>
          <h3>{t.verifySignedZip}</h3>
          <p>{t.dropZipToVerify}</p>
        </div>
      </div>

      {/* Verification Result */}
      <AnimatePresence>
        {verificationResult && (
          <motion.div
            className={`verification-result ${verificationResult.isValid ? 'valid' : 'invalid'}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30 
            }}
          >
            <motion.div 
              className="result-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 30 }}
            >
              {verificationResult.isValid ? (
                <Check size={24} />
              ) : (
                <AlertCircle size={24} />
              )}
            </motion.div>
            
            <div className="result-content">
              <h4>
                {verificationResult.isValid ? t.verificationSuccess : t.verificationFailed}
              </h4>
              <p>{verificationResult.message}</p>
              
              {verificationResult.zipsig && (
                <motion.div 
                  className="zipsig-details"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="detail-row">
                    <span className="detail-label">{t.creator}</span>
                    <span className="detail-value">{verificationResult.zipsig.creator_id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t.createdAt}</span>
                    <span className="detail-value">
                      <Clock size={14} />
                      {new Date(verificationResult.zipsig.timestamp).toLocaleString('ja-JP')}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t.hash}</span>
                    <span className="detail-value hash">{verificationResult.zipsig.file_hash.substring(0, 32)}...</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Private Key Verification */}
      <AnimatePresence>
        {verificationResult?.zipsig && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.4 }}
          >
            <div 
              className={`dropzone-container private-key ${isPrivateKeyDragActive ? 'drag-active' : ''}`}
              {...getPrivateKeyRootProps()}
            >
              <input {...getPrivateKeyInputProps()} />
              <div className="dropzone-content">
                <motion.div 
                  className="dropzone-icon"
                  animate={{ 
                    y: isPrivateKeyDragActive ? -5 : 0,
                    scale: isPrivateKeyDragActive ? 1.1 : 1 
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <Unlock size={32} />
                </motion.div>
                <h3>{t.privateKeyVerification}</h3>
                <p>{t.dropPrivateKey}</p>
              </div>
            </div>

            {/* Private Key Result */}
            <AnimatePresence>
              {privateKeyResult && (
                <motion.div
                  className={`verification-result ${privateKeyResult.isValid ? 'valid' : 'invalid'}`}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 30 
                  }}
                >
                  <motion.div 
                    className="result-icon"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {privateKeyResult.isValid ? (
                      <Check size={24} />
                    ) : (
                      <AlertCircle size={24} />
                    )}
                  </motion.div>
                  
                  <div className="result-content">
                    <h4>
                      {privateKeyResult.isValid ? t.privateKeySuccess : t.privateKeyFailed}
                    </h4>
                    <p>{privateKeyResult.message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// FAQ Section Component
interface FAQSectionProps {
  t: any;
}

const FAQSection = React.memo(function FAQSection({ t }: FAQSectionProps) {
  const faqItems = [
    { question: t.faqWhat, answer: t.faqWhatAnswer },
    { question: t.faqZipContents, answer: t.faqZipContentsAnswer },
    { question: t.faqSignature, answer: t.faqSignatureAnswer },
    { question: t.faqZipsigFile, answer: t.faqZipsigFileAnswer },
    { question: t.faqKeyPem, answer: t.faqKeyPemAnswer },
    { question: t.faqVerification, answer: t.faqVerificationAnswer },
    { question: t.faqEncryption, answer: t.faqEncryptionAnswer },
    { question: t.faqTarget, answer: t.faqTargetAnswer },
    { question: t.faqLegal, answer: t.faqLegalAnswer },
    { question: t.faqFree, answer: t.faqFreeAnswer }
  ];

  return (
    <motion.div
      className="content-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="faq-header">
        <h2 className="faq-title">{t.faqTitle}</h2>
        <p className="faq-subtitle">{t.faqSubtitle}</p>
      </div>

      <div className="faq-container">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="faq-item"
          >
            <div className="faq-question">
              <HelpCircle size={20} />
              <h3>{item.question}</h3>
            </div>
            <div className="faq-answer">
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
});

export default function AppWithAnalytics() {
  return (
    <>
      <App />
      <Analytics />
      <SpeedInsights />
    </>
  );
}