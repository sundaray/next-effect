import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugifyLib from "@sindresorhus/slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFieldErrorId(fieldName: string, uniqueId: string) {
  return `${fieldName}-${uniqueId}-error`;
}

export function countWords(text: string): number {
  if (!text || text.length === 0) {
    return 0;
  }

  const plainText = text.replace(/<[^>]*>/g, " ");
  return plainText.trim().split(/\s+/).filter(Boolean).length;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function slugify(text: string): string {
  return slugifyLib(text);
}

export function unslugify(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}
