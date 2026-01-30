import { cleanupStrapi, setupStrapi } from '../helpers/strapi';

beforeAll(async () => {
  await setupStrapi();
}, 30000);

afterAll(async () => {
  await cleanupStrapi();
});

// Import all unit tests
import './batchValidationHelpers';
import './getProductWithRetry';
