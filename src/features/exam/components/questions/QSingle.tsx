import type { PublicQuestion, SingleAnswer } from '../../types';
import { renderText } from '../../utils/renderText';
import FileViewer from '~/shared/components/common/FileViewer';

interface Props {
  question: PublicQuestion;
  answer: SingleAnswer | undefined;
  onChange: (a: SingleAnswer) => void;
}

export function QSingle({ question, answer, onChange }: Props) {
  const selected = answer?.selected_id ?? '';
  return (
    <div className="space-y-2">
      {(question.options ?? []).map((opt) => {
        const checked = selected === opt.id;
        return (
          <label
            key={opt.id}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
              checked
                ? 'border-[var(--qz-violet)] bg-[var(--qz-violet-soft)]'
                : 'border-[var(--qz-border)] hover:border-[var(--qz-violet)]'
            }`}
          >
            <input
              type="radio"
              name={`q-${question._id}`}
              value={opt.id}
              checked={checked}
              onChange={() =>
                onChange({
                  question_id: question._id,
                  type: 'single',
                  selected_id: opt.id,
                })
              }
              className="accent-[var(--qz-violet)]"
            />
            <span className="qz-body flex-1">{renderText(opt.text)}</span>
            {opt.file_id && (
              <FileViewer fileId={opt.file_id} className="max-h-20 rounded" />
            )}
          </label>
        );
      })}
    </div>
  );
}
