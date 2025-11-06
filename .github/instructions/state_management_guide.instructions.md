---
applyTo: '**/*.agent,**'
description: 'State Management Guide - Structured gate output persistence and retrieval - Version 2.0'
---

# 🗄️ STATE MANAGEMENT GUIDE

## 🎯 Purpose
This guide defines the standardized approach for persisting gate outputs to `.state/` files and retrieving previous gate data in Step 0. This enables crash recovery, data validation, and independent agent execution.

---

## 📋 Core Concepts

### **Dual-Output System**

Every agent produces TWO outputs:

1. **Structured State File** (`.state/{requestId}-gate{N}-output.json`)
   - Machine-readable JSON format
   - Contains complete gate output with metadata
   - Used by next gate to load input data
   - Enables crash recovery and debugging

2. **Markdown Checkpoint** (logged to console)
   - Human-readable audit trail
   - Shows MCPs executed and quality metrics
   - Displayed to users for transparency

### **Data Flow Pattern**

```
GATE 1 (Test Case Designer)
  ↓ writes .state/{requestId}-gate1-output.json
  ↓
GATE 2 (DOM Analysis) 
  Step 0B: reads .state/{requestId}-gate1-output.json
  ↓ writes .state/{requestId}-gate2-output.json
  ↓
GATE 3 (POM Generator)
  Step 0B: reads .state/{requestId}-gate2-output.json
  ↓ writes .state/{requestId}-gate3-output.json
  ↓
GATE 4 (Test Execution)
  Step 0B: reads .state/{requestId}-gate3-output.json
  ↓ writes .state/{requestId}-gate4-output.json
```

---

## 📐 Standardized State File Schema

**NOTE: This TypeScript interface shows the structure - your output should be JSON matching this schema**

```typescript
interface GateStateFile {
  // Identity
  gate: number;                // 0, 1, 2, 3, or 4
  agent: string;               // "TestCaseDesigner", "DOMAgent", "POMAgent", "ExecutionEngine"
  
  // Execution Status
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  
  // Metadata (for queries and file naming)
  metadata: {
    domain: string;            // Sanitized domain (e.g., "demoqa_com")
    feature: string;           // Sanitized feature (e.g., "student_registration")
    url: string;               // Original URL
  };
  
  // Gate-Specific Output (matches agent's Output Contract)
  output: any;                 // TestCasesOutput | ElementMappings | GeneratedCode | ExecutionResults
  
  // Quality Metrics
  validation: {
    score: number;             // 0-100 (percentage)
    issues: string[];          // List of validation warnings/errors
    passed: boolean;           // true if score >= threshold
  };
}
```

---

## 📁 File Naming Convention

### **Directory Structure**

```
.state/
├── {domain}-{feature}-pipeline.json          # Orchestration master state
├── {domain}-{feature}-gate0-output.json      # Data preparation (conditional)
├── {domain}-{feature}-gate1-output.json      # Test case design
├── {domain}-{feature}-gate2-output.json      # DOM element mapping
├── {domain}-{feature}-gate3-output.json      # Code generation
└── {domain}-{feature}-gate4-output.json      # Execution results
```

### **Naming Rules**

- **Format:** `{domain}-{feature}-gate{N}-output.json`
- **domain:** Sanitized domain name (e.g., "demoqa_com")
- **feature:** Sanitized feature name (e.g., "student_registration")
- **gate:** Number 0-4 (matches gate number)
- **Extension:** Always `.json`

### **Pipeline State File**

```typescript
interface PipelineStateFile {
  status: 'IN_PROGRESS' | 'SUCCESS' | 'PARTIAL' | 'FAILED';
  currentGate: number;         // 0-5 (which gate is executing now)
  completedGates: number[];    // Array of completed gate numbers
  metadata: {
    domain: string;
    feature: string;
    url: string;
    userStory: string;
    acceptanceCriteria: string[];
  };
}
```

---

## 🔄 Agent Implementation Pattern

### **Step 0B: Load Previous Gate Output (NEW)**

**When:** ALWAYS after Step 0A (memory queries), before main execution

**Purpose:** Load structured output from previous gate for processing

**Implementation Pattern:**

```typescript
// Step 0B: Load Previous Gate Output
logger.info('📂 Step 0B: Loading previous gate output from state file')

const currentGate = {gateNumber}  // 1, 2, 3, or 4
const previousGate = currentGate - 1
const previousGateFile = `.state/{requestId}-gate${previousGate}-output.json`

let previousGateData = null

try {
  // Attempt to read previous gate's state file
  const fileContent = await read_file(previousGateFile, 1, 10000)
  const previousGateState = JSON.parse(fileContent)
  
  // Validate status
  if (previousGateState.status === 'SUCCESS' || previousGateState.status === 'PARTIAL') {
    previousGateData = previousGateState.output
    logger.info(`✅ Loaded previous gate ${previousGate} output from ${previousGateState.agent}`)
    logger.info(`   Status: ${previousGateState.status}, Score: ${previousGateState.validation.score}%`)
    
    // Validate expected structure
    if (!validatePreviousGateOutput(previousGateData)) {
      logger.error('❌ Previous gate output format is invalid')
      throw new Error('Invalid previous gate output structure')
    }
  } else {
    logger.warn(`⚠️ Previous gate ${previousGate} status: ${previousGateState.status}`)
    logger.warn('   Proceeding with caution - previous gate may have issues')
  }
  
} catch (error) {
  logger.info(`ℹ️ No previous gate state file found: ${previousGateFile}`)
  logger.info('   This is normal if orchestration is providing input directly')
  // Agent should fall back to using input from orchestration
}

// Use previousGateData if available, otherwise use input from orchestration
const dataToProcess = previousGateData || input.{relevantField}
```

**Validation Functions (examples):**

```typescript
// GATE 2: Validate test cases from GATE 1
function validatePreviousGateOutput(data: any): boolean {
  return Array.isArray(data.testCases) && 
         data.testCases.length > 0 &&
         data.testCases.every(tc => tc.testId && tc.testSteps)
}

// GATE 3: Validate element mappings from GATE 2
function validatePreviousGateOutput(data: any): boolean {
  return Array.isArray(data.elementMappings) &&
         data.elementMappings.length > 0 &&
         data.elementMappings.every(em => em.locators?.primary)
}
```

---

### **Step N-1: Write State File (NEW)**

**When:** After main execution completes, BEFORE memory storage step

**Purpose:** Persist gate output to structured JSON file for next gate

**Implementation Pattern:**

```typescript
// Step {N-1}: Write State File
logger.info('📝 Step {N-1}: Writing gate output to state file')

const gateStateFile = {
  gate: {gateNumber},
  agent: '{AgentName}',
  status: output.validationResult.score >= {threshold} ? 'SUCCESS' : 'PARTIAL',
  metadata: {
    domain: '{domain}',
    feature: '{feature}',
    url: input.url
  },
  output: output,  // Complete output object matching Output Contract
  validation: {
    score: output.validationResult.score,
    issues: output.validationResult.issues,
    passed: output.validationResult.passed
  }
}

await create_file(
  `.state/{domain}-{feature}-gate{gateNumber}-output.json`,
  JSON.stringify(gateStateFile, null, 2)
)

logger.info(`✅ State file created: .state/{domain}-{feature}-gate${gateNumber}-output.json`)
logger.info(`   Status: ${gateStateFile.status}, Score: ${gateStateFile.validation.score}%`)
```

---

## 🎯 Gate-Specific Schemas

### **GATE 0: Data Preparation Output**

```typescript
{
  gate: 0,
  agent: "TestCaseDesigner",
  status: "SUCCESS",
  metadata: {
    domain: "demoqa_com",
    feature: "student_registration",
    url: "https://demoqa.com/automation-practice-form"
  },
  output: {
    dataFile: "tests/test-data/demoqa_com-student_registration-data.json",
    totalCases: 5,
    breakdown: {
      valid: 3,
      invalid: 1,
      boundary: 1,
      edge: 0
    },
    seed: 12345
  },
  validation: {
    score: 100,
    issues: [],
    passed: true
  }
}
```

### **GATE 1: Test Case Design Output**

```typescript
{
  gate: 1,
  agent: "TestCaseDesigner",
  status: "SUCCESS",
  metadata: {
    domain: "demoqa_com",
    feature: "student_registration",
    url: "https://demoqa.com/automation-practice-form"
  },
  output: {
    testCases: [
      {
        testId: "TC_001",
        description: "Verify student registration with valid data",
        priority: "high",
        testType: "positive",
        testSteps: [
          {
            stepNumber: 1,
            action: "Enter first name",
            target: "firstName input field",
            data: "John"
          }
          // ... more steps
        ],
        expectedResult: {
          status: "pass",
          assertions: [
            { type: "url", target: "contains /success" }
          ]
        }
      }
      // ... more test cases
    ],
    dataStrategy: {
      type: "data-driven",
      dataFile: "tests/test-data/demoqa_com-student_registration-data.json",
      totalCases: 5
    }
  },
  validation: {
    score: 95,
    issues: [],
    passed: true
  }
}
```

### **GATE 2: DOM Element Mapping Output**

```typescript
{
  gate: 2,
  agent: "DOMAgent",
  status: "SUCCESS",
  metadata: {
    domain: "demoqa_com",
    feature: "student_registration",
    url: "https://demoqa.com/automation-practice-form"
  },
  output: {
    elementMappings: [
      {
        logicalName: "firstNameInput",
        locators: {
          primary: {
            type: "id",
            value: "firstName",
            confidenceScore: 0.95
          },
          fallbacks: [
            { type: "placeholder", value: "First Name", confidenceScore: 0.85 },
            { type: "xpath", value: "//input[@placeholder='First Name']", confidenceScore: 0.80 }
          ]
        }
      }
      // ... more elements
    ],
    isSPA: false,
    specialComponents: []
  },
  validation: {
    score: 87,
    issues: ["2 elements have confidence < 80%"],
    passed: true
  }
}
```

### **GATE 3: Code Generation Output**

```typescript
{
  gate: 3,
  agent: "POMAgent",
  status: "SUCCESS",
  metadata: {
    domain: "demoqa_com",
    feature: "student_registration",
    url: "https://demoqa.com/automation-practice-form"
  },
  output: {
    files: [
      "tests/test-objects/pages/studentRegistrationPage.ts",
      "tests/tests-management/gui/student_registration/register.spec.ts"
    ],
    pageObjects: ["studentRegistrationPage"],
    testSpecs: ["register.spec.ts"],
    testPattern: "data-driven",
    compilationErrors: 0
  },
  validation: {
    score: 100,
    issues: [],
    passed: true
  }
}
```

### **GATE 4: Execution Results Output**

```typescript
{
  gate: 4,
  agent: "ExecutionEngine",
  status: "SUCCESS",
  metadata: {
    domain: "demoqa_com",
    feature: "student_registration",
    url: "https://demoqa.com/automation-practice-form"
  },
  output: {
    results: [
      {
        runNumber: 1,
        status: "PASS",
        passedTests: 5,
        failedTests: 0
      },
      {
        runNumber: 2,
        status: "PASS",
        passedTests: 5,
        failedTests: 0
      },
      {
        runNumber: 3,
        status: "PASS",
        passedTests: 5,
        failedTests: 0
      }
    ],
    finalStatus: {
      passRate: 100,
      avgExecutionTime: 8500,
      failedTests: 0
    }
  },
  validation: {
    score: 100,
    issues: [],
    passed: true
  }
}
```

---

## 🔄 Orchestration Integration

### **PRE-PROCESSING: Create Pipeline State**

```typescript
// After input validation, create master pipeline state
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
```

### **After Each Gate: Update Pipeline State**

```typescript
// After GATE N completes successfully
const pipelineStateFile = `.state/${metadata.domain}-${metadata.feature}-pipeline.json`
const pipelineState = JSON.parse(await read_file(pipelineStateFile, 1, 1000))

pipelineState.currentGate = N
pipelineState.completedGates.push(N)

await create_file(
  pipelineStateFile,
  JSON.stringify(pipelineState, null, 2)
)

logger.info(`✅ Pipeline state updated: Gate ${N} completed`)
```

### **FINAL: Mark Pipeline Complete**

```typescript
// After GATE 5 (learning) completes
const pipelineStateFile = `.state/${metadata.domain}-${metadata.feature}-pipeline.json`
const pipelineState = JSON.parse(await read_file(pipelineStateFile, 1, 1000))

pipelineState.status = overallStatus  // 'SUCCESS', 'PARTIAL', or 'FAILED'
pipelineState.currentGate = 5
pipelineState.completedGates.push(5)

await create_file(
  pipelineStateFile,
  JSON.stringify(pipelineState, null, 2)
)

logger.info(`✅ Pipeline complete: ${overallStatus}`)
```

### **Pass requestId to Agents**

When invoking agents, include metadata in input:

```json
{
  "metadata": {
    "domain": "demoqa_com",
    "feature": "student_registration"
  },
  "userStory": "...",
  "url": "...",
  "acceptanceCriteria": [...]
}
```

---

## 🔍 Crash Recovery Pattern

### **Resuming from Checkpoint**

```typescript
// Load pipeline state
const pipelineState = JSON.parse(
  await read_file(`.state/${domain}-${feature}-pipeline.json`, 1, 1000)
)

logger.info(`🔄 Resuming pipeline from Gate ${pipelineState.currentGate}`)
logger.info(`   Completed gates: ${pipelineState.completedGates.join(', ')}`)

// Skip completed gates
const gatesToExecute = [0, 1, 2, 3, 4, 5].filter(
  gate => !pipelineState.completedGates.includes(gate)
)

logger.info(`   Will execute: ${gatesToExecute.join(', ')}`)

// Resume execution from first incomplete gate
for (const gate of gatesToExecute) {
  await executeGate(gate, pipelineState.metadata)
}
```

---

## ✅ Implementation Checklist

### **For Each Agent:**

- [ ] **Step 0B: Load Previous Gate Output** - After memory queries, load previous gate's state file
- [ ] **Step N-1: Write State File** - Before memory storage, write current gate output to state file
- [ ] **Update Self-Audit Checkpoint** - Include state file creation in MCP checklist
- [ ] **Reference This Guide** - Add reference to `state_management_guide.instructions.md` in Step 0B section

### **For Orchestration:**

- [ ] **PRE-PROCESSING: Create Pipeline State** - Initialize master pipeline state file
- [ ] **After Each Gate: Update Pipeline State** - Mark gate as completed in pipeline state
- [ ] **Pass requestId to Agents** - Include requestId in agent input metadata
- [ ] **FINAL: Mark Pipeline Complete** - Update pipeline state with final status

---

## 🚫 Critical Rules

**NEVER:**
- ❌ Skip writing state files (even if gate fails - write FAILED status)
- ❌ Overwrite state files without reading first (always create new file)
- ❌ Store sensitive data in state files (passwords, API keys)
- ❌ Use relative paths for state files (always use `.state/` directory)
- ❌ Parse JSON without try-catch (file may be corrupted)

**ALWAYS:**
- ✅ Write state file BEFORE memory storage
- ✅ Use consistent domain-feature naming pattern
- ✅ Validate previous gate output structure before using
- ✅ Log state file operations (create, read, validate)
- ✅ Include validation score in state files
- ✅ Check if previous gate state file exists before reading

---

## 📊 Benefits Summary

1. ✅ **Crash Recovery** - Resume pipeline from any gate
2. ✅ **Data Validation** - Verify previous gate output before processing
3. ✅ **Independent Execution** - Agents can run standalone with state files
4. ✅ **Complete Audit Trail** - Every gate's input/output persisted
5. ✅ **Debugging** - Inspect exact data passed between gates
6. ✅ **Testing** - Mock gate inputs by creating test state files
7. ✅ **LLM-Friendly** - JSON format is easy to parse and understand

---

## 📌 Version History

- **v2.0** (2025-11-06): Initial state management guide with dual-output system
