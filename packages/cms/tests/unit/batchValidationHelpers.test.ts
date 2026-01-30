import { jest } from '@jest/globals';
import {
  batchValidateSerialNumbers,
  batchValidateImages,
  checkProductSerialNumbersAvailability,
  getProductImagesValidation,
} from '../../../src/graphql/models/product/helpers/importing/utils/helpers/batchValidationHelpers';
import { checkSerialNumbersAvailability } from '../../../src/graphql/models/product/helpers/importing/utils/helpers/actions/handleNormalisedFields/checkSerialNumbersAvailability';
import { checkAllImages } from '../../../src/graphql/helpers/importingHelpers/utils';

// Mock the dependencies
jest.mock('../../../src/graphql/models/product/helpers/importing/utils/helpers/actions/handleNormalisedFields/checkSerialNumbersAvailability');
jest.mock('../../../src/graphql/helpers/importingHelpers/utils');

const mockCheckSerialNumbersAvailability = checkSerialNumbersAvailability as jest.MockedFunction<typeof checkSerialNumbersAvailability>;
const mockCheckAllImages = checkAllImages as jest.MockedFunction<typeof checkAllImages>;

describe('batchValidationHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('batchValidateSerialNumbers', () => {
    it('should return empty map when no serial numbers provided', async () => {
      const products = [
        { name: 'Product 1', productItems: [] },
        { name: 'Product 2', productItems: [{ serialNumbers: [] }] },
      ];
      const tenantFilter = { tenant: 'test-tenant' };

      const result = await batchValidateSerialNumbers(products, tenantFilter);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
      expect(mockCheckSerialNumbersAvailability).not.toHaveBeenCalled();
    });

    it('should handle products with null/undefined serial numbers', async () => {
      const products = [
        {
          name: 'Product 1',
          productItems: [
            { serialNumbers: null },
            { serialNumbers: undefined },
            { serialNumbers: ['SN001'] },
          ],
        },
      ];
      const tenantFilter = { tenant: 'test-tenant' };

      mockCheckSerialNumbersAvailability.mockResolvedValue({
        isAllSerialNumbersAvailable: true,
        existedSerialNumbers: [],
      });

      const result = await batchValidateSerialNumbers(products, tenantFilter);

      expect(mockCheckSerialNumbersAvailability).toHaveBeenCalledWith({
        serialNumbers: ['SN001'],
        tenantFilter,
      });
      expect(result.get('SN001')).toBe(true);
    });

    it('should handle duplicate serial numbers across products', async () => {
      const products = [
        {
          name: 'Product 1',
          productItems: [{ serialNumbers: ['SN001', 'SN002'] }],
        },
        {
          name: 'Product 2',
          productItems: [{ serialNumbers: ['SN001', 'SN003'] }],
        },
      ];
      const tenantFilter = { tenant: 'test-tenant' };

      mockCheckSerialNumbersAvailability
        .mockResolvedValueOnce({
          isAllSerialNumbersAvailable: true,
          existedSerialNumbers: [],
        })
        .mockResolvedValueOnce({
          isAllSerialNumbersAvailable: false,
          existedSerialNumbers: [],
        })
        .mockResolvedValueOnce({
          isAllSerialNumbersAvailable: true,
          existedSerialNumbers: [],
        });

      const result = await batchValidateSerialNumbers(products, tenantFilter);

      // Should only check unique serial numbers
      expect(mockCheckSerialNumbersAvailability).toHaveBeenCalledTimes(3);
      expect(mockCheckSerialNumbersAvailability).toHaveBeenNthCalledWith(1, {
        serialNumbers: ['SN001'],
        tenantFilter,
      });
      expect(mockCheckSerialNumbersAvailability).toHaveBeenNthCalledWith(2, {
        serialNumbers: ['SN002'],
        tenantFilter,
      });
      expect(mockCheckSerialNumbersAvailability).toHaveBeenNthCalledWith(3, {
        serialNumbers: ['SN003'],
        tenantFilter,
      });

      expect(result.get('SN001')).toBe(true);
      expect(result.get('SN002')).toBe(false);
      expect(result.get('SN003')).toBe(true);
    });

    it('should handle empty products array', async () => {
      const products: any[] = [];
      const tenantFilter = { tenant: 'test-tenant' };

      const result = await batchValidateSerialNumbers(products, tenantFilter);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
      expect(mockCheckSerialNumbersAvailability).not.toHaveBeenCalled();
    });

    it('should handle products without productItems', async () => {
      const products = [
        { name: 'Product 1' },
        { name: 'Product 2', productItems: null },
        { name: 'Product 3', productItems: undefined },
      ];
      const tenantFilter = { tenant: 'test-tenant' };

      const result = await batchValidateSerialNumbers(products, tenantFilter);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
      expect(mockCheckSerialNumbersAvailability).not.toHaveBeenCalled();
    });
  });

  describe('batchValidateImages', () => {
    it('should return empty map when no images provided', async () => {
      const products = [
        { name: 'Product 1', images: [] },
        { name: 'Product 2', images: [] },
      ];
      const tenantId = 'test-tenant';

      const result = await batchValidateImages(products, tenantId);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
      expect(mockCheckAllImages).not.toHaveBeenCalled();
    });

    it('should handle invalid image IDs', async () => {
      const products = [
        {
          name: 'Product 1',
          images: ['invalid-id-1', 'invalid-id-2'],
        },
      ];
      const tenantId = 'test-tenant';

      mockCheckAllImages.mockResolvedValue({
        isImagesIdsValid: false,
        imagesIdsArray: [],
      });

      const result = await batchValidateImages(products, tenantId);

      expect(mockCheckAllImages).toHaveBeenCalledWith(['invalid-id-1'], tenantId, true);
      expect(mockCheckAllImages).toHaveBeenCalledWith(['invalid-id-2'], tenantId, true);
      expect(result.get('invalid-id-1')).toEqual({ isValid: false, ids: [] });
      expect(result.get('invalid-id-2')).toEqual({ isValid: false, ids: [] });
    });

    it('should handle missing images (null/undefined)', async () => {
      const products = [
        {
          name: 'Product 1',
          images: ['valid-id-1', null, undefined, 'valid-id-2'],
        },
      ];
      const tenantId = 'test-tenant';

      mockCheckAllImages
        .mockResolvedValueOnce({
          isImagesIdsValid: true,
          imagesIdsArray: ['file-1'],
        })
        .mockResolvedValueOnce({
          isImagesIdsValid: true,
          imagesIdsArray: ['file-2'],
        });

      const result = await batchValidateImages(products, tenantId);

      // Should only check valid image IDs (not null/undefined)
      expect(mockCheckAllImages).toHaveBeenCalledTimes(2);
      expect(result.get('valid-id-1')).toEqual({ isValid: true, ids: ['file-1'] });
      expect(result.get('valid-id-2')).toEqual({ isValid: true, ids: ['file-2'] });
    });

    it('should handle duplicate image IDs across products', async () => {
      const products = [
        { name: 'Product 1', images: ['img-001', 'img-002'] },
        { name: 'Product 2', images: ['img-001', 'img-003'] },
      ];
      const tenantId = 'test-tenant';

      mockCheckAllImages
        .mockResolvedValueOnce({
          isImagesIdsValid: true,
          imagesIdsArray: ['file-1'],
        })
        .mockResolvedValueOnce({
          isImagesIdsValid: false,
          imagesIdsArray: [],
        })
        .mockResolvedValueOnce({
          isImagesIdsValid: true,
          imagesIdsArray: ['file-3'],
        });

      const result = await batchValidateImages(products, tenantId);

      // Should only check unique image IDs
      expect(mockCheckAllImages).toHaveBeenCalledTimes(3);
      expect(result.get('img-001')).toEqual({ isValid: true, ids: ['file-1'] });
      expect(result.get('img-002')).toEqual({ isValid: false, ids: [] });
      expect(result.get('img-003')).toEqual({ isValid: true, ids: ['file-3'] });
    });

    it('should handle empty products array', async () => {
      const products: any[] = [];
      const tenantId = 'test-tenant';

      const result = await batchValidateImages(products, tenantId);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
      expect(mockCheckAllImages).not.toHaveBeenCalled();
    });

    it('should handle products without images array', async () => {
      const products = [
        { name: 'Product 1' },
        { name: 'Product 2', images: null },
        { name: 'Product 3', images: undefined },
      ];
      const tenantId = 'test-tenant';

      const result = await batchValidateImages(products, tenantId);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
      expect(mockCheckAllImages).not.toHaveBeenCalled();
    });
  });

  describe('checkProductSerialNumbersAvailability', () => {
    it('should return true for product without productItems', () => {
      const product = { name: 'Product 1' };
      const serialAvailabilityMap = new Map();

      const result = checkProductSerialNumbersAvailability(product, serialAvailabilityMap);

      expect(result).toBe(true);
    });

    it('should return true for product with empty productItems', () => {
      const product = { name: 'Product 1', productItems: [] };
      const serialAvailabilityMap = new Map();

      const result = checkProductSerialNumbersAvailability(product, serialAvailabilityMap);

      expect(result).toBe(true);
    });

    it('should return true for product items without serial numbers', () => {
      const product = {
        name: 'Product 1',
        productItems: [
          { serialNumbers: [] },
          { serialNumbers: null },
          { serialNumbers: undefined },
        ],
      };
      const serialAvailabilityMap = new Map();

      const result = checkProductSerialNumbersAvailability(product, serialAvailabilityMap);

      expect(result).toBe(true);
    });

    it('should return false when any serial number is not available', () => {
      const product = {
        name: 'Product 1',
        productItems: [
          { serialNumbers: ['SN001', 'SN002'] },
          { serialNumbers: ['SN003'] },
        ],
      };
      const serialAvailabilityMap = new Map([
        ['SN001', true],
        ['SN002', false], // This one is not available
        ['SN003', true],
      ]);

      const result = checkProductSerialNumbersAvailability(product, serialAvailabilityMap);

      expect(result).toBe(false);
    });

    it('should return true when all serial numbers are available', () => {
      const product = {
        name: 'Product 1',
        productItems: [
          { serialNumbers: ['SN001', 'SN002'] },
          { serialNumbers: ['SN003'] },
        ],
      };
      const serialAvailabilityMap = new Map([
        ['SN001', true],
        ['SN002', true],
        ['SN003', true],
      ]);

      const result = checkProductSerialNumbersAvailability(product, serialAvailabilityMap);

      expect(result).toBe(true);
    });

    it('should return false when serial number is not in map', () => {
      const product = {
        name: 'Product 1',
        productItems: [
          { serialNumbers: ['SN001', 'SN002'] },
        ],
      };
      const serialAvailabilityMap = new Map([
        ['SN001', true],
        // SN002 is missing from map
      ]);

      const result = checkProductSerialNumbersAvailability(product, serialAvailabilityMap);

      expect(result).toBe(false);
    });
  });

  describe('getProductImagesValidation', () => {
    it('should return valid result for product without images', () => {
      const product = { name: 'Product 1' };
      const imageValidationMap = new Map();

      const result = getProductImagesValidation(product, imageValidationMap);

      expect(result).toEqual({ isValid: true, ids: [] });
    });

    it('should return valid result for product with empty images array', () => {
      const product = { name: 'Product 1', images: [] };
      const imageValidationMap = new Map();

      const result = getProductImagesValidation(product, imageValidationMap);

      expect(result).toEqual({ isValid: true, ids: [] });
    });

    it('should return valid result when all images are valid', () => {
      const product = {
        name: 'Product 1',
        images: ['img-001', 'img-002'],
      };
      const imageValidationMap = new Map([
        ['img-001', { isValid: true, ids: ['file-1'] }],
        ['img-002', { isValid: true, ids: ['file-2'] }],
      ]);

      const result = getProductImagesValidation(product, imageValidationMap);

      expect(result).toEqual({
        isValid: true,
        ids: ['file-1', 'file-2'],
      });
    });

    it('should return invalid result when any image is invalid', () => {
      const product = {
        name: 'Product 1',
        images: ['img-001', 'img-002', 'img-003'],
      };
      const imageValidationMap = new Map([
        ['img-001', { isValid: true, ids: ['file-1'] }],
        ['img-002', { isValid: false, ids: [] }],
        ['img-003', { isValid: true, ids: ['file-3'] }],
      ]);

      const result = getProductImagesValidation(product, imageValidationMap);

      expect(result).toEqual({
        isValid: false,
        ids: ['file-1', [], 'file-3'],
      });
    });

    it('should return invalid result when image is not in validation map', () => {
      const product = {
        name: 'Product 1',
        images: ['img-001', 'img-002'],
      };
      const imageValidationMap = new Map([
        ['img-001', { isValid: true, ids: ['file-1'] }],
        // img-002 is missing from map
      ]);

      const result = getProductImagesValidation(product, imageValidationMap);

      expect(result).toEqual({
        isValid: false,
        ids: ['file-1'],
      });
    });

    it('should collect all IDs even when some images are invalid', () => {
      const product = {
        name: 'Product 1',
        images: ['img-001', 'img-002', 'img-003'],
      };
      const imageValidationMap = new Map([
        ['img-001', { isValid: true, ids: ['file-1', 'file-1b'] }],
        ['img-002', { isValid: false, ids: ['file-2'] }],
        ['img-003', { isValid: true, ids: ['file-3'] }],
      ]);

      const result = getProductImagesValidation(product, imageValidationMap);

      expect(result).toEqual({
        isValid: false,
        ids: ['file-1', 'file-1b', 'file-2', 'file-3'],
      });
    });
  });
});
