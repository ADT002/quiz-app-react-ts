import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, type ReactNode } from 'react';
import MainLayout from '~/layouts/Layout';
import TokenService from '~/shared/services/StorageService';


/* ─────────────────────── Code-split routes ─────────────────────── */
/** Login & Logout đặt eager để tránh flash khi ai đó vừa logout */
import Login from '~/features/auth/components/Login';
import Logout from '~/features/auth/components/Logout';

const Dashboard = lazy(() => import('~/features/dashboard/pages/Dashboard'));
const ListTest = lazy(() => import('~/features/test/pages/ListTest'));
const Practice = lazy(() => import('~/features/practice/pages/Practice'));
const ExamDoTest = lazy(() => import('~/features/exam/pages/DoTest'));
const ManageClass = lazy(() => import('~/features/class/pages/ManageClass'));
const ManageTest = lazy(() => import('~/features/test/pages/ManageTest'));
const ManageQuestion = lazy(() => import('~/features/question/pages/ManageQuestion'));
const UserManager = lazy(() => import('~/features/user/pages/UserManager'));

/* ─────────────────────── Guards & fallback ─────────────────────── */

function PrivateRoute({ children }: { children: ReactNode }) {
  return TokenService.getToken() ? <>{children}</> : <Navigate to="/login" replace />;
}

const RouteFallback = () => (
  <div className="flex flex-col items-center justify-center py-32">
    <div className="qz-spinner" />
  </div>
);

/** Compose Private + Suspense lazy in one wrapper */
const Protected = ({ children }: { children: ReactNode }) => (
  <PrivateRoute>
    <Suspense fallback={<RouteFallback />}>{children}</Suspense>
  </PrivateRoute>
);

/* ─────────────────────── Routes ─────────────────────── */

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="logout" element={<Logout />} />
        <Route path="dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="list-test/:classId/:author" element={<Protected><ListTest /></Protected>} />
        <Route path="do-test" element={<Protected><ExamDoTest /></Protected>} />
        <Route path="exam/:test_of_class_id" element={<Protected><ExamDoTest /></Protected>} />
        <Route path="practice/:test_of_class_id" element={<Protected><Practice /></Protected>} />
        <Route path="manage-class" element={<Protected><ManageClass /></Protected>} />
        <Route path="manage-test" element={<Protected><ManageTest /></Protected>} />
        <Route path="manage-question" element={<Protected><ManageQuestion /></Protected>} />
        <Route path="manage-users" element={<Protected><UserManager /></Protected>} />
      </Route>
    </Routes>
  );
}
