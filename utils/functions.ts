export const getBackgroundById = (id: string) => {
  if (!id) return require('@/assets/images/background/bg1.png');

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0; 
  }

  const normalizedId = ((Math.abs(hash) - 1) % 4) + 1;

  const backgrounds: Record<number, any> = {
    1: require('@/assets/images/background/bg1.png'),
    2: require('@/assets/images/background/bg2.png'),
    3: require('@/assets/images/background/bg3.png'),
    4: require('@/assets/images/background/bg4.png'),
  };

  return backgrounds[normalizedId];
};

export const getDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};