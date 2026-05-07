import React, { useEffect, useRef, useState, useCallback, useMemo, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LucideIcon,
  LayoutDashboard,
  LogOut,
  BookMarked,
  FlaskConical,
  Users,
  Languages,
  Check,
  User,
  X,
} from 'lucide-react';
import ToggleButton from '~/shared/components/ui/ToggleButton';
import TokenService from '~/shared/services/StorageService';
import PermissionService from '~/shared/services/PermissionService';
import StudentProfileModal from '~/features/user/components/UserComponent';

interface MenuItem {
  to: string;
  icon: LucideIcon;
  label: string;
  permissions?: string[];
}

interface RightBarProps {
  isOpen: boolean;
  toggle: () => void;
}

const sidebarStyle: React.CSSProperties = {
  boxShadow: '-8px 0 32px 0 rgba(40, 46, 62, 0.12)',
};

const languageOptions = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

const Rightbar: FC<RightBarProps> = ({ isOpen, toggle }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLanguageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const rightbarRef = useRef<HTMLDivElement | null>(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const menuItems: MenuItem[] = useMemo(
    () => [
      { to: '/dashboard', icon: LayoutDashboard, label: t('leftbar.dashboard') },
      { to: '/manage-class', icon: BookMarked, label: t('leftbar.manageClass'), permissions: ['TEACHER', 'ADMIN'] },
      { to: '/manage-test', icon: FlaskConical, label: t('leftbar.manageTest'), permissions: ['TEACHER', 'ADMIN'] },
      { to: '/manage-question', icon: FlaskConical, label: t('leftbar.manageQuestions'), permissions: ['TEACHER', 'ADMIN'] },
      { to: '/manage-users', icon: Users, label: t('leftbar.manageUser'), permissions: ['ADMIN'] },
    ],
    [t],
  );

  const visibleMenuItems = useMemo(
    () =>
      menuItems.filter((item) => {
        if (!item.permissions) return true;
        return PermissionService.hasAny(item.permissions);
      }),
    [menuItems],
  );

  const toggleLanguageDropdown = useCallback(() => setLanguageDropdownOpen((prev) => !prev), []);

  const changeLanguage = useCallback(
    (lng: string) => {
      i18n.changeLanguage(lng);
      setLanguageDropdownOpen(false);
    },
    [i18n],
  );

  const openProfileModal = useCallback(() => {
    setProfileOpen(true);
    toggle();
  }, [toggle]);

  const closeProfileModal = useCallback(() => setProfileOpen(false), []);
  const showModal = useCallback(() => setIsModalVisible(true), []);
  const handleCancel = useCallback(() => setIsModalVisible(false), []);

  const handleOk = useCallback(() => {
    TokenService.logout();
    setIsModalVisible(false);
    toggle();
    navigate('/login');
  }, [toggle, navigate]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (isOpenRef.current && rightbarRef.current && !rightbarRef.current.contains(event.target as Node)) {
        toggle();
      }
    },
    [toggle],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[var(--qz-ink)]/30 backdrop-blur-sm z-40 animate-fadeIn"
          aria-hidden
        />
      )}

      <aside
        ref={rightbarRef}
        style={sidebarStyle}
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <StudentProfileModal open={isProfileOpen} onClose={closeProfileModal} onSuccess={closeProfileModal} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--qz-border)]">
          <p className="text-sm font-bold text-[var(--qz-ink)]">Menu</p>
          <ToggleButton onClickButton={toggle} />
        </div>

        {/* Menu */}
        <nav className="px-3 py-4">
          <ul className="space-y-1">
            {visibleMenuItems.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
              return (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={toggle}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[var(--qz-violet)] text-white shadow-[var(--qz-shadow-focus)]'
                        : 'text-[var(--qz-ink)] hover:bg-[var(--qz-violet-soft)] hover:text-[var(--qz-violet-dark)]'
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}

            {/* Profile */}
            <li>
              <button
                onClick={openProfileModal}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-[var(--qz-ink)] hover:bg-[var(--qz-violet-soft)] hover:text-[var(--qz-violet-dark)] transition"
              >
                <User className="w-[18px] h-[18px]" />
                <span>Hồ sơ cá nhân</span>
              </button>
            </li>
          </ul>

          {/* Divider */}
          <div className="h-px bg-[var(--qz-border)] my-4" />

          {/* Language */}
          <div className="px-1 relative">
            <button
              onClick={toggleLanguageDropdown}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--qz-slate)] hover:bg-[var(--qz-bg)] transition"
            >
              <span className="flex items-center gap-3">
                <Languages className="w-[18px] h-[18px]" />
                {t('language')}
              </span>
              <span className="text-xs">
                {languageOptions.find((l) => l.code === i18n.language)?.flag ?? '🌐'}
              </span>
            </button>

            {isLanguageDropdownOpen && (
              <div className="mt-2 rounded-lg border border-[var(--qz-border)] bg-white shadow-[var(--qz-shadow-card)] overflow-hidden animate-slideUp">
                {languageOptions.map(({ code, label, flag }) => (
                  <button
                    key={code}
                    onClick={() => changeLanguage(code)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[var(--qz-ink)] hover:bg-[var(--qz-bg)] transition"
                  >
                    <span className="flex items-center gap-2">
                      <span>{flag}</span>
                      {label}
                    </span>
                    {i18n.language === code && <Check className="w-4 h-4 text-[var(--qz-violet)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-5 left-5 right-5">
          <button
            onClick={showModal}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[200px] bg-[#fef2f2] hover:bg-[#fee2e2] text-[var(--qz-danger)] font-bold text-sm transition"
          >
            <LogOut className="w-4 h-4" />
            {t('leftbar.logout')}
          </button>
        </div>
      </aside>

      {/* Logout confirm modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-[var(--qz-ink)]/40 backdrop-blur-sm flex items-center justify-center z-[60] animate-fadeIn">
          <div className="qz-card p-6 w-[90%] max-w-sm animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-[#fee2e2] flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-5 h-5 text-[var(--qz-danger)]" />
            </div>
            <h3 className="qz-h3 text-center mb-2">{t('leftbar.logout_confirm_title')}</h3>
            <p className="qz-caption text-center mb-6">{t('leftbar.logout_comfirm')}</p>
            <div className="flex gap-3">
              <button onClick={handleCancel} className="qz-btn qz-btn-secondary flex-1">
                {t('no')}
              </button>
              <button onClick={handleOk} className="qz-btn qz-btn-primary flex-1">
                {t('yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Rightbar;
