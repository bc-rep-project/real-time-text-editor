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
    const sort = searchParams.get('sort') || 'updatedAt';
    const direction = sort === 'title' ? 'asc' : 'desc';

    // Build where clauses with proper typing
    const whereConditions: WhereClause[] = [
      {
        field: 'userId',
        op: '==',
        value: session.user.id
      }
    ];

    // Get all documents for the user with proper typing
    const documents = await db.query<Document>('documents', {
      where: whereConditions,
      orderBy: {
        field: sort,
        direction: direction as 'asc' | 'desc'
      }
    });

    // Format dates
    const formattedDocuments = documents.map(doc => ({
      ...doc,
      updatedAt: new Date(doc.updatedAt).toISOString()
    }));

    return NextResponse.json(formattedDocuments);
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