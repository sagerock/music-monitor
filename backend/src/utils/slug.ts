/**
 * Generate a URL-friendly slug from an artist name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Replace special characters with their closest equivalent
    .replace(/[àáäâ]/g, 'a')
    .replace(/[èéëê]/g, 'e')
    .replace(/[ìíïî]/g, 'i')
    .replace(/[òóöô]/g, 'o')
    .replace(/[ùúüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    // Replace & with 'and'
    .replace(/&/g, 'and')
    // Replace spaces and non-alphanumeric with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-|-$/g, '');
}

/**
 * Ensure a slug is unique by appending a number if necessary
 */
export async function ensureUniqueSlug(
  slug: string, 
  existingCheck: (slug: string) => Promise<boolean>,
  currentId?: string
): Promise<string> {
  let finalSlug = slug;
  let counter = 1;
  
  while (await existingCheck(finalSlug)) {
    // If checking for current artist, and it matches, that's OK
    if (currentId) {
      const exists = await existingCheck(finalSlug);
      if (!exists) break;
    }
    
    finalSlug = `${slug}-${counter}`;
    counter++;
    
    // Safety check to prevent infinite loops
    if (counter > 100) {
      throw new Error('Unable to generate unique slug');
    }
  }
  
  return finalSlug;
}

/**
 * Validate that a slug is well-formed
 */
export function isValidSlug(slug: string): boolean {
  // Must be between 1 and 100 characters
  if (!slug || slug.length > 100) return false;
  
  // Must only contain lowercase letters, numbers, and hyphens
  // Must not start or end with a hyphen
  // Must not have consecutive hyphens
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  
  return slugRegex.test(slug);
}

/**
 * Examples:
 * "Taylor Swift" -> "taylor-swift"
 * "The Beatles" -> "the-beatles"
 * "blink-182" -> "blink-182"
 * "AC/DC" -> "ac-dc"
 * "Beyoncé" -> "beyonce"
 * "Post Malone" -> "post-malone"
 * "21 Pilots" -> "21-pilots"
 * "Mötley Crüe" -> "motley-crue"
 */