let logoutHandler: (() => Promise<void>) | null = null;

// Flag to track if app is in initial loading state (checking stored token)
// When true, 401 errors should not show "session expired" alert
export let isInitializing = true;

export const setInitializing = (value: boolean) => {
  isInitializing = value;
};

export const setLogoutHandler = (handler: () => Promise<void>) => {
  logoutHandler = handler;
};

export const triggerLogout = async () => {
  if (logoutHandler) {
    await logoutHandler();
  }
};


