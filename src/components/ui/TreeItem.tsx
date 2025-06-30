import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Folder, Lock, Download } from 'lucide-react';
import type { TreeNode } from '../../types/index';
import { formatFileSize } from '../../utils/file';

interface TreeItemProps {
  node: TreeNode;
  level: number;
  expanded: boolean;
  onToggle: () => void;
  onDownload?: (path: string) => void;
  isExtracted?: boolean;
}

export const TreeItem = memo(({ node, level, expanded, onToggle, onDownload, isExtracted }: TreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleToggle = useCallback(() => {
    if (!node.isFile && node.children.length > 0) {
      setIsExpanded(!isExpanded);
      onToggle();
    }
  }, [node.isFile, node.children.length, isExpanded, onToggle]);

  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.isFile && onDownload && node.path) {
      onDownload(node.path);
    }
  }, [node.isFile, node.path, onDownload]);

  return (
    <>
      <motion.div
        className="tree-item"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.05 }}
        style={{ paddingLeft: `${level * 20}px` }}
      >
        <div 
          className="tree-item-content"
          onClick={handleToggle}
        >
          {!node.isFile && node.children.length > 0 && (
            <motion.div
              className="tree-toggle"
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8">
                <path d="M2 1l4 3-4 3z" fill="currentColor"/>
              </svg>
            </motion.div>
          )}
          
          <div className="tree-icon">
            {node.isFile ? (
              <FileText size={16} />
            ) : (
              <Folder size={16} />
            )}
          </div>
          
          <span className="tree-name">{node.name}</span>
          
          {node.isFile && node.encrypted && (
            <Lock size={12} className="tree-encrypted-icon" />
          )}
          
          {node.isFile && node.size && (
            <span className="tree-size">{formatFileSize(node.size)}</span>
          )}
          
          {node.isFile && isExtracted && onDownload && (
            <motion.button
              className="tree-download-btn"
              onClick={handleDownload}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Download size={14} />
            </motion.button>
          )}
        </div>
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && !node.isFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child, index) => (
              <TreeItem
                key={child.path || index}
                node={child}
                level={level + 1}
                expanded={false}
                onToggle={() => {}}
                onDownload={onDownload}
                isExtracted={isExtracted}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});