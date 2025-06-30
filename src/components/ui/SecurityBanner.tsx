import { motion } from 'framer-motion';
import { Shield, Lock, Eye } from 'lucide-react';
import { useTranslation, type Language } from '../../translations';

interface SecurityBannerProps {
  language: Language;
}

export function SecurityBanner({ language }: SecurityBannerProps) {
  const t = useTranslation(language);

  return (
    <motion.div
      className="security-banner"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      <div className="security-header">
        <motion.div
          className="security-icon"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Shield size={24} />
        </motion.div>
        <h3 className="security-title">{t.securityTitle}</h3>
      </div>
      
      <div className="security-features">
        <motion.div 
          className="security-item"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className="security-item-icon">
            <Lock size={16} />
          </div>
          <span className="security-item-text">{t.clientSideProcessing}</span>
        </motion.div>
        
        <motion.div 
          className="security-item"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className="security-item-icon">
            <Eye size={16} />
          </div>
          <span className="security-item-text">{t.noServerStorage}</span>
        </motion.div>
        
        <motion.div 
          className="security-item"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className="security-item-icon">
            <Shield size={16} />
          </div>
          <span className="security-item-text">{t.completePrivacy}</span>
        </motion.div>
      </div>
    </motion.div>
  );
}