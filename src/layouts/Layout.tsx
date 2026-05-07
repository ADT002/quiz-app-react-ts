import React, { useState, useEffect, useRef, useCallback } from 'react';
import Topbar from './topbar/Topbar';
import Rightbar from './rightbar/Rightbar';
import { Outlet, useLocation } from 'react-router-dom';
import { useTopbar } from '~/app/TopbarContext';
import './Layout.scss';

// debounce được định nghĩa ngoài component, tránh recreate mỗi render
function debounce<T extends () => void>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (() => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(func, delay);
  }) as T;
}

const Layout: React.FC = () => {
  const [isRightbarOpen, setRightbarOpen] = useState<boolean>(false);
  const prevScrollY = useRef<number>(0);
  const isRightbarOpenRef = useRef<boolean>(false);
  const { isHidden, setIsHidden } = useTopbar();
  const location = useLocation();

  // Dùng ref để tránh stale closure trong scroll handler
  isRightbarOpenRef.current = isRightbarOpen;

  // Không cần isRightbarOpen trong deps vì đọc qua ref
  const toggleRightbar = useCallback(() => {
    setRightbarOpen(prev => !prev);
  }, []);

  useEffect(() => {
    if (location.pathname === '/login') {
      setIsHidden(true);
      return;
    }

    const handleScroll = () => {
      if (isRightbarOpenRef.current) return;

      const currentScrollY = window.scrollY;

      if (currentScrollY > prevScrollY.current + 1) {
        setIsHidden(true);
      } else if (currentScrollY < prevScrollY.current - 1 || currentScrollY === 0) {
        setIsHidden(false);
      }

      prevScrollY.current = currentScrollY;
    };

    const debouncedHandleScroll = debounce(handleScroll, 100);

    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', debouncedHandleScroll);
    // isRightbarOpen được đọc qua ref nên không cần trong deps
  }, [location.pathname, setIsHidden]);

  const isLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--qz-bg)]">
      <Topbar
        isOpen={isRightbarOpen}
        isHidden={isHidden || isRightbarOpen}
        onClickRight={toggleRightbar}
      />
      <Rightbar isOpen={isRightbarOpen} toggle={toggleRightbar} />
      <main className={isLogin ? '' : 'pt-20 pb-12 px-4 md:px-6'}>
        {isLogin ? (
          <Outlet />
        ) : (
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;
