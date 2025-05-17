import { Language } from "./utils/languages";
import { dedent } from "./utils/strings";

export function getTranslatorSessionUpdate(lang1: Language, lang2: Language) {
  return {
    type: "session.update",
    session: {
      tools: [
        {
          type: "function",
          name: "transcribe",
          description: `Return the speaker's words translated into ${lang1.name} and ${lang2.name}. Never respond any other way.`,
          parameters: {
            type: "object",
            properties: {
              speaker: {
                type: "number",
                description:
                  "A unique number representing the voice of the person speaking, to distinguish them from other speakers in the UI. Multiple people may be speaking and each should have their own (stable) numbers.",
              },
              [lang1.code]: {
                type: "string",
                description: `The entire utterance, fully translated (or transcribed) into ${
                  lang1.name
                }. ${lang1.annotationInstructions ?? ""}`,
              },
              [lang2.code]: {
                type: "string",
                description: `The entire utterance, fully translated (or transcribed) into ${
                  lang2.name
                }. ${lang2.annotationInstructions ?? ""}`,
              },
            },
            required: ["speaker", lang1.code, lang2.code],
          },
        },
      ],
      tool_choice: { type: "function", name: "transcribe" },
      turn_detection: {
        type: "server_vad",
        interrupt_response: false,
      },
      instructions: dedent(`
        You are an interpreter named Iso. 
        When you hear speech, translate it into both ${lang1.name} and ${lang2.name}, then call the "transcribe" function.
        Call this function periodically as speech is heard; don't wait for a full utterance to be spoken.
        Do NOT speak, explain, or output anything else.
      `),
    },
  };
}
