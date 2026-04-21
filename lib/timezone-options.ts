/** Curated IANA zones for trading — grouped for the settings picker. */
export const TIMEZONE_GROUPS: { region: string; options: { value: string; label: string }[] }[] = [
  {
    region: "Americas",
    options: [
      { value: "America/New_York", label: "New York (Eastern)" },
      { value: "America/Chicago", label: "Chicago (Central)" },
      { value: "America/Denver", label: "Denver (Mountain)" },
      { value: "America/Los_Angeles", label: "Los Angeles (Pacific)" },
      { value: "America/Toronto", label: "Toronto" },
      { value: "America/Vancouver", label: "Vancouver" },
      { value: "America/Sao_Paulo", label: "São Paulo" },
      { value: "America/Buenos_Aires", label: "Buenos Aires" },
    ],
  },
  {
    region: "Europe",
    options: [
      { value: "Europe/London", label: "London" },
      { value: "Europe/Paris", label: "Paris" },
      { value: "Europe/Berlin", label: "Berlin" },
      { value: "Europe/Zurich", label: "Zurich" },
      { value: "Europe/Frankfurt", label: "Frankfurt" },
      { value: "Europe/Amsterdam", label: "Amsterdam" },
      { value: "Europe/Madrid", label: "Madrid" },
      { value: "Europe/Rome", label: "Rome" },
      { value: "Europe/Stockholm", label: "Stockholm" },
      { value: "Europe/Helsinki", label: "Helsinki" },
      { value: "Europe/Warsaw", label: "Warsaw" },
      { value: "Europe/Athens", label: "Athens" },
      { value: "Europe/Istanbul", label: "Istanbul" },
    ],
  },
  {
    region: "Asia & Pacific",
    options: [
      { value: "Asia/Dubai", label: "Dubai" },
      { value: "Asia/Kolkata", label: "India (IST)" },
      { value: "Asia/Bangkok", label: "Bangkok" },
      { value: "Asia/Singapore", label: "Singapore" },
      { value: "Asia/Hong_Kong", label: "Hong Kong" },
      { value: "Asia/Shanghai", label: "Shanghai" },
      { value: "Asia/Tokyo", label: "Tokyo" },
      { value: "Asia/Seoul", label: "Seoul" },
      { value: "Australia/Sydney", label: "Sydney" },
      { value: "Australia/Melbourne", label: "Melbourne" },
      { value: "Pacific/Auckland", label: "Auckland" },
    ],
  },
  {
    region: "UTC",
    options: [{ value: "UTC", label: "UTC" }],
  },
];

export function allTimezoneOptionValues(): string[] {
  return TIMEZONE_GROUPS.flatMap((g) => g.options.map((o) => o.value));
}
