import { jest } from '@jest/globals';
import {
  batchValidateSerialNumbers,
  batchValidateImages,
} from '../../../src/graphql/models/product/helpers/importing/utils/helpers/batchValidationHelpers';
import { checkSerialNumbersAvailability } from '../../../src/graphql/models/product/helpers/importing/utils/helpers/actions/handleNormalisedFields/checkSerialNumbersAvailability';
import { checkAllImages } from '../../../src/graphql/helpers/importingHelpers/utils';

// Mock the dependencies
jest.mock('../../../src/graphql/models/product/helpers/importing/utils/helpers/actions/handleNormalisedFields/checkSerialNumbersAvailability');
jest.mock('../../../src/graphql/helpers/importingHelpers/utils');

const mockCheckSerialNumbersAvailability = checkSerialNumbersAvailability as jest.MockedFunction<typeof checkSerialNumbersAvailability>;
const mockCheckAllImages = checkAllImages as jest.MockedFunction<typeof checkAllImages>;

describe('Integration Tests - Batch Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Real-world scenarios', () => {
    it('should handle large batch of products with mixed data', async () => {
      // Create a large batch of products with various scenarios
      const products = Array.from({ length: 100 }, (_, index) => ({
        name: `Product ${index + 1}`,
        barcodeId: `BARCODE${String(index + 1).padStart(3, '0')}`,
        images: index % 3 === 0 ? [`img-${index + 1}`] : [],
        productItems: index % 2 === 0 ? [{
          serialNumbers: index % 4 === 0 ? [`SN${index + 1}`] : []
        }] : [],
      }));

      const tenantFilter = { tenant: 'test-tenant' };
      const tenantId = 'test-tenant';

      // Mock serial number availability
      mockCheckSerialNumbersAvailability.mockImplementation(({ serialNumbers }) => ({
        isAllSerialNumbersAvailable: serialNumbers[0]?.endsWith('1') || false, // Only odd numbers are available
        existedSerialNumbers: [],
      }));

      // Mock image validation
      mockCheckAllImages.mockImplementation((images) => ({
        isImagesIdsValid: images[0]?.includes('1') || false, // Only images with '1' are valid
        imagesIdsArray: images[0]?.includes('1') ? [`file-${images[0]}`] : [],
      }));

      const [serialAvailabilityMap, imageValidationMap] = await Promise.all([
        batchValidateSerialNumbers(products, tenantFilter),
        batchValidateImages(products, tenantId),
      ]);

      // Verify serial number validation
      expect(serialAvailabilityMap.size).toBeGreaterThan(0);
      expect(mockCheckSerialNumbersAvailability).toHaveBeenCalledTimes(
        // Should be called for each unique serial number
        products.filter(p => p.productItems?.[0]?.serialNumbers?.length).length
      );

      // Verify image validation
      expect(imageValidationMap.size).toBeGreaterThan(0);
      expect(mockCheckAllImages).toHaveBeenCalledTimes(
        // Should be called for each unique image
        products.filter(p => p.images?.length).length
      );

      // Verify specific cases
      expect(serialAvailabilityMap.get('SN1')).toBe(true);
      expect(serialAvailabilityMap.get('SN2')).toBe(false);
      expect(imageValidationMap.get('img-1')).toEqual({ isValid: true, ids: ['file-img-1'] });
      expect(imageValidationMap.get('img-2')).toEqual({ isValid: false, ids: [] });
    });

    it('should handle edge cases with malformed data', async () => {
      const products = [
        {
          // Valid product
          name: 'Valid Product',
          images: ['valid-img'],
          productItems: [{ serialNumbers: ['valid-sn'] }],
        },
        {
          // Product with null values
          name: null,
          images: [null, undefined, 'img-null'],
          productItems: [{ serialNumbers: [null, undefined, 'sn-null'] }],
        },
        {
          // Product with empty arrays
          name: 'Empty Product',
          images: [],
          productItems: [{ serialNumbers: [] }],
        },
        {
          // Product with missing properties
          // No images, no productItems
        },
        {
          // Product with malformed productItems
          name: 'Malformed Product',
          images: ['img-malformed'],
          productItems: null,
        },
      ];

      const tenantFilter = { tenant: 'test-tenant' };
      const tenantId = 'test-tenant';

      mockCheckSerialNumbersAvailability.mockResolvedValue({
        isAllSerialNumbersAvailable: true,
        existedSerialNumbers: [],
      });

      mockCheckAllImages.mockResolvedValue({
        isImagesIdsValid: true,
        imagesIdsArray: ['file-id'],
      });

      const [serialAvailabilityMap, imageValidationMap] = await Promise.all([
        batchValidateSerialNumbers(products, tenantFilter),
        batchValidateImages(products, tenantId),
      ]);

      // Should handle malformed data gracefully
      expect(serialAvailabilityMap.get('valid-sn')).toBe(true);
      expect(serialAvailabilityMap.get('sn-null')).toBe(true);
      expect(imageValidationMap.get('valid-img')).toEqual({ isValid: true, ids: ['file-id'] });
      expect(imageValidationMap.get('img-null')).toEqual({ isValid: true, ids: ['file-id'] });
      expect(imageValidationMap.get('img-malformed')).toEqual({ isValid: true, ids: ['file-id'] });

      // Should not attempt to validate null/undefined values
      expect(mockCheckSerialNumbersAvailability).toHaveBeenCalledWith({
        serialNumbers: ['valid-sn'],
        tenantFilter,
      });
      expect(mockCheckSerialNumbersAvailability).toHaveBeenCalledWith({
        serialNumbers: ['sn-null'],
        tenantFilter,
      });
    });

    it('should handle concurrent batch validation', async () => {
      const products1 = Array.from({ length: 50 }, (_, index) => ({
        name: `Batch1 Product ${index + 1}`,
        productItems: [{ serialNumbers: [`B1-SN${index + 1}`] }],
      }));

      const products2 = Array.from({ length: 50 }, (_, index) => ({
        name: `Batch2 Product ${index + 1}`,
        productItems: [{ serialNumbers: [`B2-SN${index + 1}`] }],
      }));

      const tenantFilter = { tenant: 'test-tenant' };

      let callCount = 0;
      mockCheckSerialNumbersAvailability.mockImplementation(({ serialNumbers }) => {
        callCount++;
        return {
          isAllSerialNumbersAvailable: true,
          existedSerialNumbers: [],
        };
      });

      // Run both batches concurrently
      const [result1, result2] = await Promise.all([
        batchValidateSerialNumbers(products1, tenantFilter),
        batchValidateSerialNumbers(products2, tenantFilter),
      ]);

      // Should handle both batches independently
      expect(result1.size).toBe(50);
      expect(result2.size).toBe(50);
      expect(callCount).toBe(100); // 50 calls for each batch

      // Verify results are separate
      expect(result1.get('B1-SN1')).toBe(true);
      expect(result2.get('B2-SN1')).toBe(true);
      expect(result1.has('B2-SN1')).toBe(false);
      expect(result2.has('B1-SN1')).toBe(false);
    });

    it('should handle performance with large datasets', async () => {
      const startTime = Date.now();
      
      // Create a large dataset
      const products = Array.from({ length: 1000 }, (_, index) => ({
        name: `Product ${index + 1}`,
        images: [`img-${index + 1}`],
        productItems: Array.from({ length: 5 }, (_, itemIndex) => ({
          serialNumbers: [`SN${index + 1}-${itemIndex + 1}`],
        })),
      }));

      const tenantFilter = { tenant: 'test-tenant' };
      const tenantId = 'test-tenant';

      mockCheckSerialNumbersAvailability.mockResolvedValue({
        isAllSerialNumbersAvailable: true,
        existedSerialNumbers: [],
      });

      mockCheckAllImages.mockResolvedValue({
        isImagesIdsValid: true,
        imagesIdsArray: [`file-id`],
      });

      const [serialAvailabilityMap, imageValidationMap] = await Promise.all([
        batchValidateSerialNumbers(products, tenantFilter),
        batchValidateImages(products, tenantId),
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds

      // Should process all unique serial numbers (1000 products * 5 items = 5000 serial numbers)
      expect(serialAvailabilityMap.size).toBe(5000);
      
      // Should process all unique images (1000 images)
      expect(imageValidationMap.size).toBe(1000);

      // Should make correct number of API calls
      expect(mockCheckSerialNumbersAvailability).toHaveBeenCalledTimes(5000);
      expect(mockCheckAllImages).toHaveBeenCalledTimes(1000);
    });

    it('should handle error scenarios gracefully', async () => {
      const products = [
        {
          name: 'Product 1',
          productItems: [{ serialNumbers: ['SN1'] }],
        },
        {
          name: 'Product 2',
          images: ['img1'],
        },
      ];

      const tenantFilter = { tenant: 'test-tenant' };
      const tenantId = 'test-tenant';

      // Mock errors
      mockCheckSerialNumbersAvailability.mockRejectedValueOnce(
        new Error('Database connection failed')
      );
      mockCheckAllImages.mockRejectedValueOnce(
        new Error('File service unavailable')
      );

      // Should handle errors without crashing
      await expect(
        batchValidateSerialNumbers(products, tenantFilter)
      ).rejects.toThrow('Database connection failed');

      await expect(
        batchValidateImages(products, tenantId)
      ).rejects.toThrow('File service unavailable');
    });
  });

  describe('Data consistency and integrity', () => {
    it('should maintain data consistency across duplicate entries', async () => {
      const products = [
        {
          name: 'Product A',
          images: ['shared-img-1', 'unique-img-1'],
          productItems: [
            { serialNumbers: ['shared-sn-1', 'unique-sn-1'] },
            { serialNumbers: ['shared-sn-2', 'shared-sn-1'] }, // Duplicate across items
          ],
        },
        {
          name: 'Product B',
          images: ['shared-img-1', 'unique-img-2'], // Duplicate image across products
          productItems: [
            { serialNumbers: ['shared-sn-1', 'unique-sn-3'] }, // Duplicate serial across products
          ],
        },
      ];

      const tenantFilter = { tenant: 'test-tenant' };
      const tenantId = 'test-tenant';

      const serialResults = new Map([
        ['shared-sn-1', true],
        ['shared-sn-2', false],
        ['unique-sn-1', true],
        ['unique-sn-3', true],
      ]);

      const imageResults = new Map([
        ['shared-img-1', { isValid: true, ids: ['file-shared-1'] }],
        ['unique-img-1', { isValid: false, ids: [] }],
        ['unique-img-2', { isValid: true, ids: ['file-unique-2'] }],
      ]);

      mockCheckSerialNumbersAvailability.mockImplementation(({ serialNumbers }) => ({
        isAllSerialNumbersAvailable: serialResults.get(serialNumbers[0]) || false,
        existedSerialNumbers: [],
      }));

      mockCheckAllImages.mockImplementation((images) => ({
        isImagesIdsValid: imageResults.get(images[0])?.isValid || false,
        imagesIdsArray: imageResults.get(images[0])?.ids || [],
      }));

      const [serialAvailabilityMap, imageValidationMap] = await Promise.all([
        batchValidateSerialNumbers(products, tenantFilter),
        batchValidateImages(products, tenantId),
      ]);

      // Should only validate unique values once
      expect(mockCheckSerialNumbersAvailability).toHaveBeenCalledTimes(4); // 4 unique serials
      expect(mockCheckAllImages).toHaveBeenCalledTimes(3); // 3 unique images

      // All duplicates should have same result
      expect(serialAvailabilityMap.get('shared-sn-1')).toBe(true);
      expect(imageValidationMap.get('shared-img-1')).toEqual({ isValid: true, ids: ['file-shared-1'] });
    });
  });
});
