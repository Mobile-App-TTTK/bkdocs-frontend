import { setLogoutHandler, triggerLogout } from '@/utils/authEvents';

describe('authEvents', () => {
  afterEach(() => {
    setLogoutHandler(async () => {});
  });

  describe('setLogoutHandler', () => {
    it('should accept a function as handler', () => {
      const mockHandler = jest.fn().mockResolvedValue(undefined);
      
      expect(() => setLogoutHandler(mockHandler)).not.toThrow();
    });

    it('should be able to update handler multiple times', () => {
      const handler1 = jest.fn().mockResolvedValue(undefined);
      const handler2 = jest.fn().mockResolvedValue(undefined);
      
      setLogoutHandler(handler1);
      setLogoutHandler(handler2);
      
      expect(() => setLogoutHandler(handler2)).not.toThrow();
    });
  });

  describe('triggerLogout', () => {
    it('should call the logout handler when set', async () => {
      const mockHandler = jest.fn().mockResolvedValue(undefined);
      setLogoutHandler(mockHandler);
      
      await triggerLogout();
      
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should call handler with no arguments', async () => {
      const mockHandler = jest.fn().mockResolvedValue(undefined);
      setLogoutHandler(mockHandler);
      
      await triggerLogout();
      
      expect(mockHandler).toHaveBeenCalledWith();
    });

    it('should await async handler completion', async () => {
      let completed = false;
      const asyncHandler = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        completed = true;
      });
      
      setLogoutHandler(asyncHandler);
      await triggerLogout();
      
      expect(completed).toBe(true);
    });

    it('should use the most recently set handler', async () => {
      const handler1 = jest.fn().mockResolvedValue(undefined);
      const handler2 = jest.fn().mockResolvedValue(undefined);
      
      setLogoutHandler(handler1);
      setLogoutHandler(handler2);
      
      await triggerLogout();
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should not throw when called multiple times', async () => {
      const mockHandler = jest.fn().mockResolvedValue(undefined);
      setLogoutHandler(mockHandler);
      
      await triggerLogout();
      await triggerLogout();
      await triggerLogout();
      
      expect(mockHandler).toHaveBeenCalledTimes(3);
    });

    it('should handle handler that throws error', async () => {
      const errorHandler = jest.fn().mockRejectedValue(new Error('Logout failed'));
      setLogoutHandler(errorHandler);
      
      await expect(triggerLogout()).rejects.toThrow('Logout failed');
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should work with real-world logout flow', async () => {
      const logoutActions: string[] = [];
      
      const realWorldHandler = jest.fn().mockImplementation(async () => {
        logoutActions.push('clear_token');
        logoutActions.push('clear_user_data');
        logoutActions.push('redirect_to_login');
      });
      
      setLogoutHandler(realWorldHandler);
      await triggerLogout();
      
      expect(logoutActions).toEqual([
        'clear_token',
        'clear_user_data',
        'redirect_to_login'
      ]);
    });
  });
});

