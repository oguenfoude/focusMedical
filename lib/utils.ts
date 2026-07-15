import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function computeAgeFromDob(dob: string): number {
  const [day, month, year] = dob.split("/").map(Number);
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function isDobFormat(value: string): boolean {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
}

export function formatAgeDisplay(age: string | null, yearsOldLabel: string): { line1: string; line2: string | null } {
  if (!age) return { line1: "", line2: null };
  if (isDobFormat(age)) {
    const years = computeAgeFromDob(age);
    return { line1: `${years} ${yearsOldLabel}`, line2: age };
  }
  return { line1: `${age} ${yearsOldLabel}`, line2: null };
}

/**
 * Convert an image to base64 data URL for PDF embedding.
 * If the input is already a base64 data URL, returns it directly.
 * If the input is an external URL, fetches and converts it.
 */
export async function imageToBase64(url: string): Promise<string | null> {
  // Already base64 — return directly
  if (url.startsWith("data:")) return url;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
