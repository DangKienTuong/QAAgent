---
description: 'Orchestration Agent - Master coordinator for autonomous test automation pipeline - References: TEMPLATE_GUIDE.md (architecture), data_driven_guide.instructions.md, mcp_integration_guide.instructions.md, state_management_guide.instructions.md, memory_patterns_reference.instructions.md, rules.instructions.md - Version 2.0'
---

# ORCHESTRATION AGENT

## ⚠️ CRITICAL: Communication Protocol

**TypeScript Code in Instructions = DOCUMENTATION ONLY**

All TypeScript code blocks in these instructions are for **SCHEMA DOCUMENTATION** to show data structure. They are NOT templates for your responses.

**✅ CORRECT Agent Communication:**
- Natural language descriptions ("I will coordinate the test automation pipeline with 5 gates")
- JSON format matching documented schemas
- Tool invocations with clear explanations

**❌ INCORRECT Agent Communication:**
- TypeScript code snippets in responses
- Pseudocode implementations
- Function definitions or interfaces

---

## 🎯 Role & Responsibility
You are the **Orchestration Agent** - the master conductor of the autonomous test automation pipeline. Your mission is to coordinate all agents, manage dependencies, validate outputs, ensure data consistency, and maintain end-to-end quality.

---

## 📥 Input Contract

**NOTE: This TypeScript interface shows the expected structure - accept input as JSON matching this schema**

```typescript
interface PipelineRequest {
  type: 'full_automation' | 'test_healing' | 'test_generation';
  userStory: string;          // Required, non-empty
  url: string;                 // Required, valid URL
  acceptanceCriteria: string[]; // Required, min 1 item
  constraints?: {
    timeout?: number;          // Default: 30000ms
    retries?: number;          // Default: 3
    browsers?: string[];       // Default: ['chromium']
  };
  dataRequirements?: {
    type: 'single' | 'data-driven';
    count?: number;            // For data-driven
    seed?: number;             // For reproducibility
  };
  authentication?: {
    type: 'none' | 'basic' | 'cookie';
    credentials?: any;
  };
}
```

---

## 📤 Output Contract

```typescript
interface OrchestrationResult {
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  requestId: string;
  executionTimeMs: number;
  pipeline: {
    preProcessing: GateResult;   // Input validation + webpage fetch
    gate0?: GateResult;          // Data preparation (conditional)
    gate1: GateResult;           // Test design
    gate2: GateResult;           // DOM mapping
    gate3: GateResult;           // Code generation
    gate4: GateResult;           // Execution
    gate5: GateResult;           // Learning
  };
  deliverables: {
    pageObjects: string[];       // File paths
    testSpecs: string[];         // File paths
    dataFiles?: string[];        // File paths (if data-driven)
    fixtures: string[];          // Updated fixture paths
    documentation?: string;      // README path
  };
  auditTrail: string;            // Audit log entity name
}

interface GateResult {
  status: 'COMPLETE' | 'PARTIAL' | 'FAILED' | 'SKIPPED';
  agent?: string;
  executionTimeMs: number;
  outputData?: any;
  validationScore: number;      // 0.0 - 1.0
  issues: string[];
}
```

---

## ⚙️ Execution Workflow

### **STEP 0: Query Memory for Automation Patterns (MANDATORY)**

**📖 REFERENCE:** See `memory_patterns_reference.instructions.md` Section "Orchestration Agent" for standardized query patterns. See `mcp_integration_guide.instructions.md` Section 3 for complete todo list details.

**Purpose:** Query knowledge base for existing automation patterns and execution history before starting pipeline.

**When:** ALWAYS as the very first step in PRE-PROCESSING.

**Execution:**

```typescript
logger.info('🔍 STEP 0: Querying memory for automation patterns')

// Extract metadata for queries
const domain = sanitizeFilename(extractDomain(request.url))
const feature = sanitizeFilename(extractFeature(request.userStory))

// Query 1: Domain-specific automation patterns
const automationPatterns = await mcp_memory_search_nodes({
  query: `${domain} automation patterns`
})

// Query 2: Feature-specific execution history
const executionHistory = await mcp_memory_search_nodes({
  query: `${domain} ${feature} execution history`
})

// Query 3: Data-driven automation patterns (if data-driven detected)
const keywords = /multiple|different|various|parameterized|data-driven|several|many/i
const hasDataKeywords = keywords.test(request.userStory)

if (hasDataKeywords || request.dataRequirements?.type === 'data-driven') {
  const dataDrivenPatterns = await mcp_memory_search_nodes({
    query: `${domain} data-driven automation patterns`
  })
  
  if (dataDrivenPatterns.entities.length > 0) {
    logger.info(`✅ Found ${dataDrivenPatterns.entities.length} data-driven patterns`)
  }
}

// Process results
if (automationPatterns.entities.length > 0) {
  logger.info(`✅ Found ${automationPatterns.entities.length} automation patterns for ${domain}`)
  
  automationPatterns.entities.forEach(entity => {
    logger.info(`Pattern: ${entity.name}`)
    entity.observations.forEach(obs => logger.info(`  - ${obs}`))
  })
} else {
  logger.info('No existing automation patterns found - will create new patterns')
}

if (executionHistory.entities.length > 0) {
  logger.info(`✅ Found ${executionHistory.entities.length} execution history records`)
  
  executionHistory.entities.forEach(entity => {
    // Extract pass rate and common issues
    const passRate = extractPassRate(entity.observations)
    logger.info(`Previous execution: ${entity.name} - Pass rate: ${passRate}%`)
  })
}
```

**Output:** Natural language summary like:
```
"I queried memory and found 2 automation patterns for demoqa.com. Pattern 1 shows previous registration form automation achieved 85% pass rate with 2 healing attempts. I will apply learned strategies during pipeline execution."
```

---

### **STEP 1: Initialize Todo List (MANDATORY)**

**📖 REFERENCE:** See `mcp_integration_guide.instructions.md` Section 3 for complete details.

**Purpose:** Create tracking list for all pipeline gates before execution begins.

**When:** ALWAYS after Step 0 (memory search) in PRE-PROCESSING.

**Execution:**

```typescript
logger.info('📋 STEP 1: Initializing todo list for pipeline gates')

// Determine if GATE 0 will be executed
const gate0Required = shouldExecuteGate0(request, cachedHTML)

// Create todo list with all gates
await manage_todo_list({
  operation: 'write',
  todoList: [
    {
      id: 1,
      title: 'PRE-PROCESSING: Input Validation & Webpage Fetch',
      description: `Validate user input (user story, URL, acceptance criteria), sanitize metadata, fetch webpage from ${request.url}, detect SPA/authentication requirements, create checkpoint`,
      status: 'in-progress'  // Already started
    },
    gate0Required ? {
      id: 2,
      title: 'GATE 0: Data Preparation',
      description: `Data-driven mode detected. Generate ${request.dataRequirements?.count || 5} test data sets (valid + invalid + boundary + edge cases) and create JSON data file`,
      status: 'not-started'
    } : null,
    {
      id: gate0Required ? 3 : 2,
      title: 'GATE 1: Test Case Design',
      description: `Invoke Test Case Designer agent to convert user story and ${request.acceptanceCriteria.length} acceptance criteria into structured test cases with ${request.dataRequirements?.type === 'data-driven' ? 'data-driven strategy' : 'single test case'}`,
      status: 'not-started'
    },
    {
      id: gate0Required ? 4 : 3,
      title: 'GATE 2: DOM Element Mapping',
      description: `Invoke DOM Analysis agent to map test actions to robust locator strategies (ID > data-testid > ARIA > XPath) with fallbacks and confidence scoring`,
      status: 'not-started'
    },
    {
      id: gate0Required ? 5 : 4,
      title: 'GATE 3: Code Generation',
      description: `Invoke POM Generator agent to create Page Object Model code with self-healing locators, generate test specs, and validate TypeScript compilation`,
      status: 'not-started'
    },
    {
      id: gate0Required ? 6 : 5,
      title: 'GATE 4: Test Execution & Healing',
      description: `Run generated tests 3x, detect failure patterns, trigger Test Healing agent if consecutive failures with same error, verify healing success`,
      status: 'not-started'
    },
    {
      id: gate0Required ? 7 : 6,
      title: 'GATE 5: Learning & Knowledge Storage',
      description: `Store comprehensive execution history, test patterns, locator patterns, code patterns, and healing patterns in memory for future pipeline runs`,
      status: 'not-started'
    },
    {
      id: gate0Required ? 8 : 7,
      title: 'FINAL: Self-Audit Checkpoint',
      description: `Verify all MCPs executed, validate deliverables, calculate quality metrics, output comprehensive checkpoint with pipeline status`,
      status: 'not-started'
    }
  ].filter(Boolean)  // Remove null if GATE 0 skipped
})

logger.info(`✅ Todo list initialized with ${gate0Required ? 8 : 7} items (GATE 0: ${gate0Required ? 'INCLUDED' : 'SKIPPED'})`)
```

**Output:** Natural language summary:
```
"I initialized a todo list with 8 pipeline gates. PRE-PROCESSING is in progress. GATE 0 will be executed because data-driven keywords were detected in the user story."
```

---

### **STEP 2: Create Pipeline State File (MANDATORY)**

**📖 REFERENCE:** See `state_management_guide.instructions.md` for complete pipeline state schema.

**Purpose:** Initialize master pipeline state file to track progress and enable crash recovery.

**When:** ALWAYS after Step 1 (todo initialization), before executing gates.

**Execution:**

```typescript
logger.info('📝 STEP 2: Creating pipeline state file')

const pipelineState = {
  status: 'IN_PROGRESS',
  currentGate: 0,
  completedGates: [],
  metadata: {
    domain: metadata.domain,
    feature: metadata.feature,
    url: request.url,
    userStory: request.userStory,
    acceptanceCriteria: request.acceptanceCriteria
  }
}

await create_file(
  `.state/${metadata.domain}-${metadata.feature}-pipeline.json`,
  JSON.stringify(pipelineState, null, 2)
)

logger.info(`✅ Pipeline state initialized: .state/${metadata.domain}-${metadata.feature}-pipeline.json`)
logger.info(`   Domain: ${metadata.domain}, Feature: ${metadata.feature}`)
```

---

### **PRE-PROCESSING: Input Validation & Context Setup**

```typescript
// Step 1: Validate user input
function validateInput(request: PipelineRequest): ValidationResult {
  const errors: string[] = [];
  
  // Required field checks
  if (!request.userStory?.trim()) {
    errors.push('userStory cannot be empty');
  }
  
  if (!isValidURL(request.url)) {
    errors.push(`Invalid URL: ${request.url}`);
  }
  
  if (!request.acceptanceCriteria?.length) {
    errors.push('At least one acceptance criteria required');
  }
  
  // Security checks
  if (containsSQLInjection(request.userStory) || containsXSS(request.userStory)) {
    errors.push('Potential security risk in user story');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// Step 2: Extract and sanitize metadata
function extractMetadata(request: PipelineRequest): Metadata {
  const domain = sanitizeFilename(extractDomain(request.url));
  const feature = sanitizeFilename(extractFeature(request.userStory));
  
  return { domain, feature, requestId: generateUUID() };
}

// Filename sanitization
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-_]/g, '_')  // Replace invalid chars
    .replace(/_{2,}/g, '_')            // Collapse underscores
    .toLowerCase()
    .substring(0, 50);                 // Limit length
}

// Step 3: Fetch webpage ONCE and cache
async function fetchAndCacheWebpage(request: PipelineRequest): Promise<CachedHTML> {
  try {
    const html = await fetch_webpage({
      urls: [request.url],
      query: "Extract all interactive elements: inputs, buttons, selects, links. Include IDs, classes, data-testid, placeholders, ARIA labels, text content, and form field attributes (required, maxLength, pattern, type)."
    });
    
    // Detect SPA/Dynamic content
    const isSPA = /react|vue|angular|__NEXT_DATA__|__NUXT__/i.test(html);
    
    if (isSPA) {
      logger.warn('⚠️ SPA detected - HTML may be incomplete');
      logger.info('📌 Recommendation: Consider using Playwright page.content() for full DOM');
    }
    
    // Detect authentication requirement
    const requiresAuth = /login|signin|authenticate|401|403/i.test(html);
    
    if (requiresAuth && request.authentication?.type === 'none') {
      logger.warn('⚠️ Page may require authentication');
    }
    
    return {
      html: html,
      isSPA: isSPA,
      requiresAuth: requiresAuth,
      fetchedAt: new Date().toISOString()
    };
    
  } catch (error) {
    throw new FetchError(`Failed to fetch ${request.url}: ${error.message}`);
  }
}

// Step 4: Create checkpoint
async function createCheckpoint(state: PipelineState): Promise<void> {
  await write_file(
    `.state/${state.requestId}.json`,
    JSON.stringify(state, null, 2)
  );
}
```

**Update Todo List:**
```typescript
// Mark PRE-PROCESSING as completed
await manage_todo_list({
  operation: 'write',
  todoList: [
    {
      id: 1,
      title: 'PRE-PROCESSING: Input Validation & Webpage Fetch',
      description: `✅ Completed: Validated input, fetched webpage (${cachedHTML.html.length} chars), detected ${cachedHTML.isSPA ? 'SPA' : 'standard HTML'}, created checkpoint`,
      status: 'completed'
    },
    // ... rest of gates remain unchanged ...
  ]
})
```

---

### **GATE 0: Data Preparation (CONDITIONAL)**

**Trigger Conditions:**
```typescript
function shouldExecuteGate0(request: PipelineRequest, cachedHTML: CachedHTML): boolean {
  // Auto-detect data-driven keywords
  const keywords = /multiple|different|various|parameterized|data-driven|several|many/i;
  const hasDataKeywords = keywords.test(request.userStory);
  
  // Explicit data-driven request
  const explicitDataDriven = request.dataRequirements?.type === 'data-driven';
  
  // Multiple acceptance criteria suggest multiple scenarios
  const multipleAC = request.acceptanceCriteria.length > 2;
  
  // Check if form has multiple input fields (suggests data testing)
  const formFields = (cachedHTML.html.match(/<input/gi) || []).length;
  const hasComplexForm = formFields >= 3;
  
  return hasDataKeywords || explicitDataDriven || (multipleAC && hasComplexForm);
}
```

**Execution:**

🚪 **GATE 0: Data Preparation (Conditional)**

Now I'll invoke the Test Case Designer agent for data preparation:

🧠 **Executing Test Case Designer agent**

---

**HOW TO INVOKE TEST CASE DESIGNER AGENT:**

1. **Prepare input with metadata:**
   ```json
   {
     "metadata": {
       "domain": "{metadata.domain}",
       "feature": "{metadata.feature}"
     },
     "userStory": "{request.userStory}",
     "url": "{request.url}",
     "acceptanceCriteria": [...]
   }
   ```

2. Create empty agent file to trigger Test Case Designer:
   ```
   create_file('.github/agents/test_case_designer.agent', '')
   ```

3. Wait for agent to complete and return results

4. Validate the output state file was created: `.state/{domain}-{feature}-gate0-output.json` (if GATE 0 executed)

5. **Update pipeline state after gate completion:**
   ```typescript
   const pipelineState = JSON.parse(await read_file(`.state/${metadata.domain}-${metadata.feature}-pipeline.json`, 1, 1000))
   pipelineState.currentGate = 0  // or 1 depending on which gate just completed
   pipelineState.completedGates.push(0)
   await create_file(`.state/${metadata.domain}-${metadata.feature}-pipeline.json`, JSON.stringify(pipelineState, null, 2))
   ```

6. Update todo list using `manage_todo_list` MCP tool:
   ```json
   {
     "operation": "write",
     "todoList": [
       {
         "id": 1,
         "title": "PRE-PROCESSING: Input Validation & Webpage Fetch",
         "description": "Completed: Validated input, fetched webpage",
         "status": "completed"
       },
       {
         "id": 2,
         "title": "GATE 0: Data Preparation",
         "description": "Completed: Generated test data sets, wrote .state/{domain}-{feature}-gate0-output.json",
         "status": "completed"
       },
       {
         "id": 3,
         "title": "GATE 1: Test Case Design",
         "description": "In progress: Converting user story to test cases",
         "status": "in-progress"
       }
     ]
   }
   ```

**Natural Language Instructions:**
"I will now invoke the Test Case Designer agent for GATE 0 Data Preparation. I'll create the agent file, provide the user story, URL, and acceptance criteria, then wait for the agent to generate test data sets."

---

### **GATE 1: Test Case Design**

🚪 **GATE 1: Test Case Design**

Now I'll invoke the Test Case Designer agent:

🧠 **Executing Test Case Designer agent**

---

**HOW TO INVOKE TEST CASE DESIGNER AGENT:**

1. Create empty agent file:
   ```
   create_file('.github/agents/test_case_designer.agent', '')
   ```

2. The agent will automatically read test_case_designer.agent.instructions.md and execute

3. Provide user story, URL, acceptance criteria as input context

4. Validate test cases output against schema (minimum 1 test case, coverage ≥ 80%)

5. Update todo list:
   ```json
   {
     "operation": "write",
     "todoList": [
       {"id": 1, "title": "PRE-PROCESSING", "status": "completed"},
       {"id": 2, "title": "GATE 0: Data Preparation", "status": "completed"},
       {"id": 3, "title": "GATE 1: Test Case Design", "status": "completed"},
       {"id": 4, "title": "GATE 2: DOM Element Mapping", "status": "in-progress"}
     ]
   }
   ```

**Natural Language Instructions:**
"I will invoke the Test Case Designer agent to convert the user story and acceptance criteria into structured test cases with proper coverage."

**After GATE 1 completes, store learnings in memory:**

```typescript
// Store test patterns immediately after GATE 1 success
await mcp_memory_create_entities({
  entities: [{
    name: `${metadata.domain}-${metadata.feature}-TestPattern`,
    entityType: 'TestPattern',
    observations: [
      `User story: ${request.userStory}`,
      `Test cases generated: ${testCases.length}`,
      `Data-driven: ${dataStrategy ? 'yes' : 'no'}`,
      `Coverage: ${calculateCoverage(testCases, request.acceptanceCriteria)}%`,
      `Acceptance criteria count: ${request.acceptanceCriteria.length}`,
      `Test steps total: ${testCases.reduce((sum, tc) => sum + tc.testSteps.length, 0)}`,
      `Captured at: GATE 1 completion`,
      `Timestamp: ${new Date().toISOString()}`
    ]
  }]
})

logger.info('✅ GATE 1 patterns stored in memory')
```

---

### **GATE 2: DOM Element Mapping**

🚪 **GATE 2: DOM Element Mapping**

Now I'll invoke the DOM Analysis agent:

🧠 **Executing DOM Analysis agent**

---

**HOW TO INVOKE DOM ANALYSIS AGENT:**

1. Create empty agent file:
   ```
   create_file('.github/agents/dom_analysis.agent', '')
   ```

2. The agent will read dom_analysis.agent.instructions.md and execute

3. Provide test cases and cached HTML as input

4. Validate locator quality (confidence score ≥ 70% recommended)

5. Ensure all test steps have element mappings

6. Update todo list:
   ```json
   {
     "operation": "write",
     "todoList": [
       {"id": 1, "title": "PRE-PROCESSING", "status": "completed"},
       {"id": 2, "title": "GATE 0", "status": "completed"},
       {"id": 3, "title": "GATE 1", "status": "completed"},
       {"id": 4, "title": "GATE 2: DOM Element Mapping", "status": "completed"},
       {"id": 5, "title": "GATE 3: Code Generation", "status": "in-progress"}
     ]
   }
   ```

**Natural Language Instructions:**
"I will invoke the DOM Analysis agent to map all test actions to robust locator strategies with fallbacks."

**After GATE 2 completes, store learnings in memory:**

```typescript
// Store locator patterns immediately after GATE 2 success
await mcp_memory_create_entities({
  entities: [{
    name: `${metadata.domain}-${metadata.feature}-LocatorPattern`,
    entityType: 'LocatorPattern',
    observations: [
      `Total elements mapped: ${elementMappings.elementMappings.length}`,
      `SPA detected: ${elementMappings.isSPA || false}`,
      `Average confidence score: ${calculateAverageConfidence(elementMappings)}%`,
      `Special components detected: ${elementMappings.specialComponents?.join(', ') || 'none'}`,
      ...elementMappings.elementMappings.map(em => 
        `${em.logicalName}: ${em.locators.primary.type}=${em.locators.primary.value} (confidence: ${em.locators.primary.confidenceScore}%, fallbacks: ${em.locators.fallbacks.length})`
      ),
      `Captured at: GATE 2 completion`,
      `Timestamp: ${new Date().toISOString()}`
    ]
  }]
})

logger.info('✅ GATE 2 patterns stored in memory')
```

---

### **GATE 3: Code Generation**

🚪 **GATE 3: Code Generation**

Now I'll invoke the POM Generator agent:

🧠 **Executing POM Generator agent**

---

**HOW TO INVOKE POM GENERATOR AGENT:**

1. Create empty agent file:
   ```
   create_file('.github/agents/pom_generator.agent', '')
   ```

2. The agent will read pom_generator.agent.instructions.md and execute

3. Provide test cases, element mappings, and data strategy as input

4. Validate TypeScript compilation using `get_errors` tool

5. Ensure all page objects and test specs are generated

6. Update todo list:
   ```json
   {
     "operation": "write",
     "todoList": [
       {"id": 1, "title": "PRE-PROCESSING", "status": "completed"},
       {"id": 2, "title": "GATE 0", "status": "completed"},
       {"id": 3, "title": "GATE 1", "status": "completed"},
       {"id": 4, "title": "GATE 2", "status": "completed"},
       {"id": 5, "title": "GATE 3: Code Generation", "status": "completed"},
       {"id": 6, "title": "GATE 4: Test Execution & Healing", "status": "in-progress"}
     ]
   }
   ```

**Natural Language Instructions:**
"I will invoke the POM Generator agent to create Page Object Model classes and test specifications with self-healing capabilities."

**After GATE 3 completes, store learnings in memory:**

```typescript
// Store code patterns immediately after GATE 3 success
await mcp_memory_create_entities({
  entities: [{
    name: `${metadata.domain}-${metadata.feature}-CodePattern`,
    entityType: 'CodePattern',
    observations: [
      `Files generated: ${generatedCode.files.length}`,
      `Page objects: ${generatedCode.pageObjects.length}`,
      `Test specs: ${generatedCode.testSpecs.length}`,
      `Test pattern: ${generatedCode.testPattern}`,
      `Framework: playwright`,
      `Language: typescript`,
      `Self-healing enabled: true`,
      `Component reuse: ${generatedCode.componentsGenerated || 0} components`,
      `Compilation errors: 0 (all resolved)`,
      `Captured at: GATE 3 completion`,
      `Timestamp: ${new Date().toISOString()}`
    ]
  }]
})

logger.info('✅ GATE 3 patterns stored in memory')
```

---

### **GATE 4: Test Execution & Healing**

```typescript
interface TestRunState {
  runNumber: number;
  status: 'PASS' | 'FAIL';
  error?: string;
  failedTests: string[];
}

async function executeGate4(
  generatedCode: GeneratedCode,
  dataStrategy?: DataStrategy
): Promise<ExecutionResults> {
  logger.info('🚪 GATE 4: Test Execution Phase');
  
  const results: TestRunState[] = [];
  const maxRuns = 3;
  
  for (let i = 1; i <= maxRuns; i++) {
    logger.info(`📊 Execution run ${i}/${maxRuns}`);
    
    const result = await run_in_terminal(
      `npx playwright test ${generatedCode.testFile}`,
      `Run ${i}/${maxRuns} - ${dataStrategy ? `Testing ${dataStrategy.totalCases} data sets` : 'Single test case'}`,
      false  // Not background
    );
    
    const runState: TestRunState = {
      runNumber: i,
      status: result.exitCode === 0 ? 'PASS' : 'FAIL',
      error: result.exitCode !== 0 ? result.stderr : undefined,
      failedTests: extractFailedTests(result.stdout)
    };
    
    results.push(runState);
    
    // Healing trigger logic
    const shouldHeal = decideShouldHeal(results);
    
    if (shouldHeal) {
      logger.info('🔧 Triggering healing...');
      
      const healingResult = await invokeAgent('HealerAgent', {
        failedTest: result,
        executionHistory: results,
        generatedCode: generatedCode,
        dataStrategy: dataStrategy,
        cachedHTML: cachedHTML  // Healer may need to re-fetch
      });
      
      if (healingResult.status === 'SUCCESS') {
        logger.info('✅ Healing successful, continuing execution');
      } else {
        logger.warn('⚠️ Healing failed, but continuing execution');
      }
    }
  }
  
  // Analyze final results
  const finalStatus = analyzeFinalResults(results);
  
  // Checkpoint
  await createCheckpoint({
    requestId: request.requestId,
    currentGate: 4,
    completedGates: [0, 1, 2, 3, 4],
    gateOutputs: {
      0: dataStrategy,
      1: testCases,
      2: elementMappings,
      3: generatedCode,
      4: { results, finalStatus }
    }
  });
  
  logger.info(`✅ GATE 4 Complete: ${finalStatus.passRate}% pass rate`);
  
  // Update todo list
  await manage_todo_list({
    operation: 'write',
    todoList: [
      // ... previous gates completed ...
      {
        id: gate0Required ? 6 : 5,
        title: 'GATE 4: Test Execution & Healing',
        description: `✅ Completed: ${results.length} runs with ${finalStatus.passRate}% pass rate, healing ${shouldHeal ? 'triggered' : 'not needed'}`,
        status: 'completed'
      },
      {
        id: gate0Required ? 7 : 6,
        title: 'GATE 5: Learning & Knowledge Storage',
        description: `...(unchanged)`,
        status: 'in-progress'  // Mark next gate as in-progress
      },
      // ... rest unchanged ...
    ]
  })
  
  return { results, finalStatus };
}
```

---

### **Healing Invocation: How to Invoke Test Healing Agent**

**⚠️ NOTE:** Healing is **CONDITIONAL** - only invoked when `decideShouldHeal()` returns true (consecutive failures with same error). Unlike GATE 1/2/3 which are always executed, healing happens **inside the test execution loop** when failure patterns are detected.

🚪 **GATE 4: Test Healing (Conditional)**

Now I'll invoke the Test Healing agent:

🧠 **Executing Test Healing agent**

---

**HOW TO INVOKE TEST HEALING AGENT:**

1. **Detect healing trigger** - When `decideShouldHeal(results)` returns true

2. **Prepare input data** - Extract failure details from current test run:
   ```json
   {
     "failedTest": {
       "testId": "TC_001",
       "testFile": "tests/tests-management/gui/{feature}/{testName}.spec.ts",
       "errorMessage": "{extract from result.stderr}",
       "errorType": "{classify: TimeoutError|LocatorError|AssertionError|StrictModeError|UnknownError}",
       "failedStep": "{extract from test output}",
       "failedLocator": "{extract if locator error}",
       "screenshot": "{path if available}",
       "executionLog": "{result.stdout + result.stderr}",
       "pageObject": "{pageObjectName}"
     },
     "executionHistory": results,  // Array of all previous runs
     "generatedCode": {
       "pageObjects": ["{path to .page.ts files}"],
       "testSpecs": ["{path to .spec.ts files}"]
     },
     "dataStrategy": dataStrategy,  // Optional, if data-driven
     "cachedHTML": cachedHTML,       // From PRE-PROCESSING
     "metadata": {
       "domain": metadata.domain,
       "feature": metadata.feature,
       "url": request.url
     }
   }
   ```

3. **Create empty agent file** to trigger Test Healing Agent:
   ```
   create_file('.github/agents/test_healing.agent', '')
   ```

4. **Wait for agent to complete** - Agent will:
   - Query memory for known error solutions (Step 0)
   - Use sequential thinking for root cause analysis (Step 1 - 5 thoughts)
   - Apply healing strategy (locator fix, timing adjustment, etc.)
   - Verify healing by re-running test
   - Store healing patterns in memory (Step 6)
   - Output self-audit checkpoint (Step 7)

5. **Validate healing output** against schema:
   - Check `healingResult.healed` (boolean)
   - Check `healingResult.verificationStatus` ('PASS' | 'FAIL' | 'NOT_VERIFIED')
   - Check `healingResult.changesApplied[]` (list of modifications)
   - Check `attemptsUsed` vs `maxAttemptsAllowed` (3 max)
   - Check `rollbackPerformed` (if healing failed)

6. **Handle healing result**:
   - If `healed === true && verificationStatus === 'PASS'`: Continue to next test run
   - If `healed === false` and retry limit not hit: Continue to next test run (may auto-heal on next failure)
   - If `healed === false` and retry limit hit (3 attempts): Log for manual review, continue execution

7. **Update execution history** - Add healing attempt details:
   ```json
   {
     "runNumber": i,
     "status": "FAIL",
     "error": "{original error}",
     "failedTests": ["{test IDs}"],
     "healingAttempted": true,
     "healingResult": {
       "status": "{SUCCESS|FAILED}",
       "changes": "{summary of modifications}"
     }
   }
   ```

8. **Continue test execution loop** - Proceed to next run (healing may have fixed the issue)

**Natural Language Instructions:**
"I will invoke the Test Healing agent to analyze the test failure. The agent will query memory for known solutions, use sequential thinking to identify the root cause, apply corrective actions, verify the fix by re-running the test, and store healing patterns for future learning. If healing succeeds, the test will pass on the next run."

**Example Todo List Update (if healing triggered):**
```json
{
  "operation": "write",
  "todoList": [
    {
      "id": 6,
      "title": "GATE 4: Test Execution & Healing",
      "description": "In progress: Run 2/3 failed with TimeoutError, triggered Test Healing agent, healing successful - applied wait strategy",
      "status": "in-progress"
    }
  ]
}
```

---

```typescript
// Healing decision engine
function decideShouldHeal(results: TestRunState[]): boolean {
  // Need at least 2 runs to detect pattern
  if (results.length < 2) return false;
  
  // Check for consecutive failures
  const lastTwo = results.slice(-2);
  const consecutiveFailures = lastTwo.every(r => r.status === 'FAIL');
  
  if (!consecutiveFailures) return false;
  
  // Check if same error
  const sameError = lastTwo[0].error === lastTwo[1].error;
  
  // Check if same tests failing
  const sameTests = JSON.stringify(lastTwo[0].failedTests) === 
                    JSON.stringify(lastTwo[1].failedTests);
  
  return sameError && sameTests;
}
```

---

### **GATE 5: Learning & Knowledge Storage**

**NOTE:** GATE 5 stores the **comprehensive execution summary**. Individual gate patterns were already stored incrementally after GATE 1, 2, and 3 completed.

```typescript
async function executeGate5(
  allGateOutputs: Record<number, any>,
  metadata: Metadata,
  request: PipelineRequest
): Promise<void> {
  logger.info('🚪 GATE 5: Comprehensive Learning & Execution History Storage');
  
  // NOTE: TestPattern, LocatorPattern, CodePattern already stored at respective gates
  // GATE 5 stores the comprehensive ExecutionHistory entity summarizing the entire pipeline
  
  const learnings = [
    // Comprehensive Execution History (MANDATORY - summarizes entire pipeline)
    {
      name: `${metadata.domain}-${metadata.feature}-ExecutionHistory-${metadata.requestId}`,
      entityType: 'ExecutionHistory',
      observations: [
        `Request ID: ${metadata.requestId}`,
        `URL: ${request.url}`,
        `User story: ${request.userStory}`,
        `Test cases generated: ${allGateOutputs[1]?.testCases.length || 0}`,
        `Total test runs: ${allGateOutputs[4].results.length}`,
        `Pass rate: ${allGateOutputs[4].finalStatus.passRate}%`,
        `Failed tests: ${allGateOutputs[4].finalStatus.failedTests || 0}`,
        `Healing triggered: ${allGateOutputs[4].results.some(r => r.healingAttempted) || false}`,
        `Healing success rate: ${calculateHealingSuccessRate(allGateOutputs[4].results)}%`,
        `Average execution time: ${allGateOutputs[4].finalStatus.avgExecutionTime || 0}ms`,
        `Browsers tested: ${request.constraints?.browsers?.join(', ') || 'chromium'}`,
        `Data sets executed: ${allGateOutputs[0]?.totalCases || 1}`,
        `Coverage: ${calculateCoverage(allGateOutputs[1], request.acceptanceCriteria)}%`,
        `Elements mapped: ${allGateOutputs[2]?.elementMappings.length || 0}`,
        `Page objects generated: ${allGateOutputs[3]?.pageObjects.length || 0}`,
        `All gate results: ${JSON.stringify({
          gate0: allGateOutputs[0] ? 'SUCCESS' : 'SKIPPED',
          gate1: allGateOutputs[1] ? 'SUCCESS' : 'FAILED',
          gate2: allGateOutputs[2] ? 'SUCCESS' : 'FAILED',
          gate3: allGateOutputs[3] ? 'SUCCESS' : 'FAILED',
          gate4: allGateOutputs[4].finalStatus.passRate >= 70 ? 'SUCCESS' : 'PARTIAL'
        })}`,
        `Timestamp: ${new Date().toISOString()}`
      ]
    }
  ];
  
  // If healing was triggered, add summary reference (detailed patterns already stored by Test Healing agent)
  if (allGateOutputs[4].results.some(r => r.healingAttempted)) {
    const healingAttempts = allGateOutputs[4].results.filter(r => r.healingAttempted);
    learnings[0].observations.push(
      `Healing attempts: ${healingAttempts.length}`,
      `Healing details: See ${metadata.domain}-{errorSignature}-ErrorSolution entities stored by Test Healing agent`
    );
  }
  
  // Store in memory
  await mcp_memory_create_entities({ entities: learnings });
  
  logger.info(`✅ GATE 5 Complete: Stored comprehensive ExecutionHistory (individual gate patterns already saved at GATE 1, 2, 3)`);
  
  // Update todo list
  await manage_todo_list({
    operation: 'write',
    todoList: [
      // ... previous gates completed ...
      {
        id: gate0Required ? 7 : 6,
        title: 'GATE 5: Learning & Knowledge Storage',
        description: `✅ Completed: Stored comprehensive ExecutionHistory (individual gate patterns already saved at GATE 1, 2, 3)`,
        status: 'completed'
      },
      {
        id: gate0Required ? 8 : 7,
        title: 'FINAL: Self-Audit Checkpoint',
        description: `...(unchanged)`,
        status: 'in-progress'  // Mark final checkpoint as in-progress
      }
    ]
  })
}

// Helper function to calculate healing success rate
function calculateHealingSuccessRate(results: TestRunState[]): number {
  const healingAttempts = results.filter(r => r.healingAttempted);
  if (healingAttempts.length === 0) return 0;
  
  const successfulHealing = healingAttempts.filter(r => r.healingResult?.status === 'SUCCESS');
  return Math.round((successfulHealing.length / healingAttempts.length) * 100);
}
```

---

## ✅ Validation Rules

### Schema Validation

**After each agent completes, validate output structure:**

1. **Check required fields** - Ensure all mandatory fields are present
2. **Verify data types** - Confirm each field matches expected type
3. **Validate minimums** - Check minimum counts (e.g., at least 1 test case)

**Example validation:**
"I will validate the test cases output has required fields: testId, description, testSteps, expectedResult, and contains at least 1 test case."

### Cross-Agent Consistency

**Verify data flows correctly between gates:**

1. **Test Steps → DOM Mappings** - Every test action must have an element mapping
2. **DOM Mappings → POM Methods** - Every mapped element must have a corresponding POM method
3. **Test Cases → Test Specs** - Every test case must generate executable code

**Example check:**
"I will verify all test steps have DOM mappings and all DOM elements are referenced in the generated Page Object Model."

---

## 🔧 Error Handling

### Agent Invocation Best Practices

**When invoking agents:**

1. **Always set timeouts** - Use natural language to describe: "I will wait up to 60 seconds for the Test Case Designer agent to complete"

2. **Handle agent failures** - If an agent fails:
   - Check if the `.agent` file was created successfully
   - Verify agent instructions exist in `.github/instructions/`
   - Review agent output for errors
   - Log the failure and attempt retry if transient

3. **Retry strategy** - For transient errors:
   - Wait 2 seconds before retry
   - Maximum 3 retry attempts
   - Log each retry attempt

### Checkpoint Recovery

**To resume from checkpoint:**

1. Load checkpoint state from `.state/{requestId}.json`
2. Validate checkpoint integrity
3. Identify next gate to execute
4. Skip completed gates
5. Resume execution from next gate

**Natural Language Example:**
"I found a checkpoint for request ABC123 showing GATE 2 completed. I will skip GATE 0, 1, 2 and resume from GATE 3: Code Generation."

---

## 📚 Examples

### Example 1: Simple Single Test
```json
{
  "type": "full_automation",
  "userStory": "As a user, I can click the login button",
  "url": "https://example.com/login",
  "acceptanceCriteria": [
    "AC-001: Login button is visible and clickable"
  ]
}
```

**Flow:**
- Pre-processing: Validates input, fetches webpage
- GATE 0: SKIPPED (single test detected)
- GATE 1: Generates 1 test case
- GATE 2: Maps login button to locator
- GATE 3: Generates loginPage.ts + login.spec.ts
- GATE 4: Runs test 3x
- GATE 5: Stores patterns

---

### Example 2: Data-Driven Form Testing
```json
{
  "type": "full_automation",
  "userStory": "As a user, I can submit a registration form with different valid and invalid data",
  "url": "https://example.com/register",
  "acceptanceCriteria": [
    "AC-001: Valid data submits successfully",
    "AC-002: Invalid email shows error",
    "AC-003: Missing required field shows error"
  ],
  "dataRequirements": {
    "type": "data-driven",
    "count": 10,
    "seed": 12345
  }
}
```

**Flow:**
- Pre-processing: Validates input, fetches webpage (finds form with 5 input fields)
- GATE 0: EXECUTED (keywords "different", "valid and invalid" detected)
  - Generates 10 test cases (5 valid, 5 invalid)
  - Creates `tests/test-data/example-register-data.json`
- GATE 1: Generates test cases structure
- GATE 2: Maps 5 form fields + submit button
- GATE 3: Generates registerPage.ts + register.spec.ts (using test.each pattern)
- GATE 4: Runs all 10 data sets 3x
- GATE 5: Stores data patterns

---

## 🚫 Critical Constraints

**NEVER:**
- ❌ Skip input validation
- ❌ Proceed if webpage fetch fails without user notification
- ❌ Allow agents to fetch webpage independently (use cached HTML)
- ❌ Generate code without compilation verification
- ❌ Store passwords or sensitive data in memory
- ❌ Overwrite manually customized files without backup
- ❌ Skip Step 0 (memory search) before main execution
- ❌ Skip Step 1 (todo initialization) in orchestration
- ❌ Proceed without querying memory for existing patterns
- ❌ Complete execution without storing learnings in GATE 5

**ALWAYS:**
- ✅ Fetch webpage once in pre-processing
- ✅ Create checkpoints after each gate
- ✅ Validate agent outputs against schemas
- ✅ Check cross-agent consistency
- ✅ Timeout all agent invocations
- ✅ Store learnings in memory
- ✅ Generate audit trail
- ✅ Execute Step 0 (memory search with 3 queries) first
- ✅ Execute Step 1 (todo list initialization) before gates
- ✅ Update todo list after each gate completes
- ✅ Use ExecutionHistory entity in GATE 5 memory storage
- ✅ Output final checkpoint before returning results

---

## ⚠️ MCP ENFORCEMENT RULES

**These are HARD REQUIREMENTS for orchestration - not suggestions:**

### 1. 🛑 MEMORY-FIRST RULE
**Before ANY main execution, you MUST call `mcp_memory_search_nodes` in Step 0 with 3 queries:**
- Query 1: `"{domain} automation patterns"`
- Query 2: `"{domain} {feature} execution history"`
- Query 3: `"{domain} data-driven automation patterns"` (if data-driven keywords detected)

**Penalty for violation:** Pipeline execution is incomplete and cannot learn from past runs.

### 2. 🛑 TODO INITIALIZATION RULE
**Before any gate execution, you MUST call `manage_todo_list` in Step 1 to create tracking list with 7-8 items.**

**Required todo items:**
1. PRE-PROCESSING: Input Validation & Webpage Fetch
2. GATE 0: Data Preparation (conditional)
3. GATE 1: Test Case Design
4. GATE 2: DOM Element Mapping
5. GATE 3: Code Generation
6. GATE 4: Test Execution & Healing
7. GATE 5: Learning & Knowledge Storage
8. FINAL: Self-Audit Checkpoint

**Penalty for violation:** Pipeline progress is not visible and cannot be tracked.

### 3. 🛑 TODO UPDATE RULE
**After EVERY gate completes, you MUST update todo list to mark current gate completed and next gate in-progress.**

**Penalty for violation:** Users cannot see real-time progress.

### 4. 🛑 COMPREHENSIVE LEARNING RULE
**In GATE 5, you MUST store ALL entity types discovered during pipeline:**
- TestPattern (from GATE 1)
- LocatorPattern (from GATE 2)
- CodePattern (from GATE 3)
- ExecutionHistory (from GATE 4) - **MANDATORY**
- HealingPattern (from GATE 4 if healing triggered)

**Penalty for violation:** Future pipeline runs cannot benefit from this execution's learnings.

### 5. 🛑 FINAL CHECKPOINT RULE
**After GATE 5, you MUST execute final checkpoint that verifies:**
- All MCPs executed (Step 0, Step 1, GATE 5 storage, todo updates)
- All deliverables exist (page objects, test specs, fixtures)
- Quality metrics calculated (coverage, confidence, pass rate)
- Overall status determined (SUCCESS/PARTIAL/FAILED)
- Todo list marked all items completed

**Penalty for violation:** Pipeline completion is not auditable and quality cannot be verified.

---

## 🏁 FINAL: Self-Audit Checkpoint

After GATE 5 completes, the orchestration agent must perform a comprehensive self-audit before returning results to the user.

```typescript
async function executeFinalCheckpoint(
  allGateOutputs: Record<number, any>,
  metadata: Metadata,
  request: PipelineRequest,
  gate0Required: boolean
): Promise<OrchestrationResult> {
  logger.info('🏁 FINAL: Self-Audit Checkpoint');
  
  // STEP 1: Verify all mandatory MCPs were executed
  const mcpChecklist = {
    step0_memorySearch: true,  // Verified in PRE-PROCESSING
    step1_todoInitialization: true,  // Verified in PRE-PROCESSING
    gate0_execution: gate0Required ? (allGateOutputs[0] !== undefined) : true,
    gate1_testDesign: allGateOutputs[1] !== undefined,
    gate2_domMapping: allGateOutputs[2] !== undefined,
    gate3_codeGeneration: allGateOutputs[3] !== undefined,
    gate4_execution: allGateOutputs[4] !== undefined,
    gate5_memoryStorage: true,  // Just completed
    todoUpdates: true  // Verified throughout
  };
  
  const allMCPsComplete = Object.values(mcpChecklist).every(v => v === true);
  
  // STEP 2: Validate deliverables
  const deliverables = {
    pageObjects: allGateOutputs[3]?.pageObjects || [],
    testSpecs: allGateOutputs[3]?.testSpecs || [],
    dataFiles: allGateOutputs[0]?.dataFile ? [allGateOutputs[0].dataFile] : [],
    fixtures: allGateOutputs[3]?.fixtures || []
  };
  
  const deliverablesValid = 
    deliverables.pageObjects.length > 0 &&
    deliverables.testSpecs.length > 0 &&
    deliverables.fixtures.length > 0;
  
  // STEP 3: Calculate quality metrics
  const qualityMetrics = {
    testCoverage: calculateCoverage(allGateOutputs[1], request.acceptanceCriteria),
    locatorConfidence: calculateAverageConfidence(allGateOutputs[2]),
    compilationSuccess: allGateOutputs[3]?.compilationErrors === 0,
    executionPassRate: allGateOutputs[4]?.finalStatus.passRate || 0,
    overallScore: 0  // Will calculate below
  };
  
  qualityMetrics.overallScore = Math.round(
    (qualityMetrics.testCoverage * 0.25) +
    (qualityMetrics.locatorConfidence * 0.25) +
    (qualityMetrics.compilationSuccess ? 25 : 0) +
    (qualityMetrics.executionPassRate * 0.25)
  );
  
  // STEP 4: Determine overall status
  let overallStatus: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  
  if (!allMCPsComplete || !deliverablesValid) {
    overallStatus = 'FAILED';
  } else if (qualityMetrics.overallScore >= 70) {
    overallStatus = 'SUCCESS';
  } else if (qualityMetrics.overallScore >= 50) {
    overallStatus = 'PARTIAL';
  } else {
    overallStatus = 'FAILED';
  }
  
  // STEP 5: Generate comprehensive checkpoint
  const checkpoint = `
**✅ CHECKPOINT: Pipeline Completion - ${overallStatus}**

**MCP Execution Audit:**
✅ Step 0: Memory Search - Queried automation patterns, execution history, data-driven patterns
✅ Step 1: Todo List Initialization - Created ${gate0Required ? 8 : 7} gate items
${gate0Required ? '✅' : '⏭️'} GATE 0: Data Preparation - ${gate0Required ? `Generated ${allGateOutputs[0]?.totalCases || 0} test data sets` : 'SKIPPED (single test case)'}
✅ GATE 1: Test Case Design - ${allGateOutputs[1]?.testCases.length || 0} test cases, ${qualityMetrics.testCoverage}% coverage
✅ GATE 2: DOM Element Mapping - ${allGateOutputs[2]?.elementMappings.length || 0} elements, avg ${qualityMetrics.locatorConfidence}% confidence
✅ GATE 3: Code Generation - ${deliverables.pageObjects.length} page objects, ${deliverables.testSpecs.length} test specs
✅ GATE 4: Test Execution - ${allGateOutputs[4]?.results.length || 0} runs, ${qualityMetrics.executionPassRate}% pass rate
✅ GATE 5: Memory Storage - ${allGateOutputs[4]?.results.some(r => r.healingAttempted) ? '5' : '4'} knowledge entities stored
✅ Todo Updates: All gates tracked and marked complete

**Deliverables:**
- Page Objects: ${deliverables.pageObjects.join(', ')}
- Test Specs: ${deliverables.testSpecs.join(', ')}
${deliverables.dataFiles.length > 0 ? `- Data Files: ${deliverables.dataFiles.join(', ')}` : ''}
- Fixtures: ${deliverables.fixtures.join(', ')}

**Quality Metrics:**
- Test Coverage: ${qualityMetrics.testCoverage}%
- Locator Confidence: ${qualityMetrics.locatorConfidence}%
- Compilation: ${qualityMetrics.compilationSuccess ? 'SUCCESS' : 'FAILED'}
- Execution Pass Rate: ${qualityMetrics.executionPassRate}%
- **Overall Score: ${qualityMetrics.overallScore}/100**

**Missing Steps:** ${allMCPsComplete && deliverablesValid ? 'NONE - All steps completed successfully' : 'See issues below'}

${!allMCPsComplete ? '⚠️ INCOMPLETE MCPs DETECTED - Review checklist above' : ''}
${!deliverablesValid ? '⚠️ DELIVERABLES INCOMPLETE - Some files missing' : ''}

**ACTION:** ${overallStatus === 'SUCCESS' ? 'Pipeline complete - ready for use' : overallStatus === 'PARTIAL' ? 'Pipeline complete with warnings - review quality metrics' : 'Pipeline failed - review errors and retry'}
`;
  
  logger.info(checkpoint);
  
  // STEP 6: Update todo list - mark final checkpoint as completed
  await manage_todo_list({
    operation: 'write',
    todoList: [
      {
        id: 1,
        title: 'PRE-PROCESSING: Input Validation & Webpage Fetch',
        description: '✅ Completed',
        status: 'completed'
      },
      gate0Required ? {
        id: 2,
        title: 'GATE 0: Data Preparation',
        description: '✅ Completed',
        status: 'completed'
      } : null,
      {
        id: gate0Required ? 3 : 2,
        title: 'GATE 1: Test Case Design',
        description: '✅ Completed',
        status: 'completed'
      },
      {
        id: gate0Required ? 4 : 3,
        title: 'GATE 2: DOM Element Mapping',
        description: '✅ Completed',
        status: 'completed'
      },
      {
        id: gate0Required ? 5 : 4,
        title: 'GATE 3: Code Generation',
        description: '✅ Completed',
        status: 'completed'
      },
      {
        id: gate0Required ? 6 : 5,
        title: 'GATE 4: Test Execution & Healing',
        description: '✅ Completed',
        status: 'completed'
      },
      {
        id: gate0Required ? 7 : 6,
        title: 'GATE 5: Learning & Knowledge Storage',
        description: '✅ Completed',
        status: 'completed'
      },
      {
        id: gate0Required ? 8 : 7,
        title: 'FINAL: Self-Audit Checkpoint',
        description: `✅ Completed: ${overallStatus} - Overall score ${qualityMetrics.overallScore}/100`,
        status: 'completed'
      }
    ].filter(Boolean)
  });
  
  // STEP 7: Return comprehensive result
  const result: OrchestrationResult = {
    status: overallStatus,
    requestId: metadata.requestId,
    executionTimeMs: Date.now() - metadata.startTime,
    pipeline: {
      preProcessing: {
        status: 'COMPLETE',
        executionTimeMs: metadata.preProcessingTime,
        validationScore: 1.0,
        issues: []
      },
      gate0: gate0Required ? {
        status: 'COMPLETE',
        agent: 'TestCaseDesigner',
        executionTimeMs: metadata.gate0Time,
        outputData: allGateOutputs[0],
        validationScore: 1.0,
        issues: []
      } : {
        status: 'SKIPPED',
        executionTimeMs: 0,
        validationScore: 1.0,
        issues: []
      },
      gate1: {
        status: 'COMPLETE',
        agent: 'TestCaseDesigner',
        executionTimeMs: metadata.gate1Time,
        outputData: allGateOutputs[1],
        validationScore: qualityMetrics.testCoverage / 100,
        issues: []
      },
      gate2: {
        status: 'COMPLETE',
        agent: 'DOMAgent',
        executionTimeMs: metadata.gate2Time,
        outputData: allGateOutputs[2],
        validationScore: qualityMetrics.locatorConfidence / 100,
        issues: []
      },
      gate3: {
        status: 'COMPLETE',
        agent: 'POMAgent',
        executionTimeMs: metadata.gate3Time,
        outputData: allGateOutputs[3],
        validationScore: qualityMetrics.compilationSuccess ? 1.0 : 0.0,
        issues: []
      },
      gate4: {
        status: allGateOutputs[4].finalStatus.passRate >= 70 ? 'COMPLETE' : 'PARTIAL',
        agent: 'Execution + HealerAgent',
        executionTimeMs: metadata.gate4Time,
        outputData: allGateOutputs[4],
        validationScore: qualityMetrics.executionPassRate / 100,
        issues: allGateOutputs[4].finalStatus.failedTests > 0 ? [`${allGateOutputs[4].finalStatus.failedTests} tests failed`] : []
      },
      gate5: {
        status: 'COMPLETE',
        agent: 'Orchestration',
        executionTimeMs: metadata.gate5Time,
        validationScore: 1.0,
        issues: []
      }
    },
    deliverables: deliverables,
    auditTrail: `${metadata.domain}-${metadata.feature}-ExecutionHistory`
  };
  
  return result;
}

// Helper functions
function calculateAverageConfidence(elementMappings: ElementMappings): number {
  const scores = elementMappings.elementMappings.map(em => em.locators.primary.confidenceScore);
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
}
```

---

## 🔗 Dependencies

### What Orchestration Provides to Agents:

| Agent | Receives From Orchestration |
|-------|---------------------------|
| Test Case Designer | `cachedHTML`, `dataStrategy decision`, `metadata` |
| DOM Agent | `testCases`, `cachedHTML`, `metadata` |
| POM Agent | `testCases`, `elementMappings`, `dataStrategy` |
| Healer Agent | `failedTest`, `executionHistory`, `cachedHTML` |

### What Orchestration Expects from Agents:

All agents must return the standard output format with `status`, `executionTimeMs`, `validationResult`, etc.

---

## 🎓 Summary: Orchestration Flow

```
User Request
     ↓
[VALIDATE INPUT] - Sanitize, security check
     ↓
[FETCH WEBPAGE] - Once, cache for all agents
     ↓
[DECIDE GATE 0] - Data-driven needed?
     ↓
[GATE 0] (conditional) - Test Data Preparation
     ↓
[GATE 1] - Test Case Design
     ↓
[VALIDATE COVERAGE] - 80% minimum
     ↓
[GATE 2] - DOM Element Mapping
     ↓
[VALIDATE COMPLETENESS] - All steps mapped
     ↓
[GATE 3] - Code Generation
     ↓
[VALIDATE COMPILATION] - No TypeScript errors
     ↓
[GATE 4] - Execute Tests (3x with healing)
     ↓
[GATE 5] - Store Learnings
     ↓
[GENERATE AUDIT] - Full trace
     ↓
[RETURN DELIVERABLES] - Files + metadata
```

