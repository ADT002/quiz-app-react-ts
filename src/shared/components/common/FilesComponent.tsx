import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API_ENDPOINTS from "~/app/config"
import { apiCallGet } from "~/shared/services/apiCallService"
import FileViewer from "./FileViewer"
import { FileMeta, FileTab } from "~/shared/types/file/fileTab"
import { filterFilesByTab } from "./fileFilter"
import FileTabs from "./fileTab"
import UploadFile from "./UploadComponent"

interface AllFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    select: (fileName: string) => void;
}


interface AllFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    select: (fileName: string) => void;
}

const AllFileComponent: React.FC<AllFileModalProps> = ({
    isOpen,
    onClose,
    select,
}) => {
    const [files, setFiles] = useState<FileMeta[]>([]);
    const [activeTab, setActiveTab] = useState<FileTab>("all");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            fetchAllFiles();
        }
    }, [isOpen]);

    const fetchAllFiles = async () => {
        try {
            setLoading(true);
            const res = await apiCallGet<FileMeta[]>(
                API_ENDPOINTS.ALLFILE,
                navigate
            );
            setFiles(res ?? []);
        } catch (err) {
            console.error("Get all files failed", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredFiles = filterFilesByTab(files, activeTab);

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white w-full max-w-5xl rounded-xl shadow-lg overflow-hidden">
                {/* HEADER */}
                <div className="flex justify-between items-center px-5 py-4 border-b">
                    <h2 className="text-lg font-semibold">📁 Chọn file</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* BODY */}
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <UploadFile />

                    <FileTabs active={activeTab} onChange={setActiveTab} />

                    {loading ? (
                        <div className="text-center text-gray-500">
                            Đang tải file...
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="text-gray-500 text-center">
                            Không có file trong mục này
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    onClick={() => {
                                        select(file.filename);
                                        onClose();
                                    }}
                                    className="cursor-pointer border rounded-lg p-2 shadow-sm hover:ring-2 hover:ring-blue-400 transition"
                                >
                                    <FileViewer
                                        filename={file.filename}
                                        contentType={file.fileType}
                                    />
                                    <div className="mt-2 text-sm text-gray-600 truncate">
                                        {file.filename}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="px-5 py-3 border-t flex justify-end">
                    <button
                        type="button"

                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AllFileComponent;