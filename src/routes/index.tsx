import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '~/layouts/Layout';
import Login from '~/features/auth/components/Login';
import Logout from '~/features/auth/components/Logout';
import Dashboard from '~/features/dashboard/pages/Dashboard';
import ListTest from '~/features/test/pages/ListTest';
import DoTest from '~/features/test/pages/DoTest';
import Practice from '~/features/test/pages/Practice';
import ManageClass from '~/features/class/pages/ManageClass';
import ManageTest from '~/features/test/pages/ManageTest';
import ManageQuestion from '~/features/question/pages/ManageQuestion';
import UserManager from '~/features/user/pages/UserManager';
import TokenService from '~/shared/services/StorageService';
import type { ReactNode } from 'react';

// Chặn truy cập route khi chưa đăng nhập — tránh vòng lặp 401 ↔ login
function PrivateRoute({ children }: { children: ReactNode }) {
  return TokenService.getToken() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function AppRoutes() {

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="logout" element={<Logout />} />
        <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="list-test/:classId/:author" element={<PrivateRoute><ListTest /></PrivateRoute>} />
        <Route path="do-test" element={<PrivateRoute><DoTest /></PrivateRoute>} />
        <Route path="practice" element={<PrivateRoute><Practice /></PrivateRoute>} />
        <Route path="manage-class" element={<PrivateRoute><ManageClass /></PrivateRoute>} />
        <Route path="manage-test" element={<PrivateRoute><ManageTest /></PrivateRoute>} />
        <Route path="manage-question" element={<PrivateRoute><ManageQuestion /></PrivateRoute>} />
        <Route path="manage-users" element={<PrivateRoute><UserManager /></PrivateRoute>} />
      </Route>
    </Routes>
  );
}
