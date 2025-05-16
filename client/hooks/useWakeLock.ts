import { useCallback, useEffect, useRef, useState } from "react";

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [isActive, setIsActive] = useState(false);

  const requestWakeLock = useCallback(async () => {
    if (!navigator.wakeLock) {
      console.warn("Wake Lock API is not supported in this browser.");
      return false;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      console.log("Wake lock acquired");
      setIsActive(true);
      return true;
    } catch (err) {
      console.error("Failed to acquire wake lock:", err);
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        console.log("Wake lock released.");
        wakeLockRef.current = null;
        setIsActive(false);
        return true;
      } catch (err) {
        console.error("Failed to release wake lock:", err);
        // Still clear the reference even if release fails
        wakeLockRef.current = null;
        setIsActive(false);
        return false;
      }
    }
    return false;
  }, []);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible" && !wakeLockRef.current) {
      requestWakeLock();
    }
  }, [requestWakeLock]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      releaseWakeLock();
    };
  }, [handleVisibilityChange, releaseWakeLock]);

  return {
    isSupported: !!navigator.wakeLock,
    isActive,
    requestWakeLock,
    releaseWakeLock,
  };
}
