// app/api/items/[sku]/route.js
import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/db';
import { validateItem } from '@/app/models/item';
import { withStoreAuth } from '@/app/middleware/withauth';
// app/api/items/[sku]/route.js

export async function GET(req) {
  const authResponse = await withStoreAuth(req);
  if (authResponse.status !== 200) return authResponse;

  try {
    const { db } = await connectToDB();
    const sku = req.nextUrl.pathname.split('/').pop();
    
    const item = await db.collection('items').findOne({ sku });
    
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

export const DELETE = withStoreAuth(async (req) => {
  const { sku } = await params;  // ← await params

  try {
    const db = await connectToDB();
    const result = await db.collection('items').deleteOne({ sku });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: `No item found with SKU '${sku}'` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: `Deleted ${sku}` });
  } catch (err) {
    console.error('DELETE error:', err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
})

export async function PUT(request, { params }) {
  const { sku } = await params;  // ← await params here too

  try {
    const body = await request.json();
    const validation = validateItem({ ...body, sku });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const db = await connect();
    const result = await db.collection('items').updateOne(
      { sku },
      { $set: { ...validation.data, lastUpdated: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: `Item '${sku}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, sku, ...validation.data },
      { status: 200 }
    );
  } catch (err) {
    console.error('PUT error:', err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
