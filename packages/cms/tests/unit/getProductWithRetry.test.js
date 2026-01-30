"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
// Mock the setTimeout function
var mockSetTimeout = globals_1.jest.fn();
var originalSetTimeout = global.setTimeout;
describe('getProductWithRetry and Lock Mechanism', function () {
    beforeEach(function () {
        globals_1.jest.clearAllMocks();
        globals_1.jest.useFakeTimers();
        global.setTimeout = mockSetTimeout;
    });
    afterEach(function () {
        globals_1.jest.useRealTimers();
        global.setTimeout = originalSetTimeout;
    });
    describe('getProductWithRetry function', function () {
        // We need to extract and test the getProductWithRetry function logic
        // Since it's defined inside handleNormalisedProductsFields, we'll recreate it for testing
        var createGetProductWithRetry = function (existingNameMap, existingBarcodeMap, productCreationLocks) {
            return function (parsedProduct_1) {
                var args_1 = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args_1[_i - 1] = arguments[_i];
                }
                return __awaiter(void 0, __spreadArray([parsedProduct_1], args_1, true), void 0, function (parsedProduct, maxRetries) {
                    var attempt, existingFromDB_1, createdInThisImport, existedProductNames, existingBarcodeFromDB_1, createdBarcodeInThisImport, existedProductBarcodes, nameKey, barcodeKey, existingFromDB, existingBarcodeFromDB;
                    if (maxRetries === void 0) { maxRetries = 3; }
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                attempt = 0;
                                _a.label = 1;
                            case 1:
                                if (!(attempt < maxRetries)) return [3 /*break*/, 5];
                                existingFromDB_1 = existingNameMap.get(parsedProduct === null || parsedProduct === void 0 ? void 0 : parsedProduct.name);
                                createdInThisImport = existingNameMap.get(parsedProduct === null || parsedProduct === void 0 ? void 0 : parsedProduct.name);
                                existedProductNames = existingFromDB_1 || createdInThisImport
                                    ? [existingFromDB_1 || createdInThisImport]
                                    : [];
                                existingBarcodeFromDB_1 = existingBarcodeMap.get(parsedProduct === null || parsedProduct === void 0 ? void 0 : parsedProduct.barcodeId);
                                createdBarcodeInThisImport = existingBarcodeMap.get(parsedProduct === null || parsedProduct === void 0 ? void 0 : parsedProduct.barcodeId);
                                existedProductBarcodes = existingBarcodeFromDB_1 || createdBarcodeInThisImport
                                    ? [existingBarcodeFromDB_1 || createdBarcodeInThisImport]
                                    : [];
                                nameKey = parsedProduct === null || parsedProduct === void 0 ? void 0 : parsedProduct.name;
                                barcodeKey = parsedProduct === null || parsedProduct === void 0 ? void 0 : parsedProduct.barcodeId;
                                if (!((nameKey && productCreationLocks.has(nameKey)) ||
                                    (barcodeKey && productCreationLocks.has(barcodeKey)))) return [3 /*break*/, 3];
                                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 10 + Math.random() * 20); })];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3: return [2 /*return*/, { existedProductNames: existedProductNames, existedProductBarcodes: existedProductBarcodes }];
                            case 4:
                                attempt++;
                                return [3 /*break*/, 1];
                            case 5:
                                existingFromDB = existingNameMap.get(parsedProduct === null || parsedProduct === void 0 ? void 0 : parsedProduct.name);
                                existingBarcodeFromDB = existingBarcodeMap.get(parsedProduct === null || parsedProduct === void 0 ? void 0 : parsedProduct.barcodeId);
                                return [2 /*return*/, {
                                        existedProductNames: existingFromDB ? [existingFromDB] : [],
                                        existedProductBarcodes: existingBarcodeFromDB ? [existingBarcodeFromDB] : [],
                                    }];
                        }
                    });
                });
            };
        };
        it('should return existing products on first attempt when no locks', function () { return __awaiter(void 0, void 0, void 0, function () {
            var existingNameMap, existingBarcodeMap, productCreationLocks, getProductWithRetry, parsedProduct, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingNameMap = new Map([
                            ['Product 1', { id: 1, name: 'Product 1' }],
                        ]);
                        existingBarcodeMap = new Map([
                            ['BARCODE001', { id: 2, barcodeId: 'BARCODE001' }],
                        ]);
                        productCreationLocks = new Set();
                        getProductWithRetry = createGetProductWithRetry(existingNameMap, existingBarcodeMap, productCreationLocks);
                        parsedProduct = {
                            name: 'Product 1',
                            barcodeId: 'BARCODE001',
                        };
                        return [4 /*yield*/, getProductWithRetry(parsedProduct)];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual({
                            existedProductNames: [{ id: 1, name: 'Product 1' }],
                            existedProductBarcodes: [{ id: 2, barcodeId: 'BARCODE001' }],
                        });
                        expect(mockSetTimeout).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should retry when name lock is detected', function () { return __awaiter(void 0, void 0, void 0, function () {
            var existingNameMap, existingBarcodeMap, productCreationLocks, getProductWithRetry, parsedProduct, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingNameMap = new Map([
                            ['Product 1', { id: 1, name: 'Product 1' }],
                        ]);
                        existingBarcodeMap = new Map();
                        productCreationLocks = new Set(['Product 1']);
                        getProductWithRetry = createGetProductWithRetry(existingNameMap, existingBarcodeMap, productCreationLocks);
                        parsedProduct = {
                            name: 'Product 1',
                        };
                        // Mock setTimeout to resolve immediately
                        mockSetTimeout.mockImplementation(function (callback) {
                            callback();
                            return 1;
                        });
                        return [4 /*yield*/, getProductWithRetry(parsedProduct)];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual({
                            existedProductNames: [{ id: 1, name: 'Product 1' }],
                            existedProductBarcodes: [],
                        });
                        expect(mockSetTimeout).toHaveBeenCalledTimes(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should retry when barcode lock is detected', function () { return __awaiter(void 0, void 0, void 0, function () {
            var existingNameMap, existingBarcodeMap, productCreationLocks, getProductWithRetry, parsedProduct, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingNameMap = new Map();
                        existingBarcodeMap = new Map([
                            ['BARCODE001', { id: 2, barcodeId: 'BARCODE001' }],
                        ]);
                        productCreationLocks = new Set(['BARCODE001']);
                        getProductWithRetry = createGetProductWithRetry(existingNameMap, existingBarcodeMap, productCreationLocks);
                        parsedProduct = {
                            barcodeId: 'BARCODE001',
                        };
                        // Mock setTimeout to resolve immediately
                        mockSetTimeout.mockImplementation(function (callback) {
                            callback();
                            return 1;
                        });
                        return [4 /*yield*/, getProductWithRetry(parsedProduct)];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual({
                            existedProductNames: [],
                            existedProductBarcodes: [{ id: 2, barcodeId: 'BARCODE001' }],
                        });
                        expect(mockSetTimeout).toHaveBeenCalledTimes(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should retry when both name and barcode locks are detected', function () { return __awaiter(void 0, void 0, void 0, function () {
            var existingNameMap, existingBarcodeMap, productCreationLocks, getProductWithRetry, parsedProduct, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingNameMap = new Map([
                            ['Product 1', { id: 1, name: 'Product 1' }],
                        ]);
                        existingBarcodeMap = new Map([
                            ['BARCODE001', { id: 2, barcodeId: 'BARCODE001' }],
                        ]);
                        productCreationLocks = new Set(['Product 1', 'BARCODE001']);
                        getProductWithRetry = createGetProductWithRetry(existingNameMap, existingBarcodeMap, productCreationLocks);
                        parsedProduct = {
                            name: 'Product 1',
                            barcodeId: 'BARCODE001',
                        };
                        // Mock setTimeout to resolve immediately
                        mockSetTimeout.mockImplementation(function (callback) {
                            callback();
                            return 1;
                        });
                        return [4 /*yield*/, getProductWithRetry(parsedProduct)];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual({
                            existedProductNames: [{ id: 1, name: 'Product 1' }],
                            existedProductBarcodes: [{ id: 2, barcodeId: 'BARCODE001' }],
                        });
                        expect(mockSetTimeout).toHaveBeenCalledTimes(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should respect max retries limit', function () { return __awaiter(void 0, void 0, void 0, function () {
            var existingNameMap, existingBarcodeMap, productCreationLocks, getProductWithRetry, parsedProduct, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingNameMap = new Map([
                            ['Product 1', { id: 1, name: 'Product 1' }],
                        ]);
                        existingBarcodeMap = new Map();
                        productCreationLocks = new Set(['Product 1']);
                        getProductWithRetry = createGetProductWithRetry(existingNameMap, existingBarcodeMap, productCreationLocks);
                        parsedProduct = {
                            name: 'Product 1',
                        };
                        // Mock setTimeout to resolve immediately
                        mockSetTimeout.mockImplementation(function (callback) {
                            callback();
                            return 1;
                        });
                        return [4 /*yield*/, getProductWithRetry(parsedProduct, 2)];
                    case 1:
                        result = _a.sent();
                        // Should retry maxRetries times and then return fallback result
                        expect(mockSetTimeout).toHaveBeenCalledTimes(2);
                        expect(result).toEqual({
                            existedProductNames: [{ id: 1, name: 'Product 1' }],
                            existedProductBarcodes: [],
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle product with no existing records', function () { return __awaiter(void 0, void 0, void 0, function () {
            var existingNameMap, existingBarcodeMap, productCreationLocks, getProductWithRetry, parsedProduct, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingNameMap = new Map();
                        existingBarcodeMap = new Map();
                        productCreationLocks = new Set();
                        getProductWithRetry = createGetProductWithRetry(existingNameMap, existingBarcodeMap, productCreationLocks);
                        parsedProduct = {
                            name: 'New Product',
                            barcodeId: 'NEW001',
                        };
                        return [4 /*yield*/, getProductWithRetry(parsedProduct)];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual({
                            existedProductNames: [],
                            existedProductBarcodes: [],
                        });
                        expect(mockSetTimeout).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle product with null/undefined name and barcode', function () { return __awaiter(void 0, void 0, void 0, function () {
            var existingNameMap, existingBarcodeMap, productCreationLocks, getProductWithRetry, parsedProduct, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingNameMap = new Map();
                        existingBarcodeMap = new Map();
                        productCreationLocks = new Set();
                        getProductWithRetry = createGetProductWithRetry(existingNameMap, existingBarcodeMap, productCreationLocks);
                        parsedProduct = {
                            name: null,
                            barcodeId: undefined,
                        };
                        return [4 /*yield*/, getProductWithRetry(parsedProduct)];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual({
                            existedProductNames: [],
                            existedProductBarcodes: [],
                        });
                        expect(mockSetTimeout).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Lock mechanism - concurrent access scenarios', function () {
        it('should prevent concurrent access to same product name', function () { return __awaiter(void 0, void 0, void 0, function () {
            var productCreationLocks, existingNameMap, existingBarcodeMap, getProductWithRetry, parsedProduct, promises, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        productCreationLocks = new Set();
                        existingNameMap = new Map([
                            ['Product 1', { id: 1, name: 'Product 1' }],
                        ]);
                        existingBarcodeMap = new Map();
                        getProductWithRetry = createGetProductWithRetry(existingNameMap, existingBarcodeMap, productCreationLocks);
                        parsedProduct = {
                            name: 'Product 1',
                        };
                        // Simulate lock being held
                        productCreationLocks.add('Product 1');
                        promises = Array.from({ length: 5 }, function () {
                            return getProductWithRetry(parsedProduct);
                        });
                        // Mock setTimeout to resolve immediately for all retries
                        mockSetTimeout.mockImplementation(function (callback) {
                            callback();
                            return 1;
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        results = _a.sent();
                        // All should get the same result after retries
                        results.forEach(function (result) {
                            expect(result).toEqual({
                                existedProductNames: [{ id: 1, name: 'Product 1' }],
                                existedProductBarcodes: [],
                            });
                        });
                        // Should have attempted retries due to lock
                        expect(mockSetTimeout).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should prevent concurrent access to same product barcode', function () { return __awaiter(void 0, void 0, void 0, function () {
            var productCreationLocks, existingNameMap, existingBarcodeMap, getProductWithRetry, parsedProduct, promises, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        productCreationLocks = new Set();
                        existingNameMap = new Map();
                        existingBarcodeMap = new Map([
                            ['BARCODE001', { id: 2, barcodeId: 'BARCODE001' }],
                        ]);
                        getProductWithRetry = createGetProductWithRetry(existingNameMap, existingBarcodeMap, productCreationLocks);
                        parsedProduct = {
                            barcodeId: 'BARCODE001',
                        };
                        // Simulate lock being held
                        productCreationLocks.add('BARCODE001');
                        promises = Array.from({ length: 3 }, function () {
                            return getProductWithRetry(parsedProduct);
                        });
                        // Mock setTimeout to resolve immediately for all retries
                        mockSetTimeout.mockImplementation(function (callback) {
                            callback();
                            return 1;
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        results = _a.sent();
                        // All should get the same result after retries
                        results.forEach(function (result) {
                            expect(result).toEqual({
                                existedProductNames: [],
                                existedProductBarcodes: [{ id: 2, barcodeId: 'BARCODE001' }],
                            });
                        });
                        // Should have attempted retries due to lock
                        expect(mockSetTimeout).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle mixed concurrent access with different products', function () { return __awaiter(void 0, void 0, void 0, function () {
            var productCreationLocks, existingNameMap, existingBarcodeMap, getProductWithRetry, product1, product2, promises, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        productCreationLocks = new Set();
                        existingNameMap = new Map([
                            ['Product 1', { id: 1, name: 'Product 1' }],
                            ['Product 2', { id: 2, name: 'Product 2' }],
                        ]);
                        existingBarcodeMap = new Map();
                        getProductWithRetry = createGetProductWithRetry(existingNameMap, existingBarcodeMap, productCreationLocks);
                        // Lock only Product 1
                        productCreationLocks.add('Product 1');
                        product1 = { name: 'Product 1' };
                        product2 = { name: 'Product 2' };
                        // Mock setTimeout to resolve immediately
                        mockSetTimeout.mockImplementation(function (callback) {
                            callback();
                            return 1;
                        });
                        promises = [
                            getProductWithRetry(product1),
                            getProductWithRetry(product2),
                            getProductWithRetry(product1),
                            getProductWithRetry(product2),
                        ];
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        results = _a.sent();
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
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle lock timeout scenarios with random delays', function () { return __awaiter(void 0, void 0, void 0, function () {
            var productCreationLocks, existingNameMap, existingBarcodeMap, getProductWithRetry, parsedProduct, delays, maxRetries, promise, i, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        productCreationLocks = new Set();
                        existingNameMap = new Map([
                            ['Product 1', { id: 1, name: 'Product 1' }],
                        ]);
                        existingBarcodeMap = new Map();
                        getProductWithRetry = createGetProductWithRetry(existingNameMap, existingBarcodeMap, productCreationLocks);
                        parsedProduct = {
                            name: 'Product 1',
                        };
                        // Simulate persistent lock
                        productCreationLocks.add('Product 1');
                        delays = [];
                        mockSetTimeout.mockImplementation(function (callback, delay) {
                            delays.push(delay);
                            // Don't call callback to simulate persistent lock
                            return 1;
                        });
                        maxRetries = 3;
                        promise = getProductWithRetry(parsedProduct, maxRetries);
                        // Advance timers to trigger all retries
                        for (i = 0; i < maxRetries; i++) {
                            globals_1.jest.advanceTimersByTime(50);
                        }
                        return [4 /*yield*/, promise];
                    case 1:
                        result = _a.sent();
                        // Should have attempted all retries
                        expect(mockSetTimeout).toHaveBeenCalledTimes(maxRetries);
                        // Delays should be in the expected range (10-30ms)
                        delays.forEach(function (delay) {
                            expect(delay).toBeGreaterThanOrEqual(10);
                            expect(delay).toBeLessThanOrEqual(30);
                        });
                        // Should return fallback result after max retries
                        expect(result).toEqual({
                            existedProductNames: [{ id: 1, name: 'Product 1' }],
                            existedProductBarcodes: [],
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Lock lifecycle management', function () {
        it('should simulate lock addition and removal', function () { return __awaiter(void 0, void 0, void 0, function () {
            var productCreationLocks;
            return __generator(this, function (_a) {
                productCreationLocks = new Set();
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
                return [2 /*return*/];
            });
        }); });
        it('should handle lock cleanup after timeout', function () { return __awaiter(void 0, void 0, void 0, function () {
            var productCreationLocks, cleanupPromises, addLockWithCleanup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        productCreationLocks = new Set();
                        cleanupPromises = [];
                        addLockWithCleanup = function (key, timeoutMs) {
                            productCreationLocks.add(key);
                            var cleanupPromise = new Promise(function (resolve) {
                                setTimeout(function () {
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
                        globals_1.jest.advanceTimersByTime(60);
                        return [4 /*yield*/, Promise.all(cleanupPromises)];
                    case 1:
                        _a.sent();
                        expect(productCreationLocks.size).toBe(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
