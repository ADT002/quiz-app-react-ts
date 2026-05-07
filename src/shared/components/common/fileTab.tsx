// components/files/FileTabs.tsx

import { FileTab } from "~/shared/types/file/fileTab";

type Props = {
    active: FileTab
    onChange: (tab: FileTab) => void
}

const tabs: { key: FileTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "image", label: "Images" },
    { key: "video", label: "Videos" },
    { key: "audio", label: "Audios" },
    { key: "document", label: "Documents" },
]

export default function FileTabs({ active, onChange }: Props) {
    return (
        <div className="flex gap-2 mb-4">
            {tabs.map(tab => (
                <button
                    type="button"
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={`px-3 py-1 rounded text-sm
                        ${active === tab.key
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
