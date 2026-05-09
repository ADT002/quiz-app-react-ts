import { CircleFadingPlus, QrCode } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { createCode } from '~/features/class/classSlice';
import { getCookieValue, isCookieExpired } from '~/shared/services/cookieHelper';

type CodeEntryStored = {
  code: string;
  expiresAt: string; // ISO string
};

interface ClassCodeComponentProps {
  id: string;
  test_id: string[];
}


interface CodeEntry {
  code: string;
  expiresAt: Date;
}


const ClassCodeComponent: React.FC<ClassCodeComponentProps> = ({ id, test_id }) => {
  console.log(id)
  const [cookies, setCookie] = useCookies(['classIds']);
  console.log(cookies)
  const setClassIdsCookie = useCallback(
    (value: unknown) => {
      setCookie('classIds', value, { path: '/' });
    },
    [setCookie],
  );

  const [classCode, setClassCode] = useState<string | null>(null);
  const [expiryMinutes, setExpiryMinutes] = useState<number>(5);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const getExpirationDate = (minutes: number): Date => new Date(Date.now() + minutes * 60 * 1000);

  const handleGenerateCode = useCallback(async () => {
    try {
      const response = await createCode({
        class_id: id,
        minute: expiryMinutes,
      });

      const expirationTime = getExpirationDate(expiryMinutes);

      setClassCode(response);
      setExpiresAt(expirationTime);

      alert(`Class code generated: ${response}`);
      return { code: response, expiresAt: expirationTime };
    } catch (error) {
      console.error('Error generating class code:', error);
      alert('Failed to generate class code.');
      return null;
    }
  }, [id, expiryMinutes, test_id]);

  const updateCookieWithCode = useCallback(
    (entry: CodeEntry) => {
      const storedEntry: CodeEntryStored = {
        code: entry.code,
        expiresAt: entry.expiresAt.toISOString(),
      };

      const newCodeEntry: Record<string, CodeEntryStored> = { [id]: storedEntry };
      const classIds: Record<string, CodeEntryStored>[] =
        (getCookieValue(cookies, 'classIds') as unknown as Record<string, CodeEntryStored>[] | null) || [];




      const existingIndex = classIds.findIndex((item) => Object.keys(item)[0] === id);

      if (existingIndex > -1) {
        classIds[existingIndex] = newCodeEntry;
      } else {
        classIds.push(newCodeEntry);
      }

      setClassIdsCookie(classIds);

    },
    [id, cookies, setCookie, setClassIdsCookie],

  );

  const generateCodeAndSave = useCallback(async () => {
    const result = await handleGenerateCode();
    if (result) updateCookieWithCode(result);
  }, [handleGenerateCode, updateCookieWithCode]);

  useEffect(() => {
    const classIds: Record<string, CodeEntryStored>[] =
      getCookieValue(cookies, 'classIds') as Record<string, CodeEntryStored>[] | null || [];




    const currentEntry = classIds.find((item) => Object.keys(item)[0] === id);

    if (currentEntry) {
      const { code, expiresAt } = currentEntry[id];
      const expireDate = new Date(expiresAt);


      if (isCookieExpired(expireDate)) {
        alert('Class code has expired. Please generate a new one.');
        const updatedClassIds = classIds.filter((item) => Object.keys(item)[0] !== id);
        setClassIdsCookie(updatedClassIds);

      } else {
        setClassCode(code);
        setExpiresAt(expireDate);
      }
    }
  }, [id, cookies, setCookie]);

  const copyToClipboard = () => {
    if (classCode) {
      navigator.clipboard.writeText(classCode);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
      <h4 className="text-lg font-semibold text-gray-800 mb-4"><QrCode /></h4>

      {classCode ? (
        <div className="space-y-3">
          <input
            type="text"
            value={classCode}
            readOnly
            onClick={copyToClipboard}
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-pointer"
            title="Click to copy"
          />
          {expiresAt && (
            <p className="text-sm text-gray-600">Expires at: {expiresAt.toLocaleString()}</p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <select
            value={expiryMinutes}
            onChange={(e) => setExpiryMinutes(Number(e.target.value))}
            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            <option value={1}>1 minute</option>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
          </select>
          <button
            onClick={generateCodeAndSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
          >
            <CircleFadingPlus />
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassCodeComponent;
