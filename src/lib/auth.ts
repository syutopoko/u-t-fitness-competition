import { DUMMY_EMAIL_DOMAIN } from "./constants";
import type { Language } from "./types";

const instagramPattern = /^[a-z0-9_.]+$/;

export function normalizeInstagramName(value: string) {
  return value.trim().toLowerCase();
}

export function validateInstagramName(value: string, language: Language = "ja") {
  const normalized = normalizeInstagramName(value);
  if (!normalized) {
    return language === "ja" ? "名前を入力してください。" : "Please enter your name.";
  }
  if (!instagramPattern.test(normalized)) {
    return language === "ja"
      ? "名前は英数字、アンダースコア、ドットのみ使用できます。"
      : "Use only letters, numbers, underscores, and dots for your name.";
  }
  return null;
}

export function instagramNameToEmail(value: string) {
  return `${normalizeInstagramName(value)}@${DUMMY_EMAIL_DOMAIN}`;
}
