import { useState, FC, FormEvent, useEffect } from 'react';
import { auth, googleProvider } from '~/app/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import TokenService from '~/shared/services/StorageService';
import API_ENDPOINTS from '~/app/config';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // [] → chỉ chạy 1 lần khi mount, tránh redirect loop
  useEffect(() => {
    if (TokenService.getToken() != null) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const signIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'password', email, password }),
      });
      const data = await response.json();
      TokenService.save(data);
    } catch {
      alert(t('login.googleError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    await signIn(); // await để đảm bảo token được lưu trước khi navigate
  };

  const signInWithGoogle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: "google", token: idToken }),
      });

      const data = await response.json();
      TokenService.save(data);

      navigate('/dashboard');
      window.location.reload();
    } catch {
      alert(t('login.googleError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--qz-bg)] px-4 py-10">
      <div className="w-full max-w-5xl bg-white rounded-[16px] shadow-[var(--qz-shadow-card)] overflow-hidden grid grid-cols-1 md:grid-cols-2 animate-scaleIn">

        {/* Left — Brand panel */}
        <div className="hidden md:flex flex-col justify-between bg-[#423ED8] text-white p-10 relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#4255FF] opacity-60" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[#98E3FF] opacity-30" />
          <div className="absolute top-1/3 right-10 w-12 h-12 rounded-full bg-[#FFC38C] opacity-70" />

          <div className="relative">
            <img src="/logo.png" alt="Logo" className="h-12 mb-8" />
            <h2 className="qz-h1 text-white mb-3">Học, ôn, thi.<br />Tất cả ở một nơi.</h2>
            <p className="qz-body text-white/80 max-w-sm">
              Nền tảng quản lý lớp học và thi trắc nghiệm trực tuyến — thiết kế cho giáo viên và học sinh.
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-3 mt-10">
            <div className="bg-white/15 backdrop-blur rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-white/70">Loại câu hỏi</p>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">∞</p>
              <p className="text-xs text-white/70">Bài thi</p>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">1-Click</p>
              <p className="text-xs text-white/70">Tham gia</p>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="p-10 md:p-12 flex flex-col justify-center">
          <h1 className="qz-h1 text-[var(--qz-ink)] mb-1">{t('login.title')}</h1>
          <p className="qz-caption mb-8">Đăng nhập để vào lớp học của bạn</p>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--qz-slate-light)] w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                className="qz-input pl-11"
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--qz-slate-light)] w-4 h-4" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                className="qz-input pl-11"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="qz-btn qz-btn-primary w-full py-3.5"
            >
              <LogIn className="w-4 h-4" />
              {loading ? t('login.loading') : t('login.loginButton')}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-[var(--qz-border)]" />
            <span className="px-4 qz-caption">hoặc</span>
            <div className="flex-1 h-px bg-[var(--qz-border)]" />
          </div>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="qz-btn qz-btn-secondary w-full py-3.5 disabled:opacity-50"
          >
            <img src="/google-logo.jpg" alt="Google" className="w-5 h-5" />
            <span>{loading ? t('login.loading') : t('login.googleLoginButton')}</span>
          </button>

          <p className="qz-caption text-center mt-8">
            Bằng cách đăng nhập, bạn đồng ý với điều khoản sử dụng.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
