/**
 * JSON Utilities - Safe JSON serialization with error handling
 * Prevents pipeline crashes from circular references, BigInt, functions, symbols
 * Version: 2.0
 */

interface StringifyOptions {
  spaces?: number;
  maxDepth?: number;
}

/**
 * Safely stringify any JavaScript value with comprehensive error handling
 * 
 * Handles:
 * - Circular references → '[Circular Reference]'
 * - Functions → '[Function: name]'
 * - BigInt → 'value + "n"'
 * - Symbols → 'Symbol(description)'
 * - undefined → '[undefined]'
 * - Max depth → '[Max Depth Exceeded]'
 * 
 * @param obj - Value to stringify
 * @param options - Configuration options
 * @returns JSON string or throws descriptive error
 * 
 * @example
 * const output = { data: testCases, timestamp: new Date() }
 * const json = safeStringify(output)
 * await create_file('.state/output.json', json)
 */
export function safeStringify(obj: any, options: StringifyOptions = {}): string {
  const { spaces = 2, maxDepth = 100 } = options;
  const seen = new WeakSet();
  let currentDepth = 0;

  const replacer = (key: string, value: any) => {
    // Track recursion depth
    if (key) {
      currentDepth++;
      if (currentDepth > maxDepth) {
        currentDepth--;
        return '[Max Depth Exceeded]';
      }
    }

    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }

    // Handle functions
    if (typeof value === 'function') {
      return `[Function: ${value.name || 'anonymous'}]`;
    }

    // Handle BigInt
    if (typeof value === 'bigint') {
      return value.toString() + 'n';
    }

    // Handle symbols
    if (typeof value === 'symbol') {
      return value.toString();
    }

    // Handle undefined (convert to null for valid JSON)
    if (value === undefined) {
      return null;
    }

    // Handle Date objects
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Handle RegExp objects
    if (value instanceof RegExp) {
      return value.toString();
    }

    // Handle Error objects
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack
      };
    }

    if (key) currentDepth--;
    return value;
  };

  try {
    return JSON.stringify(obj, replacer, spaces);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const objType = typeof obj;
    const objKeys = obj && typeof obj === 'object' ? Object.keys(obj).join(', ') : 'N/A';
    
    throw new Error(
      `JSON serialization failed: ${errorMessage}\n` +
      `Object type: ${objType}\n` +
      `Object keys: ${objKeys}\n` +
      `Hint: Check for circular references, functions, or unsupported types`
    );
  }
}

/**
 * Parse JSON string with enhanced error reporting
 * 
 * @param jsonString - JSON string to parse
 * @param filePath - Optional file path for error context
 * @returns Parsed object
 * 
 * @example
 * const data = safeParse(fileContent, '.state/gate1-output.json')
 */
export function safeParse(jsonString: string, filePath?: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const contextInfo = filePath ? `\nFile: ${filePath}` : '';
    
    // Extract line number from error message if available
    const lineMatch = errorMessage.match(/position (\d+)/);
    const position = lineMatch ? parseInt(lineMatch[1]) : null;
    
    let snippet = '';
    if (position !== null) {
      const start = Math.max(0, position - 50);
      const end = Math.min(jsonString.length, position + 50);
      snippet = `\nNear position ${position}:\n...${jsonString.substring(start, end)}...`;
    }
    
    throw new Error(
      `JSON parsing failed: ${errorMessage}${contextInfo}${snippet}\n` +
      `Hint: Check for trailing commas, missing quotes, or invalid escape sequences`
    );
  }
}

/**
 * Validate JSON structure matches expected schema
 * 
 * @param data - Parsed JSON data
 * @param requiredFields - Array of required field paths (e.g., ['agentName', 'output.testCases'])
 * @returns Validation result with issues list
 * 
 * @example
 * const result = validateJsonStructure(data, ['agentName', 'status', 'output'])
 * if (!result.valid) {
 *   throw new Error(`Invalid structure: ${result.issues.join(', ')}`)
 * }
 */
export function validateJsonStructure(
  data: any,
  requiredFields: string[]
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  for (const fieldPath of requiredFields) {
    const parts = fieldPath.split('.');
    let current = data;
    let pathSoFar = '';

    for (const part of parts) {
      pathSoFar = pathSoFar ? `${pathSoFar}.${part}` : part;

      if (current === null || current === undefined) {
        issues.push(`Missing required field: ${pathSoFar}`);
        break;
      }

      if (typeof current !== 'object' || !(part in current)) {
        issues.push(`Missing required field: ${pathSoFar}`);
        break;
      }

      current = current[part];
    }

    // Check if final value is null/undefined
    if (current === null || current === undefined) {
      issues.push(`Field is null/undefined: ${fieldPath}`);
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
