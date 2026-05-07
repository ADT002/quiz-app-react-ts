import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export default function CollapsibleSection({
    title,
    subtitle,
    children,
    defaultOpen = false,
}: Props) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border rounded-lg">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="
          w-full flex items-center justify-between
          px-4 py-3 bg-gray-50 hover:bg-gray-100
          rounded-lg
        "
            >
                <div className="text-left">
                    <div className="font-semibold text-gray-800">{title}</div>
                    {subtitle && (
                        <div className="text-sm text-gray-500">{subtitle}</div>
                    )}
                </div>
                {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {open && (
                <div className="p-4 border-t bg-white">
                    {children}
                </div>
            )}
        </div>
    );
}
