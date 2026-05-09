import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API_ENDPOINTS from '~/app/config';
import {
  apiCallDelete,
  apiCallGet,
  apiCallPatch,
  apiCallPost,
} from '~/shared/services/apiCallService';

export interface Topic {
  _id: string;
  user_id?: string;
  topic_name: string;
  topic_no: number;
}

interface TopicState {
  items: Topic[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TopicState = {
  items: [],
  status: 'idle',
  error: null,
};

const LINK = API_ENDPOINTS.TOPIC;

/* ─────────────────────── Thunks ─────────────────────── */

export const fetchTopics = createAsyncThunk<Topic[]>('topics/fetchAll', async () => {
  const data = await apiCallGet<Topic[]>(LINK);
  return [...(data ?? [])].sort((a, b) => a.topic_no - b.topic_no);
});

export const createTopic = createAsyncThunk<Topic, { topic_name: string; topic_no: number }>(
  'topics/create',
  async (values) => apiCallPost<Topic>(LINK, values),
);

export const updateTopic = createAsyncThunk<Topic, Partial<Topic> & { _id: string }>(
  'topics/update',
  async (values) => apiCallPatch<Topic>(LINK, values),
);

export const deleteTopic = createAsyncThunk<string, string>(
  'topics/delete',
  async (_id) => {
    await apiCallDelete(LINK, { _id });
    return _id;
  },
);

export const reorderTopics = createAsyncThunk<Topic[], Topic[]>(
  'topics/reorder',
  async (orderedItems) => {
    await Promise.all(
      orderedItems.map((t, index) =>
        apiCallPatch(LINK, { _id: t._id, topic_no: index + 1, topic_name: t.topic_name }),
      ),
    );
    return orderedItems.map((t, i) => ({ ...t, topic_no: i + 1 }));
  },
);

/* ─────────────────────── Slice ─────────────────────── */

const topicSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {
    /** Hoán đổi vị trí ở local — chưa persist. Component nên gọi reorderTopics để lưu. */
    moveTopicLocal(state, action: PayloadAction<{ from: number; to: number }>) {
      const { from, to } = action.payload;
      if (to < 0 || to >= state.items.length) return;
      const arr = state.items;
      [arr[from], arr[to]] = [arr[to], arr[from]];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopics.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? null;
      })
      .addCase(createTopic.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateTopic.fulfilled, (state, action) => {
        const updated = action.payload;
        state.items = state.items.map((t) => (t._id === updated._id ? { ...t, ...updated } : t));
      })
      .addCase(deleteTopic.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
      })
      .addCase(reorderTopics.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { moveTopicLocal } = topicSlice.actions;
export default topicSlice.reducer;
