import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, Unlock, HelpCircle, Mail } from 'lucide-react';
import type { Translations } from '../../translations';

interface ModeSwitcherProps {
  mode: 'sign' | 'verify' | 'extract' | 'faq';
  onModeChange: (mode: 'sign' | 'verify' | 'extract' | 'faq') => void;
  onContactClick: () => void;
  t: Translations;
  isMobile?: boolean;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = React.memo(({
  mode,
  onModeChange,
  onContactClick,
  t,
  isMobile = false
}) => {
  
  // Suppress unused variable warning - will be implemented later
  void isMobile;
  return (
    <div className="mode-switcher-container">
      <div className="mode-switcher">
        <motion.button
          className={`mode-button ${mode === 'sign' ? 'active' : ''}`}
          onClick={() => onModeChange('sign')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Lock size={18} />
          <span>{t.sign}</span>
        </motion.button>
        <motion.button
          className={`mode-button ${mode === 'verify' ? 'active' : ''}`}
          onClick={() => onModeChange('verify')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Shield size={18} />
          <span>{t.verify}</span>
        </motion.button>
        <motion.button
          className={`mode-button ${mode === 'extract' ? 'active' : ''}`}
          onClick={() => onModeChange('extract')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Unlock size={18} />
          <span>{t.extract}</span>
        </motion.button>
        <motion.button
          className={`mode-button ${mode === 'faq' ? 'active' : ''}`}
          onClick={() => onModeChange('faq')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <HelpCircle size={18} />
          <span>{t.faq}</span>
        </motion.button>
        <motion.button
          className="mode-button contact-button"
          onClick={onContactClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          title={t.contact}
        >
          <Mail size={18} />
        </motion.button>
      </div>
    </div>
  );
});

ModeSwitcher.displayName = 'ModeSwitcher';