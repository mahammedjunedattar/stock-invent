// app/api/items/[sku]/route.js
// app/api/items/[sku]/route.js
import { NextResponse } from 'next/server';
import { getToken }     from 'next-auth/jwt';
import { connectToDB }  from '@/app/lib/db';

const SECRET     = process.env.NEXTAUTH_SECRETS;
const COOKIE_DEV = 'next-auth.session-token';
const COOKIE_PROD= '__Secure-next-auth.session-token';

async function requireStoreId(req) {
  const token = await getToken({
    req,
    secret: SECRET,
    cookieName: process.env.NODE_ENV === 'production'
      ? COOKIE_PROD
      : COOKIE_DEV
  });
  return token?.storeId ?? null;
}

export async function GET(request, { params }) {
  const storeId = await requireStoreId(request);
  if (!storeId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { db } = await connectToDB();
  const item = await db
    .collection('items')
    .findOne({ sku: params.sku, storeId }, { projection: { _id: 0, storeId: 0 } });
  return item
    ? NextResponse.json(item)
    : NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function DELETE(request, { params }) {
  const storeId = await requireStoreId(request);
  if (!storeId) {
    return NextResponse.json({ error: 'Unauthorizeddddddddddd' }, { status: 401 });
  }

  try {
    const { db } = await connectToDB();
    const { sku } = params;
    const result = await db.collection('items').deleteOne({ sku, storeId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const storeId = await requireStoreId(request);
  if (!storeId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { success, data, error } = validateItem({ ...body, sku: params.sku });
    if (!success) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    const { db } = await connectToDB();
    const result = await db.collection('items').updateOne(
      { sku: params.sku, storeId },
      { $set: { ...data, lastUpdated: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, sku: params.sku, ...data });
  } catch (err) {
    console.error('PUT Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

