import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Check, Clock, Unlock, Copy, Lock } from 'lucide-react';
import type { ZipsigData, TreeNode } from '../../types/index';
import { buildTreeFromStructure } from '../../utils/file';
import { TreeItem } from '../ui/TreeItem';
import { useTranslation, type Language } from '../../translations';

interface ExtractSectionProps {
  language: Language;
  onDrop: (files: File[]) => void;
  extractedZipsig: ZipsigData | null;
  extractedFiles: {[path: string]: Uint8Array};
  extractPassword: string;
  setExtractPassword: (password: string) => void;
  onExtract: () => void;
  isExtracting: boolean;
}

export function ExtractSection({
  language,
  onDrop,
  extractedZipsig,
  extractedFiles,
  extractPassword,
  setExtractPassword,
  onExtract,
  isExtracting
}: ExtractSectionProps) {
  const t = useTranslation(language);
  const [hashCopied, setHashCopied] = useState(false);
  
  const copyHashToClipboard = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setHashCopied(true);
      setTimeout(() => setHashCopied(false), 2000);
    } catch (err) {
      // console.error('Failed to copy hash to clipboard:', err);
    }
  };


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip']
    },
    multiple: false
  });

  const hasFiles = Object.keys(extractedFiles).length > 0;
  const canExtract = hasFiles && (
    !extractedZipsig?.encrypted || 
    (extractedZipsig?.encrypted && extractPassword.length >= 8)
  );

  return (
    <motion.div
      className="content-section extract-section-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Dropzone */}
      <div 
        className={`dropzone-container extract ${isDragActive ? 'drag-active' : ''}`}
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
            <Unlock size={48} />
          </motion.div>
          <h3>{t.extractEncryptedZip}</h3>
          <p>{t.dropZipToExtract}</p>
        </div>
      </div>

      {/* Extract Result */}
      <AnimatePresence>
        {extractedZipsig && (
          <motion.div
            className={`verification-result valid`}
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
              <Check size={24} />
            </motion.div>
            
            <div className="result-content">
              <h4>{t.zipInfo}</h4>
              <p>{t.extractDescription}</p>
              
              <motion.div 
                className="zipsig-details"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.3 }}
              >
                <div className="detail-row">
                  <span className="detail-label">{t.creator}</span>
                  <span className="detail-value">{extractedZipsig.creator_id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t.createdAt}</span>
                  <span className="detail-value">
                    <Clock size={14} />
                    {new Date(extractedZipsig.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t.hash}</span>
                  <div className="hash-container">
                    <motion.button
                      className="copy-hash-btn"
                      onClick={() => copyHashToClipboard(extractedZipsig.file_hash)}
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
                    <span className="detail-value hash">{extractedZipsig.file_hash}</span>
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t.fileCount}</span>
                  <span className="detail-value">{Object.keys(extractedFiles).length}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t.encrypted}</span>
                  <span className="detail-value">
                    {extractedZipsig.encrypted ? t.yes : t.no}
                  </span>
                </div>
              </motion.div>
              
              {/* File Structure Tree - Before Extraction */}
              {extractedZipsig.file_structure && extractedZipsig.file_structure.length > 0 && (
                <motion.div
                  className="file-structure-preview"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="file-structure-header">
                    <h5>{t.fileStructure}</h5>
                    <span className="preview-badge">プレビュー</span>
                  </div>
                  <p className="structure-description">このZIPファイルに含まれるファイル構成：</p>
                  <div className="files-tree preview">
                    {(() => {
                      const tree = buildTreeFromStructure(extractedZipsig.file_structure);
                      
                      return tree.children.map((child: TreeNode, index: number) => (
                        <TreeItem
                          key={child.path || index}
                          node={child}
                          level={0}
                          expanded={true} // Expand all for preview
                          onToggle={() => {}}
                        />
                      ));
                    })()}
                  </div>
                  {extractedZipsig.encrypted && (
                    <div className="encryption-notice">
                      <Lock size={16} />
                      <span>このファイルは暗号化されています。解凍にはパスワードが必要です。</span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Input */}
      <AnimatePresence>
        {hasFiles && extractedZipsig?.encrypted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.4 }}
          >
            <div className="password-input-section">
              <h3>{t.extractPassword}</h3>
              <p>{t.extractPasswordPlaceholder}</p>
              <motion.input
                type="password"
                value={extractPassword}
                onChange={(e) => setExtractPassword(e.target.value)}
                placeholder={t.extractPasswordPlaceholder}
                className="creator-input"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extract Button */}
      <AnimatePresence>
        {hasFiles && canExtract && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.6 }}
          >
            <div className="extract-notice">
              <p>※ 解凍されたファイルは「フォルダ名_extracted.zip」として保存されます。このZIPファイルを展開すると元のフォルダ構造が復元されます。</p>
            </div>
            <motion.button
              className={`generate-button ${!canExtract ? 'disabled' : ''}`}
              onClick={onExtract}
              disabled={!canExtract || isExtracting}
              whileHover={{ scale: !canExtract ? 1 : 1.05 }}
              whileTap={{ scale: !canExtract ? 1 : 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <AnimatePresence mode="wait">
                {isExtracting ? (
                  <motion.div
                    key="extracting"
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
                    {t.extracting}
                  </motion.div>
                ) : (
                  <motion.div
                    key="extract"
                    className="button-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Unlock size={18} />
                    {t.extractFiles}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}