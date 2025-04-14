import { useState, useEffect } from 'react';

export type LanguageCode = 'ru' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'zh' | 'ja' | 'ar' | 'pt' | 'hi';

interface Language {
  code: LanguageCode;
  name: string;
}

interface LocalizedTexts {
  // Auth
  signIn: string;
  signUp: string;
  password: string;
  username: string;
  usernamePlaceholder: string;
  authDescription: string;
  error: string;
  fillAllFields: string;
  selectLanguage: string;
  
  // Settings
  settings: string;
  appearance: string;
  configureApp: string;
  language: string;
  theme: string;
  selectTheme: string;
  light: string;
  dark: string;
  system: string;
  saveSettings: string;
  profile: string;
  manageProfile: string;
  enterUsername: string;
  avatar: string;
  uploadAvatar: string;
  updateProfile: string;
  account: string;
  manageAccount: string;
  signOut: string;
  settingsSaved: string;
  settingsSavedDesc: string;
  profileUpdated: string;
  profileUpdatedDesc: string;
  avatarUploaded: string;
  dontForgetToSave: string;
  uploadError: string;
  
  // Chat
  welcome: string;
  welcomeDescription: string;
  newChat: string;
  deleteChat: string;
  renameChat: string;
  search: string;
  writeMessage: string;
  send: string;
  noChats: string;
  loadingChats: string;
  confirmDelete: string;
  cancel: string;
  delete: string;
  rename: string;
  chatDeleted: string;
  chatRenamed: string;
  yes: string;
  no: string;
}

const languages: Language[] = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ar', name: 'العربية' },
  { code: 'pt', name: 'Português' },
  { code: 'hi', name: 'हिंदी' }
];

const translations: Record<LanguageCode, LocalizedTexts> = {
  en: {
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    password: 'Password',
    username: 'Username',
    usernamePlaceholder: 'username',
    authDescription: 'Login to your personal AI assistant',
    error: 'Error',
    fillAllFields: 'Please fill in all fields',
    selectLanguage: 'Select language',
    
    // Settings
    settings: 'Settings',
    appearance: 'Appearance',
    configureApp: 'Configure language and theme of the application',
    language: 'Language',
    theme: 'Theme',
    selectTheme: 'Select theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    saveSettings: 'Save settings',
    profile: 'Profile',
    manageProfile: 'Manage your profile',
    enterUsername: 'Enter username',
    avatar: 'Avatar',
    uploadAvatar: 'Upload avatar',
    updateProfile: 'Update profile',
    account: 'Account',
    manageAccount: 'Manage your account',
    signOut: 'Sign out',
    settingsSaved: 'Settings saved',
    settingsSavedDesc: 'Your settings have been successfully saved',
    profileUpdated: 'Profile updated',
    profileUpdatedDesc: 'Your profile has been successfully updated',
    avatarUploaded: 'Avatar uploaded',
    dontForgetToSave: 'Don\'t forget to save changes',
    uploadError: 'Upload error',

    // Chat
    welcome: 'Hello! I am SenterosAI',
    welcomeDescription: 'I am a super-friendly and helpful assistant, ready to help you with any questions! (●\'◡\'●)',
    newChat: 'New chat',
    deleteChat: 'Delete chat',
    renameChat: 'Rename chat',
    search: 'Search',
    writeMessage: 'Write a message...',
    send: 'Send',
    noChats: 'No chats yet',
    loadingChats: 'Loading chats...',
    confirmDelete: 'Are you sure you want to delete this chat?',
    cancel: 'Cancel',
    delete: 'Delete',
    rename: 'Rename',
    chatDeleted: 'Chat deleted',
    chatRenamed: 'Chat renamed',
    yes: 'Yes',
    no: 'No'
  },
  ru: {
    // Auth
    signIn: 'Вход',
    signUp: 'Регистрация',
    password: 'Пароль',
    username: 'Имя пользователя',
    usernamePlaceholder: 'имя пользователя',
    authDescription: 'Вход в вашего персонального ИИ-ассистента',
    error: 'Ошибка',
    fillAllFields: 'Пожалуйста, заполните все поля',
    selectLanguage: 'Выберите язык',
    
    // Settings
    settings: 'Настройки',
    appearance: 'Внешний вид',
    configureApp: 'Настройте язык и тему приложения',
    language: 'Язык',
    theme: 'Тема',
    selectTheme: 'Выберите тему',
    light: 'Светлая',
    dark: 'Темная',
    system: 'Системная',
    saveSettings: 'Сохранить настройки',
    profile: 'Профиль',
    manageProfile: 'Управление профилем',
    enterUsername: 'Введите имя пользователя',
    avatar: 'Аватар',
    uploadAvatar: 'Загрузить аватар',
    updateProfile: 'Обновить профиль',
    account: 'Аккаунт',
    manageAccount: 'Управление вашим аккаунтом',
    signOut: 'Выйти из аккаунта',
    settingsSaved: 'Настройки сохранены',
    settingsSavedDesc: 'Ваши настройки были успешно сохранены',
    profileUpdated: 'Профиль обновлен',
    profileUpdatedDesc: 'Ваш профиль был успешно обновлен',
    avatarUploaded: 'Аватар загружен',
    dontForgetToSave: 'Не забудьте сохранить изменения',
    uploadError: 'Ошибка загрузки',

    // Chat
    welcome: 'Привет! Я СентеросАИ', // Updated SenterosAI translation
    welcomeDescription: 'Я супер-дружелюбный и полезный ассистент, готовый помочь вам с любыми вопросами! (●\'◡\'●)',
    newChat: 'Новый чат', // Confirmed translation
    deleteChat: 'Удалить чат',
    renameChat: 'Переименовать чат',
    search: 'Поиск',
    writeMessage: 'Напишите сообщение...',
    send: 'Отправить',
    noChats: 'Нет чатов',
    loadingChats: 'Загрузка чатов...',
    confirmDelete: 'Вы уверены, что хотите удалить этот чат?',
    cancel: 'Отмена',
    delete: 'Удалить',
    rename: 'Переименовать',
    chatDeleted: 'Чат удален',
    chatRenamed: 'Чат переименован',
    yes: 'Да',
    no: 'Нет'
  },
  es: {
    // Auth
    signIn: 'Iniciar sesión',
    signUp: 'Registrarse',
    password: 'Contraseña',
    username: 'Nombre de usuario',
    usernamePlaceholder: 'nombre de usuario',
    authDescription: 'Inicia sesión en tu asistente de IA personal',
    error: 'Error',
    fillAllFields: 'Por favor, rellena todos los campos',
    selectLanguage: 'Seleccionar idioma',
    
    // Settings
    settings: 'Configuración',
    appearance: 'Apariencia',
    configureApp: 'Configura el idioma y el tema de la aplicación',
    language: 'Idioma',
    theme: 'Tema',
    selectTheme: 'Seleccionar tema',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema',
    saveSettings: 'Guardar configuración',
    profile: 'Perfil',
    manageProfile: 'Gestionar tu perfil',
    enterUsername: 'Introducir nombre de usuario',
    avatar: 'Avatar',
    uploadAvatar: 'Subir avatar',
    updateProfile: 'Actualizar perfil',
    account: 'Cuenta',
    manageAccount: 'Gestionar tu cuenta',
    signOut: 'Cerrar sesión',
    settingsSaved: 'Configuración guardada',
    settingsSavedDesc: 'Tu configuración se ha guardado correctamente',
    profileUpdated: 'Perfil actualizado',
    profileUpdatedDesc: 'Tu perfil se ha actualizado correctamente',
    avatarUploaded: 'Avatar subido',
    dontForgetToSave: 'No olvides guardar los cambios',
    uploadError: 'Error de subida',

    // Chat
    welcome: '¡Hola! Soy SenterosAI',
    welcomeDescription: 'Soy un asistente súper amigable y útil, ¡listo para ayudarte con cualquier pregunta! (●\'◡\'●)',
    newChat: 'Nuevo chat',
    deleteChat: 'Eliminar chat',
    renameChat: 'Renombrar chat',
    search: 'Buscar',
    writeMessage: 'Escribe un mensaje...',
    send: 'Enviar',
    noChats: 'No hay chats todavía',
    loadingChats: 'Cargando chats...',
    confirmDelete: '¿Estás seguro de que quieres eliminar este chat?',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    rename: 'Renombrar',
    chatDeleted: 'Chat eliminado',
    chatRenamed: 'Chat renombrado',
    yes: 'Sí',
    no: 'No'
  },
  fr: {
    // Auth
    signIn: 'Connexion',
    signUp: 'Inscription',
    password: 'Mot de passe',
    username: 'Nom d\'utilisateur',
    usernamePlaceholder: 'nom d\'utilisateur',
    authDescription: 'Connectez-vous à votre assistant IA personnel',
    error: 'Erreur',
    fillAllFields: 'Veuillez remplir tous les champs',
    selectLanguage: 'Sélectionner la langue',
    
    // Settings
    settings: 'Paramètres',
    appearance: 'Apparence',
    configureApp: 'Configurez la langue et le thème de l\'application',
    language: 'Langue',
    theme: 'Thème',
    selectTheme: 'Sélectionner le thème',
    light: 'Clair',
    dark: 'Sombre',
    system: 'Système',
    saveSettings: 'Enregistrer les paramètres',
    profile: 'Profil',
    manageProfile: 'Gérer votre profil',
    enterUsername: 'Entrez votre nom d\'utilisateur',
    avatar: 'Avatar',
    uploadAvatar: 'Télécharger l\'avatar',
    updateProfile: 'Mettre à jour le profil',
    account: 'Compte',
    manageAccount: 'Gérer votre compte',
    signOut: 'Déconnexion',
    settingsSaved: 'Paramètres enregistrés',
    settingsSavedDesc: 'Vos paramètres ont été enregistrés avec succès',
    profileUpdated: 'Profil mis à jour',
    profileUpdatedDesc: 'Votre profil a été mis à jour avec succès',
    avatarUploaded: 'Avatar téléchargé',
    dontForgetToSave: 'N\'oubliez pas d\'enregistrer les modifications',
    uploadError: 'Erreur de téléchargement',

    // Chat
    welcome: 'Bonjour ! Je suis SenterosAI',
    welcomeDescription: 'Je suis un assistant super sympathique et utile, prêt à vous aider avec toutes vos questions ! (●\'◡\'●)',
    newChat: 'Nouvelle conversation',
    deleteChat: 'Supprimer la conversation',
    renameChat: 'Renommer la conversation',
    search: 'Rechercher',
    writeMessage: 'Écrivez un message...',
    send: 'Envoyer',
    noChats: 'Pas encore de conversations',
    loadingChats: 'Chargement des conversations...',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer cette conversation ?',
    cancel: 'Annuler',
    delete: 'Supprimer',
    rename: 'Renommer',
    chatDeleted: 'Conversation supprimée',
    chatRenamed: 'Conversation renommée',
    yes: 'Oui',
    no: 'Non'
  },
  de: {
    // Auth
    signIn: 'Anmelden',
    signUp: 'Registrieren',
    password: 'Passwort',
    username: 'Benutzername',
    usernamePlaceholder: 'benutzername',
    authDescription: 'Melden Sie sich bei Ihrem persönlichen KI-Assistenten an',
    error: 'Fehler',
    fillAllFields: 'Bitte füllen Sie alle Felder aus',
    selectLanguage: 'Sprache auswählen',
    
    // Settings
    settings: 'Einstellungen',
    appearance: 'Aussehen',
    configureApp: 'Konfigurieren Sie Sprache und Thema der Anwendung',
    language: 'Sprache',
    theme: 'Thema',
    selectTheme: 'Thema auswählen',
    light: 'Hell',
    dark: 'Dunkel',
    system: 'System',
    saveSettings: 'Einstellungen speichern',
    profile: 'Profil',
    manageProfile: 'Verwalten Sie Ihr Profil',
    enterUsername: 'Benutzernamen eingeben',
    avatar: 'Avatar',
    uploadAvatar: 'Avatar hochladen',
    updateProfile: 'Profil aktualisieren',
    account: 'Konto',
    manageAccount: 'Verwalten Sie Ihr Konto',
    signOut: 'Abmelden',
    settingsSaved: 'Einstellungen gespeichert',
    settingsSavedDesc: 'Ihre Einstellungen wurden erfolgreich gespeichert',
    profileUpdated: 'Profil aktualisiert',
    profileUpdatedDesc: 'Ihr Profil wurde erfolgreich aktualisiert',
    avatarUploaded: 'Avatar hochgeladen',
    dontForgetToSave: 'Vergessen Sie nicht, die Änderungen zu speichern',
    uploadError: 'Uploadfehler',

    // Chat
    welcome: 'Hallo! Ich bin SenterosAI',
    welcomeDescription: 'Ich bin ein super freundlicher und hilfreicher Assistent, bereit, Ihnen bei allen Fragen zu helfen! (●\'◡\'●)',
    newChat: 'Neuer Chat',
    deleteChat: 'Chat löschen',
    renameChat: 'Chat umbenennen',
    search: 'Suchen',
    writeMessage: 'Nachricht schreiben...',
    send: 'Senden',
    noChats: 'Noch keine Chats',
    loadingChats: 'Chats werden geladen...',
    confirmDelete: 'Sind Sie sicher, dass Sie diesen Chat löschen möchten?',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    rename: 'Umbenennen',
    chatDeleted: 'Chat gelöscht',
    chatRenamed: 'Chat umbenannt',
    yes: 'Ja',
    no: 'Nein'
  },
  it: {
    // Auth
    signIn: 'Accedi',
    signUp: 'Registrati',
    password: 'Password',
    username: 'Nome utente',
    usernamePlaceholder: 'nome utente',
    authDescription: 'Accedi al tuo assistente AI personale',
    error: 'Errore',
    fillAllFields: 'Per favore, compila tutti i campi',
    selectLanguage: 'Seleziona lingua',
    
    // Settings
    settings: 'Impostazioni',
    appearance: 'Aspetto',
    configureApp: 'Configura la lingua e il tema dell\'applicazione',
    language: 'Lingua',
    theme: 'Tema',
    selectTheme: 'Seleziona tema',
    light: 'Chiaro',
    dark: 'Scuro',
    system: 'Sistema',
    saveSettings: 'Salva impostazioni',
    profile: 'Profilo',
    manageProfile: 'Gestisci il tuo profilo',
    enterUsername: 'Inserisci nome utente',
    avatar: 'Avatar',
    uploadAvatar: 'Carica avatar',
    updateProfile: 'Aggiorna profilo',
    account: 'Account',
    manageAccount: 'Gestisci il tuo account',
    signOut: 'Disconnettiti',
    settingsSaved: 'Impostazioni salvate',
    settingsSavedDesc: 'Le tue impostazioni sono state salvate con successo',
    profileUpdated: 'Profilo aggiornato',
    profileUpdatedDesc: 'Il tuo profilo è stato aggiornato con successo',
    avatarUploaded: 'Avatar caricato',
    dontForgetToSave: 'Non dimenticare di salvare le modifiche',
    uploadError: 'Errore di caricamento',

    // Chat
    welcome: 'Ciao! Sono SenterosAI',
    welcomeDescription: 'Sono un assistente super amichevole e utile, pronto ad aiutarti con qualsiasi domanda! (●\'◡\'●)',
    newChat: 'Nuova chat',
    deleteChat: 'Elimina chat',
    renameChat: 'Rinomina chat',
    search: 'Cerca',
    writeMessage: 'Scrivi un messaggio...',
    send: 'Invia',
    noChats: 'Ancora nessuna chat',
    loadingChats: 'Caricamento chat...',
    confirmDelete: 'Sei sicuro di voler eliminare questa chat?',
    cancel: 'Annulla',
    delete: 'Elimina',
    rename: 'Rinomina',
    chatDeleted: 'Chat eliminata',
    chatRenamed: 'Chat rinominata',
    yes: 'Sì',
    no: 'No'
  },
  zh: {
    // Auth
    signIn: '登录',
    signUp: '注册',
    password: '密码',
    username: '用户名',
    usernamePlaceholder: '用户名',
    authDescription: '登录您的个人AI助手',
    error: '错误',
    fillAllFields: '请填写所有字段',
    selectLanguage: '选择语言',
    
    // Settings
    settings: '设置',
    appearance: '外观',
    configureApp: '配置应用程序的语言和主题',
    language: '语言',
    theme: '主题',
    selectTheme: '选择主题',
    light: '浅色',
    dark: '深色',
    system: '系统',
    saveSettings: '保存设置',
    profile: '个人资料',
    manageProfile: '管理您的个人资料',
    enterUsername: '输入用户名',
    avatar: '头像',
    uploadAvatar: '上传头像',
    updateProfile: '更新个人资料',
    account: '账户',
    manageAccount: '管理您的账户',
    signOut: '退出登录',
    settingsSaved: '设置已保存',
    settingsSavedDesc: '您的设置已成功保存',
    profileUpdated: '个人资料已更新',
    profileUpdatedDesc: '您的个人资料已成功更新',
    avatarUploaded: '头像已上传',
    dontForgetToSave: '别忘了保存更改',
    uploadError: '上传错误',

    // Chat
    welcome: '你好！我是SenterosAI',
    welcomeDescription: '我是一个超级友好和有用的助手，随时准备帮助您解答任何问题！(●\'◡\'●)',
    newChat: '新聊天',
    deleteChat: '删除聊天',
    renameChat: '重命名聊天',
    search: '搜索',
    writeMessage: '写一条消息...',
    send: '发送',
    noChats: '暂无聊天',
    loadingChats: '加载聊天中...',
    confirmDelete: '您确定要删除此聊天吗？',
    cancel: '取消',
    delete: '删除',
    rename: '重命名',
    chatDeleted: '聊天已删除',
    chatRenamed: '聊天已重命名',
    yes: '是',
    no: '否'
  },
  ja: {
    // Auth
    signIn: 'ログイン',
    signUp: '登録',
    password: 'パスワード',
    username: 'ユーザー名',
    usernamePlaceholder: 'ユーザー名',
    authDescription: 'あなたの個人AIアシスタントにログイン',
    error: 'エラー',
    fillAllFields: 'すべてのフィールドに入力してください',
    selectLanguage: '言語を選択',
    
    // Settings
    settings: '設定',
    appearance: '外観',
    configureApp: 'アプリケーションの言語とテーマを設定',
    language: '言語',
    theme: 'テーマ',
    selectTheme: 'テーマを選択',
    light: 'ライト',
    dark: 'ダーク',
    system: 'システム',
    saveSettings: '設定を保存',
    profile: 'プロフィール',
    manageProfile: 'プロフィールを管理',
    enterUsername: 'ユーザー名を入力',
    avatar: 'アバター',
    uploadAvatar: 'アバターをアップロード',
    updateProfile: 'プロフィールを更新',
    account: 'アカウント',
    manageAccount: 'アカウントを管理',
    signOut: 'ログアウト',
    settingsSaved: '設定が保存されました',
    settingsSavedDesc: '設定が正常に保存されました',
    profileUpdated: 'プロフィールが更新されました',
    profileUpdatedDesc: 'プロフィールが正常に更新されました',
    avatarUploaded: 'アバターがアップロードされました',
    dontForgetToSave: '変更を保存することを忘れないでください',
    uploadError: 'アップロードエラー',

    // Chat
    welcome: 'こんにちは！SenterosAIです',
    welcomeDescription: '私はとてもフレンドリーで役立つアシスタントで、どんな質問にもお答えする準備ができています！(●\'◡\'●)',
    newChat: '新しいチャット',
    deleteChat: 'チャットを削除',
    renameChat: 'チャットの名前を変更',
    search: '検索',
    writeMessage: 'メッセージを書く...',
    send: '送信',
    noChats: 'まだチャットがありません',
    loadingChats: 'チャットを読み込み中...',
    confirmDelete: 'このチャットを削除してもよろしいですか？',
    cancel: 'キャンセル',
    delete: '削除',
    rename: '名前を変更',
    chatDeleted: 'チャットが削除されました',
    chatRenamed: 'チャットの名前が変更されました',
    yes: 'はい',
    no: 'いいえ'
  },
  ar: {
    // Auth
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    password: 'كلمة المرور',
    username: 'اسم المستخدم',
    usernamePlaceholder: 'اسم المستخدم',
    authDescription: 'تسجيل الدخول إلى مساعدك الذكاء الاصطناعي الشخصي',
    error: 'خطأ',
    fillAllFields: 'يرجى ملء جميع الحقول',
    selectLanguage: 'اختر اللغة',
    
    // Settings
    settings: 'الإعدادات',
    appearance: 'المظهر',
    configureApp: 'تكوين لغة وسمة التطبيق',
    language: 'اللغة',
    theme: 'السمة',
    selectTheme: 'اختر السمة',
    light: 'فاتح',
    dark: 'داكن',
    system: 'النظام',
    saveSettings: 'حفظ الإعدادات',
    profile: 'الملف الشخصي',
    manageProfile: 'إدارة ملفك الشخصي',
    enterUsername: 'أدخل اسم المستخدم',
    avatar: 'الصورة الرمزية',
    uploadAvatar: 'تحميل الصورة الرمزية',
    updateProfile: 'تحديث الملف الشخصي',
    account: 'الحساب',
    manageAccount: 'إدارة حسابك',
    signOut: 'تسجيل الخروج',
    settingsSaved: 'تم حفظ الإعدادات',
    settingsSavedDesc: 'تم حفظ إعداداتك بنجاح',
    profileUpdated: 'تم تحديث الملف الشخصي',
    profileUpdatedDesc: 'تم تحديث ملفك الشخصي بنجاح',
    avatarUploaded: 'تم تحميل الصورة الرمزية',
    dontForgetToSave: 'لا تنس حفظ التغييرات',
    uploadError: 'خطأ في التحميل',

    // Chat
    welcome: 'مرحبًا! أنا SenterosAI',
    welcomeDescription: 'أنا مساعد ودود ومفيد للغاية، جاهز لمساعدتك في أي أسئلة! (●\'◡\'●)',
    newChat: 'محادثة جديدة',
    deleteChat: 'حذف المحادثة',
    renameChat: 'إعادة تسمية المحادثة',
    search: 'بحث',
    writeMessage: 'اكتب رسالة...',
    send: 'إرسال',
    noChats: 'لا توجد محادثات بعد',
    loadingChats: 'جاري تحميل المحادثات...',
    confirmDelete: 'هل أنت متأكد أنك تريد حذف هذه المحادثة؟',
    cancel: 'إلغاء',
    delete: 'حذف',
    rename: 'إعادة تسمية',
    chatDeleted: 'تم حذف المحادثة',
    chatRenamed: 'تمت إعادة تسمية المحادثة',
    yes: 'نعم',
    no: 'لا'
  },
  pt: {
    // Auth
    signIn: 'Entrar',
    signUp: 'Cadastrar',
    password: 'Senha',
    username: 'Nome de usuário',
    usernamePlaceholder: 'nome de usuário',
    authDescription: 'Entre no seu assistente de IA pessoal',
    error: 'Erro',
    fillAllFields: 'Por favor, preencha todos os campos',
    selectLanguage: 'Selecionar idioma',
    
    // Settings
    settings: 'Configurações',
    appearance: 'Aparência',
    configureApp: 'Configure o idioma e o tema do aplicativo',
    language: 'Idioma',
    theme: 'Tema',
    selectTheme: 'Selecionar tema',
    light: 'Claro',
    dark: 'Escuro',
    system: 'Sistema',
    saveSettings: 'Salvar configurações',
    profile: 'Perfil',
    manageProfile: 'Gerenciar seu perfil',
    enterUsername: 'Digite o nome de usuário',
    avatar: 'Avatar',
    uploadAvatar: 'Carregar avatar',
    updateProfile: 'Atualizar perfil',
    account: 'Conta',
    manageAccount: 'Gerenciar sua conta',
    signOut: 'Sair',
    settingsSaved: 'Configurações salvas',
    settingsSavedDesc: 'Suas configurações foram salvas com sucesso',
    profileUpdated: 'Perfil atualizado',
    profileUpdatedDesc: 'Seu perfil foi atualizado com sucesso',
    avatarUploaded: 'Avatar carregado',
    dontForgetToSave: 'Não se esqueça de salvar as alterações',
    uploadError: 'Erro de carregamento',

    // Chat
    welcome: 'Olá! Eu sou SenterosAI',
    welcomeDescription: 'Eu sou um assistente super amigável e útil, pronto para ajudá-lo com qualquer pergunta! (●\'◡\'●)',
    newChat: 'Nova conversa',
    deleteChat: 'Excluir conversa',
    renameChat: 'Renomear conversa',
    search: 'Pesquisar',
    writeMessage: 'Escreva uma mensagem...',
    send: 'Enviar',
    noChats: 'Ainda não há conversas',
    loadingChats: 'Carregando conversas...',
    confirmDelete: 'Tem certeza de que deseja excluir esta conversa?',
    cancel: 'Cancelar',
    delete: 'Excluir',
    rename: 'Renomear',
    chatDeleted: 'Conversa excluída',
    chatRenamed: 'Conversa renomeada',
    yes: 'Sim',
    no: 'Não'
  },
  hi: {
    // Auth
    signIn: 'लॉग इन करें',
    signUp: 'साइन अप करें',
    password: 'पासवर्ड',
    username: 'उपयोगकर्ता नाम',
    usernamePlaceholder: 'उपयोगकर्ता नाम',
    authDescription: 'अपने व्यक्तिगत AI सहायक में लॉग इन करें',
    error: 'त्रुटि',
    fillAllFields: 'कृपया सभी फ़ील्ड भरें',
    selectLanguage: 'भाषा चुनें',
    
    // Settings
    settings: 'सेटिंग्स',
    appearance: 'दिखावट',
    configureApp: 'एप्लिकेशन की भाषा और थीम कॉन्फ़िगर करें',
    language: 'भाषा',
    theme: 'थीम',
    selectTheme: 'थीम चुनें',
    light: 'लाइट',
    dark: 'डार्क',
    system: 'सिस्टम',
    saveSettings: 'सेटिंग्स सहेजें',
    profile: 'प्रोफाइल',
    manageProfile: 'अपना प्रोफाइल प्रबंधित करें',
    enterUsername: 'उपयोगकर्ता नाम दर्ज करें',
    avatar: 'अवतार',
    uploadAvatar: 'अवतार अपलोड करें',
    updateProfile: 'प्रोफाइल अपडेट करें',
    account: 'खाता',
    manageAccount: 'अपना खाता प्रबंधित करें',
    signOut: 'लॉग आउट करें',
    settingsSaved: 'सेटिंग्स सहेजी गईं',
    settingsSavedDesc: 'आपकी सेटिंग्स सफलतापूर्वक सहेजी गई हैं',
    profileUpdated: 'प्रोफाइल अपडेट किया गया',
    profileUpdatedDesc: 'आपका प्रोफाइल सफलतापूर्वक अपडेट किया गया है',
    avatarUploaded: 'अवतार अपलोड किया गया',
    dontForgetToSave: 'परिवर्तनों को सहेजना न भूलें',
    uploadError: 'अपलोड त्रुटि',

    // Chat
    welcome: 'नमस्ते! मैं SenterosAI हूँ',
    welcomeDescription: 'मैं एक सुपर फ्रेंडली और सहायक असिस्टेंट हूँ, आपके किसी भी सवाल में मदद करने के लिए तैयार! (●\'◡\'●)',
    newChat: 'नई चैट',
    deleteChat: 'चैट हटाएं',
    renameChat: 'चैट का नाम बदलें',
    search: 'खोजें',
    writeMessage: 'संदेश लिखें...',
    send: 'भेजें',
    noChats: 'अभी तक कोई चैट नहीं',
    loadingChats: 'चैट लोड हो रही हैं...',
    confirmDelete: 'क्या आप वाकई इस चैट को हटाना चाहते हैं?',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    rename: 'नाम बदलें',
    chatDeleted: 'चैट हटा दी गई',
    chatRenamed: 'चैट का नाम बदल दिया गया',
    yes: 'हां',
    no: 'नहीं'
  }
};

// Get user's browser language
const getBrowserLanguage = (): LanguageCode => {
  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages = languages.map(lang => lang.code);
  
  return supportedLanguages.includes(browserLang as LanguageCode) 
    ? browserLang as LanguageCode 
    : 'en';
};

export const useAppLanguage = () => {
  const [language, setLanguage] = useState<LanguageCode>('en');

  // Load language setting from localStorage or browser settings on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as LanguageCode;
    
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // Set system language if no saved language
      const browserLanguage = getBrowserLanguage();
      setLanguage(browserLanguage);
      localStorage.setItem('language', browserLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return {
    language,
    languages,
    setLanguage,
    texts: translations[language],
  };
};
