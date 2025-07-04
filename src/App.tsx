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

  const handleGeneratePassword = useCallback(() => {
    const newPassword = generateSecurePassword(16);
    setEncryptionPassword(newPassword);
    setEncryptionPasswordConfirm(newPassword);
  }, []);


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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header */}
        <Header
          language={language}
          onLanguageChange={setLanguage}
          timeStatus={timeStatus}
          t={t}
        />

        {/* Mode Switcher */}
        <ModeSwitcher
          mode={mode}
          onModeChange={setMode}
          onContactClick={() => setShowContactForm(true)}
          t={t}
        />

        {/* Main Content and Notifications */}
        <AnimatePresence mode="popLayout">
          {mode === 'sign' ? (
            <SignSection
              key="sign"
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
            />
          ) : mode === 'verify' ? (
            <VerifySection
              key="verify"
              language={language}
              onDrop={(files: File[]) => verifySignature(files, t)}
              verificationResult={verificationResult}
            />
          ) : mode === 'extract' ? (
            <ExtractSection
              key="extract"
              language={language}
              onDrop={handleExtractDrop}
              extractedZipsig={extractedZipsig}
              extractedFiles={extractedFiles}
              extractPassword={extractPassword}
              setExtractPassword={setExtractPassword}
              onExtract={() => extractAndDecrypt(t)}
              isExtracting={isExtracting}
            />
          ) : (
            <FAQSection
              key="faq"
              language={language}
            />
          )}
          
          {/* Success Notification - moved inside same AnimatePresence */}
          {showNotification && (
            <motion.div
              key="notification"
              className="success-notification"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30 
              }}
            >
              <Check size={20} />
              <span>{t.signedZipGenerated}</span>
            </motion.div>
          )}
        </AnimatePresence>
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