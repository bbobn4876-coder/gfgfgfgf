import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Key, AlertCircle, CheckCircle, CreditCard as Edit, Package, Users, BarChart3, Bell, User, Globe, LogOut, Search, Plus, DollarSign, Heart, Settings, Camera, Copy, ChevronDown, Trash2, RefreshCw, Download, Wallet, Coins, Upload, MessageCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Notifications } from './services/Notifications';
import { Avatars } from './services/Avatars';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://0ec90b57d6e95fcbda19832f.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Page = 'create-order' | 'orders' | 'users' | 'dashboard' | 'project-detail' | 'admin-panel' | 'revenue' | 'settings';
type ProfileTab = 'profile' | 'settings';
type WalletTab = 'purchase' | 'transactions';
type Language = 'ru' | 'en';

function App() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('create-order');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [siteType, setSiteType] = useState<'landing' | 'multipage'>('landing');
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAvatarUploadModal, setShowAvatarUploadModal] = useState(false);
  const [profileTab, setProfileTab] = useState<ProfileTab>('profile');
  const [userName, setUserName] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [allowedIP, setAllowedIP] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletTab, setWalletTab] = useState<WalletTab>('purchase');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [isUserFilterOpen, setIsUserFilterOpen] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [revenueSearchQuery, setRevenueSearchQuery] = useState('');
  const [showInviteTokenModal, setShowInviteTokenModal] = useState(false);
  const [showAddTokensModal, setShowAddTokensModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [tokensToAdd, setTokensToAdd] = useState('');
  const [generatedInviteToken, setGeneratedInviteToken] = useState('');
  const [userAvatar, setUserAvatar] = useState('👤');
  const [allowedIPs, setAllowedIPs] = useState<string[]>([]);
  const [accountToken, setAccountToken] = useState('inv_teamleader12345');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showTokenCopied, setShowTokenCopied] = useState(false);
  const [language, setLanguage] = useState<Language>('ru');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showOrderFilterDropdown, setShowOrderFilterDropdown] = useState(false);
  // Notification sounds handled by Notifications service
  const [orderCreatedAudio] = useState(() => {
    const audio = new Audio('https://www.dropbox.com/scl/fi/zc115kxykhwx6mumcwwyl/Order-Shipped.mp3?rlkey=19yk62chwz3x6eikjqfe2xsj8&st=plp7yopw&raw=1');
    audio.preload = 'auto';
    return audio;
  });
  const previousOrdersRef = useRef<any[]>([]);
  const isInitialLoadRef = useRef(true);
  const hasPlayedLoginSoundRef = useRef(false);
  const [showUserActionsModal, setShowUserActionsModal] = useState(false);
  const [selectedUserForActions, setSelectedUserForActions] = useState<any>(null);
  const [totalDeposits, setTotalDeposits] = useState(1250);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [userTokensAdded, setUserTokensAdded] = useState(0);
  const [isWhitePageError, setIsWhitePageError] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [lastLoginTime] = useState(new Date().toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
  const [accountUsers, setAccountUsers] = useState<any[]>([]);
  const [currentUserToken, setCurrentUserToken] = useState('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingUserName, setEditingUserName] = useState('');
  const [transactions, setTransactions] = useState<Array<{date: string, amount: number, status: string, hash: string, userToken?: string}>>([]);
  const [isBottomMenuExpanded, setIsBottomMenuExpanded] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showTopUpSuccess, setShowTopUpSuccess] = useState(false);
  const [showInsufficientTokensModal, setShowInsufficientTokensModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDataRefreshed, setShowDataRefreshed] = useState(false);
  const [showDiscountUsersModal, setShowDiscountUsersModal] = useState(false);
  const [uploadedProjectFile, setUploadedProjectFile] = useState<File | null>(null);
  const [showOrderCreatedModal, setShowOrderCreatedModal] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [showOrderSentModal, setShowOrderSentModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackThanks, setShowFeedbackThanks] = useState(false);
  const [projectFiles, setProjectFiles] = useState<{[key: number]: string}>({});
  const [telegramFinanceGroup, setTelegramFinanceGroup] = useState('');
  const [telegramOrdersGroup, setTelegramOrdersGroup] = useState('');
  const [notifyOrderComplete, setNotifyOrderComplete] = useState(true);
  // Notification sounds handled by Notifications service
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const translations = {
    ru: {
      login: 'Вход',
      enterToken: 'Введите токен',
      dashboard: 'Дашборд',
      createOrder: 'Создать заказ',
      orders: 'Заказы',
      users: 'Пользователи',
      revenue: 'Доход',
      adminPanel: 'Админ панель',
      profile: 'Профиль',
      settings: 'Настройки',
      logout: 'Выход',
      name: 'Имя',
      enterName: 'Введите ваше имя',
      saveChanges: 'Сохранить изменения',
      changesSaved: 'Изменения сохранены',
      settingsSaved: 'Настройки сохранены',
      clickCameraToChange: 'Нажмите на камеру, чтобы изменить аватар',
      allowedIPs: 'Разрешенные IP',
      changesApplyTime: 'Применение изменений может занять до 10 минут',
      addAllowedIP: 'Добавить разрешенные IP:',
      enterIPAddress: 'Введите IP адрес',
      accountInviteToken: 'Пригласительный Токен Аккаунта:',
      notifications: 'Уведомления',
      notifyOrderComplete: 'Уведомлять о выполненом заказе в Telegram',
      telegramLinkDescription: 'Ссылка для подключения уведомлений через Telegram',
      search: 'Поиск',
      wallet: 'Кошелек',
      balance: 'Баланс',
      searchOrders: 'Поиск заказов',
      searchUsers: 'Поиск пользователей',
      searchByDate: 'Поиск по дате',
      maxIPsReached: 'Максимальное количество IP адресов: 3',
      maxTeamMembersReached: 'Достигнуто максимальное количество членов команды (3)',
      whitePagesCreated: 'White Page Создано',
      totalUsers: 'Всего пользователей в аккаунте',
      spentOnWhitePage: 'Израсходовано на White Page',
      personalDiscount: 'Ваша персональная скидка',
      support: 'Поддержка',
      supportTitle: 'Поддержка',
      supportDescription: 'Опишите вашу проблему и мы постараемся решить её в ближайшее время',
      contactSupport: 'Связаться с поддержкой',
      clarifyingDetails: 'Уточняющие Детали',
      projectDetails: 'Уточняющие Детали Проекта',
      actions: 'Действия',
      telegramBotOrders: 'Telegram BOT Заказы',
      telegramBotFinance: 'Telegram BOT Финансы',
      createdDate: 'Дата создания',
      status: 'Статус',
      ordersFromUsers: 'Заказы от пользователей',
      usersWithDiscount: 'Пользователи со скидкой',
      theme: 'Тема',
      whitePageCount: 'Количество White Page',
      whitePageCountShort: 'Кол-во White Page',
      language: 'Язык',
      geo: 'Гео',
      buyerNickname: 'Никнейм покупателя',
      cost: 'Стоимость',
      siteLanguage: 'Язык сайта',
      details: 'Детали',
      submit: 'Отправить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      save: 'Сохранить',
      close: 'Закрыть',
      pending: 'В ожидании',
      inProgress: 'В процессе',
      completed: 'Завершено',
      allOrders: 'Все заказы',
      totalOrders: 'Всего заказов',
      deposit: 'Пополнить',
      depositAmount: 'Сумма пополнения',
      enterAmount: 'Введите сумму',
      depositHistory: 'История пополнений',
      amount: 'Сумма',
      date: 'Дата',
      successful: 'Успешно',
      failed: 'Ошибка',
      role: 'Роль',
      teamLead: 'ТимЛид',
      teamMember: 'Член команды',
      admin: 'Админ',
      inviteToken: 'Токен приглашения',
      copyToken: 'Копировать токен',
      tokenCopied: 'Токен скопирован',
      addUser: 'Добавить пользователя',
      noOrders: 'Нет заказов',
      noUsers: 'Нет пользователей',
      loading: 'Загрузка',
      error: 'Ошибка',
      success: 'Успешно',
      projects: 'Проекты',
      tokens: 'Токены',
      spent: 'Потрачено',
      lastActivity: 'Последняя Активность',
      telegramBots: 'Telegram Боты',
      paymentHistory: 'Транзакции',
      transactionHash: 'Хеш Транзакции',
      orderCost: 'Стоимость заказа',
      orderCreator: 'Создатель заказа',
      notSpecified: 'Не указано',
      backToOrders: '← Назад к заказам',
      feedbackOnProject: 'Отзыв о проекте',
      sendFeedback: 'Отправить',
      projectFiles: 'Файлы Проекта',
      downloadProjectFiles: 'Скачать Файлы Проекта',
      projectInProgress: 'Проект в процессе выполнения',
      fileUnavailable: 'Файл недоступен для скачивания',
      statusCompleted: 'Выполнен',
      statusReady: 'Готов',
      statusPending: 'Ожидает',
      createdOrder: 'Создал заказ',
      writingLanguageLabel: 'Язык Написания',
      createInviteToken: 'Создать Пригласительный Токен Команды',
      viewActions: 'Посмотреть действия',
      refreshData: 'Обновить данные',
      refreshing: 'Обновление...',
      exportData: 'Экспорт данных',
      ipUsers: 'IP Users',
      lastLogin: 'Последний вход',
      discountSystem: 'Система скидок',
      depositOn: 'Пополнение на',
      discount5Percent: 'Скидка 5% на все последующие заказы',
      discount10Percent: 'Скидка 10% на все последующие заказы',
      specialDiscount35: 'Специальная скидка 35% на крупный заказ',
      discountsStackMessage: 'Скидки суммируются и применяются автоматически при выполнении условий',
      gotIt: 'Понятно',
      createInviteTokenTitle: 'Создать Пригласительный Токен',
      inviteTokenLabel: 'Пригласительный токен',
      tokenUsageDescription: 'Этот токен может быть использован для регистрации нового пользователя',
      ready: 'Готово',
      pasteGroupLink: 'Вставьте ссылку на группу',
      groupLinkForNotifications: 'Ссылка на группу для уведомлений',
      copyAPI: 'Скопировать API',
      copyLink: 'Скопировать ссылку',
      tokensAddedToBalance: 'Токены добавлены на ваш баланс',
      tokensSpent: 'Потрачено токенов',
      landing: 'Лендинг',
      multipage: 'Многостроничник',
      user: 'Пользователь',
      createTeamLead: 'Создать ТимЛида',
      areYouSure: 'Вы уверены?',
      deleteUser: 'Удалить пользователя',
      siteTheme: 'Тематика Сайта',
      buyerNicknameFull: 'Никнейм Баера',
      orderCostFull: 'Стоимость Заказа',
      siteThemeFull: 'Тематика сайта',
      geoFull: 'Гео',
      siteType: 'Тип сайта',
      writingLanguage: 'Язык написания',
      saveAllChanges: 'Сохранить все изменения',
      userNotifiedInCRM: 'Пользователь получил уведомление в CRM и Telegram.',
      teamLeadTokenCopied: 'Токен ТимЛида скопирован',
      memberTokenCopied: 'Токен участника скопирован',
      createTeamLeadButton: 'Создать ТимЛида',
      inviteTeamMember: 'Пригласить участника команды',
      whitePageCreated: 'White Page создана',
      allUsersInAccount: 'Всего пользователей в аккаунте',
      spentOnWhitePages: 'Израсходовано на White Page',
      yourPersonalDiscount: 'Ваша персональная скидка',
      orderSentSuccessfully: 'Заказ успешно отправлен!',
      orderSentToUser: 'Заказ был успешно отправлен пользователю.',
      allUsers: 'Все пользователи',
      activeUsers: 'Активные',
      inactiveUsers: 'Неактивные',
      minimum10: 'Минимум 10',
      feedbackPlaceholder: 'Если у вас есть уточняющие детали по поводу созданных Вайтов обязательно напишите Фидбек',
      enterTokensQuantity: 'Введите количество токенов',
      quickActions: 'Быстрые действия',
      userActivity: 'Активность пользователя',
      depositsAdded: 'Внесено депозитов',
      tokensAdded: 'Внесено токенов',
      completedOrders: 'Выполненные заказы',
      readyOrders: 'Готовые',
      dataUpdatedSuccessfully: 'Данные успешно обновлены',
      notEnoughTokens: 'Для создания заказа не хватает токенов. Пожалуйста, пополните баланс минимум на 500 токенов.',
      totalRevenue: 'Доход за все время',
      oneTimeOrder: 'Единоразовый заказ 2000 White Page',
      orderCreatedSuccessfully: 'Заказ создан успешно!',
      noOrdersYet: 'Заказов пока нет',
      tokenWallet: 'Кошелёк токенов',
      selectMonth: 'Выберите месяц для экспорта данных в Excel формате',
      yourOrder: 'Ваш заказ',
      orderSent: 'Ваш заказ был отправлен на обработку',
      orderInProgress: 'Ваш заказ находится в процессе создания',
      whenReady: 'Когда ваш заказ будет готов',
      youWillBeNotified: 'вы получите уведомление в Telegram',
      totalUsersCount: 'Всего пользователей',
      totalUsersWithDiscount: 'Всего пользователей со скидкой',
      whitePageCreatedCount: 'White Page Создано',
      orderReady: 'готов!',
      siteLanguageLabel: 'Язык Сайта',
      discount: 'Скидка',
      createOrderButton: 'Создать Заказ',
      defaultDetails1: 'Что бы ссылка отсутствовала в логотипе на странице Home',
      defaultDetails2: 'Сделать страницу thanks_you.php (https://thx.page/) отдельной и что бы была переадресация на эту страницу с контактной формы.',
      defaultDetails3: 'Сделать минификацию картинок на сайту',
      defaultDetails4: 'Главная страница что бы была index.php',
      defaultDetails5: 'Кнопки формы должны быть с типом submit',
      defaultDetails6: 'Уведомление о Cookie сделай на каждой странице',
      defaultDetails7: 'Подвал сайта должен быть с рабочими страницами Privacy Policy, Terms of Service, Cookie Policy. В подвале должна быть навигация по сайту и названия. Без ссылок на социальные сети и дополнительные страницы',
      topUpBalance: 'Пополнить баланс',
      telegramNotifications: 'Telegram Уведомления',
      noNewNotifications: 'Новых уведомлений нет',
      telegramInstructions: 'Откройте эту ссылку в Telegram и нажмите /start, чтобы получать уведомления о готовых заказах',
      purchase: 'Покупка',
      transactions: 'Транзакции',
      tokenomicsTitle: 'Токеномика для Крупных Команд',
      tokenomicsDescription: 'Токеномика: 1 токен = 1 $ — простота, прозрачность и стабильность.',
      depositAmountTitle: 'Сумма Пополнения',
      continueToPayment: 'Продолжить к оплате',
      topUpSuccess: 'Пополнение успешно!',
      noNewOrders: 'Нет новых заказов',
      noCompletedOrders: 'Нет выполненных заказов',
      orderNumber: 'Заказ',
      buyer: 'Покупатель',
      thankYouForOrder: 'Спасибо за заказ!',
    },
    en: {
      login: 'Login',
      enterToken: 'Enter token',
      dashboard: 'Dashboard',
      createOrder: 'Create Order',
      orders: 'Orders',
      users: 'Users',
      revenue: 'Revenue',
      adminPanel: 'Admin Panel',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
      name: 'Name',
      enterName: 'Enter your name',
      saveChanges: 'Save Changes',
      changesSaved: 'Changes saved',
      settingsSaved: 'Settings saved',
      clickCameraToChange: 'Click camera to change avatar',
      allowedIPs: 'Allowed IPs',
      changesApplyTime: 'Changes may take up to 10 minutes to apply',
      addAllowedIP: 'Add allowed IP:',
      enterIPAddress: 'Enter IP address',
      accountInviteToken: 'Account Invite Token:',
      notifications: 'Notifications',
      notifyOrderComplete: 'Notify about completed order in Telegram',
      telegramLinkDescription: 'Link to connect notifications via Telegram',
      search: 'Search',
      wallet: 'Wallet',
      balance: 'Balance',
      searchOrders: 'Search orders',
      searchUsers: 'Search users',
      searchByDate: 'Search by date',
      maxIPsReached: 'Maximum number of IP addresses: 3',
      maxTeamMembersReached: 'Maximum number of team members reached (3)',
      whitePagesCreated: 'White Pages Created',
      totalUsers: 'Total Users in Account',
      spentOnWhitePage: 'Spent on White Page',
      personalDiscount: 'Your Personal Discount',
      support: 'Support',
      supportTitle: 'Support',
      supportDescription: 'Describe your problem and we will try to solve it as soon as possible',
      contactSupport: 'Contact Support',
      clarifyingDetails: 'Clarifying Details',
      projectDetails: 'Project Clarifying Details',
      actions: 'Actions',
      telegramBotOrders: 'Telegram BOT Orders',
      telegramBotFinance: 'Telegram BOT Finance',
      createdDate: 'Created Date',
      status: 'Status',
      ordersFromUsers: 'Orders from Users',
      usersWithDiscount: 'Users with Discount',
      theme: 'Theme',
      whitePageCount: 'White Page Count',
      whitePageCountShort: 'White Page Qty',
      language: 'Language',
      geo: 'Geo',
      buyerNickname: 'Buyer Nickname',
      cost: 'Cost',
      siteLanguage: 'Site Language',
      details: 'Details',
      submit: 'Submit',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      save: 'Save',
      close: 'Close',
      pending: 'Pending',
      inProgress: 'In Progress',
      completed: 'Completed',
      allOrders: 'All Orders',
      totalOrders: 'Total Orders',
      deposit: 'Deposit',
      depositAmount: 'Deposit Amount',
      enterAmount: 'Enter amount',
      depositHistory: 'Deposit History',
      amount: 'Amount',
      date: 'Date',
      successful: 'Successful',
      failed: 'Failed',
      role: 'Role',
      teamLead: 'TeamLead',
      teamMember: 'Team Member',
      admin: 'Admin',
      inviteToken: 'Invite Token',
      copyToken: 'Copy token',
      tokenCopied: 'Token copied',
      addUser: 'Add User',
      noOrders: 'No orders',
      noUsers: 'No users',
      loading: 'Loading',
      error: 'Error',
      success: 'Success',
      projects: 'Projects',
      tokens: 'Tokens',
      spent: 'Spent',
      lastActivity: 'Last Activity',
      telegramBots: 'Telegram Bots',
      paymentHistory: 'Transactions',
      transactionHash: 'Transaction Hash',
      orderCost: 'Order Cost',
      orderCreator: 'Order Creator',
      notSpecified: 'Not specified',
      backToOrders: '← Back to Orders',
      feedbackOnProject: 'Feedback on the project',
      sendFeedback: 'Submit',
      projectFiles: 'Project Files',
      downloadProjectFiles: 'Download Project Files',
      projectInProgress: 'Project in progress',
      fileUnavailable: 'File unavailable for download',
      statusCompleted: 'Completed',
      statusReady: 'Ready',
      statusPending: 'Pending',
      createdOrder: 'Created order',
      writingLanguageLabel: 'Writing Language',
      createInviteToken: 'Create Team Invite Token',
      viewActions: 'View actions',
      refreshData: 'Refresh data',
      refreshing: 'Refreshing...',
      exportData: 'Export data',
      ipUsers: 'IP Users',
      lastLogin: 'Last Login',
      discountSystem: 'Discount System',
      depositOn: 'Deposit of',
      discount5Percent: '5% discount on all subsequent orders',
      discount10Percent: '10% discount on all subsequent orders',
      specialDiscount35: 'Special 35% discount on bulk order',
      discountsStackMessage: 'Discounts stack and are applied automatically when conditions are met',
      gotIt: 'Got it',
      createInviteTokenTitle: 'Create Invite Token',
      inviteTokenLabel: 'Invite Token',
      tokenUsageDescription: 'This token can be used to register a new user',
      ready: 'Done',
      pasteGroupLink: 'Paste group link',
      groupLinkForNotifications: 'Group link for notifications',
      copyAPI: 'Copy API',
      copyLink: 'Copy link',
      tokensAddedToBalance: 'Tokens added to your balance',
      tokensSpent: 'Tokens Spent',
      landing: 'Landing',
      multipage: 'Multipage',
      user: 'User',
      createTeamLead: 'Create TeamLead',
      areYouSure: 'Are you sure?',
      deleteUser: 'Delete user',
      siteTheme: 'Site Theme',
      buyerNicknameFull: 'Buyer Nickname',
      orderCostFull: 'Order Cost',
      siteThemeFull: 'Site theme',
      geoFull: 'Geo',
      siteType: 'Site type',
      writingLanguage: 'Writing language',
      saveAllChanges: 'Save all changes',
      userNotifiedInCRM: 'User has been notified in CRM and Telegram.',
      teamLeadTokenCopied: 'TeamLead token copied',
      memberTokenCopied: 'Member token copied',
      createTeamLeadButton: 'Create TeamLead',
      inviteTeamMember: 'Invite team member',
      whitePageCreated: 'White Page created',
      allUsersInAccount: 'Total users in account',
      spentOnWhitePages: 'Spent on White Page',
      yourPersonalDiscount: 'Your personal discount',
      orderSentSuccessfully: 'Order sent successfully!',
      orderSentToUser: 'The order was successfully sent to the user.',
      allUsers: 'All users',
      activeUsers: 'Active',
      inactiveUsers: 'Inactive',
      minimum10: 'Minimum 10',
      feedbackPlaceholder: 'If you have any clarifying details about the created Whites, please write Feedback',
      enterTokensQuantity: 'Enter number of tokens',
      quickActions: 'Quick Actions',
      userActivity: 'User Activity',
      depositsAdded: 'Deposits Added',
      tokensAdded: 'Tokens Added',
      completedOrders: 'Completed Orders',
      readyOrders: 'Ready',
      dataUpdatedSuccessfully: 'Data updated successfully',
      notEnoughTokens: 'Not enough tokens to create order. Please top up your balance with at least 500 tokens.',
      totalRevenue: 'Total Revenue',
      oneTimeOrder: 'One-time order 2000 White Pages',
      orderCreatedSuccessfully: 'Order created successfully!',
      noOrdersYet: 'No orders yet',
      tokenWallet: 'Token Wallet',
      selectMonth: 'Select month to export data in Excel format',
      yourOrder: 'Your Order',
      orderSent: 'Your order has been sent for processing',
      orderInProgress: 'Your order is being created',
      whenReady: 'When your order is ready',
      youWillBeNotified: 'you will receive a notification in Telegram',
      totalUsersCount: 'Total Users',
      totalUsersWithDiscount: 'Total Users with Discount',
      whitePageCreatedCount: 'White Pages Created',
      orderReady: 'is ready!',
      siteLanguageLabel: 'Site Language',
      discount: 'Discount',
      createOrderButton: 'Create Order',
      defaultDetails1: 'Remove link from logo on Home page',
      defaultDetails2: 'Create separate thanks_you.php page (https://thx.page/) and redirect to this page from contact form.',
      defaultDetails3: 'Minify images on the site',
      defaultDetails4: 'Main page should be index.php',
      defaultDetails5: 'Form buttons should have submit type',
      defaultDetails6: 'Add Cookie notification on every page',
      defaultDetails7: 'Footer should have working pages: Privacy Policy, Terms of Service, Cookie Policy. Footer should have site navigation and titles. Without social media links and additional pages',
      topUpBalance: 'Top Up Balance',
      telegramNotifications: 'Telegram Notifications',
      noNewNotifications: 'No new notifications',
      telegramInstructions: 'Open this link in Telegram and press /start to receive notifications about completed orders',
      purchase: 'Purchase',
      transactions: 'Transactions',
      tokenomicsTitle: 'Tokenomics for Large Teams',
      tokenomicsDescription: 'Tokenomics: 1 token = 1 $ — simplicity, transparency and stability.',
      depositAmountTitle: 'Deposit Amount',
      continueToPayment: 'Continue to Payment',
      topUpSuccess: 'Top up successful!',
      noNewOrders: 'No new orders',
      noCompletedOrders: 'No completed orders',
      orderNumber: 'Order',
      buyer: 'Buyer',
      thankYouForOrder: 'Thank you for your order!',
    },
  };

  const t = translations[language];
  const [orders, setOrders] = useState<any[]>([]);
  const [orderFormData, setOrderFormData] = useState({
    theme: '',
    whitePageCount: '',
    language: '',
    geo: '',
    buyerNickname: '',
    cost: '',
    siteLanguage: '',
    details: ''
  });

  // Notification sounds are encapsulated in Notifications service now

  // Effect to play sound on login handled by Notifications service
  useEffect(() => {
    if (!isLoggedIn) return;
    if (!notifications) return;
    if (orders.length === 0) return;
    if (!notifyOrderComplete) return;
    notifications.onLogin(orders);
  }, [isLoggedIn, orders, notifyOrderComplete]);

  // Load orders on login
  useEffect(() => {
    if (isLoggedIn && currentUserToken && !isInitialLoadRef.current) {
      handleRefreshData();
    }
  }, [isLoggedIn, currentUserToken]);

  // Effect to detect and notify about new orders
  useEffect(() => {
    const previousOrders = previousOrdersRef.current;

    // Initialize on first load without notifications
    if (isInitialLoadRef.current && orders.length > 0) {
      previousOrdersRef.current = orders;
      isInitialLoadRef.current = false;
      console.log('Initial load: orders initialized', orders.length);
      return;
    }

    if (orders.length > 0 && previousOrders.length > 0) {
      // Notifications service now handles order change side-effects
    }

    // Update previous orders reference
    previousOrdersRef.current = orders;
  }, [orders, isAdmin, notifyOrderComplete]);

  // Notifications service instance
  const notifications = useMemo(() => {
    const role: 'admin' | 'team-leader' | 'team-member' = isAdmin ? 'admin' : (isTeamMember ? 'team-member' : 'team-leader');
    const getTeamTokens = () => {
      if (role === 'admin') return [];
      // Leader sees self + members; member sees leader + same-leader members
      if (role === 'team-leader') {
        const teamMembers = accountUsers.filter(u => u.parentToken === currentUserToken).map(u => u.token);
        return [currentUserToken, ...teamMembers];
      }
      const member = accountUsers.find(u => u.token === currentUserToken);
      const leaderToken = member?.parentToken || '';
      const peers = accountUsers.filter(u => u.parentToken === leaderToken).map(u => u.token);
      return [leaderToken, ...peers];
    };
    return Notifications.init({ supabase, role, currentUserToken, getTeamTokens });
  }, [isAdmin, isTeamMember, currentUserToken, accountUsers]);

  // Avatars service instance
  const avatars = useMemo(() => {
    const getRole = () => (isAdmin ? 'admin' : (isTeamMember ? 'team-member' : 'team-leader')) as 'admin' | 'team-leader' | 'team-member';
    return Avatars.init({
      supabase,
      getRole,
      getCurrentUserToken: () => currentUserToken,
    });
  }, [isAdmin, isTeamMember, currentUserToken]);

  // Ensure default avatar after login
  useEffect(() => {
    (async () => {
      if (!isLoggedIn) return;
      if (!currentUserToken) return;
      const ensured = await avatars.ensureDefault(userAvatar && userAvatar !== '👤' ? userAvatar : '');
      if (ensured && ensured !== userAvatar) setUserAvatar(ensured);
    })();
  }, [isLoggedIn, currentUserToken, avatars]);

  // Hydrate viewed notifications from DB on login/user change (non-admin)
  useEffect(() => {
    (async () => {
      if (!isLoggedIn) return;
      if (!notifications) return;
      await notifications.hydrateFromDatabase();

      if (!hasPlayedLoginSoundRef.current && notifications.hasUnviewedNotifications(orders)) {
        orderCreatedAudio.play().catch(e => console.log('Audio play failed:', e));
        hasPlayedLoginSoundRef.current = true;
      }
    })();
  }, [isLoggedIn, notifications, orders]);

  // Close order filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showOrderFilterDropdown && !target.closest('.order-filter-dropdown')) {
        setShowOrderFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOrderFilterDropdown]);

  // Close user filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isUserFilterOpen && !target.closest('.user-filter-dropdown')) {
        setIsUserFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserFilterOpen]);

  const correctToken = 'f4d2dsfre3';
  const adminToken = 'jiogjores';
  const teamMemberToken = 'co3jfmand49fsd';

  const getDiscount = (whitePageCount: number) => {
    const totalDeposited = getTotalDeposited();

    if (whitePageCount >= 2000 || totalDeposited > 12000) {
      return 35;
    } else if (totalDeposited >= 10000) {
      return 10;
    } else if (totalDeposited >= 5000) {
      return 5;
    }
    return 0;
  };

  const calculateOrderCost = () => {
    const whitePageCount = parseInt(orderFormData.whitePageCount) || 0;
    const pricePerPage = siteType === 'landing' ? 7 : 10;
    const basePrice = whitePageCount * pricePerPage;
    const discount = getDiscount(whitePageCount);
    const discountAmount = (basePrice * discount) / 100;
    return basePrice - discountAmount;
  };

  const getTotalDeposited = () => {
    return transactions
      .filter(t => t.status === 'Successful')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getAllUsersRevenue = () => {
    const currentUser = accountUsers.find(u => u.token === currentUserToken);

    if (currentUser?.role === 'admin') {
      // Для админа: суммируем все депозиты всех пользователей (кроме админа)
      return accountUsers
        .filter(user => user.role !== 'admin')
        .reduce((total, user) => {
          return total + (user.tokensAdded || 0);
        }, 0);
    }

    // Для обычных пользователей: считаем только tokensAdded всех пользователей
    return accountUsers.reduce((total, user) => {
      return total + (user.tokensAdded || 0);
    }, 0);
  };

  const getAvatarGlowClass = () => {
    const total = getTotalDeposited();
    if (total > 12000) {
      return 'shadow-[0_0_40px_rgba(168,85,247,0.9),0_0_80px_rgba(168,85,247,0.5),0_0_120px_rgba(168,85,247,0.3)] ring-4 ring-purple-400/60';
    } else if (total >= 10000) {
      return 'shadow-[0_0_40px_rgba(59,130,246,0.9),0_0_80px_rgba(59,130,246,0.5),0_0_120px_rgba(59,130,246,0.3)] ring-4 ring-blue-400/60';
    } else if (total >= 5000) {
      return 'shadow-[0_0_40px_rgba(34,197,94,0.9),0_0_80px_rgba(34,197,94,0.5),0_0_120px_rgba(34,197,94,0.3)] ring-4 ring-green-400/60';
    }
    return '';
  };

  const generateInviteToken = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = 'inv_';
    for (let i = 0; i < 16; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await avatars.uploadAndSave(file);
    setUserAvatar(url);
  };

  const handleSaveProfile = async () => {
    if ((isTeamMember && currentUserToken.startsWith('tm_')) || currentUserToken.startsWith('tl_') || currentUserToken.startsWith('lead_')) {
      setAccountUsers(accountUsers.map(user =>
        user.token === currentUserToken ? { ...user, name: userName } : user
      ));

      setOrders(orders.map(order =>
        order.createdByToken === currentUserToken ? { ...order, createdBy: userName } : order
      ));
    }
    try {
      await supabase
        .from('users')
        .update({ name: userName, updated_at: new Date().toISOString() })
        .eq('token', currentUserToken);
    } catch (_) {}
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleAddIP = () => {
    if (allowedIPs.length >= 3) {
      return;
    }
    if (allowedIP.trim() && !allowedIPs.includes(allowedIP.trim())) {
      setAllowedIPs([...allowedIPs, allowedIP.trim()]);
      setAllowedIP('');
    }
  };

  const handleRemoveIP = (ip: string) => {
    setAllowedIPs(allowedIPs.filter(item => item !== ip));
  };

  const handleCopyToken = (token?: string) => {
    const tokenToCopy = token || accountToken;
    navigator.clipboard.writeText(tokenToCopy);
    if (token) {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  const handleRefreshToken = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let newToken = 'inv_';
    for (let i = 0; i < 16; i++) {
      newToken += chars[Math.floor(Math.random() * chars.length)];
    }
    setAccountToken(newToken);
  };

  const handleSaveSettings = async () => {
    if (isAdmin) {
      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/admin_telegram_settings?id=eq.${import.meta.env.VITE_ADMIN_SETTINGS_ID || '00000000-0000-0000-0000-000000000001'}`;
        await fetch(apiUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            finance_bot_chat_id: telegramFinanceGroup.trim(),
            orders_bot_chat_id: telegramOrdersGroup.trim(),
            updated_at: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Failed to save admin Telegram settings:', error);
      }
    } else if ((isTeamMember && currentUserToken.startsWith('tm_')) || currentUserToken.startsWith('tl_') || currentUserToken.startsWith('lead_')) {
      if (telegramChatId.trim()) {
        try {
          const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_telegram_settings`;
          await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
              user_token: currentUserToken,
              telegram_chat_id: telegramChatId.trim()
            })
          });
        } catch (error) {
          console.error('Failed to save Telegram settings:', error);
        }
      }
    }
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);

    if (isNaN(amount) || amount < 500) {
      alert('Минимальная сумма пополнения: 500 USDT');
      return;
    }

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

    const newTransaction = {
      date: formattedDate,
      amount: amount,
      status: 'Successful',
      hash: `https://tronscan.org/#/transaction/${Math.random().toString(36).substring(2, 15)}`,
      userToken: currentUserToken
    };

    setTransactions([newTransaction, ...transactions]);
    setTokenBalance(tokenBalance + amount);
    setUserTokensAdded(userTokensAdded + amount);
    setTopUpAmount('');
    setShowTopUpSuccess(true);

    if ((isTeamMember && currentUserToken.startsWith('tm_')) || currentUserToken.startsWith('tl_') || currentUserToken.startsWith('lead_')) {
      const currentUser = accountUsers.find(u => u.token === currentUserToken);
      const username = currentUser?.name || 'Unknown User';

      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-deposit-notify`;
        await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: formattedDate,
            username: username,
            amount: amount
          })
        });
      } catch (error) {
        console.error('Failed to send deposit notification:', error);
      }
    }

    if ((isTeamMember && currentUserToken.startsWith('tm_')) || currentUserToken.startsWith('tl_') || currentUserToken.startsWith('lead_')) {
      setAccountUsers(accountUsers.map(user => {
        if (user.token === currentUserToken) {
          const currentTokensAdded = user.tokensAdded || 0;
          return {
            ...user,
            tokensAdded: currentTokensAdded + amount
          };
        }
        return user;
      }));

      if (currentUserToken.startsWith('tm_')) {
        const currentUser = accountUsers.find(u => u.token === currentUserToken);
        if (currentUser) {
          const teamLeader = accountUsers.find(u => u.token === currentUser.parentToken);
          const teamMembers = accountUsers.filter(u => u.parentToken === currentUser.parentToken);

          const totalAdded = teamMembers.reduce((sum, member) => {
            if (member.token === currentUserToken) {
              return sum + ((member.tokensAdded || 0) + amount);
            }
            return sum + (member.tokensAdded || 0);
          }, 0) + (teamLeader?.tokensAdded || 0);
          const totalSpent = teamMembers.reduce((sum, member) => sum + (member.tokensSpent || 0), 0) + (teamLeader?.tokensSpent || 0);

          setTokenBalance(totalAdded - totalSpent);
        }
      } else if (currentUserToken.startsWith('tl_')) {
        const currentUser = accountUsers.find(u => u.token === currentUserToken);
        const teamMembers = accountUsers.filter(u => u.parentToken === currentUserToken);

        const totalAdded = teamMembers.reduce((sum, member) => sum + (member.tokensAdded || 0), 0) + ((currentUser?.tokensAdded || 0) + amount);
        const totalSpent = teamMembers.reduce((sum, member) => sum + (member.tokensSpent || 0), 0) + (currentUser?.tokensSpent || 0);

        setTokenBalance(totalAdded - totalSpent);
      } else if (currentUserToken.startsWith('lead_')) {
        const currentUser = accountUsers.find(u => u.token === currentUserToken);
        const teamMembers = accountUsers.filter(u => u.parentToken === currentUserToken);

        const totalAdded = teamMembers.reduce((sum, member) => sum + (member.tokensAdded || 0), 0) + ((currentUser?.tokensAdded || 0) + amount);
        const totalSpent = teamMembers.reduce((sum, member) => sum + (member.tokensSpent || 0), 0) + (currentUser?.tokensSpent || 0);

        setTokenBalance(totalAdded - totalSpent);
      }
    }

    setTimeout(() => {
      setShowTopUpSuccess(false);
    }, 3000);
  };

  const calculatePersonalDiscount = () => {
    const total = getTotalDeposited();
    if (total >= 12000) {
      return 35;
    } else if (total >= 10000) {
      return 10;
    } else if (total >= 5000) {
      return 5;
    }
    return 0;
  };

  const getDiscountBlockStyles = () => {
    const total = getTotalDeposited();
    if (total >= 12000) {
      return {
        gradient: 'from-purple-600 to-purple-700',
        hover: 'hover:from-purple-500 hover:to-purple-600',
        textColor: 'text-purple-200',
        iconColor: 'text-purple-300'
      };
    } else if (total >= 10000) {
      return {
        gradient: 'from-blue-600 to-blue-700',
        hover: 'hover:from-blue-500 hover:to-blue-600',
        textColor: 'text-blue-200',
        iconColor: 'text-blue-300'
      };
    } else if (total >= 5000) {
      return {
        gradient: 'from-green-600 to-green-700',
        hover: 'hover:from-green-500 hover:to-green-600',
        textColor: 'text-green-200',
        iconColor: 'text-green-300'
      };
    }
    return {
      gradient: 'from-yellow-600 to-yellow-700',
      hover: 'hover:from-yellow-500 hover:to-yellow-600',
      textColor: 'text-yellow-200',
      iconColor: 'text-yellow-300'
    };
  };

  const getCompletedOrdersCount = () => {
    return orders.filter(order => order.status === 'completed').length;
  };

  const getTotalSpent = () => {
    const completedOrders = orders.filter(order => order.status === 'completed');
    const basePrice = 150;
    return completedOrders.length * basePrice;
  };

  const getTeamUsersCount = () => {
    // Count: Team Leader + Team Members invited by this Team Leader
    const teamMembers = accountUsers.filter(u => u.parentToken === currentUserToken);
    return 1 + teamMembers.length; // 1 for the team leader himself
  };

  const getTeamWhitePagesCount = () => {
    // Get Team Leader and his team members
    const teamMembers = accountUsers.filter(u => u.parentToken === currentUserToken);
    const teamTokens = [currentUserToken, ...teamMembers.map(u => u.token)];

    // Count total white pages from ALL orders of the team (not just completed)
    const teamOrders = orders.filter(order => teamTokens.includes(order.createdByToken));

    return teamOrders.reduce((total, order) => {
      return total + (parseInt(order.data?.whitePageCount) || 0);
    }, 0);
  };

  const getTeamTotalSpent = () => {
    // Get Team Leader and his team members
    const teamMembers = accountUsers.filter(u => u.parentToken === currentUserToken);
    const teamTokens = [currentUserToken, ...teamMembers.map(u => u.token)];

    // Sum total tokens spent on ALL orders of the team
    const teamOrders = orders.filter(order => teamTokens.includes(order.createdByToken));

    return teamOrders.reduce((total, order) => {
      return total + (parseFloat(order.data?.cost) || 0);
    }, 0);
  };

  const getAllWhitePagesCount = () => {
    return orders.reduce((total, order) => {
      return total + (parseInt(order.data?.whitePageCount) || 0);
    }, 0);
  };

  const getAllUsersCount = () => {
    return accountUsers.filter(user => user.role !== 'admin').length;
  };

  const getUserDiscount = (user: any) => {
    const userDeposits = user.tokensAdded || 0;
    if (userDeposits >= 10000) return 10;
    if (userDeposits >= 5000) return 5;
    return 0;
  };

  const getUsersWithDiscount = () => {
    return accountUsers.filter(user => user.role !== 'admin' && getUserDiscount(user) > 0);
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);

    try {
      if (!currentUserToken) {
        console.error('No current user token');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('token', currentUserToken)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }

      if (!userData) {
        console.error('Current user not found in database');
        return;
      }

      const userTeamId = userData.team_id || userData.token;

      // Sync UI name/avatar from DB on refresh
      if (userData.name) setUserName(userData.name);
      if (userData.avatar) setUserAvatar(userData.avatar);

      let ordersData;
      if (userData.role === 'admin') {
        const { data, error } = await supabase
          .from('orders')
          .select('id, name, status, created_by_token, order_data, date, created_at, updated_at, team_id')
          .order('created_at', { ascending: false });
        if (error) throw error;
        ordersData = data;
      } else {
        const { data, error } = await supabase
          .from('orders')
          .select('id, name, status, created_by_token, order_data, date, created_at, updated_at, team_id')
          .eq('team_id', userTeamId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        ordersData = data;
      }

      if (ordersData) {
        const formattedOrders = ordersData.map(order => ({
          id: order.id,
          name: order.name || `Project ${order.id}`,
          status: order.status,
          data: order.order_data || {},
          date: order.date || new Date(order.created_at).toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }),
          createdBy: order.created_by || 'Unknown',
          createdByToken: order.created_by_token || '',
          theme: (order.order_data as any)?.theme || '',
          whitePageCount: (order.order_data as any)?.whitePageCount || 0,
          buyerNickname: (order.order_data as any)?.buyerNickname || ''
        }));
        setOrders(formattedOrders);
      }

      setShowDataRefreshed(true);
      setTimeout(() => setShowDataRefreshed(false), 2000);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getAvailableMonths = () => {
    const monthsMap = new Map<string, string>();

    orders.forEach(order => {
      if (order.date && order.status === 'completed') {
        const orderDate = new Date(order.date);
        const year = orderDate.getFullYear();
        const month = orderDate.getMonth() + 1;
        const monthValue = `${year}-${month.toString().padStart(2, '0')}`;
        const monthDisplay = orderDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

        if (!monthsMap.has(monthValue)) {
          monthsMap.set(monthValue, monthDisplay);
        }
      }
    });

    return Array.from(monthsMap.entries()).map(([value, display]) => ({ value, display }));
  };


  const handleLogin = async () => {
    if (!token.trim()) {
      setError('Please enter a token');
      return;
    }

    setIsLoading(true);
    setError('');

    const loadUserDataFromDB = async (userToken: string) => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('name, avatar, role')
          .eq('token', userToken)
          .maybeSingle();

        if (userData) {
          if (userData.name) {
            setUserName(userData.name);
          } else {
            if (userData.role === 'admin') {
              setUserName('Admin');
            } else if (userData.role === 'team-leader') {
              setUserName('TM');
            } else {
              setUserName('User');
            }
          }

          if (userData.avatar) {
            setUserAvatar(userData.avatar);
          } else {
            if (userData.role === 'admin') {
              setUserAvatar('https://cdn.discordapp.com/attachments/1424455923136467024/1425076074789867552/Group_549_1_1.png?ex=68e64504&is=68e4f384&hm=b91133555c589c2451ea8d9b6edeec55f4a75fe509edd71c904f6c337c8debf0&');
            } else if (userData.role === 'team-leader') {
              setUserAvatar('https://cdn.discordapp.com/attachments/1424455923136467024/1425127993398788186/Group_622_2.png?ex=68f0589f&is=68ef071f&hm=2485eeb9d98af767bc463f924a069871aa3013bb1405b35abde34cb9bc3e76b3&');
            } else {
              setUserAvatar('U');
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    setTimeout(async () => {
      if (token === correctToken || token === 'f4d2dsfre3') {
        if (token === 'f4d2dsfre3') {
          let teamLeader = accountUsers.find(u => u.token === 'f4d2dsfre3');
          if (!teamLeader) {
            teamLeader = {
              id: accountUsers.length + 1,
              name: 'TM',
              nickname: 'TM',
              ip: '86.29.223.12:7942',
              lastLogin: new Date().toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
              orders: [],
              tokensAdded: 0,
              tokensSpent: 0,
              role: 'team-leader',
              parentToken: adminToken,
              token: 'f4d2dsfre3',
              teamId: 'f4d2dsfre3',
              isOnline: true,
              avatar: 'https://cdn.discordapp.com/attachments/1424455923136467024/1425127993398788186/Group_622_2.png?ex=68f0589f&is=68ef071f&hm=2485eeb9d98af767bc463f924a069871aa3013bb1405b35abde34cb9bc3e76b3&'
            };
            setAccountUsers([...accountUsers, teamLeader]);
          } else {
            setAccountUsers(accountUsers.map(u =>
              u.token === 'f4d2dsfre3' ? { ...u, isOnline: true, lastLogin: new Date().toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } : u
            ));
          }

          const teamMembers = accountUsers.filter(u => u.parentToken === 'f4d2dsfre3');
          const totalAdded = teamMembers.reduce((sum, member) => sum + (member.tokensAdded || 0), 0) + (teamLeader.tokensAdded || 0);
          const totalSpent = teamMembers.reduce((sum, member) => sum + (member.tokensSpent || 0), 0) + (teamLeader.tokensSpent || 0);

          setTokenBalance(totalAdded - totalSpent);
          setUserTokensAdded(teamLeader.tokensAdded || 0);
        }
        setIsLoggedIn(true);
        setShowModal(false);
        setIsAdmin(false);
        setIsTeamMember(false);
        setCurrentUserToken(token);
        await loadUserDataFromDB(token);
        isInitialLoadRef.current = true;
        hasPlayedLoginSoundRef.current = false;
      } else if (token === teamMemberToken) {
        setIsLoggedIn(true);
        setShowModal(false);
        setIsAdmin(false);
        setIsTeamMember(true);
        setCurrentUserToken(token);
        isInitialLoadRef.current = true;
        hasPlayedLoginSoundRef.current = false;
        setUserAvatar('T');
      } else if (token.startsWith('inv_')) {
        if (token === accountToken) {
          const teamMembersCount = accountUsers.filter(u => u.parentToken === correctToken).length;

          if (teamMembersCount >= 3) {
            setError('Team is full. Maximum 3 team members allowed.');
          } else {
            const userIP = '86.29.223.12:7942';
            const newUserId = accountUsers.length + 1;
            const generatedToken = 'tm_' + Math.random().toString(36).substring(2, 15);
            const newUser = {
              id: newUserId,
              name: 'User',
              nickname: 'User',
              ip: userIP,
              lastLogin: new Date().toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
              orders: [],
              tokensAdded: 0,
              tokensSpent: 0,
              role: 'team-member',
              parentToken: correctToken,
              token: generatedToken,
              teamId: correctToken,
              isOnline: true,
              avatar: 'https://cdn.discordapp.com/attachments/1424455923136467024/1425150748655882250/Group_622_3.png?ex=68f06dd0&is=68ef1c50&hm=f033c4f153045910e741d7471cbf6beeaaf7f5aedfe1b18af903d4ce4cca08c9&'
            };
            setAccountUsers([...accountUsers, newUser]);
            setIsLoggedIn(true);
            setShowModal(false);
            setIsAdmin(false);
            setIsTeamMember(true);
            setCurrentUserToken(generatedToken);
            setUserName('User');
            setUserAvatar(newUser.avatar || 'U');
            isInitialLoadRef.current = true;
            hasPlayedLoginSoundRef.current = false;
          }
        } else {
          const userIP = '86.29.223.12:7942';
          const isIPAllowed = allowedIPs.includes(userIP);

          if (isIPAllowed) {
            const newUserId = accountUsers.length + 1;
            const newUser = {
              id: newUserId,
              name: `User ${newUserId}`,
              nickname: `User ${newUserId}`,
              ip: userIP,
              lastLogin: new Date().toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
              orders: [],
              tokensAdded: 0,
              tokensSpent: 0,
              role: 'user',
              parentToken: null
            };
            setAccountUsers([...accountUsers, newUser]);
            setIsLoggedIn(true);
            setShowModal(false);
            setIsAdmin(false);
            setIsTeamMember(false);
            hasPlayedLoginSoundRef.current = false;
          } else {
            setError('Your IP address is not authorized. Please contact the administrator.');
          }
        }
      } else if (token === adminToken) {
        setIsLoggedIn(true);
        setShowModal(false);
        setIsAdmin(true);
        setIsTeamMember(false);
        setCurrentPage('admin-panel');
        setCurrentUserToken(token);
        await loadUserDataFromDB(token);
        isInitialLoadRef.current = true;
      } else if (token.startsWith('lead_')) {
        const user = accountUsers.find(u => u.token === token);
        if (user) {
          setAccountUsers(accountUsers.map(u =>
            u.token === token ? { ...u, isOnline: true } : u
          ));
          setIsLoggedIn(true);
          setShowModal(false);
          setIsAdmin(false);
          setIsTeamMember(false);
          setCurrentUserToken(token);
          hasPlayedLoginSoundRef.current = false;
          await loadUserDataFromDB(token);

          const teamMembers = accountUsers.filter(u => u.parentToken === token);

          const totalAdded = teamMembers.reduce((sum, member) => sum + (member.tokensAdded || 0), 0) + (user.tokensAdded || 0);
          const totalSpent = teamMembers.reduce((sum, member) => sum + (member.tokensSpent || 0), 0) + (user.tokensSpent || 0);

          setTokenBalance(totalAdded - totalSpent);
          setUserTokensAdded(user.tokensAdded || 0);
        } else {
          setError('Invalid team leader token. Please try again.');
        }
      } else if (token.startsWith('tl_')) {
        const inviteTokenParts = token.split('_');
        const parentTokenPart = inviteTokenParts.length > 2 ? inviteTokenParts.slice(2).join('_') : null;

        const teamLeader = accountUsers.find(u => u.token === parentTokenPart);

        if (!teamLeader && parentTokenPart !== 'f4d2dsfre3' && !parentTokenPart?.startsWith('lead_')) {
          setError('Invalid invite token. Please try again.');
        } else {
          const actualParentToken = parentTokenPart || 'f4d2dsfre3';
          const teamMembers = accountUsers.filter(u => u.parentToken === actualParentToken);

          if (teamMembers.length >= 3) {
            setError('Team is full. Maximum 3 team members allowed.');
          } else {
            const userIP = '86.29.223.12:7942';
            const newUserId = accountUsers.length + 1;
            const generatedToken = 'tm_' + Math.random().toString(36).substring(2, 15);
            const newUser = {
              id: newUserId,
              name: `User ${newUserId}`,
              nickname: `User ${newUserId}`,
              ip: userIP,
              lastLogin: new Date().toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
              orders: [],
              tokensAdded: 0,
              tokensSpent: 0,
              role: 'team-member',
              parentToken: actualParentToken,
              token: generatedToken,
              isOnline: true,
              avatar: 'https://cdn.discordapp.com/attachments/1424455923136467024/1425150748655882250/Group_622_3.png?ex=68f06dd0&is=68ef1c50&hm=f033c4f153045910e741d7471cbf6beeaaf7f5aedfe1b18af903d4ce4cca08c9&'
            };

            let leaderData = teamLeader;
            if (!leaderData && actualParentToken === 'f4d2dsfre3') {
              leaderData = accountUsers.find(u => u.token === 'f4d2dsfre3');
            }

            const totalAdded = teamMembers.reduce((sum, member) => sum + (member.tokensAdded || 0), 0) + (leaderData?.tokensAdded || 0);
            const totalSpent = teamMembers.reduce((sum, member) => sum + (member.tokensSpent || 0), 0) + (leaderData?.tokensSpent || 0);

            setAccountUsers([...accountUsers, newUser]);
            setIsLoggedIn(true);
            setShowModal(false);
            setIsAdmin(false);
            setIsTeamMember(true);
            setCurrentUserToken(generatedToken);
            setUserName('User');
            setUserAvatar(newUser.avatar || 'U');
            isInitialLoadRef.current = true;
            setTokenBalance(totalAdded - totalSpent);
            setUserTokensAdded(0);
            hasPlayedLoginSoundRef.current = false;
          }
        }
      } else if (token.startsWith('tm_')) {
        const user = accountUsers.find(u => u.token === token);
        if (user) {
          setAccountUsers(accountUsers.map(u =>
            u.token === token ? { ...u, isOnline: true } : u
          ));
          setIsLoggedIn(true);
          setShowModal(false);
          setIsAdmin(false);
          setIsTeamMember(true);
          setCurrentUserToken(token);
          hasPlayedLoginSoundRef.current = false;
          await loadUserDataFromDB(token);

          const teamLeader = accountUsers.find(u => u.token === user.parentToken);
          const teamMembers = accountUsers.filter(u => u.parentToken === user.parentToken);

          const totalAdded = teamMembers.reduce((sum, member) => sum + (member.tokensAdded || 0), 0) + (teamLeader?.tokensAdded || 0);
          const totalSpent = teamMembers.reduce((sum, member) => sum + (member.tokensSpent || 0), 0) + (teamLeader?.tokensSpent || 0);

          setTokenBalance(totalAdded - totalSpent);
          setUserTokensAdded(user.tokensAdded || 0);
        } else {
          setError('Invalid token. Please try again.');
        }
      } else {
        setError('Invalid token. Please try again.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowModal(true);
    setToken('');
    setShowProfileMenu(false);
  };

  const handleCreateOrder = async () => {
    if (isSubmittingOrder) {
      console.log('Order already being submitted, ignoring click');
      return;
    }

    const whitePageCount = parseInt(orderFormData.whitePageCount) || 0;

    if (whitePageCount < 10) {
      setError('Минимальный заказ составляет 10 White Page');
      setIsWhitePageError(true);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsSubmittingOrder(true);

    setIsWhitePageError(false);
    const orderCost = calculateOrderCost();

    const isTeamLeadOrMember = currentUserToken.startsWith('lead_') || currentUserToken.startsWith('tl_') || currentUserToken.startsWith('tm_');

    if (!isTeamLeadOrMember) {
      if (tokenBalance < 500) {
        setShowInsufficientTokensModal(true);
        setIsSubmittingOrder(false);
        return;
      }
      if (tokenBalance < orderCost) {
        setShowInsufficientTokensModal(true);
        setIsSubmittingOrder(false);
        return;
      }
    } else {
      if (tokenBalance < orderCost) {
        setShowInsufficientTokensModal(true);
        setIsSubmittingOrder(false);
        return;
      }
    }

    let newOrder;
    try {
      const currentUser = accountUsers.find(u => u.token === currentUserToken);
      const userTeamId = (currentUser && (currentUser as any).teamId) || currentUserToken;

      const orderData = {
        name: `Project ${orders.length + 1}`,
        status: 'progress',
        order_data: { ...orderFormData, siteType, cost: orderCost.toString() },
        date: new Date().toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }),
        created_by_token: currentUserToken,
        team_id: userTeamId
      } as any;

      const hasSupabaseEnv = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

      if (hasSupabaseEnv) {
        const { data: savedOrder, error: saveError } = await supabase
          .from('orders')
          .insert(orderData)
          .select()
          .maybeSingle();

        if (saveError) throw saveError;

        newOrder = {
          id: savedOrder.id,
          name: savedOrder.name,
          status: savedOrder.status,
          data: savedOrder.order_data,
          date: savedOrder.date,
          createdBy: userName,
          createdByToken: savedOrder.created_by_token
        };
      } else {
        // Preview fallback (no Supabase env): create local-only order
        newOrder = {
          id: Date.now(),
          name: orderData.name,
          status: orderData.status,
          data: orderData.order_data,
          date: orderData.date,
          createdBy: userName,
          createdByToken: currentUserToken
        };
      }

      setOrders([...orders, newOrder]);
    } catch (error) {
      console.error('Error creating order:', error);
      // Preview fallback on error: still add local order to allow UI to continue
      newOrder = {
        id: Date.now(),
        name: `Project ${orders.length + 1}`,
        status: 'progress',
        data: { ...orderFormData, siteType, cost: orderCost.toString() },
        date: new Date().toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdBy: userName,
        createdByToken: currentUserToken
      };
      setOrders([...orders, newOrder]);
    }

    if (isTeamLeadOrMember) {
      try {
        const hasSupabaseEnv = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
        if (hasSupabaseEnv) {
          const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-notify`;
          await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              projectName: newOrder.name,
              theme: orderFormData.theme,
              siteType: siteType,
              geo: orderFormData.geo,
              siteLanguage: orderFormData.siteLanguage,
              whitePageCount: orderFormData.whitePageCount,
              buyerNickname: orderFormData.buyerNickname,
              language: orderFormData.language,
              cost: orderCost.toString(),
              date: newOrder.date,
              createdBy: userName,
              details: orderFormData.details
            })
          });
        }
      } catch (error) {
        console.error('Failed to send Telegram notification:', error);
      }
    }

    setTokenBalance(tokenBalance - orderCost);

    if ((isTeamMember && currentUserToken.startsWith('tm_')) || currentUserToken.startsWith('tl_') || currentUserToken.startsWith('lead_')) {
      setAccountUsers(accountUsers.map(user => {
        if (user.token === currentUserToken) {
          const userOrders = user.orders || [];
          const currentTokensSpent = user.tokensSpent || 0;
          return {
            ...user,
            orders: [...userOrders, newOrder],
            tokensSpent: currentTokensSpent + orderCost
          };
        }
        return user;
      }));

      if (currentUserToken.startsWith('tm_')) {
        const currentUser = accountUsers.find(u => u.token === currentUserToken);
        if (currentUser) {
          const teamLeader = accountUsers.find(u => u.token === currentUser.parentToken);
          const teamMembers = accountUsers.filter(u => u.parentToken === currentUser.parentToken);

          const totalAdded = teamMembers.reduce((sum, member) => sum + (member.tokensAdded || 0), 0) + (teamLeader?.tokensAdded || 0);
          const totalSpent = teamMembers.reduce((sum, member) => {
            if (member.token === currentUserToken) {
              return sum + ((member.tokensSpent || 0) + orderCost);
            }
            return sum + (member.tokensSpent || 0);
          }, 0) + (teamLeader?.tokensSpent || 0);

          setTokenBalance(totalAdded - totalSpent);
        }
      } else if (currentUserToken.startsWith('tl_')) {
        const teamMembers = accountUsers.filter(u => u.parentToken === currentUserToken);
        const currentUser = accountUsers.find(u => u.token === currentUserToken);

        const totalAdded = teamMembers.reduce((sum, member) => sum + (member.tokensAdded || 0), 0) + (currentUser?.tokensAdded || 0);
        const totalSpent = teamMembers.reduce((sum, member) => sum + (member.tokensSpent || 0), 0) + ((currentUser?.tokensSpent || 0) + orderCost);

        setTokenBalance(totalAdded - totalSpent);
      } else if (currentUserToken.startsWith('lead_')) {
        const teamMembers = accountUsers.filter(u => u.parentToken === currentUserToken);
        const currentUser = accountUsers.find(u => u.token === currentUserToken);

        const totalAdded = teamMembers.reduce((sum, member) => sum + (member.tokensAdded || 0), 0) + (currentUser?.tokensAdded || 0);
        const totalSpent = teamMembers.reduce((sum, member) => sum + (member.tokensSpent || 0), 0) + ((currentUser?.tokensSpent || 0) + orderCost);

        setTokenBalance(totalAdded - totalSpent);
      }
    }

    setOrderFormData({
      theme: '',
      whitePageCount: '',
      language: '',
      geo: '',
      buyerNickname: '',
      cost: '',
      siteLanguage: '',
      details: ''
    });

    orderCreatedAudio.play().catch(e => console.log('Audio play failed:', e));
    setShowOrderCreatedModal(true);
    setTimeout(() => {
      setShowOrderCreatedModal(false);
      setCurrentPage('orders');
      setIsSubmittingOrder(false);
    }, 3000);
  };

  const renderCreateOrderPage = () => (
    <div className="flex-1 p-4 overflow-hidden">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-white text-xs font-medium mb-1.5">{t.siteTheme}</label>
            <input
              value={orderFormData.theme}
              onChange={(e) => setOrderFormData({...orderFormData, theme: e.target.value})}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm"
            />
            <div className="flex gap-1.5 mt-1.5">
              <button
                onClick={() => setSiteType('landing')}
                className={`px-3 py-1.5 rounded-lg text-xs ${siteType === 'landing' ? 'bg-blue-500 text-white' : 'bg-slate-600 text-white'}`}
              >{t.landing}</button>
              <button
                onClick={() => setSiteType('multipage')}
                className={`px-3 py-1.5 rounded-lg text-xs ${siteType === 'multipage' ? 'bg-blue-500 text-white' : 'bg-slate-600 text-white'}`}
              >{t.multipage}</button>
            </div>
          </div>
          <div>
            <label className="block text-white text-xs font-medium mb-1.5">{t.whitePageCountShort}</label>
            <input
              type="number"
              min="10"
              value={orderFormData.whitePageCount}
              onChange={(e) => {
                setOrderFormData({...orderFormData, whitePageCount: e.target.value});
                const value = parseInt(e.target.value) || 0;
                if (value >= 10) {
                  setIsWhitePageError(false);
                }
              }}
              placeholder={t.minimum10}
              className={`w-full rounded-lg px-3 py-2 text-white text-sm transition-colors ${
                isWhitePageError
                  ? 'bg-red-900/30 border-2 border-red-500'
                  : 'bg-slate-700/50 border border-slate-600/50'
              }`}
            />
          </div>
          <div>
            <label className="block text-white text-xs font-medium mb-1.5">{t.writingLanguageLabel}</label>
            <input
              value={orderFormData.language}
              onChange={(e) => setOrderFormData({...orderFormData, language: e.target.value})}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-white text-xs font-medium mb-1.5">{t.geo}</label>
            <input
              value={orderFormData.geo}
              onChange={(e) => setOrderFormData({...orderFormData, geo: e.target.value})}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-white text-xs font-medium mb-1.5">{t.buyerNicknameFull}</label>
            <input
              value={orderFormData.buyerNickname}
              onChange={(e) => setOrderFormData({...orderFormData, buyerNickname: e.target.value})}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-white text-xs font-medium mb-1.5">{t.siteLanguageLabel}</label>
            <input
              value={orderFormData.siteLanguage}
              onChange={(e) => setOrderFormData({...orderFormData, siteLanguage: e.target.value})}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-white text-xs font-medium mb-1.5">{t.orderCostFull}</label>
            <div className="relative w-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg px-4 py-2.5 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20 animate-pulse"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-white" />
                    <span className="text-white text-lg font-bold">{calculateOrderCost().toFixed(2)}</span>
                  </div>
                  <span className="text-green-100 text-xs font-medium">TOKEN</span>
                </div>
                {getDiscount(parseInt(orderFormData.whitePageCount) || 0) > 0 && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-green-100">{t.discount} {getDiscount(parseInt(orderFormData.whitePageCount) || 0)}%</span>
                    <span className="text-green-200 line-through">${(parseInt(orderFormData.whitePageCount) || 0) * (siteType === 'landing' ? 7 : 10)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex-1 min-h-0 flex flex-col">
          <label className="block text-white text-xs font-medium mb-1.5">{t.clarifyingDetails}</label>
          <textarea
            value={orderFormData.details}
            onChange={(e) => setOrderFormData({...orderFormData, details: e.target.value})}
            className="w-full flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm resize-none"
          />
        </div>

        <button
          onClick={handleCreateOrder}
          disabled={isSubmittingOrder}
          className={`w-full ${isSubmittingOrder ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white font-semibold py-3 rounded-lg transition-colors text-sm`}
        >
          {t.createOrderButton}
        </button>
      </div>
    </div>
  );

  const renderOrdersPage = () => {
    const filteredProjects = orders.filter(project => {
      if (orderFilter === 'all') return true;
      return project.status === orderFilter;
    });

    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              placeholder={t.searchOrders}
              className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400"
            />
          </div>
          <div className="relative w-full sm:w-auto order-filter-dropdown">
            <button
              onClick={() => setShowOrderFilterDropdown(!showOrderFilterDropdown)}
              className="w-full sm:w-auto px-6 py-3 pr-10 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white cursor-pointer hover:bg-slate-700 transition-colors flex items-center justify-between"
            >
              <span>
                {orderFilter === 'all' && t.allOrders}
                {orderFilter === 'completed' && t.readyOrders}
                {orderFilter === 'progress' && t.inProgress}
              </span>
              <ChevronDown className="ml-3 text-slate-400 w-5 h-5" />
            </button>
            {showOrderFilterDropdown && (
              <div className="absolute top-full mt-2 w-full bg-slate-700 border border-slate-600/50 rounded-xl shadow-xl overflow-hidden z-50">
                <button
                  onClick={() => {
                    setOrderFilter('all');
                    setShowOrderFilterDropdown(false);
                  }}
                  className={`w-full px-6 py-3 text-left hover:bg-slate-600 transition-colors ${
                    orderFilter === 'all' ? 'bg-blue-500 text-white' : 'text-white'
                  }`}
                >
                  {t.allOrders}
                </button>
                <button
                  onClick={() => {
                    setOrderFilter('completed');
                    setShowOrderFilterDropdown(false);
                  }}
                  className={`w-full px-6 py-3 text-left hover:bg-slate-600 transition-colors ${
                    orderFilter === 'completed' ? 'bg-blue-500 text-white' : 'text-white'
                  }`}
                >
                  {t.readyOrders}
                </button>
                <button
                  onClick={() => {
                    setOrderFilter('progress');
                    setShowOrderFilterDropdown(false);
                  }}
                  className={`w-full px-6 py-3 text-left hover:bg-slate-600 transition-colors ${
                    orderFilter === 'progress' ? 'bg-blue-500 text-white' : 'text-white'
                  }`}
                >
                  {t.inProgress}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => {
                setSelectedProject(project);
                if (isAdmin) {
                  setShowProjectModal(true);
                } else {
                  setCurrentPage('project-detail');
                }
              }}
              className={`hover:opacity-90 border border-slate-600/50 rounded-xl p-6 text-white transition-all ${
                project.status === 'progress'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500'
              }`}
            >
              <div className="font-semibold text-lg">{project.name}</div>
              {project.createdBy && (
                <div className="text-sm font-normal mt-2 opacity-90">
                  {t.createdOrder} [ {project.createdBy} ]
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderProjectDetailPage = () => {
    const projectData = selectedProject?.data || {};

    return (
    <div className="flex-1 p-8">
      <button
        onClick={() => setCurrentPage('orders')}
        className="mb-6 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-lg text-white transition-colors"
      >
        {t.backToOrders}
      </button>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">{selectedProject?.name || 'Project 1'}</h2>
          <div className="space-y-3 text-base">
            <div>
              <span className="text-slate-300">{t.siteThemeFull}: </span>
              <span className="text-blue-400 font-medium">{projectData.theme || 'Путешествие по Нидерландам'}</span>
            </div>
            <div>
              <span className="text-slate-300">{t.siteType}: </span>
              <span className="text-blue-400 font-medium">{projectData.siteType === 'landing' ? t.landing : projectData.siteType === 'multipage' ? t.multipage : '-'}</span>
            </div>
            <div>
              <span className="text-slate-300">{t.geoFull}: </span>
              <span className="text-blue-400 font-medium">{projectData.geo || 'Нидерланды'}</span>
            </div>
            <div>
              <span className="text-slate-300">{t.siteLanguage}: </span>
              <span className="text-blue-400 font-medium">{projectData.siteLanguage || 'Нидерландский'}</span>
            </div>
            <div>
              <span className="text-slate-300">{t.whitePageCountShort}: </span>
              <span className="text-blue-400 font-medium">{projectData.whitePageCount || '50'}</span>
            </div>
            <div>
              <span className="text-slate-300">{t.buyerNicknameFull}: </span>
              <span className="text-blue-400 font-medium">{projectData.buyerNickname || 'Tractor'}</span>
            </div>
            <div>
              <span className="text-slate-300">{t.writingLanguage}: </span>
              <span className="text-blue-400 font-medium">{projectData.language || 'HTML'}</span>
            </div>
            <div>
              <span className="text-slate-300">{t.orderCost}: </span>
              <span className="text-blue-400 font-medium">${projectData.cost || '350'}</span>
            </div>
            {selectedProject?.createdBy && (
              <div className="pt-3 mt-3 border-t border-slate-600">
                <span className="text-slate-300">{t.orderCreator}: </span>
                <span className="text-green-400 font-medium">{selectedProject.createdBy}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">{t.feedbackOnProject}</h2>
          <textarea
            className="w-full h-32 bg-slate-600/50 border border-slate-500/50 rounded-lg px-4 py-3 text-white text-sm resize-none placeholder-slate-400"
            placeholder={t.feedbackPlaceholder}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
          <button
            onClick={async () => {
              if (!selectedProject) return;
              // Show thanks popup
              setShowFeedbackThanks(true);
              setTimeout(() => setShowFeedbackThanks(false), 3000);

              // Send Telegram notification via Edge Function
              try {
                const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-feedback`;
                await fetch(apiUrl, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    projectName: selectedProject.name,
                    createdBy: selectedProject.createdBy,
                    feedbackText: feedbackText,
                  }),
                });
              } catch (error) {
                console.error('Failed to send feedback to Telegram:', error);
              }

              // Optionally persist feedback in DB if needed in future
              try {
                await supabase.from('feedback').insert({
                  order_id: selectedProject.id,
                  project_name: selectedProject.name,
                  creator_name: selectedProject.createdBy,
                  feedback_text: feedbackText,
                  submitted_by_token: currentUserToken,
                });
              } catch (_) {}

              setFeedbackText('');
            }}
            className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg py-4 rounded-xl transition-colors"
          >
            {t.sendFeedback}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 text-center">{t.projectDetails}</h3>
          <div className="bg-slate-600/50 rounded-lg p-4 text-sm text-slate-300 leading-relaxed max-h-96 overflow-y-auto">
            {projectData.details ? (
              <p className="whitespace-pre-wrap">{projectData.details}</p>
            ) : (
              <>
                <p className="mb-2">1. {t.defaultDetails1}</p>
                <p className="mb-2">2. {t.defaultDetails2}</p>
                <p className="mb-2">3. {t.defaultDetails3}</p>
                <p className="mb-2">5. {t.defaultDetails4}</p>
                <p className="mb-2">6. {t.defaultDetails5}</p>
                <p className="mb-2">{t.defaultDetails6}</p>
                <p>{t.defaultDetails7}</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6 text-center">{t.projectFiles}</h3>
          <div className="flex-1 flex items-center justify-center">
            {selectedProject?.status === 'completed' && selectedProject?.projectFile ? (
              <button
                onClick={() => {
                  const fileData = projectFiles[selectedProject.id];
                  if (fileData) {
                    const link = document.createElement('a');
                    link.href = fileData;
                    link.download = selectedProject.projectFile;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    alert(t.fileUnavailable);
                  }
                }}
                className="bg-green-600/50 hover:bg-green-500/50 border border-green-500/50 rounded-xl px-12 py-8 text-white font-bold text-xl transition-colors flex items-center gap-4"
              >
                <Download className="w-8 h-8" />
                <span>{t.downloadProjectFiles}</span>
              </button>
            ) : (
              <div className="text-center">
                <div className="bg-slate-600/30 rounded-xl px-12 py-8 text-slate-400 font-semibold text-lg">
                  {t.projectInProgress}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderUsersPage = () => {
    if (isAdmin) {
      const adminUsers = accountUsers.filter(u => u.parentToken === adminToken);

      return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder={t.searchUsers}
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400"
              />
            </div>
            <div className="relative w-full sm:w-auto user-filter-dropdown">
              <button
                onClick={() => setIsUserFilterOpen(!isUserFilterOpen)}
                className="w-full px-6 py-3 pr-10 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white cursor-pointer flex items-center justify-between hover:bg-slate-600/50 transition-colors"
              >
                <span>
                  {userFilter === 'all' && t.allUsers}
                  {userFilter === 'active' && t.activeUsers}
                  {userFilter === 'inactive' && t.inactiveUsers}
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isUserFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserFilterOpen && (
                <div className="absolute top-full mt-2 w-full bg-slate-700 border border-slate-600 rounded-xl overflow-hidden shadow-lg z-50">
                  <button
                    onClick={() => {
                      setUserFilter('all');
                      setIsUserFilterOpen(false);
                    }}
                    className={`w-full px-6 py-3 text-left text-white hover:bg-blue-600 transition-colors ${
                      userFilter === 'all' ? 'bg-blue-600' : ''
                    }`}
                  >
                    {t.allUsers}
                  </button>
                  <button
                    onClick={() => {
                      setUserFilter('active');
                      setIsUserFilterOpen(false);
                    }}
                    className={`w-full px-6 py-3 text-left text-white hover:bg-blue-600 transition-colors ${
                      userFilter === 'active' ? 'bg-blue-600' : ''
                    }`}
                  >
                    {t.activeUsers}
                  </button>
                  <button
                    onClick={() => {
                      setUserFilter('inactive');
                      setIsUserFilterOpen(false);
                    }}
                    className={`w-full px-6 py-3 text-left text-white hover:bg-blue-600 transition-colors ${
                      userFilter === 'inactive' ? 'bg-blue-600' : ''
                    }`}
                  >
                    {t.inactiveUsers}
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
              let teamLeadToken = 'lead_';
              for (let i = 0; i < 16; i++) {
                teamLeadToken += chars[Math.floor(Math.random() * chars.length)];
              }

              const newUser = {
                id: accountUsers.length + 1,
                name: 'TM',
                nickname: 'TM',
                ip: '---',
                lastLogin: new Date().toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                orders: [],
                tokensAdded: 0,
                tokensSpent: 0,
                role: 'team-leader',
                parentToken: adminToken,
                token: teamLeadToken,
                teamId: teamLeadToken,
                isOnline: false,
                avatar: 'https://cdn.discordapp.com/attachments/1424455923136467024/1425127993398788186/Group_622_2.png?ex=68f0589f&is=68ef071f&hm=2485eeb9d98af767bc463f924a069871aa3013bb1405b35abde34cb9bc3e76b3&'
              };
              setAccountUsers([...accountUsers, newUser]);
              navigator.clipboard.writeText(teamLeadToken);
              setShowTokenCopied(true);
              setTimeout(() => setShowTokenCopied(false), 2000);
            }}
            className="mb-6 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-xl text-white font-medium transition-colors"
          >
            {t.createInviteToken}
          </button>

          {showTokenCopied && (
            <div className="mb-6 flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400">{t.teamLeadTokenCopied}</span>
            </div>
          )}

          <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl overflow-hidden">
            <div className="hidden lg:grid grid-cols-[200px_1fr_150px_120px_120px_100px] gap-4 p-4 bg-slate-800/50 border-b border-slate-600/50">
              <div className="text-slate-300 font-medium">{t.user}</div>
              <div className="text-slate-300 font-medium">{t.lastActivity}</div>
              <div className="text-slate-300 font-medium">{t.tokens}</div>
              <div className="text-slate-300 font-medium">{t.projects}</div>
              <div className="text-slate-300 font-medium">{t.spent}</div>
              <div className="text-slate-300 font-medium">{t.actions}</div>
            </div>

            {adminUsers.map((user) => {
              const invitedCount = user.role === 'team-leader' ? accountUsers.filter(u => u.parentToken === user.token).length : 0;

              const getTotalTeamProjects = (teamLeadUser: any) => {
                if (teamLeadUser.role === 'team-leader') {
                  const teamLeadProjects = teamLeadUser.orders?.length || 0;
                  const teamMembers = accountUsers.filter(u => u.parentToken === teamLeadUser.token);
                  const teamMembersProjects = teamMembers.reduce((sum, member) => sum + (member.orders?.length || 0), 0);
                  return teamLeadProjects + teamMembersProjects;
                }
                return teamLeadUser.orders?.length || 0;
              };

              const getTotalTeamTokens = (teamLeadUser: any) => {
                if (teamLeadUser.role === 'team-leader') {
                  const teamLeadTokens = teamLeadUser.tokensAdded || 0;
                  const teamMembers = accountUsers.filter(u => u.parentToken === teamLeadUser.token);
                  const teamMembersTokens = teamMembers.reduce((sum, member) => sum + (member.tokensAdded || 0), 0);
                  return teamLeadTokens + teamMembersTokens;
                }
                return teamLeadUser.tokensAdded || 0;
              };

              return (
              <div key={user.id} className="lg:grid lg:grid-cols-[200px_1fr_150px_120px_120px_100px] gap-4 p-4 border-b border-slate-600/30 last:border-b-0 hover:bg-slate-600/20 transition-colors flex flex-col lg:items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                    <img
                      src={user.avatar || (user.role === 'team-leader'
                        ? 'https://cdn.discordapp.com/attachments/1424455923136467024/1425127993398788186/Group_622_2.png?ex=68f0589f&is=68ef071f&hm=2485eeb9d98af767bc463f924a069871aa3013bb1405b35abde34cb9bc3e76b3&'
                        : 'https://cdn.discordapp.com/attachments/1424455923136467024/1425150748655882250/Group_622_3.png?ex=68f06dd0&is=68ef1c50&hm=f033c4f153045910e741d7471cbf6beeaaf7f5aedfe1b18af903d4ce4cca08c9&')
                      }
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-white font-medium">{user.nickname || user.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-slate-400 text-xs">{user.token}</div>
                      <button
                        onClick={() => handleCopyToken(user.token)}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                        title="Копировать токен"
                      >
                        {copiedToken === user.token ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    {user.role === 'team-leader' && (
                      <div className="text-blue-400 text-xs mt-1">Участников: {invitedCount}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <div>
                    <div className="text-white">{user.lastLogin}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="text-green-400 font-semibold text-lg">{getTotalTeamTokens(user)}</span>
                </div>

                <div className="flex items-center">
                  <span className="text-white font-medium">{getTotalTeamProjects(user)}</span>
                </div>

                <div className="flex items-center">
                  <span className="text-red-400 font-semibold text-lg">{user.tokensSpent || 0}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowAddTokensModal(true);
                    }}
                    className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5 text-green-400" />
                  </button>
                  <button
                    onClick={() => {
                      setAccountUsers(accountUsers.filter(u => u.id !== user.id));
                    }}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      );
    }

    const handleEditUserName = (userId: number, currentName: string) => {
      setEditingUserId(userId);
      setEditingUserName(currentName);
    };

    const handleSaveUserName = (userId: number) => {
      const userToUpdate = accountUsers.find(u => u.id === userId);

      setAccountUsers(accountUsers.map(user =>
        user.id === userId ? { ...user, name: editingUserName, nickname: editingUserName } : user
      ));

      if (userToUpdate) {
        setOrders(orders.map(order =>
          order.createdByToken === userToUpdate.token ? { ...order, createdBy: editingUserName } : order
        ));
      }

      setEditingUserId(null);
      setEditingUserName('');
    };

    const teamMembers = accountUsers.filter(u => u.parentToken === currentUserToken);
    const isMaxTeamMembersReached = teamMembers.length >= 3;

    return (
      <div className="flex-1 p-8">
        <button
          onClick={() => {
            if (isMaxTeamMembersReached) {
              alert(t.maxTeamMembersReached);
              return;
            }

            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let randomPart = '';
            for (let i = 0; i < 8; i++) {
              randomPart += chars[Math.floor(Math.random() * chars.length)];
            }
            const memberToken = `tm_${randomPart}`;

            const nextUserNumber = accountUsers.filter(u => u.role === 'team-member').length + 1;
            const newTeamMember = {
              id: Date.now(),
              name: `User ${nextUserNumber}`,
              nickname: `User ${nextUserNumber}`,
              token: memberToken,
              ip: '—',
              lastLogin: '—',
              orders: [],
              tokensAdded: 0,
              tokensSpent: 0,
              role: 'team-member',
              parentToken: currentUserToken,
              isOnline: false,
              avatar: 'https://cdn.discordapp.com/attachments/1424455923136467024/1425150748655882250/Group_622_3.png?ex=68f06dd0&is=68ef1c50&hm=f033c4f153045910e741d7471cbf6beeaaf7f5aedfe1b18af903d4ce4cca08c9&'
            };

            setAccountUsers([...accountUsers, newTeamMember]);
          }}
          disabled={isMaxTeamMembersReached}
          className={`mb-6 px-6 py-3 border rounded-xl text-white font-medium transition-colors ${
            isMaxTeamMembersReached
              ? 'bg-slate-600/30 border-slate-600/30 cursor-not-allowed opacity-50'
              : 'bg-slate-700/50 hover:bg-slate-600/50 border-slate-600/50 cursor-pointer'
          }`}
        >
          {t.createInviteToken}
        </button>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400 rounded-xl p-6 shadow-lg shadow-blue-500/50">
            <div className="flex flex-col items-center justify-center gap-1 mb-6">
              <h3 className="text-lg font-bold text-white">{userName || 'Team Leader'}</h3>
              <div className="flex items-center gap-2">
                <p className="text-slate-300 text-xs">{currentUserToken}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(currentUserToken)}
                  className="p-1 hover:bg-blue-500/30 rounded transition-colors"
                  title="Копировать токен"
                >
                  <Copy className="w-3 h-3 text-slate-300" />
                </button>
              </div>
            </div>

            <div>
              <button
                onClick={() => {
                  const teamLeaderOrders = orders.filter(order => order.createdByToken === currentUserToken);
                  const teamLeader = accountUsers.find(u => u.token === currentUserToken) || {
                    name: userName,
                    nickname: userName,
                    ip: '86.29.223.12:7942',
                    lastLogin: lastLoginTime,
                    orders: teamLeaderOrders,
                    tokensAdded: userTokensAdded,
                    tokensSpent: teamLeaderOrders.reduce((sum, order) => sum + (parseFloat(order.data?.cost) || 0), 0),
                    role: 'team-leader',
                    token: currentUserToken
                  };
                  setSelectedUserForActions(teamLeader);
                  setShowUserActionsModal(true);
                }}
                className="w-full bg-blue-500/30 hover:bg-blue-500/50 rounded-lg p-4 text-white text-sm transition-colors font-medium"
              >
                {t.viewActions}
              </button>
            </div>
          </div>

          {teamMembers.map((user) => (
            <div key={user.id} className={`${user.isOnline ? 'bg-gradient-to-br from-green-700/50 to-green-900/50 border-2 border-green-400 shadow-lg shadow-green-500/30' : 'bg-slate-700/50 border border-slate-600/50'} rounded-xl p-6`}>
              <div className="flex flex-col items-center justify-center gap-1 mb-6">
                <h3 className="text-lg font-bold text-white">{user.name}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-slate-400 text-xs">{user.token}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(user.token)}
                    className="p-1 hover:bg-slate-600/50 rounded transition-colors"
                    title="Копировать токен"
                  >
                    <Copy className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    setSelectedUserForActions(user);
                    setShowUserActionsModal(true);
                  }}
                  className="w-full bg-slate-600/50 hover:bg-slate-500/50 rounded-lg p-4 text-slate-200 text-sm transition-colors font-medium"
                >
                  {t.viewActions}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAdminPanelPage = () => (
    <div className="flex-1 p-8">
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white border border-blue-500/30">
          <p className="text-blue-200 text-sm mb-2">{t.totalUsersCount}</p>
          <div className="flex items-end justify-between">
            <p className="text-5xl font-bold">{getAllUsersCount()}</p>
            <Users className="w-16 h-16 text-blue-300/50" />
          </div>
        </div>

        <div
          onClick={() => setShowDiscountUsersModal(true)}
          className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-6 text-white border border-yellow-500/30 cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
        >
          <p className="text-yellow-200 text-sm mb-2">{t.totalUsersWithDiscount}</p>
          <div className="flex items-end justify-between">
            <p className="text-5xl font-bold">{getUsersWithDiscount().length}</p>
            <User className="w-16 h-16 text-yellow-300/50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-6 text-white border border-red-500/30">
          <p className="text-red-200 text-sm mb-2">{t.whitePageCreatedCount}</p>
          <div className="flex items-end justify-between">
            <p className="text-5xl font-bold">{getAllWhitePagesCount()}</p>
            <Heart className="w-16 h-16 text-red-300/50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-white border border-green-500/30">
          <p className="text-green-200 text-sm mb-2">{t.totalRevenue}</p>
          <div className="flex items-end justify-between">
            <p className="text-5xl font-bold">${getAllUsersRevenue().toFixed(2)}</p>
            <DollarSign className="w-16 h-16 text-green-300/50" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderRevenuePage = () => {
    // Helper function to parse different date formats
    const parseDate = (dateString: string): Date | null => {
      try {
        // Try DD.MM.YYYY format (transactions)
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
          const [day, month, year] = dateString.split('.');
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }

        // Try Russian format like "12 окт. 2025" (orders)
        const russianMonths: {[key: string]: number} = {
          'янв': 0, 'февр': 1, 'мар': 2, 'апр': 3, 'мая': 4, 'июн': 5,
          'июл': 6, 'авг': 7, 'сент': 8, 'окт': 9, 'нояб': 10, 'дек': 11
        };

        const parts = dateString.split(' ');
        if (parts.length >= 3) {
          const day = parseInt(parts[0]);
          const monthKey = parts[1].replace('.', '').toLowerCase();
          const year = parseInt(parts[2]);

          for (const [key, monthNum] of Object.entries(russianMonths)) {
            if (monthKey.startsWith(key)) {
              return new Date(year, monthNum, day);
            }
          }
        }

        // Fallback to Date parsing
        return new Date(dateString);
      } catch (e) {
        console.error('Failed to parse date:', dateString, e);
        return null;
      }
    };

    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="relative">
            <input
              type="month"
              value={revenueSearchQuery}
              onChange={(e) => setRevenueSearchQuery(e.target.value)}
              placeholder={t.searchByDate}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400"
            />
          </div>

          <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 sm:p-6">
            <p className="text-slate-400 text-sm mb-2">
              Общий Доход за Месяц {(() => {
                if (!revenueSearchQuery) return new Date().toLocaleString('ru-RU', { month: 'long' });
                const [year, month] = revenueSearchQuery.split('-');
                return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('ru-RU', { month: 'long' });
              })()}
            </p>
            <div className="flex items-center justify-between gap-4 mb-4">
              <p className="text-green-400 text-3xl sm:text-4xl lg:text-5xl font-bold">
                {(() => {
                  const now = new Date();
                  const currentYear = now.getFullYear();
                  const currentMonth = now.getMonth();

                  // Determine which year and month to filter by
                  let filterYear = currentYear;
                  let filterMonth = currentMonth;

                  if (revenueSearchQuery) {
                    const [searchYear, searchMonth] = revenueSearchQuery.split('-');
                    filterYear = parseInt(searchYear);
                    filterMonth = parseInt(searchMonth) - 1;
                  }

                  // Calculate total deposits for the selected month
                  const filteredTransactions = transactions.filter(transaction => {
                    const transDate = parseDate(transaction.date);
                    if (!transDate) return false;

                    return transDate.getFullYear() === filterYear &&
                           transDate.getMonth() === filterMonth;
                  });

                  const totalDeposits = filteredTransactions.reduce((sum, transaction) => {
                    return sum + transaction.amount;
                  }, 0);

                  return `${totalDeposits.toFixed(0)} $`;
                })()}
              </p>
              <DollarSign className="w-20 h-20 text-green-400/30" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 text-center">
              {(() => {
                if (!revenueSearchQuery) {
                  const now = new Date();
                  return now.toLocaleString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
                }
                const [year, month] = revenueSearchQuery.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);
                return date.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
              })()}
            </h3>
            <div className="bg-slate-600/50 rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 gap-2 p-2 sm:p-3 bg-slate-700/50 text-xs font-medium text-slate-300">
                <div>Команды</div>
                <div>Кол-во WP</div>
                <div>Сумма Пополнений</div>
              </div>
              {(() => {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth();

                // Determine which year and month to filter by
                let filterYear = currentYear;
                let filterMonth = currentMonth;

                if (revenueSearchQuery) {
                  const [searchYear, searchMonth] = revenueSearchQuery.split('-');
                  filterYear = parseInt(searchYear);
                  filterMonth = parseInt(searchMonth) - 1;
                }

                // Filter completed orders
                const filteredOrders = orders.filter(order => {
                  if (order.status !== 'completed') return false;

                  const orderDate = parseDate(order.date);
                  if (!orderDate) return false;

                  return orderDate.getFullYear() === filterYear &&
                         orderDate.getMonth() === filterMonth;
                });

                // Group data by team (TeamLead)
                const teamData: Map<string, {teamLeadToken: string, wpCount: number, orderRevenue: number, deposits: number}> = new Map();

                // Process orders - group by team
                filteredOrders.forEach(order => {
                  const creator = accountUsers.find(u => u.token === order.createdByToken);
                  if (!creator) return;

                  // Find the team leader
                  let teamLeadToken = creator.token;
                  if (creator.parentToken && (creator.token.startsWith('tm_') || creator.token.startsWith('tl_'))) {
                    teamLeadToken = creator.parentToken;
                  } else if (creator.token.startsWith('lead_') || creator.token.startsWith('f4d2dsfre3')) {
                    teamLeadToken = creator.token;
                  }

                  if (!teamData.has(teamLeadToken)) {
                    teamData.set(teamLeadToken, {
                      teamLeadToken,
                      wpCount: 0,
                      orderRevenue: 0,
                      deposits: 0
                    });
                  }

                  const data = teamData.get(teamLeadToken)!;
                  const whitePageCount = parseInt(order.data?.whitePageCount || '0');
                  data.wpCount += whitePageCount;
                  data.orderRevenue += parseFloat(order.data?.cost || '0');
                });

                // Process deposits - group by team
                const filteredTransactions = transactions.filter(transaction => {
                  const transDate = parseDate(transaction.date);
                  if (!transDate) return false;

                  return transDate.getFullYear() === filterYear &&
                         transDate.getMonth() === filterMonth;
                });

                // Track deposits by team
                filteredTransactions.forEach(transaction => {
                  if (!transaction.userToken) return;

                  const user = accountUsers.find(u => u.token === transaction.userToken);
                  if (!user) return;

                  // Find the team leader for this user
                  let teamLeadToken = user.token;
                  if (user.parentToken && (user.token.startsWith('tm_') || user.token.startsWith('tl_'))) {
                    teamLeadToken = user.parentToken;
                  } else if (user.token.startsWith('lead_') || user.token.startsWith('f4d2dsfre3')) {
                    teamLeadToken = user.token;
                  }

                  if (!teamData.has(teamLeadToken)) {
                    teamData.set(teamLeadToken, {
                      teamLeadToken,
                      wpCount: 0,
                      orderRevenue: 0,
                      deposits: 0
                    });
                  }

                  const data = teamData.get(teamLeadToken)!;
                  data.deposits += transaction.amount;
                });

                // Check if there are any teams to display
                if (teamData.size === 0) {
                  return (
                    <div className="p-6 text-center text-slate-400">
                      Нет данных за выбранный период
                    </div>
                  );
                }

                // Convert to array and sort by deposits
                const teamsArray = Array.from(teamData.values());
                teamsArray.sort((a, b) => b.deposits - a.deposits);

                return teamsArray.map((team, index) => {
                  const teamLead = accountUsers.find(u => u.token === team.teamLeadToken);
                  const teamLeadName = teamLead?.nickname || teamLead?.name || 'Неизвестная команда';

                  return (
                    <div key={`team-${team.teamLeadToken}-${index}`} className="grid grid-cols-3 gap-2 p-3 border-t border-slate-700/50 text-xs text-slate-300">
                      <div>{teamLeadName}</div>
                      <div>{team.wpCount}</div>
                      <div className="text-green-400">{team.deposits.toFixed(0)} $</div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsPage = () => (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 w-full px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Настройки Администратора</h1>

        <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Уведомления</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-500 bg-slate-700 border-slate-600 rounded" />
              <span className="text-slate-300">Уведомлять о новых заказах</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-500 bg-slate-700 border-slate-600 rounded" />
              <span className="text-slate-300">Уведомлять о пополнениях баланса</span>
            </label>
          </div>
        </div>

        <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">{t.telegramBots}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">{t.telegramBotFinance}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <div className="flex items-center gap-2 bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2">
                  <span className="text-slate-400 text-xs flex-1 truncate">API: 8268207323:AAH1wxS3EdpeM_mukABTpjTkp_fO87zhd5M</span>
                  <button
                    onClick={() => navigator.clipboard.writeText('8268207323:AAH1wxS3EdpeM_mukABTpjTkp_fO87zhd5M')}
                    className="p-1 hover:bg-slate-600/50 rounded transition-colors flex-shrink-0"
                    title="Скопировать API"
                  >
                    <Copy className="w-3 h-3 text-slate-400 hover:text-white" />
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2">
                  <span className="text-slate-400 text-xs flex-1 truncate">https://t.me/finance_fastpage_bot</span>
                  <button
                    onClick={() => navigator.clipboard.writeText('https://t.me/finance_fastpage_bot')}
                    className="p-1 hover:bg-slate-600/50 rounded transition-colors flex-shrink-0"
                    title="Скопировать ссылку"
                  >
                    <Copy className="w-3 h-3 text-slate-400 hover:text-white" />
                  </button>
                </div>
              </div>
              <p className="text-slate-400 text-xs mb-2">Ссылка на группу для уведомлений:</p>
              <input
                type="text"
                value={telegramFinanceGroup}
                onChange={(e) => setTelegramFinanceGroup(e.target.value)}
                placeholder={t.pasteGroupLink}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">{t.telegramBotOrders}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <div className="flex items-center gap-2 bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2">
                  <span className="text-slate-400 text-xs flex-1 truncate">API: 7985996300:AAG85SZGY_d2Yx5iinoZVLw5Ccjr26YNqOQ</span>
                  <button
                    onClick={() => navigator.clipboard.writeText('7985996300:AAG85SZGY_d2Yx5iinoZVLw5Ccjr26YNqOQ')}
                    className="p-1 hover:bg-slate-600/50 rounded transition-colors flex-shrink-0"
                    title="Скопировать API"
                  >
                    <Copy className="w-3 h-3 text-slate-400 hover:text-white" />
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2">
                  <span className="text-slate-400 text-xs flex-1 truncate">https://t.me/notification_fastpage_bot</span>
                  <button
                    onClick={() => navigator.clipboard.writeText('https://t.me/notification_fastpage_bot')}
                    className="p-1 hover:bg-slate-600/50 rounded transition-colors flex-shrink-0"
                    title="Скопировать ссылку"
                  >
                    <Copy className="w-3 h-3 text-slate-400 hover:text-white" />
                  </button>
                </div>
              </div>
              <p className="text-slate-400 text-xs mb-2">Ссылка на группу для уведомлений:</p>
              <input
                type="text"
                value={telegramOrdersGroup}
                onChange={(e) => setTelegramOrdersGroup(e.target.value)}
                placeholder={t.pasteGroupLink}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {showSaveSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300 text-sm">Настройки успешно сохранены!</span>
          </div>
        )}

        <button
          onClick={handleSaveSettings}
          className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold py-4 rounded-xl transition-all"
        >
          {t.saveAllChanges}
        </button>
      </div>
    </div>
  );

  const renderDashboardPage = () => (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-200 text-sm">{t.whitePagesCreated}</p>
              <p className="text-2xl sm:text-3xl font-bold">{getTeamWhitePagesCount()}</p>
            </div>
            <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-red-300" />
          </div>
        </div>

        <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">{t.totalUsers}</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{getTeamUsersCount()}</p>
            </div>
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400" />
          </div>
        </div>

        {!isTeamMember && (
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">{t.spentOnWhitePage}</p>
                <p className="text-2xl sm:text-3xl font-bold">${getTeamTotalSpent()}</p>
              </div>
              <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 text-green-300" />
            </div>
          </div>
        )}

        <div
          onClick={() => setShowDiscountModal(true)}
          className={`bg-gradient-to-r ${getDiscountBlockStyles().gradient} rounded-lg p-4 sm:p-6 text-white cursor-pointer ${getDiscountBlockStyles().hover} transition-all`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`${getDiscountBlockStyles().textColor} text-sm`}>{t.personalDiscount}</p>
              <p className="text-2xl sm:text-3xl font-bold">{calculatePersonalDiscount()}%</p>
            </div>
            <User className={`w-10 h-10 sm:w-12 sm:h-12 ${getDiscountBlockStyles().iconColor}`} />
          </div>
        </div>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {showModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/50">
                <h2 className="text-xl font-semibold text-white">Login to Panel</h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="text-center">
                  <p className="text-slate-400">Enter the token issued to you</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Key className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => {
                        setToken(e.target.value);
                        if (error) setError('');
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your token"
                      className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    onClick={handleLogin}
                    disabled={isLoading || !token.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Logging in...</span>
                      </div>
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-64 bg-slate-800/50 border-b lg:border-b-0 lg:border-r border-slate-700/50 flex flex-col">
        <div className="p-4 lg:p-6 flex items-center justify-center lg:justify-start">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center flex-shrink-0">
            <img src="https://cdn.discordapp.com/attachments/1424455923136467024/1424460609910603936/Group_621.png?ex=68f08e12&is=68ef3c92&hm=79363444d7b1d2aa723be60d3fe93ffe48eca17c4ca15ae752349052e0c8589c&" alt="Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        <nav className="flex flex-row lg:flex-col gap-2 px-4 lg:px-6 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0">
          {isAdmin ? (
            <>
              <button
                onClick={() => setCurrentPage('admin-panel')}
                className={`whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg transition-colors flex-shrink-0 ${
                  currentPage === 'admin-panel'
                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Admin Panel</span>
              </button>

              <button
                onClick={() => setCurrentPage('users')}
                className={`whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg transition-colors flex-shrink-0 ${
                  currentPage === 'users'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">{t.users}</span>
              </button>

              <button
                onClick={() => setCurrentPage('orders')}
                className={`whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg transition-colors flex-shrink-0 ${
                  currentPage === 'orders'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Package className="w-4 h-4" />
                <span className="text-sm">{t.orders}</span>
              </button>

              <button
                onClick={() => setCurrentPage('revenue')}
                className={`whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg transition-colors flex-shrink-0 ${
                  currentPage === 'revenue'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">{t.revenue}</span>
              </button>

              <button
                onClick={() => setCurrentPage('settings')}
                className={`whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg transition-colors flex-shrink-0 ${
                  currentPage === 'settings'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">{t.settings}</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentPage('create-order')}
                className={`whitespace-nowrap flex items-center justify-center lg:justify-start gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors flex-shrink-0 ${
                  currentPage === 'create-order'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Edit className="w-5 h-5" />
                {t.createOrder}
              </button>

              <button
                onClick={() => setCurrentPage('orders')}
                className={`whitespace-nowrap flex items-center justify-center lg:justify-start gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors flex-shrink-0 ${
                  currentPage === 'orders' || currentPage === 'project-detail'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Package className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="text-sm lg:text-base">{t.orders}</span>
              </button>

              {!isTeamMember && (
                <button
                  onClick={() => setCurrentPage('users')}
                  className={`whitespace-nowrap flex items-center justify-center lg:justify-start gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors flex-shrink-0 ${
                    currentPage === 'users'
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  {t.users}
                </button>
              )}

              {!isTeamMember && (
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`whitespace-nowrap flex items-center justify-center lg:justify-start gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors flex-shrink-0 ${
                    currentPage === 'dashboard'
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  {t.dashboard}
                </button>
              )}
            </>
          )}
        </nav>

        {/* Bottom Menu with Avatar */}
        {isAdmin ? (
          <div className="mt-auto p-4 lg:p-6">
            <div className="flex items-center gap-3 bg-slate-700/50 border border-slate-600/50 rounded-xl p-3">
              <button
                onClick={() => setShowAvatarUploadModal(true)}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
                title="Изменить аватар"
              >
                {userAvatar.startsWith('data:') || userAvatar.startsWith('http') ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{userAvatar}</span>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600/50 rounded-lg transition-colors flex-shrink-0"
                title="Выход"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            className="relative mt-auto p-4 lg:p-6"
            onMouseEnter={() => setIsBottomMenuExpanded(true)}
            onMouseLeave={() => setIsBottomMenuExpanded(false)}
          >
            <div className={`bg-slate-700/50 border border-slate-600/50 rounded-xl overflow-hidden transition-all duration-300 ${
              isBottomMenuExpanded ? 'h-auto' : 'h-16'
            }`}>
              {/* Avatar Section */}
              <div className="flex items-center gap-3 p-3">
                <div className={`w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0 transition-all duration-300 ${getAvatarGlowClass()}`}>
                  {userAvatar.startsWith('data:') || userAvatar.startsWith('http') ? (
                    <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userAvatar}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {userName || 'User'}
                  </p>
                </div>
              </div>

              {/* Expanded Menu Items */}
              <div className={`transition-all duration-300 ${
                isBottomMenuExpanded ? 'opacity-100' : 'opacity-0 h-0'
              }`}>
                <div className="px-3 pb-3 space-y-1">
                  <button
                    onClick={() => {
                      setShowProfileModal(true);
                      setProfileTab('profile');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-600/50 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">{t.profile}</span>
                  </button>
                  <button
                    onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-600/50 rounded-lg transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">{language === 'ru' ? 'ENG' : 'RU'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowSupportModal(true);
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-600/50 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{t.support}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-slate-600/50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">{t.logout}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800/30 border-b border-slate-700/50 px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {!showModal && (
                <img
                  src="https://cdn.discordapp.com/attachments/1424455923136467024/1424460609910603936/Group_621.png?ex=68f08e12&is=68ef3c92&hm=79363444d7b1d2aa723be60d3fe93ffe48eca17c4ca15ae752349052e0c8589c&"
                  alt="Logo"
                  className="h-8 w-auto hidden sm:block"
                />
              )}
            </div>

            <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                setShowNotificationModal(true);
                await notifications.openBell(orders);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
            >
              <Bell className={`w-4 h-4 ${notifications.isBellRed(orders) ? 'text-red-500' : ''}`} />
            </button>

            {!isAdmin && (
              <button
                onClick={() => setShowWalletModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span className="text-sm">
                  {tokenBalance}
                </span>
              </button>
            )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        {currentPage === 'admin-panel' && renderAdminPanelPage()}
        {currentPage === 'create-order' && renderCreateOrderPage()}
        {currentPage === 'orders' && renderOrdersPage()}
        {currentPage === 'project-detail' && renderProjectDetailPage()}
        {currentPage === 'users' && renderUsersPage()}
        {currentPage === 'revenue' && renderRevenuePage()}
        {currentPage === 'settings' && renderSettingsPage()}
        {currentPage === 'dashboard' && renderDashboardPage()}
      </div>

      {/* Project Details Modal */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md mx-2 sm:mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-700/50 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-lg sm:text-xl font-semibold text-white">{selectedProject.name}</h2>
              <button
                onClick={() => setShowProjectModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-400">{t.siteThemeFull}: </span>
                  <span className="text-blue-400">{selectedProject?.data?.theme || t.notSpecified}</span>
                </div>
                <div>
                  <span className="text-slate-400">{t.siteType}: </span>
                  <span className="text-blue-400">{selectedProject?.data?.siteType === 'landing' ? t.landing : selectedProject?.data?.siteType === 'multipage' ? t.multipage : t.notSpecified}</span>
                </div>
                <div>
                  <span className="text-slate-400">{t.geoFull}: </span>
                  <span className="text-blue-400">{selectedProject?.data?.geo || t.notSpecified}</span>
                </div>
                <div>
                  <span className="text-slate-400">{t.siteLanguage}: </span>
                  <span className="text-blue-400">{selectedProject?.data?.siteLanguage || t.notSpecified}</span>
                </div>
                <div>
                  <span className="text-slate-400">{t.whitePageCountShort}: </span>
                  <span className="text-blue-400 font-semibold">{selectedProject?.data?.whitePageCount || t.notSpecified}</span>
                </div>
                <div>
                  <span className="text-slate-400">{t.buyerNicknameFull}: </span>
                  <span className="text-blue-400">{selectedProject?.data?.buyerNickname || t.notSpecified}</span>
                </div>
                <div>
                  <span className="text-slate-400">{t.writingLanguage}: </span>
                  <span className="text-blue-400">{selectedProject?.data?.language || t.notSpecified}</span>
                </div>
                <div>
                  <span className="text-slate-400">{t.orderCost}: </span>
                  <span className="text-green-400 font-bold">${selectedProject?.data?.cost || '0'}</span>
                </div>
                <div>
                  <span className="text-slate-400">{t.createdDate}: </span>
                  <span className="text-blue-400">{selectedProject?.date || t.notSpecified}</span>
                </div>
                {selectedProject?.createdBy && (
                  <div className="pt-2 mt-2 border-t border-slate-600">
                    <span className="text-slate-400">{t.orderCreator}: </span>
                    <span className="text-green-400 font-semibold">{selectedProject.createdBy}</span>
                  </div>
                )}
              </div>

              {selectedProject?.data?.details && (
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-3">{t.projectDetails}</h3>
                  <div className="text-slate-300 text-sm space-y-1 max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {selectedProject.data.details}
                  </div>
                </div>
              )}

              <div>
                <input
                  type="file"
                  id="project-file-upload"
                  accept=".zip"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.name.endsWith('.zip')) {
                        setUploadedProjectFile(file);
                      } else {
                        alert('Пожалуйста, загрузите ZIP файл');
                      }
                    }
                  }}
                />
                <button
                  onClick={() => document.getElementById('project-file-upload')?.click()}
                  className="w-full bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {uploadedProjectFile ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>{uploadedProjectFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Прикрепить файл проекта (ZIP)</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => {
                  if (selectedProject) {
                    if (uploadedProjectFile) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const base64File = e.target?.result as string;
                        setProjectFiles(prev => ({
                          ...prev,
                          [selectedProject.id]: base64File
                        }));
                      };
                      reader.readAsDataURL(uploadedProjectFile);
                    }

                    const updatedOrders = orders.map(order => {
                      if (order.id === selectedProject.id) {
                        return { ...order, status: 'completed', projectFile: uploadedProjectFile?.name };
                      }
                      return order;
                    });
                    setOrders(updatedOrders);

                    (async () => {
                      try {
                        await supabase
                          .from('orders')
                          .update({ status: 'completed' })
                          .eq('id', selectedProject.id);
                      } catch (error) {
                        console.error('Failed to update order status in database:', error);
                      }
                    })();

                    if (selectedProject.createdByToken) {
                      setAccountUsers(accountUsers.map(user => {
                        if (user.token === selectedProject.createdByToken) {
                          const updatedUserOrders = (user.orders || []).map((o: any) =>
                            o.id === selectedProject.id ? { ...o, status: 'completed', projectFile: uploadedProjectFile?.name } : o
                          );
                          const newNotification = {
                            id: Date.now(),
                            type: 'order_completed',
                            message: `Ваш заказ "${selectedProject.name}" готов!`,
                            date: new Date().toLocaleString('ru-RU'),
                            orderId: selectedProject.id
                          };
                          return {
                            ...user,
                            orders: updatedUserOrders,
                            notifications: [...(user.notifications || []), newNotification]
                          };
                        }
                        return user;
                      }));

                      // Persist notification for the order creator (team isolation ensured by userToken)
                      (async () => {
                        try {
                          await notifications.createForUser({
                            userToken: selectedProject.createdByToken,
                            orderId: selectedProject.id,
                            message: `Ваш заказ "${selectedProject.name}" готов!`,
                            type: 'order_completed',
                          });
                        } catch (_) {}
                      })();

                      (async () => {
                        try {
                          const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-order-notify`;
                          await fetch(apiUrl, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              userToken: selectedProject.createdByToken,
                              projectName: selectedProject.name
                            })
                          });
                        } catch (error) {
                          console.error('Failed to send Telegram notification:', error);
                        }
                      })();
                    }

                    setUploadedProjectFile(null);
                    setShowProjectModal(false);
                    setShowOrderSentModal(true);
                    setTimeout(() => setShowOrderSentModal(false), 3000);
                  }
                }}
                disabled={!uploadedProjectFile}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.sendFeedback}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Success Modal */}
      {showCreateOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">{t.orderCreatedSuccessfully}</h2>
              <p className="text-slate-400 mb-6">{t.orderSent}</p>
              <button
                onClick={() => setShowCreateOrderModal(false)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {t.gotIt}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Thanks Modal */}
      {showFeedbackThanks && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Спасибо за ваш отзыв!</h2>
              <p className="text-slate-400 mb-6">Мы учтем ваши замечания и постараемся улучшить качество наших услуг в будущем.</p>
              <button
                onClick={() => setShowFeedbackThanks(false)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">{t.discountSystem}</h2>
              </div>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">5%</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{t.depositOn} $5,000</h3>
                    <p className="text-slate-300 text-sm">{t.discount5Percent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">10%</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{t.depositOn} $10,000</h3>
                    <p className="text-slate-300 text-sm">{t.discount10Percent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">35%</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{t.oneTimeOrder}</h3>
                    <p className="text-slate-300 text-sm">{t.specialDiscount35}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
                <p className="text-slate-400 text-sm text-center">
                  {t.discountsStackMessage}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-700/30 border-t border-slate-700/50">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-semibold py-3 rounded-lg transition-all"
              >
                {t.gotIt}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {profileTab === 'profile' ? t.profile : t.settings}
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            {!isAdmin && (
              <div className="flex">
                <button
                  onClick={() => setProfileTab('profile')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    profileTab === 'profile'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <User className="w-4 h-4" />
                  {t.profile}
                </button>
                <button
                  onClick={() => setProfileTab('settings')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    profileTab === 'settings'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  {t.settings}
                </button>
              </div>
            )}

            <div className="p-6">
              {(profileTab === 'profile' || isAdmin) ? (
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className={`w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden transition-all duration-300 ${getAvatarGlowClass()}`}>
                        {userAvatar.startsWith('data:') || userAvatar.startsWith('http') ? (
                          <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{userAvatar}</span>
                        )}
                      </div>
                      <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                        <Camera className="w-3 h-3 text-white" />
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-slate-400 text-sm mt-2">{t.clickCameraToChange}</p>
                    {userName && (
                      <p className="text-white text-lg font-semibold mt-2">{userName}</p>
                    )}
                  </div>

                  {/* Name & Nickname Inputs */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">{t.name}</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder={t.enterName}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400"
                    />
                  </div>

                  {/* Success Message */}
                  {showSaveSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-300 text-sm">{t.changesSaved}</span>
                    </div>
                  )}

                  {/* Save Button */}
                  <button onClick={handleSaveProfile} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all">
                    {t.saveChanges}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Account Token */}
                  {!isTeamMember && !isAdmin && currentUserToken !== 'f4d2dsfre3' && !currentUserToken.startsWith('lead_') && (
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">{t.accountInviteToken}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={accountToken}
                          readOnly
                          className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white"
                        />
                        <button onClick={handleRefreshToken} className="p-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
                          <RefreshCw className="w-4 h-4 text-white" />
                        </button>
                        <button onClick={handleCopyToken} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                          <Copy className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Notifications */}
                  <div>
                    <h3 className="text-white font-medium mb-3">{t.notifications}</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={notifyOrderComplete}
                          onChange={(e) => setNotifyOrderComplete(e.target.checked)}
                          className="w-5 h-5 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
                        />
                        <span className="text-slate-300">{t.notifyOrderComplete}</span>
                      </label>
                    </div>
                  </div>

                  {/* Telegram Link */}
                  {!isAdmin && (
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">{t.telegramNotifications}</label>
                      <p className="text-slate-400 text-sm mb-2">{t.telegramInstructions}</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={`https://t.me/FastPageAIOrderNotificationBOT?start=${currentUserToken}`}
                          readOnly
                          className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white text-sm"
                        />
                        <button onClick={() => {
                          navigator.clipboard.writeText(`https://t.me/FastPageAIOrderNotificationBOT?start=${currentUserToken}`);
                          setShowSaveSuccess(true);
                          setTimeout(() => setShowSaveSuccess(false), 2000);
                        }} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                          <Copy className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {showSaveSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-300 text-sm">{t.settingsSaved}</span>
                    </div>
                  )}

                  {/* Save Button */}
                  <button onClick={handleSaveSettings} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all">
                    {t.saveChanges}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">💳</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{t.tokenWallet}</h2>
                  <p className="text-blue-400 text-sm">{t.balance}: {tokenBalance} {t.tokens}</p>
                </div>
              </div>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex">
              <button
                onClick={() => setWalletTab('purchase')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  walletTab === 'purchase' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {t.purchase}
              </button>
              <button
                onClick={() => setWalletTab('transactions')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  walletTab === 'transactions' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {t.transactions}
              </button>
            </div>

            <div className="p-6">
              {walletTab === 'purchase' ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">{t.tokenomicsTitle}</h3>
                    <p className="text-slate-400 text-sm">{t.tokenomicsDescription}</p>
                  </div>

                  <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl">💰</span>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-white text-center mb-4">{t.depositAmountTitle}</h4>
                    <div className="text-right mb-2">
                      <span className="text-slate-400 text-sm">Min: 500 USDT</span>
                    </div>
                    <input
                      type="number"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      placeholder={t.enterAmount}
                      className="w-full bg-slate-600/50 border border-slate-500/50 rounded-lg px-4 py-3 text-white placeholder-slate-400"
                    />
                  </div>

                  {showTopUpSuccess && (
                    <div className="flex items-center gap-2 p-4 bg-green-500/20 border border-green-500/50 rounded-xl animate-pulse">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <div>
                        <p className="text-green-300 font-semibold">{t.topUpSuccess}</p>
                        <p className="text-green-400 text-sm">{t.tokensAddedToBalance}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleTopUp}
                    disabled={!topUpAmount || parseFloat(topUpAmount) < 500}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.continueToPayment}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white text-center">{t.paymentHistory}</h3>
                  
                  <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-6">
                    <div className="grid grid-cols-4 gap-4 mb-4 text-sm font-medium text-slate-300">
                      <div>{t.date}</div>
                      <div>{t.amount}</div>
                      <div>{t.status}</div>
                      <div>{t.transactionHash}</div>
                    </div>
                    
                    {transactions.map((transaction, i) => (
                      <div key={i} className="grid grid-cols-4 gap-4 py-3 border-b border-slate-600/30 last:border-b-0">
                        <div className="bg-slate-600/50 rounded-lg px-3 py-2 text-slate-300 text-sm">
                          {transaction.date}
                        </div>
                        <div className="bg-slate-600/50 rounded-lg px-3 py-2 text-slate-300 text-sm">
                          {transaction.amount} USDT
                        </div>
                        <div className={`rounded-lg px-3 py-2 text-sm font-medium ${
                          transaction.status === 'Successful' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {transaction.status}
                        </div>
                        <div className="bg-slate-600/50 rounded-lg px-3 py-2 text-slate-300 text-sm truncate">
                          {transaction.hash}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{t.notifications}</h2>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {isAdmin ? (
                <div className="space-y-4">
                  <h3 className="text-white font-semibold mb-3">{t.ordersFromUsers}</h3>
                  {orders.length === 0 ? (
                    <div className="flex items-start gap-3 p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl">
                      <Bell className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {t.noNewOrders}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {orders.map((order) => (
                        <div key={order.id} className="p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl hover:bg-slate-700/70 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-white font-semibold">{t.orderNumber} #{order.id}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                  order.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {order.status === 'completed' ? t.statusCompleted : order.status === 'in-progress' ? t.inProgress : t.statusPending}
                                </span>
                              </div>
                              <p className="text-slate-300 text-sm mb-1">{order.theme}</p>
                              <p className="text-slate-400 text-xs">White Page: {order.whitePageCount}</p>
                              <p className="text-slate-400 text-xs">{t.buyer}: {order.buyerNickname || t.notSpecified}</p>
                              <p className="text-slate-400 text-xs mt-2">{order.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-400 font-semibold">{parseFloat(order.data?.cost || '0').toFixed(2)} TOKEN</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-white font-semibold mb-3">{t.completedOrders}</h3>
                  {notifications.getList(orders).length === 0 ? (
                    <div className="flex items-start gap-3 p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl">
                      <Bell className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {t.noCompletedOrders}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {notifications.getList(orders).map((order) => (
                        <div key={order.id} className="p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl hover:bg-slate-700/70 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-white font-semibold">{t.orderNumber} #{order.id}</span>
                                <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                                  Выполнен
                                </span>
                              </div>
                              <p className="text-slate-300 text-sm mb-1">{order.theme}</p>
                              <p className="text-slate-400 text-xs">White Page: {order.whitePageCount}</p>
                              <p className="text-slate-400 text-xs">{t.buyer}: {order.buyerNickname || t.notSpecified}</p>
                              <p className="text-slate-400 text-xs mt-2">{order.date}</p>
                            </div>
                            <div className="text-right">
                              <button
                                onClick={() => {
                                  setSelectedProject(order);
                                  setCurrentPage('project-detail');
                                  setShowNotificationModal(false);
                                }}
                                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors"
                              >
                                Открыть
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{t.supportTitle}</h2>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-3 p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl mb-6">
                <MessageCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <p className="text-slate-300 text-sm leading-relaxed">
                  {t.supportDescription}
                </p>
              </div>

              <a
                href="https://t.me/fastpageaisupport"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
              >
                <MessageCircle className="w-5 h-5" />
                {t.contactSupport}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Upload Modal */}
      {showAvatarUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Изменить аватар</h2>
              <button
                onClick={() => setShowAvatarUploadModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
                  {userAvatar.startsWith('data:') || userAvatar.startsWith('http') ? (
                    <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userAvatar}</span>
                  )}
                </div>
                <p className="text-slate-400 text-sm text-center">Нажмите на кнопку ниже, чтобы выбрать новое изображение</p>
              </div>

              <div className="space-y-3">
                <label className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <span>Загрузить изображение</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleAvatarChange(e);
                      setShowAvatarUploadModal(false);
                    }}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => setShowAvatarUploadModal(false)}
                  className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-medium"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Actions Modal */}
      {showUserActionsModal && selectedUserForActions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{t.userActivity}: {selectedUserForActions.name}</h2>
              <button
                onClick={() => setShowUserActionsModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-3">{t.ipUsers}</h3>
                  <p className="text-slate-300 text-sm font-mono">{selectedUserForActions.ip || '86.29.223.12:7942'}</p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-3">{t.lastLogin}</h3>
                  <p className="text-slate-300 text-sm">{selectedUserForActions.lastLogin}</p>
                </div>
              </div>

              <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">{t.orders}</h3>
                {selectedUserForActions.orders && selectedUserForActions.orders.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUserForActions.orders.map((order: any, index: number) => (
                      <div key={index} className="bg-slate-600/50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-200 text-sm font-medium">{order.name}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {order.status === 'completed' ? t.statusReady : t.inProgress}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">{order.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">{t.noOrdersYet}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-3">{t.tokensAdded}</h3>
                  <p className="text-blue-400 text-2xl font-bold">{selectedUserForActions.tokensAdded}</p>
                </div>
                <div className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-3">{t.tokensSpent}</h3>
                  <p className="text-red-400 text-2xl font-bold">{selectedUserForActions.tokensSpent || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Token Modal */}
      {showInviteTokenModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{t.createInviteTokenTitle}</h2>
              <button
                onClick={() => setShowInviteTokenModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">{t.inviteTokenLabel}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedInviteToken}
                    readOnly
                    className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white"
                  />
                  <button
                    onClick={() => {
                      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
                      let randomPart = '';
                      const isTeamLeaderToken = generatedInviteToken.startsWith('lead_');

                      if (isTeamLeaderToken) {
                        for (let i = 0; i < 16; i++) {
                          randomPart += chars[Math.floor(Math.random() * chars.length)];
                        }
                        const newToken = `lead_${randomPart}`;

                        const existingUser = accountUsers.find(u => u.token === generatedInviteToken);
                        if (existingUser) {
                          setAccountUsers(accountUsers.map(u =>
                            u.token === generatedInviteToken ? { ...u, token: newToken } : u
                          ));
                        }

                        setGeneratedInviteToken(newToken);
                      } else {
                        for (let i = 0; i < 8; i++) {
                          randomPart += chars[Math.floor(Math.random() * chars.length)];
                        }

                        const currentTokenParts = generatedInviteToken.split('_');
                        const parentToken = currentTokenParts.length > 2 ? currentTokenParts.slice(2).join('_') : currentUserToken;
                        const newToken = `tl_${randomPart}_${parentToken}`;

                        const existingUser = accountUsers.find(u => u.token === generatedInviteToken);
                        if (existingUser) {
                          setAccountUsers(accountUsers.map(u =>
                            u.token === generatedInviteToken ? { ...u, token: newToken } : u
                          ));
                        }

                        setGeneratedInviteToken(newToken);
                      }
                    }}
                    className="p-3 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                    title="Обновить токен"
                  >
                    <RefreshCw className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedInviteToken)}
                    className="p-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    title="Копировать"
                  >
                    <Copy className="w-5 h-5 text-white" />
                  </button>
                </div>
                <p className="text-slate-400 text-xs mt-2">{t.tokenUsageDescription}</p>
              </div>

              <button
                onClick={() => setShowInviteTokenModal(false)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {t.ready}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tokens Modal */}
      {showAddTokensModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Начислить токены</h2>
              <button
                onClick={() => {
                  setShowAddTokensModal(false);
                  setTokensToAdd('');
                }}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">{t.user}</label>
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center text-white">
                    👤
                  </div>
                  <div>
                    <div className="text-white font-medium">{selectedUser.nickname || selectedUser.name}</div>
                    <div className="text-slate-400 text-xs">{selectedUser.token}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Количество токенов</label>
                <input
                  type="number"
                  value={tokensToAdd}
                  onChange={(e) => setTokensToAdd(e.target.value)}
                  placeholder={t.enterTokensQuantity}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400"
                />
                <p className="text-slate-400 text-xs mt-2">Текущий баланс: {selectedUser.tokensAdded || 0} токенов</p>
              </div>

              <button
                onClick={() => {
                  const tokensAmount = parseInt(tokensToAdd);
                  if (tokensAmount > 0) {
                    setAccountUsers(accountUsers.map(u =>
                      u.id === selectedUser.id
                        ? { ...u, tokensAdded: (u.tokensAdded || 0) + tokensAmount }
                        : u
                    ));

                    if (selectedUser.token === currentUserToken) {
                      setTokenBalance(tokenBalance + tokensAmount);
                    } else if (selectedUser.role === 'team-leader') {
                      const currentUser = accountUsers.find(u => u.token === currentUserToken);
                      if (currentUser && currentUser.parentToken === selectedUser.token) {
                        setTokenBalance(tokenBalance + tokensAmount);
                      }
                    } else {
                      const currentUser = accountUsers.find(u => u.token === currentUserToken);
                      if (currentUser && currentUser.parentToken === selectedUser.parentToken) {
                        setTokenBalance(tokenBalance + tokensAmount);
                      }
                    }
                  }
                  setShowAddTokensModal(false);
                  setTokensToAdd('');
                }}
                disabled={!tokensToAdd || parseInt(tokensToAdd) <= 0}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Начислить токены
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Created Success Modal */}
      {showOrderCreatedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-green-500/10 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">{t.thankYouForOrder}</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="text-slate-300 text-center space-y-3">
                <p className="text-lg">{t.orderInProgress}.</p>
                <p className="text-sm text-slate-400">{t.whenReady}, {t.youWillBeNotified}.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Sent Success Modal */}
      {showOrderSentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-green-500/10 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">{t.orderSentSuccessfully}</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="text-slate-300 text-center space-y-3">
                <p className="text-lg">{t.orderSentToUser}</p>
                <p className="text-sm text-slate-400">{t.userNotifiedInCRM}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Tokens Modal */}
      {showInsufficientTokensModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-slate-700/50 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Недостаточно токенов</h2>
              <button
                onClick={() => setShowInsufficientTokensModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="text-red-400 text-sm">
                  Для создания заказа не хватает токенов. Пожалуйста, пополните баланс минимум на 500 токенов.
                </div>
              </div>

              <button
                onClick={() => {
                  setShowInsufficientTokensModal(false);
                  setShowWalletModal(true);
                  setWalletTab('purchase');
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {t.topUpBalance}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Users Modal */}
      {showDiscountUsersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">{t.usersWithDiscount}</h2>
              </div>
              <button
                onClick={() => setShowDiscountUsersModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {getUsersWithDiscount().length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Нет пользователей со скидкой</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getUsersWithDiscount().map((user) => {
                    const discount = getUserDiscount(user);
                    return (
                      <div
                        key={user.id}
                        className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${discount === 10 ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-green-500 to-emerald-500'} rounded-lg flex items-center justify-center`}>
                              <span className="text-white font-bold text-lg">{discount}%</span>
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{user.name}</h3>
                              <p className="text-slate-400 text-sm">{user.nickname}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-bold text-lg">${user.tokensAdded || 0}</p>
                            <p className="text-slate-400 text-xs">{t.depositsAdded}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-600/50">
                          <div className="text-sm">
                            <p className="text-slate-400 mb-1">Токен</p>
                            <div className="flex items-center gap-2">
                              <p className="text-slate-300 font-mono text-xs">{user.token}</p>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(user.token);
                                }}
                                className="text-slate-400 hover:text-white transition-colors p-1"
                                title="Скопировать токен"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-700/50 border-t border-slate-600/50">
              <button
                onClick={() => setShowDiscountUsersModal(false)}
                className="w-full bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;