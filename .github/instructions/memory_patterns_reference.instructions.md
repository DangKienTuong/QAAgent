---
applyTo: '**/*.agent,**'
description: 'Memory patterns reference - Version 2.0'
---

# 🗄️ MEMORY PATTERNS REFERENCE

## Purpose
This document defines the **standardized query and entity naming patterns** for all agents in the QA automation pipeline. Following these patterns ensures consistent memory storage/retrieval across production runs.

---

## 📊 Standardized Naming Convention

### **Entity Names**
```
{domain}-{feature}-{EntityType}-{version?}
```

### **Query Format**
```
{domain} {feature} {entity-type} patterns
```

### **Metadata Extraction**
```typescript
const domain = sanitizeFilename(extractDomain(url))    // e.g., "demoqa_com"
const feature = sanitizeFilename(extractFeature(userStory))  // e.g., "student_registration"
```

---

## 🎯 Agent-Specific Patterns

### **1. Orchestration Agent**

**File:** `.github/copilot-instructions.md`

**Step 0 Queries:**
| Query # | Pattern | Example | Purpose |
|---------|---------|---------|---------|
| 1 | `{domain} {feature} automation patterns` | `demoqa_com student_registration automation patterns` | Find existing automation for this domain+feature |
| 2 | `{domain} {feature} execution history` | `demoqa_com student_registration execution history` | Find previous test runs and results |
| 3 | `{domain} {feature} data-driven patterns` | `demoqa_com student_registration data-driven patterns` | Find data-driven test strategies (conditional) |

**Entities Created:**
- **After GATE 1:** `{domain}-{feature}-TestPattern`
- **After GATE 2:** `{domain}-{feature}-LocatorPattern`
- **After GATE 3:** `{domain}-{feature}-CodePattern`
- **After GATE 5:** `{domain}-{feature}-ExecutionHistory-{requestId}`

---

### **2. Test Case Designer Agent**

**File:** `.github/instructions/test_case_designer.agent.instructions.md`

**Step 0 Query:**
| Query # | Pattern | Example | Purpose |
|---------|---------|---------|---------|
| 1 | `{domain} {feature} test patterns` | `demoqa_com student_registration test patterns` | Find existing test case designs |

**Entity Created:**
- **Step 6 (after completion):** `{domain}-{feature}-TestPattern`

**Entity Observations:**
- User story
- Test cases generated (count)
- Data-driven strategy (yes/no)
- Coverage percentage
- Acceptance criteria count
- Test steps total count
- Captured at: Step 6 completion
- Timestamp (ISO 8601)

---

### **3. DOM Analysis Agent**

**File:** `.github/instructions/dom_analysis.agent.instructions.md`

**Step 0 Queries:**
| Query # | Pattern | Example | Purpose |
|---------|---------|---------|---------|
| 1 | `{domain} {feature} locator patterns` | `demoqa_com student_registration locator patterns` | Find existing locator strategies |
| 2 | `{domain} {componentType} interaction patterns` | `demoqa_com react-select interaction patterns` | Find component-specific patterns |

**Entity Created:**
- **Step 5 (after completion):** `{domain}-{feature}-LocatorPattern`

**Entity Observations:**
- Total elements mapped (count)
- SPA detected (boolean)
- Average confidence score (%)
- Special components detected (comma-separated)
- Per-element mappings: `{logicalName}: {locatorType}={value} (confidence: X%, fallbacks: Y)`
- Captured at: Step 5 completion
- Timestamp (ISO 8601)

---

### **4. POM Generator Agent**

**File:** `.github/instructions/pom_generator.agent.instructions.md`

**Step 0 Query:**
| Query # | Pattern | Example | Purpose |
|---------|---------|---------|---------|
| 1 | `{domain} {feature} code patterns` | `demoqa_com student_registration code patterns` | Find existing code generation patterns |

**Entity Created:**
- **Step 9 (after completion):** `{domain}-{feature}-CodePattern`

**Entity Observations:**
- Files generated (count)
- Page objects (count)
- Test specs (count)
- Test pattern (e.g., "data-driven", "single")
- Framework (e.g., "playwright")
- Language (e.g., "typescript")
- Self-healing enabled (boolean)
- Component reuse (count)
- Compilation errors (should be 0)
- Captured at: Step 9 completion
- Timestamp (ISO 8601)

---

### **5. Test Healing Agent**

**File:** `.github/instructions/test_healing.agent.instructions.md`

**Step 0 Queries:**
| Query # | Pattern | Example | Purpose |
|---------|---------|---------|---------|
| 1 | `{domain} {errorType} error solutions` | `demoqa_com TimeoutError error solutions` | Find domain-specific error solutions |
| 2 | `{domain} {feature} healing patterns` | `demoqa_com student_registration healing patterns` | Find feature-specific healing strategies |
| 3 | `{errorType} healing strategies` | `TimeoutError healing strategies` | Find generic healing approaches (fallback) |

**Entity Created:**
- **Step 6 (after healing attempt):** `{domain}-{errorSignature}-ErrorSolution`

**Entity Observations:**
- Error type (e.g., "TimeoutError")
- Error signature (extracted pattern)
- Error message (full text)
- Failed step (test step description)
- Failed locator (if applicable)
- Root cause (identified cause)
- Healing strategy applied (e.g., "wait-strategy")
- Healing successful (yes/no)
- Changes applied (count + summary)
- Verification status (PASS/FAIL/NOT_VERIFIED)
- Execution history pattern (consistent/intermittent/unknown)
- Attempts used (X of 3)
- Rollback performed (yes/no)
- Captured at: Step 6 completion
- Timestamp (ISO 8601)

---

## 🔑 Entity Types Reference

| Entity Type | Used By | Purpose | Storage Timing |
|-------------|---------|---------|----------------|
| `TestPattern` | Test Case Designer, Orchestration | Test design strategies | After GATE 1 / Agent Step 6 |
| `LocatorPattern` | DOM Analysis, Orchestration | Element locator strategies | After GATE 2 / Agent Step 5 |
| `CodePattern` | POM Generator, Orchestration | Code generation patterns | After GATE 3 / Agent Step 9 |
| `ErrorSolution` | Test Healing | Error resolution strategies | After healing attempt (Step 6) |
| `ExecutionHistory` | Orchestration | Comprehensive pipeline summary | After GATE 5 |

---

## 📋 Consistency Rules

### ✅ DO:
- Always use `sanitizeFilename()` on domain and feature
- Use space separator in queries: `{domain} {feature} {type} patterns`
- Use hyphen separator in entity names: `{domain}-{feature}-{Type}`
- Include timestamp in ISO 8601 format in all observations
- Include "Captured at: {phase} completion" to track when learning occurred
- Query memory (Step 0) before ANY agent execution
- Store patterns immediately after successful completion

### ❌ DON'T:
- Mix spaces and hyphens in queries (query uses spaces, entity uses hyphens)
- Omit domain or feature from queries (always include both for precise matching)
- Store sensitive data (passwords, API keys, PII)
- Create duplicate entities (use mcp_memory_add_observations to update existing)
- Skip timestamp or "Captured at" fields

---

## 🔄 Incremental Storage Strategy

**Problem:** Previously, all learnings were stored only at GATE 5. If pipeline crashed, all knowledge was lost.

**Solution:** Store incrementally after each gate completes successfully.

### Storage Timeline:
```
PRE-PROCESSING (Step 0)
  ↓ Query existing patterns
GATE 1 ✅ → Store TestPattern immediately
  ↓
GATE 2 ✅ → Store LocatorPattern immediately
  ↓
GATE 3 ✅ → Store CodePattern immediately
  ↓
GATE 4 (if healing) ✅ → Test Healing agent stores ErrorSolution
  ↓
GATE 5 ✅ → Store comprehensive ExecutionHistory (summary)
```

### Benefits:
- ✅ Resilient to crashes (partial learnings preserved)
- ✅ Enables incremental learning (future runs can use GATE 1 patterns even if GATE 2 fails)
- ✅ Better observability (can track which gates completed)
- ✅ Production-ready (consistent patterns across all runs)

---

## 🧪 Example Production Run

**User Story:** "Student submits registration form"  
**URL:** `https://demoqa.com/automation-practice-form`  
**Extracted Metadata:**
- `domain`: `demoqa_com`
- `feature`: `student_registration`

### Queries Executed:
1. Orchestration Step 0:
   - `demoqa_com student_registration automation patterns`
   - `demoqa_com student_registration execution history`
   - `demoqa_com student_registration data-driven patterns`

2. Test Case Designer Step 0:
   - `demoqa_com student_registration test patterns`

3. DOM Analysis Step 0:
   - `demoqa_com student_registration locator patterns`
   - `demoqa_com react-select interaction patterns`

4. POM Generator Step 0:
   - `demoqa_com student_registration code patterns`

5. Test Healing Step 0 (if triggered):
   - `demoqa_com TimeoutError error solutions`
   - `demoqa_com student_registration healing patterns`
   - `TimeoutError healing strategies`

### Entities Created:
1. After GATE 1: `demoqa_com-student_registration-TestPattern`
2. After GATE 2: `demoqa_com-student_registration-LocatorPattern`
3. After GATE 3: `demoqa_com-student_registration-CodePattern`
4. After GATE 4 (if healing): `demoqa_com-{errorSig}-ErrorSolution`
5. After GATE 5: `demoqa_com-student_registration-ExecutionHistory-{requestId}`

---

## 📌 Version History

- **v2.0** (2025-11-06): Added incremental storage, standardized query patterns, consistent entity naming
- **v1.0** (Initial): Single GATE 5 storage only

