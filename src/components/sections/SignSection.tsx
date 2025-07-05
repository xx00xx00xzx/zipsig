import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Lock, AlertCircle, Info } from 'lucide-react';
import type { TreeNode } from '../../types/index';
import { buildFileTree, formatFileSize } from '../../utils/file';
import { TreeItem } from '../ui/TreeItem';
import { InfoPopup } from '../ui/InfoPopup';
import { useTranslation, type Language } from '../../translations';

interface SignSectionProps {
  language: Language;
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
  isMobile?: boolean;
}

export const SignSection = React.memo(function SignSection({ 
  language,
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
  isMobile = false
}: SignSectionProps) {
  const t = useTranslation(language);
  
  // State for info popup
  const [showEncryptionInfo, setShowEncryptionInfo] = React.useState(false);
  
  // Calculate total file size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  // Create conditional motion component
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

  const MotionInput = ({ className, ...motionProps }: any) => {
    if (isMobile) {
      return <input className={className} {...motionProps} />;
    }
    return <motion.input className={className} {...motionProps} />;
  };

  const MotionLabel = ({ children, className, ...motionProps }: any) => {
    if (isMobile) {
      return <label className={className}>{children}</label>;
    }
    return <motion.label className={className} {...motionProps}>{children}</motion.label>;
  };

  const ConditionalAnimatePresence = ({ children }: any) => {
    if (isMobile) {
      return children;
    }
    return <AnimatePresence>{children}</AnimatePresence>;
  };


  
  // Note: Dropzone is available if needed for future drag and drop functionality

  const validatePasswords = () => {
    if (!enableEncryption) return null;
    if (!encryptionPassword) return t.passwordRequired;
    if (encryptionPassword.length < 8) return t.passwordTooShort;
    if (encryptionPassword !== encryptionPasswordConfirm) return t.passwordMismatch;
    return null;
  };

  const passwordError = validatePasswords();
  const canGenerate = creatorId && files.length > 0 && !passwordError;

  const fileTree = buildFileTree(files);

  return (
    <MotionDiv
      className="content-section"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.5 }}
    >
      {/* File Selection */}
      <MotionDiv
        className="file-selection"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="section-title">{t.selectFilesOrFolder}</h3>
        <p className="section-description">{t.dragAndDrop}</p>
        
        <div className="selection-buttons">
          <MotionButton
            className="selection-button"
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Upload size={20} />
            {t.selectFiles}
          </MotionButton>
          
          <MotionButton
            className="selection-button"
            onClick={() => folderInputRef.current?.click()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Upload size={20} />
            {t.selectFolder}
          </MotionButton>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={onFileSelect}
          style={{ display: 'none' }}
        />
        <input
          ref={folderInputRef}
          type="file"
          {...({ webkitdirectory: '' } as any)}
          onChange={onFolderSelect}
          style={{ display: 'none' }}
        />
      </MotionDiv>

      {/* Selected Files Display */}
      <ConditionalAnimatePresence>
        {files.length > 0 && (
          <MotionDiv
            className="selected-files"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MotionDiv
              className="files-header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h4>{folderName || t.selectedFiles}</h4>
              <div className="files-header-stats">
                <span className="file-size-display">{formatFileSize(totalSize)}</span>
                <span className="file-count">{files.length}{t.filesCount}</span>
              </div>
            </MotionDiv>

            <MotionDiv
              className="files-tree"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {fileTree.children.map((child: TreeNode, index: number) => (
                <TreeItem
                  key={child.path || index}
                  node={child}
                  level={0}
                  expanded={index === 0}
                  onToggle={() => {}}
                />
              ))}
            </MotionDiv>
          </MotionDiv>
        )}
      </ConditionalAnimatePresence>

      {/* Creator ID Input */}
      <MotionDiv
        className="creator-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="input-label">{t.creatorId}</label>
        <MotionInput
          type="text"
          value={creatorId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreatorId(e.target.value)}
          placeholder={t.creatorIdPlaceholder}
          className="creator-input"
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </MotionDiv>

      {/* Encryption Options */}
      <MotionDiv
        className="encryption-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="encryption-toggle-container">
          <MotionLabel
            className="encryption-toggle"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <input
              type="checkbox"
              checked={enableEncryption}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEnableEncryption(e.target.checked)}
            />
            <span className="checkmark"></span>
            <span className="toggle-text">{t.enableEncryption}</span>
          </MotionLabel>
          
          <MotionButton
            type="button"
            className="info-icon"
            onClick={() => setShowEncryptionInfo(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            title={t.encryptionInfo}
          >
            <Info size={18} />
          </MotionButton>
        </div>

        {/* Encryption Info Link */}
        <MotionButton
          type="button"
          className="encryption-info-link"
          onClick={() => setShowEncryptionInfo(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <Info size={16} />
          <span>{t.encryptionInfo}</span>
        </MotionButton>

        <AnimatePresence>
          {enableEncryption && (
            <MotionDiv
              className="password-inputs"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="password-field">
                <label className="input-label">{t.encryptionPassword}</label>
                <div className="password-input-container">
                  <MotionInput
                    type="password"
                    value={encryptionPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEncryptionPassword(e.target.value)}
                    placeholder={t.encryptionPasswordPlaceholder}
                    className="creator-input"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                  <MotionButton
                    type="button"
                    className="generate-password-btn"
                    onClick={onGeneratePassword}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    {t.generatePassword}
                  </MotionButton>
                </div>
              </div>
              
              <div className="password-field">
                <label className="input-label">{t.encryptionPasswordConfirm}</label>
                <MotionInput
                  type="password"
                  value={encryptionPasswordConfirm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEncryptionPasswordConfirm(e.target.value)}
                  placeholder={t.encryptionPasswordConfirmPlaceholder}
                  className="creator-input"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </div>

              {passwordError && (
                <MotionDiv
                  className="password-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AlertCircle size={16} />
                  <span>{passwordError}</span>
                </MotionDiv>
              )}
            </MotionDiv>
          )}
        </AnimatePresence>
      </MotionDiv>

      {/* Generate Button */}
      <MotionDiv
        className="action-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <MotionButton
          className={`generate-button ${!canGenerate ? 'disabled' : ''}`}
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          whileHover={{ scale: !canGenerate ? 1 : 1.05 }}
          whileTap={{ scale: !canGenerate ? 1 : 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <MotionDiv
                key="loading"
                className="button-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MotionDiv
                  className="loading-spinner"
                  animate={isMobile ? {} : { rotate: 360 }}
                  transition={isMobile ? {} : { duration: 1, repeat: Infinity, ease: "linear" }}
                />
                {t.generating}
              </MotionDiv>
            ) : (
              <MotionDiv
                key="generate"
                className="button-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Lock size={18} />
                {t.generateSignedZip}
              </MotionDiv>
            )}
          </AnimatePresence>
        </MotionButton>
      </MotionDiv>

      {/* Encryption Info Popup */}
      <InfoPopup
        isOpen={showEncryptionInfo}
        onClose={() => setShowEncryptionInfo(false)}
        title={t.encryptionInfoTitle}
        content={t.encryptionInfoContent}
      />
    </MotionDiv>
  );
});