export const generateObjectId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(
    '',
  );

  return (timestamp + random).substring(0, 24);
};

export const formatDateTime = (value?: string) => {
  if (!value) return '--';
  const d = new Date(value);

  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
