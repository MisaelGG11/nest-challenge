import { z } from 'zod';

export const ENVSchema = z.object({
  API_STAGE: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  API_HOST: z.string().min(2).max(100).default('localhost'),
  API_PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default('*'),
  ENABLE_SWAGGER: z.coerce.boolean().default(true),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.coerce.number().int().positive().default(3600), // 1 hour
  JWT_REFRESH_EXPIRES_IN: z.coerce.number().int().positive().default(604800), // 7 days
});

export type Environment = z.infer<typeof ENVSchema>;

export function validateEnv(env: Record<string, unknown>): Environment {
  const parsed = ENVSchema.safeParse(env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid env vars:\n${message}`);
  }
  return parsed.data;
}
