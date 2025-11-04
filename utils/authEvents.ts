let logoutHandler: (() => Promise<void>) | null = null;

export const setLogoutHandler = (handler: () => Promise<void>) => {
  logoutHandler = handler;
};

export const triggerLogout = async () => {
  if (logoutHandler) {
    await logoutHandler();
  }
};


