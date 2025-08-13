import { FastifyInstance } from 'fastify';
import { supabaseAdmin } from '../auth/supabase';
import { prisma } from '../db/client';

export async function uploadApi(fastify: FastifyInstance) {
  // Upload avatar
  fastify.post(
    '/avatar',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.userId || request.user.id;
        
        // Get the uploaded file
        const data = await request.file();
        
        if (!data) {
          return reply.code(400).send({
            success: false,
            error: 'No file uploaded',
          });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(data.mimetype)) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
          });
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        const buffer = await data.toBuffer();
        
        if (buffer.length > maxSize) {
          return reply.code(400).send({
            success: false,
            error: 'File too large. Maximum size is 5MB.',
          });
        }

        // Generate unique filename
        const fileExtension = data.mimetype.split('/')[1];
        const fileName = `${userId}-${Date.now()}.${fileExtension}`;
        const filePath = `avatars/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('user-uploads')
          .upload(filePath, buffer, {
            contentType: data.mimetype,
            upsert: false,
          });

        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          
          // Check if bucket doesn't exist
          if (uploadError.message?.includes('Bucket not found')) {
            return reply.code(500).send({
              success: false,
              error: 'Storage bucket not configured. Please contact support.',
            });
          }
          
          return reply.code(500).send({
            success: false,
            error: `Upload failed: ${uploadError.message}`,
          });
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('user-uploads')
          .getPublicUrl(filePath);

        const avatarUrl = urlData.publicUrl;

        // Update user's avatar URL in database
        await prisma.user.update({
          where: { id: userId },
          data: { avatarUrl },
        });

        return {
          success: true,
          data: {
            avatarUrl,
            fileName,
          },
        };
      } catch (error) {
        console.error('Avatar upload error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  // Delete avatar
  fastify.delete(
    '/avatar',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.userId || request.user.id;

        // Get current user to find avatar URL
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { avatarUrl: true },
        });

        if (!user?.avatarUrl) {
          return reply.code(404).send({
            success: false,
            error: 'No avatar to delete',
          });
        }

        // Extract file path from URL
        const url = new URL(user.avatarUrl);
        const pathSegments = url.pathname.split('/');
        const fileName = pathSegments[pathSegments.length - 1];
        const filePath = `avatars/${fileName}`;

        // Delete from Supabase Storage
        const { error: deleteError } = await supabaseAdmin.storage
          .from('user-uploads')
          .remove([filePath]);

        if (deleteError) {
          console.error('Supabase delete error:', deleteError);
          // Continue anyway, we'll still clear the URL from database
        }

        // Clear avatar URL from database
        await prisma.user.update({
          where: { id: userId },
          data: { avatarUrl: null },
        });

        return {
          success: true,
          message: 'Avatar deleted successfully',
        };
      } catch (error) {
        console.error('Avatar delete error:', error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );
}