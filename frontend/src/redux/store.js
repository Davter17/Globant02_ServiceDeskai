import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    // Aquí se agregarán más reducers en los siguientes pasos:
    // reports: reportReducer,
    // users: userReducer,
    // etc.
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
