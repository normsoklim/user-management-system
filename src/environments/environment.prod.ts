export const environment = {
  production: true,
  apiUrl: 'http://localhost:5000/api',
  appName: 'User Management System',
  appVersion: '1.0.0',
  debug: false,
  enableLogging: false,
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'current_user',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'es', 'fr', 'de'],
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100]
  },
  session: {
    timeoutMinutes: 30,
    warningMinutes: 5
  },
  features: {
    enableAuditLog: true,
    enableRoleManagement: true,
    enableUserExport: true,
    enableBulkOperations: true,
    enableTwoFactorAuth: true
  },
  ui: {
    theme: 'light',
    sidebarCollapsed: false,
    showNotifications: true,
    autoRefreshInterval: 60000 // 60 seconds
  }
};