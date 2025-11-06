import { User, UserCrendetial } from '../models/userModel'

/**
 * Validates user data for completeness and format
 * @param user - User object to validate
 * @returns true if valid, false otherwise
 */
export function validateUserData(user: User): boolean {
  // Check required fields
  if (!user.name || !user.email || !user.username) {
    return false
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(user.email)) {
    return false
  }
  
  // Validate phone format (basic check)
  if (user.phone && !/^\+?[\d\s-()]+$/.test(user.phone)) {
    return false
  }
  
  return true
}

/**
 * Validates user credentials
 * @param credentials - UserCredential object to validate
 * @returns true if valid, false otherwise
 */
export function validateUserCredentials(credentials: UserCrendetial): boolean {
  // Check required fields
  if (!credentials.username || !credentials.password) {
    return false
  }
  
  // Minimum password length
  if (credentials.password.length < 6) {
    return false
  }
  
  return true
}

/**
 * Sanitizes user data by trimming whitespace
 * @param user - User object to sanitize
 * @returns Sanitized user object
 */
export function sanitizeUserData(user: User): User {
  return {
    ...user,
    name: user.name?.trim(),
    username: user.username?.trim(),
    email: user.email?.trim().toLowerCase(),
    company: user.company?.trim(),
    address: user.address?.trim(),
    state: user.state?.trim(),
    country: user.country?.trim(),
    phone: user.phone?.trim()
  }
}

/**
 * Transforms user data to API payload format
 * @param user - User object to transform
 * @returns API-compatible payload
 */
export function userToApiPayload(user: User): Record<string, any> {
  return {
    user_id: user.id,
    user_name: user.name,
    user_email: user.email,
    user_company: user.company,
    username: user.username,
    contact_address: user.address,
    zip_code: user.zip,
    state: user.state,
    country: user.country,
    phone_number: user.phone,
    photo_url: user.photo
  }
}

/**
 * Transforms API response to User model
 * @param apiResponse - API response object
 * @returns User object
 */
export function apiResponseToUser(apiResponse: any): User {
  return {
    id: apiResponse.user_id || apiResponse.id,
    name: apiResponse.user_name || apiResponse.name,
    email: apiResponse.user_email || apiResponse.email,
    company: apiResponse.user_company || apiResponse.company,
    username: apiResponse.username,
    address: apiResponse.contact_address || apiResponse.address,
    zip: apiResponse.zip_code || apiResponse.zip,
    state: apiResponse.state,
    country: apiResponse.country,
    phone: apiResponse.phone_number || apiResponse.phone,
    photo: apiResponse.photo_url || apiResponse.photo
  }
}
