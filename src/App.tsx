import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { generateSecurePassword } from './utils/crypto';
import { useSignature } from './hooks/useSignature';
import { useTime } from './hooks/useTime';
import { useVerification } from './hooks/useVerification';
import { useEncryption } from './hooks/useEncryption';
import { useExtraction } from './hooks/useExtraction';
import { useAppState } from './hooks/useAppState';
import { useSEO } from './hooks/useSEO';
import { useFileHandlers } from './hooks/useFileHandlers';
import { useMobile } from './hooks/useMobile';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

import ContactForm from './components/ContactForm';
import { ExtractSection } from './components/sections/ExtractSection';
import { SignSection } from './components/sections/SignSection';
import { WaveBackground } from './components/ui/WaveBackground';
import { VerifySection } from './components/sections/VerifySection';
import { FAQSection } from './components/sections/FAQSection';
import { Header } from './components/ui/Header';
import { ModeSwitcher } from './components/ui/ModeSwitcher';
import './App.css';
import { useTranslation } from './translations';


function App() {
  // Mobile detection
  const isMobile = useMobile();

  const {
    mode,
    setMode,
    language,
    setLanguage,
    files,
    setFiles,
    creatorId,
    setCreatorId,
    showNotification,
    setShowNotification,
    folderName,
    setFolderName,
    showContactForm,
    setShowContactForm,
    folderInputRef,
    fileInputRef
  } = useAppState();
  
  const { isGenerating, generateSignedZip } = useSignature({
    onSuccess: () => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    },
    onError: (error) => console.error('Signature generation failed:', error)
  });
  const { verificationResult, setVerificationResult, verifySignature } = useVerification();
  const { timeStatus } = useTime();
  const {
    enableEncryption,
    setEnableEncryption,
    encryptionPassword,
    setEncryptionPassword,
    encryptionPasswordConfirm,
    setEncryptionPasswordConfirm
  } = useEncryption();
  const {
    extractPassword,
    setExtractPassword,
    extractedFiles,
    setExtractedFiles,
    extractedZipsig,
    setExtractedZipsig,
    isExtracting,
    extractAndDecrypt
  } = useExtraction();

  const t = useTranslation(language);

  // Animation settings based on device type
  const motionSettings = {
    mainContainer: isMobile ? {} : {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: "easeOut" as const }
    },
    notification: isMobile ? {} : {
      initial: { opacity: 0, y: 50, scale: 0.9 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -50, scale: 0.9 },
      transition: { 
        type: "spring" as const, 
        stiffness: 500, 
        damping: 30 
      }
    }
  };

  const handleGeneratePassword = useCallback(() => {
    const newPassword = generateSecurePassword(16);
    setEncryptionPassword(newPassword);
    setEncryptionPasswordConfirm(newPassword);
  }, [setEncryptionPassword, setEncryptionPasswordConfirm]);


  // SEO: Update page title and meta tags based on mode
  useSEO(mode);


  const { handleFolderSelect, handleFileSelect, handleExtractDrop } = useFileHandlers({
    setFiles,
    setFolderName,
    setVerificationResult,
    setExtractedZipsig,
    setExtractedFiles,
    t
  });



  if (showContactForm) {
    return <ContactForm onClose={() => setShowContactForm(false)} t={t} />;
  }

  return (
    <div className="app-container">
      {/* Wave Background */}
      <WaveBackground />

      <motion.div 
        className="main-container"
        {...motionSettings.mainContainer}
      >
        {/* Header */}
        <Header
          language={language}
          onLanguageChange={setLanguage}
          timeStatus={timeStatus}
          t={t}
          isMobile={isMobile}
        />

        {/* Mode Switcher */}
        <ModeSwitcher
          mode={mode}
          onModeChange={setMode}
          onContactClick={() => setShowContactForm(true)}
          t={t}
          isMobile={isMobile}
        />

        {/* Main Content and Notifications */}
        {(() => {
          const renderSection = () => {
            switch (mode) {
              case 'sign':
                return (
                  <SignSection
                    key={isMobile ? undefined : "sign"}
                    language={language}
                    files={files}
                    folderName={folderName}
                    creatorId={creatorId}
                    setCreatorId={setCreatorId}
                    onFolderSelect={handleFolderSelect}
                    onFileSelect={handleFileSelect}
                    onGenerate={() => generateSignedZip(
                      files,
                      creatorId,
                      folderName,
                      enableEncryption,
                      encryptionPassword,
                      encryptionPasswordConfirm
                    )}
                    isGenerating={isGenerating}
                    folderInputRef={folderInputRef}
                    fileInputRef={fileInputRef}
                    enableEncryption={enableEncryption}
                    setEnableEncryption={setEnableEncryption}
                    encryptionPassword={encryptionPassword}
                    setEncryptionPassword={setEncryptionPassword}
                    encryptionPasswordConfirm={encryptionPasswordConfirm}
                    setEncryptionPasswordConfirm={setEncryptionPasswordConfirm}
                    onGeneratePassword={handleGeneratePassword}
                    isMobile={isMobile}
                  />
                );
              case 'verify':
                return (
                  <VerifySection
                    key={isMobile ? undefined : "verify"}
                    language={language}
                    onDrop={(files: File[]) => verifySignature(files, t)}
                    verificationResult={verificationResult}
                    isMobile={isMobile}
                  />
                );
              case 'extract':
                return (
                  <ExtractSection
                    key={isMobile ? undefined : "extract"}
                    language={language}
                    onDrop={handleExtractDrop}
                    extractedZipsig={extractedZipsig}
                    extractedFiles={extractedFiles}
                    extractPassword={extractPassword}
                    setExtractPassword={setExtractPassword}
                    onExtract={() => extractAndDecrypt(t)}
                    isExtracting={isExtracting}
                    isMobile={isMobile}
                  />
                );
              default:
                return (
                  <FAQSection
                    key={isMobile ? undefined : "faq"}
                    language={language}
                    isMobile={isMobile}
                  />
                );
            }
          };

          const renderNotification = () => {
            if (!showNotification) return null;
            
            if (isMobile) {
              return (
                <div className="success-notification">
                  <Check size={20} />
                  <span>{t.signedZipGenerated}</span>
                </div>
              );
            }
            
            return (
              <motion.div
                key="notification"
                className="success-notification"
                {...motionSettings.notification}
              >
                <Check size={20} />
                <span>{t.signedZipGenerated}</span>
              </motion.div>
            );
          };

          if (isMobile) {
            return (
              <div>
                {renderSection()}
                {renderNotification()}
              </div>
            );
          }

          return (
            <AnimatePresence mode="popLayout">
              {renderSection()}
              {renderNotification()}
            </AnimatePresence>
          );
        })()}
      </motion.div>
    </div>
  );
}



export default function AppWithAnalytics() {
  return (
    <>
      <App />
      <Analytics />
      <SpeedInsights />
    </>
  );
}