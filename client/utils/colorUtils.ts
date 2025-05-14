export function getSpeakerColor(speaker: number): string {
  const colors = [
    "#4A90E2", // Blue
    "#50E3C2", // Teal
    "#F5A623", // Orange
    "#9013FE", // Purple
    "#417505", // Green
    "#BD10E0", // Pinkish-Purple
    "#D0021B", // Red
    "#7ED321", // Lime Green
  ];
  // Ensure speaker is a non-negative integer for modulo
  const speakerIndex = Math.max(0, Math.floor(speaker));
  return colors[speakerIndex % colors.length];
}
