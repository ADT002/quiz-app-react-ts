import React, { useState } from "react";

export default function SelectQuestions({
  formData,
  setFormData,
  questions,
  // onLoadMore, // Hàm load thêm, truyền từ component cha (nếu có)
}) {
  const [tagFilter, setTagFilter] = useState("");

  const handleSelectChange = (questionId, checked) => {
    if (checked) {
      setFormData({
        ...formData,
        question_ids: [...formData.question_ids, questionId],
      });
    } else {
      setFormData({
        ...formData,
        question_ids: formData.question_ids.filter((id) => id !== questionId),
      });
    }
  };

  const handleTagFilterChange = (e) => {
    setTagFilter(e.target.value);
  };

  const onLoadMore = () => { };

  // Lấy toàn bộ câu hỏi từ object (làm phẳng)
  const allQuestions = Object.values(questions).flat();

  // Lọc câu hỏi theo tag nếu có giá trị filter
  const filteredQuestions = tagFilter
    ? allQuestions.filter((q) =>
      q.tags.some((tag) =>
        tag.toLowerCase().includes(tagFilter.toLowerCase())
      )
    )
    : allQuestions;

  return (
    <div className="space-y-4">
      {/* Input lọc theo tag */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Filter by tag..."
          value={tagFilter}
          onChange={handleTagFilterChange}
          className="border p-2 rounded-md"
        />
      </div>

      {/* Danh sách câu hỏi */}
      <div className="space-y-2">
        {filteredQuestions.map((q) => (
          <div key={q.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.question_ids.includes(q.id)}
              onChange={(e) => handleSelectChange(q.id, e.target.checked)}
            />
            <span className="text-sm">
              {q.question_content.text || q.question_text}{" "}
              <span className="text-xs text-gray-500">
                [{q.tags.join(", ")}]
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Nút Load More (nếu có hàm onLoadMore truyền vào) */}
      {
        <div>
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Load More
          </button>
        </div>
      }
    </div>
  );
}
