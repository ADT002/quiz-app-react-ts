import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '~/app/config';
import { apiCallPost, apiCallGet, apiCallDelete, apiCallPatch } from '~/shared/services/apiCallService';
import { useTranslation } from 'react-i18next';

type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  permission: string[];
  created_at: string;
};

const UserManager: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'TEACHER' | 'STUDENT'>('STUDENT');

  // 🔹 Load users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiCallGet<User[]>(API_ENDPOINTS.USER, {}, navigate);

      // ❌ Loại bỏ user có ADMIN
      const filteredUsers = (res || []).filter(
        (u) => !u.permission?.includes('ADMIN')
      );

      setUsers(filteredUsers);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchUsers();

  }, []);

  // 🔹 Delete user (demo)
  const handleDelete = async (userId: string) => {
    if (!window.confirm(t('Are you sure you want to delete this user?'))) return;

    try {
      await apiCallDelete(API_ENDPOINTS.USER, { userId });
      fetchUsers();
    } catch {
      alert(t('Delete failed'));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          {t('User Management')}
        </h1>


      </div>

      {loading && <p>{t('Loading...')}</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && users.length === 0 && (
        <p>{t('No users found')}</p>
      )}

      {!loading && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">#</th>
                <th className="p-3 border">{t('Email')}</th>
                <th className="p-3 border">{t('Full Name')}</th>
                <th className="p-3 border">{t('Permission')}</th>
                <th className="p-3 border">{t('Created At')}</th>
                <th className="p-3 border">{t('Action')}</th>
              </tr>
            </thead>
            <tbody>
              {users && users.map((u, index) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-3 border text-center">
                    {index + 1}
                  </td>
                  <td className="p-3 border">{u.email}</td>
                  <td className="p-3 border">
                    {u.last_name} {u.first_name}
                  </td>
                  <td className="p-3 border">
                    <div className="flex gap-2 flex-wrap">
                      {(u.permission || []).map((p) => (
                        <span
                          key={p}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 border">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 border text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded"
                        onClick={() => {
                          setEditingUser(u);
                          setSelectedRole(
                            u.permission?.includes('TEACHER') ? 'TEACHER' : 'STUDENT'
                          );
                        }}
                      >
                        {t('Edit')}
                      </button>

                      <button
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                        onClick={() => handleDelete(u.id)}
                      >
                        {t('Delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {editingUser && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm">
                <h3 className="text-lg font-semibold mb-4">
                  {t('Update User Role')}
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={selectedRole === 'TEACHER'}
                      onChange={() => setSelectedRole('TEACHER')}
                    />
                    <span>{t('Teacher')}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={selectedRole === 'STUDENT'}
                      onChange={() => setSelectedRole('STUDENT')}
                    />
                    <span>{t('Student')}</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    className="px-4 py-2 rounded bg-gray-200"
                    onClick={() => setEditingUser(null)}
                  >
                    {t('Cancel')}
                  </button>

                  <button
                    className="px-4 py-2 rounded bg-blue-600 text-white"
                    onClick={async () => {
                      try {

                        await apiCallPatch(API_ENDPOINTS.USER, {
                          ...editingUser,
                          permission: [selectedRole],
                        });

                        setEditingUser(null);
                        fetchUsers();
                      } catch {
                        alert(t('Update failed'));
                      }
                    }}
                  >
                    {t('Save')}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default UserManager;
