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
  isMobile?: boolean;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  language,
  onLanguageChange,
  timeStatus,
  t,
  isMobile = false
}) => {
  
  // Conditional motion components
  const MotionButton = ({ children, className, onClick, ...motionProps }: any) => {
    if (isMobile) {
      return <button className={className} onClick={onClick}>{children}</button>;
    }
    return <motion.button className={className} onClick={onClick} {...motionProps}>{children}</motion.button>;
  };

  const MotionDiv = ({ children, className, ...motionProps }: any) => {
    if (isMobile) {
      return <div className={className}>{children}</div>;
    }
    return <motion.div className={className} {...motionProps}>{children}</motion.div>;
  };
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
        <MotionButton
          className="language-toggle"
          onClick={() => onLanguageChange(language === 'ja' ? 'en' : 'ja')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={language === 'ja' ? 'Switch to English' : '日本語に切り替え'}
        >
          <Globe size={20} />
          <span>{language === 'ja' ? 'EN' : 'JP'}</span>
        </MotionButton>
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
            <MotionDiv 
              className={`api-status ${timeStatus.apiStatus}`}
              animate={!isMobile && timeStatus.apiStatus === 'checking' ? { 
                scale: [1, 1.1, 1],
                opacity: [1, 0.5, 1]
              } : undefined}
              transition={!isMobile ? { 
                duration: 1, 
                repeat: timeStatus.apiStatus === 'checking' ? Infinity : 0 
              } : {}}
            >
              {timeStatus.apiStatus === 'online' && <Check size={12} />}
              {timeStatus.apiStatus === 'offline' && <AlertCircle size={12} />}
              {timeStatus.apiStatus === 'checking' && <Clock size={12} />}
              <span>
                {timeStatus.apiStatus === 'online' && t.apiOnline}
                {timeStatus.apiStatus === 'offline' && t.apiOffline}
                {timeStatus.apiStatus === 'checking' && t.checking}
              </span>
            </MotionDiv>
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