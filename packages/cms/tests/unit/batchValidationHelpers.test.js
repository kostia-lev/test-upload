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
describe('batchValidationHelpers', function () {
    beforeEach(function () {
        globals_1.jest.clearAllMocks();
    });
    describe('batchValidateSerialNumbers', function () {
        it('should return empty map when no serial numbers provided', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products, tenantFilter, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        products = [
                            { name: 'Product 1', productItems: [] },
                            { name: 'Product 2', productItems: [{ serialNumbers: [] }] },
                        ];
                        tenantFilter = { tenant: 'test-tenant' };
                        return [4 /*yield*/, (0, batchValidationHelpers_1.batchValidateSerialNumbers)(products, tenantFilter)];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeInstanceOf(Map);
                        expect(result.size).toBe(0);
                        expect(mockCheckSerialNumbersAvailability).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle products with null/undefined serial numbers', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products, tenantFilter, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        products = [
                            {
                                name: 'Product 1',
                                productItems: [
                                    { serialNumbers: null },
                                    { serialNumbers: undefined },
                                    { serialNumbers: ['SN001'] },
                                ],
                            },
                        ];
                        tenantFilter = { tenant: 'test-tenant' };
                        mockCheckSerialNumbersAvailability.mockResolvedValue({
                            isAllSerialNumbersAvailable: true,
                            existedSerialNumbers: [],
                        });
                        return [4 /*yield*/, (0, batchValidationHelpers_1.batchValidateSerialNumbers)(products, tenantFilter)];
                    case 1:
                        result = _a.sent();
                        expect(mockCheckSerialNumbersAvailability).toHaveBeenCalledWith({
                            serialNumbers: ['SN001'],
                            tenantFilter: tenantFilter,
                        });
                        expect(result.get('SN001')).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle duplicate serial numbers across products', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products, tenantFilter, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        products = [
                            {
                                name: 'Product 1',
                                productItems: [{ serialNumbers: ['SN001', 'SN002'] }],
                            },
                            {
                                name: 'Product 2',
                                productItems: [{ serialNumbers: ['SN001', 'SN003'] }],
                            },
                        ];
                        tenantFilter = { tenant: 'test-tenant' };
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
                        return [4 /*yield*/, (0, batchValidationHelpers_1.batchValidateSerialNumbers)(products, tenantFilter)];
                    case 1:
                        result = _a.sent();
                        // Should only check unique serial numbers
                        expect(mockCheckSerialNumbersAvailability).toHaveBeenCalledTimes(3);
                        expect(mockCheckSerialNumbersAvailability).toHaveBeenNthCalledWith(1, {
                            serialNumbers: ['SN001'],
                            tenantFilter: tenantFilter,
                        });
                        expect(mockCheckSerialNumbersAvailability).toHaveBeenNthCalledWith(2, {
                            serialNumbers: ['SN002'],
                            tenantFilter: tenantFilter,
                        });
                        expect(mockCheckSerialNumbersAvailability).toHaveBeenNthCalledWith(3, {
                            serialNumbers: ['SN003'],
                            tenantFilter: tenantFilter,
                        });
                        expect(result.get('SN001')).toBe(true);
                        expect(result.get('SN002')).toBe(false);
                        expect(result.get('SN003')).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle empty products array', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products, tenantFilter, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        products = [];
                        tenantFilter = { tenant: 'test-tenant' };
                        return [4 /*yield*/, (0, batchValidationHelpers_1.batchValidateSerialNumbers)(products, tenantFilter)];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeInstanceOf(Map);
                        expect(result.size).toBe(0);
                        expect(mockCheckSerialNumbersAvailability).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle products without productItems', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products, tenantFilter, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        products = [
                            { name: 'Product 1' },
                            { name: 'Product 2', productItems: null },
                            { name: 'Product 3', productItems: undefined },
                        ];
                        tenantFilter = { tenant: 'test-tenant' };
                        return [4 /*yield*/, (0, batchValidationHelpers_1.batchValidateSerialNumbers)(products, tenantFilter)];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeInstanceOf(Map);
                        expect(result.size).toBe(0);
                        expect(mockCheckSerialNumbersAvailability).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('batchValidateImages', function () {
        it('should return empty map when no images provided', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products, tenantId, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        products = [
                            { name: 'Product 1', images: [] },
                            { name: 'Product 2', images: [] },
                        ];
                        tenantId = 'test-tenant';
                        return [4 /*yield*/, (0, batchValidationHelpers_1.batchValidateImages)(products, tenantId)];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeInstanceOf(Map);
                        expect(result.size).toBe(0);
                        expect(mockCheckAllImages).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle invalid image IDs', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products, tenantId, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        products = [
                            {
                                name: 'Product 1',
                                images: ['invalid-id-1', 'invalid-id-2'],
                            },
                        ];
                        tenantId = 'test-tenant';
                        mockCheckAllImages.mockResolvedValue({
                            isImagesIdsValid: false,
                            imagesIdsArray: [],
                        });
                        return [4 /*yield*/, (0, batchValidationHelpers_1.batchValidateImages)(products, tenantId)];
                    case 1:
                        result = _a.sent();
                        expect(mockCheckAllImages).toHaveBeenCalledWith(['invalid-id-1'], tenantId, true);
                        expect(mockCheckAllImages).toHaveBeenCalledWith(['invalid-id-2'], tenantId, true);
                        expect(result.get('invalid-id-1')).toEqual({ isValid: false, ids: [] });
                        expect(result.get('invalid-id-2')).toEqual({ isValid: false, ids: [] });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle missing images (null/undefined)', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products, tenantId, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        products = [
                            {
                                name: 'Product 1',
                                images: ['valid-id-1', null, undefined, 'valid-id-2'],
                            },
                        ];
                        tenantId = 'test-tenant';
                        mockCheckAllImages
                            .mockResolvedValueOnce({
                            isImagesIdsValid: true,
                            imagesIdsArray: ['file-1'],
                        })
                            .mockResolvedValueOnce({
                            isImagesIdsValid: true,
                            imagesIdsArray: ['file-2'],
                        });
                        return [4 /*yield*/, (0, batchValidationHelpers_1.batchValidateImages)(products, tenantId)];
                    case 1:
                        result = _a.sent();
                        // Should only check valid image IDs (not null/undefined)
                        expect(mockCheckAllImages).toHaveBeenCalledTimes(2);
                        expect(result.get('valid-id-1')).toEqual({ isValid: true, ids: ['file-1'] });
                        expect(result.get('valid-id-2')).toEqual({ isValid: true, ids: ['file-2'] });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle duplicate image IDs across products', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products, tenantId, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        products = [
                            { name: 'Product 1', images: ['img-001', 'img-002'] },
                            { name: 'Product 2', images: ['img-001', 'img-003'] },
                        ];
                        tenantId = 'test-tenant';
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
                        return [4 /*yield*/, (0, batchValidationHelpers_1.batchValidateImages)(products, tenantId)];
                    case 1:
                        result = _a.sent();
                        // Should only check unique image IDs
                        expect(mockCheckAllImages).toHaveBeenCalledTimes(3);
                        expect(result.get('img-001')).toEqual({ isValid: true, ids: ['file-1'] });
                        expect(result.get('img-002')).toEqual({ isValid: false, ids: [] });
                        expect(result.get('img-003')).toEqual({ isValid: true, ids: ['file-3'] });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle empty products array', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products, tenantId, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        products = [];
                        tenantId = 'test-tenant';
                        return [4 /*yield*/, (0, batchValidationHelpers_1.batchValidateImages)(products, tenantId)];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeInstanceOf(Map);
                        expect(result.size).toBe(0);
                        expect(mockCheckAllImages).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle products without images array', function () { return __awaiter(void 0, void 0, void 0, function () {
            var products, tenantId, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        products = [
                            { name: 'Product 1' },
                            { name: 'Product 2', images: null },
                            { name: 'Product 3', images: undefined },
                        ];
                        tenantId = 'test-tenant';
                        return [4 /*yield*/, (0, batchValidationHelpers_1.batchValidateImages)(products, tenantId)];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeInstanceOf(Map);
                        expect(result.size).toBe(0);
                        expect(mockCheckAllImages).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('checkProductSerialNumbersAvailability', function () {
        it('should return true for product without productItems', function () {
            var product = { name: 'Product 1' };
            var serialAvailabilityMap = new Map();
            var result = (0, batchValidationHelpers_1.checkProductSerialNumbersAvailability)(product, serialAvailabilityMap);
            expect(result).toBe(true);
        });
        it('should return true for product with empty productItems', function () {
            var product = { name: 'Product 1', productItems: [] };
            var serialAvailabilityMap = new Map();
            var result = (0, batchValidationHelpers_1.checkProductSerialNumbersAvailability)(product, serialAvailabilityMap);
            expect(result).toBe(true);
        });
        it('should return true for product items without serial numbers', function () {
            var product = {
                name: 'Product 1',
                productItems: [
                    { serialNumbers: [] },
                    { serialNumbers: null },
                    { serialNumbers: undefined },
                ],
            };
            var serialAvailabilityMap = new Map();
            var result = (0, batchValidationHelpers_1.checkProductSerialNumbersAvailability)(product, serialAvailabilityMap);
            expect(result).toBe(true);
        });
        it('should return false when any serial number is not available', function () {
            var product = {
                name: 'Product 1',
                productItems: [
                    { serialNumbers: ['SN001', 'SN002'] },
                    { serialNumbers: ['SN003'] },
                ],
            };
            var serialAvailabilityMap = new Map([
                ['SN001', true],
                ['SN002', false], // This one is not available
                ['SN003', true],
            ]);
            var result = (0, batchValidationHelpers_1.checkProductSerialNumbersAvailability)(product, serialAvailabilityMap);
            expect(result).toBe(false);
        });
        it('should return true when all serial numbers are available', function () {
            var product = {
                name: 'Product 1',
                productItems: [
                    { serialNumbers: ['SN001', 'SN002'] },
                    { serialNumbers: ['SN003'] },
                ],
            };
            var serialAvailabilityMap = new Map([
                ['SN001', true],
                ['SN002', true],
                ['SN003', true],
            ]);
            var result = (0, batchValidationHelpers_1.checkProductSerialNumbersAvailability)(product, serialAvailabilityMap);
            expect(result).toBe(true);
        });
        it('should return false when serial number is not in map', function () {
            var product = {
                name: 'Product 1',
                productItems: [
                    { serialNumbers: ['SN001', 'SN002'] },
                ],
            };
            var serialAvailabilityMap = new Map([
                ['SN001', true],
                // SN002 is missing from map
            ]);
            var result = (0, batchValidationHelpers_1.checkProductSerialNumbersAvailability)(product, serialAvailabilityMap);
            expect(result).toBe(false);
        });
    });
    describe('getProductImagesValidation', function () {
        it('should return valid result for product without images', function () {
            var product = { name: 'Product 1' };
            var imageValidationMap = new Map();
            var result = (0, batchValidationHelpers_1.getProductImagesValidation)(product, imageValidationMap);
            expect(result).toEqual({ isValid: true, ids: [] });
        });
        it('should return valid result for product with empty images array', function () {
            var product = { name: 'Product 1', images: [] };
            var imageValidationMap = new Map();
            var result = (0, batchValidationHelpers_1.getProductImagesValidation)(product, imageValidationMap);
            expect(result).toEqual({ isValid: true, ids: [] });
        });
        it('should return valid result when all images are valid', function () {
            var product = {
                name: 'Product 1',
                images: ['img-001', 'img-002'],
            };
            var imageValidationMap = new Map([
                ['img-001', { isValid: true, ids: ['file-1'] }],
                ['img-002', { isValid: true, ids: ['file-2'] }],
            ]);
            var result = (0, batchValidationHelpers_1.getProductImagesValidation)(product, imageValidationMap);
            expect(result).toEqual({
                isValid: true,
                ids: ['file-1', 'file-2'],
            });
        });
        it('should return invalid result when any image is invalid', function () {
            var product = {
                name: 'Product 1',
                images: ['img-001', 'img-002', 'img-003'],
            };
            var imageValidationMap = new Map([
                ['img-001', { isValid: true, ids: ['file-1'] }],
                ['img-002', { isValid: false, ids: [] }],
                ['img-003', { isValid: true, ids: ['file-3'] }],
            ]);
            var result = (0, batchValidationHelpers_1.getProductImagesValidation)(product, imageValidationMap);
            expect(result).toEqual({
                isValid: false,
                ids: ['file-1', [], 'file-3'],
            });
        });
        it('should return invalid result when image is not in validation map', function () {
            var product = {
                name: 'Product 1',
                images: ['img-001', 'img-002'],
            };
            var imageValidationMap = new Map([
                ['img-001', { isValid: true, ids: ['file-1'] }],
                // img-002 is missing from map
            ]);
            var result = (0, batchValidationHelpers_1.getProductImagesValidation)(product, imageValidationMap);
            expect(result).toEqual({
                isValid: false,
                ids: ['file-1'],
            });
        });
        it('should collect all IDs even when some images are invalid', function () {
            var product = {
                name: 'Product 1',
                images: ['img-001', 'img-002', 'img-003'],
            };
            var imageValidationMap = new Map([
                ['img-001', { isValid: true, ids: ['file-1', 'file-1b'] }],
                ['img-002', { isValid: false, ids: ['file-2'] }],
                ['img-003', { isValid: true, ids: ['file-3'] }],
            ]);
            var result = (0, batchValidationHelpers_1.getProductImagesValidation)(product, imageValidationMap);
            expect(result).toEqual({
                isValid: false,
                ids: ['file-1', 'file-1b', 'file-2', 'file-3'],
            });
        });
    });
});
