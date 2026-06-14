export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  features?: string[];
  fixes?: string[];
}

// Ensure the latest version is always the first item in the array.
export const changelogData: ChangelogEntry[] = [
  {
    version: "2.3.0",
    date: "2026-06-14",
    title: "True Native Experience & Live Updates",
    features: [
      "Transformed Buckflo into a true native Android app",
      "Introduced Over-The-Air (OTA) updates",
      "Added a completely transparent native Android status bar so the background gradient flows seamlessly",
      "Integrated native haptic feedback, replacing web vibrations with the phone's true Taptic Engine",
    ],
    fixes: [
      "Fixed Android hardware back button routing to properly close modals instead of crashing the app",
      "Fixed an issue where the native keyboard would awkwardly crush the webview when opened",
      "Fixed a bug preventing the file picker from selecting `.json` files on Android",
      "Optimized the native Splash Screen to hide perfectly after React fully mounts, preventing white flashes",
      "Adjusted Toast notification positions so they are never hidden behind camera cutouts or notches",
      "Hid the native webview scrollbars entirely on Android for a much cleaner look",
    ],
  },
  {
    version: "2.2.2",
    date: "2026-06-10",
    title: "Cinematic Onboarding & Notification Flow",
    features: [
      "Completely overhauled the Onboarding Setup Wizard into a cinematic, full-screen experience",
      "Replaced clunky setup progress pills with an ultra-thin continuous progress bar",
      "Added full fraction details to Savings Goal cards upon completion",
      "Introduced a reliable Notification Permission flow with an automated first-launch prompt",
      "Updated the Profile settings to natively display current browser notification permission status",
    ],
    fixes: [
      "Fixed notification permission synchronization with browser states",
      "Resolved typing issues with dynamic expense tracking fields",
    ],
  },
  {
    version: "2.2.1",
    date: "2026-06-08",
    title: "Cinematic Wrapped & Smart Notifications",
    features: [
      "Completely redesigned the Monthly Close Summary screen with a cinematic Bento Box grid layout",
      "Introduced an immersive, generative Pixel Art background for the Monthly Wrapped experience",
      "Added proactive Smart Push Notifications for Autopay, Bills, and Budget limits",
      "Introduced granular toggles in the Profile settings to control individual alerts",
      "Implemented Deep Linking so tapping a notification takes you exactly to the relevant screen",
      "Added smart bundling logic to combine multiple alerts into a single summary to prevent notification fatigue",
      "Added a 1-Tap Update Prompt to seamlessly deliver app updates without manual refreshing",
      "Upgraded the Changelog Modal with automated release tracking and refined typography",
    ],
    fixes: [
      "Fixed an issue with the Daily Reminder toggle getting out of sync with the database",
      "Improved performance by fetching the latest settings directly from the local database before saving",
      "Fixed layout overlapping issues between insight cards and spending trends",
      "Adjusted font weights on the Monthly Close screen to prevent faux-bolding and improve legibility",
      "Improved the internal styling and spacing within the Changelog Modal for better readability",
    ],
  },
  {
    version: "2.1",
    date: "2026-06-06",
    title: "Major Redesign & Experience Update",
    features: [
      "Added brand new Bottom Navigation for quick access",
      "Redesigned the Add/Edit Transaction flow with a cinematic modal",
      "Introduced Insight charts and Monthly spending breakdowns",
    ],
    fixes: [
      "Fixed an issue where the transaction modal would get stuck open",
      "Improved haptic feedback responsiveness across the app",
      "Enhanced overall animation performance",
    ],
  },
  // Previous versions can be added here...
];
