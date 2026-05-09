import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API_ENDPOINTS from '~/app/config';
import { ClassFormData } from '~/features/class/pages/ManageClass';
import {
  apiCallDelete,
  apiCallGet,
  apiCallPatch,
  apiCallPost,
} from '~/shared/services/apiCallService';

export interface ClassState {
  allClass: ClassFormData[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const LINK = API_ENDPOINTS.CLASSES;

/* ─────────────────────── Thunks ─────────────────────── */

export const fetchClasses = createAsyncThunk<ClassFormData[]>(
  'classes/fetchClasses',
  async () => {
    const response = await apiCallGet<ClassFormData[]>(LINK);
    return response ?? [];
  },
);

export const deleteClass = createAsyncThunk<string, { _id: string }>(
  'classes/deleteClass',
  async ({ _id }) => {
    await apiCallDelete(LINK, { _id });
    return _id;
  },
);

export const saveClass = createAsyncThunk<ClassFormData, { values: Partial<ClassFormData> }>(
  'classes/saveClass',
  async ({ values }) => apiCallPatch<ClassFormData>(LINK, values),
);

export const createClass = createAsyncThunk<ClassFormData, { values: Partial<ClassFormData> }>(
  'classes/createClass',
  async ({ values }) => apiCallPost<ClassFormData>(LINK, values),
);

export const createCode = async (values: any): Promise<any> => {
  return apiCallPost(`${LINK}/code-class`, values);
};

/* ─────────────────────── Slice ─────────────────────── */

const initialState: ClassState = {
  allClass: [],
  status: 'idle',
  error: null,
};

const classSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchClasses.fulfilled, (state, action: PayloadAction<ClassFormData[]>) => {
        state.status = 'succeeded';
        state.allClass = action.payload ?? [];
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch classes';
      })
      .addCase(createClass.fulfilled, (state, action: PayloadAction<ClassFormData>) => {
        state.allClass.push(action.payload);
      })
      .addCase(deleteClass.fulfilled, (state, action: PayloadAction<string>) => {
        state.allClass = state.allClass.filter((cls) => cls._id !== action.payload);
      })
      .addCase(saveClass.fulfilled, (state, action: PayloadAction<ClassFormData>) => {
        const updated = action.payload;
        state.allClass = state.allClass.map((cls) => (cls._id === updated._id ? updated : cls));
      });
  },
});

export default classSlice.reducer;
