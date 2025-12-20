/**
 * Environment Validation Plugin
 *
 * Runs at server startup to validate all required
 * environment variables before accepting requests.
 */
import { validateEnv } from '../utils/env'

export default defineNitroPlugin(() => {
  validateEnv()
})
