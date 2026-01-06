import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * Used during user registration
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify a password against a hash
 * Used by NextAuth credentials provider during login
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
