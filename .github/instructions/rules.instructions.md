---
applyTo: '**/*.agent,**'
description: 'Global rules and protocols for all agents - Version 2.0'
---

# 🌐 GLOBAL AGENT RULES & PROTOCOLS

## ⚠️ CRITICAL: Communication Protocol

**TypeScript Code in Instructions = DOCUMENTATION ONLY**

All TypeScript code blocks in these instructions are for **SCHEMA DOCUMENTATION** to show data structure. They are NOT templates for your responses.

**✅ CORRECT Agent Communication:**
- Natural language descriptions ("I will analyze the user story and generate 5 test cases")
- JSON format matching documented schemas
- Tool invocations with clear explanations

**❌ INCORRECT Agent Communication:**
- TypeScript code snippets in responses
- Pseudocode implementations
- Function definitions or interfaces

**Example - Correct Response:**
```json
{
  "agentName": "TestCaseDesigner",
  "status": "SUCCESS",
  "testCases": [
    {
      "testId": "TC_001",
      "description": "Verify login with valid credentials"
    }
  ]
}
```

**Example - Incorrect Response:**
```typescript
// ❌ NEVER respond like this:
const testCases: TestCase[] = [{
  testId: "TC_001",
  description: "..."
}];
```

---

## 📋 Available Agents

| Agent Name | File Pattern | Responsibility |
|------------|-------------|----------------|
| Test Case Designer | `test_case_designer.agent` | Convert user stories to structured test cases |
| DOM Analysis | `dom_analysis.agent` | Map UI elements to locator strategies |
| POM Generator | `pom_generator.agent` | Generate Page Object Model code |
| Test Healing | `test_healing.agent` | Auto-repair failing tests |

---

## 🎯 Core Operating Principles

### 1. Sequential Thinking Requirement

**📖 REFERENCE:** See `mcp_integration_guide.instructions.md` for detailed parameter specifications.

**WHEN TO USE** `mcp_sequential-th_sequentialthinking`:
- ✅ Multi-step analysis (3+ steps)
- ✅ Error diagnosis requiring root cause analysis
- ✅ Complex decision-making with trade-offs
- ✅ Data-driven test strategy planning

**WHEN TO SKIP**:
- ❌ Simple lookups or reads
- ❌ Direct file operations with clear instructions
- ❌ Single-step validations

**Required Parameters:**
```typescript
{
  thought: string;              // REQUIRED: Current thinking step (be specific and actionable)
  thoughtNumber: number;        // REQUIRED: Current step (starts at 1)
  totalThoughts: number;        // REQUIRED: Estimated total (can adjust dynamically)
  nextThoughtNeeded: boolean;   // REQUIRED: true if more analysis needed, false when done
  isRevision?: boolean;         // OPTIONAL: true if revising previous thought
  revisesThought?: number;      // OPTIONAL: Which thought is being reconsidered
  branchFromThought?: number;   // OPTIONAL: Branch point for alternatives
  branchId?: string;            // OPTIONAL: Branch identifier (e.g., "approach-A")
  needsMoreThoughts?: boolean;  // OPTIONAL: true if realizing need for more steps
}
```

**Minimum Thoughts Required**: 3 (analysis → solution → verification)

---

### 2. Memory-First Protocol

**📖 REFERENCE:** See `mcp_integration_guide.instructions.md` for query patterns and storage examples.

**MANDATORY STEP 0 for ALL Agents:**

Before executing main workflow, MUST query memory for existing patterns:

```typescript
// STEP 0: Query memory (MANDATORY)
const patterns = await mcp_memory_search_nodes({
  query: "{domain} {feature} patterns"  // Customize per agent
})

if (patterns.entities.length > 0) {
  logger.info(`Found ${patterns.entities.length} existing patterns - using learned knowledge`)
  // Apply learned patterns to current execution
} else {
  logger.info('No existing patterns found - will learn during execution')
}
```

**Query Pattern Templates by Agent:**
- **Test Case Designer:** `"{domain} {feature} test patterns"`
- **DOM Agent:** `"{domain} locator patterns"` + `"component-type interaction patterns"`
- **POM Generator:** `"{feature} page object patterns"` + `"self-healing wrapper patterns"`
- **Test Healing:** `"error-type solution patterns {domain}"`
- **Orchestration:** `"{domain} automation patterns"` + `"{domain} {feature} execution history"`

**MANDATORY: Store Learnings After Success:**

```typescript
await mcp_memory_create_entities({
  entities: [{
    name: "{domain}-{feature}-{PatternType}",  // Unique identifier
    entityType: "TestPattern|LocatorPattern|CodePattern|ErrorSolution|ExecutionHistory",
    observations: [
      "Key fact 1 with details",
      "Key fact 2 with context",
      "Captured at: {phase} completion"
    ]
  }]
})
```

---

### 3. Instruction Adherence Protocol

**Priority Order:**
1. Agent-specific instructions (highest priority)
2. Global rules (this file)
3. General copilot instructions (lowest priority)

**Conflict Resolution:**
```
IF agent-specific instruction conflicts with global rule:
  → Follow agent-specific instruction
  → Log conflict for review

IF unclear instruction:
  → Use sequential thinking to analyze ambiguity
  → Choose most conservative interpretation
  → Document assumption in output
```

---

### 3. Agent Invocation Protocol

**File Naming Convention:**
```
<agent_name>.agent
```

**Invocation Steps:**
1. Create EMPTY file with `.agent` extension in `.github/agents/`
2. System reads empty file
3. System locates matching instructions via `applyTo` pattern
4. Agent activates with matched instructions ONLY
5. Agent ignores all other instructions

**Example:**
```bash
# To invoke Test Case Designer:
touch .github/agents/test_case_designer.agent

# System automatically:
# - Finds test_case_desinger.agent.instructions.md
# - Loads only those instructions
# - Executes agent in isolation
```

---

## 🚨 Failure Handling Protocol

### Error Classification

| Error Type | Action | Max Retries | Escalation |
|------------|--------|-------------|------------|
| Input Validation | Return error immediately | 0 | User |
| Transient (timeout, network) | Retry with backoff | 3 | Orchestration |
| Agent Logic Error | Log + use fallback strategy | 1 | Orchestration |
| Critical System Error | Abort pipeline | 0 | User |

### Escalation Chain

```
Agent Error
    ↓
Log to Audit Trail
    ↓
Retry if transient (max 3x)
    ↓
If still failing → Notify Orchestration
    ↓
Orchestration decides: fallback OR abort
    ↓
If abort → Checkpoint state for resume
    ↓
Return detailed error to user
```

---

## 📊 Output Standards

### Required Fields in ALL Agent Outputs

**IMPORTANT: Return as JSON, NOT TypeScript code**

```typescript
// This TypeScript block shows the SCHEMA you should follow
// Your actual output should be JSON matching this structure
{
  agentName: string;           // e.g., "TestCaseDesigner"
  version: string;             // e.g., "2.0"
  timestamp: string;           // ISO 8601 format
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  executionTimeMs: number;
  outputData: any;             // Agent-specific output
  validationResult: {
    passed: boolean;
    score: number;             // 0.0 - 1.0
    issues: string[];
  };
  metadata: {
    inputHash: string;         // For caching
    dependencies: string[];    // Other agents used
  };
}
```

---

## ⚠️ MCP ENFORCEMENT RULES

**These are HARD REQUIREMENTS - not suggestions:**

### 1. 🛑 MEMORY-FIRST RULE
**Before ANY main execution, you MUST call `mcp_memory_search_nodes` to query existing patterns.**

```typescript
// MANDATORY: Step 0 for all agents
const patterns = await mcp_memory_search_nodes({
  query: "{appropriate pattern query}"
})
```

**Penalty for violation:** Agent execution is incomplete. You MUST restart with memory query.

### 2. 🛑 PLANNING RULE
**Before complex operations (3+ steps), you MUST use `mcp_sequential-th_sequentialthinking` to plan approach.**

```typescript
// MANDATORY: Before complex execution
await mcp_sequential-th_sequentialthinking({
  thought: "Detailed analysis of what needs to be done and how",
  thoughtNumber: 1,
  totalThoughts: 3,  // Minimum 3 thoughts required
  nextThoughtNeeded: true
})
```

**Penalty for violation:** Decision-making lacks transparency and auditability.

### 3. 🛑 LEARNING RULE
**After EVERY successful completion or learning, you MUST store patterns in memory.**

```typescript
// MANDATORY: After completion
await mcp_memory_create_entities({
  entities: [/* all patterns discovered */]
})
```

**Penalty for violation:** Knowledge is lost, future runs cannot benefit from learnings.

### 4. 🛑 CHECKPOINT RULE
**After each major step, you MUST output a self-audit checklist showing completed MCPs.**

```markdown
**✅ CHECKPOINT: {Phase Name}**

Required MCPs for this phase:
✅ mcp_memory_search_nodes - Queried {pattern type}
✅ mcp_sequential-th_sequentialthinking - Planned approach (3 thoughts)
✅ {other required tools} - {status}

MISSING STEPS: {list any incomplete items}

ACTION: {If any missing: "Going back to complete" | If all complete: "Proceeding to next phase"}
```

**Penalty for violation:** Execution flow is not auditable and may have skipped steps.

### 5. 🛑 PARAMETER COMPLETENESS RULE
**All MCP tool calls MUST include ALL required parameters with meaningful values.**

**Penalty for violation:** Tool call will fail or produce incomplete results.

**📖 REFERENCE:** See `mcp_integration_guide.instructions.md` for complete parameter specifications for each tool.

---

## 🔒 Security & Safety Rules

1. **Input Sanitization**: All user inputs MUST be sanitized for:
   - File path traversal (`../`, absolute paths)
   - Command injection (`;`, `&&`, `|`)
   - XSS in generated code (`<script>`, `eval()`)

2. **File Operations**: 
   - Always use absolute paths
   - Validate file exists before reading
   - Use atomic writes (temp file → rename)

3. **External Calls**:
   - Timeout all fetch operations (30s default)
   - Validate URLs before fetching
   - Handle authentication failures gracefully

---

## 🧪 Testing Requirements

Every agent MUST:
1. Validate inputs before processing
2. Produce deterministic outputs (same input → same output)
3. Include example inputs/outputs in instructions
4. Define success criteria measurably

---

## 📝 Documentation Standards

All agent instructions MUST include:
- ✅ Role & Responsibility (one sentence)
- ✅ Input Contract (TypeScript-style schema)
- ✅ Output Contract (TypeScript-style schema)
- ✅ Execution Workflow (numbered steps)
- ✅ Validation Rules (how to verify success)
- ✅ Error Handling (classification + recovery)
- ✅ Examples (minimum 2: simple + complex)
- ✅ Critical Constraints (what NOT to do)
- ✅ Dependencies (what agent needs from others)

---

## 🔄 State Management

### Checkpointing Rules

**When to Checkpoint:**
- After each GATE completion in Orchestration
- Before any destructive operation (file write/delete)
- After agent completes successfully

**Checkpoint Structure:**
```typescript
{
  pipelineId: string;
  currentGate: number;
  completedGates: number[];
  gateOutputs: Record<number, any>;
  timestamp: string;
  resumable: boolean;
}
```

**Resume Protocol:**
1. Load checkpoint from `.state/{pipelineId}.json`
2. Validate checkpoint integrity (hash check)
3. Skip completed gates
4. Resume from `currentGate`

---

## 🎯 Quality Gates

All agents must pass these gates before output is accepted:

| Gate | Criteria | Threshold |
|------|----------|-----------|
| Schema Validation | Output matches contract | 100% |
| Completeness | All required fields present | 100% |
| Quality Score | Confidence/coverage metric | ≥ 70% |
| Security Check | No injection/XSS patterns | 100% |
| Compilation | Generated code compiles | 100% |

**If any gate fails:**
- Retry with refined input (1x)
- If still failing → Return error with specifics
- Orchestration decides whether to abort or continue with degraded mode