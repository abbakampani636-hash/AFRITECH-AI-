import { AlertCircle, RefreshCw, X } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  dismissLabel?: string;
}

export function ErrorBanner({
  message,
  onRetry,
  onDismiss,
  retryLabel = "Retry",
  dismissLabel = "Dismiss",
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-xl bg-[#1A1423] border border-rose-400/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <p className="text-sm text-rose-100 leading-relaxed">{message}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[36px] px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {retryLabel}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={dismissLabel}
            className="min-h-[36px] min-w-[36px] rounded-lg hover:bg-white/10 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
