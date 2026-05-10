import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import AllFileComponent from '~/shared/components/common/FilesComponent';
import FileViewer from '~/shared/components/common/FileViewer';
import type { FileMeta } from '~/shared/services/fileApi';

interface Props {
  /** Currently selected file_id, if any. */
  fileId: string | undefined;
  onChange: (fileId: string | undefined) => void;
  label?: string;
}

/**
 * Triggers the FilesComponent modal. On select, calls onChange(file_id).
 * Renders preview via FileViewer (which fetches signed URL by file_id).
 */
export function FilePickerButton({ fileId, onChange, label = 'Đính file' }: Props) {
  const [open, setOpen] = useState(false);

  if (fileId) {
    return (
      <div className="inline-flex items-center gap-2">
        <FileViewer fileId={fileId} className="max-h-12 rounded" />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="qz-btn qz-btn-ghost p-1"
          aria-label="Bỏ file"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="qz-btn qz-btn-ghost"
      >
        <ImagePlus size={16} />
        <span>{label}</span>
      </button>
      <AllFileComponent
        isOpen={open}
        onClose={() => setOpen(false)}
        onSelect={(f: FileMeta) => onChange(f.file_id)}
      />
    </>
  );
}
