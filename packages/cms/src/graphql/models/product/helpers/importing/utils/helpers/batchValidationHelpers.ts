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
  const availabilityPromises = uniqueSerialNumbers.map(async (serial) => {
    const result = await checkSerialNumbersAvailability({
      serialNumbers: [serial],
      tenantFilter,
    });
    return { serial, isAvailable: result.isAllSerialNumbersAvailable };
  });

  const results = await Promise.all(availabilityPromises);
  
  // Create a map of serial number availability
  const availabilityMap = new Map<string, boolean>();
  results.forEach(({ serial, isAvailable }) => {
    availabilityMap.set(serial, isAvailable);
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
