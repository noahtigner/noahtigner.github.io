import { z } from 'zod';
import { envObject, envNonEmptyString, envEnum } from 'validate-env-vars';

const envConfigSchema = envObject({
  NODE_ENV: envEnum(['development', 'production', 'test']),
  GITHUB_USERNAME: envNonEmptyString(),
});

declare global {
  type Env = z.infer<typeof envConfigSchema>;
}

export default envConfigSchema;
