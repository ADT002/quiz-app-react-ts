import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API_ENDPOINTS from '~/app/config';
import { apiCallDelete, apiCallGet, apiCallPatch, apiCallPost } from '~/shared/services/apiCallService';
import { NavigateFunction } from 'react-router-dom';
import { TestFormData } from '~/features/test/pages/ManageTestModal';

// --------- Type Definitions ---------
interface TestState {
  allTestTemplates: TestFormData[];
  allTestOfClass: TestFormData[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface FetchTemplatesParams {
  navigate: NavigateFunction;
}

interface FetchTestOfClassParams {
  class_id: string;
  navigate: NavigateFunction;
}

interface DeleteTestParams {
  _id: string;
  navigate: NavigateFunction;
}

interface ResetTestData {
  class_id: string;
  test_id: string;
}

interface ResetTestParams {
  values: ResetTestData;
  navigate: NavigateFunction;
}

interface SaveTestParams {
  values: TestFormData;
  navigate: NavigateFunction;
}

interface CreateTestParams {
  values: TestFormData;
  navigate: NavigateFunction;
}

export interface CreateTestOfClassPayload extends TestFormData {
  class_id: string;
}

interface CreateTestOfClassParams {
  values: CreateTestOfClassPayload;
  navigate: NavigateFunction;
}

// --------- Async Thunks: TestTemplate ---------

export const fetchTestTemplates = createAsyncThunk<TestFormData[], FetchTemplatesParams>(
  'tests/fetchTestTemplates',
  async ({ navigate }) => {
    const response = await apiCallGet(API_ENDPOINTS.TESTS, null, navigate);
    return Array.isArray(response) ? response : [];
  },
);

export const createTest = createAsyncThunk<TestFormData, CreateTestParams>(
  'tests/createTest',
  async ({ values, navigate }) => {
    return apiCallPost(API_ENDPOINTS.TESTS, values, navigate);
  },
);

export const saveTest = createAsyncThunk<TestFormData, SaveTestParams>(
  'tests/saveTest',
  async ({ values, navigate }) => {
    return apiCallPatch(API_ENDPOINTS.TESTS, values, navigate);
  },
);

export const deleteTest = createAsyncThunk<{ success: boolean }, DeleteTestParams>(
  'tests/deleteTest',
  async ({ _id, navigate }) => {
    return apiCallDelete(API_ENDPOINTS.TESTS, { _id }, navigate);
  },
);

// --------- Async Thunks: TestOfClass ---------

export const fetchTestOfClass = createAsyncThunk<TestFormData[], FetchTestOfClassParams>(
  'tests/fetchTestOfClass',
  async ({ class_id, navigate }) => {
    const response = await apiCallGet(
      `${API_ENDPOINTS.TEST_OF_CLASS}?class_id=${class_id}`,
      null,
      navigate,
    );
    return Array.isArray(response) ? response : [];
  },
);

export const createTestOfClass = createAsyncThunk<TestFormData, CreateTestOfClassParams>(
  'tests/createTestOfClass',
  async ({ values, navigate }, { rejectWithValue }) => {
    const res = await apiCallPost<{ _id: string; test: TestFormData }>(
      API_ENDPOINTS.TEST_OF_CLASS,
      values,
      navigate,
    );
    if (res?.test) {
      return { ...res.test, _id: res._id ?? res.test._id };
    }
    return rejectWithValue('Unexpected response from server') as never;
  },
);

export const saveTestOfClass = createAsyncThunk<TestFormData, CreateTestOfClassParams>(
  'tests/saveTestOfClass',
  async ({ values, navigate }) => {
    return apiCallPatch(API_ENDPOINTS.TEST_OF_CLASS, values, navigate);
  },
);

export const deleteTestOfClass = createAsyncThunk<string, DeleteTestParams>(
  'tests/deleteTestOfClass',
  async ({ _id, navigate }) => {
    await apiCallDelete(API_ENDPOINTS.TEST_OF_CLASS, { _id }, navigate);
    return _id;
  },
);

export const resetTest = createAsyncThunk<ResetTestData, ResetTestParams>(
  'tests/resetTest',
  async ({ values, navigate }) => {
    return apiCallPost(API_ENDPOINTS.RESET_TEST, values, navigate);
  },
);

// --------- Slice ---------
const initialState: TestState = {
  allTestTemplates: [],
  allTestOfClass: [],
  status: 'idle',
  error: null,
};

const testSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    clearTestOfClass(state) {
      state.allTestOfClass = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTestTemplates
      .addCase(fetchTestTemplates.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchTestTemplates.fulfilled, (state, action: PayloadAction<TestFormData[]>) => {
        state.status = 'succeeded';
        state.allTestTemplates = action.payload ?? [];
      })
      .addCase(fetchTestTemplates.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? null;
      })

      // createTest (template)
      .addCase(createTest.fulfilled, (state, action: PayloadAction<TestFormData>) => {
        state.allTestTemplates.push(action.payload);
      })

      // saveTest (template)
      .addCase(saveTest.fulfilled, (state, action: PayloadAction<TestFormData>) => {
        const { _id } = action.payload;
        state.allTestTemplates = state.allTestTemplates.map((t) =>
          t._id === _id ? action.payload : t,
        );
      })

      // deleteTest (template)
      .addCase(deleteTest.fulfilled, (state, action) => {
        const { _id } = action.meta.arg;
        state.allTestTemplates = state.allTestTemplates.filter((t) => t._id !== _id);
      })

      // fetchTestOfClass
      .addCase(fetchTestOfClass.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchTestOfClass.fulfilled, (state, action: PayloadAction<TestFormData[]>) => {
        state.status = 'succeeded';
        state.allTestOfClass = action.payload ?? [];
      })
      .addCase(fetchTestOfClass.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? null;
      })

      // createTestOfClass
      .addCase(createTestOfClass.fulfilled, (state, action: PayloadAction<TestFormData>) => {
        state.allTestOfClass.push(action.payload);
      })

      // saveTestOfClass
      .addCase(saveTestOfClass.fulfilled, (state, action: PayloadAction<TestFormData>) => {
        const { _id } = action.payload;
        state.allTestOfClass = state.allTestOfClass.map((t) =>
          t._id === _id ? action.payload : t,
        );
      })

      // deleteTestOfClass
      .addCase(deleteTestOfClass.fulfilled, (state, action: PayloadAction<string>) => {
        state.allTestOfClass = state.allTestOfClass.filter((t) => t._id !== action.payload);
      });
  },
});

export const { clearTestOfClass } = testSlice.actions;
export default testSlice.reducer;
