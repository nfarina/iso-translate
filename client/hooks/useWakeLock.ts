import { useCallback, useEffect, useRef } from "react";

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    if (!navigator.wakeLock) {
      console.warn("Wake Lock API is not supported in this browser.");
      return false;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      console.log("Wake lock acquired.");
      return true;
    } catch (err) {
      console.error("Failed to acquire wake lock:", err);
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      return wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null;
        return true;
      });
    }
    return Promise.resolve(false);
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
    isActive: !!wakeLockRef.current,
    requestWakeLock,
    releaseWakeLock,
  };
}
