---
applyTo: '**/*.agent'
description: 'Data-Driven Testing Guide - Complete patterns for test data management and parameterized testing'
---

# DATA-DRIVEN TESTING GUIDE

## Purpose

Define comprehensive patterns for data-driven test automation, covering test data generation, file organization, Playwright test.each() patterns, and integration with the agent pipeline.

## Core Concepts

```mermaid
flowchart TD
    A[User Story Analysis] --> B{Data-Driven Needed?}
    B -->|Keywords Detected| C[Determine Strategy]
    B -->|Single Test| D[Skip GATE 0]
    C --> E{Test Count}
    E -->|2-5 cases| F[Manual Data Arrays]
    E -->|5-10 cases| G[Faker Generation]
    E -->|10+ cases| H[Faker + Parallel]
    F --> I[Generate JSON File]
    G --> I
    H --> I
    I --> J[Create test.each() Spec]
```

### Decision Matrix

| Scenario | Approach | Reason |
|----------|----------|---------|
| Testing 1-2 variations | Single test with hardcoded values | Simple, readable, fast |
| Testing 3-5 variations | forEach loop with data array | Moderate complexity, good balance |
| Testing 6-10 variations | test.each() with JSON file | Scalable, maintainable |
| Testing 10+ variations | test.each() with Faker generation | Dynamic, comprehensive coverage |
| Boundary value testing | test.each() with predefined boundaries | Systematic edge case testing |
| Negative testing | test.each() with invalid data sets | Error handling validation |

### Triggers for Data-Driven Mode

**Keywords in User Story:**
- "multiple", "different", "various", "several", "many"
- "parameterized", "data-driven", "test with different inputs"
- "valid and invalid", "positive and negative cases"

**Structural Indicators:**
- 3+ acceptance criteria requiring similar test steps with different data
- Form testing with 5+ input fields (suggests boundary/invalid testing)
- User story mentions specific data sets or ranges

### File Organization

**Directory Structure:**
```
tests/
├── test-data/
│   ├── {domain}-{feature}-data.json
│   ├── user-data/credentials.json
│   └── document-files/
├── data-management/
│   ├── models/{domain}Model.ts
│   └── handlers/{domain}DataHandler.ts
```

**File Naming Convention:** `{domain}-{feature}-data.json`

**Rules:**
1. Use sanitized domain name (underscores replace dots)
2. Use kebab-case for feature name
3. Always use `-data.json` suffix
4. Store in `tests/test-data/` directory

## Reference Patterns

### Pattern 1: Manual Data Arrays (Simple)

**When to Use:** 2-5 test cases with specific values

**Structure:**
```json
// Example test data structure (static):
{
  "testCases": [
    {
      "testId": "TC_001",
      "description": "Valid registration",
      "data": {
        "firstName": "<EXAMPLE_FIRST_NAME>",
        "lastName": "<EXAMPLE_LAST_NAME>",
        "email": "<EXAMPLE_EMAIL>",
        "phone": "<EXAMPLE_PHONE>"
      },
      "expected": "success"
    },
    {
      "testId": "TC_002",
      "description": "Invalid email format",
      "data": {
        "firstName": "<EXAMPLE_FIRST_NAME>",
        "lastName": "<EXAMPLE_LAST_NAME>",
        "email": "invalid-email",
        "phone": "<EXAMPLE_PHONE>"
      },
      "expected": "error"
    }
  ]
}
```

**LLM Generation Instructions:**
"I will create a JSON file with 5 test cases. Each test case will have testId, description, input data object, and expected result. Test cases will cover: 2 valid scenarios with different data, 2 invalid scenarios (missing required field, invalid format), and 1 boundary scenario (maximum length values)."

### Pattern 2: Faker-Based Generation (Recommended)

**When to Use:** 5+ test cases needing realistic data

**Implementation:**

```typescript
// Example data generation pattern (non-executable):
// import { faker } from '@faker-js/faker'
//
// faker.seed(12345)  // For reproducibility
//
// generateValidCase(index) {
//   return {
//     testId: `TC_${String(index).padStart(3, '0')}`,
//     description: `Valid registration - case ${index}`,
//     data: {
//       firstName: faker.person.firstName(),
//       lastName: faker.person.lastName(),
//       email: faker.internet.email(),
//       phone: faker.phone.number('##########')
//     },
//     expected: 'success'
//   }
// }
//
// generateInvalidCase(index, errorType) {
//   const baseData = { /* ... */ }
//   if (errorType === 'invalid-email') {
//     baseData.email = 'invalid-email-format'
//   }
//   return { testId: `TC_${index}`, data: baseData, expected: 'error' }
// }
```

**LLM Generation Instructions:**
"I will generate test data using Faker patterns. I'll use seed 12345 for reproducibility. For valid cases, I'll generate realistic names using faker.person.firstName/lastName, emails using faker.internet.email, and 10-digit phone numbers. For invalid cases, I'll intentionally break validation rules (empty strings, invalid formats, boundary violations). The output will be a JSON file with 6 test cases: 3 valid, 3 invalid."

### Pattern 3: Hybrid Approach (Boundary + Faker)

**When to Use:** Need specific edge cases + general variations

**Structure:**
```json
// Example hybrid data set (static):
{
  "testCases": [
    {
      "testId": "TC_001",
      "description": "Minimum valid length",
      "data": {
        "firstName": "Jo",
        "lastName": "Do"
      },
      "expected": "success",
      "category": "boundary"
    },
    {
      "testId": "TC_002",
      "description": "Maximum valid length",
      "data": {
        "firstName": "<MAX_LENGTH_STRING>",
        "lastName": "<MAX_LENGTH_STRING>"
      },
      "expected": "success",
      "category": "boundary"
    },
    {
      "testId": "TC_003",
      "description": "Typical valid case - Faker generated",
      "data": {
        "firstName": "<FAKER_FIRST_NAME>",
        "lastName": "<FAKER_LAST_NAME>"
      },
      "expected": "success",
      "category": "general"
    }
  ]
}
```

**LLM Generation Instructions:**
"I will create a hybrid data set with 10 test cases: 2 boundary cases (minimum length, maximum length using field constraints from HTML), 2 edge cases (special characters, unicode), 3 valid general cases (Faker-style realistic data), and 3 invalid cases (empty, wrong format, exceeds limit). Each test case includes a category field to indicate testing type."

### Pattern 4: Playwright test.each() - Basic

**Test Data File:** `tests/test-data/example_com-login-data.json`

**Test Spec Implementation:**
```typescript
// Example test.each() pattern (non-executable):
// import { test } from 'tests/test-objects/gui/pageObjects/pageFixture'
// import { expect } from '@utilities/reporter/custom-expect'
// import testData from 'tests/test-data/example_com-login-data.json'
//
// test.describe('Login functionality - Data-Driven', () => {
//   
//   testData.testCases.forEach((testCase) => {
//     test(`${testCase.testId}: Login with ${testCase.username}`, async ({ loginPage }) => {
//       
//       await test.step('Navigate to login page', async () => {
//         await loginPage.goto()
//       })
//       
//       await test.step(`Enter credentials: ${testCase.username}`, async () => {
//         await loginPage.fillUsername(testCase.username)
//         await loginPage.fillPassword(testCase.password)
//         await loginPage.clickLoginButton()
//       })
//       
//       await test.step('Verify result', async () => {
//         if (testCase.expected === 'success') {
//           await expect(loginPage.page).toHaveURL(/dashboard/)
//         } else {
//           await expect(loginPage.getErrorMessage()).toBeVisible()
//         }
//       })
//     })
//   })
// })
```

**Key Points:**
- Import JSON file directly: `import testData from 'path/to/file.json'`
- Use `forEach()` to iterate test cases
- Test name includes testId and description for clarity
- Each iteration is independent test execution

### Pattern 5: Playwright Native for Loop

**Alternative Syntax:**
```typescript
// Example for loop pattern (non-executable):
// test.describe('Login functionality', () => {
//   
//   for (const testCase of testData.testCases) {
//     test(`${testCase.testId}: Login with ${testCase.username}`, async ({ loginPage }) => {
//       // Test implementation
//     })
//   }
// })
```

### Pattern 6: Complex Data-Driven - Multiple Objects

**Test Data File Structure:**
```json
// Example complex data structure (static):
{
  "testCases": [
    {
      "testId": "TC_001",
      "description": "Valid registration - all fields",
      "data": {
        "firstName": "<FIRST_NAME>",
        "lastName": "<LAST_NAME>",
        "email": "<EMAIL>",
        "gender": "Male",
        "mobile": "<PHONE>",
        "dateOfBirth": "<DATE>",
        "subjects": ["Maths", "Physics"],
        "hobbies": ["Sports", "Reading"],
        "currentAddress": "<ADDRESS>",
        "state": "<STATE>",
        "city": "<CITY>"
      },
      "expected": {
        "status": "success",
        "message": "Thanks for submitting the form"
      }
    }
  ]
}
```

**Test Spec Pattern:**
```typescript
// Example complex test.each() (non-executable):
// testData.testCases.forEach((testCase) => {
//   test(`${testCase.testId}: ${testCase.description}`, async ({ registrationPage }) => {
//     
//     await test.step('Fill registration form', async () => {
//       if (testCase.data.firstName) {
//         await registrationPage.fillFirstName(testCase.data.firstName)
//       }
//       if (testCase.data.lastName) {
//         await registrationPage.fillLastName(testCase.data.lastName)
//       }
//       // ... more fields
//     })
//     
//     await test.step('Verify result', async () => {
//       if (testCase.expected.status === 'success') {
//         await expect(registrationPage.getSuccessMessage()).toContainText(testCase.expected.message)
//       }
//     })
//   })
// })
```

### Pattern 7: Parallel Execution

**When to Use:** 10+ test cases needing speed

**Structure:**
```typescript
// Example parallel execution (non-executable):
// test.describe.parallel('Large dataset testing', () => {
//   
//   testData.testCases.forEach((testCase) => {
//     test(`${testCase.testId}`, async ({ registrationPage }) => {
//       // Test implementation
//       // Each test runs in parallel worker
//     })
//   })
// })
```

**Warning:** Use parallel execution only when tests are fully independent (no shared state, no database conflicts).

### Pattern 8: Data Models (TypeScript Interfaces)

**Purpose:** Define structure and type safety for test data

**Location:** `tests/data-management/models/{domain}Model.ts`

**Example:**
```typescript
// Example data model structure (non-executable):
// export interface RegistrationData {
//   firstName: string
//   lastName: string
//   email: string
//   gender: 'Male' | 'Female' | 'Other'
//   mobile: string
//   dateOfBirth?: string
//   subjects?: string[]
//   hobbies?: string[]
// }
//
// export interface RegistrationTestCase {
//   testId: string
//   description: string
//   data: RegistrationData
//   expected: {
//     status: 'success' | 'error'
//     message: string
//   }
// }
```

**Usage in Test Spec:**
```typescript
// Example typed usage (non-executable):
// import { RegistrationDataFile } from 'tests/data-management/models/registrationModel'
// import testData from 'tests/test-data/demoqa_com-registration-data.json'
//
// const typedTestData: RegistrationDataFile = testData
//
// typedTestData.testCases.forEach((testCase) => {
//   // TypeScript will autocomplete testCase.data.firstName, etc.
// })
```

### Pattern 9: Data Handlers (Transformation Functions)

**Purpose:** Transform or validate data before use in tests

**Location:** `tests/data-management/handlers/{domain}DataHandler.ts`

**Example:**
```typescript
// Example data handler functions (non-executable):
// export function validateRegistrationData(data: RegistrationData): boolean {
//   // Check required fields
//   if (!data.firstName || !data.lastName || !data.email || !data.mobile) {
//     return false
//   }
//   
//   // Validate email format
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//   if (!emailRegex.test(data.email)) {
//     return false
//   }
//   
//   // Validate mobile (10 digits)
//   if (data.mobile.length !== 10 || !/^\d+$/.test(data.mobile)) {
//     return false
//   }
//   
//   return true
// }
//
// export function sanitizeRegistrationData(data: RegistrationData): RegistrationData {
//   return {
//     ...data,
//     firstName: data.firstName.trim(),
//     lastName: data.lastName.trim(),
//     email: data.email.trim().toLowerCase(),
//     mobile: data.mobile.replace(/\D/g, '').slice(0, 10)
//   }
// }
```

**Usage in Test:**
```typescript
// Example handler usage (non-executable):
// import { sanitizeRegistrationData, validateRegistrationData } from 'tests/data-management/handlers/registrationDataHandler'
//
// testData.testCases.forEach((testCase) => {
//   test(`${testCase.testId}`, async ({ registrationPage }) => {
//     
//     const cleanData = sanitizeRegistrationData(testCase.data)
//     const isValid = validateRegistrationData(cleanData)
//     
//     if (testCase.expected.status === 'success' && !isValid) {
//       throw new Error(`Test data invalid for ${testCase.testId}`)
//     }
//     
//     await registrationPage.fillFirstName(cleanData.firstName)
//   })
// })
```

### Pattern 10: Environment-Specific Data

**Credentials Management:**

**Location:** `tests/test-data/user-data/credentials.json`

**Structure:**
```json
// Example credentials structure (static):
{
  "dev": {
    "admin": {
      "username": "<DEV_ADMIN_USERNAME>",
      "password": "<BASE64_ENCODED_PASSWORD>",
      "encrypted": true
    }
  },
  "staging": {
    "admin": {
      "username": "<STAGING_ADMIN_USERNAME>",
      "password": "<BASE64_ENCODED_PASSWORD>",
      "encrypted": true
    }
  }
}
```

**Usage:**
```typescript
// Example environment-specific usage (non-executable):
// import credentials from 'tests/test-data/user-data/credentials.json'
// import { decryptFromBase64 } from '@utilities/common/string-utils'
//
// test('Admin login', async ({ loginPage }) => {
//   const env = process.env.NODE_ENV || 'dev'
//   const adminCreds = credentials[env].admin
//   
//   const username = adminCreds.username
//   const password = adminCreds.encrypted 
//     ? decryptFromBase64(adminCreds.password)
//     : adminCreds.password
//   
//   await loginPage.login(username, password)
// })
```

### Pattern 11: File-Based Test Data

**Document Upload Testing:**

**Location:** `tests/test-data/document-files/`

**Structure:**
```
document-files/
├── valid-document.pdf (5 KB, valid format)
├── invalid-format.exe (1 KB, blocked format)
├── oversized-file.pdf (25 MB, exceeds limit)
```

**Test Data:**
```json
// Example file upload test data (static):
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
    }
  ]
}
```

## Integration Points

**Used By:**
- Test Case Designer: GATE 0/1 for data file generation
- POM Generator: GATE 3 for test.each() spec generation
- Orchestration: PRE-PROCESSING for data-driven mode detection

**Provides:**
- Data generation strategies (manual, Faker, hybrid)
- File organization standards
- Playwright test.each() patterns
- Data model and handler patterns

**Dependencies:**
- `mcp_integration_guide.instructions.md` - MCP tool specifications
- `rules.instructions.md` - Global rules

## Examples

### Example 1: Simple Login Data-Driven Test

**Working Example in Template:** `tests/test-data/example_com-login-data.json`

**Data File:**
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
    }
  ]
}
```

**Test Spec:** See working example at `tests/tests-management/gui/login/login.spec.ts`

### Example 2: Complex Registration Form

**Working Example in Template:** `tests/test-data/demoqa_com-registration-data.json`

**Contains:** 5 test cases with complex nested data structures including arrays (subjects, hobbies) and optional fields.

**Models:** See `tests/data-management/models/userModel.ts`

**Handlers:** See `tests/data-management/handlers/userDataHandler.ts`

## Constraints

**NEVER:**
- Hardcode test data in test specs (use JSON files)
- Generate random data without seeds (makes debugging impossible)
- Mix data-driven and non-data-driven tests in same describe block
- Use test.each() for 1-2 test cases (overkill, use simple tests)
- Store sensitive data unencrypted in JSON files
- Create giant data files (split into multiple files by feature)
- Use relative paths (always use absolute imports)
- Skip data validation (invalid data = flaky tests)
- Use test.describe.parallel() without verifying test independence
- Forget to add testId to test names (makes reports unclear)

**ALWAYS:**
- Use descriptive testId format: `TC_001`, `TC_002` (3-digit padding)
- Include `description` field explaining what the test case validates
- Add `category` field (valid/invalid/boundary/edge) for filtering
- Set Faker seed for reproducibility (e.g., 12345)
- Store metadata (seed, totalCases, generatedAt) in data file
- Use TypeScript interfaces for type safety
- Validate data before using in tests (data handlers)
- Use test.step() to break down test actions
- Include both positive and negative test cases
- Store data files in `tests/test-data/` directory
- Use consistent naming: `{domain}-{feature}-data.json`
- Import JSON files directly: `import testData from 'path/file.json'`
