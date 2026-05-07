import React from 'react';
import './ToggleButton.scss';

interface ToggleButtonProps {
  onClickButton: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ onClickButton }) => {
  return (
    <div className="button-navigate">
      <button className="toggle-btn" onClick={onClickButton}>
        <svg
          className="w-10 h-10 pt-1 text-blue-800 dark:text-blue"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 16 20"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M1 17V2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M5 15V1m8 18v-4"
          />
        </svg>
      </button>
    </div>
  );
};

export default ToggleButton;
