// components/AuthGuard.jsx
'use client';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (status === 'unauthenticated' && !isPublic) {
      router.push('/login');
    }
  }, [status, isPublic, router]);

  if (status === 'loading' || isPublic) {
    return <div>Loading...</div>;
  }

  return children;
}

