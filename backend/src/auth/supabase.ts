import { createClient } from '@supabase/supabase-js';
import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../db/client';

const supabaseUrl = process.env.SUPABASE_URL || 'https://mpskjkezcifsameyfxzz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc2tqa2V6Y2lmc2FtZXlmeHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAyOTMwOSwiZXhwIjoyMDcwNjA1MzA5fQ.iQ92Ju4O-Ht6XEhfQdToor5_ftA-JEsGAMWZabOT-NQ';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function validateSupabaseToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ 
        success: false, 
        error: 'No authorization token provided' 
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return reply.status(401).send({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }

    // Sync user with our database
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      // Create user in our database if they don't exist
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || null,
        },
      });
    }

    // Attach user to request for use in route handlers
    (request as any).user = dbUser;
    
    return;
  } catch (error) {
    console.error('Auth validation error:', error);
    return reply.status(401).send({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
}

// Decorator for routes that require authentication
export async function authenticateSupabase(request: FastifyRequest, reply: FastifyReply) {
  return validateSupabaseToken(request, reply);
}