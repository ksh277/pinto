'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Product } from '../../types/db';

interface Props {
  sectionType: 'reviews' | 'community' | 'recommendations';
  category?: string;
}

export default function HomeProducts({ sectionType, category }: Props) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ limit: '6' });
    if (category) params.set('category', category);
    fetch(`/api/products?${params.toString()}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('network');
        return res.json();
      })
      .then((data) => {
        setItems(data.items || []);
      })
      .catch(() => {
        setError('Failed to load products');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [category]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-40 rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 space-y-2">
        <p>아직 등록된 상품이 없어요</p>
        <Link href="/products/new" className="text-blue-500 underline">상품 등록하기</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(p => (
          <div key={p.id} className="border rounded overflow-hidden">
            {p.thumbnail_url && (
              <img src={p.thumbnail_url} alt={p.name} className="w-full h-40 object-cover" />
            )}
            <div className="p-2">
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-gray-500">{p.price.toLocaleString()}원</p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-right mt-2">
        <Link href="/products" className="text-sm text-blue-500 underline">더보기</Link>
      </div>
    </div>
  );
}

