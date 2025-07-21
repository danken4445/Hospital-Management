export const validateInventoryUpdate = (update) => {
  const errors = [];
  
  console.log('Validating inventory update:', update);
  
  if (!update) {
    errors.push('Update object is null or undefined');
    return { isValid: false, errors };
  }
  
  if (!update.id) {
    errors.push('Missing item ID');
  }
  
  if (!update.type || !['supplies', 'medicines'].includes(update.type)) {
    errors.push('Invalid or missing item type');
  }
  
  if (update.quantityUsed === undefined || update.quantityUsed === null) {
    errors.push('Missing quantity used');
  } else {
    const quantity = Number(update.quantityUsed);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push(`Invalid quantity - must be a positive number, got: ${update.quantityUsed}`);
    }
  }
  
  const sanitized = {
    id: String(update.id),
    type: String(update.type),
    quantityUsed: Number(update.quantityUsed)
  };
  
  console.log('Validation result:', { isValid: errors.length === 0, errors, sanitized });
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

export const validateScannedItem = (item) => {
  const errors = [];
  
  console.log('Validating scanned item:', item);
  
  if (!item) {
    errors.push('Item is null or undefined');
    return { isValid: false, errors };
  }
  
  if (!item.id) {
    errors.push('Missing item ID');
  }
  
  if (!item.name) {
    errors.push('Missing item name');
  }
  
  if (!item.type || !['supplies', 'medicines'].includes(item.type)) {
    errors.push('Invalid or missing item type');
  }
  
  if (item.quantity === undefined || item.quantity === null) {
    errors.push('Missing quantity');
  } else {
    const quantity = Number(item.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push(`Invalid quantity - must be a positive number, got: ${item.quantity}`);
    }
  }
  
  const sanitized = {
    ...item,
    quantity: Number(item.quantity),
    retailPrice: Number(item.retailPrice || 0),
    id: String(item.id),
    type: String(item.type),
    name: String(item.name || 'Unknown Item')
  };
  
  console.log('Scanned item validation result:', { isValid: errors.length === 0, errors, sanitized });
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};