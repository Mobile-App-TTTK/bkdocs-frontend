export const ROUTES = {
  HOME: '/(app)/(tabs)/home',
  LOGIN: '/(public)/login',
  ONBOARD: '/(public)/onboard'
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];


