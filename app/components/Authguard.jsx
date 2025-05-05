'use client'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function AuthGuard({ children }) {
  const { status } = useSession();                       // Hook #1
  const router     = useRouter();                        // Hook #2
  const pathname   = usePathname();                      // Hook #3

  const isPublic = ['/login','/signup'].includes(pathname);

  if (status === 'loading') {                            // Condition A
    return <div>Loading...</div>;
  }

  if (isPublic) {                                        // Condition B
    return <>{children}</>;
  }

  if (status === 'unauthenticated') {                    // Condition C
    useEffect(() => {                                    // ❌ Hook #4 called inside a condition
      router.push('/login');
    }, [router]);
    return null;
  }

  return <>{children}</>;                                // Default – authenticated
}



