'use client';

import { useEffect, useState, ChangeEvent } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

type Status = 'idle' | 'checking' | 'available' | 'taken';

export default function NicknameInput({ value, onChange }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    const allowed = /^[a-zA-Z0-9._-가-힣]*$/;
    if (allowed.test(next)) {
      onChange(next);
    }
  };

  useEffect(() => {
    if (!value) {
      setStatus('idle');
      setMessage('');
      return;
    }

    setStatus('checking');
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/auth/check-nickname?value=${encodeURIComponent(value)}`,
        );
        const data = await res.json();
        if (res.ok && data.available) {
          setStatus('available');
          setMessage('사용 가능');
        } else {
          setStatus('taken');
          setMessage(data.message || '이미 사용 중');
        }
      } catch (e) {
        setStatus('taken');
        setMessage('server error');
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [value]);

  const borderClass =
    status === 'checking'
      ? 'border-yellow-500'
      : status === 'available'
      ? 'border-green-500'
      : status === 'taken'
      ? 'border-red-500'
      : 'border-gray-300';

  return (
    <div className="space-y-1">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className={`border p-2 rounded w-full ${borderClass}`}
      />
      {status === 'checking' && (
        <p className="text-sm text-gray-500">확인 중…</p>
      )}
      {status === 'available' && (
        <p className="text-sm text-green-500">사용 가능</p>
      )}
      {status === 'taken' && (
        <p className="text-sm text-red-500">{message || '이미 사용 중'}</p>
      )}
    </div>
  );
}

