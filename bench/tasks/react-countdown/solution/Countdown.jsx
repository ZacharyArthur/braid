import { useEffect, useState } from 'react';

export default function Countdown({ seconds }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return <span>{left}</span>;
}
