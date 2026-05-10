import { useState } from 'react';
import { Copy, RefreshCcw } from 'lucide-react';
import { useGenerateInviteCode } from '../hooks/useClasses';

interface Props {
  classId: string;
}

/**
 * Teacher-side widget. Bấm "Tạo mã" → BE lưu Redis TTL 24h → trả code.
 * Code chỉ hiển thị 1 lần ở đây + clipboard button. Spec F3 mục Mã mời.
 */
export function InviteCodeCard({ classId }: Props) {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const gen = useGenerateInviteCode();

  const generate = async () => {
    setCopied(false);
    const c = await gen.mutateAsync({ classId, minute: 24 * 60 });
    setCode(c);
  };

  const copy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="qz-card p-4 bg-[var(--qz-violet-soft)]">
      <p className="qz-caption text-[var(--qz-slate)]">Mã mời học sinh</p>
      {code ? (
        <div className="flex items-center gap-3 mt-2">
          <code className="text-3xl font-mono font-bold tracking-widest text-[var(--qz-violet-dark)]">
            {code}
          </code>
          <button
            type="button"
            onClick={copy}
            className="qz-btn qz-btn-secondary"
          >
            <Copy size={14} />
            {copied ? 'Đã copy' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={generate}
            className="qz-btn qz-btn-ghost"
            disabled={gen.isPending}
            aria-label="Tạo mã mới"
          >
            <RefreshCcw size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={generate}
          disabled={gen.isPending}
          className="qz-btn qz-btn-primary mt-2"
        >
          {gen.isPending ? 'Đang tạo...' : 'Tạo mã mời (24h)'}
        </button>
      )}
      {code && (
        <p className="qz-caption text-[var(--qz-slate)] mt-2">
          Mã hết hạn sau 24 giờ. Học sinh nhập mã ở "Tham gia lớp".
        </p>
      )}
    </div>
  );
}
