export function getSpeakerColor(speaker: number): string {
  const colors = [
    "#008080", // Teal
    "#FF8C00", // Orange
    "#0000FF", // Blue
    "#FF0000", // Red
    "#800080", // Pinkish-Purple
    "#008000", // Lime Green
  ];
  // Ensure speaker is a non-negative integer for modulo
  const speakerIndex = Math.max(0, Math.floor(speaker));
  return colors[(speakerIndex - 1) % colors.length];
}

export function getSpeakerColorDark(speaker: number): string {
  const colors = [
    "#50E3C2", // Teal
    "#F5A623", // Orange
    "#4A90E2", // Blue
    "#D0021B", // Red
    "#BD10E0", // Pinkish-Purple
    "#7ED321", // Lime Green
  ];
  // Ensure speaker is a non-negative integer for modulo
  const speakerIndex = Math.max(0, Math.floor(speaker));
  return colors[(speakerIndex - 1) % colors.length];
}
