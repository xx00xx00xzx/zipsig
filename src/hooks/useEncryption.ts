import { useState } from 'react';

export const useEncryption = () => {
  const [enableEncryption, setEnableEncryption] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [encryptionPasswordConfirm, setEncryptionPasswordConfirm] = useState('');
  const [showEncryptionInfo, setShowEncryptionInfo] = useState(false);

  return {
    enableEncryption,
    setEnableEncryption,
    encryptionPassword,
    setEncryptionPassword,
    encryptionPasswordConfirm,
    setEncryptionPasswordConfirm,
    showEncryptionInfo,
    setShowEncryptionInfo
  };
};