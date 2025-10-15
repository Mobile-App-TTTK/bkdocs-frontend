export const getBackgroundById = (id: number) => {
  const normalizedId = ((Math.abs(id) - 1) % 4) + 1;

  const backgrounds: { [key: number]: any } = {
    1: require('@/assets/images/background/bg1.png'),
    2: require('@/assets/images/background/bg2.png'),
    3: require('@/assets/images/background/bg3.png'),
    4: require('@/assets/images/background/bg4.png'),
  };

  return backgrounds[normalizedId];
};