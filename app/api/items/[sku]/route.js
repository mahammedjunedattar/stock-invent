// app/api/items/[sku]/route.js
import { NextResponse }    from 'next/server';
import { connectToDB }     from '@/app/lib/db';
import { validateItem }    from '@/app/models/item';
import { getToken }        from 'next-auth/jwt';

const SECRET = process.env.NEXTAUTH_SECRET;

// Helper: check auth & extract storeId
async function requireStoreId(req) {
  const token = await getToken({ req, secret: SECRET });
  if (!token?.storeId) {
    return null;
  }
  return token.storeId;
}

export async function GET(request, { params }) {
  const storeId = await requireStoreId(request);
  if (!storeId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await connectToDB();
    const { sku } = params;
    console.log(sku)

    const item = await db
      .collection('items')
      .findOne({ sku, storeId }, { projection: { _id: 0, storeId: 0 } });

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (err) {
    console.error('GET Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const storeId = await requireStoreId(request);
  if (!storeId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

