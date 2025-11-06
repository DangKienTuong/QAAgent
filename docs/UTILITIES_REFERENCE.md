# UTILITIES REFERENCE GUIDE

## Purpose

Comprehensive reference for all utilities in the QA automation framework. This guide documents the centralized utilities layer that provides robust error handling, timeout management, and logging for Playwright test automation.

**Why Use Utilities Layer:**
- ✅ Centralized error handling with fallback strategies
- ✅ Consistent timeout management (30s default, configurable)
- ✅ Automatic action logging for debugging
- ✅ Type-safe parameter validation
- ✅ Retry logic built-in
- ✅ 975 lines of battle-tested code

**Target Audience:** Test automation engineers, agent developers, code reviewers

---

## Quick Reference

| Category | Functions | Use Case |
|----------|-----------|----------|
| **Locators** | getLocator, getLocatorByTestId, getLocatorByText, getLocatorByRole, getLocatorByLabel | Element selection |
| **Navigation** | gotoURL, reloadPage, goBack, waitForPageLoadState | Page navigation |
| **Input Actions** | fill, fillAndEnter, clear | Form filling |
| **Click Actions** | click, clickAndNavigate, doubleClick, clickByJS | Element interaction |
| **Select Actions** | selectByValue, selectByText, selectByIndex | Dropdown selection |
| **File Operations** | uploadFiles, attachFilesToFileChooser, downloadFile | File handling |
| **Checkbox/Radio** | check, uncheck | Checkbox/radio interaction |
| **Alerts** | acceptAlert, dismissAlert, getAlertText | Dialog handling |
| **Visibility** | isElementVisible, isElementHidden, isElementAttached | Element state checks |
| **Data Extraction** | getText, getAllTexts, getInputValue, getAttribute | Data retrieval |
| **Advanced** | hover, focus, dragAndDrop, scrollLocatorIntoView | Complex interactions |

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [pageActions Reference](#pageactions-reference)
   - [Locator Functions](#locator-functions)
   - [Navigation Functions](#navigation-functions)
   - [Input Functions](#input-functions)
   - [Click Functions](#click-functions)
   - [Select Functions](#select-functions)
   - [Alert Functions](#alert-functions)
   - [File Functions](#file-functions)
   - [Visibility Functions](#visibility-functions)
   - [Data Extraction Functions](#data-extraction-functions)
   - [Advanced Functions](#advanced-functions)
3. [Custom Expect Reference](#custom-expect-reference)
4. [Logger Reference](#logger-reference)
5. [Timeout Constants](#timeout-constants)
6. [Error Handling](#error-handling)
7. [Usage Patterns](#usage-patterns)

---

## Core Concepts

### Import Statements

```typescript
// Page object imports
import { pageActions } from '@utilities/ui/page-actions'
import { logger } from '@utilities/reporter/custom-logger'
import { expect } from '@utilities/reporter/custom-expect'
import { SMALL_TIMEOUT, MEDIUM_TIMEOUT, LARGE_TIMEOUT } from '@utilities/ui/timeout-const'
```

### Locator Input Types

All pageActions functions accept **TWO input types**:

1. **String selector** (recommended for self-healing):
   ```typescript
   await pageActions.click(page, '#loginButton')
   await pageActions.fill(page, '[placeholder="Username"]', 'admin')
   ```

2. **Playwright Locator object**:
   ```typescript
   const button = page.locator('#loginButton')
   await pageActions.click(page, button)
   ```

### Error Handling Pattern

All pageActions functions:
- Validate inputs (throw error if empty/null)
- Wrap Playwright calls in try-catch
- Enrich errors with context
- Log actions and failures

```typescript
try {
  await pageActions.fill(page, '#email', 'test@example.com')
} catch (error) {
  // Error includes: action attempted, selector used, timeout value
  logger.error(error.message)
  throw error
}
```

---

## pageActions Reference

### Locator Functions

#### getLocator(input, options?)

**Purpose:** Get a Locator object from string selector or existing Locator

**Parameters:**
- `input`: string | Locator - CSS selector or Playwright Locator
- `options?`: LocatorOptions - Optional locator configuration

**Returns:** Locator

**Usage:**
```typescript
const emailField = pageActions.getLocator('#email')
const submitButton = pageActions.getLocator('button[type="submit"]')

// With options
const fieldWithTimeout = pageActions.getLocator('#field', { hasText: 'Username' })
```

**When to use:** When you need to store a locator reference without immediate action.

---

#### getLocatorByTestId(testId, attributeName?)

**Purpose:** Get Locator using data-testid attribute

**Parameters:**
- `testId`: string | RegExp - Test ID value
- `attributeName?`: string - Custom test ID attribute name (default: 'data-testid')

**Returns:** Locator

**Usage:**
```typescript
const loginBtn = pageActions.getLocatorByTestId('login-button')
const formInput = pageActions.getLocatorByTestId('email-input')

// Custom attribute
const customBtn = pageActions.getLocatorByTestId('btn-submit', 'data-test')
```

**When to use:** When elements have test-specific attributes for stable selection.

---

#### getLocatorByText(text, options?)

**Purpose:** Get Locator by visible text content

**Parameters:**
- `text`: string | RegExp - Text to search for
- `options?`: GetByTextOptions - Match options (exact: true/false)

**Returns:** Locator

**Usage:**
```typescript
const link = pageActions.getLocatorByText('Click here')
const button = pageActions.getLocatorByText(/submit/i)

// Exact match
const exactLink = pageActions.getLocatorByText('Login', { exact: true })
```

**When to use:** When element text is unique and stable.

---

#### getLocatorByRole(role, options?)

**Purpose:** Get Locator by ARIA role

**Parameters:**
- `role`: GetByRoleTypes - ARIA role (button, link, textbox, etc.)
- `options?`: GetByRoleOptions - Role match options (name, checked, etc.)

**Returns:** Locator

**Usage:**
```typescript
const submitBtn = pageActions.getLocatorByRole('button', { name: 'Submit' })
const emailInput = pageActions.getLocatorByRole('textbox', { name: 'Email' })
const checkedBox = pageActions.getLocatorByRole('checkbox', { checked: true })
```

**When to use:** For accessible element selection using semantic roles.

---

#### getLocatorByLabel(text, options?)

**Purpose:** Get Locator by associated label text

**Parameters:**
- `text`: string | RegExp - Label text
- `options?`: GetByRoleOptions - Match options

**Returns:** Locator

**Usage:**
```typescript
const emailField = pageActions.getLocatorByLabel('Email Address')
const passwordField = pageActions.getLocatorByLabel(/password/i)
```

**When to use:** When form fields have proper label associations.

---

#### getLocatorByPlaceholder(text, options?)

**Purpose:** Get Locator by placeholder attribute

**Parameters:**
- `text`: string | RegExp - Placeholder text
- `options?`: GetByPlaceholderOptions - Match options

**Returns:** Locator

**Usage:**
```typescript
const searchBox = pageActions.getLocatorByPlaceholder('Search...')
const emailInput = pageActions.getLocatorByPlaceholder('Enter your email')
```

**When to use:** When placeholder text is unique and stable.

---

#### getAllLocators(input, options?)

**Purpose:** Get array of all matching Locators

**Parameters:**
- `input`: string | Locator - Selector
- `options?`: LocatorOptions - Match options

**Returns:** Promise<Locator[]>

**Usage:**
```typescript
const allButtons = await pageActions.getAllLocators('button')
const allRows = await pageActions.getAllLocators('.table-row')

// Iterate through all
for (const row of allRows) {
  const text = await row.textContent()
  logger.info(`Row text: ${text}`)
}
```

**When to use:** When working with multiple matching elements (tables, lists).

---

### Navigation Functions

#### gotoURL(path, options?)

**Purpose:** Navigate to URL with automatic wait for load

**Parameters:**
- `path`: string - URL to navigate to
- `options?`: GotoOptions - Navigation options (waitUntil: 'load' | 'domcontentloaded' | 'networkidle')

**Returns:** Promise<Response | null>

**Usage:**
```typescript
await pageActions.gotoURL(page, 'https://example.com/login')
await pageActions.gotoURL(page, '/dashboard', { waitUntil: 'networkidle' })
```

**When to use:** For all page navigation in page objects.

**Important:** Always use this instead of `page.goto()` for consistent timeout handling and logging.

---

#### waitForPageLoadState(options?)

**Purpose:** Wait for page to reach specific load state

**Parameters:**
- `options?`: NavigationOptions - Load state to wait for

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.waitForPageLoadState(page, { waitUntil: 'load' })
await pageActions.waitForPageLoadState(page, { waitUntil: 'networkidle' })
```

**When to use:** After actions that trigger navigation or dynamic content loading.

---

#### reloadPage(options?)

**Purpose:** Reload current page

**Parameters:**
- `options?`: NavigationOptions - Reload options

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.reloadPage(page)
await pageActions.reloadPage(page, { waitUntil: 'domcontentloaded' })
```

**When to use:** When testing page refresh behavior.

---

#### goBack(options?)

**Purpose:** Navigate to previous page in history

**Parameters:**
- `options?`: NavigationOptions - Navigation options

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.goBack(page)
await pageActions.goBack(page, { waitUntil: 'load' })
```

**When to use:** When testing browser back button behavior.

---

### Input Functions

#### fill(input, value, options?)

**Purpose:** Fill input field with text

**Parameters:**
- `input`: string | Locator - Field selector
- `value`: string - Text to fill
- `options?`: FillOptions - Fill options (timeout, force, etc.)

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.fill(page, '#email', 'user@example.com')
await pageActions.fill(page, '[placeholder="Username"]', 'admin')

// With timeout
await pageActions.fill(page, '#slowField', 'data', { timeout: 10000 })
```

**When to use:** For all text input filling in forms.

**Important:** Automatically clears field before filling.

---

#### fillAndEnter(input, value, options?)

**Purpose:** Fill input field and press Enter key

**Parameters:**
- `input`: string | Locator - Field selector
- `value`: string - Text to fill
- `options?`: FillOptions - Fill options

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.fillAndEnter(page, '#searchBox', 'playwright')
await pageActions.fillAndEnter(page, '#email', 'user@test.com')
```

**When to use:** For search boxes or fields that submit on Enter.

---

#### clear(input, options?)

**Purpose:** Clear input field

**Parameters:**
- `input`: string | Locator - Field selector
- `options?`: ClearOptions - Clear options

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.clear(page, '#email')
await pageActions.clear(page, '[name="username"]')
```

**When to use:** When you need to clear field without filling (rare - `fill()` clears automatically).

---

### Click Functions

#### click(input, options?)

**Purpose:** Click on element

**Parameters:**
- `input`: string | Locator - Element selector
- `options?`: ClickOptions - Click options (timeout, force, position, etc.)

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.click(page, '#submitButton')
await pageActions.click(page, 'button:has-text("Login")')

// With options
await pageActions.click(page, '#button', { timeout: 5000, force: true })
```

**When to use:** For all button, link, and clickable element interactions.

---

#### clickAndNavigate(input, options?)

**Purpose:** Click element and wait for navigation to complete

**Parameters:**
- `input`: string | Locator - Element selector
- `options?`: ClickOptions - Click options

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.clickAndNavigate(page, '#loginButton')
await pageActions.clickAndNavigate(page, 'a[href="/dashboard"]')
```

**When to use:** When clicking triggers page navigation.

**Important:** Automatically waits for 'load' state after click.

---

#### doubleClick(input, options?)

**Purpose:** Double-click on element

**Parameters:**
- `input`: string | Locator - Element selector
- `options?`: DoubleClickOptions - Double-click options

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.doubleClick(page, '.file-item')
await pageActions.doubleClick(page, '#editableText')
```

**When to use:** For elements requiring double-click (rare).

---

#### clickByJS(input, options?)

**Purpose:** Click using JavaScript execution (bypasses Playwright's actionability checks)

**Parameters:**
- `input`: string | Locator - Element selector
- `options?`: TimeoutOption - Timeout option

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.clickByJS(page, '#hiddenButton')
await pageActions.clickByJS(page, '.obscured-element')
```

**When to use:** **LAST RESORT** when normal click fails due to element being obscured or not actionable.

**Warning:** Bypasses Playwright's built-in safety checks. Use sparingly.

---

### Select Functions

#### selectByValue(input, value, options?)

**Purpose:** Select dropdown option by value attribute

**Parameters:**
- `input`: string | Locator - Select element selector
- `value`: string - Option value
- `options?`: SelectOptions - Select options

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.selectByValue(page, '#country', 'US')
await pageActions.selectByValue(page, 'select[name="state"]', 'CA')
```

**When to use:** When option values are known and stable.

---

#### selectByText(input, text, options?)

**Purpose:** Select dropdown option by visible text

**Parameters:**
- `input`: string | Locator - Select element selector
- `text`: string - Option text
- `options?`: SelectOptions - Select options

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.selectByText(page, '#country', 'United States')
await pageActions.selectByText(page, 'select[name="role"]', 'Administrator')
```

**When to use:** When option text is more readable than value.

---

#### selectByIndex(input, index, options?)

**Purpose:** Select dropdown option by index position

**Parameters:**
- `input`: string | Locator - Select element selector
- `index`: number - Option index (0-based)
- `options?`: SelectOptions - Select options

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.selectByIndex(page, '#country', 0)  // First option
await pageActions.selectByIndex(page, 'select[name="category"]', 2)
```

**When to use:** When testing positional selection or option count.

**Warning:** Brittle if option order changes. Prefer selectByValue or selectByText.

---

### Alert Functions

#### acceptAlert(promptText?)

**Purpose:** Accept browser alert/confirm/prompt dialog

**Parameters:**
- `promptText?`: string - Text to enter in prompt dialog (optional)

**Returns:** Promise<string> - Alert message text

**Usage:**
```typescript
const alertText = await pageActions.acceptAlert(page)
logger.info(`Alert said: ${alertText}`)

// For prompts
const promptText = await pageActions.acceptAlert(page, 'My input value')
```

**When to use:** When clicking triggers browser alert that must be accepted.

**Important:** Must set up dialog listener BEFORE triggering action.

---

#### dismissAlert()

**Purpose:** Dismiss/cancel browser alert/confirm dialog

**Parameters:** None

**Returns:** Promise<string> - Alert message text

**Usage:**
```typescript
const alertText = await pageActions.dismissAlert(page)
logger.info(`Dismissed alert: ${alertText}`)
```

**When to use:** When testing cancel behavior on confirms.

---

#### getAlertText()

**Purpose:** Get text from browser alert without accepting/dismissing

**Parameters:** None

**Returns:** Promise<string> - Alert message text

**Usage:**
```typescript
const message = await pageActions.getAlertText(page)
expect(message).toContain('Are you sure?')
```

**When to use:** When you need to verify alert text before handling it.

---

### File Functions

#### uploadFiles(input, path, options?)

**Purpose:** Upload one or more files to file input

**Parameters:**
- `input`: string | Locator - File input selector
- `path`: string | string[] - File path(s) to upload
- `options?`: UploadOptions - Upload options

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.uploadFiles(page, '#fileInput', 'tests/test-data/document-files/test.pdf')

// Multiple files
await pageActions.uploadFiles(page, '#multiFileInput', [
  'tests/test-data/document-files/doc1.pdf',
  'tests/test-data/document-files/doc2.png'
])
```

**When to use:** For all file upload functionality.

**Important:** Files must exist at specified paths.

---

#### downloadFile(input, path)

**Purpose:** Click download link and save file to specified path

**Parameters:**
- `input`: string | Locator - Download link/button selector
- `path`: string - Path to save downloaded file

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.downloadFile(page, '#downloadButton', './downloads/report.pdf')
await pageActions.downloadFile(page, 'a[href="/export"]', './downloads/data.csv')
```

**When to use:** When testing file download functionality.

---

### Checkbox/Radio Functions

#### check(input, options?)

**Purpose:** Check checkbox or radio button

**Parameters:**
- `input`: string | Locator - Checkbox/radio selector
- `options?`: CheckOptions - Check options

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.check(page, '#agreeToTerms')
await pageActions.check(page, 'input[type="checkbox"][name="newsletter"]')
await pageActions.check(page, 'input[type="radio"][value="male"]')
```

**When to use:** For all checkbox/radio selection.

**Important:** Idempotent - safe to call even if already checked.

---

#### uncheck(input, options?)

**Purpose:** Uncheck checkbox

**Parameters:**
- `input`: string | Locator - Checkbox selector
- `options?`: CheckOptions - Check options

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.uncheck(page, '#newsletter')
await pageActions.uncheck(page, 'input[type="checkbox"][name="rememberMe"]')
```

**When to use:** When explicitly unchecking checkboxes.

**Important:** Only works on checkboxes, not radio buttons.

---

### Visibility Functions

#### isElementVisible(input, options?)

**Purpose:** Check if element is visible on page

**Parameters:**
- `input`: string | Locator - Element selector
- `options?`: TimeoutOption - Timeout option

**Returns:** Promise<boolean>

**Usage:**
```typescript
const isVisible = await pageActions.isElementVisible(page, '#successMessage')
if (isVisible) {
  logger.info('Success message displayed')
}
```

**When to use:** For conditional logic based on element visibility.

---

#### isElementHidden(input, options?)

**Purpose:** Check if element is hidden

**Parameters:**
- `input`: string | Locator - Element selector
- `options?`: TimeoutOption - Timeout option

**Returns:** Promise<boolean>

**Usage:**
```typescript
const isHidden = await pageActions.isElementHidden(page, '#loadingSpinner')
if (isHidden) {
  logger.info('Loading complete')
}
```

**When to use:** For waiting for loading indicators to disappear.

---

#### isElementAttached(input, options?)

**Purpose:** Check if element exists in DOM

**Parameters:**
- `input`: string | Locator - Element selector
- `options?`: TimeoutOption - Timeout option

**Returns:** Promise<boolean>

**Usage:**
```typescript
const exists = await pageActions.isElementAttached(page, '#dynamicElement')
if (!exists) {
  logger.warn('Element not found in DOM')
}
```

**When to use:** For checking element existence before interaction.

---

#### isElementChecked(input, options?)

**Purpose:** Check if checkbox/radio is checked

**Parameters:**
- `input`: string | Locator - Checkbox/radio selector
- `options?`: TimeoutOption - Timeout option

**Returns:** Promise<boolean>

**Usage:**
```typescript
const isChecked = await pageActions.isElementChecked(page, '#agreeToTerms')
expect(isChecked).toBe(true)
```

**When to use:** For verifying checkbox/radio state.

---

### Data Extraction Functions

#### getText(input, options?)

**Purpose:** Get visible text content of element

**Parameters:**
- `input`: string | Locator - Element selector
- `options?`: TimeoutOption - Timeout option

**Returns:** Promise<string>

**Usage:**
```typescript
const message = await pageActions.getText(page, '#successMessage')
expect(message).toContain('Registration successful')

const heading = await pageActions.getText(page, 'h1')
logger.info(`Page heading: ${heading}`)
```

**When to use:** For all text content verification.

---

#### getAllTexts(input)

**Purpose:** Get text content of all matching elements

**Parameters:**
- `input`: string | Locator - Element selector

**Returns:** Promise<string[]>

**Usage:**
```typescript
const allErrors = await pageActions.getAllTexts(page, '.error-message')
expect(allErrors).toHaveLength(3)

const menuItems = await pageActions.getAllTexts(page, '.menu-item')
logger.info(`Menu items: ${menuItems.join(', ')}`)
```

**When to use:** For extracting data from multiple elements (lists, tables).

---

#### getInputValue(input, options?)

**Purpose:** Get value of input field

**Parameters:**
- `input`: string | Locator - Input selector
- `options?`: TimeoutOption - Timeout option

**Returns:** Promise<string>

**Usage:**
```typescript
const email = await pageActions.getInputValue(page, '#email')
expect(email).toBe('user@example.com')

const searchTerm = await pageActions.getInputValue(page, '#searchBox')
```

**When to use:** For verifying input field values.

---

#### getAttribute(input, attribute, options?)

**Purpose:** Get attribute value from element

**Parameters:**
- `input`: string | Locator - Element selector
- `attribute`: string - Attribute name
- `options?`: TimeoutOption - Timeout option

**Returns:** Promise<string | null>

**Usage:**
```typescript
const href = await pageActions.getAttribute(page, '#loginLink', 'href')
expect(href).toBe('/login')

const disabled = await pageActions.getAttribute(page, '#submitBtn', 'disabled')
expect(disabled).toBeNull()  // Not disabled
```

**When to use:** For checking element attributes (href, disabled, aria-*, data-*).

---

### Advanced Functions

#### hover(input, options?)

**Purpose:** Hover mouse over element

**Parameters:**
- `input`: string | Locator - Element selector
- `options?`: HoverOptions - Hover options

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.hover(page, '#menuItem')
await pageActions.hover(page, '.tooltip-trigger')
```

**When to use:** For dropdown menus, tooltips, hover effects.

---

#### focus(input, options?)

**Purpose:** Focus on element

**Parameters:**
- `input`: string | Locator - Element selector
- `options?`: TimeoutOption - Timeout option

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.focus(page, '#searchBox')
await pageActions.focus(page, 'input[name="email"]')
```

**When to use:** For testing focus states or triggering focus events.

---

#### dragAndDrop(source, target, options?)

**Purpose:** Drag element to target location

**Parameters:**
- `source`: string | Locator - Source element selector
- `target`: string | Locator - Target element selector
- `options?`: DragOptions - Drag options

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.dragAndDrop(page, '#draggable', '#dropzone')
await pageActions.dragAndDrop(page, '.task-item', '.completed-list')
```

**When to use:** For drag-and-drop functionality testing.

---

#### scrollLocatorIntoView(input, options?)

**Purpose:** Scroll element into viewport

**Parameters:**
- `input`: string | Locator - Element selector
- `options?`: TimeoutOption - Timeout option

**Returns:** Promise<void>

**Usage:**
```typescript
await pageActions.scrollLocatorIntoView(page, '#bottomElement')
await pageActions.scrollLocatorIntoView(page, '.lazy-loaded-section')
```

**When to use:** For interacting with elements outside viewport.

**Note:** Playwright auto-scrolls before actions - rarely needed explicitly.

---

## Custom Expect Reference

### Purpose

Enhanced Playwright expect with custom timeout handling and error enrichment.

### Import

```typescript
import { expect } from '@utilities/reporter/custom-expect'
```

### Usage

```typescript
// All standard Playwright expect assertions work
await expect(page).toHaveURL(/dashboard/)
await expect(page.locator('#message')).toBeVisible()
await expect(page.locator('#email')).toHaveValue('user@test.com')
await expect(page.locator('.error')).toContainText('Invalid input')
```

### Key Assertions

| Assertion | Purpose | Example |
|-----------|---------|---------|
| `toBeVisible()` | Element is visible | `await expect(locator).toBeVisible()` |
| `toBeHidden()` | Element is hidden | `await expect(locator).toBeHidden()` |
| `toHaveText(text)` | Element has exact text | `await expect(locator).toHaveText('Login')` |
| `toContainText(text)` | Element contains text | `await expect(locator).toContainText('Success')` |
| `toHaveValue(value)` | Input has value | `await expect(input).toHaveValue('admin')` |
| `toBeChecked()` | Checkbox is checked | `await expect(checkbox).toBeChecked()` |
| `toBeEnabled()` | Element is enabled | `await expect(button).toBeEnabled()` |
| `toBeDisabled()` | Element is disabled | `await expect(button).toBeDisabled()` |
| `toHaveURL(url)` | Page has URL | `await expect(page).toHaveURL('/dashboard')` |
| `toHaveCount(n)` | Locator matches n elements | `await expect(locator).toHaveCount(5)` |

---

## Logger Reference

### Purpose

Winston-based logger for action tracking, debugging, and audit trails.

### Import

```typescript
import { logger } from '@utilities/reporter/custom-logger'
```

### Log Levels

| Level | Method | Use Case | Example |
|-------|--------|----------|---------|
| ERROR | `logger.error(message)` | Failures, exceptions | `logger.error('Login failed: invalid credentials')` |
| WARN | `logger.warn(message)` | Fallback attempts, deprecations | `logger.warn('Fallback attempt 1 for email field')` |
| INFO | `logger.info(message)` | Success messages, key actions | `logger.info('User logged in successfully')` |
| DEBUG | `logger.debug(message)` | Detailed execution info | `logger.debug('Fetching user data from API')` |

### Usage Patterns

```typescript
// Action logging
logger.info('Navigating to login page')
await pageActions.gotoURL(page, '/login')

// Fallback logging
logger.warn('Primary locator failed - trying fallback1')
await pageActions.click(page, fallback1)

// Error logging
try {
  await pageActions.fill(page, '#email', email)
} catch (error) {
  logger.error(`Failed to fill email field: ${error.message}`)
  throw error
}

// Success logging
logger.info('Registration completed successfully')
```

---

## Timeout Constants

### Import

```typescript
import { 
  INSTANT_TIMEOUT, 
  SMALL_TIMEOUT, 
  MEDIUM_TIMEOUT, 
  LARGE_TIMEOUT 
} from '@utilities/ui/timeout-const'
```

### Values

| Constant | Value (ms) | Use Case |
|----------|------------|----------|
| `INSTANT_TIMEOUT` | 0 | No wait |
| `SMALL_TIMEOUT` | 5,000 | Quick actions |
| `MEDIUM_TIMEOUT` | 15,000 | Standard actions |
| `LARGE_TIMEOUT` | 30,000 | Slow operations |

### Usage

```typescript
// Custom timeout for slow-loading element
await pageActions.click(page, '#slowButton', { timeout: LARGE_TIMEOUT })

// Quick check without waiting
const exists = await pageActions.isElementVisible(page, '#element', { timeout: INSTANT_TIMEOUT })
```

---

## Error Handling

### Error Handler

All pageActions functions use centralized error handler:

```typescript
import { ErrorHandler } from '@utilities/reporter/error-handler'

const errorHandler = new ErrorHandler()

// Validates input
errorHandler.checkNotEmpty(input, 'Email')

// Enriches errors with context
throw errorHandler.handleError(error, 'Failed to click button')
```

### Error Pattern in Page Objects

```typescript
private async fillWithFallback(
  locatorSet: { primary: string; fallback1: string; fallback2: string },
  value: string,
  fieldName: string
): Promise<void> {
  const attemptedLocators: string[] = []
  
  try {
    await pageActions.fill(this.page, locatorSet.primary, value)
    return
  } catch (primaryError) {
    attemptedLocators.push(`primary (${locatorSet.primary}): ${primaryError.message}`)
    logger.warn(`Fallback attempt 1 for ${fieldName}`)
    
    try {
      await pageActions.fill(this.page, locatorSet.fallback1, value)
      logger.info(`Fallback1 succeeded for ${fieldName}`)
      return
    } catch (fallback1Error) {
      attemptedLocators.push(`fallback1 (${locatorSet.fallback1}): ${fallback1Error.message}`)
      logger.warn(`Fallback attempt 2 for ${fieldName}`)
      
      try {
        await pageActions.fill(this.page, locatorSet.fallback2, value)
        logger.info(`Fallback2 succeeded for ${fieldName}`)
        return
      } catch (fallback2Error) {
        attemptedLocators.push(`fallback2 (${locatorSet.fallback2}): ${fallback2Error.message}`)
        const errorMessage = `All locators failed for ${fieldName}. Attempted:\n${attemptedLocators.join('\n')}`
        logger.error(errorMessage)
        throw new Error(errorMessage)
      }
    }
  }
}
```

---

## Usage Patterns

### Pattern 1: Basic Page Object with pageActions

```typescript
import { Page } from '@playwright/test'
import { pageActions } from '@utilities/ui/page-actions'
import { logger } from '@utilities/reporter/custom-logger'

export default class LoginPage {
  private page: Page
  
  constructor(page: Page) {
    this.page = page
  }
  
  private locators = {
    username: {
      primary: '#username',
      fallback1: '[placeholder="Username"]',
      fallback2: 'input[name="username"]'
    },
    password: {
      primary: '#password',
      fallback1: '[placeholder="Password"]',
      fallback2: 'input[type="password"]'
    },
    loginButton: {
      primary: '#login',
      fallback1: 'button[type="submit"]',
      fallback2: 'text=Login'
    }
  }
  
  async goto() {
    await pageActions.gotoURL(this.page, '/login')
  }
  
  async fillUsername(value: string) {
    await this.fillWithFallback(this.locators.username, value, 'username')
  }
  
  async fillPassword(value: string) {
    await this.fillWithFallback(this.locators.password, value, 'password')
  }
  
  async clickLoginButton() {
    await this.clickWithFallback(this.locators.loginButton, 'loginButton')
  }
  
  async login(username: string, password: string) {
    logger.info(`Logging in as: ${username}`)
    await this.fillUsername(username)
    await this.fillPassword(password)
    await this.clickLoginButton()
    logger.info('Login completed')
  }
  
  // Self-healing fill wrapper
  private async fillWithFallback(
    locatorSet: { primary: string; fallback1: string; fallback2: string },
    value: string,
    fieldName: string
  ): Promise<void> {
    const attemptedLocators: string[] = []
    
    try {
      await pageActions.fill(this.page, locatorSet.primary, value)
      return
    } catch (primaryError) {
      attemptedLocators.push(`primary (${locatorSet.primary}): ${primaryError.message}`)
      logger.warn(`Fallback attempt 1 for ${fieldName}`)
      
      try {
        await pageActions.fill(this.page, locatorSet.fallback1, value)
        logger.info(`Fallback1 succeeded for ${fieldName}`)
        return
      } catch (fallback1Error) {
        attemptedLocators.push(`fallback1 (${locatorSet.fallback1}): ${fallback1Error.message}`)
        logger.warn(`Fallback attempt 2 for ${fieldName}`)
        
        try {
          await pageActions.fill(this.page, locatorSet.fallback2, value)
          logger.info(`Fallback2 succeeded for ${fieldName}`)
          return
        } catch (fallback2Error) {
          attemptedLocators.push(`fallback2 (${locatorSet.fallback2}): ${fallback2Error.message}`)
          const errorMessage = `All locators failed for ${fieldName}. Attempted:\n${attemptedLocators.join('\n')}`
          logger.error(errorMessage)
          throw new Error(errorMessage)
        }
      }
    }
  }
  
  // Self-healing click wrapper
  private async clickWithFallback(
    locatorSet: { primary: string; fallback1: string; fallback2: string },
    elementName: string
  ): Promise<void> {
    const attemptedLocators: string[] = []
    
    try {
      await pageActions.click(this.page, locatorSet.primary)
      return
    } catch (primaryError) {
      attemptedLocators.push(`primary (${locatorSet.primary}): ${primaryError.message}`)
      logger.warn(`Fallback attempt 1 for ${elementName}`)
      
      try {
        await pageActions.click(this.page, locatorSet.fallback1)
        logger.info(`Fallback1 succeeded for ${elementName}`)
        return
      } catch (fallback1Error) {
        attemptedLocators.push(`fallback1 (${locatorSet.fallback1}): ${fallback1Error.message}`)
        logger.warn(`Fallback attempt 2 for ${elementName}`)
        
        try {
          await pageActions.click(this.page, locatorSet.fallback2)
          logger.info(`Fallback2 succeeded for ${elementName}`)
          return
        } catch (fallback2Error) {
          attemptedLocators.push(`fallback2 (${locatorSet.fallback2}): ${fallback2Error.message}`)
          const errorMessage = `All locators failed for ${elementName}. Attempted:\n${attemptedLocators.join('\n')}`
          logger.error(errorMessage)
          throw new Error(errorMessage)
        }
      }
    }
  }
}
```

### Pattern 2: Special Component Handling

```typescript
// React-select dropdown
private async selectReactSelectOption(containerSelector: string, optionText: string) {
  logger.info(`Selecting react-select option: ${optionText}`)
  
  // Click container to open dropdown
  await pageActions.click(this.page, containerSelector)
  
  // Wait for options to appear
  await pageActions.waitForSomeTime(500)
  
  // Fill search input
  await pageActions.fillAndEnter(this.page, `${containerSelector} input`, optionText)
  
  logger.info(`React-select option selected: ${optionText}`)
}

// Date picker
private async selectDate(datePickerSelector: string, date: string) {
  logger.info(`Selecting date: ${date}`)
  
  // Click to open picker
  await pageActions.click(this.page, datePickerSelector)
  
  // Fill date directly (if supported)
  await pageActions.fill(this.page, `${datePickerSelector} input`, date)
  
  // Press Enter to confirm
  await this.page.keyboard.press('Enter')
  
  logger.info('Date selected')
}

// File upload
async uploadDocument(filePath: string) {
  logger.info(`Uploading file: ${filePath}`)
  
  await pageActions.uploadFiles(this.page, '#fileInput', filePath)
  
  // Wait for upload confirmation
  await this.page.waitForSelector('.upload-success', { timeout: 10000 })
  
  logger.info('File uploaded successfully')
}
```

### Pattern 3: Data Extraction for Validation

```typescript
async getSuccessMessage(): Promise<string> {
  const message = await pageActions.getText(this.page, '#successMessage')
  logger.info(`Success message: ${message}`)
  return message
}

async getAllErrorMessages(): Promise<string[]> {
  const errors = await pageActions.getAllTexts(this.page, '.error-message')
  logger.info(`Found ${errors.length} error messages`)
  return errors
}

async getFormData(): Promise<Record<string, string>> {
  const firstName = await pageActions.getInputValue(this.page, '#firstName')
  const lastName = await pageActions.getInputValue(this.page, '#lastName')
  const email = await pageActions.getInputValue(this.page, '#email')
  
  return { firstName, lastName, email }
}
```

---

## Best Practices

### 1. Always Use pageActions Wrapper

✅ **Good:**
```typescript
await pageActions.fill(this.page, '#email', email)
await pageActions.click(this.page, '#submit')
```

❌ **Bad:**
```typescript
await this.page.locator('#email').fill(email)
await this.page.locator('#submit').click()
```

### 2. Log All Actions

✅ **Good:**
```typescript
logger.info('Filling registration form')
await this.fillFirstName(firstName)
await this.fillLastName(lastName)
logger.info('Form filled successfully')
```

❌ **Bad:**
```typescript
await this.fillFirstName(firstName)
await this.fillLastName(lastName)
```

### 3. Use Self-Healing Patterns

✅ **Good:**
```typescript
private locators = {
  email: {
    primary: '#email',
    fallback1: '[placeholder="Email"]',
    fallback2: 'input[type="email"]'
  }
}

await this.fillWithFallback(this.locators.email, value, 'email')
```

❌ **Bad:**
```typescript
await pageActions.fill(this.page, '#email', value)
```

### 4. Handle Errors Gracefully

✅ **Good:**
```typescript
try {
  await pageActions.fill(this.page, '#email', email)
} catch (error) {
  logger.error(`Failed to fill email: ${error.message}`)
  throw error
}
```

❌ **Bad:**
```typescript
await pageActions.fill(this.page, '#email', email)
```

### 5. Use Semantic Locators

✅ **Good:**
```typescript
await pageActions.click(this.page, 'button[aria-label="Submit"]')
await pageActions.getLocatorByRole('button', { name: 'Submit' })
```

❌ **Bad:**
```typescript
await pageActions.click(this.page, '.btn.btn-primary.submit-btn')
```

---

## Migration Guide

### From Direct Playwright API to pageActions

**Before:**
```typescript
await page.goto('https://example.com')
await page.locator('#email').fill('user@test.com')
await page.locator('#submit').click()
const message = await page.locator('#message').textContent()
```

**After:**
```typescript
await pageActions.gotoURL(page, 'https://example.com')
await pageActions.fill(page, '#email', 'user@test.com')
await pageActions.click(page, '#submit')
const message = await pageActions.getText(page, '#message')
```

**Benefits:**
- ✅ Centralized timeout management
- ✅ Automatic error enrichment
- ✅ Action logging for debugging
- ✅ Consistent error handling
- ✅ Type-safe parameters

---

## Summary

**Key Takeaways:**
1. ✅ **ALWAYS** use pageActions wrapper instead of direct Playwright API
2. ✅ **ALWAYS** log actions with logger for debugging
3. ✅ **ALWAYS** use self-healing locator patterns (primary + 2 fallbacks)
4. ✅ **ALWAYS** enrich errors with attempted locators
5. ✅ **ALWAYS** use custom expect for assertions

**Resources:**
- Source: `src/utilities/ui/page-actions.ts` (975 lines)
- Logger: `src/utilities/reporter/custom-logger.ts`
- Expect: `src/utilities/reporter/custom-expect.ts`
- Timeouts: `src/utilities/ui/timeout-const.ts`
- Examples: `tests/test-objects/gui/pageObjects/pages/`

**Questions?**
- Check working examples in `tests/test-objects/gui/pageObjects/pages/login.page.ts`
- Review POM Generator agent instructions for code generation patterns
- Consult TEMPLATE_GUIDE.md for architecture overview

---

**Document Version:** 1.0  
**Last Updated:** November 7, 2025  
**Maintained By:** QA Automation Team
