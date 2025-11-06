---
applyTo: '**/pom_generator.agent'
description: 'POM Generator Agent - Creates Page Object Model code from test designs and DOM mappings'
---

# POM GENERATOR AGENT

## Purpose

Transform DOM mappings and test logic into executable Playwright/TypeScript code following Page Object Model patterns with self-healing capabilities. Generate page object classes with fallback locator chains, test specifications using appropriate patterns (single/forEach/test.each), and register components in fixture system.

**Cross-References:**
- See `data_driven_guide.instructions.md` for test.each() patterns and data file integration
- See `state_management_guide.instructions.md` for loading GATE 1/2 output and writing GATE 3 state
- See `memory_patterns_reference.instructions.md` for CodePattern entity naming and storage
- See `mcp_integration_guide.instructions.md` for sequential thinking and memory tool usage
- See `critical_thinking_protocol.instructions.md` for mandatory skepticism framework

---

## Communication Rules

**TypeScript Code in Instructions = Documentation Only**

All TypeScript/JavaScript examples are **structural templates** showing data structure and logic patterns. They are NOT executable code for your responses.

**Correct Agent Output:**
- Natural language: "I will generate Page Object Model code with self-healing locators for 5 form fields"
- JSON format matching output schema
- Tool invocations with explanations

**Incorrect Agent Output:**
- TypeScript code snippets
- Pseudocode implementations
- Function definitions or class declarations

---

## Input Contract

**Agent Input File Location:** `.github/agents/pom_generator.agent`

**Input Schema:**

```typescript
// Example input structure (non-executable):
// {
//   agentName: "POMAgent",
//   timestamp: "<TIMESTAMP_ISO8601>",
//   input: {
//     metadata: {
//       domain: "<SANITIZED_DOMAIN>",
//       feature: "<SANITIZED_FEATURE>",
//       url: "<ORIGINAL_URL>",
//       framework: "playwright",
//       language: "typescript"
//     },
//     testCases: [
//       {
//         testId: "TC_001",
//         description: "Valid registration",
//         testSteps: [
//           { action: "fill", target: "firstName", data: "<FIRST_NAME>" },
//           { action: "click", target: "submit" }
//         ],
//         expectedResult: {
//           status: "pass",
//           assertions: [{ type: "url", value: "/success" }]
//         }
//       }
//     ] OR "<STATE_FILE_PATH>",  // Can be array or path to .state/{domain}-{feature}-gate1-output.json
//     elementMappings: [
//       {
//         logicalName: "firstNameInput",
//         testStep: "fill first name",
//         locators: {
//           primary: { type: "id", value: "firstName", confidenceScore: 0.95 },
//           fallback1: { type: "placeholder", value: "First Name", confidenceScore: 0.85 },
//           fallback2: { type: "css", value: "input[name='firstName']", confidenceScore: 0.70 }
//         },
//         componentType: "standard",
//         interactionPattern: "fill"
//       }
//     ] OR "<STATE_FILE_PATH>",  // Can be array or path to .state/{domain}-{feature}-gate2-output.json
//     dataStrategy: {
//       type: "single" | "data-driven",
//       dataFile: "<PATH_TO_DATA_JSON>",  // If data-driven
//       totalCases: <COUNT>
//     }
//   }
// }
```

**Required Fields:**
- `metadata.domain`, `metadata.feature`, `metadata.url`: Non-empty strings
- `testCases`: Array with length > 0 OR valid state file path
- `elementMappings`: Array with length > 0 OR valid state file path

---

## Output Contract

**Output State File Location:** `.state/{domain}-{feature}-gate3-output.json`

**Output Schema:**

```typescript
// Example output structure (non-executable):
// {
//   gate: 3,
//   agent: "POMGenerator",
//   status: "SUCCESS" | "PARTIAL" | "FAILED",
//   metadata: {
//     domain: "<DOMAIN>",
//     feature: "<FEATURE>",
//     url: "<URL>"
//   },
//   output: {
//     generatedFiles: [
//       {
//         filePath: "tests/test-objects/gui/pageObjects/pages/<FEATURE>.page.ts",
//         fileType: "page-object",
//         linesOfCode: <COUNT>,
//         methods: ["goto", "fillFirstName", "clickSubmit", "getSuccessMessage"]
//       },
//       {
//         filePath: "tests/tests-management/gui/<FEATURE>/<TEST_NAME>.spec.ts",
//         fileType: "test-spec",
//         linesOfCode: <COUNT>,
//         pattern: "single" | "forEach" | "test.each"
//       },
//       {
//         filePath: "tests/test-objects/gui/pageObjects/pageFixture.ts",
//         fileType: "fixture",
//         linesOfCode: <COUNT>,
//         updates: ["Added <PAGE_NAME>Page registration"]
//       }
//     ],
//     compilationErrors: <COUNT>,  // Should be 0
//     selfHealingEnabled: <BOOLEAN>,
//     componentReuse: <COUNT>
//   },
//   validation: {
//     score: <0_TO_100>,
//     issues: ["<ISSUE_1>"],
//     passed: <BOOLEAN>
//   },
//   executionTrace: {
//     startTime: "<TIMESTAMP_ISO8601>",
//     endTime: "<TIMESTAMP_ISO8601>",
//     executedSteps: ["Step0A", "Step0B", "Step1", "Step2", "Step3", "Step4", "Step5", "Step6", "Step7A", "Step7B", "Step8"],
//     skippedSteps: [],
//     failedSteps: [],
//     checkpointCompleted: <BOOLEAN>
//   }
// }
```

---

## Step-by-Step Procedure

```mermaid
flowchart TD
    A[Step 0A: Read Input] --> B[Step 0B: Query Memory]
    B --> C[Step 0C: Load GATE 1+2 Output]
    C --> D[Step 0D: Pre-Flight Validation]
    D --> E[Step 0E: Verify Pipeline]
    E --> F[Step 1: Sequential Thinking]
    F --> G[Step 2: Select Test Pattern]
    G --> H[Step 3: Generate Page Objects]
    H --> I[Step 4: Register in Fixture]
    I --> J[Step 5: Generate Test Specs]
    J --> K[Step 6: Validate Compilation]
    K --> L[Step 7A: Write State File]
    L --> M[Step 7B: Store Learnings]
    M --> N[Step 8: Checkpoint]
```

### Step 0A: Read Input from .agent File

Read agent input file created by orchestration:

```typescript
// Example read operation (non-executable):
// const agentFileContent = read_file('.github/agents/pom_generator.agent', 1, 10000)
// const agentInput = JSON.parse(agentFileContent)
// const input = agentInput.input
// const metadata = input.metadata
```

### Step 0B: Query Memory for Code Patterns

Query knowledge base for existing code generation patterns:

```typescript
// Example memory queries (non-executable):
// mcp_memory_search_nodes({ query: "{domain} {feature} code patterns" })
// mcp_memory_search_nodes({ query: "{domain} page object patterns" })
// mcp_memory_search_nodes({ query: "self-healing wrapper patterns" })
```

**Output:** Natural language summary like "Found 2 existing code patterns for demoqa.com showing page object structure and test.each() usage."

### Step 0C: Load Previous Gate Output

Load test cases from GATE 1 and element mappings from GATE 2:

```typescript
// Example loading logic (non-executable):
// let testCases
// if (typeof input.testCases === 'string') {
//   const gate1Content = read_file(input.testCases, 1, 10000)
//   const gate1State = JSON.parse(gate1Content)
//   testCases = gate1State.output.testCases
// } else {
//   testCases = input.testCases
// }
//
// let elementMappings
// if (typeof input.elementMappings === 'string') {
//   const gate2Content = read_file(input.elementMappings, 1, 10000)
//   const gate2State = JSON.parse(gate2Content)
//   elementMappings = gate2State.output.elementMappings
// }
```

### Step 0D: Pre-Flight Validation

Verify prerequisites before execution:

**Validation Checks:**

| Check | Validation | Error Message |
|-------|------------|---------------|
| Metadata fields | `domain`, `feature`, `url` all non-empty | "Missing metadata: {field}" |
| Test cases structure | Array with length > 0, all have `testId`, `testSteps` | "Invalid testCases structure" |
| Element mappings structure | Array with length > 0, all have `logicalName`, `locators.primary` | "Invalid elementMappings structure" |
| Test step coverage | Every test step has corresponding element mapping | "Unmapped test steps detected: {count}" |
| Locator completeness | All element mappings have primary + 1 fallback minimum | "Insufficient fallbacks for element: {name}" |

**On Failure:** Throw error with clear remediation steps. Do NOT proceed to main execution.

### Step 0E: Verify Pipeline State

Check overall pipeline progress:

```typescript
// Example pipeline check (non-executable):
// const todoList = manage_todo_list({ operation: 'read' })
// const gate3Todo = todoList.find(todo => todo.id === <GATE_3_ID>)
//
// if (gate3Todo.status !== 'in-progress') {
//   throw new Error("Cannot execute GATE 3: Not in progress")
// }
//
// const previousGates = todoList.filter(todo => todo.id < <GATE_3_ID>)
// const anyFailed = previousGates.some(todo => todo.status === 'failed')
//
// if (anyFailed) {
//   throw new Error("Cannot execute GATE 3: Previous gate failed")
// }
```

### Step 1: Sequential Thinking (MANDATORY)

**When:** ALWAYS for POM generation (5 thoughts minimum)

**Purpose:** Plan code generation strategy, template selection, self-healing integration

**Thought Pattern:**

1. **Thought 1: Analyze test pattern**
   - "I will analyze test structure: {count} test cases with {pattern} data strategy. Test steps include {types}."
   
2. **Thought 2: Select code templates**
   - "Based on {totalCases} test cases, I will use {pattern} test pattern. Page object requires methods: {methods}."
   
3. **Thought 3: Plan self-healing logic**
   - "Element mappings show {confidence}% average confidence. I will generate fallback chains: primary → fallback1 → fallback2 with error enrichment."
   
4. **Thought 4: Identify special components and reusable code**
   - "Detected special components: {types}. Will use interaction patterns: {patterns}. Checking for reusable components: {componentNames}."
   
5. **Thought 5: Validate completeness**
   - "All test steps mapped. Will generate {count} files: page object, test spec, fixture update. Reusing {count} existing components. Compilation validation required."

**Invocation:**

```typescript
// Example sequential thinking (non-executable):
// mcp_sequential-th_sequentialthinking({
//   thought: "Analyzing test structure: 5 test cases with data-driven strategy. Test steps include fill (3 fields), click (1 button), verify (1 assertion). Average confidence: 87%.",
//   thoughtNumber: 1,
//   totalThoughts: 5,
//   nextThoughtNeeded: true
// })
```

**Critical Thinking Checkpoint 1 (Thought 5):**

❓ **Challenge:** Why could all test steps be mapped but code generation still fail?
→ **Analysis:** Element mappings may reference invalid locators (typos, wrong syntax), special components may need custom interaction logic not in standard templates
→ **Mitigation:** Validate locator syntax before code generation, detect special components and apply correct interaction patterns

### Step 2: Component Reuse Detection (MANDATORY)

**Purpose:** Detect and import existing component classes instead of regenerating them. This reduces code duplication, maintains consistency, and leverages already-tested components.

**Existing Components Location:** `tests/test-objects/gui/pageObjects/components/`

**Available Components:**

| Component | Purpose | Key Methods |
|-----------|---------|-------------|
| `appHeaders.ts` | Application header interactions | `validatePageTitle()`, `selectAppSubscriptionFromHeader()` |
| `appNavigation.ts` | Side navigation menu | `accessMenuOnNavBar(menuItem)` with `NavMenuItem` enum |
| `dialogPrivacySettings.ts` | Privacy dialog handling | `acceptAllPrivacySetting()` |

**Detection Strategy:**

```typescript
// Example component detection logic (non-executable):
// detectReusableComponents(elementMappings, testSteps) {
//   const reusableComponents = []
//   
//   // Pattern 1: Header elements
//   const hasHeaderElements = elementMappings.some(em => 
//     /header|title|user menu|subscription/i.test(em.logicalName)
//   )
//   if (hasHeaderElements) {
//     reusableComponents.push({
//       name: 'AppHeaders',
//       path: 'tests/test-objects/gui/pageObjects/components/appHeaders',
//       usage: 'Header validation and subscription selection'
//     })
//   }
//   
//   // Pattern 2: Navigation elements
//   const hasNavElements = elementMappings.some(em => 
//     /nav|sidebar|menu|navigation/i.test(em.logicalName) ||
//     testSteps.some(step => /navigate to|access menu|click menu/i.test(step.action))
//   )
//   if (hasNavElements) {
//     reusableComponents.push({
//       name: 'AppNavigationBar',
//       path: 'tests/test-objects/gui/pageObjects/components/appNavigation',
//       usage: 'Side navigation menu interactions'
//     })
//   }
//   
//   // Pattern 3: Privacy dialog
//   const hasPrivacyDialog = elementMappings.some(em => 
//     /privacy|cookie|consent|accept all/i.test(em.logicalName)
//   )
//   if (hasPrivacyDialog) {
//     reusableComponents.push({
//       name: 'PrivacySettingsDialog',
//       path: 'tests/test-objects/gui/pageObjects/components/dialogPrivacySettings',
//       usage: 'Privacy consent dialog handling'
//     })
//   }
//   
//   return reusableComponents
// }
```

**Component Integration Patterns:**

**Pattern 1: Composition (Recommended)**
```typescript
// Example component composition in page object (non-executable):
// import { Page } from '@playwright/test'
// import { pageActions } from '@utilities/ui/page-actions'
// import { logger } from '@utilities/reporter/custom-logger'
// import AppHeaders from 'tests/test-objects/gui/pageObjects/components/appHeaders'
// import AppNavigationBar from 'tests/test-objects/gui/pageObjects/components/appNavigation'
//
// export default class DocumentSearchPage {
//   private page: Page
//   private header: AppHeaders
//   private navigation: AppNavigationBar
//   
//   constructor(page: Page) {
//     this.page = page
//     this.header = new AppHeaders()
//     this.navigation = new AppNavigationBar()
//   }
//   
//   // Delegate to component methods
//   async validatePageTitle(title: string) {
//     await this.header.validatePageTitle(title)
//   }
//   
//   async navigateToDocumentUpload() {
//     await this.navigation.accessMenuOnNavBar(NavMenuItem.DocumentUpload)
//   }
//   
//   // Page-specific methods
//   async searchDocument(query: string) {
//     await pageActions.fill(this.page, this.locators.searchInput.primary, query)
//   }
// }
```

**Pattern 2: Direct Method Calls**
```typescript
// Example direct component usage in test (non-executable):
// import { test } from 'tests/test-objects/gui/pageObjects/pageFixture'
// import { expect } from '@utilities/reporter/custom-expect'
// import AppNavigationBar, { NavMenuItem } from 'tests/test-objects/gui/pageObjects/components/appNavigation'
//
// test('User can navigate to document search', async ({ page }) => {
//   const navigation = new AppNavigationBar()
//   
//   await test.step('Navigate to document search', async () => {
//     await navigation.accessMenuOnNavBar(NavMenuItem.DocumentSearch)
//   })
//   
//   await test.step('Verify page loaded', async () => {
//     await expect(page).toHaveURL(/document-search/)
//   })
// })
```

**Decision Logic: When to Use Components**

```typescript
// Example decision logic (non-executable):
// shouldUseComponent(componentName, testSteps) {
//   const componentUsageCriteria = {
//     AppHeaders: {
//       keywords: ['header', 'title', 'subscription', 'user menu'],
//       minMatchingSteps: 1
//     },
//     AppNavigationBar: {
//       keywords: ['navigate', 'menu', 'navigation', 'sidebar'],
//       minMatchingSteps: 1
//     },
//     PrivacySettingsDialog: {
//       keywords: ['privacy', 'cookie', 'consent', 'accept all'],
//       minMatchingSteps: 1
//     }
//   }
//   
//   const criteria = componentUsageCriteria[componentName]
//   const matchingSteps = testSteps.filter(step => 
//     criteria.keywords.some(keyword => 
//       step.action.toLowerCase().includes(keyword) ||
//       step.target.toLowerCase().includes(keyword)
//     )
//   )
//   
//   return matchingSteps.length >= criteria.minMatchingSteps
// }
```

**Code Generation Integration:**

1. **Detect:** Run detection logic during Step 2
2. **Import:** Add import statements at top of generated page object
3. **Initialize:** Create component instances in constructor
4. **Delegate:** Generate methods that delegate to component methods
5. **Document:** Add comments explaining component purpose

**Output to State File:**

```typescript
// Example state file with component reuse (non-executable):
// {
//   "reusableComponents": [
//     {
//       "name": "AppHeaders",
//       "path": "tests/test-objects/gui/pageObjects/components/appHeaders",
//       "methods": ["validatePageTitle", "selectAppSubscriptionFromHeader"],
//       "usage": "Header validation and subscription selection"
//     },
//     {
//       "name": "AppNavigationBar",
//       "path": "tests/test-objects/gui/pageObjects/components/appNavigation",
//       "methods": ["accessMenuOnNavBar"],
//       "usage": "Side navigation menu interactions"
//     }
//   ]
// }
```

**Critical Thinking Checkpoint 2:**

❓ **Challenge:** Why use component composition instead of duplicating component logic in each page object?

→ **Analysis:**
1. **Duplication:** Copying header logic to every page object creates 10+ copies of same code
2. **Maintenance:** Changing header structure requires updating all copies (error-prone)
3. **Testing:** Component tested once, reused everywhere (higher quality)
4. **Consistency:** Same header behavior across all pages

❓ **Challenge:** What if component doesn't exist but test steps match pattern?

→ **Analysis:** Detection logic may produce false positives (e.g., "title" in form label, not page title)

→ **Mitigation:**
- Require strong keyword matches (multiple criteria)
- Log component detection decisions for transparency
- Provide fallback: generate inline if component not suitable
- Document when NOT to use component (single-use elements)

❓ **Challenge:** How to handle component API changes (method renamed, signature changed)?

→ **Analysis:** Generated code may break if component evolves

→ **Mitigation:**
- Store component version metadata in memory (reference latest working state)
- Run compilation check after generation (catches API mismatches)
- Include component usage examples in documentation
- Update component detection patterns when components change

### Step 3: Select Test Pattern

**Decision Matrix:**

| Total Cases | Pattern | Rationale |
|-------------|---------|-----------|
| 1-3 | `single` | Individual test() functions (readable, simple) |
| 4-10 | `forEach` | Loop with testData.forEach() (balanced) |
| 10+ | `test.each` | Playwright native parallel execution (scalable) |

**Pattern Selection Logic:**

```typescript
// Example pattern selection (non-executable):
// selectTestPattern(dataStrategy) {
//   if (dataStrategy?.type === 'single') return 'single'
//   
//   const totalCases = dataStrategy?.totalCases || 1
//   
//   if (totalCases <= 3) return 'single'
//   if (totalCases <= 10) return 'forEach'
//   return 'test.each'
// }
```

### Step 3: Generate Page Object Classes

**Template Structure:**

```typescript
// Example page object template (non-executable):
// import { Page } from '@playwright/test'
// import { pageActions } from '@utilities/ui/page-actions'
// import { logger } from '@utilities/reporter/custom-logger'
//
// export default class {PageName}Page {
//   private page: Page
//   
//   constructor(page: Page) {
//     this.page = page
//   }
//   
//   // Locator strings (NOT Playwright Locator objects)
//   private locators = {
//     {elementName}: {
//       primary: '{primaryLocator}',      // e.g., '#firstName'
//       fallback1: '{fallback1Locator}',  // e.g., '[placeholder="First Name"]'
//       fallback2: '{fallback2Locator}'   // e.g., 'input[name="firstName"]'
//     }
//   }
//   
//   // Public methods for test actions
//   async goto() {
//     await pageActions.gotoURL(this.page, '{url}')
//   }
//   
//   async fill{ElementName}(value: string) {
//     await this.fillWithFallback(
//       this.locators.{elementName}, 
//       value, 
//       '{elementName}'
//     )
//   }
//   
//   async click{ElementName}() {
//     await this.clickWithFallback(
//       this.locators.{elementName}, 
//       '{elementName}'
//     )
//   }
//   
//   async get{ElementName}Text(): Promise<string> {
//     return await this.getTextWithFallback(
//       this.locators.{elementName}, 
//       '{elementName}'
//     )
//   }
//   
//   // Self-healing wrapper methods using pageActions
//   private async fillWithFallback(
//     locatorSet: { primary: string; fallback1: string; fallback2: string },
//     value: string,
//     fieldName: string
//   ): Promise<void> {
//     const attemptedLocators: string[] = []
//     
//     try {
//       await pageActions.fill(this.page, locatorSet.primary, value)
//       return
//     } catch (primaryError) {
//       attemptedLocators.push(`primary (${locatorSet.primary}): ${primaryError.message}`)
//       logger.warn(`Fallback attempt 1 for ${fieldName}: primary locator failed`)
//       
//       try {
//         await pageActions.fill(this.page, locatorSet.fallback1, value)
//         logger.info(`Fallback1 succeeded for ${fieldName}`)
//         return
//       } catch (fallback1Error) {
//         attemptedLocators.push(`fallback1 (${locatorSet.fallback1}): ${fallback1Error.message}`)
//         logger.warn(`Fallback attempt 2 for ${fieldName}: fallback1 locator failed`)
//         
//         try {
//           await pageActions.fill(this.page, locatorSet.fallback2, value)
//           logger.info(`Fallback2 succeeded for ${fieldName}`)
//           return
//         } catch (fallback2Error) {
//           attemptedLocators.push(`fallback2 (${locatorSet.fallback2}): ${fallback2Error.message}`)
//           const errorMessage = `All locators failed for ${fieldName}. Attempted:\n${attemptedLocators.join('\n')}`
//           logger.error(errorMessage)
//           throw new Error(errorMessage)
//         }
//       }
//     }
//   }
//   
//   private async clickWithFallback(
//     locatorSet: { primary: string; fallback1: string; fallback2: string },
//     elementName: string
//   ): Promise<void> {
//     const attemptedLocators: string[] = []
//     
//     try {
//       await pageActions.click(this.page, locatorSet.primary)
//       return
//     } catch (primaryError) {
//       attemptedLocators.push(`primary (${locatorSet.primary}): ${primaryError.message}`)
//       logger.warn(`Fallback attempt 1 for ${elementName}: primary locator failed`)
//       
//       try {
//         await pageActions.click(this.page, locatorSet.fallback1)
//         logger.info(`Fallback1 succeeded for ${elementName}`)
//         return
//       } catch (fallback1Error) {
//         attemptedLocators.push(`fallback1 (${locatorSet.fallback1}): ${fallback1Error.message}`)
//         logger.warn(`Fallback attempt 2 for ${elementName}: fallback1 locator failed`)
//         
//         try {
//           await pageActions.click(this.page, locatorSet.fallback2)
//           logger.info(`Fallback2 succeeded for ${elementName}`)
//           return
//         } catch (fallback2Error) {
//           attemptedLocators.push(`fallback2 (${locatorSet.fallback2}): ${fallback2Error.message}`)
//           const errorMessage = `All locators failed for ${elementName}. Attempted:\n${attemptedLocators.join('\n')}`
//           logger.error(errorMessage)
//           throw new Error(errorMessage)
//         }
//       }
//     }
//   }
//   
//   private async getTextWithFallback(
//     locatorSet: { primary: string; fallback1: string; fallback2: string },
//     elementName: string
//   ): Promise<string> {
//     const attemptedLocators: string[] = []
//     
//     try {
//       return await pageActions.getText(this.page, locatorSet.primary)
//     } catch (primaryError) {
//       attemptedLocators.push(`primary (${locatorSet.primary}): ${primaryError.message}`)
//       
//       try {
//         return await pageActions.getText(this.page, locatorSet.fallback1)
//       } catch (fallback1Error) {
//         attemptedLocators.push(`fallback1 (${locatorSet.fallback1}): ${fallback1Error.message}`)
//         
//         try {
//           return await pageActions.getText(this.page, locatorSet.fallback2)
//         } catch (fallback2Error) {
//           attemptedLocators.push(`fallback2 (${locatorSet.fallback2}): ${fallback2Error.message}`)
//           const errorMessage = `All locators failed for ${elementName}. Attempted:\n${attemptedLocators.join('\n')}`
//           logger.error(errorMessage)
//           throw new Error(errorMessage)
//         }
//       }
//     }
//   }
// }
```

**Critical Thinking Checkpoint 3A:**

❓ **Challenge:** Why use pageActions wrapper instead of direct Playwright API?
→ **Analysis:** 
  - **Consistency:** All page objects use same action patterns across the codebase
  - **Error handling:** Centralized error enrichment via ErrorHandler in utilities layer
  - **Timeout management:** Consistent timeout handling via timeout constants
  - **Logging:** Automatic action logging via custom logger for better debugging
  - **Maintenance:** Changes to action logic automatically update all page objects
→ **Mitigation:** Always use pageActions wrapper for standard interactions (fill, click, select, getText, etc.). Only use direct Playwright API for special cases not covered by pageActions (e.g., keyboard.press for specific key combinations, advanced mouse operations, or iframe handling).

**Special Component Handling:**

| Component Type | Interaction Pattern | pageActions Method |
|----------------|---------------------|-------------------|
| `react-select` | Click container → type value → press Enter | `pageActions.click()` + `pageActions.fill()` + `keyboard.press('Enter')` |
| `datepicker` | Use fill() with date string | `pageActions.fill()` |
| `file-upload` | Use setInputFiles() with file path | `pageActions.uploadFile()` |
| `checkbox` | Use check()/uncheck() | `pageActions.check()` / `pageActions.uncheck()` |
| `radio` | Use check() | `pageActions.check()` |
| `hover-menu` | Use hover() then click() | `pageActions.hover()` + `pageActions.click()` |

**Critical Thinking Checkpoint 2:**

❓ **Challenge:** Why could self-healing fallback chain fail even with 3 locators?
→ **Analysis:** All locators reference attributes that changed (redesign), element moved to iframe/shadow DOM, element dynamically loaded after page load
→ **Mitigation:** Throw enriched error with diagnostic info (all attempted locators, recommendations like "check iframe/shadow DOM"), log detailed trace

### Step 4: Register Page Object in Fixture

**Fixture Update Pattern:**

```typescript
// Example fixture registration (non-executable):
// import { {PageName}Page } from './pages/{pageName}.page'
//
// type CustomFixtures = {
//   // ... existing pages ...
//   {pageName}Page: {PageName}Page
// }
//
// export const test = base.extend<CustomFixtures>({
//   // ... existing registrations ...
//   {pageName}Page: async ({ page }, use) => {
//     const {pageName}Page = new {PageName}Page(page)
//     await use({pageName}Page)
//   }
// })
```

**Update Strategy:**
1. Read existing `pageFixture.ts` content
2. Add import statement at top
3. Add type definition to `CustomFixtures` interface
4. Add fixture registration to `test.extend()` object
5. Preserve existing registrations and formatting

### Step 5: Generate Test Specs

**Pattern A: Single Test (1-3 cases)**

```typescript
// Example single test pattern (non-executable):
// import { test } from 'tests/test-objects/gui/pageObjects/pageFixture'
// import { expect } from '@utilities/reporter/custom-expect'
//
// test.describe('{Feature} functionality', () => {
//   
//   test('TC_001: {Description}', async ({ {pageName}Page }) => {
//     
//     await test.step('Navigate to page', async () => {
//       await {pageName}Page.goto()
//     })
//     
//     await test.step('Fill form fields', async () => {
//       await {pageName}Page.fillFirstName('{value}')
//       await {pageName}Page.fillLastName('{value}')
//     })
//     
//     await test.step('Submit and verify', async () => {
//       await {pageName}Page.clickSubmit()
//       await expect({pageName}Page.getSuccessMessage()).toBeVisible()
//     })
//   })
// })
```

**Pattern B: forEach (4-10 cases)**

```typescript
// Example forEach pattern (non-executable):
// import testData from 'tests/test-data/{domain}-{feature}-data.json'
//
// test.describe('{Feature} - Data-Driven', () => {
//   
//   testData.testCases.forEach((testCase) => {
//     test(`${testCase.testId}: ${testCase.description}`, async ({ {pageName}Page }) => {
//       
//       await test.step('Navigate', async () => {
//         await {pageName}Page.goto()
//       })
//       
//       await test.step('Fill form', async () => {
//         await {pageName}Page.fillFirstName(testCase.data.firstName)
//         await {pageName}Page.fillLastName(testCase.data.lastName)
//       })
//       
//       await test.step('Verify result', async () => {
//         if (testCase.expected === 'success') {
//           await expect({pageName}Page.page).toHaveURL(/success/)
//         } else {
//           await expect({pageName}Page.getErrorMessage()).toBeVisible()
//         }
//       })
//     })
//   })
// })
```

**Pattern C: test.each (10+ cases)**

```typescript
// Example test.each pattern (non-executable):
// import testData from 'tests/test-data/{domain}-{feature}-data.json'
//
// test.describe.parallel('{Feature} - Parallel Execution', () => {
//   
//   testData.testCases.forEach((testCase) => {
//     test(`${testCase.testId}`, async ({ {pageName}Page }) => {
//       // Test implementation (runs in parallel workers)
//     })
//   })
// })
```

**Critical Thinking Checkpoint 3:**

❓ **Challenge:** Why could generated test spec compile successfully but fail at runtime?
→ **Analysis:** Page object methods may not exist (typo in method name), data file path wrong (relative vs absolute), fixture not registered correctly
→ **Mitigation:** Validate method names against generated page object, use absolute imports for data files, verify fixture registration syntax

### Step 6: Validate Compilation

**Validation Process:**

```typescript
// Example compilation check (non-executable):
// const errors = get_errors([
//   'tests/test-objects/gui/pageObjects/pages/{pageName}.page.ts',
//   'tests/test-objects/gui/pageObjects/pageFixture.ts',
//   'tests/tests-management/gui/{feature}/{testName}.spec.ts'
// ])
//
// if (errors.length > 0) {
//   errors.forEach(error => {
//     logger.error(`Compilation error in ${error.file} line ${error.line}: ${error.message}`)
//   })
//   throw new Error(`Compilation failed with ${errors.length} errors`)
// }
```

**Common Error Types:**

| Error | Cause | Fix |
|-------|-------|-----|
| "Cannot find module" | Import path wrong | Use absolute imports with `tests/` prefix |
| "Type 'X' is not assignable to 'Y'" | Fixture type mismatch | Update `CustomFixtures` interface |
| "Property 'X' does not exist" | Method name typo | Verify method names match page object |
| "Duplicate identifier" | Fixture already registered | Check existing registrations before adding |

### Step 7A: Write State File

Write structured output to `.state/{domain}-{feature}-gate3-output.json`:

```typescript
// Example state file creation (non-executable):
// const gateState = {
//   gate: 3,
//   agent: "POMGenerator",
//   status: compilationErrors === 0 ? "SUCCESS" : "PARTIAL",
//   metadata: {
//     domain: metadata.domain,
//     feature: metadata.feature,
//     url: input.url
//   },
//   output: {
//     generatedFiles: [
//       {
//         filePath: "tests/test-objects/gui/pageObjects/pages/{feature}.page.ts",
//         fileType: "page-object",
//         linesOfCode: <COUNT>,
//         methods: [<METHOD_NAMES>]
//       },
//       {
//         filePath: "tests/tests-management/gui/{feature}/{testName}.spec.ts",
//         fileType: "test-spec",
//         linesOfCode: <COUNT>,
//         pattern: <PATTERN>
//       },
//       {
//         filePath: "tests/test-objects/gui/pageObjects/pageFixture.ts",
//         fileType: "fixture",
//         linesOfCode: <COUNT>,
//         updates: ["Added {PageName}Page registration"]
//       }
//     ],
//     compilationErrors: <COUNT>,
//     selfHealingEnabled: true,
//     componentReuse: <COUNT>
//   },
//   validation: {
//     score: compilationErrors === 0 ? 100 : 50,
//     issues: compilationErrors === 0 ? [] : ["{count} compilation errors"],
//     passed: compilationErrors === 0
//   },
//   executionTrace: {
//     startTime: "<START_TIME_ISO8601>",
//     endTime: "<END_TIME_ISO8601>",
//     executedSteps: ["Step0A", "Step0B", "Step1", "Step2", "Step3", "Step4", "Step5", "Step6", "Step7A"],
//     skippedSteps: [],
//     failedSteps: [],
//     checkpointCompleted: false  // Will be true after Step 8
//   }
// }
//
// create_file(
//   `.state/${metadata.domain}-${metadata.feature}-gate3-output.json`,
//   safeStringify(gateState)
// )
```

**Important:** Use `safeStringify` from `src/utilities/common/json-utils.ts` (NOT `JSON.stringify`).

### Step 7B: Store Learnings in Memory

Store code generation patterns for future runs:

```typescript
// Example memory storage (non-executable):
// mcp_memory_create_entities({
//   entities: [
//     {
//       name: "{domain}-{feature}-CodePattern",
//       entityType: "CodePattern",
//       observations: [
//         "Files generated: {count}",
//         "Page objects: {count}",
//         "Test specs: {count}",
//         "Test pattern: {pattern}",
//         "Framework: playwright",
//         "Language: typescript",
//         "Self-healing enabled: true",
//         "Component reuse: {count}",
//         "Compilation errors: 0",
//         "Methods: {methodList}",
//         "Special components: {componentTypes}",
//         "Captured at: Step 7B completion",
//         "Timestamp: <TIMESTAMP_ISO8601>"
//       ]
//     }
//   ]
// })
//
// // Verification
// const verification = mcp_memory_open_nodes({
//   names: ["{domain}-{feature}-CodePattern"]
// })
//
// if (verification.entities.length === 0) {
//   logger.warn("Memory storage verification failed - retrying once")
//   // Retry storage logic
// }
```

### Step 8: Output Checkpoint

Generate comprehensive self-audit:

**Checkpoint Template:**

```markdown
**CHECKPOINT: POM Generator Agent - GATE 3 Complete**

Required MCPs:
✅ mcp_memory_search_nodes - Queried code patterns for {domain}
✅ mcp_sequential-th_sequentialthinking - Planned code generation (5 thoughts)
✅ mcp_memory_create_entities - Stored CodePattern entity
✅ mcp_memory_open_nodes - Verified storage succeeded

Generated Files:
✅ Page Object: tests/test-objects/gui/pageObjects/pages/{feature}.page.ts ({linesOfCode} lines)
✅ Test Spec: tests/tests-management/gui/{feature}/{testName}.spec.ts ({linesOfCode} lines, {pattern} pattern)
✅ Fixture Update: tests/test-objects/gui/pageObjects/pageFixture.ts (added {PageName}Page registration)

Code Quality:
✅ Compilation: {compilationErrors} errors (target: 0)
✅ Self-Healing: {selfHealingEnabled} (fallback chains: {count})
✅ Test Pattern: {pattern} (appropriate for {totalCases} cases)
✅ Component Reuse: {componentReuse} components

Validation Score: {score}/100
Issues: {issuesList OR "NONE"}

MISSING STEPS: NONE

ACTION: PROCEEDING TO GATE 4 (Test Execution)
```

**Generated Page Object Example (login.page.ts):**

```typescript
// Example generated page object (non-executable):
// import { Page } from '@playwright/test'
// import { pageActions } from '@utilities/ui/page-actions'
// import { logger } from '@utilities/reporter/custom-logger'
//
// export default class LoginPage {
//   private page: Page
//   
//   constructor(page: Page) {
//     this.page = page
//   }
//   
//   // Locators stored as plain strings
//   private locators = {
//     usernameInput: {
//       primary: '#username',
//       fallback1: '[placeholder="Username"]',
//       fallback2: 'input[name="username"]'
//     },
//     passwordInput: {
//       primary: '#password',
//       fallback1: '[placeholder="Password"]',
//       fallback2: 'input[type="password"]'
//     },
//     loginButton: {
//       primary: '#login',
//       fallback1: 'button[name="Login"]',
//       fallback2: 'text=Login'
//     }
//   }
//   
//   async goto() {
//     await pageActions.gotoURL(this.page, 'https://example.com/login')
//   }
//   
//   async fillUsername(value: string) {
//     await this.fillWithFallback(this.locators.usernameInput, value, 'username')
//   }
//   
//   async fillPassword(value: string) {
//     await this.fillWithFallback(this.locators.passwordInput, value, 'password')
//   }
//   
//   async clickLoginButton() {
//     await this.clickWithFallback(this.locators.loginButton, 'loginButton')
//   }
//   
//   async getDashboardUrl(): Promise<string> {
//     return this.page.url()
//   }
//   
//   // Self-healing wrapper using pageActions
//   private async fillWithFallback(
//     locatorSet: { primary: string; fallback1: string; fallback2: string },
//     value: string,
//     fieldName: string
//   ): Promise<void> {
//     const attemptedLocators: string[] = []
//     
//     try {
//       await pageActions.fill(this.page, locatorSet.primary, value)
//       return
//     } catch (primaryError) {
//       attemptedLocators.push(`primary (${locatorSet.primary}): ${primaryError.message}`)
//       logger.warn(`Fallback attempt 1 for ${fieldName}: primary locator failed`)
//       
//       try {
//         await pageActions.fill(this.page, locatorSet.fallback1, value)
//         logger.info(`Fallback1 succeeded for ${fieldName}`)
//         return
//       } catch (fallback1Error) {
//         attemptedLocators.push(`fallback1 (${locatorSet.fallback1}): ${fallback1Error.message}`)
//         logger.warn(`Fallback attempt 2 for ${fieldName}: fallback1 locator failed`)
//         
//         try {
//           await pageActions.fill(this.page, locatorSet.fallback2, value)
//           logger.info(`Fallback2 succeeded for ${fieldName}`)
//           return
//         } catch (fallback2Error) {
//           attemptedLocators.push(`fallback2 (${locatorSet.fallback2}): ${fallback2Error.message}`)
//           const errorMessage = `All locators failed for ${fieldName}. Attempted:\n${attemptedLocators.join('\n')}`
//           logger.error(errorMessage)
//           throw new Error(errorMessage)
//         }
//       }
//     }
//   }
//   
//   private async clickWithFallback(
//     locatorSet: { primary: string; fallback1: string; fallback2: string },
//     elementName: string
//   ): Promise<void> {
//     const attemptedLocators: string[] = []
//     
//     try {
//       await pageActions.click(this.page, locatorSet.primary)
//       return
//     } catch (primaryError) {
//       attemptedLocators.push(`primary (${locatorSet.primary}): ${primaryError.message}`)
//       logger.warn(`Fallback attempt 1 for ${elementName}: primary locator failed`)
//       
//       try {
//         await pageActions.click(this.page, locatorSet.fallback1)
//         logger.info(`Fallback1 succeeded for ${elementName}`)
//         return
//       } catch (fallback1Error) {
//         attemptedLocators.push(`fallback1 (${locatorSet.fallback1}): ${fallback1Error.message}`)
//         logger.warn(`Fallback attempt 2 for ${elementName}: fallback1 locator failed`)
//         
//         try {
//           await pageActions.click(this.page, locatorSet.fallback2)
//           logger.info(`Fallback2 succeeded for ${elementName}`)
//           return
//         } catch (fallback2Error) {
//           attemptedLocators.push(`fallback2 (${locatorSet.fallback2}): ${fallback2Error.message}`)
//           const errorMessage = `All locators failed for ${elementName}. Attempted:\n${attemptedLocators.join('\n')}`
//           logger.error(errorMessage)
//           throw new Error(errorMessage)
//         }
//       }
//     }
//   }
// }
```

---

## Environment Configuration

### Purpose

Support multi-environment testing by using environment-specific configuration from `environments/` directory.

📖 **Reference:** See `playwright.config.ts` for environment loading logic.

### Environment Files Structure

```
environments/
├── dev.env       (Development - default)
├── staging.env   (Staging)
├── sit.env       (System Integration Test)
├── prod.env      (Production)
```

### Environment Variables

```typescript
// Example environment variables (non-executable):
// PROJECT_NAME = "QA Automation Suite"
// BASE_URL = "https://dev.example.com"
// API_BASE_URL = "https://api-dev.example.com"
// API_AUTH_TOKEN = "<TOKEN>"
```

### Usage in Generated Page Objects

**Pattern 1: Environment-Aware Navigation**

```typescript
// Example page object with environment-aware URL (non-executable):
// import { Page } from '@playwright/test'
// import { pageActions } from '@utilities/ui/page-actions'
// import { logger } from '@utilities/reporter/custom-logger'
//
// export default class LoginPage {
//   private page: Page
//   private baseURL: string
//   
//   constructor(page: Page) {
//     this.page = page
//     this.baseURL = process.env.BASE_URL || 'http://localhost:3000'
//   }
//   
//   async goto() {
//     const loginUrl = `${this.baseURL}/login`
//     logger.info(`Navigating to login page: ${loginUrl}`)
//     await pageActions.gotoURL(this.page, loginUrl)
//   }
//   
//   async gotoDashboard() {
//     await pageActions.gotoURL(this.page, `${this.baseURL}/dashboard`)
//   }
// }
```

**Pattern 2: Environment-Specific Test Data**

```typescript
// Example test spec with environment-specific data (non-executable):
// import { test } from 'tests/test-objects/gui/pageObjects/pageFixture'
// import { expect } from '@utilities/reporter/custom-expect'
//
// const environment = process.env.NODE_ENV || 'dev'
// const baseURL = process.env.BASE_URL
//
// test.describe(`Login functionality - ${environment}`, () => {
//   
//   test.beforeEach(async ({ loginPage }) => {
//     logger.info(`Running on environment: ${environment}`)
//     logger.info(`Base URL: ${baseURL}`)
//     await loginPage.goto()
//   })
//   
//   test('Valid login redirects to dashboard', async ({ loginPage }) => {
//     // Test implementation
//     await expect(loginPage.page).toHaveURL(`${baseURL}/dashboard`)
//   })
// })
```

**Pattern 3: Environment-Specific Credentials**

```typescript
// Example credentials loading from environment (non-executable):
// import credentials from 'tests/test-data/user-data/credentials.json'
//
// test('Admin login', async ({ loginPage }) => {
//   const env = process.env.NODE_ENV || 'dev'
//   const adminCreds = credentials[env].admin
//   
//   await loginPage.fillUsername(adminCreds.username)
//   await loginPage.fillPassword(adminCreds.password)
//   await loginPage.clickLoginButton()
//   
//   // Verify environment-specific success page
//   await expect(loginPage.page).toHaveURL(`${process.env.BASE_URL}/dashboard`)
// })
```

### Running Tests with Specific Environment

**Command Line:**
```bash
# Run with dev environment (default)
npx playwright test

# Run with staging environment
NODE_ENV=staging npx playwright test

# Run with production environment
NODE_ENV=prod npx playwright test
```

### Code Generation Considerations

**When to Add Environment Configuration:**

1. **URL Construction:** Always use `process.env.BASE_URL` for dynamic URLs
2. **API Integration:** Use `process.env.API_BASE_URL` for API endpoint tests
3. **Multi-Env Tests:** Add environment checks in test specs
4. **Credentials:** Reference environment-specific credentials from JSON

**Code Generation Pattern:**

```typescript
// Example decision logic (non-executable):
// shouldAddEnvironmentConfig(testCases, url) {
//   // Always add if URL is dynamic or multi-environment
//   const isDynamicUrl = url.includes('dev') || url.includes('staging') || url.includes('prod')
//   
//   // Add if test requires environment-specific behavior
//   const hasEnvDependency = testCases.some(tc => 
//     tc.description.includes('environment') || 
//     tc.description.includes('staging') ||
//     tc.description.includes('production')
//   )
//   
//   return isDynamicUrl || hasEnvDependency
// }
//
// generatePageObjectWithEnv(className, url) {
//   const template = `
// export default class ${className} {
//   private page: Page
//   private baseURL: string
//   
//   constructor(page: Page) {
//     this.page = page
//     this.baseURL = process.env.BASE_URL || '${extractBaseUrl(url)}'
//   }
//   
//   async goto() {
//     await pageActions.gotoURL(this.page, \`\${this.baseURL}${extractPath(url)}\`)
//   }
// }
//   `
//   return template
// }
```

### Critical Thinking Checkpoint

**❓ Challenge:** Why use environment variables instead of hardcoded URLs?
- → **Analysis:** Tests must run across dev/staging/prod without code changes, credentials differ per environment, URLs change during deployment
- → **Mitigation:** Always use `process.env.BASE_URL`, load credentials from environment-specific JSON, log current environment in test output

**❓ Challenge:** What if environment variable is missing?
- → **Analysis:** Tests fail with unclear errors, page objects break during navigation
- → **Mitigation:** Provide fallback values (`process.env.BASE_URL || 'http://localhost:3000'`), log environment configuration at test start, validate required variables in beforeAll hook

---

## Validation Rules

| Rule | Criteria | Threshold |
|------|----------|-----------|
| Schema Validation | Output matches POMGeneratorOutput contract | 100% |
| File Generation | All 3 files created (page object, test spec, fixture update) | 100% |
| Compilation Success | TypeScript compilation errors | 0 |
| Self-Healing Coverage | All elements have fallback chains (primary + 1 minimum) | 100% |
| Test Pattern Appropriateness | Pattern matches data strategy (single/forEach/test.each) | 100% |
| Method Coverage | All test steps have corresponding page object methods | 100% |
| Utilities Usage | Generated page objects import and use pageActions | 100% |
| Semantic Validation | Generated code matches test logic and element mappings | Level 3+ |

---

## Constraints

**NEVER:**
- Generate executable TypeScript in agent responses (only in created files)
- Use direct Playwright API in page objects (use pageActions wrapper instead)
- Skip compilation validation (must run `get_errors`)
- Use hardcoded values in page objects (all data should come from test parameters)
- Forget fallback chains (every element needs primary + 2 fallbacks)
- Mix test patterns (single test file should use ONE pattern)
- Use relative imports (always use absolute: `tests/...`)
- Skip fixture registration (page objects won't be accessible in tests)
- Overwrite existing fixture registrations (append only)
- Store Playwright Locator objects (use plain strings)
- Generate page objects without self-healing wrappers
- Skip memory storage verification
- Hardcode URLs in page objects (use process.env.BASE_URL)
- Skip environment variable fallbacks (always provide defaults)
- Duplicate component logic (check for reusable components first)
- Regenerate existing components (import and compose instead)

**ALWAYS:**
- Import and use pageActions from '@utilities/ui/page-actions'
- Import logger from '@utilities/reporter/custom-logger'
- Store locators as plain strings, not Playwright Locator objects
- Use pageActions.fill(), pageActions.click(), pageActions.getText(), etc.
- Run sequential thinking (5 thoughts minimum)
- Query memory for existing code patterns (Step 0B)
- Load previous gate outputs (Steps 0C)
- Detect reusable components before code generation (Step 2)
- Import and compose existing components (appHeaders, appNavigation, dialogPrivacySettings)
- Log component detection decisions for transparency
- Validate compilation after file generation (Step 6)
- Use test.step() to break down test actions
- Include error enrichment in fallback chains (log attempted locators)
- Register page object in fixture before generating test spec
- Store CodePattern entity with verification (Step 7B)
- Output comprehensive checkpoint (Step 8)
- Use safeStringify for JSON serialization
- Include descriptive comments in generated code
- Handle special components with correct interaction patterns
- Use environment variables for URLs (process.env.BASE_URL)
- Provide fallback values for environment variables
- Log current environment at test start (process.env.NODE_ENV)

---

## Error Handling

| Error Type | Action | Max Retries | Escalation |
|------------|--------|-------------|------------|
| Invalid input structure | Throw error immediately, list missing fields | 0 | Orchestration |
| State file not found | Throw error with clear path and remediation | 0 | Orchestration |
| Compilation errors | Log all errors, attempt quick fixes (imports, types), re-validate | 1 | Return PARTIAL status if still failing |
| Memory storage failed | Retry once, log warning if retry fails, continue execution | 1 | None (non-critical) |
| File write failed | Retry with exponential backoff | 3 | Throw error if all retries fail |

**Quick Fix Strategies for Compilation Errors:**

| Error Pattern | Quick Fix |
|---------------|-----------|
| "Cannot find module 'X'" | Check import path, convert to absolute import |
| "Type 'X' is not assignable" | Check CustomFixtures interface, verify page object type |
| "Property 'X' does not exist" | Verify method exists in page object, check typos |
| "Duplicate identifier" | Check existing fixture registrations, rename if collision |

---

## Example Exchange

**Input (.agent file):**

```json
{
  "agentName": "POMAgent",
  "timestamp": "2025-01-07T10:30:00Z",
  "input": {
    "metadata": {
      "domain": "example_com",
      "feature": "login",
      "url": "https://example.com/login",
      "framework": "playwright",
      "language": "typescript"
    },
    "testCases": [
      {
        "testId": "TC_001",
        "description": "Valid admin login",
        "testSteps": [
          { "action": "fill", "target": "username", "data": "admin" },
          { "action": "fill", "target": "password", "data": "admin123" },
          { "action": "click", "target": "loginButton" }
        ],
        "expectedResult": {
          "status": "pass",
          "assertions": [{ "type": "url", "value": "/dashboard" }]
        }
      }
    ],
    "elementMappings": [
      {
        "logicalName": "usernameInput",
        "testStep": "fill username",
        "locators": {
          "primary": { "type": "id", "value": "username", "confidenceScore": 0.95 },
          "fallback1": { "type": "placeholder", "value": "Username", "confidenceScore": 0.85 },
          "fallback2": { "type": "css", "value": "input[name='username']", "confidenceScore": 0.70 }
        },
        "componentType": "standard",
        "interactionPattern": "fill"
      },
      {
        "logicalName": "passwordInput",
        "testStep": "fill password",
        "locators": {
          "primary": { "type": "id", "value": "password", "confidenceScore": 0.95 },
          "fallback1": { "type": "placeholder", "value": "Password", "confidenceScore": 0.85 },
          "fallback2": { "type": "css", "value": "input[type='password']", "confidenceScore": 0.80 }
        },
        "componentType": "standard",
        "interactionPattern": "fill"
      },
      {
        "logicalName": "loginButton",
        "testStep": "click login button",
        "locators": {
          "primary": { "type": "id", "value": "login", "confidenceScore": 0.95 },
          "fallback1": { "type": "role", "value": "button[name='Login']", "confidenceScore": 0.90 },
          "fallback2": { "type": "text", "value": "Login", "confidenceScore": 0.75 }
        },
        "componentType": "standard",
        "interactionPattern": "click"
      }
    ],
    "dataStrategy": {
      "type": "single",
      "totalCases": 1
    }
  }
}
```

**Output (state file .state/example_com-login-gate3-output.json):**

```json
{
  "gate": 3,
  "agent": "POMGenerator",
  "status": "SUCCESS",
  "metadata": {
    "domain": "example_com",
    "feature": "login",
    "url": "https://example.com/login"
  },
  "output": {
    "generatedFiles": [
      {
        "filePath": "tests/test-objects/gui/pageObjects/pages/login.page.ts",
        "fileType": "page-object",
        "linesOfCode": 145,
        "methods": ["goto", "fillUsername", "fillPassword", "clickLoginButton", "getDashboardUrl"]
      },
      {
        "filePath": "tests/tests-management/gui/login/validLogin.spec.ts",
        "fileType": "test-spec",
        "linesOfCode": 32,
        "pattern": "single"
      },
      {
        "filePath": "tests/test-objects/gui/pageObjects/pageFixture.ts",
        "fileType": "fixture",
        "linesOfCode": 187,
        "updates": ["Added LoginPage registration"]
      }
    ],
    "compilationErrors": 0,
    "selfHealingEnabled": true,
    "componentReuse": 0
  },
  "validation": {
    "score": 100,
    "issues": [],
    "passed": true
  },
  "executionTrace": {
    "startTime": "2025-01-07T10:30:05Z",
    "endTime": "2025-01-07T10:30:47Z",
    "executedSteps": ["Step0A", "Step0B", "Step0C", "Step0D", "Step0E", "Step1", "Step2", "Step3", "Step4", "Step5", "Step6", "Step7A", "Step7B", "Step8"],
    "skippedSteps": [],
    "failedSteps": [],
    "checkpointCompleted": true
  }
}
```

**Checkpoint Output (console/markdown):**

```markdown
**CHECKPOINT: POM Generator Agent - GATE 3 Complete**

Required MCPs:
✅ mcp_memory_search_nodes - Queried code patterns for example_com
✅ mcp_sequential-th_sequentialthinking - Planned code generation (5 thoughts)
✅ mcp_memory_create_entities - Stored CodePattern entity
✅ mcp_memory_open_nodes - Verified storage succeeded

Generated Files:
✅ Page Object: tests/test-objects/gui/pageObjects/pages/login.page.ts (145 lines)
✅ Test Spec: tests/tests-management/gui/login/validLogin.spec.ts (32 lines, single pattern)
✅ Fixture Update: tests/test-objects/gui/pageObjects/pageFixture.ts (added LoginPage registration)

Code Quality:
✅ Compilation: 0 errors (target: 0)
✅ Self-Healing: true (fallback chains: 3 elements)
✅ Test Pattern: single (appropriate for 1 case)
✅ Component Reuse: 0 components

Validation Score: 100/100
Issues: NONE

MISSING STEPS: NONE

ACTION: PROCEEDING TO GATE 4 (Test Execution)
```
