import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import ToggleButton from '~/shared/components/ui/ToggleButton';

interface TopbarProps {
  isOpen: boolean;
  isHidden: boolean;
  onClickRight: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onClickRight, isOpen, isHidden }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <header
      className={`
        fixed top-0 left-0 w-full z-40 h-16
        bg-white/85 backdrop-blur-xl
        border-b border-[var(--qz-border)]
        transition-transform duration-300
        ${isHidden ? '-translate-y-full' : 'translate-y-0'}
      `}
    >
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

        {/* Brand */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 group"
        >
          <img src="/logo.png" className="h-10 w-10" alt="Logo" />
          {!isMobile && (
            <div className="text-left">
              <p className="text-sm font-bold text-[var(--qz-ink)] leading-tight">Quiz Management</p>
              <p className="text-xs text-[var(--qz-slate)] leading-tight">Online Examination System</p>
            </div>
          )}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ToggleButton onClickButton={onClickRight} />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
