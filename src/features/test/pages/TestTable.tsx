import {
  Pencil,
  Tag,
  Clock,
  Calendar,
  HelpCircle,
  CheckCircle,
  Lock,
} from "lucide-react"
import { TestFormData } from "./ManageTestModal"

type Props = {
  tests: TestFormData[]
  onEdit: (test: TestFormData) => void
  onFilterByTag: (tag: string) => void
}

export default function TestCardList({
  tests,
  onEdit,
  onFilterByTag,
}: Props) {
  if (tests.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        Không có bài kiểm tra nào
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {tests.map((test) => {
        const now = new Date()
        const start = test.start_time ? new Date(test.start_time) : null
        const end = test.end_time ? new Date(test.end_time) : null

        let statusLabel = "Nháp"
        let statusColor = "bg-gray-100 text-gray-700"
        let StatusIcon = HelpCircle

        if (start && end) {
          if (now < start) {
            statusLabel = "Chưa mở"
            statusColor = "bg-yellow-100 text-yellow-700"
          } else if (now > end) {
            statusLabel = "Đã đóng"
            statusColor = "bg-red-100 text-red-700"
            StatusIcon = Lock
          } else {
            statusLabel = "Đang mở"
            statusColor = "bg-green-100 text-green-700"
            StatusIcon = CheckCircle
          }
        }

        return (
          <div
            key={test._id}
            onClick={() => onEdit(test)}
            className="
              bg-white border rounded-xl p-5
              shadow-sm hover:scale-105 transition
              flex flex-col gap-3
              group
            "
          >
            {/* ===== HEADER ===== */}
            <div className="flex justify-between items-start">
              <h3 className="text-base font-semibold text-gray-800 line-clamp-2">
                {test.test_name}
              </h3>
            </div>

            {/* ===== DESCRIPTION ===== */}
            {test.descript && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {test.descript}
              </p>
            )}

            {/* ===== INFO ROW ===== */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                {test.duration_minutes} phút
              </div>

              <div className="flex items-center gap-1">
                <HelpCircle size={14} />
                {test.question_ids?.length ?? 0} câu
              </div>
            </div>

            {/* ===== TIME ===== */}
            {(start || end) && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={14} />
                <span>
                  {start ? start.toLocaleString() : "—"} →{" "}
                  {end ? end.toLocaleString() : "—"}
                </span>
              </div>
            )}

            {/* ===== TAGS ===== */}
            {test.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {test.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onFilterByTag(tag)}
                    className="
                      inline-flex items-center gap-1
                      px-2 py-1 text-xs
                      rounded-full
                      bg-blue-50 text-blue-700
                      hover:bg-blue-100
                    "
                  >
                    <Tag size={12} />
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* ===== FOOTER ===== */}
            <div className="mt-2 flex justify-between items-center">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusColor}`}
              >
                <StatusIcon size={12} />
                {statusLabel}
              </span>

              <span className="text-xs text-gray-400">
                Điểm tối đa: {test.test_score}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
