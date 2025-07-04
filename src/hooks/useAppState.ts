import { useState, useRef } from 'react';
import { getDefaultLanguage } from '../utils/browser';
import type { Mode, Language } from '../types';

export const useAppState = () => {
  const [mode, setMode] = useState<Mode>('sign');
  const [language, setLanguage] = useState<Language>(getDefaultLanguage());
  const [files, setFiles] = useState<File[]>([]);
  const [creatorId, setCreatorId] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [folderName, setFolderName] = useState<string>('');
  const [showContactForm, setShowContactForm] = useState(false);
  
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return {
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
  };
};