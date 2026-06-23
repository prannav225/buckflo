import { Shield } from "lucide-react";

export function PrivacyPolicy() {
  return (
    <div className="fade-in max-w-[640px] mx-auto">
      {/* Main Content */}
      <div className="flex flex-col gap-6 text-[0.9375rem] leading-relaxed text-(--text-secondary) pb-3">
        <div className="flex items-center gap-3 pb-4 border-b border-black/8 dark:border-white/6">
          <div className="w-10 h-10 rounded-xl bg-(--accent)/10 flex items-center justify-center shrink-0">
            <Shield size={20} className="text-(--accent)" />
          </div>
          <div>
            <div className="text-xs text-(--text-muted) font-medium">
              Last updated
            </div>
            <div className="font-semibold text-(--text)">June 23, 2026</div>
          </div>
        </div>

        <p>
          At <strong className="text-(--text)">buckflo</strong>, we hold your
          financial privacy in the absolute highest regard. This Privacy Policy
          details our operational data security principles.
        </p>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            1. Offline-First Privacy Architecture
          </h3>
          <p>
            buckflo is designed as an offline-first client application.{" "}
            <strong className="text-(--text)">
              All transactions, wallet structures, budgets, savings goals, and
              subscriptions are stored locally
            </strong>{" "}
            on your own device using browser-native IndexedDB databases.
          </p>
          <p>
            We do not host remote database clusters, and your raw data is never
            transferred, backed up, or made visible to us or any third parties.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            2. Data Security & Stewardship
          </h3>
          <p>
            Because your financial records reside entirely on your local device,
            the security of your cash flow details depends directly on securing
            your physical hardware.
          </p>
          <p>
            We recommend setting up secure device locks (biometrics, PINs) and
            taking advantage of full-disk encryption options supported by your
            operating system.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            3. Web Analytics (Minimal, Privacy-Respecting)
          </h3>
          <p>
            buckflo collects anonymized web traffic analytics (page views,
            device type, referral source, error logs) to improve the
            application. This data:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Is NOT linked to your financial records (which never leave your
              device)
            </li>
            <li>Respects your browser's "Do Not Track" preference</li>
            <li>
              Does NOT track user identity, location, or behavior across sites
            </li>
            <li>
              Does NOT use cookies for tracking (only session functionality)
            </li>
          </ul>
          <p>
            We do NOT use tracking pixels, behavioral advertising trackers, or
            third-party analytics networks that sell your data to marketers.
          </p>
          <p>
            <strong className="text-(--text)">
              Native Android builds do not send any analytics data.
            </strong>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            4. Infrastructure & Hosting
          </h3>
          <p>
            buckflo's web version is hosted on modern infrastructure services.
            These hosting providers may collect standard server logs:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>IP address</li>
            <li>HTTP request headers (User-Agent, Referer)</li>
            <li>Timestamp of request</li>
            <li>Response status code</li>
          </ul>
          <p>
            These logs are NOT linked to your financial data. Your financial
            records remain on your local device and are never transmitted to our
            servers.
          </p>
          <p>
            <strong className="text-(--text)">
              Android native builds communicate only with your local device.
            </strong>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            5. Browser Storage & Data Backup
          </h3>
          <p>
            Please note that clearing your web browser cookies, site storage
            caches, or application databases will permanently erase your local
            IndexedDB records.
          </p>
          <p>We recommend:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Exporting a full JSON database backup via the Profile page
              regularly
            </li>
            <li>
              Exporting transaction history as CSV before clearing browser data
            </li>
            <li>
              Setting device-level backups (browser sync, cloud backup) if
              available
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            6. Updates to this Policy
          </h3>
          <p>
            We may refine this policy to align with future standalone localized
            features. Any updates will take effect immediately upon deployment
            of the new package code and will be reflected on this page with an
            updated timestamp.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            7. Your Privacy Rights & Data Control
          </h3>
          <p>
            Because all your financial data remains on your device, you have
            complete autonomy:
          </p>
          <p>
            <strong className="text-(--text)">Right to Access:</strong> All your
            data is stored locally in your device's IndexedDB and browser
            storage. You can export it anytime.
          </p>
          <p>
            <strong className="text-(--text)">Right to Deletion:</strong> You
            can permanently delete all financial records by:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tapping "Wipe All Data" in Profile → Settings</li>
            <li>Clearing your browser's storage (web)</li>
            <li>Uninstalling the app (Android)</li>
          </ul>
          <p>
            <strong className="text-(--text)">Right to Portability:</strong>{" "}
            Export your complete financial history as:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>JSON (full database backup)</li>
            <li>CSV (transaction history)</li>
            <li>Both formats support import into other applications</li>
          </ul>
          <p>
            <strong className="text-(--text)">
              Data You Can Never Recover:
            </strong>{" "}
            Once deleted locally, data cannot be recovered because we never
            store it on our servers. Ensure regular backups.
          </p>
          <p>
            We cannot access, retrieve, or delete any of your records because we
            never receive them.
          </p>
        </div>
      </div>
    </div>
  );
}
