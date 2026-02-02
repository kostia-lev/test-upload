import { checkAllImages } from './../../../../../../helpers/importingHelpers/utils';
import { checkSerialNumbersAvailability } from './actions/handleNormalisedFields/checkSerialNumbersAvailability';

export const batchValidateSerialNumbers = async (
  products: any[],
  tenantFilter: any,
) => {
  // Collect all serial numbers from all products
  const allSerialNumbers: string[] = [];
  const serialNumberMap = new Map<string, { productIndex: number; itemIndex: number }[]>();

  products.forEach((product, productIndex) => {
    product.productItems?.forEach((item: any, itemIndex: number) => {
      if (item.serialNumbers?.length) {
        item.serialNumbers.forEach((serial: string) => {
          allSerialNumbers.push(serial);
          if (!serialNumberMap.has(serial)) {
            serialNumberMap.set(serial, []);
          }
          serialNumberMap.get(serial)!.push({ productIndex, itemIndex });
        });
      }
    });
  });

  if (allSerialNumbers.length === 0) {
    return new Map<string, boolean>();
  }

  // Batch check all serial numbers at once
  const uniqueSerialNumbers = [...new Set(allSerialNumbers)];
  const result = await checkSerialNumbersAvailability({
    serialNumbers: uniqueSerialNumbers,
    tenantFilter,
  });

  // Create a map of serial number availability
  const availabilityMap = new Map<string, boolean>();
  const existedSerialNumbersMap = new Map<string, boolean>();

  // Check each existed serial number for relations
  result.existedSerialNumbers.forEach((item) => {
    const hasRelations =
      item?.sellingProductOrderItem?.id ||
      item?.returnItem?.id ||
      item?.inventoryAdjustmentItem?.id ||
      item?.transferOrderItem?.id ||
      item?.productInventoryItem?.id;

    existedSerialNumbersMap.set(item.name, !hasRelations);
  });

  uniqueSerialNumbers.forEach((serial) => {
    // A serial number is available if:
    // 1. It doesn't exist in the database (not in existedSerialNumbersMap)
    // 2. It exists but has no relations (value is true in existedSerialNumbersMap)
    const isExisted = existedSerialNumbersMap.has(serial);
    availabilityMap.set(serial, !isExisted || existedSerialNumbersMap.get(serial));
  });

  return availabilityMap;
};

export const batchValidateImages = async (
  products: any[],
  tenantId: string,
) => {
  // Collect all images from all products
  const allImages: string[] = [];
  const imageMap = new Map<string, number[]>();

  products.forEach((product, index) => {
    if (product.images?.length) {
      product.images.forEach((image: string) => {
        allImages.push(image);
        if (!imageMap.has(image)) {
          imageMap.set(image, []);
        }
        imageMap.get(image)!.push(index);
      });
    }
  });

  if (allImages.length === 0) {
    return new Map<string, { isValid: boolean; ids: string[] }>();
  }

  // Batch check all unique images
  const uniqueImages = [...new Set(allImages)];
  const imageValidationPromises = uniqueImages.map(async (image) => {
    const { isImagesIdsValid, imagesIdsArray } = await checkAllImages(
      [image],
      tenantId,
      true,
    );
    return {
      image,
      isValid: isImagesIdsValid,
      ids: imagesIdsArray
    };
  });

  const results = await Promise.all(imageValidationPromises);

  // Create a map of image validation results
  const imageValidationMap = new Map<string, { isValid: boolean; ids: string[] }>();
  results.forEach(({ image, isValid, ids }) => {
    imageValidationMap.set(image, { isValid, ids });
  });

  return imageValidationMap;
};

export const checkProductSerialNumbersAvailability = (
  product: any,
  serialAvailabilityMap: Map<string, boolean>,
): boolean => {
  if (!product.productItems?.length) return true;

  for (const item of product.productItems) {
    if (!item.serialNumbers?.length) continue;

    for (const serialNumber of item.serialNumbers) {
      const isAvailable = serialAvailabilityMap.get(serialNumber);
      if (isAvailable === false) {
        return false;
      }
    }
  }

  return true;
};

export const getProductImagesValidation = (
  product: any,
  imageValidationMap: Map<string, { isValid: boolean; ids: string[] }>,
): { isValid: boolean; ids: string[] } => {
  if (!product.images?.length) {
    return { isValid: true, ids: [] };
  }

  const allIds: string[] = [];
  let allValid = true;

  for (const image of product.images) {
    const validation = imageValidationMap.get(image);
    if (validation) {
      if (!validation.isValid) {
        allValid = false;
      }
      allIds.push(...validation.ids);
    } else {
      allValid = false;
    }
  }

  return { isValid: allValid, ids: allIds };
};
