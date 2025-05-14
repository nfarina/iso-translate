import { TranslationSegment } from "../hooks/useOpenAISession";
import { merge } from "./merge";

export function compressTranslationSegments(
  segments: TranslationSegment[],
): TranslationSegment[] {
  const newSegments: TranslationSegment[] = [];
  let lastSegment: TranslationSegment | null = null;

  // We're modifying the segments in place, so we need to merge them first.
  for (const segment of segments) {
    if (
      !lastSegment ||
      segment.timestamp > lastSegment.timestamp + 2500 ||
      segment.speaker !== lastSegment.speaker
    ) {
      // It's been long enough or has a different speaker, so we
      // need a new segment.
      const cloned = merge(segment);
      newSegments.push(cloned);
      lastSegment = cloned;
    } else {
      // We can append the text to the last segment.
      lastSegment.translations[segment.language1.code] =
        lastSegment.translations[segment.language1.code] +
        " " +
        segment.translations[segment.language1.code];
      lastSegment.translations[segment.language2.code] =
        lastSegment.translations[segment.language2.code] +
        " " +
        segment.translations[segment.language2.code];
      lastSegment.timestamp = segment.timestamp;
    }
  }

  return newSegments;
}

/**
 * Unused now that we discovered output_index.
 */
export function mergeTranslationSegments(
  existingSegments: TranslationSegment[],
  newSegment: TranslationSegment,
) {
  const newSegments = [...existingSegments];
  const modifiedSegment = { ...newSegment };

  // Only consider the last 10 segments for merging.
  const last10Segments = newSegments.slice(-10);

  modifiedSegment.translations[newSegment.language1.code] = mergeTranslation(
    last10Segments,
    newSegment.language1.code,
    newSegment.translations[newSegment.language1.code],
  );

  modifiedSegment.translations[newSegment.language2.code] = mergeTranslation(
    last10Segments,
    newSegment.language2.code,
    newSegment.translations[newSegment.language2.code],
  );

  // Only add the segment if it has a non-duplicate translation in either language.
  if (
    modifiedSegment.translations[newSegment.language1.code] !== "" ||
    modifiedSegment.translations[newSegment.language2.code] !== ""
  ) {
    newSegments.push(modifiedSegment);
  }

  return newSegments;
}

function mergeTranslation(
  segments: TranslationSegment[],
  code: string,
  newText: string,
): string {
  console.log("mergeTranslation", segments, code, newText);

  // First build a giant string of all language1 translations thus far.
  const justTranslations = segments.map(
    (segment) => segment.translations[code],
  );

  const existingText = justTranslations.join(" ");

  console.log("existingText", existingText);
  console.log("newText", newText);
  console.log("existingText.endsWith(newText)", existingText.endsWith(newText));

  // If the existing text ends with the beginning of the new text, we want to merge them.
  if (existingText.endsWith(newText)) {
    console.log(
      `mergeTranslation: existingText ends with newText: "${existingText}" ends with "${newText}"`,
    );
    return "";
  }

  // Otherwise, we want to preserve the new text.
  return newText;
}

const testSegments = [
  {
    id: "c9173277-7b0d-4df7-a5e3-f0bb7ac26d85",
    speaker: 1,
    translations: {
      en: "Well, it didn't translate the English part.",
      es: "Bueno, no tradujo la parte en inglés.",
    },
    language1: {
      name: "English",
      code: "en",
    },
    language2: {
      name: "Spanish",
      code: "es",
    },
  },
  {
    id: "1f379264-ee5d-498d-b89d-adfa8ec0cf4a",
    speaker: 1,
    translations: {
      en: "Because it kept it as gesundheit.",
      es: "Porque lo mantuvo como gesundheit.",
    },
    language1: {
      name: "English",
      code: "en",
    },
    language2: {
      name: "Spanish",
      code: "es",
    },
  },
  {
    id: "84257c17-c5ec-4274-ba5b-f94551573847",
    speaker: 1,
    translations: {
      en: "But",
      es: "Pero",
    },
    language1: {
      name: "English",
      code: "en",
    },
    language2: {
      name: "Spanish",
      code: "es",
    },
  },
  {
    id: "3163075b-a034-4f34-9eed-66a5ec4c89e4",
    speaker: 1,
    translations: {
      en: "Still very cool.",
      es: "Aún así muy genial.",
    },
    language1: {
      name: "English",
      code: "en",
    },
    language2: {
      name: "Spanish",
      code: "es",
    },
  },
  {
    id: "21c0783a-0e69-472b-8aa1-aa0ce877062f",
    speaker: 1,
    translations: {
      en: "Thank you.",
      es: "Gracias.",
    },
    language1: {
      name: "English",
      code: "en",
    },
    language2: {
      name: "Spanish",
      code: "es",
    },
  },
  {
    id: "fdbbdb3c-d2b4-4f38-8ed0-fbaf6e6cbedc",
    speaker: 1,
    translations: {
      en: "This is really cool.",
      es: "Esto es realmente genial.",
    },
    language1: {
      name: "English",
      code: "en",
    },
    language2: {
      name: "Spanish",
      code: "es",
    },
  },
  {
    id: "e2b8c42e-11bd-4f2c-ace6-fef88d4d1ac1",
    speaker: 1,
    translations: {
      en: "Huh.",
      es: "Vaya.",
    },
    language1: {
      name: "English",
      code: "en",
    },
    language2: {
      name: "Spanish",
      code: "es",
    },
  },
  {
    id: "e2f2f61c-f653-4887-8f23-def4ad6966e4",
    speaker: 1,
    translations: {
      en: "Four score and seven years ago, our forefathers brought forth",
      es: "Hace ochenta y siete años, nuestros antepasados trajeron a este continente",
    },
    language1: {
      name: "English",
      code: "en",
    },
    language2: {
      name: "Spanish",
      code: "es",
    },
  },
  {
    id: "fb51f4ad-f425-4696-9122-10aec3a758d2",
    speaker: 1,
    translations: {
      en: "into this continent a new nation",
      es: "a este continente una nueva nación",
    },
    language1: {
      name: "English",
      code: "en",
    },
    language2: {
      name: "Spanish",
      code: "es",
    },
  },
  {
    id: "706512e6-f05f-47ca-b568-4996234614ee",
    speaker: 1,
    translations: {
      en: "conceived in Liberty and dedicated to the proposition that all men are created equal.",
      es: "concebida en la libertad y dedicada a la proposición de que todos los hombres son creados iguales.",
    },
    language1: {
      name: "English",
      code: "en",
    },
    language2: {
      name: "Spanish",
      code: "es",
    },
  },
];

const testNewText =
  "Four score and seven years ago, our forefathers brought forth into this continent a new nation, conceived in Liberty and dedicated to the proposition that all men are created equal.";

const testCode = "en";

// console.log(
//   "Test mergeTranslation",
//   mergeTranslation(testSegments, testCode, testNewText),
// );
