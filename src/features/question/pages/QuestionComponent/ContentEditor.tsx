import { FC } from 'react';
import Latex from 'react-latex-next';

const MATH_BUTTONS = [
    { label: 'x²', value: 'x^2' },
    { label: '√', value: '\\sqrt{}' },
    { label: '∫', value: '\\int' },
    { label: '∑', value: '\\sum' },
    { label: '∞', value: '\\infty' },
    { label: 'π', value: '\\pi' },
    { label: '≤', value: '\\le' },
    { label: '≥', value: '\\ge' },
    { label: '≠', value: '\\neq' },
    { label: 'Phân số', value: '\\frac{}{}' },
];

export const RenderText = ({ text }: { text?: { text?: string; is_math: boolean } }) => {
    if (!text?.text) return null;

    return text.is_math ? (
        <Latex>{`$${text.text}$`}</Latex>
    ) : (
        <span>{text.text}</span>
    );
};


interface ContentEditorProps {
    value: string;
    isMath: boolean;
    onChangeValue: (value: string) => void;
    onChangeIsMath: (isMath: boolean) => void;
    label?: string;
}

const ContentEditor: FC<ContentEditorProps> = ({
    value,
    isMath,
    onChangeValue,
    onChangeIsMath,
    label = 'Nội dung',
}) => {
    const insertLatex = (latex: string) => {
        onChangeValue(value + latex);
    };

    return (
        <div className="space-y-3">
            {/* Header + Toggle */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>

                <button
                    type="button"
                    onClick={() => onChangeIsMath(!isMath)}
                    className={`px-2 py-1 text-xs rounded border transition
            ${isMath
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-100 text-gray-600 border-gray-300'
                        }`}
                >
                    {isMath ? 'Toán (LaTeX)' : 'Text'}
                </button>
            </div>

            {/* Toolbar Math */}
            {isMath && (
                <div className="flex flex-wrap gap-2 border rounded-md p-2 bg-gray-50">
                    {MATH_BUTTONS.map(btn => (
                        <button
                            key={btn.label}
                            type="button"
                            onClick={() => insertLatex(btn.value)}
                            className="px-2 py-1 text-xs bg-white border rounded hover:bg-blue-50"
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Textarea */}
            <textarea
                value={value}
                onChange={e => onChangeValue(e.target.value)}
                className="block w-full border border-gray-300 rounded-md p-2 h-28 resize-y"
                placeholder={
                    isMath
                        ? 'Nhập LaTeX, ví dụ: x^2 + \\frac{1}{2}'
                        : 'Nhập nội dung tại đây...'
                }
                required
            />

            {/* Preview */}
            {isMath && value && (
                <div className="border rounded-md p-3 bg-white">
                    <p className="text-xs text-gray-500 mb-1">Xem trước:</p>
                    <div className="text-lg">
                        <Latex>{`$${value}$`}</Latex>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentEditor;
