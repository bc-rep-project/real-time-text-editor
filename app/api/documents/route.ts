import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/documents
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'updatedAt';

    let queryOptions: any = {
      where: {
        field: 'userId',
        op: '==',
        value: session.user.id
      },
      orderBy: {
        field: sort,
        direction: sort === 'title' ? 'asc' : 'desc'
      }
    };

    if (search) {
      queryOptions.where = {
        field: 'title',
        op: '>=',
        value: search
      };
    }

    const documents = await db.query<Document>('documents', queryOptions);

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/documents
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content = '' } = await request.json();
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create document
    const documentId = await db.add('documents', {
      title,
      content,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create initial version
    await db.add('versions', {
      documentId,
      content,
      userId: session.user.id,
      createdAt: new Date()
    });

    // Get the created document
    const newDocument = await db.get<Document>('documents', documentId);

    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    console.error('Failed to create document:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 