import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .default('4000')
    .transform((val) => Number(val))
    .pipe(z.number().int().positive()),
  DATABASE_URL: z.string().refine(
    (val) => {
      // Accept both URL format (for MySQL/PostgreSQL) and file: protocol (for SQLite)
      return val.startsWith('file:') || z.string().url().safeParse(val).success;
    },
    { message: 'DATABASE_URL must be a valid URL or file path (file:...)' }
  ),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
});

let env: z.infer<typeof envSchema>;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment variable validation failed:');
    error.issues.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }
  throw error;
}

export { env };

