export interface SessionEvent {
  type: string;
  timestamp?: string;
  event_id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  _direction?: "sent" | "received" | "internal";
}

export interface TranslationSegment {
  id: string;
  speaker: number;
  timestamp: number;
  translations: Record<string, string>;
  language1: { code: string; name: string };
  language2: { code: string; name: string };
}

export interface Session {
  isSessionActive: boolean;
  events: SessionEvent[];
  translationSegments: TranslationSegment[];
  tokenUsage: any | null; // Using any to avoid circular imports
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  mediaStream?: MediaStream | null; // Add mediaStream for audio visualization
}
