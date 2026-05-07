import { useState, useEffect, ChangeEvent } from 'react';
import { TestFormData } from '../ManageTestModal';

interface TestScheduleFormProps {
  // formData: {
  //   start_time: string;
  //   end_time: string;
  //   duration_minutes: number;
  // };
  // setFormData: React.Dispatch<
  //   React.SetStateAction<{
  //     start_time: string;
  //     end_time: string;
  //     duration_minutes: number;
  //   }>
  // >;
  formData: TestFormData;
  setFormData: React.Dispatch<React.SetStateAction<TestFormData>>;
}

// Helper: ISO string → datetime-local string
function formatDateForInput(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
}

// Helper: Add duration to start → return end_time ISO string
function calculateEndTime(startTime: string, duration: number): string {
  if (!startTime || !duration) return '';
  const date = new Date(startTime);
  date.setMinutes(date.getMinutes() + Number(duration));
  return date.toISOString();
}

export default function TestScheduleForm({ formData, setFormData }: TestScheduleFormProps) {
  const [autoCalculateEnd, setAutoCalculateEnd] = useState<boolean | null>(null);

  useEffect(() => {
    if (autoCalculateEnd && formData.start_time && formData.duration_minutes) {
      const calculated = calculateEndTime(formData.start_time, formData.duration_minutes);
      setFormData((prev) => ({ ...prev, end_time: calculated }));
    }

    // Optional: xác định tự động khi end_time khớp
    if (formData.start_time && formData.duration_minutes && formData.end_time) {
      const calculated = calculateEndTime(formData.start_time, formData.duration_minutes);
      if (formatDateForInput(calculated) === formatDateForInput(formData.end_time)) {
        setAutoCalculateEnd(true);
      }
    }
  }, [formData.start_time, formData.duration_minutes, autoCalculateEnd]);

  return (
    <>
      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
        <input
          type="number"
          min={1}
          value={formData.duration_minutes}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFormData({
              ...formData,
              duration_minutes: Number(e.target.value),
            })
          }
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      {/* Schedule Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Schedule Type</label>
        <select
          value={autoCalculateEnd ? 'auto' : 'manual'}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setAutoCalculateEnd(e.target.value === 'auto')
          }
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        >
          <option value="auto">Start Time ➝ Duration ➝ Auto End Time</option>
          <option value="manual">Start Time ➝ End Time</option>
        </select>
      </div>

      {/* Start Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Start Time</label>
        <input
          type="datetime-local"
          value={formatDateForInput(formData.start_time)}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, start_time: e.target.value })
          }
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      {/* End Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700">End Time</label>
        <input
          type="datetime-local"
          value={formatDateForInput(formData.end_time)}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, end_time: e.target.value })
          }
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          disabled={autoCalculateEnd || false}
        />
      </div>
    </>
  );
}
