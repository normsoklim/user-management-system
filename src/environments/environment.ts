
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000/api/v1',
  appName: 'User Management System',
  appVersion: '1.0.0',
  debug: true,
  enableLogging: true,
  tokenKey: '21ddb114690e5ef4cf36f3204dc6ff06c75720099acb53699baba7d887a944e574a64fa4ff3ebdb99f741ffbac1b642c55c96642e78900eceef094435679cdbd',
  refreshTokenKey: '21ddb114690e5ef4cf36f3204dc6ff06c75720099acb53699baba7d887a944e574a64fa4ff3ebdb99f741ffbac1b642c55c96642e7400eceef094435679cdcd',
  userKey: '21ddb114690e5ef4cf36f3204dc6ff06c75720099acb53699baba7d887a944e574a64fa4ff3ebdb99f741ffbac1b642c55c96642e7400eceef094435679cdcd',
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
    enableTwoFactorAuth: false
  },
  ui: {
    theme: 'light',
    sidebarCollapsed: false,
    showNotifications: true,
    autoRefreshInterval: 30000 // 30 seconds
  }
};

/*
 * For easier debugging in development mode, you can import
 * the following file to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.