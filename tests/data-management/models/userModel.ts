/**
 * User data model
 * Defines the structure of user data used in tests
 */
export interface User {
  id: number
  name: string
  company: string
  username: string
  email: string
  address: string
  zip: string
  state: string
  country: string
  phone: string
  photo: string
}

/**
 * User credentials model
 * Defines the structure of user login credentials
 */
export interface UserCrendetial {
  username: string
  password: string
}
