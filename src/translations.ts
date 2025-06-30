export type Language = 'ja' | 'en';

export interface Translations {
  // App title and subtitle
  title: string;
  subtitle: string;
  
  // Time status
  utcTime: string;
  localTime: string;
  apiOnline: string;
  apiOffline: string;
  checking: string;
  
  // Mode buttons
  sign: string;
  verify: string;
  extract: string;
  faq: string;
  
  // Sign section
  selectFilesOrFolder: string;
  dragAndDrop: string;
  selectFiles: string;
  selectFolder: string;
  selectedFiles: string;
  filesCount: string;
  creatorId: string;
  creatorIdPlaceholder: string;
  generateSignedZip: string;
  generating: string;
  
  // Encryption
  enableEncryption: string;
  encryptionInfo: string;
  encryptionInfoTitle: string;
  encryptionInfoContent: string;
  encryptionPassword: string;
  encryptionPasswordPlaceholder: string;
  encryptionPasswordConfirm: string;
  encryptionPasswordConfirmPlaceholder: string;
  passwordMismatch: string;
  passwordRequired: string;
  passwordTooShort: string;
  generatePassword: string;
  
  // Verify section
  verifySignedZip: string;
  dropZipToVerify: string;
  verificationSuccess: string;
  verificationFailed: string;
  creator: string;
  createdAt: string;
  hash: string;
  privateKeyVerification: string;
  dropPrivateKey: string;
  privateKeySuccess: string;
  privateKeyFailed: string;
  privateKeyMatched: string;
  privateKeyNotMatched: string;
  
  // Verification warnings and limitations
  verificationLimitations: string;
  whatZipsigGuarantees: string;
  whatZipsigDoesNotGuarantee: string;
  zipsigGuaranteesList: string;
  zipsigNotGuaranteesList: string;
  privateKeyExplanation: string;
  privateKeyDescription: string;
  privateKeyTips: string;
  miniTips: string;
  
  // Decryption
  fileStructure: string;
  encryptedFiles: string;
  enterPassword: string;
  passwordForDecryption: string;
  decrypt: string;
  decrypting: string;
  decryptionSuccess: string;
  decryptionFailed: string;
  downloadFile: string;
  downloadAll: string;
  wrongPassword: string;
  noEncryptedFiles: string;
  
  // Extract section
  extractEncryptedZip: string;
  extractDescription: string;
  dropZipToExtract: string;
  dragAndDropExtract: string;
  dropNow: string;
  zipInfo: string;
  fileCount: string;
  encrypted: string;
  yes: string;
  no: string;
  extractPassword: string;
  extractPasswordPlaceholder: string;
  extractFiles: string;
  extracting: string;
  extractedFiles: string;
  
  
  // Security and privacy
  securityTitle: string;
  clientSideProcessing: string;
  noServerStorage: string;
  completePrivacy: string;
  
  // Notifications
  signedZipGenerated: string;
  
  // Error messages
  noZipsigFile: string;
  fileModified: string;
  invalidSignature: string;
  error: string;
  
  // FAQ
  faqTitle: string;
  faqSubtitle: string;
  faqWhat: string;
  faqWhatAnswer: string;
  faqZipContents: string;
  faqZipContentsAnswer: string;
  faqSignature: string;
  faqSignatureAnswer: string;
  faqZipsigFile: string;
  faqZipsigFileAnswer: string;
  faqKeyPem: string;
  faqKeyPemAnswer: string;
  faqVerification: string;
  faqVerificationAnswer: string;
  faqEncryption: string;
  faqEncryptionAnswer: string;
  faqTarget: string;
  faqTargetAnswer: string;
  faqLegal: string;
  faqLegalAnswer: string;
  faqFree: string;
  faqFreeAnswer: string;
  
  // Contact
  contact: string;
  contactSubtitle: string;
  contactName: string;
  contactNamePlaceholder: string;
  contactEmail: string;
  contactEmailPlaceholder: string;
  contactType: string;
  contactTypeQuestion: string;
  contactTypeBug: string;
  contactTypeFeature: string;
  contactTypeOther: string;
  contactSubject: string;
  contactSubjectPlaceholder: string;
  contactMessage: string;
  contactMessagePlaceholder: string;
  contactSend: string;
  contactSending: string;
  contactSuccessMessage: string;
  contactErrorMessage: string;
  contactUnknownError: string;
  contactValidationError: string;
  contactNameRequired: string;
  contactNameTooShort: string;
  contactNameTooLong: string;
  contactEmailRequired: string;
  contactEmailInvalid: string;
  contactSubjectRequired: string;
  contactSubjectTooShort: string;
  contactSubjectTooLong: string;
  contactMessageRequired: string;
  contactMessageTooShort: string;
  contactMessageTooLong: string;
  contactNoticeTitle: string;
  contactNotice1: string;
  contactNotice2: string;
  contactNotice3: string;
}

export const translations: Record<Language, Translations> = {
  ja: {
    // App title and subtitle
    title: 'ZipSig',
    subtitle: 'デジタルファイルの署名システム',
    
    // Time status
    utcTime: 'UTC時刻:',
    localTime: 'ローカル:',
    apiOnline: 'API正常',
    apiOffline: 'API停止',
    checking: '確認中',
    
    // Mode buttons
    sign: '署名',
    verify: '検証',
    extract: '解凍',
    faq: 'FAQ',
    
    // Sign section
    selectFilesOrFolder: 'ファイルまたはフォルダを選択',
    dragAndDrop: 'ドラッグ&ドロップまたはクリックして選択',
    selectFiles: 'ファイル選択',
    selectFolder: 'フォルダ選択',
    selectedFiles: '選択されたファイル',
    filesCount: '個のファイル',
    creatorId: '作成者ID',
    creatorIdPlaceholder: 'あなたの識別子を入力してください',
    generateSignedZip: '署名付きZIPを生成',
    generating: '生成中...',
    
    // Security and privacy
    securityTitle: '完全クライアントサイド処理',
    clientSideProcessing: 'すべての処理はブラウザ内で完結',
    noServerStorage: 'ファイルはサーバーに一切保存されません',
    completePrivacy: '秘密鍵も含め、データは外部に送信されません',
    
    // Encryption
    enableEncryption: 'パスワード付きで作成する',
    encryptionInfo: '暗号化について',
    encryptionInfoTitle: 'ZipSigの暗号化について',
    encryptionInfoContent: 'ZipSigの暗号化は、一般的なZIPパスワードとは仕組みが異なります。\n\n【ZipSigの暗号化方式】\n• ZIP自体ではなく、個々のファイルを暗号化\n• AES-256-CBC暗号化アルゴリズムを使用\n• PBKDF2による鍵導出（100,000回反復）\n• ファイルごとに個別のIV（初期化ベクトル）とソルトを生成\n\n【セキュリティの特徴】\n• 各ファイルが独立して暗号化されるため高いセキュリティ\n• パスワードは暗号化前のハッシュ計算に影響しない\n• 署名検証時にも暗号化の有無が記録される\n• ブラウザのWebCrypto APIを使用した堅牢な実装\n\n【一般的なZIPパスワードとの違い】\n• ZIPパスワード：ZIP全体を保護（比較的弱い暗号化）\n• ZipSig：個々のファイルをAES-256で暗号化（強固な保護）',
    encryptionPassword: 'パスワード',
    encryptionPasswordPlaceholder: 'パスワードを入力してください',
    encryptionPasswordConfirm: 'パスワード確認',
    encryptionPasswordConfirmPlaceholder: 'パスワードを再入力してください',
    passwordMismatch: 'パスワードが一致しません',
    passwordRequired: 'パスワードを入力してください',
    passwordTooShort: 'パスワードは8文字以上で入力してください',
    generatePassword: '生成',
    
    // Verify section
    verifySignedZip: '署名付きZIPファイルを検証',
    dropZipToVerify: 'ZIPファイルをドロップして署名を確認',
    verificationSuccess: '検証成功',
    verificationFailed: '検証失敗',
    creator: '作成者:',
    createdAt: '作成日時:',
    hash: 'ハッシュ:',
    privateKeyVerification: '秘密鍵で追加検証 (オプション)',
    dropPrivateKey: '秘密鍵(.pem)をドロップして本人確認',
    privateKeySuccess: '秘密鍵検証成功',
    privateKeyFailed: '秘密鍵検証失敗',
    privateKeyMatched: '秘密鍵が一致しました',
    privateKeyNotMatched: '秘密鍵が一致しません',
    
    // Verification warnings and limitations
    verificationLimitations: '検証できること・できないこと',
    whatZipsigGuarantees: 'ZipSigが保証すること',
    whatZipsigDoesNotGuarantee: 'ZipSigが保証しないこと',
    zipsigGuaranteesList: '• ZIPが署名時の内容から改ざんされていないこと\n• 署名が正しく検証できること',
    zipsigNotGuaranteesList: '• このZIPが"オリジナル"であるかどうか\n• 署名者が本物の作者であるかどうか\n• 署名者がいつどこで公開したかの文脈',
    privateKeyExplanation: '署名者の本人確認について',
    privateKeyDescription: 'ZipSigは作成時に署名されますが、誰でも検証可能です。本当に「この署名があなた本人のものである」と示すには、署名時に生成された秘密鍵ファイルが必要です。',
    privateKeyTips: '秘密鍵を他人に渡すと、誰でもあなたの名義で署名できてしまいます。保管には注意してください。',
    miniTips: 'ZipSig = 改ざん検知 + 署名検証\n本物かどうかは、あなたの目と文脈で。',
    
    // Decryption
    fileStructure: 'ファイル構造',
    encryptedFiles: '暗号化されたファイル',
    enterPassword: 'パスワードを入力',
    passwordForDecryption: '復号化パスワード',
    decrypt: '復号化',
    decrypting: '復号化中...',
    decryptionSuccess: '復号化成功',
    decryptionFailed: '復号化失敗',
    downloadFile: 'ファイルダウンロード',
    downloadAll: '全てダウンロード',
    wrongPassword: 'パスワードが間違っています',
    noEncryptedFiles: '暗号化されたファイルがありません',
    
    // Extract section
    extractEncryptedZip: '暗号化されたZIPファイルを解凍',
    extractDescription: 'ZipSigで作成された暗号化ZIPファイルを復号・解凍してオリジナルファイルを取得します',
    dropZipToExtract: 'ZIPファイルをドロップして解凍',
    dragAndDropExtract: 'ZIPファイルをドラッグ&ドロップしてください',
    dropNow: 'ここにドロップしてください',
    zipInfo: 'ZIPファイル情報',
    fileCount: 'ファイル数',
    encrypted: '暗号化',
    yes: 'はい',
    no: 'いいえ',
    extractPassword: '解凍パスワード',
    extractPasswordPlaceholder: 'パスワードを入力してください',
    extractFiles: 'ファイルを解凍',
    extracting: '解凍中...',
    extractedFiles: '解凍されたファイル',
    
    // Notifications
    signedZipGenerated: '署名付きZIPファイルが生成されました',
    
    // Error messages
    noZipsigFile: 'No .zipsig file found',
    fileModified: 'File contents have been modified',
    invalidSignature: 'Invalid signature',
    error: 'Error',
    
    // FAQ
    faqTitle: 'FAQ',
    faqSubtitle: 'よくある質問',
    faqWhat: 'ZipSigとはなんですか？',
    faqWhatAnswer: 'ZipSigは、あなたの作品や資料を安全に配布するためのツールです。「この作品は私が作りました」という証明書をZIPファイルに付けることで、後から誰かが勝手に内容を変更したり、別の人が「自分が作った」と偽ることを防げます。印鑑証明のようなものをデジタルファイルに付けるイメージです。',
    faqZipContents: 'ZIPファイルに入るものは何ですか？',
    faqZipContentsAnswer: 'ZipSigで作ったZIPには、あなたの元ファイルに加えて以下が入ります：\n\n• .zipsig - 証明書ファイル（作者名・作成日時・改ざんチェック用の情報）\n• フォルダ名_private_key.pem - あなただけの鍵ファイル（本人確認用、大切に保存してください）\n• フォルダ名_password.txt - パスワード（暗号化した場合のみ）\n\nこれらのファイルがあることで、後からでも「本物であること」を証明できます。',
    faqSignature: '「署名」って何ですか？',
    faqSignatureAnswer: '「署名」は、実印や印鑑証明のようなものです。違いは以下の通りです：\n\n• 手書きの署名 → 真似されやすい\n• ZipSigの署名 → 真似は不可能、内容が少しでも変わると無効\n\n例えば、あなたの作品を誰かが1文字でも変更すると、署名が「壊れて」しまい、改ざんされたことがすぐに分かります。手書きの署名よりもはるかに安全です。',
    faqZipsigFile: '証明書（.zipsig）には何が書かれていますか？',
    faqZipsigFileAnswer: '証明書には以下の情報が記録されています：\n\n• 作者名 - あなたが入力した名前\n• 作成日時 - いつ署名したか\n• ファイルの指紋 - 内容が変更されていないかチェック用\n• 確認用の鍵 - 署名が本物かどうか確認するため\n• 署名データ - 改ざんされていないことの証明\n\n※この証明書は誰でも見ることができます（パスワードなどはかかっていません）',
    faqKeyPem: 'フォルダ名_private_key.pemって何ですか？保存が必要？',
    faqKeyPemAnswer: 'フォルダ名_private_key.pemは、あなただけの「印鑑」ファイルです。\n\n• 用途：「この署名は確実に私がしました」と証明するため\n• 保存：基本的には不要ですが、以下の場合は保存推奨\n\n【保存した方が良い場合】\n• 後で同じ署名を再作成したい\n• 法的な証明が必要になる可能性がある\n• 長期間にわたって作品の著作権を主張したい\n\n保存場所：USBメモリ、Googleドライブなど安全な場所\n注意：このファイルを他人に渡すと、その人があなたの名前で署名できてしまいます',
    faqVerification: '受け取った人は本物かどうか確認できますか？',
    faqVerificationAnswer: 'はい！とても簡単です。\n\n【確認方法】\n1. ZipSigのサイトを開く\n2. 「検証」タブをクリック\n3. ZIPファイルをドラッグ&ドロップ\n\n【確認できること】\n• ファイルが改ざんされていないか\n• 署名が本物かどうか\n• 作者名・作成日時\n• どんなファイルが入っているか\n\n特別なソフトは不要で、誰でも無料で確認できます。',
    faqEncryption: 'パスワード保護って何ですか？',
    faqEncryptionAnswer: '特定の人だけにファイルを見せたい場合に使います。\n\n【パスワード保護あり】\n• ファイルの中身は完全に隠される\n• パスワードを知っている人だけが開ける\n• 「どんなファイルが入っているか」の一覧は見える\n• 署名による改ざんチェックも可能\n\n【パスワード保護なし】\n• 誰でもファイルを開ける\n• 署名による改ざんチェックが可能\n\n例：機密資料を特定の人にだけ送りたい場合はパスワード保護を使用',
    faqTarget: 'どんな人におすすめですか？',
    faqTargetAnswer: '以下のような方におすすめです：\n\n**クリエイター**\n• イラスト、写真、音楽などの作品を配布する方\n• 「これは私の作品です」と証明したい方\n\n**研究者・ライター**\n• 論文や記事の著作権を守りたい方\n• データの改ざんを防ぎたい方\n\n**ビジネス利用**\n• 重要な文書を安全に送付したい方\n• 契約書や仕様書の改ざんを防ぎたい方\n\n**一般の方**\n• 家族写真や思い出を安全に保存・共有したい方',
    faqLegal: '法的な証明として使えますか？',
    faqLegalAnswer: 'ZipSigは改ざんを検知する仕組みがしっかりしているため、法的な場面でも有効な証拠となる可能性があります。\n\n**強み**\n• 改ざんが技術的に困難\n• 作成日時が正確に記録される\n• 作者の特定が可能\n\n**注意点**\n• 100%法的に有効とは保証できません\n• あくまで「補強資料」として考えてください\n• 重要な案件では専門家にご相談を\n\n**実用的な使い方**\n著作権トラブルの際の「状況証拠」として活用',
    faqFree: '料金はかかりますか？',
    faqFreeAnswer: '**完全無料**です！\n\n**費用**\n• 利用料金：0円\n• 署名回数：無制限\n• ファイルサイズ：制限なし\n• 広告：なし\n\n**応援について**\n「ZipSigを続けてほしい」と思っていただけたら、Buy Me a Coffeeでの応援をいただけると開発者がとても喜びます（任意です）。\n\n**安全性**\n全ての処理はあなたのブラウザ内で完結し、ファイルが外部に送信されることはありません。',
    
    // Contact
    contact: 'お問い合わせ',
    contactSubtitle: 'ご不明な点やご要望がございましたらお聞かせください',
    contactName: 'お名前',
    contactNamePlaceholder: 'お名前を入力してください',
    contactEmail: 'メールアドレス',
    contactEmailPlaceholder: 'your@email.com',
    contactType: 'お問い合わせ種別',
    contactTypeQuestion: '質問・問い合わせ',
    contactTypeBug: 'バグ報告',
    contactTypeFeature: '機能要望',
    contactTypeOther: 'その他',
    contactSubject: '件名',
    contactSubjectPlaceholder: 'お問い合わせの件名を入力してください',
    contactMessage: 'メッセージ',
    contactMessagePlaceholder: '詳細なメッセージをご記入ください...',
    contactSend: 'メールを送信',
    contactSending: '送信中...',
    contactSuccessMessage: 'お問い合わせを受付けました。回答までお待ちください。',
    contactErrorMessage: '送信中にエラーが発生しました。時間をおいて再度お試しください。',
    contactUnknownError: '不明なエラーが発生しました',
    contactValidationError: '入力内容に不備があります',
    contactNameRequired: 'お名前を入力してください',
    contactNameTooShort: 'お名前は2文字以上で入力してください',
    contactNameTooLong: 'お名前は100文字以内で入力してください',
    contactEmailRequired: 'メールアドレスを入力してください',
    contactEmailInvalid: '正しいメールアドレスを入力してください',
    contactSubjectRequired: '件名を入力してください',
    contactSubjectTooShort: '件名は5文字以上で入力してください',
    contactSubjectTooLong: '件名は200文字以内で入力してください',
    contactMessageRequired: 'メッセージを入力してください',
    contactMessageTooShort: 'メッセージは10文字以上で入力してください',
    contactMessageTooLong: 'メッセージは2000文字以内で入力してください',
    contactNoticeTitle: 'ご利用にあたって',
    contactNotice1: '回答には数日お時間をいただく場合があります',
    contactNotice2: 'お問い合わせ内容によっては回答できない場合があります',
    contactNotice3: 'セキュリティに関わる内容は公開されません'
  },
  
  en: {
    // App title and subtitle
    title: 'ZipSig',
    subtitle: 'Digital File Signature System',
    
    // Time status
    utcTime: 'UTC Time:',
    localTime: 'Local:',
    apiOnline: 'API Online',
    apiOffline: 'API Offline',
    checking: 'Checking',
    
    // Mode buttons
    sign: 'Sign',
    verify: 'Verify',
    extract: 'Extract',
    faq: 'FAQ',
    
    // Sign section
    selectFilesOrFolder: 'Select Files or Folder',
    dragAndDrop: 'Drag & drop or click to select',
    selectFiles: 'Select Files',
    selectFolder: 'Select Folder',
    selectedFiles: 'Selected Files',
    filesCount: ' files',
    creatorId: 'Creator ID',
    creatorIdPlaceholder: 'Enter your identifier',
    generateSignedZip: 'Generate Signed ZIP',
    generating: 'Generating...',
    
    // Security and privacy
    securityTitle: 'Complete Client-Side Processing',
    clientSideProcessing: 'All operations performed within your browser',
    noServerStorage: 'Files are never stored on any server',
    completePrivacy: 'Private keys and data never leave your device',
    
    // Encryption
    enableEncryption: 'Create with password protection',
    encryptionInfo: 'About Encryption',
    encryptionInfoTitle: 'ZipSig Encryption',
    encryptionInfoContent: 'ZipSig encryption differs from typical ZIP passwords.\n\n【ZipSig Encryption Method】\n• Encrypts individual files, not the ZIP itself\n• Uses AES-256-CBC encryption algorithm\n• PBKDF2 key derivation (100,000 iterations)\n• Generates unique IV (Initialization Vector) and salt per file\n\n【Security Features】\n• High security through independent file encryption\n• Password doesn\'t affect pre-encryption hash calculation\n• Encryption status recorded in signature verification\n• Robust implementation using browser WebCrypto API\n\n【Difference from Regular ZIP Passwords】\n• ZIP Password: Protects entire ZIP (relatively weak encryption)\n• ZipSig: AES-256 encryption per file (strong protection)',
    encryptionPassword: 'Password',
    encryptionPasswordPlaceholder: 'Enter password',
    encryptionPasswordConfirm: 'Confirm Password',
    encryptionPasswordConfirmPlaceholder: 'Re-enter password',
    passwordMismatch: 'Passwords do not match',
    passwordRequired: 'Please enter a password',
    passwordTooShort: 'Password must be at least 8 characters',
    generatePassword: 'Generate',
    
    // Verify section
    verifySignedZip: 'Verify Signed ZIP File',
    dropZipToVerify: 'Drop ZIP file to verify signature',
    verificationSuccess: 'Verification Successful',
    verificationFailed: 'Verification Failed',
    creator: 'Creator:',
    createdAt: 'Created:',
    hash: 'Hash:',
    privateKeyVerification: 'Additional Verification with Private Key (Optional)',
    dropPrivateKey: 'Drop private key (.pem) for identity verification',
    privateKeySuccess: 'Private Key Verification Successful',
    privateKeyFailed: 'Private Key Verification Failed',
    privateKeyMatched: 'Private key matched',
    privateKeyNotMatched: 'Private key does not match',
    
    // Verification warnings and limitations
    verificationLimitations: 'What Can and Cannot Be Verified',
    whatZipsigGuarantees: 'What ZipSig Guarantees',
    whatZipsigDoesNotGuarantee: 'What ZipSig Does NOT Guarantee',
    zipsigGuaranteesList: '• ZIP has not been tampered with since signing\n• Signature can be correctly verified',
    zipsigNotGuaranteesList: '• Whether this ZIP is the "original"\n• Whether the signer is the authentic creator\n• Context of when/where the signer published this',
    privateKeyExplanation: 'About Signer Identity Verification',
    privateKeyDescription: 'ZipSig is signed at creation time and can be verified by anyone. To truly prove "this signature belongs to you personally," you need the private key file generated during signing.',
    privateKeyTips: 'If you give your private key to others, anyone can sign on your behalf. Please handle with care.',
    miniTips: 'ZipSig = Tamper Detection + Signature Verification\nAuthenticity is up to your eyes and context.',
    
    // Decryption
    fileStructure: 'File Structure',
    encryptedFiles: 'Encrypted Files',
    enterPassword: 'Enter Password',
    passwordForDecryption: 'Decryption Password',
    decrypt: 'Decrypt',
    decrypting: 'Decrypting...',
    decryptionSuccess: 'Decryption Successful',
    decryptionFailed: 'Decryption Failed',
    downloadFile: 'Download File',
    downloadAll: 'Download All',
    wrongPassword: 'Incorrect password',
    noEncryptedFiles: 'No encrypted files found',
    
    // Extract section
    extractEncryptedZip: 'Extract Encrypted ZIP File',
    extractDescription: 'Decrypt and extract ZipSig encrypted ZIP files to retrieve original files',
    dropZipToExtract: 'Drop ZIP file to extract',
    dragAndDropExtract: 'Drag & drop ZIP file here',
    dropNow: 'Drop here now',
    zipInfo: 'ZIP File Information',
    fileCount: 'File Count',
    encrypted: 'Encrypted',
    yes: 'Yes',
    no: 'No',
    extractPassword: 'Extraction Password',
    extractPasswordPlaceholder: 'Enter password',
    extractFiles: 'Extract Files',
    extracting: 'Extracting...',
    extractedFiles: 'Extracted Files',
    
    // Notifications
    signedZipGenerated: 'Signed ZIP file has been generated',
    
    // Error messages
    noZipsigFile: 'No .zipsig file found',
    fileModified: 'File contents have been modified',
    invalidSignature: 'Invalid signature',
    error: 'Error',
    
    // FAQ
    faqTitle: 'FAQ',
    faqSubtitle: 'Frequently Asked Questions',
    faqWhat: 'What is ZipSig?',
    faqWhatAnswer: 'ZipSig is a tool for safely sharing your work and files. It adds a digital certificate to ZIP files that proves "I created this" and prevents others from changing your content or claiming it as their own. Think of it like a digital signature or stamp that can\'t be forged.',
    faqZipContents: 'What is included in the ZIP file?',
    faqZipContentsAnswer: 'Your ZipSig ZIP contains your original files plus these certificates:\n\n• .zipsig - Certificate file (creator name, creation date, tamper-check info)\n• foldername_private_key.pem - Your personal key file (for identity verification, keep it safe)\n• foldername_password.txt - Password (only if you chose encryption)\n\nThese files prove the ZIP is authentic and hasn\'t been tampered with.',
    faqSignature: 'What is a "signature"?',
    faqSignatureAnswer: 'A "signature" is like a physical stamp or seal, but digital and much more secure:\n\n• Handwritten signature → Can be copied easily\n• ZipSig signature → Impossible to copy, breaks if content changes\n\nFor example, if someone changes even one letter in your work, the signature becomes "broken" and everyone can see it was tampered with. It\'s much safer than handwritten signatures.',
    faqZipsigFile: 'What information is in the certificate (.zipsig)?',
    faqZipsigFileAnswer: 'The certificate contains the following information:\n\n• Creator name - The name you entered\n• Creation date - When you signed it\n• File fingerprint - For checking if content was changed\n• Verification key - To confirm the signature is real\n• Signature data - Proof it hasn\'t been tampered with\n\n※This certificate can be viewed by anyone (no passwords or secrets inside)',
    faqKeyPem: 'What is foldername_private_key.pem? Do I need to keep it?',
    faqKeyPemAnswer: 'foldername_private_key.pem is your personal "seal" file.\n\n• Purpose: To prove "this signature was definitely made by me"\n• Storage: Usually not needed, but save it if:\n\n【Save it if you want to:】\n• Create the same signature again later\n• Prove legal ownership if needed\n• Maintain long-term copyright claims\n\nStorage: USB drive, Google Drive, etc. (somewhere safe)\nWarning: If you give this file to others, they can sign using your name',
    faqVerification: 'Can recipients check if the ZIP is authentic?',
    faqVerificationAnswer: 'Yes! It\'s very easy.\n\n【How to verify】\n1. Open ZipSig website\n2. Click "Verify" tab\n3. Drag & drop the ZIP file\n\n【What can be checked】\n• Files haven\'t been tampered with\n• Signature is authentic\n• Creator name & creation date\n• What files are included\n\nNo special software needed - anyone can verify for free.',
    faqEncryption: 'What is password protection?',
    faqEncryptionAnswer: 'Use this when you want to share files with specific people only.\n\n【With password protection】\n• File contents are completely hidden\n• Only people with the password can open files\n• File list and structure are still visible\n• Tamper-checking by signature still works\n\n【Without password protection】\n• Anyone can open and view files\n• Tamper-checking by signature works\n\nExample: Use password protection for confidential documents you want to send to specific people only',
    faqTarget: 'Who should use this tool?',
    faqTargetAnswer: 'Recommended for the following people:\n\n**Creators**\n• Artists, photographers, musicians sharing their work\n• Anyone wanting to prove "this is my creation"\n\n**Researchers & Writers**\n• Protecting copyright of papers and articles\n• Preventing data tampering\n\n**Business Use**\n• Safely sending important documents\n• Preventing tampering of contracts and specifications\n\n**General Users**\n• Safely storing and sharing family photos and memories',
    faqLegal: 'Can this be used as legal proof?',
    faqLegalAnswer: 'ZipSig has a solid tamper-detection mechanism, so it may be valid evidence in legal situations.\n\n**Strengths**\n• Technically difficult to tamper with\n• Creation date is accurately recorded\n• Creator can be identified\n\n**Important Notes**\n• Cannot guarantee 100% legal validity\n• Please consider it as "supporting evidence"\n• Consult experts for important cases\n\n**Practical Use**\nUseful as "situational evidence" in copyright disputes',
    faqFree: 'Are there any fees?',
    faqFreeAnswer: '**Completely free!**\n\n**Costs**\n• Usage fee: $0\n• Number of signatures: Unlimited\n• File size: No limit\n• Ads: None\n\n**About Support**\nIf you think "I want ZipSig to continue," the developer would be very happy if you support via Buy Me a Coffee (optional).\n\n**Security**\nAll processing is completed within your browser, and files are never sent externally.',
    
    // Contact
    contact: 'Contact',
    contactSubtitle: 'We would love to hear from you with any questions or feedback',
    contactName: 'Name',
    contactNamePlaceholder: 'Enter your name',
    contactEmail: 'Email Address',
    contactEmailPlaceholder: 'your@email.com',
    contactType: 'Inquiry Type',
    contactTypeQuestion: 'Question/Inquiry',
    contactTypeBug: 'Bug Report',
    contactTypeFeature: 'Feature Request',
    contactTypeOther: 'Other',
    contactSubject: 'Subject',
    contactSubjectPlaceholder: 'Enter the subject of your inquiry',
    contactMessage: 'Message',
    contactMessagePlaceholder: 'Please provide detailed information...',
    contactSend: 'Send Message',
    contactSending: 'Sending...',
    contactSuccessMessage: 'Your inquiry has been received. Please wait for our response.',
    contactErrorMessage: 'An error occurred while sending. Please try again later.',
    contactUnknownError: 'An unknown error occurred',
    contactValidationError: 'There are errors in your input',
    contactNameRequired: 'Please enter your name',
    contactNameTooShort: 'Name must be at least 2 characters',
    contactNameTooLong: 'Name must be 100 characters or less',
    contactEmailRequired: 'Please enter your email address',
    contactEmailInvalid: 'Please enter a valid email address',
    contactSubjectRequired: 'Please enter a subject',
    contactSubjectTooShort: 'Subject must be at least 5 characters',
    contactSubjectTooLong: 'Subject must be 200 characters or less',
    contactMessageRequired: 'Please enter a message',
    contactMessageTooShort: 'Message must be at least 10 characters',
    contactMessageTooLong: 'Message must be 2000 characters or less',
    contactNoticeTitle: 'Notice',
    contactNotice1: 'Response may take several days',
    contactNotice2: 'Some inquiries may not receive a response',
    contactNotice3: 'Security-related content will not be disclosed publicly'
  }
};

export const useTranslation = (language: Language) => {
  return translations[language];
};