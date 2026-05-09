import axios from 'axios';
import API_ENDPOINTS from '~/app/config';
import { UserSubmit } from '~/features/test/pages/ManageTestModal';
import StorageService from '~/shared/services/StorageService';

interface UserSubmitProps {
    classID: string;
    testID: string;
    testName: string;
    userSubmits: UserSubmit[];
    onClose: () => void;
}

const UserSubmitComponent: React.FC<UserSubmitProps> = ({
    classID,
    testID,
    testName,
    userSubmits,
    onClose,
}) => {


    const apiDownloadPDF = async (
        url: string,
        params?: Record<string, any>
    ): Promise<{ blob: Blob; filename: string }> => {

        const res = await axios.get(url, {
            params,
            responseType: 'blob',
            headers: {
                Authorization: `Bearer ${StorageService.getToken()}`,
            },
        });

        // Lấy filename từ header
        const disposition = res.headers['content-disposition'];
        let filename = 'export.pdf';

        if (disposition) {
            const match = disposition.match(/filename="?(.+)"?/);
            if (match?.[1]) filename = match[1];
        }

        return {
            blob: res.data,
            filename,
        };
    };


    const downloadResultPDF = async (
        classID: string,
        testID: string
    ) => {

        try {
            const { blob, filename } = await apiDownloadPDF(
                API_ENDPOINTS.EXPORT_SUBMISSION_PDF,
                {
                    class_id: classID,
                    test_id: testID,
                }
            );

            // Tạo link download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (err: any) {
            console.error(err);
            alert('Không thể tải file PDF');
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">
                        📊 Kết quả bài thi:
                        <span className="ml-2 text-indigo-600">{testName}</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl"
                    >
                        ✕
                    </button>
                    <button
                        onClick={() => downloadResultPDF(classID, testID)}
                        className="px-4 py-2 bg-red-600 text-white rounded"
                    >
                        Xuất PDF kết quả
                    </button>

                </div>

                {/* CONTENT */}
                <div className="p-6 max-h-[420px] overflow-y-auto">
                    {userSubmits.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <span className="text-4xl mb-3">📝</span>
                            <p className="text-sm">Chưa có học sinh nào nộp bài</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-center w-12">#</th>
                                        <th className="px-4 py-3 text-left">Học sinh</th>
                                        <th className="px-4 py-3 text-center w-24">Điểm</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userSubmits.map((u, index) => (
                                        <tr
                                            key={u.user_email}
                                            className="border-t hover:bg-indigo-50 transition"
                                        >
                                            <td className="px-4 py-2 text-center font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className="font-medium text-gray-800">
                                                    {u.user_email}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                                                    {u.score ?? 0}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t flex justify-end bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm rounded-md bg-gray-200 hover:bg-gray-300 transition"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserSubmitComponent;
