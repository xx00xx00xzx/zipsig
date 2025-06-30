import { useState, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation, type Language } from '../../translations';

interface VerificationLimitationsProps {
  language: Language;
  delay?: number;
}

export const VerificationLimitations = memo(({ language, delay = 0.8 }: VerificationLimitationsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslation(language);
  
  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const guaranteesList = useMemo(() => 
    t.zipsigGuaranteesList.split('\n').map((line: string, index: number) => (
      <p key={index}>{line}</p>
    )), [t.zipsigGuaranteesList]
  );

  const notGuaranteesList = useMemo(() => 
    t.zipsigNotGuaranteesList.split('\n').map((line: string, index: number) => (
      <p key={index}>{line}</p>
    )), [t.zipsigNotGuaranteesList]
  );

  const miniTipsContent = useMemo(() => 
    t.miniTips.split('\n').map((line: string, index: number) => (
      <span key={index}>
        {line}
        {index < t.miniTips.split('\n').length - 1 && <br />}
      </span>
    )), [t.miniTips]
  );
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay }}
      className="verification-limitations-container"
    >
      <motion.button
        className="verification-limitations-header"
        onClick={toggleExpanded}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <h4>{t.verificationLimitations}</h4>
        <motion.div
          className="accordion-icon"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="verification-limitations-content"
          >
            <div className="verification-limitations">
              <div className="limitations-grid">
                <div className="limitation-item guarantees">
                  <h5>✅ {t.whatZipsigGuarantees}</h5>
                  <div className="limitation-text">
                    {guaranteesList}
                  </div>
                </div>
                
                <div className="limitation-item not-guarantees">
                  <h5>⚠️ {t.whatZipsigDoesNotGuarantee}</h5>
                  <div className="limitation-text">
                    {notGuaranteesList}
                  </div>
                </div>
              </div>

              <div className="private-key-explanation">
                <h5>🔑 {t.privateKeyExplanation}</h5>
                <p>{t.privateKeyDescription}</p>
                <p className="warning-text">{t.privateKeyTips}</p>
              </div>

              <div className="mini-tips">
                💡 {miniTipsContent}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});