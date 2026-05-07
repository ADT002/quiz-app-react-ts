import Latex from 'react-latex-next';

interface QuestionTooltipProps {
    text: string;
    isMath?: boolean;
}

export default function QuestionTooltip({ text, isMath }: QuestionTooltipProps) {
    return (
        <div className="relative group max-w-80">
            {/* ONE LINE */}
            <div className="truncate max-w-full">
                {text}
            </div>

            {/* TOOLTIP */}
            <div
                className="
          absolute z-50 hidden group-hover:block
          bg-gray-900 text-white text-sm
          rounded-md p-3 max-w-xl
          shadow-lg
          left-0 top-full mt-2
        "
            >
                {isMath ? (
                    <Latex>{text.includes('$') ? text : `$${text}$`}</Latex>
                ) : (
                    <span className="whitespace-pre-wrap">{text}</span>
                )}
            </div>
        </div>
    );
}
