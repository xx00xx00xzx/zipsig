import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, User, MessageSquare, Type, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactFormProps {
  onClose: () => void;
  t: any;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
}

interface FormErrors {
  [key: string]: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ onClose, t }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'question'
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'loading' | null;
    message: string;
    details?: string[];
  }>({ type: null, message: '' });

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t.contactNameRequired;
    } else if (formData.name.length < 2) {
      newErrors.name = t.contactNameTooShort;
    } else if (formData.name.length > 100) {
      newErrors.name = t.contactNameTooLong;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t.contactEmailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.contactEmailInvalid;
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = t.contactSubjectRequired;
    } else if (formData.subject.length < 5) {
      newErrors.subject = t.contactSubjectTooShort;
    } else if (formData.subject.length > 200) {
      newErrors.subject = t.contactSubjectTooLong;
    }
    
    if (!formData.message.trim()) {
      newErrors.message = t.contactMessageRequired;
    } else if (formData.message.length < 10) {
      newErrors.message = t.contactMessageTooShort;
    } else if (formData.message.length > 2000) {
      newErrors.message = t.contactMessageTooLong;
    }
    
    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setNotification({
        type: 'error',
        message: t.contactValidationError,
        details: Object.values(validationErrors)
      });
      return;
    }

    setIsSubmitting(true);
    setNotification({
      type: 'loading',
      message: t.contactSending
    });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setNotification({
          type: 'success',
          message: t.contactSuccessMessage
        });
        
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          type: 'question'
        });
        
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t.contactErrorMessage);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: t.contactErrorMessage,
        details: [error instanceof Error ? error.message : t.contactUnknownError]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="contact-form-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="contact-form-container"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="contact-form-header">
            <div className="contact-form-title-area">
              <div className="contact-form-icon">
                <Mail size={20} color="white" />
              </div>
              <div className="contact-form-title-text">
                <h2>{t.contact}</h2>
                <p>{t.contactSubtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="contact-form-close"
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          <div className="contact-form-content">
            <AnimatePresence mode="wait">
              {notification.type && (
                <motion.div
                  className={`contact-form-notification ${notification.type}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="contact-form-notification-icon">
                    {notification.type === 'success' && <CheckCircle size={14} />}
                    {notification.type === 'error' && <AlertCircle size={14} />}
                    {notification.type === 'loading' && <div className="contact-form-loading-spinner" />}
                  </div>
                  <div className="contact-form-notification-content">
                    <p>{notification.message}</p>
                    {notification.details && notification.details.length > 0 && (
                      <ul>
                        {notification.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate>
              <motion.div
                className="contact-form-field"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="contact-form-label">
                  <User size={16} />
                  {t.contactName}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t.contactNamePlaceholder}
                  className="contact-form-input"
                  maxLength={100}
                />
                <div className="contact-form-character-count">
                  {formData.name.length}/100
                </div>
              </motion.div>

              <motion.div
                className="contact-form-field"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="contact-form-label">
                  <Mail size={16} />
                  {t.contactEmail}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t.contactEmailPlaceholder}
                  className="contact-form-input"
                />
              </motion.div>

              <motion.div
                className="contact-form-field"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="contact-form-label">
                  <Type size={16} />
                  {t.contactType}
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="contact-form-select"
                >
                  <option value="question">{t.contactTypeQuestion}</option>
                  <option value="bug">{t.contactTypeBug}</option>
                  <option value="feature">{t.contactTypeFeature}</option>
                  <option value="other">{t.contactTypeOther}</option>
                </select>
              </motion.div>

              <motion.div
                className="contact-form-field"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="contact-form-label">
                  <MessageSquare size={16} />
                  {t.contactSubject}
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder={t.contactSubjectPlaceholder}
                  className="contact-form-input"
                  maxLength={200}
                />
                <div className="contact-form-character-count">
                  {formData.subject.length}/200
                </div>
              </motion.div>

              <motion.div
                className="contact-form-field"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="contact-form-label">
                  <MessageSquare size={16} />
                  {t.contactMessage}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={t.contactMessagePlaceholder}
                  className="contact-form-textarea"
                  maxLength={2000}
                />
                <div className="contact-form-character-count">
                  {formData.message.length}/2000
                </div>
              </motion.div>

              <motion.button
                type="submit"
                className="contact-form-submit"
                disabled={isSubmitting}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="contact-form-loading-spinner" />
                    {t.contactSending}
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    {t.contactSend}
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContactForm; 