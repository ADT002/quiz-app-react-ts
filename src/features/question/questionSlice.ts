import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiCallGet, apiCallPost, apiCallPatch, apiCallDelete } from '~/shared/services/apiCallService';
import API_ENDPOINTS from '~/app/config';
import { NavigateFunction } from 'react-router-dom';
import { Question } from '~/shared/types/question';

const LINK = API_ENDPOINTS.QUESTIONS;

interface QuestionState {
    questionsByPage: Record<number, Question[]>;
    statusQuestion: 'idle' | 'loading' | 'succeeded' | 'failed';
    page: number;
    limit: number;
    hasMoreQuestions: boolean;
    errorQuestion: string | null;
}

const initialState: QuestionState = {
    questionsByPage: {},
    statusQuestion: 'idle',
    page: 1,
    limit: 10,
    hasMoreQuestions: true,
    errorQuestion: null,
};

export const fetchQuestions = createAsyncThunk<
    { data: Question[] },
    { navigate: NavigateFunction },
    { state: { questions: QuestionState }; rejectValue: string }
>(
    'questions/fetchQuestions',
    async ({ navigate }, { getState, rejectWithValue }) => {
        const { questionsByPage, page, limit } = getState().questions;
        if (questionsByPage[page]) {
            // ⛔ KHÔNG dispatch fulfilled
            return { data: questionsByPage[page] };
        }

        try {
            const endpoint = `${LINK}?page=${page}&limit=${limit}`;
            const response = await apiCallGet<Question[]>(
                endpoint,
                navigate);
            console.log(response)
            return { data: response };
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Failed to fetch questions');
        }
    },
);


export const createQuestion = createAsyncThunk<Question, Question, { rejectValue: string }>(
    'questions/addQuestion',
    async (newQuestion, { rejectWithValue }) => {
        try {
            newQuestion.created_at = new Date().toISOString();
            newQuestion.updated_at = new Date().toISOString();
            const response = await apiCallPost<Question>(LINK, newQuestion);
            newQuestion._id = response._id
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Failed to create question');
        }
    },
);

export const updateQuestion = createAsyncThunk<Question, Question, { rejectValue: string }>(
    'questions/updateQuestion',
    async (updatedQuestion, { rejectWithValue }) => {
        try {
            updatedQuestion.updated_at = new Date().toISOString();
            const response = await apiCallPatch<Question>(LINK, updatedQuestion);
            console.log(response)
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Failed to update question');
        }
    },
);

export const deleteQuestion = createAsyncThunk<string, string, { rejectValue: string }>(
    'questions/deleteQuestion',
    async (questionId, { rejectWithValue }) => {
        try {
            await apiCallDelete(LINK, { id: questionId });
            return questionId;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Failed to delete question');
        }
    },
);



const questionSlice = createSlice({
    name: 'questions',
    initialState,
    reducers: {
        resetQuestions: (state) => {
            state.questionsByPage = {};
            state.page = 1; // khớp với initialState
            state.hasMoreQuestions = true;
            state.statusQuestion = 'idle';
            state.errorQuestion = null;
            // localStorage.removeItem phải gọi từ middleware/thunk, không từ reducer
        },
        incrementPage: (state) => {
            if (state.hasMoreQuestions) {
                state.page += 1;
            }
        },
        setHasMoreQuestions: (state, action: PayloadAction<boolean>) => {
            state.hasMoreQuestions = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuestions.pending, (state) => {
                state.statusQuestion = 'loading';
            })
            .addCase(fetchQuestions.fulfilled, (state, action) => {
                state.statusQuestion = 'succeeded';
                const currentPage = state.page;
                const newQuestions = action.payload.data;
                console.log(newQuestions)
                if (!newQuestions || newQuestions.length === 0) {
                    state.hasMoreQuestions = false;
                } else {
                    state.questionsByPage[currentPage] = newQuestions;
                }
            })
            .addCase(fetchQuestions.rejected, (state, action) => {
                state.statusQuestion = 'failed';
                state.errorQuestion = action.payload || action.error?.message || null;
            })
            .addCase(createQuestion.fulfilled, (state, action) => {
                if (state.questionsByPage[0]) {
                    state.questionsByPage[0].unshift(action.payload);
                } else {
                    state.questionsByPage[0] = [action.payload];
                }
            })
            .addCase(updateQuestion.fulfilled, (state, action) => {
                Object.keys(state.questionsByPage).forEach((pageKey) => {
                    const page = Number(pageKey);
                    state.questionsByPage[page] = state.questionsByPage[page].map((question) =>
                        question._id === action.payload._id ? action.payload : question,
                    );
                });
            })
            .addCase(deleteQuestion.fulfilled, (state, action) => {
                Object.keys(state.questionsByPage).forEach((pageKey) => {
                    const page = Number(pageKey);
                    state.questionsByPage[page] = state.questionsByPage[page].filter(
                        (question) => question._id !== action.payload,
                    );
                });
            })
            .addMatcher(
                (action) =>
                    ['createQuestion', 'updateQuestion', 'deleteQuestion'].some((type) =>
                        action.type.endsWith(`${type}/rejected`),
                    ),
                (state, action: any) => {
                    state.statusQuestion = 'failed';
                    state.errorQuestion = action.payload || action.error?.message || null;
                },
            );
    },
});

export const { resetQuestions, incrementPage, setHasMoreQuestions } = questionSlice.actions;
export default questionSlice.reducer;
