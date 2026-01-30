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
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var batchValidationHelpers_1 = require("../../../src/graphql/models/product/helpers/importing/utils/helpers/batchValidationHelpers");
var checkSerialNumbersAvailability_1 = require("../../../src/graphql/models/product/helpers/importing/utils/helpers/actions/handleNormalisedFields/checkSerialNumbersAvailability");
var utils_1 = require("../../../src/graphql/helpers/importingHelpers/utils");
// Mock the dependencies
globals_1.jest.mock('../../../src/graphql/models/product/helpers/importing/utils/helpers/actions/handleNormalisedFields/checkSerialNumbersAvailability');
globals_1.jest.mock('../../../src/graphql/helpers/importingHelpers/utils');
var mockCheckSerialNumbersAvailability = checkSerialNumbersAvailability_1.checkSerialNumbersAvailability;
var mockCheckAllImages = utils_1.checkAllImages;
describe('Integration Tests - Batch Validation', function () {
    beforeEach(function () {
        globals_1.jest.clearAllMocks();
    });
    describe('Real-world scenarios', function () {
        it('should handle large batch of products with mixed data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products, tenantFilter, tenantId, _a, serialAvailabilityMap, imageValidationMap;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        products = Array.from({ length: 100 }, function (_, index) { return ({
                            name: "Product ".concat(index + 1),
                            barcodeId: "BARCODE".concat(String(index + 1).padStart(3, '0')),
                            images: index % 3 === 0 ? ["img-".concat(index + 1)] : [],
                            productItems: index % 2 === 0 ? [{
                                    serialNumbers: index % 4 === 0 ? ["SN".concat(index + 1)] : []
                                }] : [],
                        }); });
                        tenantFilter = { tenant: 'test-tenant' };
                        tenantId = 'test-tenant';
                        // Mock serial number availability
                        mockCheckSerialNumbersAvailability.mockImplementation(function (_a) {
                            var _b;
                            var serialNumbers = _a.serialNumbers;
                            return ({
                                isAllSerialNumbersAvailable: ((_b = serialNumbers[0]) === null || _b === void 0 ? void 0 : _b.endsWith('1')) || false, // Only odd numbers are available
                                existedSerialNumbers: [],
                            });
                        });
                        // Mock image validation
                        mockCheckAllImages.mockImplementation(function (images) {
                            var _a, _b;
                            return ({
                                isImagesIdsValid: ((_a = images[0]) === null || _a === void 0 ? void 0 : _a.includes('1')) || false, // Only images with '1' are valid
                                imagesIdsArray: ((_b = images[0]) === null || _b === void 0 ? void 0 : _b.includes('1')) ? ["file-".concat(images[0])] : [],
                            });
                        });
                        return [4 /*yield*/, Promise.all([
                                (0, batchValidationHelpers_1.batchValidateSerialNumbers)(products, tenantFilter),
                                (0, batchValidationHelpers_1.batchValidateImages)(products, tenantId),
                            ])];
                    case 1:
                        _a = _b.sent(), serialAvailabilityMap = _a[0], imageValidationMap = _a[1];
                        // Verify serial number validation
                        expect(serialAvailabilityMap.size).toBeGreaterThan(0);
                        expect(mockCheckSerialNumbersAvailability).toHaveBeenCalledTimes(
                        // Should be called for each unique serial number
                        products.filter(function (p) { var _a, _b, _c; return (_c = (_b = (_a = p.productItems) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.serialNumbers) === null || _c === void 0 ? void 0 : _c.length; }).length);
                        // Verify image validation
                        expect(imageValidationMap.size).toBeGreaterThan(0);
                        expect(mockCheckAllImages).toHaveBeenCalledTimes(
                        // Should be called for each unique image
                        products.filter(function (p) { var _a; return (_a = p.images) === null || _a === void 0 ? void 0 : _a.length; }).length);
                        // Verify specific cases
                        expect(serialAvailabilityMap.get('SN1')).toBe(true);
                        expect(serialAvailabilityMap.get('SN2')).toBe(false);
                        expect(imageValidationMap.get('img-1')).toEqual({ isValid: true, ids: ['file-img-1'] });
                        expect(imageValidationMap.get('img-2')).toEqual({ isValid: false, ids: [] });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle edge cases with malformed data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products, tenantFilter, tenantId, _a, serialAvailabilityMap, imageValidationMap;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        products = [
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
                        tenantFilter = { tenant: 'test-tenant' };
                        tenantId = 'test-tenant';
                        mockCheckSerialNumbersAvailability.mockResolvedValue({
                            isAllSerialNumbersAvailable: true,
                            existedSerialNumbers: [],
                        });
                        mockCheckAllImages.mockResolvedValue({
                            isImagesIdsValid: true,
                            imagesIdsArray: ['file-id'],
                        });
                        return [4 /*yield*/, Promise.all([
                                (0, batchValidationHelpers_1.batchValidateSerialNumbers)(products, tenantFilter),
                                (0, batchValidationHelpers_1.batchValidateImages)(products, tenantId),
                            ])];
                    case 1:
                        _a = _b.sent(), serialAvailabilityMap = _a[0], imageValidationMap = _a[1];
                        // Should handle malformed data gracefully
                        expect(serialAvailabilityMap.get('valid-sn')).toBe(true);
                        expect(serialAvailabilityMap.get('sn-null')).toBe(true);
                        expect(imageValidationMap.get('valid-img')).toEqual({ isValid: true, ids: ['file-id'] });
                        expect(imageValidationMap.get('img-null')).toEqual({ isValid: true, ids: ['file-id'] });
                        expect(imageValidationMap.get('img-malformed')).toEqual({ isValid: true, ids: ['file-id'] });
                        // Should not attempt to validate null/undefined values
                        expect(mockCheckSerialNumbersAvailability).toHaveBeenCalledWith({
                            serialNumbers: ['valid-sn'],
                            tenantFilter: tenantFilter,
                        });
                        expect(mockCheckSerialNumbersAvailability).toHaveBeenCalledWith({
                            serialNumbers: ['sn-null'],
                            tenantFilter: tenantFilter,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle concurrent batch validation', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products1, products2, tenantFilter, callCount, _a, result1, result2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        products1 = Array.from({ length: 50 }, function (_, index) { return ({
                            name: "Batch1 Product ".concat(index + 1),
                            productItems: [{ serialNumbers: ["B1-SN".concat(index + 1)] }],
                        }); });
                        products2 = Array.from({ length: 50 }, function (_, index) { return ({
                            name: "Batch2 Product ".concat(index + 1),
                            productItems: [{ serialNumbers: ["B2-SN".concat(index + 1)] }],
                        }); });
                        tenantFilter = { tenant: 'test-tenant' };
                        callCount = 0;
                        mockCheckSerialNumbersAvailability.mockImplementation(function (_a) {
                            var serialNumbers = _a.serialNumbers;
                            callCount++;
                            return {
                                isAllSerialNumbersAvailable: true,
                                existedSerialNumbers: [],
                            };
                        });
                        return [4 /*yield*/, Promise.all([
                                (0, batchValidationHelpers_1.batchValidateSerialNumbers)(products1, tenantFilter),
                                (0, batchValidationHelpers_1.batchValidateSerialNumbers)(products2, tenantFilter),
                            ])];
                    case 1:
                        _a = _b.sent(), result1 = _a[0], result2 = _a[1];
                        // Should handle both batches independently
                        expect(result1.size).toBe(50);
                        expect(result2.size).toBe(50);
                        expect(callCount).toBe(100); // 50 calls for each batch
                        // Verify results are separate
                        expect(result1.get('B1-SN1')).toBe(true);
                        expect(result2.get('B2-SN1')).toBe(true);
                        expect(result1.has('B2-SN1')).toBe(false);
                        expect(result2.has('B1-SN1')).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle performance with large datasets', function () { return __awaiter(void 0, void 0, void 0, function () {
            var startTime, products, tenantFilter, tenantId, _a, serialAvailabilityMap, imageValidationMap, endTime, duration;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        products = Array.from({ length: 1000 }, function (_, index) { return ({
                            name: "Product ".concat(index + 1),
                            images: ["img-".concat(index + 1)],
                            productItems: Array.from({ length: 5 }, function (_, itemIndex) { return ({
                                serialNumbers: ["SN".concat(index + 1, "-").concat(itemIndex + 1)],
                            }); }),
                        }); });
                        tenantFilter = { tenant: 'test-tenant' };
                        tenantId = 'test-tenant';
                        mockCheckSerialNumbersAvailability.mockResolvedValue({
                            isAllSerialNumbersAvailable: true,
                            existedSerialNumbers: [],
                        });
                        mockCheckAllImages.mockResolvedValue({
                            isImagesIdsValid: true,
                            imagesIdsArray: ["file-id"],
                        });
                        return [4 /*yield*/, Promise.all([
                                (0, batchValidationHelpers_1.batchValidateSerialNumbers)(products, tenantFilter),
                                (0, batchValidationHelpers_1.batchValidateImages)(products, tenantId),
                            ])];
                    case 1:
                        _a = _b.sent(), serialAvailabilityMap = _a[0], imageValidationMap = _a[1];
                        endTime = Date.now();
                        duration = endTime - startTime;
                        // Should complete within reasonable time (adjust threshold as needed)
                        expect(duration).toBeLessThan(5000); // 5 seconds
                        // Should process all unique serial numbers (1000 products * 5 items = 5000 serial numbers)
                        expect(serialAvailabilityMap.size).toBe(5000);
                        // Should process all unique images (1000 images)
                        expect(imageValidationMap.size).toBe(1000);
                        // Should make correct number of API calls
                        expect(mockCheckSerialNumbersAvailability).toHaveBeenCalledTimes(5000);
                        expect(mockCheckAllImages).toHaveBeenCalledTimes(1000);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle error scenarios gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products, tenantFilter, tenantId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        products = [
                            {
                                name: 'Product 1',
                                productItems: [{ serialNumbers: ['SN1'] }],
                            },
                            {
                                name: 'Product 2',
                                images: ['img1'],
                            },
                        ];
                        tenantFilter = { tenant: 'test-tenant' };
                        tenantId = 'test-tenant';
                        // Mock errors
                        mockCheckSerialNumbersAvailability.mockRejectedValueOnce(new Error('Database connection failed'));
                        mockCheckAllImages.mockRejectedValueOnce(new Error('File service unavailable'));
                        // Should handle errors without crashing
                        return [4 /*yield*/, expect((0, batchValidationHelpers_1.batchValidateSerialNumbers)(products, tenantFilter)).rejects.toThrow('Database connection failed')];
                    case 1:
                        // Should handle errors without crashing
                        _a.sent();
                        return [4 /*yield*/, expect((0, batchValidationHelpers_1.batchValidateImages)(products, tenantId)).rejects.toThrow('File service unavailable')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Data consistency and integrity', function () {
        it('should maintain data consistency across duplicate entries', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products, tenantFilter, tenantId, serialResults, imageResults, _a, serialAvailabilityMap, imageValidationMap;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        products = [
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
                        tenantFilter = { tenant: 'test-tenant' };
                        tenantId = 'test-tenant';
                        serialResults = new Map([
                            ['shared-sn-1', true],
                            ['shared-sn-2', false],
                            ['unique-sn-1', true],
                            ['unique-sn-3', true],
                        ]);
                        imageResults = new Map([
                            ['shared-img-1', { isValid: true, ids: ['file-shared-1'] }],
                            ['unique-img-1', { isValid: false, ids: [] }],
                            ['unique-img-2', { isValid: true, ids: ['file-unique-2'] }],
                        ]);
                        mockCheckSerialNumbersAvailability.mockImplementation(function (_a) {
                            var serialNumbers = _a.serialNumbers;
                            return ({
                                isAllSerialNumbersAvailable: serialResults.get(serialNumbers[0]) || false,
                                existedSerialNumbers: [],
                            });
                        });
                        mockCheckAllImages.mockImplementation(function (images) {
                            var _a, _b;
                            return ({
                                isImagesIdsValid: ((_a = imageResults.get(images[0])) === null || _a === void 0 ? void 0 : _a.isValid) || false,
                                imagesIdsArray: ((_b = imageResults.get(images[0])) === null || _b === void 0 ? void 0 : _b.ids) || [],
                            });
                        });
                        return [4 /*yield*/, Promise.all([
                                (0, batchValidationHelpers_1.batchValidateSerialNumbers)(products, tenantFilter),
                                (0, batchValidationHelpers_1.batchValidateImages)(products, tenantId),
                            ])];
                    case 1:
                        _a = _b.sent(), serialAvailabilityMap = _a[0], imageValidationMap = _a[1];
                        // Should only validate unique values once
                        expect(mockCheckSerialNumbersAvailability).toHaveBeenCalledTimes(4); // 4 unique serials
                        expect(mockCheckAllImages).toHaveBeenCalledTimes(3); // 3 unique images
                        // All duplicates should have same result
                        expect(serialAvailabilityMap.get('shared-sn-1')).toBe(true);
                        expect(imageValidationMap.get('shared-img-1')).toEqual({ isValid: true, ids: ['file-shared-1'] });
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
