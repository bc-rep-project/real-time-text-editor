import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const docRef = db.collection('documents').doc(params.documentId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const data = doc.data();
    const content = data?.content || '';

    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'text/markdown');
    headers.set('Content-Disposition', `attachment; filename="document-${params.documentId}.md"`);

    return new NextResponse(content, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error exporting document:', error);
    return NextResponse.json(
      { error: 'Failed to export document' },
      { status: 500 }
    );
  }
} 