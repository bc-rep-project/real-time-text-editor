import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userSnapshot = await adminDb
      .collection('users')
      .where('username', '==', username)
      .get();

    if (!userSnapshot.empty) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const userRef = await adminDb.collection('users').add({
      username,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json(
      { message: 'User created successfully', userId: userRef.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 