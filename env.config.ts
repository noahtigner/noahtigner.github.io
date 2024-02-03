import { z } from 'zod';

const nonEmptyString = z
  .string()
  .min(1, { message: 'String cannot be empty' })
  .refine((val) => val != 'undefined', {
    message: `String cannot equal 'undefined'`,
  });

const envConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  GITHUB_USERNAME: nonEmptyString,
});

declare global {
  type Env = z.infer<typeof envConfigSchema>;
}

export default envConfigSchema;
