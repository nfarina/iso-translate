import { useEffect, useRef, useState } from "react";

interface AudioVisualizationProps {
  audioStream?: MediaStream | null;
  isActive: boolean;
  getAudioLevel?: () => number; // Optional function to get audio level
}

export default function AudioVisualization({
  audioStream,
  isActive,
  getAudioLevel,
}: AudioVisualizationProps) {
  const [bars, setBars] = useState<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  // Internal audio level calculation
  const getInternalAudioLevel = (): number => {
    if (!analyserRef.current) return 0;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate RMS (Root Mean Square) for volume level
    let sumOfSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalizedValue = dataArray[i] / 255;
      sumOfSquares += normalizedValue * normalizedValue;
    }

    const rms = Math.sqrt(sumOfSquares / dataArray.length);
    return Math.min(1, rms * 1);
  };

  useEffect(() => {
    if (!isActive) {
      setBars([]);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      return;
    }

    const setupAudioAnalysis = async () => {
      if (audioStream && !getAudioLevel) {
        try {
          audioContextRef.current = new AudioContext();

          if (audioContextRef.current.state === "suspended") {
            await audioContextRef.current.resume();
          }

          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          analyserRef.current.smoothingTimeConstant = 0.8;

          sourceRef.current =
            audioContextRef.current.createMediaStreamSource(audioStream);
          sourceRef.current.connect(analyserRef.current);
        } catch (error) {
          console.error("Error setting up audio analysis:", error);
        }
      }

      const animate = () => {
        const currentLevel = getAudioLevel
          ? getAudioLevel()
          : getInternalAudioLevel();
        const normalizedLevel = Math.min(1, currentLevel * 2.5);

        frameCountRef.current += 1;

        // Sample every 8 frames (like the original)
        if (frameCountRef.current >= 8) {
          frameCountRef.current = 0;
          setBars((prevBars) => {
            const newBars = [...prevBars, normalizedLevel];
            // Keep only the last 24 bars
            return newBars.length > 24
              ? newBars.slice(newBars.length - 24)
              : newBars;
          });
        }

        if (isActive) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    setupAudioAnalysis();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, [isActive, audioStream, getAudioLevel]);

  if (!isActive) return null;

  // Create 24 bars, padding with zeros if needed (like the original)
  const displayBars = [...Array(24 - bars.length).fill(0), ...bars];

  return (
    <div className="flex items-center justify-center gap-[3px] h-6 overflow-hidden px-1 pointer-events-none min-w-[130px]">
      {displayBars.map((level, index) => {
        const height = Math.max(3, Math.round(level * 24));
        const opacity = index < 5 ? 0.3 + index * 0.14 : 1; // Fade effect on left side

        return (
          <div
            key={index}
            className="w-[2px] rounded-sm transition-all duration-200 ease-out"
            style={{
              height: `${height}px`,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              opacity,
            }}
          />
        );
      })}
    </div>
  );
}
