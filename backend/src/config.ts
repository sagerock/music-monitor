import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform(Number),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  SPOTIFY_CLIENT_ID: z.string(),
  SPOTIFY_CLIENT_SECRET: z.string(),
  RESEND_API_KEY: z.string().optional(),
  APIFY_TOKEN: z.string().optional(),
  YOUTUBE_API_KEY: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  CRON_JOB_SECRET: z.string(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
});

const env = envSchema.parse(process.env);

export const config = {
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
  DATABASE_URL: env.DATABASE_URL,
  JWT_SECRET: env.JWT_SECRET,
  SPOTIFY_CLIENT_ID: env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: env.SPOTIFY_CLIENT_SECRET,
  RESEND_API_KEY: env.RESEND_API_KEY,
  APIFY_TOKEN: env.APIFY_TOKEN,
  YOUTUBE_API_KEY: env.YOUTUBE_API_KEY,
  FRONTEND_URL: env.FRONTEND_URL,
  CRON_JOB_SECRET: env.CRON_JOB_SECRET,
  LOG_LEVEL: env.LOG_LEVEL,
  SUPABASE_URL: env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
} as const;

export type Config = typeof config;