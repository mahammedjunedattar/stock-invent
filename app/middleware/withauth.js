// middleware/auth.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function withStoreAuth(req) {
  const token = await getToken({ req });
  
  if (!token?.storeId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-store-id', token.storeId);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}