/** Demo P&L by day-of-month (marketing only) */
export const pnlMap: Record<string, number> = {
  "4": 180,
  "5": -85,
  "6": 45,
  "8": 220,
  "12": -40,
  "14": 125,
  "15": 310,
  "19": -120,
  "20": 60,
  "22": 95,
  "26": -50,
  "27": 170,
};

export const calendarRows: string[][] = [
  ["", "", "", "", "", "1", "2"],
  ["3", "4", "5", "6", "7", "8", "9"],
  ["10", "11", "12", "13", "14", "15", "16"],
  ["17", "18", "19", "20", "21", "22", "23"],
  ["24", "25", "26", "27", "28", "29", "30"],
];

export function weekRowSum(row: string[]) {
  return row.reduce((acc, day) => {
    if (!day) return acc;
    const v = pnlMap[day];
    return typeof v === "number" ? acc + v : acc;
  }, 0);
}

export function dayCellTone(day: string) {
  if (!day) return "empty" as const;
  const v = pnlMap[day];
  if (typeof v !== "number") return "flat" as const;
  if (v > 0) return "up" as const;
  if (v < 0) return "down" as const;
  return "flat" as const;
}
