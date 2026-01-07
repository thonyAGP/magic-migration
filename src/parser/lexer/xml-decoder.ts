/**
 * Magic Unipaas Expression Parser - XML Entity Decoder
 *
 * Handles decoding of XML entities in Magic expression strings.
 * Magic expressions are stored in XML attributes, so special characters
 * are encoded as XML entities.
 */

/**
 * Standard XML entities that need decoding
 */
const XML_ENTITIES: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&apos;': "'",
  '&quot;': '"',
};

/**
 * Regex to match XML entities
 */
const XML_ENTITY_REGEX = /&(lt|gt|amp|apos|quot|#\d+|#x[0-9a-fA-F]+);/g;

/**
 * Decode a single XML entity
 */
function decodeEntity(entity: string): string {
  // Named entity
  if (entity in XML_ENTITIES) {
    return XML_ENTITIES[entity];
  }

  // Numeric entity (decimal): &#123;
  if (entity.startsWith('&#') && !entity.startsWith('&#x')) {
    const codePoint = parseInt(entity.slice(2, -1), 10);
    return String.fromCodePoint(codePoint);
  }

  // Numeric entity (hexadecimal): &#x7B;
  if (entity.startsWith('&#x')) {
    const codePoint = parseInt(entity.slice(3, -1), 16);
    return String.fromCodePoint(codePoint);
  }

  // Unknown entity, return as-is
  return entity;
}

/**
 * Decode all XML entities in a string
 *
 * @param input - String with XML entities
 * @returns Decoded string
 *
 * @example
 * decodeXmlEntities("A &lt; B")     // "A < B"
 * decodeXmlEntities("A &amp;&amp; B") // "A && B"
 * decodeXmlEntities("1 &gt;= 0")   // "1 >= 0"
 */
export function decodeXmlEntities(input: string): string {
  return input.replace(XML_ENTITY_REGEX, (match) => decodeEntity(match));
}

/**
 * Encode special characters as XML entities
 * (useful for generating XML output)
 *
 * @param input - String to encode
 * @returns Encoded string with XML entities
 *
 * @example
 * encodeXmlEntities("A < B")   // "A &lt; B"
 * encodeXmlEntities("A & B")   // "A &amp; B"
 */
export function encodeXmlEntities(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Check if string contains XML entities
 */
export function hasXmlEntities(input: string): boolean {
  return XML_ENTITY_REGEX.test(input);
}
