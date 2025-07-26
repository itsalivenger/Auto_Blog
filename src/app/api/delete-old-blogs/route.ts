
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result = await db.collection('blogs').deleteMany({
      published: true,
      published_at: { $lt: sevenDaysAgo },
    });

    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} old blogs.`,
    }, { status: 200 });
  } catch (error) {
    console.error('Error in delete-old-blogs route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete old blogs' },
      { status: 500 }
    );
  }
}
