export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    register: "/auth/register",
    me: "/auth/me",
    onboarding: "/auth/onboarding",
  },
  users: {
    getAll: "/users",
    getById: "/users/{id}",
    update: "/users/{id}",
    delete: "/users/{id}",
  },
  tenants: {
    create: "/tenants",
    getAll: "/tenants",
    update: "/tenants/{id}",
    delete: "/tenants/{id}",
  },
  platforms: {
    roles: {
      create: "/platform/roles",
      getAll: "/platform/roles",
      update: "/platform/roles/{id}",
      delete: "/platform/roles/{id}",
    },
    modules: {
      create: "/platform/modules",
      getAll: "/platform/modules",
      update: "/platform/modules/{id}",
      delete: "/platform/modules/{id}",
    },
    menus: {
      create: "/platform/menus",
      getAll: "/platform/menus",
      update: "/platform/menus/{id}",
      delete: "/platform/menus/{id}",
    },
    responsibilities: {
      get: "/platform/responsibilities",
      update: "/platform/responsibilities",
    },
  },
  formSchemas: {
    getFormSchemaByKey: "/form-schemas",
  },
  lovs: {
    getLovs: "/lovs",
    createLov: "/lovs",
    updateLov: "/lovs/{id}",
    deleteLov: "/lovs/{id}",
  },
  masterData: {
    getActiveUsers: "/master-data/users",
    getActiveTenants: "/master-data/tenants",
    getActiveRoles: "/master-data/roles",
    getActiveTimezones: "/master-data/timezones",
    getActiveModules: "/master-data/modules",
    getActiveMenus: "/master-data/menus",
  },
} as const;
