import { Scale } from "lucide-react";

export function TermsConditions() {
  return (
    <div className="fade-in max-w-[640px] mx-auto">
      {/* Main Content */}
      <div className="flex flex-col gap-6 text-[0.9375rem] leading-relaxed text-(--text-secondary) pb-2">
        <div className="flex items-center gap-3 pb-4 border-b border-black/8 dark:border-white/6">
          <div className="w-10 h-10 rounded-xl bg-(--accent)/10 flex items-center justify-center shrink-0">
            <Scale size={20} className="text-(--accent)" />
          </div>
          <div>
            <div className="text-xs text-(--text-muted) font-medium">
              Effective date
            </div>
            <div className="font-semibold text-(--text)">June 23, 2026</div>
          </div>
        </div>

        <p>
          Welcome to <strong className="text-(--text)">buckflo</strong>. By
          accessing or using this web application, you agree to comply with and
          be bound by the following Terms & Conditions.
        </p>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            1. User Stewardship & Database Control
          </h3>
          <p>
            buckflo acts exclusively as a client-side interface wrapper for your
            local IndexedDB storage. You hold sole ownership and control of your
            database records.
          </p>
          <p>
            You are fully responsible for the protection, backup, and physical
            security of your device. We are not responsible for any data loss
            arising from cleared browser cookies, database corruption, or
            unauthorized physical access.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            2. Local Storage Disclaimer
          </h3>
          <p>
            Because buckflo does not sync data to any cloud storage servers, any
            actions taken to clear your browser data, reset your device cache,
            or uninstall site databases will permanently delete your financial
            history. Ensure you perform manual CSV exports of your transactions
            regularly to prevent loss.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            3. Disclaimer of Warranties
          </h3>
          <p>
            The application is provided "as is" and "as available", without
            warranty of any kind, express or implied. We do not guarantee that
            the application will operate continuously, error-free, or meet all
            of your accounting standards.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            4. Modifications of the Service
          </h3>
          <p>
            We reserve the right to modify, discontinue, or sunset features at
            any time. Updates are delivered via:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Web: Standard browser deployment (instant)</li>
            <li>Android: App Store updates or OTA (Over-The-Air) deployment</li>
          </ul>
          <p>
            <strong className="text-(--text)">
              All changes are processed locally on your device.
            </strong>{" "}
            No financial data is ever sent to our servers for updates.
          </p>
          <p>
            Deprecated features may lose functionality, but your historical
            financial records will never be deleted or modified without explicit
            user action.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            5. Governing Law & Jurisdiction
          </h3>
          <p>
            These Terms & Conditions are governed by and construed in accordance
            with the laws of India, without regard to its conflict of law
            provisions.
          </p>
          <p>
            Any disputes arising from these Terms shall be subject to the
            exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            6. Limitation of Liability
          </h3>
          <p>
            To the maximum extent permitted by applicable law, in no event shall
            buckflo or its creators be liable for any:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Indirect, incidental, special, consequential, or punitive damages
            </li>
            <li>Loss of data, financial loss, or loss of profits</li>
            <li>Business interruption or revenue loss</li>
            <li>
              Errors in calculations, financial projections, or budget estimates
            </li>
          </ul>
          <p>
            This limitation applies even if advised of the possibility of such
            damages. Because buckflo is a personal finance tracker, not a
            regulated financial advisor, any financial decisions you make are
            solely your responsibility.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            7. Your Responsibilities & Device Security
          </h3>
          <p>You are solely responsible for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Securing your device with a PIN, biometric lock, or password
            </li>
            <li>Preventing unauthorized physical access to your device</li>
            <li>
              Regularly backing up your financial data (CSV or JSON export)
            </li>
            <li>Not sharing your device with untrusted users</li>
            <li>
              Clearing browser cache/storage manually if critical privacy is
              needed (web only)
            </li>
          </ul>
          <p>We are not liable for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Data loss from cleared browser storage</li>
            <li>Unauthorized access due to unsecured devices</li>
            <li>
              Financial errors or miscalculations resulting from your input
            </li>
            <li>Loss of data from device theft or corruption</li>
          </ul>
          <p>
            Because buckflo stores all data locally on your device,{" "}
            <strong className="text-(--text)">
              you control the security of your financial records.
            </strong>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            8. Data Deletion & Account Termination
          </h3>
          <p>
            Because buckflo doesn't maintain accounts or cloud-hosted records,
            there is no "account" to delete from our servers.
          </p>
          <p>To delete all your financial data permanently:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-(--text)">Web:</strong> Clear browser
              storage via Settings → Storage → Clear Site Data
            </li>
            <li>
              <strong className="text-(--text)">Android:</strong> Uninstall the
              app, OR tap "Wipe All Data" in Profile settings
            </li>
            <li>
              <strong className="text-(--text)">All Platforms:</strong> Export a
              JSON backup first if you need a record
            </li>
          </ul>
          <p>
            Once deleted locally, your data cannot be recovered. We have no
            backup copies to restore.
          </p>
          <p>
            Uninstalling the app does not delete your data; you must manually
            wipe it or clear browser storage.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-(--text) text-base">
            9. No Financial, Tax, or Legal Advice
          </h3>
          <p>
            buckflo is a personal finance tracker,{" "}
            <strong className="text-(--text)">
              not a financial advisor, tax consultant, or legal service.
            </strong>
          </p>
          <p>We do not:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide investment advice</li>
            <li>Calculate tax liabilities or deductions</li>
            <li>Guarantee accuracy of financial projections</li>
            <li>Replace consultation with a certified financial advisor</li>
          </ul>
          <p>You are responsible for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verifying all calculations independently</li>
            <li>Consulting a tax professional for tax-related decisions</li>
            <li>Ensuring compliance with local financial regulations</li>
            <li>
              Maintaining accurate records for audits or financial reporting
            </li>
          </ul>
          <p>
            Use buckflo as a personal tool for awareness and tracking, not as
            the sole basis for financial decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
