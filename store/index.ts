import { configureStore } from '@reduxjs/toolkit';
import uploadReducer from './uploadSlice';

export const store = configureStore({
  reducer: {
    upload: uploadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
