import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import classReducer from '~/features/class/classSlice';
import testReducer from '~/features/test/testSlice';
import questionReducer from '~/features/question/questionSlice';

const questionPersistConfig = {
  key: 'questions',
  storage,
};

const persistedQuestionReducer = persistReducer(questionPersistConfig, questionReducer);

export const store = configureStore({
  reducer: {
    classes: classReducer,
    tests: testReducer,
    questions: persistedQuestionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
