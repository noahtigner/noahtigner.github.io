import { z } from 'zod';

const envNonEmptyString = () =>
  z
    .string()
    .min(1, { message: 'Variable cannot be empty' })
    .refine((val) => val !== 'undefined', {
      message: "Variable cannot equal 'undefined'",
    });

const envConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  VITE_GITHUB_USERNAME: envNonEmptyString(),
  VITE_GOOGLE_ANALYTICS_ID: envNonEmptyString(),
});

declare global {
  type Env = z.infer<typeof envConfigSchema>;
}

export default envConfigSchema;
