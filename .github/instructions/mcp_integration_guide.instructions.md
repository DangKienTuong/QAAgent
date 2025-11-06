---
applyTo: '**/*.agent,**'
description: 'MCP Tools Integration Guide - Detailed Parameter Reference - Version 2.0'
---

# MCP Tools Integration Guide - Detailed Parameter Reference

## 🎯 Purpose
This guide provides **exact parameters** and **usage patterns** for integrating MCP tools into agent workflows.

---

## 📚 Available MCP Tools

### 1. Sequential Thinking (`mcp_sequential-th_sequentialthinking`)
### 2. Memory Operations (`mcp_memory_*`)
### 3. Todo Management (`manage_todo_list`)
### 4. Built-in Tools (`fetch_webpage`, `get_errors`, `run_in_terminal`)

---

## 🧠 1. SEQUENTIAL THINKING INTEGRATION

### When to Use
- ✅ Planning multi-step workflows (3+ steps)
- ✅ Analyzing failures or errors
- ✅ Making complex decisions with trade-offs
- ✅ Breaking down ambiguous requirements

### Parameter Details

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `thought` | string | ✅ | Current thinking step (be specific and actionable) |
| `nextThoughtNeeded` | boolean | ✅ | `true` if more analysis needed, `false` if done |
| `thoughtNumber` | integer | ✅ | Current step number (starts at 1) |
| `totalThoughts` | integer | ✅ | Estimated total steps (can adjust dynamically) |
| `isRevision` | boolean | ❌ | `true` if revising previous thought |
| `revisesThought` | integer | ❌ | Which thought number is being reconsidered |
| `branchFromThought` | integer | ❌ | Branch point for alternative approaches |
| `branchId` | string | ❌ | Identifier for branch (e.g., "approach-A") |
| `needsMoreThoughts` | boolean | ❌ | `true` if realizing need for more steps |

### Usage Patterns by Agent

#### **DOM Analysis Agent - Locator Strategy Planning**
```typescript
// STEP 0: Before analyzing DOM
await mcp_sequential-th_sequentialthinking({
  thought: "Analyzing DOM structure for test case TC_001. I need to: 1) Identify all interactive elements from HTML, 2) Evaluate attribute uniqueness (id > data-testid > aria > class), 3) Plan fallback locators for each element, 4) Handle special components (dropdowns, date pickers)",
  thoughtNumber: 1,
  totalThoughts: 4,
  nextThoughtNeeded: true
})

// Continue analysis
await mcp_sequential-th_sequentialthinking({
  thought: "Examining HTML structure: Found <input id='email'> with unique ID - confidence 0.95. Found <button class='btn btn-primary'> with shared classes - need fallback using text content or role",
  thoughtNumber: 2,
  totalThoughts: 4,
  nextThoughtNeeded: true
})

await mcp_sequential-th_sequentialthinking({
  thought: "Planning fallback strategy: For email input - primary: #email (ID), fallback1: [placeholder='Email'] (attribute), fallback2: input[type='email'] (CSS). For button - primary: .btn-primary (class), fallback1: button:has-text('Submit') (text), fallback2: [role='button'] (ARIA)",
  thoughtNumber: 3,
  totalThoughts: 4,
  nextThoughtNeeded: true
})

await mcp_sequential-th_sequentialthinking({
  thought: "Special component detected: react-select dropdown at #state. This requires special interaction pattern: click container -> wait -> fillAndEnter input. Will search memory for DemoQA react-select patterns before generating locators",
  thoughtNumber: 4,
  totalThoughts: 4,
  nextThoughtNeeded: false
})
```

#### **POM Generator Agent - Code Generation Planning**
```typescript
// STEP 0: Before generating code
await mcp_sequential-th_sequentialthinking({
  thought: "Planning POM generation for registration form. I need to: 1) Determine test pattern (single case = simple, 2-10 cases = forEach, 10+ = test.each.parallel), 2) Design self-healing wrappers with try-catch fallback chains, 3) Check for existing fixture conflicts",
  thoughtNumber: 1,
  totalThoughts: 3,
  nextThoughtNeeded: true
})

await mcp_sequential-th_sequentialthinking({
  thought: "Analyzing data strategy: 5 test cases detected = forEach pattern. Each test needs: 1) Unique test ID, 2) Independent test.step wrappers, 3) Shared page object instance. Will generate registerPage.ts with self-healing methods + register.spec.ts with data iteration",
  thoughtNumber: 2,
  totalThoughts: 3,
  nextThoughtNeeded: true
})

await mcp_sequential-th_sequentialthinking({
  thought: "Checking fixture registration: Need to verify 'registerPage' not already in pageFixture.ts. If exists, will append unique suffix. Will validate with get_errors before declaring success",
  thoughtNumber: 3,
  totalThoughts: 3,
  nextThoughtNeeded: false
})
```

#### **Test Healing Agent - Error Analysis**
```typescript
// MANDATORY: Always use for error analysis
await mcp_sequential-th_sequentialthinking({
  thought: "Test failed with error: 'locator.click: Timeout 30000ms exceeded. Locator: #login'. Analyzing root cause: 1) Is locator correct? 2) Is element visible? 3) Is there timing issue? 4) Is element in iframe/shadow DOM?",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
})

await mcp_sequential-th_sequentialthinking({
  thought: "Hypothesis 1: Locator might be incorrect. Will re-fetch webpage to find actual button ID. Looking for <button> elements with 'login' or 'submit' text content",
  thoughtNumber: 2,
  totalThoughts: 5,
  nextThoughtNeeded: true
})

await mcp_sequential-th_sequentialthinking({
  thought: "Re-fetch reveals: Button ID is actually #loginButton (not #login). This is a locator mismatch error. Healing strategy: Update page object locator from #login to #loginButton",
  thoughtNumber: 3,
  totalThoughts: 5,
  nextThoughtNeeded: true
})

await mcp_sequential-th_sequentialthinking({
  thought: "Creating backup before applying fix. Will copy loginPage.ts to loginPage.backup.ts, then update locator. If re-run fails, will restore from backup",
  thoughtNumber: 4,
  totalThoughts: 5,
  nextThoughtNeeded: true
})

await mcp_sequential-th_sequentialthinking({
  thought: "Fix complete. Will re-run test to verify. If passes, will store pattern in memory: 'DemoQA login button uses #loginButton ID' for future reference",
  thoughtNumber: 5,
  totalThoughts: 5,
  nextThoughtNeeded: false
})
```

---

## 💾 2. MEMORY MCP INTEGRATION

### 2.1 Search Nodes (`mcp_memory_search_nodes`)

**When to Use:** ALWAYS as Step 0 before main execution

#### Parameter Details
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✅ | Search query (entity names, types, observations) |

#### Query Patterns by Agent

**Test Case Designer:**
```typescript
// STEP 0: Query for test patterns
const patterns = await mcp_memory_search_nodes({
  query: "demoqa.com registration form test patterns"
})

// Use found patterns
if (patterns.entities.length > 0) {
  logger.info(`Found ${patterns.entities.length} existing patterns`)
  // Apply learned test structure
} else {
  logger.info('No patterns found - creating new test design')
}
```

**DOM Analysis Agent:**
```typescript
// STEP 0: Query for locator patterns
const locatorPatterns = await mcp_memory_search_nodes({
  query: "demoqa.com form locators"
})

const componentPatterns = await mcp_memory_search_nodes({
  query: "react-select dropdown interaction"
})

// Use learned locators if found
if (locatorPatterns.entities.length > 0) {
  locatorPatterns.entities.forEach(entity => {
    logger.info(`Learned pattern: ${entity.name}`)
    entity.observations.forEach(obs => logger.info(`  - ${obs}`))
  })
}
```

**POM Generator Agent:**
```typescript
// STEP 0: Query for code patterns
const codePatterns = await mcp_memory_search_nodes({
  query: "registration form page object patterns"
})

const selfHealingPatterns = await mcp_memory_search_nodes({
  query: "self-healing locator wrapper patterns"
})
```

**Test Healing Agent:**
```typescript
// STEP 0: Query for known errors
const errorPatterns = await mcp_memory_search_nodes({
  query: "locator timeout error solutions demoqa"
})

const healingStrategies = await mcp_memory_search_nodes({
  query: "react-select click failed solutions"
})
```

**Orchestration Agent:**
```typescript
// PRE-PROCESSING: Query for domain patterns
const domainPatterns = await mcp_memory_search_nodes({
  query: `${metadata.domain} automation patterns`
})

const dataPatterns = await mcp_memory_search_nodes({
  query: `${metadata.domain} ${metadata.feature} test data patterns`
})
```

---

### 2.2 Create Entities (`mcp_memory_create_entities`)

**When to Use:** After successful completion or learning

#### Parameter Details
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entities` | array | ✅ | Array of entity objects to create |
| `entities[].name` | string | ✅ | Unique entity identifier (domain-feature-pattern) |
| `entities[].entityType` | string | ✅ | Classification (TestPattern, LocatorPattern, CodePattern, ErrorSolution) |
| `entities[].observations` | string[] | ✅ | Facts and learnings about this entity |

#### Storage Patterns by Agent

**Test Case Designer - After generating tests:**
```typescript
await mcp_memory_create_entities({
  entities: [
    {
      name: "demoqa-registration-TestPattern",
      entityType: "TestPattern",
      observations: [
        "User story: User can register with valid information",
        "Test cases generated: 5 (3 positive, 2 negative)",
        "Data-driven: yes (using Faker with seed 12345)",
        "Coverage: 100% of acceptance criteria",
        `Fields tested: firstName, lastName, email, phone, password`,
        "Boundary tests: email format validation, phone length",
        "Test IDs: TC_001 through TC_005",
        "Captured at: GATE 1 completion"
      ]
    },
    {
      name: "demoqa-registration-DataStrategy",
      entityType: "DataPattern",
      observations: [
        "Data file: tests/test-data/demoqa-registration-data.json",
        "Total records: 5",
        "Valid records: 3 (firstName: 10-20 chars, email: valid format)",
        "Invalid records: 2 (email: missing @, phone: 5 digits)",
        "Faker seed: 12345 for reproducibility",
        "Field constraints extracted from HTML: maxLength, pattern, required"
      ]
    }
  ]
})
```

**DOM Analysis Agent - After mapping elements:**
```typescript
await mcp_memory_create_entities({
  entities: [
    {
      name: "demoqa-registration-firstName-Locator",
      entityType: "LocatorPattern",
      observations: [
        "Element: firstName input field",
        "HTML tag: input",
        "Primary locator: #firstName (ID, confidence: 0.95)",
        "Fallback1: [placeholder='First Name'] (attribute, confidence: 0.85)",
        `Fallback2: input[name='firstName'] (name attribute, confidence: 0.80)`,
        "Uniqueness: High (ID is unique in DOM)",
        "Stability: High (ID unlikely to change)",
        "Captured at: GATE 2 element mapping"
      ]
    },
    {
      name: "demoqa-state-ReactSelectComponent",
      entityType: "ComponentPattern",
      observations: [
        "Component: react-select dropdown",
        "Container locator: #state",
        "Input locator: #react-select-3-input",
        "Interaction pattern: click container → wait 500ms → fillAndEnter input → wait 500ms",
        "Options appear in: .css-26l3qy-menu > div.option",
        "Working example: await click(#state); await fillAndEnter(#react-select-3-input, 'NCR')",
        "Common error: Clicking option directly fails - must type and Enter",
        "Captured at: GATE 2 component discovery"
      ]
    }
  ]
})
```

**POM Generator Agent - After generating code:**
```typescript
await mcp_memory_create_entities({
  entities: [
    {
      name: "demoqa-registration-PageObject",
      entityType: "CodePattern",
      observations: [
        "File: tests/test-objects/pages/registerPage.ts",
        "Pattern: Self-healing page object with fallback chains",
        "Methods: 8 (fillFirstName, fillLastName, fillEmail, etc.)",
        "Self-healing: Yes (try primary → fallback1 → fallback2)",
        "Special components handled: react-select (state, city)",
        "Fixture registered: registerPage in pageFixture.ts",
        "Test pattern: forEach (5 test cases)",
        "Captured at: GATE 3 code generation"
      ]
    },
    {
      name: "playwright-selfHealing-WrapperPattern",
      entityType: "CodePattern",
      observations: [
        "Pattern: Try-catch cascade for element interaction",
        "Structure: try { primary } catch { try { fallback1 } catch { fallback2 } }",
        "Logging: Warn on fallback, info on success",
        "Applicable to: click, fill, select operations",
        "Example: fillFirstName method with 3 locator strategies",
        "Success rate improvement: ~30% with self-healing"
      ]
    }
  ]
})
```

**Test Healing Agent - After successful healing:**
```typescript
await mcp_memory_create_entities({
  entities: [
    {
      name: "demoqa-login-LocatorMismatch-Solution",
      entityType: "ErrorSolution",
      observations: [
        "Error: locator.click: Timeout 30000ms exceeded. Locator: #login",
        "Root cause: Actual button ID is #loginButton (not #login)",
        "Detection: Re-fetched webpage revealed correct ID",
        "Solution: Updated loginPage.ts locator from #login to #loginButton",
        "Verification: Test passed after fix",
        "Pattern: DemoQA uses 'Button' suffix for button IDs",
        "Captured at: Healing completion",
        "Healing attempts: 1 (immediate success)"
      ]
    },
    {
      name: "playwright-strictMode-MultipleElements-Solution",
      entityType: "ErrorSolution",
      observations: [
        "Error: strict mode violation: locator resolved to 5 elements",
        "Root cause: Using pageActions.getLocatorCount() on multiple elements",
        "Solution: Replace with locator.count() directly",
        "Before: const count = await pageActions.getLocatorCount(rows)",
        "After: const count = await rows.count()",
        "Applies to: Any locator matching 2+ elements",
        "Prevention: Use locator.count() for counting, getLocator() for interaction"
      ]
    }
  ]
})
```

**Orchestration Agent - After pipeline completion (GATE 5):**
```typescript
await mcp_memory_create_entities({
  entities: [
    {
      name: "demoqa-registration-PipelineExecution",
      entityType: "ExecutionHistory",
      observations: [
        `Request ID: ${metadata.requestId}`,
        "Pipeline: full_automation",
        "Gates executed: Pre-processing, GATE 0, GATE 1, GATE 2, GATE 3, GATE 4, GATE 5",
        `Total execution time: ${executionTimeMs}ms`,
        "GATE 0: Data generation (5 test cases, seed 12345)",
        "GATE 1: Test design (100% coverage)",
        "GATE 2: DOM mapping (8 elements, avg confidence 0.87)",
        "GATE 3: Code generation (2 files, 0 errors)",
        "GATE 4: Execution (3 runs, pass rate 100%)",
        "GATE 5: Learning (stored 12 patterns)",
        "Deliverables: registerPage.ts, register.spec.ts, test-data.json",
        "Captured at: Pipeline completion"
      ]
    }
  ]
})
```

---

### 2.3 Add Observations (`mcp_memory_add_observations`)

**When to Use:** Updating existing patterns with new data

#### Parameter Details
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `observations` | array | ✅ | Array of observation objects |
| `observations[].entityName` | string | ✅ | Existing entity to update |
| `observations[].contents` | string[] | ✅ | New observations to append |

#### Usage Example
```typescript
// After discovering new pattern for existing entity
await mcp_memory_add_observations({
  observations: [
    {
      entityName: "demoqa-state-ReactSelectComponent",
      contents: [
        "Alternative interaction: Can also use keyboard navigation (ArrowDown + Enter)",
        "Performance: wait 500ms may not be needed for fast connections",
        "Captured at: Pattern refinement"
      ]
    }
  ]
})
```

---

### 2.4 Open Nodes (`mcp_memory_open_nodes`)

**When to Use:** Retrieving specific learned patterns by name

#### Parameter Details
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `names` | string[] | ✅ | Array of entity names to retrieve |

#### Usage Example
```typescript
// Retrieve specific patterns
const patterns = await mcp_memory_open_nodes({
  names: [
    "demoqa-registration-TestPattern",
    "demoqa-state-ReactSelectComponent",
    "playwright-strictMode-MultipleElements-Solution"
  ]
})

patterns.entities.forEach(entity => {
  logger.info(`Pattern: ${entity.name}`)
  entity.observations.forEach(obs => logger.info(`  ${obs}`))
})
```

---

## 📋 3. TODO LIST INTEGRATION

### When to Use
- ✅ Multi-gate orchestration workflows
- ✅ Complex agent processes with 5+ steps
- ✅ When user needs progress visibility

### Parameter Details

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `operation` | enum | ✅ | `'write'` to update, `'read'` to retrieve |
| `todoList` | array | ✅ (write) | Complete list of todos (required for write) |
| `todoList[].id` | number | ✅ | Unique sequential ID |
| `todoList[].title` | string | ✅ | Concise action (3-7 words) |
| `todoList[].description` | string | ✅ | Detailed context and requirements |
| `todoList[].status` | enum | ✅ | `'not-started'`, `'in-progress'`, `'completed'` |

### Usage Pattern - Orchestration Agent

**At Pipeline Start:**
```typescript
await manage_todo_list({
  operation: 'write',
  todoList: [
    {
      id: 1,
      title: 'Pre-processing: Input validation',
      description: 'Validate user story, URL, acceptance criteria. Run security checks (XSS, SQL injection, path traversal). Sanitize filenames and extract metadata.',
      status: 'in-progress'
    },
    {
      id: 2,
      title: 'Pre-processing: Fetch and cache webpage',
      description: `Fetch ${request.url} once using fetch_webpage. Detect SPA framework. Check authentication requirements. Cache HTML for all downstream agents.`,
      status: 'not-started'
    },
    {
      id: 3,
      title: 'GATE 0: Data preparation (conditional)',
      description: 'IF data-driven keywords detected OR multiple test cases requested: Generate test data using Faker with seed. Create JSON file with valid/invalid/boundary cases.',
      status: 'not-started'
    },
    {
      id: 4,
      title: 'GATE 1: Test case design',
      description: 'Invoke TestCaseDesigner agent. Transform user story into structured test cases. Validate 80% minimum coverage of acceptance criteria.',
      status: 'not-started'
    },
    {
      id: 5,
      title: 'GATE 2: DOM element mapping',
      description: 'Invoke DOMAgent with cached HTML. Generate primary + 2 fallback locators per element. Score confidence (uniqueness * 0.5 + stability * 0.3 + specificity * 0.2).',
      status: 'not-started'
    },
    {
      id: 6,
      title: 'GATE 3: Code generation',
      description: 'Invoke POMAgent. Generate page objects with self-healing wrappers. Register in pageFixture.ts. Generate test specs. Validate with get_errors.',
      status: 'not-started'
    },
    {
      id: 7,
      title: 'GATE 4: Test execution',
      description: 'Run tests 3 times using run_in_terminal. Analyze results. Trigger healing if 2+ consecutive failures with same error. Re-run after healing.',
      status: 'not-started'
    },
    {
      id: 8,
      title: 'GATE 5: Learning and storage',
      description: 'Store all patterns in memory: test patterns, locator strategies, code patterns, execution results. Update knowledge base for future runs.',
      status: 'not-started'
    }
  ]
})
```

**After Each Gate:**
```typescript
// Mark current gate as completed, next as in-progress
const currentTodos = await manage_todo_list({ operation: 'read' })

const updatedTodos = currentTodos.todoList.map(todo => {
  if (todo.id === currentGateId) {
    return { ...todo, status: 'completed' }
  }
  if (todo.id === currentGateId + 1) {
    return { ...todo, status: 'in-progress' }
  }
  return todo
})

await manage_todo_list({
  operation: 'write',
  todoList: updatedTodos
})
```

---

## 🛠️ 4. BUILT-IN TOOLS

### 4.1 fetch_webpage

**When to Use:** Centralized in orchestration (pre-processing), fallback in healing

#### Parameter Details
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `urls` | string[] | ✅ | Array of URLs to fetch |
| `query` | string | ✅ | Detailed extraction instructions |

#### Orchestration Pre-Processing:
```typescript
const html = await fetch_webpage({
  urls: [request.url],
  query: "Extract ALL interactive elements: inputs (with id, name, placeholder, type, maxLength, pattern, required), buttons (with id, class, text content, type), selects (with id, options), links (with href, text), textareas (with id, placeholder). Include ALL attributes: IDs, classes, data-testid, data-*, ARIA labels (aria-label, aria-labelledby), roles, placeholders, text content, form field constraints."
})
```

#### Test Healing Re-Fetch:
```typescript
const html = await fetch_webpage({
  urls: [request.url],
  query: `Find alternatives for failed locator '${failedLocator}'. Look for elements matching text: '${expectedText}', role: '${expectedRole}', nearby elements, parent/child relationships. Extract ALL possible selector strategies.`
})
```

---

### 4.2 get_errors

**When to Use:** After code generation, before test execution

#### Parameter Details
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filePaths` | string[] | ❌ | Specific files to check (omit for all) |

#### Usage - POM Generator:
```typescript
// After generating all files
const errors = await get_errors([
  'tests/test-objects/pages/registerPage.ts',
  'tests/test-objects/pageFixture.ts',
  'tests/specs/register.spec.ts'
])

if (errors.length > 0) {
  logger.error(`Found ${errors.length} compilation errors`)
  errors.forEach(err => {
    logger.error(`${err.file}:${err.line} - ${err.message}`)
  })
  // Fix errors before proceeding
  throw new CompilationError('Generated code has errors', errors)
}

logger.info('✅ All generated code compiles successfully')
```

---

### 4.3 run_in_terminal

**When to Use:** Test execution, verification runs

#### Parameter Details
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | string | ✅ | Shell command to execute |
| `explanation` | string | ✅ | One-sentence description for user |
| `isBackground` | boolean | ✅ | `false` for blocking (get output), `true` for background |

#### Usage - Test Healing:
```typescript
// Run 1/3
const result1 = await run_in_terminal({
  command: `npx playwright test ${testFile} --reporter=json`,
  explanation: `Test execution run 1/3 for ${testFile}`,
  isBackground: false
})

const status1 = result1.exitCode === 0 ? 'PASS' : 'FAIL'

// Run 2/3
const result2 = await run_in_terminal({
  command: `npx playwright test ${testFile} --reporter=json`,
  explanation: `Test execution run 2/3 for ${testFile}`,
  isBackground: false
})

const status2 = result2.exitCode === 0 ? 'PASS' : 'FAIL'

// Trigger healing if 2 consecutive failures
if (status1 === 'FAIL' && status2 === 'FAIL') {
  const sameError = result1.stderr === result2.stderr
  if (sameError) {
    logger.warn('🔧 Triggering healing - same error in 2 consecutive runs')
    // Invoke healing logic
  }
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### For Each Agent, Add:

- [ ] **Step 0: Memory Search** (query existing patterns)
- [ ] **Step 1: Sequential Thinking** (plan approach, 3+ thoughts)
- [ ] **Step N: Main Execution** (existing workflow)
- [ ] **Step N+1: Memory Storage** (create entities with learnings)
- [ ] **Checkpoint: Self-Audit** (verify all MCPs used)

### Orchestration Agent Additions:

- [ ] **Pre-processing: Memory Search** (domain patterns)
- [ ] **Pre-processing: Todo List Init** (8 gates)
- [ ] **Each Gate: Todo Update** (mark completed, next in-progress)
- [ ] **GATE 5: Comprehensive Memory Storage** (all learnings)
- [ ] **End: Todo List Complete** (all marked completed)

---

## 🎯 ENFORCEMENT RULES

**HARD REQUIREMENTS:**

1. **🛑 MEMORY-FIRST RULE**: MUST call `mcp_memory_search_nodes` as Step 0
2. **🛑 PLANNING RULE**: MUST call `mcp_sequential-th_sequentialthinking` before complex operations (minimum 3 thoughts)
3. **🛑 LEARNING RULE**: MUST call `mcp_memory_create_entities` after successful completion
4. **🛑 CHECKPOINT RULE**: MUST output self-audit after each major step

**Penalty for violation:** Agent execution is incomplete and must be restarted.

