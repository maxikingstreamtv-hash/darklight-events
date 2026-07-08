import { appRoles, isAppRole, type AppRole } from "@/lib/auth/types";

export type UserFormValues = {
  username: string;
  displayName: string;
  password: string;
  role: AppRole;
  avatar: string;
  bio: string;
};

export function readUserForm(formData: FormData): UserFormValues {
  const roleValue = String(formData.get("role") ?? "USER");

  return {
    username: String(formData.get("username") ?? "").trim(),
    displayName: String(formData.get("displayName") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    role: isAppRole(roleValue) ? roleValue : "USER",
    avatar: String(formData.get("avatar") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
  };
}

export function validateCreateUser(values: UserFormValues, assignableRoles: AppRole[]) {
  if (values.username.length < 3) {
    return "Brugernavn skal være mindst 3 tegn.";
  }

  if (values.displayName.length < 2) {
    return "Visningsnavn skal være mindst 2 tegn.";
  }

  if (values.password.length < 8) {
    return "Adgangskoden skal være mindst 8 tegn.";
  }

  if (!appRoles.includes(values.role) || !assignableRoles.includes(values.role)) {
    return "Du kan ikke tildele den valgte rolle.";
  }

  return null;
}

export function validateUpdateUser(values: UserFormValues, assignableRoles: AppRole[]) {
  if (values.displayName.length < 2) {
    return "Visningsnavn skal være mindst 2 tegn.";
  }

  if (values.password && values.password.length < 8) {
    return "Ny adgangskode skal være mindst 8 tegn.";
  }

  if (!appRoles.includes(values.role) || !assignableRoles.includes(values.role)) {
    return "Du kan ikke tildele den valgte rolle.";
  }

  return null;
}

export function isValidId(value: FormDataEntryValue | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
