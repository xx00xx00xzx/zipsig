import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Shield, Check, AlertCircle, Clock, Unlock, Copy } from 'lucide-react';
import type { VerificationResult } from '../../types/index';
import { useTranslation, type Language } from '../../translations';

interface VerifySectionProps {
  language: Language;
  onDrop: (files: File[]) => void;
  verificationResult: VerificationResult | null;
  isMobile?: boolean;
}

export const VerifySection = React.memo(function VerifySection({ language, onDrop, verificationResult, isMobile = false }: VerifySectionProps) {
  const t = useTranslation(language);
  const [privateKeyResult, setPrivateKeyResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const [hashCopied, setHashCopied] = useState(false);

  // Create conditional motion components
  const MotionDiv = ({ children, className, ...motionProps }: any) => {
    if (isMobile) {
      return <div className={className}>{children}</div>;
    }
    return <motion.div className={className} {...motionProps}>{children}</motion.div>;
  };

  const MotionButton = ({ children, className, onClick, ...motionProps }: any) => {
    if (isMobile) {
      return <button className={className} onClick={onClick}>{children}</button>;
    }
    return <motion.button className={className} onClick={onClick} {...motionProps}>{children}</motion.button>;
  };

  const ConditionalAnimatePresence = ({ children }: any) => {
    if (isMobile) {
      return children;
    }
    return <AnimatePresence>{children}</AnimatePresence>;
  };

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

  const copyHashToClipboard = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setHashCopied(true);
      setTimeout(() => setHashCopied(false), 2000);
    } catch (err) {
      // console.error('Failed to copy hash to clipboard:', err);
    }
  };

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
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
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
                    <div className="hash-container">
                      <motion.button
                        className="copy-hash-btn"
                        onClick={() => copyHashToClipboard(verificationResult.zipsig?.file_hash || '')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      >
                        <AnimatePresence mode="wait">
                          {hashCopied ? (
                            <motion.div
                              key="check"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Check size={16} />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="copy"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Copy size={16} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                      <span className="detail-value hash">{verificationResult.zipsig.file_hash}</span>
                    </div>
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