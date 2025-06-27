import { clsx, type ClassValue } from "clsx";

/**
 * Utility function to merge class names conditionally
 * Uses clsx for conditional class name handling
 *
 * @param inputs - Class names or conditional class objects
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export default cn;
