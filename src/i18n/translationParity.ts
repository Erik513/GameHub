type TranslationResource = Readonly<Record<string, unknown>>;

interface CollectedTranslations {
  readonly values: ReadonlyMap<string, string>;
  readonly invalidKeys: readonly string[];
}

function collectTranslations(resource: TranslationResource): CollectedTranslations {
  const values = new Map<string, string>();
  const invalidKeys: string[] = [];

  function visit(value: unknown, path: string) {
    if (typeof value === "string") {
      values.set(path, value);
      return;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [key, nestedValue] of Object.entries(value)) {
        visit(nestedValue, path ? `${path}.${key}` : key);
      }
      return;
    }

    invalidKeys.push(path || "<root>");
  }

  visit(resource, "");
  return { values, invalidKeys };
}

export function assertTranslationParity(
  referenceName: string,
  reference: TranslationResource,
  candidateName: string,
  candidate: TranslationResource,
): void {
  const referenceTranslations = collectTranslations(reference);
  const candidateTranslations = collectTranslations(candidate);
  const issues: string[] = [];

  for (const key of referenceTranslations.values.keys()) {
    if (!candidateTranslations.values.has(key)) {
      issues.push(`${candidateName} is missing key "${key}"`);
    }
  }

  for (const key of candidateTranslations.values.keys()) {
    if (!referenceTranslations.values.has(key)) {
      issues.push(`${candidateName} has unexpected key "${key}"`);
    }
  }

  for (const [key, value] of referenceTranslations.values) {
    if (!value.trim()) {
      issues.push(`${referenceName} has an empty value at "${key}"`);
    }
  }

  for (const [key, value] of candidateTranslations.values) {
    if (!value.trim()) {
      issues.push(`${candidateName} has an empty value at "${key}"`);
    }
  }

  for (const key of referenceTranslations.invalidKeys) {
    issues.push(`${referenceName} has a non-text value at "${key}"`);
  }

  for (const key of candidateTranslations.invalidKeys) {
    issues.push(`${candidateName} has a non-text value at "${key}"`);
  }

  if (issues.length > 0) {
    throw new Error(`Translation parity check failed:\n- ${issues.sort().join("\n- ")}`);
  }
}
