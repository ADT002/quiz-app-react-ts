import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API_ENDPOINTS from '~/app/config';
import {
  apiCallDelete,
  apiCallGet,
  apiCallPatch,
  apiCallPost,
} from '~/shared/services/apiCallService';
import { TestFormData } from '~/features/test/pages/ManageTestModal';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

interface TestState {
  allTestTemplates: TestFormData[];
  allTestOfClass: TestFormData[];
  templateStatus: Status;
  testOfClassStatus: Status;
  error: string | null;
}

interface ResetTestData {
  class_id: string;
  test_id: string;
}

export interface CreateTestOfClassPayload extends TestFormData {
  class_id: string;
}

/* ─────────────────────── Test Templates ─────────────────────── */

export const fetchTestTemplates = createAsyncThunk<TestFormData[]>(
  'tests/fetchTestTemplates',
  async () => {
    const response = await apiCallGet<TestFormData[]>(API_ENDPOINTS.TESTS);
    return Array.isArray(response) ? response : [];
  },
);

export const createTest = createAsyncThunk<TestFormData, { values: TestFormData }>(
  'tests/createTest',
  async ({ values }) => apiCallPost<TestFormData>(API_ENDPOINTS.TESTS, values),
);

export const saveTest = createAsyncThunk<TestFormData, { values: TestFormData }>(
  'tests/saveTest',
  async ({ values }) => apiCallPatch<TestFormData>(API_ENDPOINTS.TESTS, values),
);

export const deleteTest = createAsyncThunk<{ success: boolean }, { _id: string }>(
  'tests/deleteTest',
  async ({ _id }) => apiCallDelete(API_ENDPOINTS.TESTS, { _id }),
);

/* ─────────────────────── Test of Class ─────────────────────── */

export const fetchTestOfClass = createAsyncThunk<TestFormData[], { class_id: string }>(
  'tests/fetchTestOfClass',
  async ({ class_id }) => {
    const response = await apiCallGet<TestFormData[]>(
      `${API_ENDPOINTS.TEST_OF_CLASS}?class_id=${class_id}`,
    );
    return Array.isArray(response) ? response : [];
  },
);

export const createTestOfClass = createAsyncThunk<
  TestFormData,
  { values: CreateTestOfClassPayload }
>('tests/createTestOfClass', async ({ values }, { rejectWithValue }) => {
  const res = await apiCallPost<{ _id: string; test: TestFormData }>(
    API_ENDPOINTS.TEST_OF_CLASS,
    values,
  );
  if (res?.test) {
    return { ...res.test, _id: res._id ?? res.test._id };
  }
  return rejectWithValue('Unexpected response from server') as never;
});

export const saveTestOfClass = createAsyncThunk<TestFormData, { values: CreateTestOfClassPayload }>(
  'tests/saveTestOfClass',
  async ({ values }) => apiCallPatch<TestFormData>(API_ENDPOINTS.TEST_OF_CLASS, values),
);

export const deleteTestOfClass = createAsyncThunk<string, { _id: string }>(
  'tests/deleteTestOfClass',
  async ({ _id }) => {
    await apiCallDelete(API_ENDPOINTS.TEST_OF_CLASS, { _id });
    return _id;
  },
);

export const resetTest = createAsyncThunk<ResetTestData, { values: ResetTestData }>(
  'tests/resetTest',
  async ({ values }) => apiCallPost<ResetTestData>(API_ENDPOINTS.RESET_TEST, values),
);

/* ─────────────────────── Slice ─────────────────────── */

const initialState: TestState = {
  allTestTemplates: [],
  allTestOfClass: [],
  templateStatus: 'idle',
  testOfClassStatus: 'idle',
  error: null,
};

const testSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    clearTestOfClass(state) {
      state.allTestOfClass = [];
      state.testOfClassStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestTemplates.pending, (state) => {
        state.templateStatus = 'loading';
      })
      .addCase(fetchTestTemplates.fulfilled, (state, action: PayloadAction<TestFormData[]>) => {
        state.templateStatus = 'succeeded';
        state.allTestTemplates = action.payload ?? [];
      })
      .addCase(fetchTestTemplates.rejected, (state, action) => {
        state.templateStatus = 'failed';
        state.error = action.error.message ?? null;
      })
      .addCase(createTest.fulfilled, (state, action: PayloadAction<TestFormData>) => {
        state.allTestTemplates.push(action.payload);
      })
      .addCase(saveTest.fulfilled, (state, action: PayloadAction<TestFormData>) => {
        const { _id } = action.payload;
        state.allTestTemplates = state.allTestTemplates.map((t) =>
          t._id === _id ? action.payload : t,
        );
      })
      .addCase(deleteTest.fulfilled, (state, action) => {
        const { _id } = action.meta.arg;
        state.allTestTemplates = state.allTestTemplates.filter((t) => t._id !== _id);
      })
      .addCase(fetchTestOfClass.pending, (state) => {
        state.testOfClassStatus = 'loading';
      })
      .addCase(fetchTestOfClass.fulfilled, (state, action: PayloadAction<TestFormData[]>) => {
        state.testOfClassStatus = 'succeeded';
        state.allTestOfClass = action.payload ?? [];
      })
      .addCase(fetchTestOfClass.rejected, (state, action) => {
        state.testOfClassStatus = 'failed';
        state.error = action.error.message ?? null;
      })
      .addCase(createTestOfClass.fulfilled, (state, action: PayloadAction<TestFormData>) => {
        state.allTestOfClass.push(action.payload);
      })
      .addCase(saveTestOfClass.fulfilled, (state, action: PayloadAction<TestFormData>) => {
        const { _id } = action.payload;
        state.allTestOfClass = state.allTestOfClass.map((t) =>
          t._id === _id ? action.payload : t,
        );
      })
      .addCase(deleteTestOfClass.fulfilled, (state, action: PayloadAction<string>) => {
        state.allTestOfClass = state.allTestOfClass.filter((t) => t._id !== action.payload);
      });
  },
});

export const { clearTestOfClass } = testSlice.actions;
export default testSlice.reducer;
