import { useState } from "react"
import { Plus, Trash2, Tag } from "lucide-react"

type Props = {
  tags?: string[]
  onAddTag?: (tag: string) => void
  onRemoveTag?: (tag: string) => void
}

export default function TagManagement({
  tags = [],
  onAddTag,
  onRemoveTag,
}: Props) {
  const [newTag, setNewTag] = useState("")

  const handleAdd = () => {
    if (!newTag.trim()) return
    onAddTag?.(newTag.trim())
    setNewTag("")
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Tag size={18} />
          Quản lý thẻ (Tags)
        </h2>
      </div>

      {/* ===== ADD TAG ===== */}
      <div className="flex gap-2">
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Nhập tên tag..."
          className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 flex items-center gap-1"
        >
          <Plus size={16} />
          Thêm
        </button>
      </div>

      {/* ===== TAG LIST ===== */}
      {tags.length === 0 ? (
        <p className="text-sm text-gray-500">Chưa có tag nào</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="
                flex items-center gap-2
                px-3 py-1.5
                bg-blue-50 text-blue-700
                rounded-full text-sm
              "
            >
              <Tag size={14} />
              {tag}

              <button
                onClick={() => onRemoveTag?.(tag)}
                className="hover:text-red-500"
                title="Xóa tag"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
