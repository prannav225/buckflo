import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scale } from "lucide-react";

export function TermsConditions() {
  const navigate = useNavigate();

  return (
    <div className="fade-in max-w-[640px] mx-auto pb-12">
      {/* Header */}
      <header className="flex items-center gap-3 mb-6 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Go Back"
        >
          <ArrowLeft size={20} className="text-(--text)" />
        </button>
        <h2 className="text-xl font-bold tracking-tight m-0 text-(--text)">
          Terms & Conditions
        </h2>
      </header>

      {/* Main Glass Content */}
      <div className="glass-card-strong p-6 flex flex-col gap-5 text-sm leading-relaxed text-(--text-secondary) max-h-[75vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center gap-3 pb-3 border-b border-black/8 dark:border-white/6">
          <div className="w-10 h-10 rounded-xl bg-(--accent)/10 flex items-center justify-center">
            <Scale size={20} className="text-(--accent)" />
          </div>
          <div>
            <div className="text-xs text-(--text-muted) font-medium">Effective date</div>
            <div className="font-semibold text-(--text)">May 27, 2026</div>
          </div>
        </div>

        <p>
          Welcome to <strong>buckflo</strong>. By accessing or using this web application, you agree to comply with and be bound by the following Terms & Conditions.
        </p>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-bold text-(--text) text-base">1. User Stewardship & Database Control</h3>
          <p>
            buckflo acts exclusively as a client-side interface wrapper for your local IndexedDB storage. You hold sole ownership and control of your database records.
          </p>
          <p>
            You are fully responsible for the protection, backup, and physical security of your device. We are not responsible for any data loss arising from cleared browser cookies, database corruption, or unauthorized physical access.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-bold text-(--text) text-base">2. Local Storage Disclaimer</h3>
          <p>
            Because buckflo does not sync data to any cloud storage servers, any actions taken to clear your browser data, reset your device cache, or uninstall site databases will permanently delete your financial history. Ensure you perform manual CSV exports of your transactions regularly to prevent loss.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-bold text-(--text) text-base">3. Disclaimer of Warranties</h3>
          <p>
            The application is provided "as is" and "as available", without warranty of any kind, express or implied. We do not guarantee that the application will operate continuously, error-free, or meet all of your accounting standards.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-bold text-(--text) text-base">4. Modifications of the Service</h3>
          <p>
            We reserve the right to modify, suspend, or discontinue the application features at any time. Changes to tools, charts, or algorithms will be pushed via standard build updates and operate locally on your client machine.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-bold text-(--text) text-base">5. Governing Law</h3>
          <p>
            These terms are governed by and construed in accordance with standard software usage principles. Any dispute arising under these terms shall be subject to localized mediation.
          </p>
        </div>
      </div>
    </div>
  );
}
