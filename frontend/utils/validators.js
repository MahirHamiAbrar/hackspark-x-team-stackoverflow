/**
 * Validators - Input validation utilities
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const minLength = 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  return {
    isValid: password.length >= minLength,
    isStrong: password.length >= minLength && hasUppercase && hasLowercase && hasNumbers,
    length: password.length,
    hasUppercase,
    hasLowercase,
    hasNumbers,
  };
};

/**
 * Validate username
 */
export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Validate phone number
 */
export const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phoneNumber);
};

/**
 * Validate date format
 */
export const validateDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Validate date range
 */
export const validateDateRange = (startDate, endDate) => {
  if (!validateDate(startDate) || !validateDate(endDate)) {
    return false;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  return end > start;
};

/**
 * Validate price
 */
export const validatePrice = (price) => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice > 0;
};

/**
 * Validate rental period (in days)
 */
export const validateRentalPeriod = (days) => {
  const numDays = parseInt(days, 10);
  return !isNaN(numDays) && numDays > 0;
};

/**
 * Validate category
 */
export const validateCategory = (category, validCategories = []) => {
  if (validCategories.length === 0) {
    return typeof category === 'string' && category.trim().length > 0;
  }
  return validCategories.includes(category);
};

/**
 * Validate product data
 */
export const validateProductData = (product) => {
  const errors = [];

  if (!product.name || product.name.trim().length === 0) {
    errors.push('Product name is required');
  }

  if (!product.category || product.category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (!validatePrice(product.pricePerDay)) {
    errors.push('Price per day must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate rental data
 */
export const validateRentalData = (rental) => {
  const errors = [];

  if (!rental.productId) {
    errors.push('Product ID is required');
  }

  if (!validateDate(rental.startDate)) {
    errors.push('Invalid start date');
  }

  if (!validateDate(rental.endDate)) {
    errors.push('Invalid end date');
  }

  if (!validateDateRange(rental.startDate, rental.endDate)) {
    errors.push('End date must be after start date');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePhoneNumber,
  validateDate,
  validateDateRange,
  validatePrice,
  validateRentalPeriod,
  validateCategory,
  validateProductData,
  validateRentalData,
};
