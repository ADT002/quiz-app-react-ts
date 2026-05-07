import { FileText, Info, Tag, Users } from "lucide-react";
import { ClassFormData } from "../ManageClass";

const TAB_CONFIG = {
    'class-info': {
        icon: <Info size={18} />,
        label: 'Thông tin',
    },
    tests: {
        icon: <FileText size={18} />,
        label: 'Bài kiểm tra',
    },
    tags: {
        icon: <Tag size={18} />,
        label: 'Tags',
    },
    students: {
        icon: <Users size={18} />,
        label: 'Học sinh',
    },
} as const;

type TabKey = keyof typeof TAB_CONFIG;

type ClassTabsProps = {
    activeTab: TabKey;
    setActiveTab: (tab: TabKey) => void;
    formData: ClassFormData;
};

export function ClassTabs({
    activeTab,
    setActiveTab,
    formData,
}: ClassTabsProps) {

    return (
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
            {(Object.keys(TAB_CONFIG) as TabKey[]).map((tab) => {
                const isActive = activeTab === tab;

                const badge =
                    tab === 'tests'
                        ? formData.test && formData.test.length
                        : tab === 'tags'
                            ? formData.tags.length
                            : tab === 'students'
                                ? formData.students_accept.length
                                : 0;

                return (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
              relative flex items-center gap-2
              px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${isActive
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:bg-white/70'
                            }
            `}
                    >
                        {TAB_CONFIG[tab].icon}

                        <span className="hidden sm:inline">
                            {TAB_CONFIG[tab].label}
                        </span>

                        {badge > 0 && (
                            <span
                                className={`
                  ml-1 text-xs px-2 py-0.5 rounded-full
                  ${isActive
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-200 text-gray-700'
                                    }
                `}
                            >
                                {badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
