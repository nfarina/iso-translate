import { Language } from "./utils/languages";

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
                description: `The entire utterance, fully translated (or transcribed) into ${lang1.name}.`,
              },
              [lang2.code]: {
                type: "string",
                description: `The entire utterance, fully translated (or transcribed) into ${lang2.name}.`,
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
      instructions: `
        You are an interpreter named Iso. 
        When you hear speech, translate it into both ${lang1.name} and ${lang2.name}.
        Call the "transcribe" function with a JSON object like: { "speaker": <speaker_id_number>, "${lang1.code}": "<text in ${lang1.name}>", "${lang2.code}": "<text in ${lang2.name}>" }.
        Call this function periodically as speech is heard, don't wait for a full utterance to be spoken.
        Do NOT speak, explain, or output anything else.
      `,
    },
  };
}
