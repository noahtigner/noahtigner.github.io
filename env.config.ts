import { z } from 'zod';
import { envNonEmptyString, envEnum } from 'validate-env-vars';

const envConfigSchema = z.object({
  NODE_ENV: envEnum(['development', 'production', 'test']),
  GITHUB_USERNAME: envNonEmptyString(),
  GOOGLE_ANALYTICS_ID: envNonEmptyString(),
});

declare global {
  type Env = z.infer<typeof envConfigSchema>;
}

export default envConfigSchema;
