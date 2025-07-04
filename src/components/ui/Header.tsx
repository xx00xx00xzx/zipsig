import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Check, AlertCircle, Clock } from 'lucide-react';
import { formatLocalDateTime, formatUTCDateTime } from '../../utils/date';
import { ZipSigLogo } from './ZipSigLogo';
import type { Translations } from '../../translations';

interface HeaderProps {
  language: 'ja' | 'en';
  onLanguageChange: (language: 'ja' | 'en') => void;
  timeStatus: {
    utcTime: string | null;
    localTime: string | null;
    apiStatus: 'online' | 'offline' | 'checking';
  };
  t: Translations;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  language,
  onLanguageChange,
  timeStatus,
  t
}) => {
  return (
    <div className="hero-header">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '20px', 
        marginBottom: '12px' 
      }}>
        <div className="logo-container">
          <ZipSigLogo className="hero-logo" />
        </div>
        <h1 className="hero-title">{t.title}</h1>
        <motion.button
          className="language-toggle"
          onClick={() => onLanguageChange(language === 'ja' ? 'en' : 'ja')}
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
            <span className="time-value">
              {timeStatus.utcTime ? formatUTCDateTime(timeStatus.utcTime, language) : t.checking}
            </span>
            <motion.div 
              className={`api-status ${timeStatus.apiStatus}`}
              animate={timeStatus.apiStatus === 'checking' ? { 
                scale: [1, 1.1, 1],
                opacity: [1, 0.5, 1]
              } : undefined}
              transition={{ 
                duration: 1, 
                repeat: timeStatus.apiStatus === 'checking' ? Infinity : 0 
              }}
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
            <span className="time-value">
              {timeStatus.localTime ? formatLocalDateTime(timeStatus.localTime, language) : t.checking}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

Header.displayName = 'Header';