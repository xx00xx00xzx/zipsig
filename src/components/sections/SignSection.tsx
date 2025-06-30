import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Lock, AlertCircle, Info } from 'lucide-react';
import type { TreeNode } from '../../types/index';
import { buildFileTree } from '../../utils/file';
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
}

export function SignSection({ 
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
  onGeneratePassword
}: SignSectionProps) {
  const t = useTranslation(language);
  
  // State for info popup
  const [showEncryptionInfo, setShowEncryptionInfo] = React.useState(false);
  
  // Calculate total file size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
    <motion.div
      className="content-section"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.5 }}
    >
      {/* File Selection */}
      <motion.div
        className="file-selection"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="section-title">{t.selectFilesOrFolder}</h3>
        <p className="section-description">{t.dragAndDrop}</p>
        
        <div className="selection-buttons">
          <motion.button
            className="selection-button"
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Upload size={20} />
            {t.selectFiles}
          </motion.button>
          
          <motion.button
            className="selection-button"
            onClick={() => folderInputRef.current?.click()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Upload size={20} />
            {t.selectFolder}
          </motion.button>
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
      </motion.div>

      {/* Selected Files Display */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            className="selected-files"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
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
            </motion.div>

            <motion.div
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creator ID Input */}
      <motion.div
        className="creator-section"
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

      {/* Encryption Options */}
      <motion.div
        className="encryption-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="encryption-toggle-container">
          <motion.label
            className="encryption-toggle"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <input
              type="checkbox"
              checked={enableEncryption}
              onChange={(e) => setEnableEncryption(e.target.checked)}
            />
            <span className="checkmark"></span>
            <span className="toggle-text">{t.enableEncryption}</span>
          </motion.label>
          
          <motion.button
            type="button"
            className="info-icon"
            onClick={() => setShowEncryptionInfo(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            title={t.encryptionInfo}
          >
            <Info size={18} />
          </motion.button>
        </div>

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
                    className="creator-input"
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
}