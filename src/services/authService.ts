import { getToken } from 'next-auth/jwt';
import { parse } from 'cookie';
import { IncomingMessage } from 'http';
import { logger } from '../utils/logger';

interface ExtendedIncomingMessage extends IncomingMessage {
  cookies: { [key: string]: string };
}

interface User {
  id: string;
  username?: string;
}

class AuthService {
  public async verifyToken(token: string): Promise<User | null> {
    try {
      // Verify JWT token
      const payload = await this.decodeToken(token);
      if (!payload) return null;

      return {
        id: payload.sub || '',
        username: payload.name || undefined
      };
    } catch (error) {
      logger.error('Token verification error:', error);
      return null;
    }
  }

  private async decodeToken(token: string) {
    try {
      // Create a mock request with the token
      const mockReq = {
        aborted: false,
        httpVersion: '1.1',
        httpVersionMajor: 1,
        httpVersionMinor: 1,
        complete: true,
        connection: null,
        socket: null,
        headers: {
          cookie: `next-auth.session-token=${token}`
        },
        cookies: {
          'next-auth.session-token': token
        },
        rawHeaders: [],
        trailers: {},
        rawTrailers: [],
        statusCode: null,
        statusMessage: null,
        destroy: () => true,
        setTimeout: () => mockReq,
        url: '',
        method: 'GET',
      } as unknown as ExtendedIncomingMessage;

      return await getToken({ 
        req: mockReq, 
        secret: process.env.NEXTAUTH_SECRET 
      });
    } catch (error) {
      logger.error('Token decode error:', error);
      return null;
    }
  }

  public async verifyWebSocketConnection(req: IncomingMessage): Promise<boolean> {
    try {
      const cookieHeader = req.headers.cookie || '';
      const cookies = parse(cookieHeader);
      const extendedReq = Object.assign(req, { cookies }) as ExtendedIncomingMessage;
      
      const token = await getToken({ 
        req: extendedReq, 
        secret: process.env.NEXTAUTH_SECRET 
      });

      return !!token;
    } catch (error) {
      logger.error('WebSocket authentication error:', error);
      return false;
    }
  }

  public async getUserFromRequest(req: IncomingMessage): Promise<{ id: string; name?: string } | null> {
    try {
      const cookieHeader = req.headers.cookie || '';
      const cookies = parse(cookieHeader);
      const extendedReq = Object.assign(req, { cookies }) as ExtendedIncomingMessage;
      
      const token = await getToken({ 
        req: extendedReq, 
        secret: process.env.NEXTAUTH_SECRET 
      });

      if (!token) return null;

      return {
        id: token.sub || '',
        name: token.name || undefined
      };
    } catch (error) {
      logger.error('Error getting user from request:', error);
      return null;
    }
  }
}

export const authService = new AuthService(); 