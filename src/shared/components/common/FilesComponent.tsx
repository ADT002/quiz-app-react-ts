import { useEffect, useState } from 'react';
import { fileApi, type FileMeta } from '~/shared/services/fileApi';
import FileViewer from './FileViewer';
import UploadFile from './UploadComponent';

type FileTab = 'all' | 'image' | 'audio' | 'video';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Returns the chosen file's metadata (most importantly `file_id`). */
  onSelect: (file: FileMeta) => void;
}

const TABS: Array<{ key: FileTab; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'image', label: 'Hình ảnh' },
  { key: 'audio', label: 'Âm thanh' },
  { key: 'video', label: 'Video' },
];

const AllFileComponent: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [tab, setTab] = useState<FileTab>('all');
  const [loading, setLoading] = useState(true);

  const load = async (t: FileTab) => {
    setLoading(true);
    try {
      const res = await fileApi.list({
        type: t === 'all' ? undefined : t,
        page: 1,
        limit: 50,
      });
      setFiles(res.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) void load(tab);
  }, [isOpen, tab]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--qz-ink)]/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="qz-card w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col animate-scaleIn">
        <header className="px-5 py-4 border-b border-[var(--qz-border)] flex justify-between items-center">
          <h2 className="qz-h2">Chọn file</h2>
          <button
            type="button"
            onClick={onClose}
            className="qz-btn qz-btn-ghost"
            aria-label="Đóng"
          >
            ✕
          </button>
        </header>

        <div className="px-5 py-4 border-b border-[var(--qz-border)] space-y-3">
          <UploadFile onUploaded={(f) => setFiles((prev) => [f, ...prev])} />
          <div className="flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`qz-pill ${tab === t.key ? 'qz-pill-success' : 'qz-pill-muted'}`}
                aria-pressed={tab === t.key}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="qz-spinner" />
            </div>
          ) : files.length === 0 ? (
            <p className="text-center text-[var(--qz-slate)] py-8">
              Không có file trong mục này
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {files.map((f) => (
                <button
                  key={f.file_id}
                  type="button"
                  onClick={() => {
                    onSelect(f);
                    onClose();
                  }}
                  className="text-left border border-[var(--qz-border)] rounded-lg p-2 hover:ring-2 hover:ring-[var(--qz-violet)] transition"
                >
                  <FileViewer
                    fileId={f.file_id}
                    contentType={f.content_type}
                    filename={f.filename}
                    className="max-h-40 mx-auto rounded"
                  />
                  <div className="mt-2 text-sm text-[var(--qz-slate)] truncate">
                    {f.filename}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <footer className="px-5 py-3 border-t border-[var(--qz-border)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="qz-btn qz-btn-secondary"
          >
            Đóng
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AllFileComponent;
