'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BeautyLabLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'facial-massage') {
      router.replace('/beauty/facial-massage');
    }
  }, [router]);

  return children;
}
