import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useTranslation, type Language } from '../../translations';

interface FAQSectionProps {
  language: Language;
  isMobile?: boolean;
}

export const FAQSection = React.memo(function FAQSection({ language, isMobile = false }: FAQSectionProps) {
  const t = useTranslation(language);
  
  const faqItems = [
    { question: t.faqWhat, answer: t.faqWhatAnswer },
    { question: t.faqZipContents, answer: t.faqZipContentsAnswer },
    { question: t.faqSignature, answer: t.faqSignatureAnswer },
    { question: t.faqZipsigFile, answer: t.faqZipsigFileAnswer },
    { question: t.faqKeyPem, answer: t.faqKeyPemAnswer },
    { question: t.faqVerification, answer: t.faqVerificationAnswer },
    { question: t.faqEncryption, answer: t.faqEncryptionAnswer },
    { question: t.faqTarget, answer: t.faqTargetAnswer },
    { question: t.faqLegal, answer: t.faqLegalAnswer },
    { question: t.faqFree, answer: t.faqFreeAnswer }
  ];

  return (
    <motion.div
      className="content-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="faq-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="faq-title">{t.faqTitle}</h2>
        <p className="faq-subtitle">{t.faqSubtitle}</p>
      </motion.div>

      <div className="faq-container">
        {faqItems.map((item, index) => (
          <motion.div
            key={index}
            className="faq-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <motion.div 
              className="faq-question"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <HelpCircle size={20} />
              <h3>{item.question}</h3>
            </motion.div>
            <motion.div 
              className="faq-answer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <p>{item.answer}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});