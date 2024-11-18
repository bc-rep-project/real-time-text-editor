import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { databaseService } from '@/lib/database-service';
import { authOptions } from '../auth/[...nextauth]/options';

// GET /api/documents
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || '';
    const sort = searchParams.get('sort') || 'updatedAt';

    const documents = await databaseService.getAllDocuments(filter, sort);
    return NextResponse.json(documents || []);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/documents
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const documentId = await databaseService.createDocument(data, session.user.id);

    return NextResponse.json({ documentId }, { status: 200 });
  } catch (error) {
    console.error('Failed to create document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
} 