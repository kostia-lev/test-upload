# Batch Validation Tests

This directory contains comprehensive tests for the batch validation functions used in product importing.

## Test Coverage

### Unit Tests (`/tests/unit/`)

#### `batchValidationHelpers.test.ts`
Tests for the core batch validation functions:

- **`batchValidateSerialNumbers()`**
  - Empty input handling
  - Duplicate serial numbers across products
  - Null/undefined serial number values
  - Products without serial numbers
  - Large batch processing

- **`batchValidateImages()`**
  - Invalid image ID handling
  - Missing images (null/undefined)
  - Duplicate image IDs across products
  - Empty image arrays
  - Error scenarios

- **`checkProductSerialNumbersAvailability()`**
  - Products without productItems
  - Items without serial numbers
  - Mixed availability scenarios
  - Missing serial numbers in availability map

- **`getProductImagesValidation()`**
  - Products without images
  - Valid/invalid image combinations
  - Missing images in validation map
  - ID collection from valid images

#### `getProductWithRetry.test.ts`
Tests for retry logic and lock mechanism:

- **`getProductWithRetry()`**
  - Successful first attempt
  - Retry logic with name/barcode locks
  - Max retries exceeded scenarios
  - Products with no existing records
  - Null/undefined name and barcode handling

- **Lock Mechanism**
  - Concurrent access prevention
  - Mixed concurrent access scenarios
  - Lock timeout with random delays
  - Lock lifecycle management

### Integration Tests (`/tests/integration/`)

#### `batchValidation.integration.test.ts`
Real-world scenario testing:

- Large batch processing (100+ products)
- Malformed data handling
- Concurrent batch validation
- Performance testing with large datasets (1000+ products)
- Error scenario handling
- Data consistency across duplicate entries

## Running Tests

### Run All Tests
```bash
yarn jest
```

### Run Only Unit Tests
```bash
yarn jest tests/unit
```

### Run Only Integration Tests
```bash
yarn jest tests/integration
```

### Run Specific Test File
```bash
yarn jest tests/unit/batchValidationHelpers.test.ts
yarn jest tests/unit/getProductWithRetry.test.ts
yarn jest tests/integration/batchValidation.integration.test.ts
```

### Run with Coverage
```bash
yarn jest --coverage
```

### Run in Watch Mode
```bash
yarn jest --watch
```

## Test Structure

### Mocking Strategy
The tests use Jest mocks to isolate the functions being tested:

- `checkSerialNumbersAvailability` - Mocked to control serial number availability responses
- `checkAllImages` - Mocked to control image validation responses
- `setTimeout` - Mocked to control timing in retry logic and lock scenarios

### Test Data Patterns

#### Serial Number Tests
- Empty arrays and null values
- Duplicate serials across products and items
- Mixed availability (true/false)
- Large datasets for performance testing

#### Image Tests
- Invalid image IDs
- Missing images (null/undefined)
- Duplicate images across products
- Mixed validation results

#### Lock Mechanism Tests
- Concurrent access simulation
- Lock timeout scenarios
- Random delay testing
- Lock lifecycle management

### Performance Considerations

- Large dataset tests use 1000+ products to validate performance
- Concurrent processing tests verify thread safety
- Memory usage is monitored for batch operations
- API call counts are verified to ensure efficiency

## Key Test Scenarios

### Edge Cases Covered
1. **Empty Input**: Functions handle empty/null inputs gracefully
2. **Malformed Data**: Products with missing or invalid properties
3. **Duplicate Handling**: Consistent results for duplicate entries
4. **Error Recovery**: Graceful handling of service failures
5. **Concurrent Access**: Lock mechanism prevents race conditions

### Real-World Scenarios
1. **Large CSV Imports**: Testing with 1000+ product entries
2. **Mixed Data Types**: Handling various data quality issues
3. **Performance Under Load**: Ensuring acceptable response times
4. **Data Consistency**: Maintaining integrity across batch operations

## Debugging Tips

### Individual Test Debugging
```bash
yarn jest --testNamePattern="should return empty map when no serial numbers provided"
```

### Verbose Output
```bash
yarn jest --verbose
```

### Debug Mode
```bash
yarn jest --detectOpenHandles
```

## Contributing

When adding new tests:

1. Follow the existing naming conventions
2. Include both positive and negative test cases
3. Add performance tests for new batch operations
4. Mock all external dependencies
5. Test edge cases and error scenarios
6. Update this README with new test coverage

## Test Files Location

```
packages/cms/tests/
├── unit/
│   ├── batchValidationHelpers.test.ts
│   ├── getProductWithRetry.test.ts
│   └── index.ts
├── integration/
│   └── batchValidation.integration.test.ts
└── helpers/
    └── strapi.ts
```

## Dependencies

- Jest: Testing framework
- @types/jest: TypeScript definitions
- Mock implementations for all external services
- Strapi test helpers for database setup/teardown
