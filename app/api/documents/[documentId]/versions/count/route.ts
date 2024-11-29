import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const versionsRef = db.collection('documents')
      .doc(params.documentId)
      .collection('versions');
    
    const snapshot = await versionsRef.count().get();
    
    return NextResponse.json({ count: snapshot.data().count });
  } catch (error) {
    console.error('Error fetching version count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch version count' },
      { status: 500 }
    );
  }
} 