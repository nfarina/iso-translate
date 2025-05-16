import { useCallback, useEffect, useState } from "react";
import appVersion from "../../version.json";
import { useInterval } from "../utils/useInterval";

// Export the version string
export const VERSION = appVersion.version;

interface UpdateStatus {
  checking: boolean;
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
}

export function useVersionCheck(checkIntervalMs = 60000): {
  updateStatus: UpdateStatus;
  checkForUpdate: (userInitiated?: boolean) => Promise<void>;
} {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    checking: false,
    hasUpdate: false,
    latestVersion: VERSION,
    currentVersion: VERSION,
  });

  const checkForUpdate = useCallback(
    async (userInitiated = false) => {
      if (updateStatus.checking) return; // Prevent concurrent checks

      setUpdateStatus((prev) => ({ ...prev, checking: true }));
      try {
        const result = await checkForUpdates();
        setUpdateStatus({
          checking: false,
          hasUpdate: result.hasUpdate,
          latestVersion: result.latestVersion,
          currentVersion: result.currentVersion,
        });

        if (userInitiated && !result.hasUpdate) {
          alert("You're on the latest version!");
        }
      } catch (error) {
        console.error("Failed to check for updates:", error);
        setUpdateStatus((prev) => ({ ...prev, checking: false }));
      }
    },
    [updateStatus.checking],
  );

  // Initial check when hook is mounted
  useEffect(() => {
    checkForUpdate();
  }, []);

  // Set up periodic checks
  useInterval(checkForUpdate, checkIntervalMs);

  return {
    updateStatus,
    checkForUpdate,
  };
}

// Check if a new version is available
export async function checkForUpdates(): Promise<{
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
}> {
  try {
    // Fetch the current version from the server with cache-busting
    const timestamp = Date.now();
    const response = await fetch(`/version.json?timestamp=${timestamp}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch version: ${response.status}`);
    }

    const data = await response.json();
    const latestVersion = data.version;
    const currentVersion = VERSION;

    // Compare versions
    const hasUpdate = latestVersion !== currentVersion;

    return {
      hasUpdate,
      latestVersion,
      currentVersion,
    };
  } catch (error) {
    console.error("Error checking for updates:", error);
    return {
      hasUpdate: false,
      latestVersion: VERSION,
      currentVersion: VERSION,
    };
  }
}
