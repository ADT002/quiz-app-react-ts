'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { apiCallGet, apiCallPut } from '~/shared/services/apiCallService';
import API_ENDPOINTS from '~/app/config';
import { useModalBehavior } from '~/shared/hooks/useModalBehavior';

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface UserProfile {
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
}

const StudentProfileModal = ({ open, onClose, onSuccess }: Props) => {
    const [form, setForm] = useState<UserProfile>({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const modalRef = useRef<HTMLDivElement>(null);

    // ===== Modal behavior (ESC, click outside, disable scroll)
    const { handleBackdropClick } = useModalBehavior(
        open,
        onClose,
        modalRef
    );

    // =====================
    // Fetch user info
    // =====================
    useEffect(() => {
        if (!open) return;

        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await apiCallGet<UserProfile>(
                    API_ENDPOINTS.USER_ME,
                    navigate
                );

                setForm({
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                    password: '',
                });
            } catch (err: any) {
                setError(err?.message || 'Không thể tải thông tin');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [open, navigate]);

    // =====================
    // Handle input change
    // =====================
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =====================
    // Submit update
    // =====================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError(null);

            const payload = {
                first_name: form.first_name,
                last_name: form.last_name,
                // ...(form.password ? { password: form.password } : {}),
            };

            await apiCallPut(API_ENDPOINTS.USER_ME, payload);

            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err?.message || 'Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    // =====================
    // Portal render
    // =====================
    if (!open) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return createPortal(
        <div
            className="
                fixed inset-0 z-[9999]
                flex items-center justify-center
                bg-black/40 backdrop-blur-sm
                animate-fadeIn
            "
            onMouseDown={handleBackdropClick}
        >
            <div
                ref={modalRef}
                onMouseDown={(e) => e.stopPropagation()}
                className="
                    bg-white rounded-xl
                    w-full max-w-md
                    p-6 relative
                    shadow-xl
                    animate-scaleIn
                "
            >
                <h2 className="text-xl font-semibold mb-4">
                    Chỉnh sửa thông tin
                </h2>

                {loading ? (
                    <p>Đang tải...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}

                        <div>
                            <label className="block text-sm mb-1">Họ</label>
                            <input
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                required
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Tên</label>
                            <input
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                required
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded"
                            >
                                Hủy
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                            >
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>,
        modalRoot
    );
};

export default StudentProfileModal;
