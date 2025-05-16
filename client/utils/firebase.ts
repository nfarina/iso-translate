import { Analytics, getAnalytics, logEvent } from "firebase/analytics";
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: "flanders-web.firebaseapp.com",
  projectId: "flanders-web",
  storageBucket: "flanders-web.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// Determine if we're in development mode
const isDevelopment = import.meta.env.DEV === true;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics - but only in production
let analytics: Analytics | null = null;
try {
  if (!isDevelopment) {
    analytics = getAnalytics(app);
  } else {
    console.log("Analytics disabled in development mode");
  }
} catch (error) {
  console.error("Analytics initialization failed:", error);
}

// Helper functions for analytics
export const trackEvent = (
  eventName: string,
  eventParams: Record<string, any> = {},
) => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  } else if (isDevelopment) {
    console.log("[DEV] Would track event:", eventName, eventParams);
  } else {
    console.log(
      "Analytics not initialized, would track:",
      eventName,
      eventParams,
    );
  }
};

export const trackPageView = (pagePath: string) => {
  trackEvent("page_view", { page_path: pagePath });
};

export { analytics };
export default app;
