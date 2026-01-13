export const STORAGE_KEY = "identity-form-data";

export interface IdentityFormData {
  sexe: string;
  age: string;
  profession: string;
  typePoste: string;
  specialite: string;
  travailUrgences: string;
  structure: string;
  region: string;
  origineEthnique: string;
  valid: boolean;
}

export function getIdentityFromStorage(): IdentityFormData | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data) as IdentityFormData;
    } catch {
      return null;
    }
  }
  return null;
}
