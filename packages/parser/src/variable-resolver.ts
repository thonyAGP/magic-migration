/**
 * Variable Resolver - FieldXXX → IDE Letters
 * Converts Magic variable IDs to human-readable IDE letters
 */

/**
 * Convert FieldN to IDE letter (A-Z, AA-ZZ, etc.)
 * 
 * Formula: N → Letter(N)
 * Examples:
 *   Field1 → A (1)
 *   Field26 → Z (26)
 *   Field27 → AA (26 + 1)
 *   Field52 → AZ (26×2)
 *   Field53 → BA (26×2 + 1)
 *   Field213 → HE (26×8 + 5)
 * 
 * @param fieldN - Field number (1-based)
 * @returns IDE letter (A, B, ..., Z, AA, AB, ..., ZZ, AAA, ...)
 */
export const fieldToLetter = (fieldN: number): string => {
  if (fieldN < 1) {
    throw new Error(`Invalid field number: ${fieldN} (must be >= 1)`);
  }

  let result = '';
  let n = fieldN;

  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }

  return result;
};

/**
 * Convert IDE letter to FieldN
 * 
 * Examples:
 *   A → Field1
 *   Z → Field26
 *   AA → Field27
 *   HE → Field213
 * 
 * @param letter - IDE letter (A-ZZZ)
 * @returns Field number (1-based)
 */
export const letterToField = (letter: string): number => {
  let result = 0;
  const upper = letter.toUpperCase();

  for (let i = 0; i < upper.length; i++) {
    const char = upper.charCodeAt(i);
    if (char < 65 || char > 90) {
      throw new Error(`Invalid letter: ${letter} (must be A-Z only)`);
    }
    result = result * 26 + (char - 64);
  }

  return result;
};

/**
 * Resolve variable name from FieldN or VG format
 * 
 * @param varRef - Variable reference (Field1, Field213, VG38, etc.)
 * @returns Human-readable variable name
 */
export const resolveVariableName = (varRef: string): string => {
  // Global variable (VGxx)
  if (varRef.startsWith('VG')) {
    return varRef; // Keep VG format
  }

  // Local variable (FieldN)
  const match = varRef.match(/^Field(\d+)$/);
  if (match) {
    const fieldN = parseInt(match[1], 10);
    return fieldToLetter(fieldN);
  }

  // Unknown format
  return varRef;
};

/**
 * Batch resolve multiple variables
 */
export const resolveVariables = (varRefs: string[]): Map<string, string> => {
  const map = new Map<string, string>();
  
  for (const ref of varRefs) {
    map.set(ref, resolveVariableName(ref));
  }
  
  return map;
};
