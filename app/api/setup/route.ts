import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Create test user
    const hashedPassword = await hash('password123', 12);
    
    // Check if test user already exists
    const existingUser = await db.get('users', {
      field: 'username',
      value: 'testuser'
    });

    if (!existingUser) {
      // Create test user in Firebase
      await db.add('users', {
        username: 'testuser',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return NextResponse.json({ message: 'Setup completed' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
} 