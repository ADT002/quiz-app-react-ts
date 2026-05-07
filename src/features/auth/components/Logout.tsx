// src/components/Logout.tsx
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TokenService from '~/shared/services/StorageService';

const Logout: FC = () => {
  const navigate = useNavigate();

  useEffect(() => { }, [navigate]);

  return null; // No UI needed for this component
};

export default Logout;
