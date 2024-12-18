import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import { db } from '@/lib/db';
import { WhereFilterOp } from 'firebase-admin/firestore';

interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WhereClause {
  field: string;
  op: WhereFilterOp;
  value: any;
}

// GET /api/documents
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'updatedAt';
    
    // Always sort updatedAt in descending order for recency
    // Always sort title in ascending order for alphabetical order
    const direction = sort === 'title' ? 'asc' : 'desc';

    console.log('API: Fetching documents with:', { sort, direction });

    // Build where clauses with proper typing
    const whereConditions: WhereClause[] = [
      {
        field: 'userId',
        op: '==',
        value: session.user.id
      }
    ];

    // First get all documents without sorting
    const documents = await db.query<Document>('documents', {
      where: whereConditions
    });

    console.log('API: Raw documents:', documents);

    // Format dates and ensure all fields are present
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      title: doc.title || 'Untitled',
      content: doc.content || '',
      userId: doc.userId,
      createdAt: new Date(doc.createdAt).toISOString(),
      updatedAt: new Date(doc.updatedAt).toISOString()
    }));

    // Sort documents in memory
    const sortedDocuments = [...formattedDocuments].sort((a, b) => {
      if (sort === 'title') {
        return a.title.localeCompare(b.title);
      } else {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    console.log('API: Sorted documents:', sortedDocuments);

    return NextResponse.json(sortedDocuments);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    // Return more detailed error information
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/documents
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title } = await request.json();
    
    if (typeof title !== 'string' || title.length > 100) {
      return NextResponse.json(
        { error: 'Invalid title. Must be a string up to 100 characters.' },
        { status: 400 }
      );
    }

    const documentId = await db.add('documents', {
      title: title.trim() || 'Untitled Document',
      content: '',
      userId: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      id: documentId,
      message: 'Document created successfully' 
    });
  } catch (error) {
    console.error('Failed to create document:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 