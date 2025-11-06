---
applyTo: '**/*.agent,**'
description: 'Data-Driven Testing Guide - Complete patterns for test data management and parameterized testing - Version 2.0'
---

# 📊 DATA-DRIVEN TESTING GUIDE

## 🎯 Purpose
This guide defines comprehensive patterns for data-driven test automation, covering test data generation, file organization, Playwright test.each() patterns, and integration with the agent pipeline.

---

## 📋 Table of Contents
1. [When to Use Data-Driven Testing](#when-to-use-data-driven-testing)
2. [Test Data File Organization](#test-data-file-organization)
3. [Data Generation Strategies](#data-generation-strategies)
4. [Playwright test.each() Patterns](#playwright-testeach-patterns)
5. [Data Models & Handlers](#data-models--handlers)
6. [Environment-Specific Data](#environment-specific-data)
7. [File-Based Test Data](#file-based-test-data)
8. [Agent Integration Patterns](#agent-integration-patterns)
9. [Complete Examples](#complete-examples)
10. [Best Practices](#best-practices)

---

## 🎲 When to Use Data-Driven Testing

### **Decision Matrix**

| Scenario | Approach | Reason |
|----------|----------|---------|
| Testing 1-2 variations | Single test with hardcoded values | Simple, readable, fast |
| Testing 3-5 variations | forEach loop with data array | Moderate complexity, good balance |
| Testing 6-10 variations | test.each() with JSON file | Scalable, maintainable |
| Testing 10+ variations | test.each() with Faker generation | Dynamic, comprehensive coverage |
| Boundary value testing | test.each() with predefined boundaries | Systematic edge case testing |
| Negative testing | test.each() with invalid data sets | Error handling validation |

### **Triggers for Data-Driven Mode**

**Keywords in User Story:**
- "multiple", "different", "various", "several", "many"
- "parameterized", "data-driven", "test with different inputs"
- "valid and invalid", "positive and negative cases"

**Structural Indicators:**
- 3+ acceptance criteria requiring similar test steps with different data
- Form testing with 5+ input fields (suggests boundary/invalid testing)
- User story mentions specific data sets or ranges

---

## 📁 Test Data File Organization

### **Directory Structure**

```
tests/
├── test-data/
│   ├── {domain}-{feature}-data.json           # Main test data file
│   ├── user-data/
│   │   └── credentials.json                   # Environment-specific credentials
│   └── document-files/
│       ├── valid-document.pdf                 # Valid file uploads
│       ├── invalid-format.exe                 # Invalid format testing
│       └── oversized-file.pdf                 # Boundary testing
├── data-management/
│   ├── models/
│   │   └── {domain}Model.ts                   # TypeScript interfaces
│   └── handlers/
│       └── {domain}DataHandler.ts             # Data transformation functions
```

### **File Naming Convention**

**Pattern:** `{domain}-{feature}-data.json`

**Examples:**
- `demoqa_com-student_registration-data.json`
- `example_com-login-data.json`
- `app_test-checkout-data.json`

**Rules:**
1. Use sanitized domain name (underscores replace dots)
2. Use kebab-case for feature name
3. Always use `-data.json` suffix
4. Store in `tests/test-data/` directory

---

## 🔢 Data Generation Strategies

### **Strategy 1: Manual Data Arrays (Simple)**

**When to Use:** 2-5 test cases with specific values

**Pattern:**
```json
{
  "testCases": [
    {
      "testId": "TC_001",
      "description": "Valid registration",
      "data": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "1234567890"
      },
      "expected": "success"
    },
    {
      "testId": "TC_002",
      "description": "Invalid email format",
      "data": {
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "invalid-email",
        "phone": "9876543210"
      },
      "expected": "error"
    }
  ]
}
```

**LLM Generation Instructions:**
"I will create a JSON file with 5 test cases. Each test case will have testId, description, input data object, and expected result. Test cases will cover: 2 valid scenarios with different data, 2 invalid scenarios (missing required field, invalid format), and 1 boundary scenario (maximum length values)."

---

### **Strategy 2: Faker-Based Generation (Recommended)**

**When to Use:** 5+ test cases needing realistic data

**Step 1: Install Faker (if not present)**
```bash
npm install --save-dev @faker-js/faker
```

**Step 2: Data Generation Script Pattern**

```typescript
import { faker } from '@faker-js/faker'

// Set seed for reproducibility
faker.seed(12345)

interface RegistrationData {
  testId: string
  description: string
  data: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  expected: 'success' | 'error'
}

function generateValidCase(index: number): RegistrationData {
  return {
    testId: `TC_${String(index).padStart(3, '0')}`,
    description: `Valid registration - case ${index}`,
    data: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number('##########')
    },
    expected: 'success'
  }
}

function generateInvalidCase(index: number, errorType: string): RegistrationData {
  const baseData = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number('##########')
  }
  
  // Apply error condition
  if (errorType === 'invalid-email') {
    baseData.email = 'invalid-email-format'
  } else if (errorType === 'missing-field') {
    baseData.firstName = ''
  } else if (errorType === 'invalid-phone') {
    baseData.phone = '123' // Too short
  }
  
  return {
    testId: `TC_${String(index).padStart(3, '0')}`,
    description: `Invalid registration - ${errorType}`,
    data: baseData,
    expected: 'error'
  }
}

// Generate test data
const testData = {
  testCases: [
    generateValidCase(1),
    generateValidCase(2),
    generateValidCase(3),
    generateInvalidCase(4, 'invalid-email'),
    generateInvalidCase(5, 'missing-field'),
    generateInvalidCase(6, 'invalid-phone')
  ],
  metadata: {
    seed: 12345,
    generatedAt: '2025-01-15',
    totalCases: 6
  }
}

// Write to file (conceptual - LLM will create the output directly)
console.log(JSON.stringify(testData, null, 2))
```

**LLM Generation Instructions:**
"I will generate test data using Faker patterns. I'll use seed 12345 for reproducibility. For valid cases, I'll generate realistic names using faker.person.firstName/lastName, emails using faker.internet.email, and 10-digit phone numbers. For invalid cases, I'll intentionally break validation rules (empty strings, invalid formats, boundary violations). The output will be a JSON file with 6 test cases: 3 valid, 3 invalid."

---

### **Strategy 3: Hybrid Approach (Boundary + Faker)**

**When to Use:** Need specific edge cases + general variations

**Pattern:**
```json
{
  "testCases": [
    {
      "testId": "TC_001",
      "description": "Minimum valid length",
      "data": {
        "firstName": "Jo",
        "lastName": "Do",
        "email": "a@b.co",
        "phone": "1234567890"
      },
      "expected": "success",
      "category": "boundary"
    },
    {
      "testId": "TC_002",
      "description": "Maximum valid length",
      "data": {
        "firstName": "Johnathannnnnnnnnnnn",
        "lastName": "Doeeeeeeeeeeeeeeeeee",
        "email": "very.long.email.address@example.com",
        "phone": "1234567890"
      },
      "expected": "success",
      "category": "boundary"
    },
    {
      "testId": "TC_003",
      "description": "Typical valid case - Faker generated",
      "data": {
        "firstName": "Sarah",
        "lastName": "Johnson",
        "email": "sarah.johnson@example.com",
        "phone": "5551234567"
      },
      "expected": "success",
      "category": "general"
    }
  ]
}
```

**LLM Generation Instructions:**
"I will create a hybrid data set with 10 test cases: 2 boundary cases (minimum length, maximum length using field constraints from HTML), 2 edge cases (special characters, unicode), 3 valid general cases (Faker-style realistic data), and 3 invalid cases (empty, wrong format, exceeds limit). Each test case includes a category field to indicate testing type."

---

## 🧪 Playwright test.each() Patterns

### **Pattern 1: Basic test.each() - Single Parameter**

**Test Data File:** `tests/test-data/example_com-login-data.json`
```json
{
  "testCases": [
    {
      "testId": "TC_001",
      "username": "admin",
      "password": "admin123",
      "expected": "success"
    },
    {
      "testId": "TC_002",
      "username": "user",
      "password": "wrongpass",
      "expected": "error"
    }
  ]
}
```

**Test Spec Implementation:**
```typescript
import { test } from 'tests/test-objects/gui/pageObjects/pageFixture'
import { expect } from '@utilities/reporter/custom-expect'
import testData from 'tests/test-data/example_com-login-data.json'

test.describe('Login functionality - Data-Driven', () => {
  
  // Use test.each() with data from JSON file
  testData.testCases.forEach((testCase) => {
    test(`${testCase.testId}: Login with ${testCase.username}`, async ({ loginPage }) => {
      
      await test.step('Navigate to login page', async () => {
        await loginPage.goto()
      })
      
      await test.step(`Enter credentials: ${testCase.username}`, async () => {
        await loginPage.fillUsername(testCase.username)
        await loginPage.fillPassword(testCase.password)
        await loginPage.clickLoginButton()
      })
      
      await test.step('Verify result', async () => {
        if (testCase.expected === 'success') {
          await expect(loginPage.page).toHaveURL(/dashboard/)
        } else {
          await expect(loginPage.getErrorMessage()).toBeVisible()
        }
      })
    })
  })
})
```

**Key Points:**
- Import JSON file directly: `import testData from 'path/to/file.json'`
- Use `forEach()` to iterate test cases
- Test name includes testId and description for clarity
- Each iteration is independent test execution

---

### **Pattern 2: Playwright's Native test.each() - Cleaner Syntax**

**Test Data File:** Same as Pattern 1

**Test Spec Implementation:**
```typescript
import { test } from 'tests/test-objects/gui/pageObjects/pageFixture'
import { expect } from '@utilities/reporter/custom-expect'
import testData from 'tests/test-data/example_com-login-data.json'

test.describe('Login functionality - Data-Driven', () => {
  
  // Playwright's native test.each()
  for (const testCase of testData.testCases) {
    test(`${testCase.testId}: Login with ${testCase.username}`, async ({ loginPage }) => {
      
      await test.step('Navigate to login page', async () => {
        await loginPage.goto()
      })
      
      await test.step(`Enter credentials: ${testCase.username}`, async () => {
        await loginPage.fillUsername(testCase.username)
        await loginPage.fillPassword(testCase.password)
        await loginPage.clickLoginButton()
      })
      
      await test.step('Verify result', async () => {
        if (testCase.expected === 'success') {
          await expect(loginPage.page).toHaveURL(/dashboard/)
        } else {
          await expect(loginPage.getErrorMessage()).toBeVisible()
        }
      })
    })
  }
})
```

**Alternative Syntax (Array Destructuring):**
```typescript
test.describe('Login functionality', () => {
  
  const testCases = [
    ['TC_001', 'admin', 'admin123', 'success'],
    ['TC_002', 'user', 'wrongpass', 'error']
  ]
  
  for (const [testId, username, password, expected] of testCases) {
    test(`${testId}: Login with ${username}`, async ({ loginPage }) => {
      // Test implementation
    })
  }
})
```

---

### **Pattern 3: Complex Data-Driven - Multiple Objects**

**Test Data File:** `tests/test-data/demoqa_com-registration-data.json`
```json
{
  "testCases": [
    {
      "testId": "TC_001",
      "description": "Valid registration - all fields",
      "data": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "gender": "Male",
        "mobile": "1234567890",
        "dateOfBirth": "15 Jan 1990",
        "subjects": ["Maths", "Physics"],
        "hobbies": ["Sports", "Reading"],
        "currentAddress": "123 Main St, New York, NY 10001",
        "state": "NCR",
        "city": "Delhi"
      },
      "expected": {
        "status": "success",
        "message": "Thanks for submitting the form"
      }
    },
    {
      "testId": "TC_002",
      "description": "Invalid registration - missing required field",
      "data": {
        "firstName": "",
        "lastName": "Smith",
        "email": "jane.smith@example.com",
        "gender": "Female",
        "mobile": "9876543210"
      },
      "expected": {
        "status": "error",
        "message": "First Name is required"
      }
    }
  ]
}
```

**Test Spec Implementation:**
```typescript
import { test } from 'tests/test-objects/gui/pageObjects/pageFixture'
import { expect } from '@utilities/reporter/custom-expect'
import testData from 'tests/test-data/demoqa_com-registration-data.json'

test.describe('Student Registration - Data-Driven', () => {
  
  testData.testCases.forEach((testCase) => {
    test(`${testCase.testId}: ${testCase.description}`, async ({ registrationPage }) => {
      
      await test.step('Navigate to registration form', async () => {
        await registrationPage.goto()
      })
      
      await test.step('Fill registration form', async () => {
        if (testCase.data.firstName) {
          await registrationPage.fillFirstName(testCase.data.firstName)
        }
        if (testCase.data.lastName) {
          await registrationPage.fillLastName(testCase.data.lastName)
        }
        if (testCase.data.email) {
          await registrationPage.fillEmail(testCase.data.email)
        }
        if (testCase.data.gender) {
          await registrationPage.selectGender(testCase.data.gender)
        }
        if (testCase.data.mobile) {
          await registrationPage.fillMobile(testCase.data.mobile)
        }
        // ... more fields
      })
      
      await test.step('Submit form', async () => {
        await registrationPage.clickSubmit()
      })
      
      await test.step('Verify result', async () => {
        if (testCase.expected.status === 'success') {
          await expect(registrationPage.getSuccessMessage()).toContainText(testCase.expected.message)
        } else {
          await expect(registrationPage.getErrorMessage()).toContainText(testCase.expected.message)
        }
      })
    })
  })
})
```

---

### **Pattern 4: Parallel Execution with test.describe.parallel()**

**For 10+ test cases needing speed:**

```typescript
import { test } from 'tests/test-objects/gui/pageObjects/pageFixture'
import testData from 'tests/test-data/large-dataset.json'

test.describe.parallel('Large dataset testing', () => {
  
  testData.testCases.forEach((testCase) => {
    test(`${testCase.testId}`, async ({ registrationPage }) => {
      // Test implementation
      // Each test runs in parallel worker
    })
  })
})
```

**Warning:** Use parallel execution only when tests are fully independent (no shared state, no database conflicts).

---

## 📐 Data Models & Handlers

**📁 WORKING EXAMPLES IN TEMPLATE:**
- Model: `tests/data-management/models/userModel.ts` (User and UserCredential interfaces)
- Handler: `tests/data-management/handlers/userDataHandler.ts` (validation, sanitization, transformation functions)

### **Data Models - TypeScript Interfaces**

**Purpose:** Define structure and type safety for test data

**Location:** `tests/data-management/models/{domain}Model.ts`

**Working Example in Template:** `tests/data-management/models/userModel.ts`
```typescript
export interface User {
  id?: string
  name: string
  company: string
  username: string
  email: string
  address: string
  zip: string
  state: string
  country: string
  phone: string
  photo?: string
}

export interface UserCredential {
  username: string
  password: string
}
```

**Additional Example:** `tests/data-management/models/registrationModel.ts` (for complex forms)
```typescript
export interface RegistrationData {
  firstName: string
  lastName: string
  email: string
  gender: 'Male' | 'Female' | 'Other'
  mobile: string
  dateOfBirth?: string        // Optional field
  subjects?: string[]          // Optional array
  hobbies?: string[]
  currentAddress?: string
  state?: string
  city?: string
}

export interface RegistrationTestCase {
  testId: string
  description: string
  data: RegistrationData
  expected: {
    status: 'success' | 'error'
    message: string
  }
}

export interface RegistrationDataFile {
  testCases: RegistrationTestCase[]
  metadata?: {
    seed?: number
    generatedAt?: string
    totalCases?: number
  }
}
```

**Usage in Test Spec:**
```typescript
import { RegistrationDataFile } from 'tests/data-management/models/registrationModel'
import testData from 'tests/test-data/demoqa_com-registration-data.json'

// Type-safe access
const typedTestData: RegistrationDataFile = testData

test.describe('Registration tests', () => {
  typedTestData.testCases.forEach((testCase) => {
    test(`${testCase.testId}`, async ({ registrationPage }) => {
      // TypeScript will autocomplete testCase.data.firstName, etc.
      await registrationPage.fillFirstName(testCase.data.firstName)
    })
  })
})
```

---

### **Data Handlers - Transformation Functions**

**Purpose:** Transform or validate data before use in tests

**Location:** `tests/data-management/handlers/{domain}DataHandler.ts`

**Example:** `tests/data-management/handlers/registrationDataHandler.ts`
```typescript
import { RegistrationData } from '../models/registrationModel'

export function validateRegistrationData(data: RegistrationData): boolean {
  // Check required fields
  if (!data.firstName || !data.lastName || !data.email || !data.mobile) {
    return false
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return false
  }
  
  // Validate mobile (10 digits)
  if (data.mobile.length !== 10 || !/^\d+$/.test(data.mobile)) {
    return false
  }
  
  return true
}

export function sanitizeRegistrationData(data: RegistrationData): RegistrationData {
  return {
    ...data,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim().toLowerCase(),
    mobile: data.mobile.replace(/\D/g, '').slice(0, 10) // Remove non-digits, limit to 10
  }
}

export function generateRegistrationPayload(data: RegistrationData): Record<string, any> {
  // Transform to API payload format
  return {
    first_name: data.firstName,
    last_name: data.lastName,
    email_address: data.email,
    gender_code: data.gender === 'Male' ? 'M' : data.gender === 'Female' ? 'F' : 'O',
    phone_number: data.mobile,
    birth_date: data.dateOfBirth,
    subjects_list: data.subjects?.join(','),
    hobbies_list: data.hobbies?.join(','),
    address: data.currentAddress,
    state_name: data.state,
    city_name: data.city
  }
}
```

**Usage in Test Spec:**
```typescript
import { sanitizeRegistrationData, validateRegistrationData } from 'tests/data-management/handlers/registrationDataHandler'
import testData from 'tests/test-data/demoqa_com-registration-data.json'

test.describe('Registration with validation', () => {
  testData.testCases.forEach((testCase) => {
    test(`${testCase.testId}`, async ({ registrationPage }) => {
      
      // Sanitize data before use
      const cleanData = sanitizeRegistrationData(testCase.data)
      
      // Validate data
      const isValid = validateRegistrationData(cleanData)
      
      if (testCase.expected.status === 'success' && !isValid) {
        throw new Error(`Test data invalid for ${testCase.testId}`)
      }
      
      // Use cleaned data in test
      await registrationPage.fillFirstName(cleanData.firstName)
      await registrationPage.fillLastName(cleanData.lastName)
      // ...
    })
  })
})
```

---

## 🌍 Environment-Specific Data

### **Credentials Management**

**Location:** `tests/test-data/user-data/credentials.json`

**Structure:**
```json
{
  "dev": {
    "admin": {
      "username": "admin@dev.example.com",
      "password": "base64EncodedPassword",
      "encrypted": true
    },
    "user": {
      "username": "user@dev.example.com",
      "password": "base64EncodedPassword",
      "encrypted": true
    }
  },
  "staging": {
    "admin": {
      "username": "admin@staging.example.com",
      "password": "base64EncodedPassword",
      "encrypted": true
    }
  },
  "prod": {
    "admin": {
      "username": "admin@example.com",
      "password": "base64EncodedPassword",
      "encrypted": true
    }
  }
}
```

**Usage in Test Spec:**
```typescript
import { test } from 'tests/test-objects/gui/pageObjects/pageFixture'
import credentials from 'tests/test-data/user-data/credentials.json'
import { decryptFromBase64 } from '@utilities/common/string-utils'

test.describe('Login with environment-specific credentials', () => {
  
  test('Admin login', async ({ loginPage }) => {
    const env = process.env.NODE_ENV || 'dev'
    const adminCreds = credentials[env].admin
    
    const username = adminCreds.username
    const password = adminCreds.encrypted 
      ? decryptFromBase64(adminCreds.password)
      : adminCreds.password
    
    await loginPage.login(username, password)
  })
})
```

---

### **Environment-Specific Test Data**

**Pattern:** Separate data files per environment

**Structure:**
```
tests/test-data/
├── demoqa_com-registration-data-dev.json
├── demoqa_com-registration-data-staging.json
└── demoqa_com-registration-data-prod.json
```

**Dynamic Loading:**
```typescript
import { test } from 'tests/test-objects/gui/pageObjects/pageFixture'

test.describe('Environment-aware data-driven tests', () => {
  
  test('Load environment-specific data', async ({ registrationPage }) => {
    const env = process.env.NODE_ENV || 'dev'
    const testData = await import(`tests/test-data/demoqa_com-registration-data-${env}.json`)
    
    testData.testCases.forEach((testCase) => {
      // Use environment-specific data
    })
  })
})
```

---

## 📄 File-Based Test Data

### **Document Upload Testing**

**Location:** `tests/test-data/document-files/`

**Structure:**
```
document-files/
├── valid-document.pdf          (5 KB, valid format)
├── valid-image.jpg             (2 KB, valid image)
├── invalid-format.exe          (1 KB, blocked format)
├── oversized-file.pdf          (25 MB, exceeds 10 MB limit)
├── corrupted-file.pdf          (0 KB, corrupted)
└── special-chars-文件.pdf      (3 KB, unicode filename)
```

**Test Data File:** `tests/test-data/document-upload-data.json`
```json
{
  "testCases": [
    {
      "testId": "TC_001",
      "description": "Upload valid PDF document",
      "file": "tests/test-data/document-files/valid-document.pdf",
      "expected": "success"
    },
    {
      "testId": "TC_002",
      "description": "Upload invalid format",
      "file": "tests/test-data/document-files/invalid-format.exe",
      "expected": "error"
    },
    {
      "testId": "TC_003",
      "description": "Upload oversized file",
      "file": "tests/test-data/document-files/oversized-file.pdf",
      "expected": "error"
    }
  ]
}
```

**Test Spec Implementation:**
```typescript
import { test } from 'tests/test-objects/gui/pageObjects/pageFixture'
import { expect } from '@utilities/reporter/custom-expect'
import testData from 'tests/test-data/document-upload-data.json'
import path from 'path'

test.describe('Document upload - Data-Driven', () => {
  
  testData.testCases.forEach((testCase) => {
    test(`${testCase.testId}: ${testCase.description}`, async ({ documentUploadPage }) => {
      
      await test.step('Navigate to upload page', async () => {
        await documentUploadPage.goto()
      })
      
      await test.step(`Upload file: ${path.basename(testCase.file)}`, async () => {
        await documentUploadPage.uploadFile(testCase.file)
        await documentUploadPage.clickSubmit()
      })
      
      await test.step('Verify result', async () => {
        if (testCase.expected === 'success') {
          await expect(documentUploadPage.getSuccessMessage()).toBeVisible()
        } else {
          await expect(documentUploadPage.getErrorMessage()).toBeVisible()
        }
      })
    })
  })
})
```

---

## 🤖 Agent Integration Patterns

### **Test Case Designer Agent - Data Generation**

**GATE 0 / GATE 1 Integration:**

When Test Case Designer detects data-driven mode (keywords, multiple acceptance criteria, or explicit request), it should:

1. **Determine Data Strategy** (Step 2)
   - Count test cases needed (3-5 = manual, 5-10 = Faker, 10+ = Faker + parallel)
   - Identify data categories (valid, invalid, boundary, edge)
   - Extract field constraints from HTML (maxLength, pattern, required)

2. **Generate Data File** (Step 5 - NEW)
   ```markdown
   **Step 5: Generate Test Data File (Data-Driven Mode Only)**
   
   I will create a JSON data file at: tests/test-data/{domain}-{feature}-data.json
   
   Data generation approach:
   - Total test cases: 5 (3 valid, 2 invalid)
   - Use Faker patterns with seed 12345 for reproducibility
   - Valid cases: firstName (10-20 chars), lastName (10-20 chars), email (valid format), phone (10 digits)
   - Invalid cases: email (missing @), phone (5 digits - below minimum)
   
   File structure will follow data_driven_guide.instructions.md JSON schema with testId, description, data object, and expected result.
   ```

3. **Reference Guide**
   - All data generation must follow patterns in `data_driven_guide.instructions.md`
   - JSON schema must match DataTestCase interface
   - Include metadata (seed, totalCases, generatedAt)

**Example Output (GATE 1):**
```json
{
  "testCases": [
    {
      "testId": "TC_001",
      "description": "Valid registration - realistic data",
      "data": {
        "firstName": "Michael",
        "lastName": "Anderson",
        "email": "michael.anderson@example.com",
        "phone": "5551234567"
      },
      "expected": "success"
    }
  ],
  "metadata": {
    "seed": 12345,
    "totalCases": 5,
    "generatedAt": "2025-01-15"
  }
}
```

---

### **POM Generator Agent - Data-Driven Test Specs**

**GATE 3 Integration:**

When POM Generator receives data strategy from GATE 1, it should:

1. **Detect Data-Driven Mode** (Step 4)
   - Check if dataStrategy exists in input
   - Determine iteration pattern (forEach vs test.each)
   - Identify data file path

2. **Generate Data-Driven Test Spec** (Step 7 - UPDATED)
   ```typescript
   // Import data file
   import testData from 'tests/test-data/{domain}-{feature}-data.json'
   
   test.describe('{Feature} - Data-Driven', () => {
     
     testData.testCases.forEach((testCase) => {
       test(`${testCase.testId}: ${testCase.description}`, async ({ {pageObjectName} }) => {
         
         await test.step('Step 1', async () => {
           // Use testCase.data.fieldName
         })
         
         await test.step('Verify result', async () => {
           if (testCase.expected === 'success') {
             // Success assertions
           } else {
             // Error assertions
           }
         })
       })
     })
   })
   ```

3. **Reference Guide**
   - Follow test.each() patterns from `data_driven_guide.instructions.md`
   - Use forEach for 2-10 cases, test.describe.parallel for 10+
   - Include test.step() for sub-actions

---

### **DOM Analysis Agent - No Changes Needed**

**GATE 2:** Data-driven mode does NOT affect element mapping. All test cases use the same elements, so DOM analysis remains identical.

---

### **Test Healing Agent - Data-Driven Considerations**

**Healing Logic Update:**

When analyzing failures in data-driven tests:

1. **Identify Failed Data Set** (Step 2)
   - Extract which testId failed from test output
   - Determine if failure is data-specific or systemic
   - Example: "TC_003 failed with email validation error - this is expected for invalid data test"

2. **Differentiate Expected vs Unexpected Failures** (Step 3)
   ```typescript
   // Check if failure matches expected result
   if (testCase.expected === 'error' && testFailed) {
     // This is EXPECTED behavior - not a bug
     logger.info('Test correctly identified invalid data')
   } else if (testCase.expected === 'success' && testFailed) {
     // This is UNEXPECTED - needs healing
     logger.error('Valid data test failed - investigating root cause')
   }
   ```

3. **Avoid Healing Expected Failures**
   - Do NOT trigger healing if test is designed to fail (negative testing)
   - Only heal tests where expected=success but result=fail

---

### **Orchestration Agent - GATE 0 Decision**

**PRE-PROCESSING Update:**

```typescript
// Detect data-driven mode (Step 3)
const keywords = /multiple|different|various|parameterized|data-driven|several|many/i
const hasDataKeywords = keywords.test(request.userStory)
const multipleAC = request.acceptanceCriteria.length > 2

if (hasDataKeywords || request.dataRequirements?.type === 'data-driven' || multipleAC) {
  logger.info('✅ Data-driven mode detected - GATE 0 will execute')
  gate0Required = true
} else {
  logger.info('⏭️ Single test case detected - GATE 0 skipped')
  gate0Required = false
}
```

**GATE 0 Execution:**

When GATE 0 executes, orchestration should:
1. Pass data requirements to Test Case Designer
2. Validate data file creation
3. Store data file path in checkpoint for GATE 3

---

## 📚 Complete Examples

### **Example 1: Simple Login Data-Driven Test**

**📁 WORKING EXAMPLE IN TEMPLATE:** See `tests/test-data/example_com-login-data.json` for a complete, working implementation.

**Step 1: Create Data File**

The template includes a working example at `tests/test-data/example_com-login-data.json` with 3 test cases:
- TC_001: Valid admin login (success scenario)
- TC_002: Invalid password (error scenario)
- TC_003: Non-existent user (error scenario)

Example structure from the template file:
```json
{
  "testCases": [
    {
      "testId": "TC_001",
      "description": "Valid admin login",
      "username": "admin",
      "password": "admin123",
      "expected": "success"
    },
    {
      "testId": "TC_002",
      "description": "Invalid password",
      "username": "admin",
      "password": "wrongpass",
      "expected": "error"
    },
    {
      "testId": "TC_003",
      "description": "Non-existent user",
      "username": "nonexistent",
      "password": "anypass",
      "expected": "error"
    }
  ]
}
```

**Step 2: Create Page Object**

File: `tests/test-objects/gui/pageObjects/pages/loginPage.ts`
```typescript
import { Page } from '@playwright/test'
import { pageActions } from '@utilities/ui/page-actions'

export class LoginPage {
  constructor(public page: Page) {}
  
  async goto() {
    await pageActions.gotoURL(this.page, 'https://example.com/login')
  }
  
  async fillUsername(username: string) {
    await pageActions.fill(this.page, '#username', username)
  }
  
  async fillPassword(password: string) {
    await pageActions.fill(this.page, '#password', password)
  }
  
  async clickLoginButton() {
    await pageActions.click(this.page, '#login-button')
  }
  
  getErrorMessage() {
    return pageActions.getLocator(this.page, '.error-message')
  }
}
```

**Step 3: Create Test Spec**

File: `tests/tests-management/gui/login/login.spec.ts`
```typescript
import { test } from 'tests/test-objects/gui/pageObjects/pageFixture'
import { expect } from '@utilities/reporter/custom-expect'
import testData from 'tests/test-data/example_com-login-data.json'

test.describe('Login functionality - Data-Driven', () => {
  
  testData.testCases.forEach((testCase) => {
    test(`${testCase.testId}: ${testCase.description}`, async ({ loginPage }) => {
      
      await test.step('Navigate to login page', async () => {
        await loginPage.goto()
      })
      
      await test.step(`Login with ${testCase.username}`, async () => {
        await loginPage.fillUsername(testCase.username)
        await loginPage.fillPassword(testCase.password)
        await loginPage.clickLoginButton()
      })
      
      await test.step('Verify result', async () => {
        if (testCase.expected === 'success') {
          await expect(loginPage.page).toHaveURL(/dashboard/)
        } else {
          await expect(loginPage.getErrorMessage()).toBeVisible()
          await expect(loginPage.getErrorMessage()).toContainText(/invalid|incorrect/i)
        }
      })
    })
  })
})
```

---

### **Example 2: Complex Registration Form with Faker Data**

**📁 WORKING EXAMPLE IN TEMPLATE:** See `tests/test-data/demoqa_com-registration-data.json` for a complete, working implementation with 5 test cases.

**Step 1: Create Data Model**

The template includes working data models at `tests/data-management/models/userModel.ts`:

```typescript
export interface User {
  id?: string
  name: string
  company: string
  username: string
  email: string
  address: string
  zip: string
  state: string
  country: string
  phone: string
  photo?: string
}

export interface UserCredential {
  username: string
  password: string
}
```

For registration-specific models, create `tests/data-management/models/registrationModel.ts`:

```typescript
export interface RegistrationData {
  firstName: string
  lastName: string
  email: string
  gender: 'Male' | 'Female' | 'Other'
  mobile: string
  dateOfBirth?: string
  subjects?: string[]
  hobbies?: string[]
  currentAddress?: string
  state?: string
  city?: string
}

export interface RegistrationTestCase {
  testId: string
  description: string
  category: 'valid' | 'invalid' | 'boundary' | 'edge'
  data: RegistrationData
  expected: {
    status: 'success' | 'error'
    message: string
  }
}
```

**Step 2: Generate Data File (LLM Instructions)**

"I will generate test data for student registration with 5 test cases using Faker patterns (seed 12345):
- 2 valid cases: Complete forms with realistic data (faker.person.firstName, faker.person.lastName, faker.internet.email, faker.phone.number)
- 2 invalid cases: Missing required fields (empty firstName, invalid email format)
- 1 boundary case: Minimum length values (firstName: 'Jo', lastName: 'Do')"

**Generated File in Template:** `tests/test-data/demoqa_com-registration-data.json`

The template includes a complete working example with this structure:

```json
{
  "testCases": [
    {
      "testId": "TC_001",
      "description": "Valid registration - complete form",
      "category": "valid",
      "data": {
        "firstName": "Michael",
        "lastName": "Anderson",
        "email": "michael.anderson@example.com",
        "gender": "Male",
        "mobile": "5551234567",
        "dateOfBirth": "15 Jan 1990",
        "subjects": ["Maths", "Physics"],
        "hobbies": ["Sports", "Reading"],
        "currentAddress": "123 Main St, New York, NY 10001",
        "state": "NCR",
        "city": "Delhi"
      },
      "expected": {
        "status": "success",
        "message": "Thanks for submitting the form"
      }
    },
    {
      "testId": "TC_002",
      "description": "Invalid registration - missing first name",
      "category": "invalid",
      "data": {
        "firstName": "",
        "lastName": "Smith",
        "email": "jane.smith@example.com",
        "gender": "Female",
        "mobile": "9876543210"
      },
      "expected": {
        "status": "error",
        "message": "First Name is required"
      }
    }
  ],
  "metadata": {
    "seed": 12345,
    "totalCases": 5,
    "generatedAt": "2025-01-15",
    "breakdown": {
      "valid": 2,
      "invalid": 2,
      "boundary": 1,
      "edge": 0
    }
  }
}
```

**Step 3: Create Data Handlers (Working Example in Template)**

The template includes working data handlers at `tests/data-management/handlers/userDataHandler.ts`:

```typescript
import { User, UserCredential } from '../models/userModel'

export function validateUserData(user: Partial<User>): boolean {
  // Check required fields
  if (!user.name || !user.email || !user.username) {
    return false
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(user.email)) {
    return false
  }
  
  // Validate phone (10 digits)
  if (user.phone && (user.phone.length !== 10 || !/^\d+$/.test(user.phone))) {
    return false
  }
  
  return true
}

export function sanitizeUserData(user: User): User {
  return {
    ...user,
    name: user.name.trim(),
    email: user.email.trim().toLowerCase(),
    username: user.username.trim().toLowerCase()
  }
}
```

**Step 4: Create Test Spec**

File: `tests/tests-management/gui/registration/student-registration.spec.ts`
```typescript
import { test } from 'tests/test-objects/gui/pageObjects/pageFixture'
import { expect } from '@utilities/reporter/custom-expect'
import testData from 'tests/test-data/demoqa_com-registration-data.json'
import type { RegistrationTestCase } from 'tests/data-management/models/registrationModel'

test.describe('Student Registration - Data-Driven', () => {
  
  const typedTestData = testData as { testCases: RegistrationTestCase[] }
  
  typedTestData.testCases.forEach((testCase) => {
    test(`${testCase.testId}: ${testCase.description}`, async ({ registrationPage }) => {
      
      await test.step('Navigate to registration form', async () => {
        await registrationPage.goto()
      })
      
      await test.step('Fill registration form', async () => {
        if (testCase.data.firstName) {
          await registrationPage.fillFirstName(testCase.data.firstName)
        }
        if (testCase.data.lastName) {
          await registrationPage.fillLastName(testCase.data.lastName)
        }
        if (testCase.data.email) {
          await registrationPage.fillEmail(testCase.data.email)
        }
        if (testCase.data.gender) {
          await registrationPage.selectGender(testCase.data.gender)
        }
        if (testCase.data.mobile) {
          await registrationPage.fillMobile(testCase.data.mobile)
        }
        if (testCase.data.dateOfBirth) {
          await registrationPage.selectDateOfBirth(testCase.data.dateOfBirth)
        }
        if (testCase.data.subjects) {
          for (const subject of testCase.data.subjects) {
            await registrationPage.selectSubject(subject)
          }
        }
        if (testCase.data.hobbies) {
          for (const hobby of testCase.data.hobbies) {
            await registrationPage.selectHobby(hobby)
          }
        }
        if (testCase.data.currentAddress) {
          await registrationPage.fillCurrentAddress(testCase.data.currentAddress)
        }
        if (testCase.data.state) {
          await registrationPage.selectState(testCase.data.state)
        }
        if (testCase.data.city) {
          await registrationPage.selectCity(testCase.data.city)
        }
      })
      
      await test.step('Submit form', async () => {
        await registrationPage.clickSubmit()
      })
      
      await test.step('Verify result', async () => {
        if (testCase.expected.status === 'success') {
          await expect(registrationPage.getSuccessModal()).toBeVisible()
          await expect(registrationPage.getSuccessMessage()).toContainText(testCase.expected.message)
        } else {
          // For invalid cases, check if form submission was blocked
          await expect(registrationPage.page).toHaveURL(/automation-practice-form/)
          // Check for error messages if available
          const errorMessages = await registrationPage.getErrorMessages()
          await expect(errorMessages.first()).toBeVisible()
        }
      })
    })
  })
})
```

---

## ✅ Best Practices

### **DO:**
- ✅ Use descriptive testId format: `TC_001`, `TC_002` (3-digit padding)
- ✅ Include `description` field explaining what the test case validates
- ✅ Add `category` field (valid/invalid/boundary/edge) for filtering
- ✅ Set Faker seed for reproducibility (e.g., 12345)
- ✅ Store metadata (seed, totalCases, generatedAt) in data file
- ✅ Use TypeScript interfaces for type safety
- ✅ Validate data before using in tests (data handlers)
- ✅ Use test.step() to break down test actions
- ✅ Include both positive and negative test cases
- ✅ Store data files in `tests/test-data/` directory
- ✅ Use consistent naming: `{domain}-{feature}-data.json`
- ✅ Import JSON files directly: `import testData from 'path/file.json'`

### **DON'T:**
- ❌ Hardcode test data in test specs (use JSON files)
- ❌ Generate random data without seeds (makes debugging impossible)
- ❌ Mix data-driven and non-data-driven tests in same describe block
- ❌ Use test.each() for 1-2 test cases (overkill, use simple tests)
- ❌ Store sensitive data unencrypted in JSON files
- ❌ Create giant data files (split into multiple files by feature)
- ❌ Use relative paths (always use absolute imports)
- ❌ Skip data validation (invalid data = flaky tests)
- ❌ Use test.describe.parallel() without verifying test independence
- ❌ Forget to add testId to test names (makes reports unclear)

---

## 🔗 Integration with Agent Pipeline

### **Agent Responsibilities Summary**

| Agent | Responsibility | Reference Section |
|-------|---------------|-------------------|
| Test Case Designer | Generate data files (GATE 0/1), determine data strategy | [Agent Integration - Test Case Designer](#test-case-designer-agent---data-generation) |
| DOM Analysis | Map elements (unchanged by data-driven mode) | No changes needed |
| POM Generator | Generate data-driven test specs with forEach/test.each | [Agent Integration - POM Generator](#pom-generator-agent---data-driven-test-specs) |
| Test Healing | Differentiate expected vs unexpected failures | [Agent Integration - Test Healing](#test-healing-agent---data-driven-considerations) |
| Orchestration | Detect data-driven mode, trigger GATE 0 | [Agent Integration - Orchestration](#orchestration-agent---gate-0-decision) |

---

## 📌 Version History

- **v2.0** (2025-01-15): Initial comprehensive data-driven testing guide
