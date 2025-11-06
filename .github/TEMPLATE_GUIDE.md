# 📘 PLAYWRIGHT TEMPLATE GUIDE - For LLM Agents

## 🎯 Purpose
This guide provides a comprehensive overview of the Playwright test automation template structure, designed for LLM agents to understand, navigate, and integrate with the codebase efficiently.

---

## 📂 Directory Structure Overview

```
QAAgent/
├── .github/
│   ├── copilot-instructions.md                    # Orchestration Agent instructions
│   └── instructions/
│       ├── data_driven_guide.instructions.md      # Data-driven testing patterns
│       ├── dom_analysis.agent.instructions.md     # DOM element mapping agent
│       ├── mcp_integration_guide.instructions.md  # MCP tools integration
│       ├── memory_patterns_reference.instructions.md  # Memory storage patterns
│       ├── pom_generator.agent.instructions.md    # Page Object Model generator
│       ├── rules.instructions.md                  # Global agent rules
│       ├── state_management_guide.instructions.md # State persistence patterns
│       ├── test_case_designer.agent.instructions.md  # Test case design agent
│       └── test_healing.agent.instructions.md     # Auto-healing agent
│
├── configs/
│   └── project.config.ts                          # Playwright project configs
│
├── environments/
│   ├── dev.env                                    # Development environment vars
│   ├── staging.env                                # Staging environment vars
│   ├── sit.env                                    # SIT environment vars
│   └── prod.env                                   # Production environment vars
│
├── src/
│   ├── types/
│   │   ├── custom-expect.d.ts                     # Custom expect type definitions
│   │   └── custom.d.ts                            # General type definitions
│   │
│   └── utilities/
│       ├── api/                                   # API testing utilities
│       │   ├── api-authentication-helper.ts       # Auth helpers
│       │   ├── api-config.ts                      # API config
│       │   ├── api-helper.ts                      # API request wrappers
│       │   ├── authentication-types.ts            # Auth types
│       │   └── content-types.ts                   # HTTP content types
│       │
│       ├── common/                                # Generic utilities
│       │   ├── datetime-utils.ts                  # Date/time manipulation
│       │   ├── number-utils.ts                    # Number utilities
│       │   ├── object-utils.ts                    # Object manipulation
│       │   ├── sorting-utils.ts                   # Sorting functions
│       │   └── string-utils.ts                    # String manipulation
│       │
│       ├── reporter/                              # Custom reporting
│       │   ├── custom-expect.ts                   # Enhanced expect assertions
│       │   ├── custom-logger.ts                   # Winston logger
│       │   ├── error-handler.ts                   # Error handling
│       │   ├── monocart-columns-config.ts         # Report columns
│       │   └── monocart-config.ts                 # Monocart reporter config
│       │
│       └── ui/                                    # UI testing utilities
│           ├── assert-utils.ts                    # Assertion helpers
│           ├── page-actions.ts                    # Page action wrappers (975 lines)
│           ├── page-factory.ts                    # Page object factory
│           ├── parameter-types.ts                 # Parameter type definitions
│           └── timeout-const.ts                   # Timeout constants
│
├── tests/
│   ├── data-management/                           # Data models and handlers
│   │   ├── models/
│   │   │   └── userModel.ts                       # User data model (EXAMPLE)
│   │   └── handlers/
│   │       └── userDataHandler.ts                 # User data validation/transform (EXAMPLE)
│   │
│   ├── test-data/                                 # Test data files
│   │   ├── example_com-login-data.json            # Login test data (EXAMPLE)
│   │   ├── demoqa_com-registration-data.json      # Registration test data (EXAMPLE)
│   │   ├── document-files/                        # Document upload test files
│   │   └── user-data/                             # User credentials (encrypted)
│   │
│   ├── test-objects/                              # Page Objects and API models
│   │   ├── api/
│   │   │   ├── helpers/
│   │   │   │   └── fakeApiHelper.ts               # Example API helper
│   │   │   └── models/
│   │   │       └── userModel.ts                   # API User model
│   │   │
│   │   └── gui/
│   │       └── pageObjects/
│   │           ├── pageFixture.ts                 # Page object fixture setup
│   │           ├── components/                    # Reusable UI components
│   │           │   ├── appHeaders.ts              # Header component
│   │           │   ├── appNavigation.ts           # Navigation component
│   │           │   └── dialogPrivacySettings.ts   # Privacy dialog component
│   │           └── pages/                         # Page objects
│   │               ├── documentSearch.page.ts     # Document search page
│   │               ├── documentUpload.page.ts     # Document upload page
│   │               ├── login.page.ts              # Login page
│   │               └── userGroup.page.ts          # User group page
│   │
│   └── tests-management/                          # Test specifications
│       ├── api/
│       │   └── sampleApiFunctionalities.spec.ts   # API test examples
│       └── gui/
│           └── docSearchFunctionalities/
│               └── userGroupManagement.spec.ts    # GUI test examples
│
├── playwright.config.ts                           # Main Playwright configuration
├── tsconfig.json                                  # TypeScript configuration
├── eslint.config.mjs                              # ESLint configuration
├── package.json                                   # Node.js dependencies
└── README.md                                      # Project documentation
```

---

## 🏗️ Architecture Patterns

### **1. Page Object Model (POM)**

**Location:** `tests/test-objects/gui/pageObjects/`

**Structure:**
- **pages/**: Individual page classes with locators and methods
- **components/**: Reusable UI components (headers, dialogs, navigation)
- **pageFixture.ts**: Extends Playwright's baseTest with page object fixtures

**Example Pattern:**
```typescript
// Page Object Class
export class LoginPage {
  constructor(public page: Page) {}
  
  async goto() {
    await pageActions.gotoURL(this.page, 'https://example.com/login')
  }
  
  async fillUsername(username: string) {
    await pageActions.fill(this.page, '#username', username)
  }
}

// Fixture Registration (pageFixture.ts)
export const test = baseTest.extend<PageObjects>({
  loginPage: async ({ page }, use) => {
    await use(createPageObject(LoginPage, page))
  }
})

// Test Usage
test('Login test', async ({ loginPage }) => {
  await loginPage.goto()
  await loginPage.fillUsername('admin')
})
```

---

### **2. Data-Driven Testing**

**📖 REFERENCE:** See `.github/instructions/data_driven_guide.instructions.md` for complete patterns

**Key Components:**
- **Test Data Files:** `tests/test-data/{domain}-{feature}-data.json`
- **Data Models:** `tests/data-management/models/{model}Model.ts`
- **Data Handlers:** `tests/data-management/handlers/{model}DataHandler.ts`

**Example Files:**
- `tests/test-data/example_com-login-data.json` - 3 login test cases
- `tests/test-data/demoqa_com-registration-data.json` - 5 registration test cases with valid/invalid/boundary
- `tests/data-management/models/userModel.ts` - User interface definition
- `tests/data-management/handlers/userDataHandler.ts` - Validation and transformation functions

**Naming Convention:**
```
{domain}-{feature}-data.json

Examples:
- example_com-login-data.json
- demoqa_com-registration-data.json
- myapp_test-checkout-data.json
```

**JSON Schema:**
```json
{
  "testCases": [
    {
      "testId": "TC_001",
      "description": "Test description",
      "category": "valid|invalid|boundary|edge",
      "data": { /* test data object */ },
      "expected": "success|error" or { "status": "...", "message": "..." }
    }
  ],
  "metadata": {
    "seed": 12345,
    "totalCases": 5,
    "generatedAt": "2025-01-15",
    "breakdown": { "valid": 2, "invalid": 2, "boundary": 1 }
  }
}
```

**Test Implementation Pattern:**
```typescript
import testData from 'tests/test-data/example_com-login-data.json'

test.describe('Data-Driven Tests', () => {
  testData.testCases.forEach((testCase) => {
    test(`${testCase.testId}: ${testCase.description}`, async ({ loginPage }) => {
      await test.step('Execute test', async () => {
        // Use testCase.data for input
      })
    })
  })
})
```

---

### **3. Utilities Layer**

**Location:** `src/utilities/`

**Purpose:** Abstraction layer over Playwright APIs for consistency and error handling

**Key Files:**
- **page-actions.ts** (975 lines): Wrapper functions for all Playwright page interactions
  - `click()`, `fill()`, `select()`, `hover()`, `dragAndDrop()`
  - `waitForElement()`, `getLocator()`, `getElement()`
  - Error handling via `ErrorHandler.handle()`
  - Timeout management via constants

- **custom-logger.ts**: Winston logger with multiple transports
- **custom-expect.ts**: Enhanced Playwright expect with custom matchers

**Usage Pattern:**
```typescript
import { pageActions } from '@utilities/ui/page-actions'

// Instead of direct Playwright calls
await page.click('#button')  // ❌ Don't use directly

// Use page-actions wrapper
await pageActions.click(page, '#button')  // ✅ Use wrapper
```

---

### **4. Multi-Environment Configuration**

**Configuration Files:**
- `playwright.config.ts`: Main config with environment switching
- `environments/*.env`: Environment-specific variables
- `configs/project.config.ts`: Project-specific configs

**Environment Variables:**
```bash
NODE_ENV=dev|staging|sit|prod
```

**Usage:**
```typescript
const env = process.env.NODE_ENV || 'dev'
// Loads environments/{env}.env automatically
```

---

### **5. Test Organization**

**Test Specs Location:** `tests/tests-management/`

**Structure:**
- `api/`: API test specifications
- `gui/`: GUI test specifications (organized by feature)

**Naming Convention:**
```
{feature}.spec.ts

Examples:
- login.spec.ts
- userGroupManagement.spec.ts
- documentUpload.spec.ts
```

**Test Pattern:**
```typescript
import { test } from 'tests/test-objects/gui/pageObjects/pageFixture'
import { expect } from '@utilities/reporter/custom-expect'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  })
  
  test('Test description', async ({ loginPage }) => {
    await test.step('Step 1', async () => {
      // Test step 1
    })
    
    await test.step('Step 2', async () => {
      // Test step 2
    })
  })
})
```

---

## 🤖 Agent Instructions Overview

**Location:** `.github/instructions/`

### **Master Orchestration Agent**
- **File:** `.github/copilot-instructions.md`
- **Role:** Coordinates all agents in test automation pipeline
- **Gates:** PRE-PROCESSING → GATE 0-5 → FINAL CHECKPOINT

### **Specialized Agents**

| Agent | File | Purpose |
|-------|------|---------|
| Test Case Designer | `test_case_designer.agent.instructions.md` | Convert user stories to test cases |
| DOM Analysis | `dom_analysis.agent.instructions.md` | Map UI elements to locator strategies |
| POM Generator | `pom_generator.agent.instructions.md` | Generate Page Object Model code |
| Test Healing | `test_healing.agent.instructions.md` | Auto-repair failing tests |

### **Supporting Guides**

| Guide | File | Purpose |
|-------|------|---------|
| Data-Driven Guide | `data_driven_guide.instructions.md` | Complete data-driven testing patterns |
| MCP Integration | `mcp_integration_guide.instructions.md` | Memory, sequential thinking, todo tools |
| State Management | `state_management_guide.instructions.md` | Gate output persistence |
| Memory Patterns | `memory_patterns_reference.instructions.md` | Standardized memory queries |
| Global Rules | `rules.instructions.md` | Agent communication protocols |

---

## 📦 Dependencies

**Core:**
- `@playwright/test`: ^1.51.0 - Test framework
- `typescript`: Latest - Type safety
- `@faker-js/faker`: ^9.3.0 - Test data generation

**Utilities:**
- `axios`: ^1.8.4 - HTTP client for API tests
- `dotenv`: ^16.4.7 - Environment variable loading
- `winston`: ^3.17.0 - Logging

**Reporting:**
- `monocart-reporter`: ^2.9.16 - Test reports

**See `package.json` for complete list**

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific environment
npm run test:dev
npm run test:staging
npm run test:prod

# Run specific browser
npm run test:chromium
npm run test:firefox
npm run test:msedge

# Run with headed mode
npm run test:chromium-headed

# Run API tests
npm run test:api

# Lint code
npm run lint
```

---

## 🔍 Locator Strategy

**Priority Order:**
1. **ID** (`#elementId`) - Highest confidence
2. **data-testid** (`[data-testid="value"]`) - Second best
3. **ARIA attributes** (`[aria-label="value"]`) - Accessibility
4. **XPath** (last resort) - Fragile

**Self-Healing Pattern:**
```typescript
async fillField(value: string) {
  try {
    await pageActions.fill(this.page, '#primary-locator', value)
  } catch (error) {
    logger.warn('Primary locator failed, using fallback')
    try {
      await pageActions.fill(this.page, '[data-testid="fallback"]', value)
    } catch (error2) {
      await pageActions.fill(this.page, '//xpath-fallback', value)
    }
  }
}
```

---

## 📊 Timeout Configuration

**Constants Location:** `src/utilities/ui/timeout-const.ts`

**Default Values:**
- `ACTION_TIMEOUT`: Element actions (click, fill)
- `EXPECT_TIMEOUT`: Assertions and waits
- `NAVIGATION_TIMEOUT`: Page loads
- `TEST_TIMEOUT`: Overall test timeout

**Usage:**
```typescript
await pageActions.click(page, selector, { timeout: ACTION_TIMEOUT })
```

---

## 🔒 Credentials Management

**Location:** `tests/test-data/user-data/`

**Pattern:**
- Store encrypted credentials per environment
- Use `decryptFromBase64()` from `string-utils.ts`
- Load based on `NODE_ENV`

**Usage:**
```typescript
import { decryptFromBase64 } from '@utilities/common/string-utils'

const env = process.env.NODE_ENV || 'dev'
const credentials = require(`tests/test-data/user-data/${env}-credentials.json`)
const password = decryptFromBase64(credentials.admin.password)
```

---

## 🎨 Reporting

**Reporters Configured:**
- **Monocart**: HTML report with screenshots/videos
- **List**: Console output
- **Custom Logger**: Winston-based logging to `logs/`

**Report Location:** `test-results/` and `monocart-report/`

---

## ✅ Best Practices

### **DO:**
- ✅ Use `pageActions` wrapper instead of direct Playwright calls
- ✅ Organize page objects by feature/domain
- ✅ Use `test.step()` for sub-actions
- ✅ Store test data in JSON files
- ✅ Use TypeScript interfaces for data models
- ✅ Add tags to tests (`@admin`, `@Positive`)
- ✅ Use environment-specific configs
- ✅ Implement self-healing locators with fallbacks

### **DON'T:**
- ❌ Hardcode credentials in tests
- ❌ Use relative paths (use absolute imports)
- ❌ Mix test logic with page objects
- ❌ Create giant test files (split by feature)
- ❌ Skip error handling
- ❌ Use weak locators (classes only)
- ❌ Generate random data without seeds

---

## 📝 File Naming Conventions

**Test Data:**
```
{domain}-{feature}-data.json
example_com-login-data.json
```

**Page Objects:**
```
{feature}.page.ts
login.page.ts
registration.page.ts
```

**Test Specs:**
```
{feature}.spec.ts
login.spec.ts
userManagement.spec.ts
```

**State Files:**
```
.state/{domain}-{feature}-gate{N}-output.json
.state/demoqa_com-registration-gate1-output.json
```

---

## 🔗 Key Integrations

**Playwright Test Runner:**
- Uses custom `pageFixture.ts` extending baseTest
- Fixtures provide page objects automatically
- Parallel execution enabled
- Retry strategy: 2 retries in CI, 0 locally

**TypeScript:**
- Path aliases: `@utilities`, `@configs`
- Strict type checking enabled
- Custom type definitions in `src/types/`

**ESLint:**
- Code quality enforcement
- Run via `npm run lint`

---

## 🆘 Troubleshooting

**Common Issues:**

1. **Import errors:** Check `tsconfig.json` paths configuration
2. **Timeout errors:** Adjust timeouts in `src/utilities/ui/timeout-const.ts`
3. **Locator failures:** Check self-healing fallback chain
4. **Environment issues:** Verify `.env` files exist and are loaded
5. **Compilation errors:** Run `npm install` and check TypeScript version

---

## 📚 Additional Resources

- **Playwright Docs:** https://playwright.dev/
- **Agent Instructions:** `.github/instructions/`
- **Data-Driven Guide:** `.github/instructions/data_driven_guide.instructions.md`
- **MCP Tools:** `.github/instructions/mcp_integration_guide.instructions.md`

---

## 📌 Version

Template Version: 2.0  
Last Updated: 2025-01-15  
Playwright Version: 1.51.0  
Node Version: ≥22.14.0
