# CLAUDE.md — Quiz App React TS

> Tài liệu chuẩn cho dự án **Nền tảng thi trắc nghiệm trực tuyến**.
> Dành cho: Claude Code, Cursor AI, GPT agents, và developer mới onboarding.
> **Cập nhật:** 2026-05-06

---

## 1. Tổng quan dự án

Nền tảng thi trắc nghiệm online phục vụ 3 vai trò:

- **Học sinh (Student):** vào lớp, làm bài thi/ôn tập, xem kết quả.
- **Giáo viên (Teacher):** tạo lớp, soạn câu hỏi, ra đề, theo dõi kết quả.
- **Quản trị (Admin):** quản lý người dùng, lớp, dữ liệu hệ thống.

**Module chính:**

| Module | Trách nhiệm |
|---|---|
| `auth` | Đăng nhập email/password, Google OAuth, refresh token |
| `dashboard` | Tổng quan cho từng vai trò |
| `classes` | CRUD lớp, invite code, duyệt học sinh |
| `quiz` (test) | Quản lý template + bài thi của lớp |
| `exam` (do-test) | Làm bài thi thật — countdown, submit, lock thiết bị |
| `practice` | Ôn tập — không countdown, hiển thị đáp án |
| `question-bank` | CRUD 5 loại câu hỏi (single/multiple/fill/order/match) |
| `analytics` | Kết quả, thống kê điểm, export PDF/CSV |
| `classes` (members) | Học sinh của lớp, students_wait/students_accept |
| `notifications` | Thông báo trong app |
| `settings` | User settings, ngôn ngữ, theme |

**Không thuộc phạm vi:** video call, AI grading, anti-cheat phức tạp (fullscreen/webcam).

---

## 2. Tech stack

| Layer | Công nghệ | Lý do |
|---|---|---|
| Build | Vite | Nhanh, HMR tốt, ESM-first |
| UI | React 18 + TypeScript (strict) | Standard |
| Routing | React Router v6 | File-based không phù hợp do auth-gating |
| Server state | TanStack React Query v5 | Cache, retry, dedupe — không tự code |
| Client state | Zustand | Nhẹ, không boilerplate, không Provider hell |
| HTTP | Axios + interceptor | Quản lý token + 401 refresh tập trung |
| Styling | TailwindCSS + CSS variables | Đã có design tokens `qz-*` |
| i18n | i18next + react-i18next | EN + VI |
| Form | react-hook-form + zod | Type-safe, ít re-render |
| Icons | lucide-react | Tree-shakeable |
| Test | Vitest + React Testing Library | Cùng engine với Vite |

> **Migration note:** Codebase hiện đang dùng Redux Toolkit cho `classSlice`, `testSlice`, `questionSlice`. Mọi feature mới **bắt buộc** dùng React Query (server state) + Zustand (client state). Code Redux cũ sẽ được migrate dần — không thêm slice mới.

---

## 3. Cấu trúc thư mục

```txt
src/
├── app/                          # Khởi tạo app
│   ├── config.ts                 # API_ENDPOINTS, env
│   ├── queryClient.ts            # React Query config
│   ├── router.tsx                # Routes + guards
│   └── providers.tsx             # QueryClient, i18n, Theme providers
│
├── layouts/
│   ├── MainLayout.tsx
│   ├── Topbar/
│   └── Sidebar/
│
├── routes/
│   └── index.tsx                 # Route tree (dùng nested routes)
│
├── shared/                       # Chia sẻ toàn app
│   ├── components/
│   │   ├── ui/                   # qz-button, qz-modal, qz-input, qz-table
│   │   └── common/               # FileViewer, TopicComponent, LevelComponent
│   ├── hooks/                    # useDebounce, useMediaQuery, useOnClickOutside
│   ├── utils/                    # generateId, formatDate, parseError
│   ├── constants/                # questionTypes, formData, routes
│   ├── types/                    # Types dùng chung (Question, Submission)
│   └── services/                 # axios instance, apiCall*, StorageService
│
├── features/                     # 💥 Core — mỗi feature self-contained
│   ├── auth/
│   │   ├── api/                  # authApi.ts
│   │   ├── components/           # LoginForm, GoogleButton
│   │   ├── hooks/                # useAuth, useLogin, useLogout
│   │   ├── pages/                # Login.tsx, Logout.tsx
│   │   ├── stores/               # authStore.ts (Zustand)
│   │   ├── types.ts
│   │   └── index.ts              # Public surface
│   │
│   ├── dashboard/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   │
│   ├── quiz/                     # Test management (teacher)
│   │   ├── api/
│   │   ├── components/           # MatrixExam, TestInfoForm, TestScheduleForm
│   │   ├── hooks/                # useTests, useTestMutations
│   │   ├── pages/                # ManageTest, TestDetail
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── exam/                     # Làm bài thi (student)
│   │   ├── api/
│   │   ├── components/           # CountdownTimer, QuestionPalette, AutosaveIndicator
│   │   ├── hooks/                # useExamSession, useAutosave, useCountdown
│   │   ├── pages/                # DoTest.tsx
│   │   ├── stores/               # examDraftStore.ts
│   │   └── types.ts
│   │
│   ├── practice/                 # Ôn tập (student)
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/                # Practice.tsx
│   │
│   ├── question-bank/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── editors/          # QSingle, QMultiple, QFill, QOrder, QMatch
│   │   │   ├── QuestionList.tsx
│   │   │   ├── QuestionTable.tsx
│   │   │   └── QuestionModal.tsx
│   │   ├── hooks/                # useQuestions, useQuestionMutations
│   │   ├── pages/                # ManageQuestion.tsx
│   │   └── types.ts
│   │
│   ├── classes/
│   │   ├── api/
│   │   ├── components/           # ClassCard, JoinClassModal, MembersTab
│   │   ├── hooks/
│   │   ├── pages/                # ManageClass, ClassDetail
│   │   └── types.ts
│   │
│   ├── analytics/                # Results & dashboards
│   │   ├── api/
│   │   ├── components/           # ScoreChart, ExportButton
│   │   ├── hooks/
│   │   └── pages/                # ResultDashboard
│   │
│   └── settings/
│       ├── components/
│       └── pages/
│
├── stores/                       # Global stores (cross-feature)
│   ├── uiStore.ts                # Sidebar open, modal state
│   └── notificationStore.ts      # Toast queue
│
├── hooks/                        # Cross-feature hooks
│   └── useFeatureFlag.ts
│
├── types/                        # Global types
│   ├── api.ts                    # ApiError, Paginated<T>
│   └── env.d.ts
│
├── utils/                        # Cross-feature utilities
│   └── (use shared/utils nếu thuộc 1 module — utils/ chỉ cho cross-cutting)
│
├── styles/
│   ├── tokens.css                # CSS variables --qz-*
│   ├── components.css            # qz-btn, qz-card, qz-input...
│   └── animations.css
│
├── i18n/
│   ├── en/
│   ├── vi/
│   └── index.ts
│
├── App.tsx
├── main.tsx
└── index.css                     # @import tokens.css + components.css
```

> **Quy tắc vàng:** Một feature = một thư mục. Feature **không import từ feature khác**. Nếu cần dùng chung → đẩy vào `shared/`.

---

## 4. Nguyên tắc kiến trúc

1. **Feature-based, không layer-based.** Đặt code theo "câu hỏi nào tính năng nào" thay vì "đây là controllers".
2. **Page mỏng.** Page = compose components + hooks. Không gọi axios trực tiếp, không có business logic.
3. **Composition > inheritance.** Compound components, render props khi cần.
4. **Server state → React Query. Client state → Zustand. Form state → react-hook-form.** Không bao giờ trộn 3 thứ.
5. **API layer cô lập.** UI không biết axios tồn tại. Chỉ thấy hook.
6. **Không prop drilling.** Quá 2 cấp → custom hook hoặc context.
7. **Strong typed DTOs.** Mọi response/request đều có type. Không `any`.
8. **Avoid god-component.** File > 200 dòng = phải tách.

---

## 5. Quy chuẩn code

- TypeScript **strict mode** bật. Không tắt rule cục bộ trừ khi có `// FIXME(name): lý do`.
- Function components only. Không class components.
- Default `eslint --max-warnings 0` trước commit.
- Format bằng Prettier (`.prettierrc` đã có sẵn).
- Comment "tại sao", không "cái gì". Identifier rõ ràng đã đủ giải thích "cái gì".
- Không bao giờ `console.log` trong code merged. Dùng logger nếu cần.

---

## 6. Quy tắc TypeScript

```ts
// ✅ Type cho props ngay trên component
interface LoginFormProps {
  onSuccess: (user: User) => void;
}

// ✅ Discriminated union cho state phức tạp
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// ✅ DTO request/response riêng entity
interface LoginRequest { email: string; password: string }
interface LoginResponse { token: string; user: User }

// ❌ Không dùng any
function handle(data: any) {}

// ❌ Không dùng enum (dùng const object)
const ROLE = { STUDENT: 'student', TEACHER: 'teacher' } as const;
type Role = typeof ROLE[keyof typeof ROLE];
```

- Prefer `type` cho union/intersection, `interface` cho object shape.
- Không prefix `I` (`User`, không `IUser`).
- Generic constraint chặt: `<T extends { id: string }>` thay vì `<T>`.
- Đặt type chung của feature trong `features/<name>/types.ts`.

---

## 7. Quy tắc React

- **Hooks rules:** không gọi conditional, không trong loop. ESLint plugin react-hooks bật.
- **Effects nguyên tắc:** mỗi `useEffect` 1 trách nhiệm. Dependency array đầy đủ.
- **Không setState trong render.** Dùng `useEffect` hoặc derived state.
- **Memoize có chủ đích.** `useMemo`/`useCallback` chỉ khi profiler báo bottleneck hoặc cần stable ref cho child memo.
- **Key trong list:** dùng id ổn định, **không** dùng index trừ khi list không bao giờ reorder.
- **Suspense + lazy** cho route-level code splitting.

```tsx
// ✅ Lazy load page
const ManageQuestion = lazy(() => import('~/features/question-bank/pages/ManageQuestion'));
```

---

## 8. Quản lý state

| Loại state | Tool | Ví dụ |
|---|---|---|
| Server state (data từ API) | React Query | Danh sách lớp, câu hỏi, kết quả thi |
| Client state toàn cục | Zustand | Sidebar open, theme, current user |
| Form state | react-hook-form | Mọi form |
| Local UI state | `useState`/`useReducer` | Modal open, currentTab |
| URL state | search params, route params | Filter, pagination |

**Cấm:** đặt server data vào Zustand. **Cấm:** đồng bộ server data thủ công bằng `useEffect`.

### Zustand store template

```ts
// features/auth/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  setUser: (u: User | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      reset: () => set({ user: null }),
    }),
    { name: 'auth' },
  ),
);

// Selector dùng để tránh re-render thừa
export const selectUser = (s: AuthState) => s.user;
```

> **Quy tắc:** mỗi store < 100 dòng. Slice theo feature, không có store khổng lồ.

---

## 9. Chuẩn API layer

- **Axios instance dùng chung** ở `shared/services/http.ts`, có interceptor token + 401 refresh.
- Mọi feature có `api/` riêng — chỉ chứa **pure functions** trả về promise.
- Không đụng `localStorage` trong API layer (token lấy từ store hoặc TokenService).

```ts
// shared/services/http.ts
import axios from 'axios';
import { useAuthStore } from '~/features/auth/stores/authStore';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

http.interceptors.request.use((cfg) => {
  const token = useAuthStore.getState().user?.token;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().reset();
      window.location.assign('/login');
    }
    return Promise.reject(parseError(error));
  },
);
```

- Mỗi endpoint có DTO request + response riêng. Không trộn entity với DTO.
- Nếu BE đổi shape → chỉ sửa file `api/` của feature đó.

---

## 10. Quy ước React Query

```ts
// features/question-bank/hooks/useQuestions.ts
import { useQuery } from '@tanstack/react-query';
import { questionApi } from '../api/questionApi';

export const questionKeys = {
  all: ['questions'] as const,
  list: (filters: Filters) => [...questionKeys.all, 'list', filters] as const,
  detail: (id: string) => [...questionKeys.all, 'detail', id] as const,
};

export function useQuestions(filters: Filters) {
  return useQuery({
    queryKey: questionKeys.list(filters),
    queryFn: () => questionApi.list(filters),
    staleTime: 30_000,
  });
}
```

**Quy tắc:**
- Mỗi feature có file `hooks/use<Resource>.ts` chứa cả query + mutation hooks.
- Luôn export `<resource>Keys` factory để invalidate dễ.
- `staleTime` mặc định 30s. Dữ liệu hiếm đổi: 5 phút.
- Mutation: invalidate hoặc set query data trong `onSuccess` — không refetch full nếu không cần.
- Optimistic update cho action user-visible (like, vote, drag-reorder).
- Không dùng `useEffect` để refetch — dùng `enabled`, `refetchOnWindowFocus`, `refetchInterval`.

---

## 11. Form handling

- **react-hook-form + zod** cho mọi form.
- Schema zod đặt cùng file form.
- Component input wrap bằng `<Controller>` chỉ khi cần (Select tuỳ biến, RichText). Input thường dùng `register`.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
type FormValues = z.infer<typeof schema>;

export function LoginForm({ onSubmit }: { onSubmit: (v: FormValues) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-semibold">Email</label>
        <input className="qz-input" {...register('email')} />
        {errors.email && <p className="text-[var(--qz-danger)] text-xs mt-1">{errors.email.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="qz-btn qz-btn-primary">Đăng nhập</button>
    </form>
  );
}
```

---

## 12. Luồng authentication

1. `POST /auth/login` → BE trả `access_token` + `refresh_token`.
2. FE lưu token vào `authStore` (persist localStorage).
3. Mỗi request: axios interceptor gắn `Authorization: Bearer <token>`.
4. 401 → interceptor gọi `/auth/refresh`. Nếu refresh fail → reset store + redirect `/login`.
5. Logout: `POST /auth/logout` (server invalidate session) → reset store → redirect.

**`PrivateRoute`** kiểm tra `authStore.user` (không gọi API). 401 thật sự sẽ được interceptor xử lý.

---

## 13. Authorization / RBAC

- Role lưu trong `user.permissions: string[]` (ví dụ: `['teacher']`, `['admin', 'teacher']`).
- Helper `can(action: string, user: User)` trong `features/auth/utils/permission.ts`.
- Component-level guard: `<Authorized action="class:create">`.
- Route-level guard: `<RoleRoute roles={['teacher']}>`.

```tsx
function Authorized({ action, children, fallback = null }: AuthorizedProps) {
  const user = useAuthStore(selectUser);
  return can(action, user) ? <>{children}</> : <>{fallback}</>;
}
```

> **Cấm** dựa vào `user.role === 'admin'` rải rác trong UI. Luôn qua `can()`.

---

## 14. UI Design System (Quizlet-style)

> **Theme:** light · **Font:** `hurme_no2-webfont` · **Base unit:** 8px · **Density:** compact

### Tokens (CSS variables trong `styles/tokens.css`)

**Brand:**
| Token | Hex | Vai trò |
|---|---|---|
| `--qz-violet` | `#4255FF` | CTA chính, link active |
| `--qz-violet-dark` | `#423ED8` | Hover brand |
| `--qz-violet-soft` | `#EBEDFF` | Hover bg, highlight |

**Decorative (chỉ dùng cho minh hoạ):** `--qz-sky` `#98E3FF`, `--qz-pink` `#EEAAFF`, `--qz-orange` `#FFC38C`.

**Neutral:**
| Token | Hex | Vai trò |
|---|---|---|
| `--qz-bg` | `#F6F7FB` | Page background — **không** đặt trên card |
| `--qz-surface` | `#FFFFFF` | Card / modal |
| `--qz-ink` | `#282E3E` | Text chính |
| `--qz-deep-slate` | `#2E3856` | Text dày |
| `--qz-slate` | `#586380` | Text phụ |
| `--qz-slate-light` | `#939BB4` | Inactive, placeholder |
| `--qz-border` | `#D9DDE8` | Divider, input border |

**Semantic:** `--qz-success` `#16A34A`, `--qz-warn` `#D97706`, `--qz-danger` `#DC2626`.

### Typography (semantic class)

| Class | Size/Line | Dùng cho |
|---|---|---|
| `qz-display` | 44/1.25 | Hero title, score lớn |
| `qz-h1` | 32/1.27 | Page title |
| `qz-h2` | 24/1.33 | Section heading, modal title |
| `qz-h3` | 20/1.25 | Card title |
| `qz-body` | 16/1.5 | Body text |
| `qz-caption` | 12/1.5 | Helper, metadata |

### Spacing & radius

- Base 8px. Section gap 48px. Card padding 16-24px.
- Card/modal radius 8px. Input radius 4px. Button radius 200px (pill).
- Page max width 1200-1280px (`max-w-7xl mx-auto`).

### Elevation

- Card: `--qz-shadow-card` → `0 4px 16px 0 rgba(40, 46, 62, 0.1)`
- Floating CTA brand-tinted: `0 8px 24px 0 rgba(66, 85, 255, 0.35)`

### Components có sẵn (utility class)

```html
<button class="qz-btn qz-btn-primary">Bắt đầu</button>
<button class="qz-btn qz-btn-secondary">Huỷ</button>
<button class="qz-btn qz-btn-ghost">Sửa</button>
<button class="qz-btn qz-btn-danger">Xoá</button>

<article class="qz-card">…</article>
<article class="qz-card-flat">…</article>
<article class="qz-card-interactive">…</article>

<input class="qz-input" />

<span class="qz-pill qz-pill-open">Đang mở</span>
<span class="qz-pill qz-pill-success">Đã nộp</span>
<span class="qz-pill qz-pill-danger">Hết hạn</span>
<span class="qz-pill qz-pill-warn">Chờ duyệt</span>
<span class="qz-pill qz-pill-muted">Chưa mở</span>

<div class="qz-spinner" />
```

### Hero panel

Gradient `from-[var(--qz-violet)] to-[var(--qz-violet-dark)]`, white text + `text-white/80`, 1-2 decorative circles `bg-white/10` absolute.

### Animations

- `animate-fadeIn` — opacity 0→1 200ms
- `animate-scaleIn` — scale 0.96→1 250ms
- `animate-slideUp` — translateY 8→0 300ms

---

## 15. TailwindCSS Rules

- **Mobile-first.** Default = mobile, `md:`/`lg:` cộng dồn.
- **Token-first.** Dùng `bg-[var(--qz-violet)]` thay vì `bg-blue-600`.
- **Không inline hex.** Mọi màu qua token.
- **Utility class trước.** `qz-btn` thay vì compose `bg-violet-600 rounded-full px-4...` mỗi lần.
- **`@apply` chỉ trong `components.css`.** Không `@apply` rải rác.
- Sort class theo Prettier plugin Tailwind (đã cấu hình).

```tsx
// ✅
<button className="qz-btn qz-btn-primary">Lưu</button>
<div className="bg-[var(--qz-bg)] rounded-lg p-4">…</div>

// ❌
<button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2">Lưu</button>
<div style={{ background: '#F6F7FB' }}>…</div>
```

---

## 16. Component patterns

| Pattern | Khi nào |
|---|---|
| Custom hook | Logic/state dùng lại nhiều nơi |
| Compound component | Component phức (Tabs, Accordion, Modal) |
| Render props / slots | Parent kiểm soát render của child |
| Adapter / Service layer | Cô lập axios, storage, analytics |
| Selector pattern | Derived state từ Zustand/RQ cache |
| State machine | Async flow nhiều state (xstate-lite) |

```tsx
// Compound: Modal
<Modal>
  <Modal.Header>Chỉnh sửa câu hỏi</Modal.Header>
  <Modal.Body>…</Modal.Body>
  <Modal.Footer>
    <button className="qz-btn qz-btn-secondary">Huỷ</button>
    <button className="qz-btn qz-btn-primary">Lưu</button>
  </Modal.Footer>
</Modal>
```

> **Rule:** nếu reach for pattern, đặt comment `// Pattern: <Tên>`. Không đặt được tên → không cần pattern.

---

## 17. Page layout patterns

3 archetype:

### A. Dashboard (overview)
```
[Hero header — gradient violet, stats]
[Section heading + count pill]
  [Grid qz-card-interactive (md:grid-cols-2)]
[Floating qz-btn-primary bottom-right (z-30)]
```

### B. Management (CRUD)
```
[Hero header với CTA "Tạo mới" white inverted]
[List qz-card hoặc empty state]
[Modal: tabs ở header, body scroll, footer sticky]
```

### C. Exam (DoTest)
```
[Sticky qz-card status bar — timer + autosave + submit CTA]
[qz-card với question content]
[Prev/Next row]
[qz-card với palette grid + legend]
```

---

## 18. Modal standards

- Backdrop: `bg-[var(--qz-ink)]/40 backdrop-blur-sm` + `animate-fadeIn`.
- Container: `qz-card max-w-md p-6 animate-scaleIn` (`max-w-2xl` cho data-heavy).
- Header → body scroll → footer sticky right-aligned.
- ESC đóng modal. Click backdrop đóng (trừ form đang dirty → confirm).
- `aria-modal="true"`, focus trap, return focus về trigger.

---

## 19. Table standards

- Component `qz-table` ở `shared/components/ui/Table.tsx`.
- Sortable column dùng button trong `<th>` + `aria-sort`.
- Pagination URL-driven: `?page=2&limit=10`.
- Empty state: 64×64 violet-soft circle + heading + caption + primary CTA.
- Skeleton row khi loading (xem mục 21).

---

## 20. Error handling

```ts
// shared/services/parseError.ts
export interface ApiError { message: string; code?: string; status?: number }

export function parseError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    return {
      status: err.response?.status,
      message: err.response?.data?.message ?? 'Có lỗi xảy ra',
      code: err.response?.data?.code,
    };
  }
  return { message: err instanceof Error ? err.message : 'Có lỗi xảy ra' };
}
```

- React Query trả `error` đã parse → component chỉ hiển thị `error.message`.
- ErrorBoundary cấp page (`features/<x>/pages/ErrorBoundary.tsx`).
- Mutation error → toast `qz-pill qz-pill-danger` qua `notificationStore`.
- Không bao giờ swallow error. Log qua `console.error` trong dev, qua telemetry trong prod.

---

## 21. Loading & Skeleton

- Page loading: `<div className="qz-spinner" />` center.
- Card skeleton: `bg-[var(--qz-border)]/40 animate-pulse rounded-lg h-X`.
- Mutation pending: button `disabled` + label đổi sang "Đang lưu...".
- Không show spinner cho action < 200ms (cảm giác nhấp nháy).

---

## 22. Toast & Notification

```ts
// stores/notificationStore.ts
interface NotificationState {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}
```

- 4 variant: `success` / `error` / `warn` / `info` (map sang `qz-pill-*`).
- Auto dismiss 4s. Error giữ 8s.
- Vị trí: top-right desktop, bottom-center mobile.
- Tối đa 3 toast cùng lúc; mới đẩy cũ ra.

---

## 23. Accessibility

- Focus visible bằng `focus-visible:ring-2 focus-visible:ring-[var(--qz-violet)]`.
- Mọi interactive element keyboard-navigable.
- Icon-only button → `aria-label`.
- Form input → `<label>` + `aria-describedby` cho error.
- Contrast ≥ 4.5:1 cho text (WCAG AA).
- `prefers-reduced-motion` → disable `animate-*`.
- Test với keyboard-only và VoiceOver/NVDA cho flow critical (login, do-test, submit).

---

## 24. Performance

- **Route-level code splitting** với `React.lazy + Suspense`.
- **Dynamic import** cho lib nặng (chart.js, mathjax) chỉ ở nơi dùng.
- **Image:** `loading="lazy"`, kích thước cố định, prefer SVG.
- **Bundle budget:** route ban đầu < 200KB gzipped. Nếu vượt → tách.
- **Memoization** chỉ khi profiler chỉ ra. Không wrap mọi handler trong `useCallback`.
- **List ảo** (react-virtual) khi list > 200 phần tử.
- Lighthouse target: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 90.

---

## 25. Security

- **XSS:** không `dangerouslySetInnerHTML` với content từ user. Nếu render markdown → sanitize bằng `dompurify`.
- **CSRF:** axios không tự gửi cookie cross-origin (`withCredentials: false` mặc định). Token qua header.
- **Token storage:** access_token trong memory (Zustand), refresh_token httpOnly cookie do BE set.
- **Input validation:** zod ở FE, BE validate độc lập (không tin FE).
- **Không log PII** (email, phone) trong analytics/console.
- **Dependency audit:** `npm audit` trước release. Cấp `high` phải fix.
- **Env keys:** chỉ var với prefix `VITE_` mới expose ra client. Secret keys **không** đặt prefix `VITE_`.

---

## 26. Environment variables

```bash
# .env (không commit)
VITE_API_URL=https://api.example.com
VITE_DO_TEST_URL=https://exam.example.com
VITE_FIREBASE_API_KEY=...
VITE_GOOGLE_CLIENT_ID=...
```

```ts
// types/env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_DO_TEST_URL: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
}
```

- Mọi truy cập `import.meta.env` qua `app/config.ts` — không rải khắp code.
- `.env.example` luôn commit, `.env` không commit.
- Validate env khi app start: thiếu var → fail fast với message rõ.

---

## 27. Testing strategy

| Loại | Tool | Coverage target |
|---|---|---|
| Unit (utils, parseError, can()) | Vitest | 80% |
| Component (smoke, interaction) | RTL | Component cốt lõi |
| Hook | RTL `renderHook` | Mọi custom hook |
| Integration (page + MSW) | RTL + msw | Critical flow: login, do-test, submit |
| E2E | Playwright (optional) | Smoke 3 flow chính |

**Quy tắc:**
- Không test implementation detail (state internal, useEffect call). Test behavior từ user.
- MSW thay thật axios mock — handler cùng shape với BE.
- `data-testid` chỉ khi không có cách khác (label, role).

---

## 28. Git conventions

**Branch:** `<type>/<feature>-<ticket>`
- `feat/exam-autosave-123`, `fix/question-id-missing-456`, `chore/upgrade-vite-789`

**Commit message** (Conventional Commits):
```
<type>(<scope>): <subject>

feat(exam): bật countdown auto-submit khi hết giờ
fix(question): sinh id cho item khi đổi type
chore(deps): bump react-query lên 5.x
```

Type: `feat` `fix` `chore` `docs` `refactor` `test` `perf` `style` `revert`.

- Subject ≤ 72 ký tự, tiếng Việt OK.
- Body giải thích **tại sao**, không **cái gì**.
- 1 commit = 1 logical change. Không trộn fix + refactor.

---

## 29. Naming conventions

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Component | PascalCase | `QuestionModal.tsx` |
| Hook | useCamelCase | `useExamSession.ts` |
| Util | camelCase | `generateId.ts`, `parseError.ts` |
| Type/Interface | PascalCase, không prefix | `Question`, `Submission` |
| Constant | SCREAMING_SNAKE_CASE | `QUESTION_TYPES`, `MAX_FILE_SIZE` |
| File CSS | kebab-case | `tokens.css`, `components.css` |
| Route | kebab-case | `/manage-class`, `/do-test` |
| API endpoint | kebab/snake theo BE | giữ nguyên |
| Boolean prop | `is*` / `has*` / `can*` | `isLoading`, `hasMore`, `canEdit` |
| Event handler | `on*` (prop), `handle*` (impl) | `onSubmit` / `handleSubmit` |

---

## 30. Import order

ESLint plugin `import/order` enforce:

```ts
// 1. React + framework
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. External packages
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// 3. Internal absolute (~/)
import { http } from '~/shared/services/http';
import { useAuthStore } from '~/features/auth/stores/authStore';

// 4. Relative (cùng feature)
import { questionApi } from '../api/questionApi';
import { QuestionForm } from './QuestionForm';

// 5. Type-only imports cuối
import type { Question } from '~/shared/types/question';

// 6. CSS cuối cùng
import './QuestionModal.css';
```

Nhóm cách nhau 1 dòng trống.

---

## 31. Absolute imports

- Alias `~/` → `src/` (đã cấu hình trong `vite.config.ts` + `tsconfig.json`).
- **Bắt buộc** dùng `~/` cho mọi import vượt thư mục cha (`../../`).
- Cùng thư mục: dùng relative `./Component`.
- Cross-feature import → **chỉ qua `index.ts` public surface** của feature đích.

```ts
// ✅
import { useAuth } from '~/features/auth';            // qua index.ts
import { QuestionList } from './QuestionList';         // cùng feature

// ❌
import { authStore } from '../../auth/stores/authStore'; // bypass surface
```

---

## 32. Feature-based architecture guide

**Mỗi feature là một mini-app:**

```
features/<name>/
├── api/         # Pure functions, return promise
├── components/  # UI riêng feature
├── hooks/       # useQuery/useMutation, business logic
├── pages/       # Route component
├── stores/      # (Optional) Zustand store nếu cần
├── types.ts     # DTOs + entity types riêng
└── index.ts     # Public surface — chỉ export thứ feature khác cần
```

**Quy tắc:**
1. Feature **không** import trực tiếp file của feature khác.
2. Cross-feature → qua `index.ts`.
3. Nếu 2 feature cùng cần X → đẩy X vào `shared/`.
4. Page nằm trong `pages/` của feature, route đăng ký trong `routes/index.tsx`.
5. Feature mới phải có README ngắn ở root nếu logic phức tạp.

---

## 33. Reusable component rules

Một component được coi là reusable **chỉ khi**:
- Đã có ≥ 3 chỗ dùng (rule of three).
- Không phụ thuộc business logic của 1 feature cụ thể.
- Props purely data + callback, không reach vào store.

Đặt tại `shared/components/ui/` (UI thuần) hoặc `shared/components/common/` (có chút logic).

```tsx
// ✅ Reusable
interface PillProps {
  variant: 'success' | 'danger' | 'warn' | 'open' | 'muted';
  children: ReactNode;
}
export function Pill({ variant, children }: PillProps) {
  return <span className={`qz-pill qz-pill-${variant}`}>{children}</span>;
}

// ❌ Không reusable — phụ thuộc store auth
export function MyProfileButton() {
  const user = useAuthStore(selectUser);
  return <button>{user?.name}</button>;
}
```

---

## 34. Custom hook rules

- 1 hook = 1 trách nhiệm.
- Tên bắt đầu `use`.
- Trả về object có tên rõ, không trả tuple > 2 phần tử.
- Side effect (toast, navigate) chỉ trong handler trả về, không trong `useEffect` ngầm.

```ts
// ✅
function useExamSubmit(testId: string) {
  const navigate = useNavigate();
  const push = useNotificationStore((s) => s.push);
  const mut = useMutation({
    mutationFn: (answers: StudentAnswer[]) => examApi.submit(testId, answers),
    onSuccess: () => {
      push({ variant: 'success', message: 'Đã nộp bài' });
      navigate('/dashboard');
    },
  });
  return { submit: mut.mutate, isPending: mut.isPending };
}
```

---

## 35. Business logic separation

**Layered:**

```
[Page]                  ← compose
  └─ [Feature components]
       └─ [Custom hooks (business logic)]
            └─ [API functions (pure)]
                 └─ [http instance]
```

- Page **không** gọi `axios`, **không** gọi `useQuery` trực tiếp với `queryFn` inline. Page chỉ gọi `useQuestions()`.
- Component **không** chứa fetch. Component nhận data + callback từ parent.
- Business rule (ví dụ: "chỉ admin xoá được câu hỏi") trong hook hoặc util `can()`, không trong JSX.

```tsx
// ❌ Business trong JSX
<button disabled={user.role !== 'admin' || question.status === 'archived'}>Xoá</button>

// ✅
<Authorized action="question:delete" data={question}>
  <button className="qz-btn qz-btn-danger">Xoá</button>
</Authorized>
```

---

## 36. File naming examples

| File | Đường dẫn |
|---|---|
| Page làm bài thi | `features/exam/pages/DoTest.tsx` |
| Page ôn tập | `features/practice/pages/Practice.tsx` |
| API auth | `features/auth/api/authApi.ts` |
| Hook list câu hỏi | `features/question-bank/hooks/useQuestions.ts` |
| Store auth | `features/auth/stores/authStore.ts` |
| Util sinh id | `shared/utils/generateId.ts` |
| UI primitive | `shared/components/ui/Button.tsx` |
| Type DTO | `features/exam/types.ts` |
| Constant | `shared/constants/questionTypes.ts` |

---

## 37. AI agent instructions

Khi Claude/Cursor/GPT làm việc trên repo này:

**Trước khi code:**
1. Đọc đúng file CLAUDE.md này.
2. Trả lời 4 câu (tiếng Việt OK):
   - Cần làm gì? (1 câu)
   - Giả định là gì?
   - Có cách đơn giản hơn?
   - "Xong" trông thế nào? (verifiable)
3. Bất kỳ câu nào "không biết" → **dừng, hỏi**.

**Khi code:**
- Chỉ chạm file thuộc phạm vi yêu cầu. Không "cải thiện" file lân cận.
- Match style hiện có. Không refactor không yêu cầu.
- 3 chỗ giống nhau mới extract — không phải 2.
- Không thêm error handling cho case không thể xảy ra.
- Không default `try/catch` quanh mọi await — chỉ nơi có recovery thật sự.
- Không dùng `any`. Nếu type khó → hỏi.

**Khi xong:**
- Chạy `tsc --noEmit` xác nhận sạch.
- Chạy `eslint --max-warnings 0`.
- Self-review diff: mỗi dòng phải traceable về yêu cầu.
- Commit message tuân thủ section 28.

**Không bao giờ:**
- Tạo file `.md` summary/plan trừ khi user yêu cầu.
- Push không hỏi.
- Bypass `--no-verify`.
- Xoá file lạ — investigate trước.

---

## 38. Do & Don't

### Do
- Dùng `qz-*` utility class cho UI thông dụng.
- Đặt server data trong React Query, client UI state trong Zustand.
- Validate input bằng zod ở FE, tin BE validate độc lập.
- Mobile-first responsive, breakpoints 320/375/768/1280.
- Một feature self-contained, expose qua `index.ts`.
- Type DTO request/response riêng entity.
- Toast cho mutation result; spinner cho query loading.

### Don't
- Đặt server state trong Zustand.
- Trộn `useEffect + fetch` thay cho React Query.
- Inline hex color trong component.
- `any` ở mọi nơi.
- Component > 200 dòng — tách.
- Cross-feature import file trực tiếp — qua `index.ts`.
- Console.log trong code merged.
- `dangerouslySetInnerHTML` chưa sanitize.
- Tạo file design/planning .md khi không được yêu cầu.

---

## 39. Example feature structure

```
features/exam/
├── api/
│   └── examApi.ts                # startTest, submitTest, saveDraft
├── components/
│   ├── CountdownTimer.tsx
│   ├── QuestionPalette.tsx
│   ├── AutosaveIndicator.tsx
│   └── SubmitConfirmModal.tsx
├── hooks/
│   ├── useExamSession.ts         # start + re-entry logic
│   ├── useAutosave.ts            # debounce save draft
│   ├── useCountdown.ts
│   └── useExamSubmit.ts
├── pages/
│   └── DoTest.tsx
├── stores/
│   └── examDraftStore.ts         # Zustand persist localStorage
├── types.ts                      # ExamSession, StudentAnswer, SubmitResponse
└── index.ts                      # export { DoTest, useExamSession }
```

---

## 40. Example component template

```tsx
// features/exam/components/CountdownTimer.tsx
import { useCountdown } from '../hooks/useCountdown';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endTime: string;          // ISO
  onTimeUp: () => void;
}

export function CountdownTimer({ endTime, onTimeUp }: CountdownTimerProps) {
  const { hours, minutes, seconds, isOver } = useCountdown(endTime, onTimeUp);

  return (
    <div
      role="timer"
      aria-live="polite"
      className={`qz-pill ${isOver ? 'qz-pill-danger' : 'qz-pill-warn'}`}
    >
      <Clock size={14} aria-hidden="true" />
      <span>{hours}h {minutes}m {seconds}s</span>
    </div>
  );
}
```

---

## 41. Example page template

```tsx
// features/question-bank/pages/ManageQuestion.tsx
import { useState } from 'react';
import { useQuestions, useDeleteQuestion } from '../hooks/useQuestions';
import { QuestionList } from '../components/QuestionList';
import { QuestionModal } from '../components/QuestionModal';

export default function ManageQuestion() {
  const [editing, setEditing] = useState<string | null>(null);
  const { data, isLoading, error } = useQuestions({ page: 1, limit: 20 });
  const del = useDeleteQuestion();

  if (isLoading) return <div className="qz-spinner" />;
  if (error) return <p className="text-[var(--qz-danger)]">{error.message}</p>;

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="qz-h1">Ngân hàng câu hỏi</h1>
        <button className="qz-btn qz-btn-primary" onClick={() => setEditing('new')}>
          Tạo câu hỏi
        </button>
      </header>

      <QuestionList
        questions={data?.items ?? []}
        onEdit={setEditing}
        onDelete={del.mutate}
      />

      {editing && <QuestionModal id={editing} onClose={() => setEditing(null)} />}
    </main>
  );
}
```

---

## 42. Example API service template

```ts
// features/question-bank/api/questionApi.ts
import { http } from '~/shared/services/http';
import type { Question, QuestionFilters, Paginated } from '../types';

export const questionApi = {
  list: (filters: QuestionFilters) =>
    http.get<Paginated<Question>>('/questions', { params: filters }).then((r) => r.data),

  detail: (id: string) =>
    http.get<Question>(`/questions/${id}`).then((r) => r.data),

  create: (payload: Omit<Question, '_id' | 'created_at' | 'updated_at'>) =>
    http.post<Question>('/questions', payload).then((r) => r.data),

  update: (payload: Question) =>
    http.patch<Question>('/questions', payload).then((r) => r.data),

  remove: (id: string) =>
    http.delete<void>('/questions', { data: { id } }).then((r) => r.data),
};
```

---

## 43. Example React Query hook template

```ts
// features/question-bank/hooks/useQuestions.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { questionApi } from '../api/questionApi';
import { useNotificationStore } from '~/stores/notificationStore';
import type { Question, QuestionFilters } from '../types';

export const questionKeys = {
  all: ['questions'] as const,
  list: (f: QuestionFilters) => [...questionKeys.all, 'list', f] as const,
  detail: (id: string) => [...questionKeys.all, 'detail', id] as const,
};

export function useQuestions(filters: QuestionFilters) {
  return useQuery({
    queryKey: questionKeys.list(filters),
    queryFn: () => questionApi.list(filters),
    staleTime: 30_000,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  const push = useNotificationStore((s) => s.push);
  return useMutation({
    mutationFn: questionApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: questionKeys.all });
      push({ variant: 'success', message: 'Đã tạo câu hỏi' });
    },
    onError: (err) => push({ variant: 'error', message: err.message }),
  });
}

export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: questionApi.update,
    onSuccess: (q) => {
      qc.setQueryData(questionKeys.detail(q._id), q);
      qc.invalidateQueries({ queryKey: questionKeys.all });
    },
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: questionApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: questionKeys.all }),
  });
}
```

---

## 44. Deployment notes

- **Build:** `vite build` → output `dist/`. Source map ẩn (`build.sourcemap: 'hidden'`) cho prod.
- **Hosting:** static (Vercel / Cloudflare Pages / Nginx). SPA fallback `try_files $uri /index.html`.
- **Env per stage:** `.env.development`, `.env.staging`, `.env.production`.
- **Cache control:**
  - `index.html`: `Cache-Control: no-cache`.
  - Asset hashed (`*.[hash].js/css`): `Cache-Control: public, max-age=31536000, immutable`.
- **Sentry/telemetry:** init trong `app/providers.tsx`, scrub PII trước khi gửi.
- **Health check:** `/health.txt` static để LB ping.

---

## 45. Scalability notes

| Concern | Hướng giải quyết |
|---|---|
| Bundle phình | Route-level lazy + dynamic import lib nặng |
| Re-render dây chuyền | Selector Zustand, `React.memo` ở leaf |
| List dài (kết quả thi cả lớp) | `@tanstack/react-virtual` |
| Realtime monitor exam | WebSocket / SSE — dùng React Query `subscribeToQuery` |
| i18n bảng dày | Lazy load namespace theo route |
| Theme/branding nhiều khách | CSS variables — đổi token là đủ |
| Multi-tenant | Subdomain → tenant id → header X-Tenant gắn ở interceptor |

---

## 46. Future enhancements

**Phase 2 (MVP đầy đủ):**
- [ ] WebSocket monitor exam realtime cho teacher
- [ ] Trang xem chi tiết kết quả từng câu sau thi (student)
- [ ] Export CSV/PDF kết quả lớp (teacher)
- [ ] Autosave draft câu trả lời lên server (chống mất bài khi crash)
- [ ] Refresh token flow đầy đủ

**Phase 3 (scale & UX):**
- [ ] Anti-cheat cơ bản: tab visibility, fullscreen prompt
- [ ] Theme dark mode (đã có token chuẩn → chỉ cần CSS variables alt)
- [ ] PWA + offline practice
- [ ] Drag-reorder câu hỏi trong test bằng `@dnd-kit`
- [ ] Search câu hỏi nâng cao (full-text qua BE Elasticsearch)
- [ ] AI gợi ý câu hỏi tương tự

**Tech debt:**
- [ ] Migrate Redux slices (`classSlice`, `testSlice`, `questionSlice`) sang React Query + Zustand
- [ ] Hợp nhất `score` vs `total_score` trong contract
- [ ] Strip `console.log` còn lại trong codebase
- [ ] Dọn `simplifySubmissionData` và code chết khác

---

> **Tài liệu này là source of truth.** Khi cập nhật nguyên tắc → sửa tại đây trước, sau đó mới đụng code. AI agent + dev mới đều đọc file này đầu tiên.
