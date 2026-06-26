import { useState, useMemo } from "react";
import {
  ArrowRight,
  ArrowDownToLine,
  CheckCircle,
  Smartphone,
  Share,
  PlusSquare,
  X,
  Monitor,
  Globe,
  Copy,
} from "lucide-react";
import { FloatingHeroCards } from "./FloatingHeroCards";

interface LandingHeroProps {
  onStart: () => void;
  deferredPrompt: any;
  handleInstallClick: () => void;
  isInstalled: boolean;
  deviceType: "android" | "ios" | "desktop";
  showIosTip: boolean;
  setShowIosTip: (show: boolean) => void;
}

export function LandingHero({
  onStart,
  deferredPrompt,
  handleInstallClick,
  isInstalled,
  deviceType,
  showIosTip,
  setShowIosTip,
}: LandingHeroProps) {
  const [iosStep, setIosStep] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);

  // Detect if iOS user is on Safari (only browser that supports PWA install on iOS)
  const isIosSafari = useMemo(() => {
    if (deviceType !== "ios") return false;
    const ua = navigator.userAgent;
    // Safari on iOS: has "Safari" in UA but NOT "CriOS" (Chrome), "FxiOS" (Firefox), "EdgiOS" (Edge), etc.
    return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  }, [deviceType]);

  const iosSteps = [
    {
      icon: <Share size={18} className="text-(--accent)" />,
      title: "Tap the Share button",
      description: "Find the share icon at the bottom of Safari",
    },
    {
      icon: <PlusSquare size={18} className="text-(--accent)" />,
      title: 'Tap "Add to Home Screen"',
      description: "Scroll down in the share menu to find it",
    },
    {
      icon: <CheckCircle size={18} className="text-(--credit)" />,
      title: 'Tap "Add"',
      description: "buckflo will appear on your home screen like a real app!",
    },
  ];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-28 relative z-10 max-w-[1100px] mx-auto">
      <div className="text-left lg:col-span-7 flex flex-col items-start">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light! font-display tracking-tight text-(--text) mb-6 leading-[1.05]">
          Track everything. <br />
          Understand your patterns. <br />
          <span className="italic font-display tracking-normal text-(--accent)">
            Spend better.
          </span>
        </h1>

        <p className="landing-body text-base sm:text-lg leading-relaxed mb-8 mt-4 max-w-[500px]">
          <strong className="text-(--accent) font-display tracking-wide italic font-normal! text-lg">
            buckflo
          </strong>{" "}
          is an offline-first personal ledger that gives you total clarity over
          your spending. Two wallets, one view, zero cloud dependency.
        </p>

        {/* ─── Primary CTAs ─── */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center mb-4 relative">
          {deviceType === "android" ? (
            <a
              href="/buckflo.apk"
              download
              className="hero-install-btn no-underline"
              id="btn-landing-download-apk"
            >
              <span className="hero-install-btn-icon hero-install-btn-icon--android">
                <Smartphone size={16} />
              </span>
              <span className="hero-install-btn-text">
                <span className="hero-install-btn-label">
                  Download for Android
                </span>
                <span className="hero-install-btn-sub">
                  APK • Ready to install
                </span>
              </span>
            </a>
          ) : deviceType === "ios" ? (
            <div className="relative flex flex-col items-center sm:items-start">
              <button
                onClick={() => {
                  setShowIosTip(!showIosTip);
                  setIosStep(0);
                }}
                className="hero-install-btn"
                id="btn-landing-install-ios"
              >
                <span className="hero-install-btn-icon hero-install-btn-icon--ios">
                  <ArrowDownToLine size={16} />
                </span>
                <span className="hero-install-btn-text">
                  <span className="hero-install-btn-label">
                    Install on iPhone
                  </span>
                  <span className="hero-install-btn-sub">
                    {isIosSafari
                      ? "Add to Home Screen • 2 steps"
                      : "Open in Safari to install"}
                  </span>
                </span>
              </button>

              {/* iOS Install Guide Overlay */}
              {showIosTip && (
                <div
                  className="ios-install-guide"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setShowIosTip(false)}
                    className="ios-install-guide-close"
                    aria-label="Close guide"
                  >
                    <X size={14} />
                  </button>

                  {/* Header */}
                  <div className="ios-install-guide-header">
                    <img
                      src="/buckflo_favicon.svg"
                      alt="buckflo"
                      className="w-8 h-8 rounded-lg"
                    />
                    <div>
                      <p className="text-sm font-semibold text-(--text) leading-tight">
                        Install buckflo
                      </p>
                      <p className="text-[11px] text-(--text-muted) leading-tight mt-0.5">
                        {isIosSafari
                          ? "Add to your home screen in seconds"
                          : "Requires Safari to install"}
                      </p>
                    </div>
                  </div>

                  {isIosSafari ? (
                    <>
                      {/* Safari Steps */}
                      <div className="ios-install-guide-steps">
                        {iosSteps.map((step, i) => (
                          <button
                            key={i}
                            className={`ios-install-step ${
                              iosStep === i ? "ios-install-step--active" : ""
                            } ${iosStep > i ? "ios-install-step--done" : ""}`}
                            onClick={() => setIosStep(i)}
                          >
                            <div className="ios-install-step-num">
                              {iosStep > i ? (
                                <CheckCircle
                                  size={16}
                                  className="text-(--credit)"
                                />
                              ) : (
                                <span>{i + 1}</span>
                              )}
                            </div>
                            <div className="ios-install-step-content">
                              <div className="ios-install-step-icon-row">
                                {step.icon}
                                <span className="text-[13px] font-semibold text-(--text)">
                                  {step.title}
                                </span>
                              </div>
                              {iosStep === i && (
                                <p className="text-[11px] text-(--text-muted) mt-1 leading-relaxed ios-step-desc-enter">
                                  {step.description}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Step navigation */}
                      <div className="ios-install-guide-nav">
                        {iosStep < iosSteps.length - 1 ? (
                          <button
                            onClick={() => setIosStep(iosStep + 1)}
                            className="ios-install-nav-btn"
                          >
                            Next step
                            <ArrowRight size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowIosTip(false)}
                            className="ios-install-nav-btn ios-install-nav-btn--done"
                          >
                            <CheckCircle size={14} />
                            Got it!
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Chrome / non-Safari on iOS */
                    <div className="ios-chrome-guide">
                      <div className="ios-chrome-guide-notice">
                        <Globe size={16} className="text-(--accent) shrink-0" />
                        <p className="text-[12px] text-(--text-secondary) leading-relaxed">
                          iPhone apps can only be installed from{" "}
                          <strong className="text-(--text)">Safari</strong>.
                          Open this page in Safari to add buckflo to your home
                          screen.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2000);
                        }}
                        className="ios-chrome-copy-btn"
                      >
                        {linkCopied ? (
                          <>
                            <CheckCircle size={14} />
                            Link copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy link to open in Safari
                          </>
                        )}
                      </button>

                      <p className="text-[10px] text-(--text-muted) text-center mt-2 leading-relaxed">
                        Or you can use buckflo right here in Chrome —{" "}
                        <button
                          onClick={() => {
                            setShowIosTip(false);
                            onStart();
                          }}
                          className="text-(--accent) underline font-medium"
                        >
                          Launch App
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="hero-install-btn"
              id="btn-landing-install"
            >
              <span className="hero-install-btn-icon hero-install-btn-icon--desktop">
                <Monitor size={16} />
              </span>
              <span className="hero-install-btn-text">
                <span className="hero-install-btn-label">
                  Install Desktop App
                </span>
                <span className="hero-install-btn-sub">Works offline</span>
              </span>
            </button>
          ) : isInstalled ? (
            <div className="flex items-center justify-center gap-1.5 text-xs text-(--credit) font-semibold py-3.5 px-5 rounded-full bg-(--credit)/8 border border-(--credit)/20">
              <CheckCircle size={14} /> Installed
            </div>
          ) : (
            <button
              onClick={onStart}
              className="btn-primary py-3.5 px-8 text-base shadow-lg shadow-(--accent)/20 flex justify-center"
              id="btn-landing-hero-start"
            >
              Launch App <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* ─── Platform Availability Strip ─── */}
        <div className="flex items-center gap-3.5 mt-1 mb-1">
          <span className="text-[11px] text-(--text-muted) inline-flex items-center gap-1">
            <Smartphone size={10} className="opacity-50 -translate-y-px" />
            Android App
          </span>
          <span className="text-(--text-muted)/30 text-[10px]">•</span>
          <span className="text-[11px] text-(--text-muted) inline-flex items-center gap-1">
            <Smartphone size={10} className="opacity-50 -translate-y-px" />
            iPhone
          </span>
        </div>

        {/* Sub-line */}
        <p className="text-xs text-(--text-muted) leading-relaxed mt-1">
          No account needed. Works offline. Your data stays on your device.
        </p>
      </div>

      <FloatingHeroCards />
    </section>
  );
}
