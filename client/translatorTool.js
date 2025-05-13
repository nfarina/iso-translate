export const translatorSessionUpdate = {
  type: "session.update",
  session: {
    tools: [
      {
        type: "function",
        name: "transcribe",
        description:
          "Return the speaker's words translated into English and Spanish. Never respond any other way.",
        parameters: {
          type: "object",
          properties: {
            color: {
              type: "string",
              description: "A unique CSS color representing the voice of the speaker, to distinguish them from other speakers in the UI. Multiple speakers may be speaking the same language.",
            },
            english: {
              type: "string",
              description:
                "The entire utterance, fully translated (or transcribed) into English.",
            },
            spanish: {
              type: "string",
              description:
                "The entire utterance, fully translated (or transcribed) into Spanish.",
            },
          },
          required: ["color", "english", "spanish"],
        },
      },
    ],
    // Force every response to be a call to this function
    tool_choice: { type: "function", name: "transcribe" },
    turn_detection: {
      type: "server_vad",
      interrupt_response: false,
    },
    instructions: `
      You are an interpreter named Iso. 
      When you hear speech, translate it into both Spanish and English and call the
      "transcribe" function with { "color": "<CSS color representing which voice is speaking>", "english": "<text>", "spanish": "<text>" }.
      Call this function periodically as speech is heard, don't wait for a full utterance to be spoken.
      Do NOT speak, explain, or output anything else.
    `,
  },
}; 