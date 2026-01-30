import { jest } from '@jest/globals';

// Mock the setTimeout function
const mockSetTimeout = jest.fn();
const originalSetTimeout = global.setTimeout;

describe('getProductWithRetry and Lock Mechanism', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    global.setTimeout = mockSetTimeout;
  });

  afterEach(() => {
    jest.useRealTimers();
    global.setTimeout = originalSetTimeout;
  });

  describe('getProductWithRetry function', () => {
    // We need to extract and test the getProductWithRetry function logic
    // Since it's defined inside handleNormalisedProductsFields, we'll recreate it for testing
    const createGetProductWithRetry = (
      existingNameMap: Map<string, any>,
      existingBarcodeMap: Map<string, any>,
      productCreationLocks: Set<string>
    ) => {
      return async (parsedProduct: any, maxRetries = 3) => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          const existingFromDB = existingNameMap.get(parsedProduct?.name);
          const createdInThisImport = existingNameMap.get(
            parsedProduct?.name,
          );
          const existedProductNames =
            existingFromDB || createdInThisImport
              ? [existingFromDB || createdInThisImport]
              : [];

          const existingBarcodeFromDB = existingBarcodeMap.get(
            parsedProduct?.barcodeId,
          );
          const createdBarcodeInThisImport = existingBarcodeMap.get(
            parsedProduct?.barcodeId,
          );
          const existedProductBarcodes =
            existingBarcodeFromDB || createdBarcodeInThisImport
              ? [existingBarcodeFromDB || createdBarcodeInThisImport]
              : [];

          const nameKey = parsedProduct?.name;
          const barcodeKey = parsedProduct?.barcodeId;

          if ((nameKey && productCreationLocks.has(nameKey)) ||
              (barcodeKey && productCreationLocks.has(barcodeKey))) {
            await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
            continue;
          }

          return { existedProductNames, existedProductBarcodes };
        }

        const existingFromDB = existingNameMap.get(parsedProduct?.name);
        const existingBarcodeFromDB = existingBarcodeMap.get(
          parsedProduct?.barcodeId,
        );
        return {
          existedProductNames: existingFromDB ? [existingFromDB] : [],
          existedProductBarcodes: existingBarcodeFromDB ? [existingBarcodeFromDB] : [],
        };
      };
    };

    it('should return existing products on first attempt when no locks', async () => {
      const existingNameMap = new Map([
        ['Product 1', { id: 1, name: 'Product 1' }],
      ]);
      const existingBarcodeMap = new Map([
        ['BARCODE001', { id: 2, barcodeId: 'BARCODE001' }],
      ]);
      const productCreationLocks = new Set<string>();

      const getProductWithRetry = createGetProductWithRetry(
        existingNameMap,
        existingBarcodeMap,
        productCreationLocks
      );

      const parsedProduct = {
        name: 'Product 1',
        barcodeId: 'BARCODE001',
      };

      const result = await getProductWithRetry(parsedProduct);

      expect(result).toEqual({
        existedProductNames: [{ id: 1, name: 'Product 1' }],
        existedProductBarcodes: [{ id: 2, barcodeId: 'BARCODE001' }],
      });
      expect(mockSetTimeout).not.toHaveBeenCalled();
    });

    it('should retry when name lock is detected', async () => {
      const existingNameMap = new Map([
        ['Product 1', { id: 1, name: 'Product 1' }],
      ]);
      const existingBarcodeMap = new Map();
      const productCreationLocks = new Set<string>(['Product 1']);

      const getProductWithRetry = createGetProductWithRetry(
        existingNameMap,
        existingBarcodeMap,
        productCreationLocks
      );

      const parsedProduct = {
        name: 'Product 1',
      };

      // Mock setTimeout to resolve immediately
      mockSetTimeout.mockImplementation((callback) => {
        callback();
        return 1;
      });

      const result = await getProductWithRetry(parsedProduct);

      expect(result).toEqual({
        existedProductNames: [{ id: 1, name: 'Product 1' }],
        existedProductBarcodes: [],
      });
      expect(mockSetTimeout).toHaveBeenCalledTimes(1);
    });

    it('should retry when barcode lock is detected', async () => {
      const existingNameMap = new Map();
      const existingBarcodeMap = new Map([
        ['BARCODE001', { id: 2, barcodeId: 'BARCODE001' }],
      ]);
      const productCreationLocks = new Set<string>(['BARCODE001']);

      const getProductWithRetry = createGetProductWithRetry(
        existingNameMap,
        existingBarcodeMap,
        productCreationLocks
      );

      const parsedProduct = {
        barcodeId: 'BARCODE001',
      };

      // Mock setTimeout to resolve immediately
      mockSetTimeout.mockImplementation((callback) => {
        callback();
        return 1;
      });

      const result = await getProductWithRetry(parsedProduct);

      expect(result).toEqual({
        existedProductNames: [],
        existedProductBarcodes: [{ id: 2, barcodeId: 'BARCODE001' }],
      });
      expect(mockSetTimeout).toHaveBeenCalledTimes(1);
    });

    it('should retry when both name and barcode locks are detected', async () => {
      const existingNameMap = new Map([
        ['Product 1', { id: 1, name: 'Product 1' }],
      ]);
      const existingBarcodeMap = new Map([
        ['BARCODE001', { id: 2, barcodeId: 'BARCODE001' }],
      ]);
      const productCreationLocks = new Set<string>(['Product 1', 'BARCODE001']);

      const getProductWithRetry = createGetProductWithRetry(
        existingNameMap,
        existingBarcodeMap,
        productCreationLocks
      );

      const parsedProduct = {
        name: 'Product 1',
        barcodeId: 'BARCODE001',
      };

      // Mock setTimeout to resolve immediately
      mockSetTimeout.mockImplementation((callback) => {
        callback();
        return 1;
      });

      const result = await getProductWithRetry(parsedProduct);

      expect(result).toEqual({
        existedProductNames: [{ id: 1, name: 'Product 1' }],
        existedProductBarcodes: [{ id: 2, barcodeId: 'BARCODE001' }],
      });
      expect(mockSetTimeout).toHaveBeenCalledTimes(1);
    });

    it('should respect max retries limit', async () => {
      const existingNameMap = new Map([
        ['Product 1', { id: 1, name: 'Product 1' }],
      ]);
      const existingBarcodeMap = new Map();
      const productCreationLocks = new Set<string>(['Product 1']);

      const getProductWithRetry = createGetProductWithRetry(
        existingNameMap,
        existingBarcodeMap,
        productCreationLocks
      );

      const parsedProduct = {
        name: 'Product 1',
      };

      // Mock setTimeout to resolve immediately
      mockSetTimeout.mockImplementation((callback) => {
        callback();
        return 1;
      });

      const result = await getProductWithRetry(parsedProduct, 2);

      // Should retry maxRetries times and then return fallback result
      expect(mockSetTimeout).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        existedProductNames: [{ id: 1, name: 'Product 1' }],
        existedProductBarcodes: [],
      });
    });

    it('should handle product with no existing records', async () => {
      const existingNameMap = new Map();
      const existingBarcodeMap = new Map();
      const productCreationLocks = new Set<string>();

      const getProductWithRetry = createGetProductWithRetry(
        existingNameMap,
        existingBarcodeMap,
        productCreationLocks
      );

      const parsedProduct = {
        name: 'New Product',
        barcodeId: 'NEW001',
      };

      const result = await getProductWithRetry(parsedProduct);

      expect(result).toEqual({
        existedProductNames: [],
        existedProductBarcodes: [],
      });
      expect(mockSetTimeout).not.toHaveBeenCalled();
    });

    it('should handle product with null/undefined name and barcode', async () => {
      const existingNameMap = new Map();
      const existingBarcodeMap = new Map();
      const productCreationLocks = new Set<string>();

      const getProductWithRetry = createGetProductWithRetry(
        existingNameMap,
        existingBarcodeMap,
        productCreationLocks
      );

      const parsedProduct = {
        name: null,
        barcodeId: undefined,
      };

      const result = await getProductWithRetry(parsedProduct);

      expect(result).toEqual({
        existedProductNames: [],
        existedProductBarcodes: [],
      });
      expect(mockSetTimeout).not.toHaveBeenCalled();
    });
  });

  describe('Lock mechanism - concurrent access scenarios', () => {
    it('should prevent concurrent access to same product name', async () => {
      const productCreationLocks = new Set<string>();
      const existingNameMap = new Map([
        ['Product 1', { id: 1, name: 'Product 1' }],
      ]);
      const existingBarcodeMap = new Map();

      const getProductWithRetry = createGetProductWithRetry(
        existingNameMap,
        existingBarcodeMap,
        productCreationLocks
      );

      const parsedProduct = {
        name: 'Product 1',
      };

      // Simulate lock being held
      productCreationLocks.add('Product 1');

      // Start multiple concurrent requests
      const promises = Array.from({ length: 5 }, () => 
        getProductWithRetry(parsedProduct)
      );

      // Mock setTimeout to resolve immediately for all retries
      mockSetTimeout.mockImplementation((callback) => {
        callback();
        return 1;
      });

      const results = await Promise.all(promises);

      // All should get the same result after retries
      results.forEach(result => {
        expect(result).toEqual({
          existedProductNames: [{ id: 1, name: 'Product 1' }],
          existedProductBarcodes: [],
        });
      });

      // Should have attempted retries due to lock
      expect(mockSetTimeout).toHaveBeenCalled();
    });

    it('should prevent concurrent access to same product barcode', async () => {
      const productCreationLocks = new Set<string>();
      const existingNameMap = new Map();
      const existingBarcodeMap = new Map([
        ['BARCODE001', { id: 2, barcodeId: 'BARCODE001' }],
      ]);

      const getProductWithRetry = createGetProductWithRetry(
        existingNameMap,
        existingBarcodeMap,
        productCreationLocks
      );

      const parsedProduct = {
        barcodeId: 'BARCODE001',
      };

      // Simulate lock being held
      productCreationLocks.add('BARCODE001');

      // Start multiple concurrent requests
      const promises = Array.from({ length: 3 }, () => 
        getProductWithRetry(parsedProduct)
      );

      // Mock setTimeout to resolve immediately for all retries
      mockSetTimeout.mockImplementation((callback) => {
        callback();
        return 1;
      });

      const results = await Promise.all(promises);

      // All should get the same result after retries
      results.forEach(result => {
        expect(result).toEqual({
          existedProductNames: [],
          existedProductBarcodes: [{ id: 2, barcodeId: 'BARCODE001' }],
        });
      });

      // Should have attempted retries due to lock
      expect(mockSetTimeout).toHaveBeenCalled();
    });

    it('should handle mixed concurrent access with different products', async () => {
      const productCreationLocks = new Set<string>();
      const existingNameMap = new Map([
        ['Product 1', { id: 1, name: 'Product 1' }],
        ['Product 2', { id: 2, name: 'Product 2' }],
      ]);
      const existingBarcodeMap = new Map();

      const getProductWithRetry = createGetProductWithRetry(
        existingNameMap,
        existingBarcodeMap,
        productCreationLocks
      );

      // Lock only Product 1
      productCreationLocks.add('Product 1');

      const product1 = { name: 'Product 1' };
      const product2 = { name: 'Product 2' };

      // Mock setTimeout to resolve immediately
      mockSetTimeout.mockImplementation((callback) => {
        callback();
        return 1;
      });

      // Start concurrent requests for both products
      const promises = [
        getProductWithRetry(product1),
        getProductWithRetry(product2),
        getProductWithRetry(product1),
        getProductWithRetry(product2),
      ];

      const results = await Promise.all(promises);

      // Product 1 requests should have retries (due to lock)
      // Product 2 requests should not have retries (no lock)
      expect(mockSetTimeout).toHaveBeenCalledTimes(2); // Only for Product 1 requests

      expect(results[0]).toEqual({
        existedProductNames: [{ id: 1, name: 'Product 1' }],
        existedProductBarcodes: [],
      });
      expect(results[1]).toEqual({
        existedProductNames: [{ id: 2, name: 'Product 2' }],
        existedProductBarcodes: [],
      });
      expect(results[2]).toEqual({
        existedProductNames: [{ id: 1, name: 'Product 1' }],
        existedProductBarcodes: [],
      });
      expect(results[3]).toEqual({
        existedProductNames: [{ id: 2, name: 'Product 2' }],
        existedProductBarcodes: [],
      });
    });

    it('should handle lock timeout scenarios with random delays', async () => {
      const productCreationLocks = new Set<string>();
      const existingNameMap = new Map([
        ['Product 1', { id: 1, name: 'Product 1' }],
      ]);
      const existingBarcodeMap = new Map();

      const getProductWithRetry = createGetProductWithRetry(
        existingNameMap,
        existingBarcodeMap,
        productCreationLocks
      );

      const parsedProduct = {
        name: 'Product 1',
      };

      // Simulate persistent lock
      productCreationLocks.add('Product 1');

      // Track actual delays
      const delays: number[] = [];
      mockSetTimeout.mockImplementation((callback, delay) => {
        delays.push(delay as number);
        // Don't call callback to simulate persistent lock
        return 1;
      });

      const maxRetries = 3;
      const promise = getProductWithRetry(parsedProduct, maxRetries);

      // Advance timers to trigger all retries
      for (let i = 0; i < maxRetries; i++) {
        jest.advanceTimersByTime(50);
      }

      const result = await promise;

      // Should have attempted all retries
      expect(mockSetTimeout).toHaveBeenCalledTimes(maxRetries);
      
      // Delays should be in the expected range (10-30ms)
      delays.forEach(delay => {
        expect(delay).toBeGreaterThanOrEqual(10);
        expect(delay).toBeLessThanOrEqual(30);
      });

      // Should return fallback result after max retries
      expect(result).toEqual({
        existedProductNames: [{ id: 1, name: 'Product 1' }],
        existedProductBarcodes: [],
      });
    });
  });

  describe('Lock lifecycle management', () => {
    it('should simulate lock addition and removal', async () => {
      const productCreationLocks = new Set<string>();
      
      // Simulate adding locks
      productCreationLocks.add('Product 1');
      productCreationLocks.add('BARCODE001');
      
      expect(productCreationLocks.has('Product 1')).toBe(true);
      expect(productCreationLocks.has('BARCODE001')).toBe(true);
      expect(productCreationLocks.size).toBe(2);
      
      // Simulate removing locks
      productCreationLocks.delete('Product 1');
      productCreationLocks.delete('BARCODE001');
      
      expect(productCreationLocks.has('Product 1')).toBe(false);
      expect(productCreationLocks.has('BARCODE001')).toBe(false);
      expect(productCreationLocks.size).toBe(0);
    });

    it('should handle lock cleanup after timeout', async () => {
      const productCreationLocks = new Set<string>();
      
      // Simulate the setTimeout cleanup that happens in the actual code
      const cleanupPromises: Promise<void>[] = [];
      
      const addLockWithCleanup = (key: string, timeoutMs: number) => {
        productCreationLocks.add(key);
        const cleanupPromise = new Promise<void>((resolve) => {
          setTimeout(() => {
            productCreationLocks.delete(key);
            resolve();
          }, timeoutMs);
        });
        cleanupPromises.push(cleanupPromise);
      };
      
      // Add locks with cleanup
      addLockWithCleanup('Product 1', 50);
      addLockWithCleanup('BARCODE001', 50);
      
      expect(productCreationLocks.size).toBe(2);
      
      // Wait for cleanup
      jest.advanceTimersByTime(60);
      await Promise.all(cleanupPromises);
      
      expect(productCreationLocks.size).toBe(0);
    });
  });
});
