export const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "accounts", label: "Trading accounts" },
  { id: "preferences", label: "Preferences" },
  { id: "rules", label: "Rules" },
  { id: "security", label: "Security" },
  { id: "data", label: "Data & privacy" },
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"];

const VALID_SECTIONS = new Set<string>(SETTINGS_SECTIONS.map((s) => s.id));

export function parseSettingsSection(value: string | null | undefined): SettingsSectionId {
  if (value && VALID_SECTIONS.has(value)) return value as SettingsSectionId;
  return "profile";
}

export function settingsSectionDescription(section: SettingsSectionId): string {
  switch (section) {
    case "profile":
      return "Your display name and sign-in email.";
    case "accounts":
      return "Create, edit, delete, and set your main trading account.";
    case "preferences":
      return "Timezone and display currency for journal, calendar, and stats.";
    case "rules":
      return "Personal rules for journal checklists and stats.";
    case "security":
      return "Password, email, and active sessions.";
    case "data":
      return "Export your data and request account deletion.";
    default:
      return "Profile, preferences, security, and sessions.";
  }
}
