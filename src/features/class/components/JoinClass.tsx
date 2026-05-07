import React, { useState } from 'react';
import API_ENDPOINTS from '~/app/config';
import { apiCallPost } from '~/shared/services/apiCallService';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface JoinClassProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined?: () => void; // optional callback để reload dashboard
}

const JoinClass: React.FC<JoinClassProps> = ({
  isOpen,
  onClose,
  onJoined,
}) => {
  const { t } = useTranslation();
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      setError(t('joinClass.error_empty'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await apiCallPost(
        API_ENDPOINTS.JOIN_CLASS,
        { id: classCode.trim() },
        navigate,
      );

      setSuccess(t('joinClass.success'));
      setClassCode('');

      setTimeout(() => {
        onClose();
        onJoined?.();
      }, 800);
    } catch {
      setError(t('joinClass.error_invalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 animate-fadeIn">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('joinClass.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* INPUT */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-600">
            {t('joinClass.class_code')}
          </label>
          <input
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            placeholder={t('joinClass.placeholder')}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* MESSAGE */}
        {error && (
          <p className="text-red-500 text-sm mt-3">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm mt-3">{success}</p>
        )}

        {/* ACTION */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
          >
            {t('joinClass.cancel')}
          </button>
          <button
            onClick={handleJoinClass}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {t('joinClass.join')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinClass;
