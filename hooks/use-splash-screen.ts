import { useEffect, useState } from 'react';

export function useSplashScreen(initialDelay: number = 3000) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [initialDelay]);

  const finishLoading = () => {
    setIsLoading(false);
  };

  return {
    isLoading,
    finishLoading,
  };
}
