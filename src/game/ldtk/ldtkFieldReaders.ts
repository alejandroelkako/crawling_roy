import type { LdtkEntityInstance } from "./ldtkTypes";

export function readField(entity: LdtkEntityInstance, fieldName: string): unknown {
  return entity.fieldInstances.find((field) => field.__identifier === fieldName)?.__value;
}

export function readString(entity: LdtkEntityInstance, fieldName: string, fallback?: string): string {
  const value = readField(entity, fieldName);
  if (value === null || value === undefined || value === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(missingField(entity, fieldName));
  }
  if (typeof value !== "string") {
    throw new Error(fieldType(entity, fieldName, "string"));
  }
  return value;
}

export function readNullableString(entity: LdtkEntityInstance, fieldName: string): string | null {
  const value = readField(entity, fieldName);
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") {
    throw new Error(fieldType(entity, fieldName, "string or null"));
  }
  return value;
}

export function readBoolean(entity: LdtkEntityInstance, fieldName: string, fallback = false): boolean {
  const value = readField(entity, fieldName);
  if (value === null || value === undefined) return fallback;
  if (typeof value !== "boolean") {
    throw new Error(fieldType(entity, fieldName, "boolean"));
  }
  return value;
}

export function readNumber(entity: LdtkEntityInstance, fieldName: string, fallback?: number): number {
  const value = readField(entity, fieldName);
  if (value === null || value === undefined) {
    if (fallback !== undefined) return fallback;
    throw new Error(missingField(entity, fieldName));
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(fieldType(entity, fieldName, "number"));
  }
  return value;
}

function missingField(entity: LdtkEntityInstance, fieldName: string): string {
  return `Level entity "${entity.__identifier}" at x=${entity.px[0]} y=${entity.px[1]} is missing required field "${fieldName}".`;
}

function fieldType(entity: LdtkEntityInstance, fieldName: string, expected: string): string {
  return `Level entity "${entity.__identifier}" at x=${entity.px[0]} y=${entity.px[1]} field "${fieldName}" must be ${expected}.`;
}
