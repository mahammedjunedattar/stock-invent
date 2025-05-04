// components/AuthGuard.jsx
'use client';
import { useSession }     from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect }      from 'react';

export default function AuthGuard({ children }) {
  const { status } = useSession();
  const router     = useRouter();
  const pathname   = usePathname();

  // Define your public routes
  const isPublic = ['/login', '/signup'].includes(pathname);

  // If session is still loading, show loading
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  // If we’re on a public route, just render it
  if (isPublic) {
    return <>{children}</>;
  }

  // At this point, status is either 'authenticated' or 'unauthenticated'
  if (status === 'unauthenticated') {
    // Redirect unauthenticated users from protected routes
    useEffect(() => {
      router.push('/login');
    }, [router]);
    return null;
  }

  // Authenticated and not loading → render protected content
  return <>{children}</>;
}


