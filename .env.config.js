import { z } from 'zod';
import { envNonEmptyString, envEnum } from 'validate-env-vars';

const envConfigSchema = z.object({
  NODE_ENV: envEnum(['development', 'production', 'test']),
  VITE_GITHUB_USERNAME: envNonEmptyString(),
  VITE_GOOGLE_ANALYTICS_ID: envNonEmptyString(),
});

export default envConfigSchema;
