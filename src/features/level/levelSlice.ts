import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API_ENDPOINTS from '~/app/config';
import {
  apiCallDelete,
  apiCallGet,
  apiCallPatch,
  apiCallPost,
} from '~/shared/services/apiCallService';

export interface Level {
  _id: string;
  user_id?: string;
  level_name: string;
}

interface LevelState {
  items: Level[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LevelState = {
  items: [],
  status: 'idle',
  error: null,
};

const LINK = API_ENDPOINTS.LEVEL;

/* ─────────────────────── Thunks ─────────────────────── */

export const fetchLevels = createAsyncThunk<Level[]>('levels/fetchAll', async () => {
  const data = await apiCallGet<Level[]>(LINK);
  return data ?? [];
});

export const createLevel = createAsyncThunk<Level, { level_name: string }>(
  'levels/create',
  async (values) => apiCallPost<Level>(LINK, values),
);

export const updateLevel = createAsyncThunk<Level, { _id: string; level_name: string }>(
  'levels/update',
  async (values) => apiCallPatch<Level>(LINK, { id: values._id, level_name: values.level_name }),
);

export const deleteLevel = createAsyncThunk<string, string>(
  'levels/delete',
  async (_id) => {
    await apiCallDelete(LINK, { _id });
    return _id;
  },
);

/* ─────────────────────── Slice ─────────────────────── */

const levelSlice = createSlice({
  name: 'levels',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLevels.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLevels.fulfilled, (state, action: PayloadAction<Level[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchLevels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? null;
      })
      .addCase(createLevel.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateLevel.fulfilled, (state, action) => {
        state.items = state.items.map((l) =>
          l._id === action.payload._id ? action.payload : l,
        );
      })
      .addCase(deleteLevel.fulfilled, (state, action) => {
        state.items = state.items.filter((l) => l._id !== action.payload);
      });
  },
});

export default levelSlice.reducer;
