import { useState, useCallback } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface MutationErrorInfo {
  message: string;
  code?: string;
  statusCode?: number;
}

export function extractMutationError(err: unknown): MutationErrorInfo {
  if (!err) return { message: 'Unknown error' };
  if (typeof err === 'object') {
    const e = err as Record<string, unknown>;
    const errorsArr = Array.isArray(e.errors) ? (e.errors as Array<Record<string, unknown>>) : null;
    if (errorsArr && errorsArr[0]) {
      const message =
        (typeof errorsArr[0].message === 'string' && errorsArr[0].message) ||
        (typeof errorsArr[0].code === 'string' && errorsArr[0].code) ||
        'Unknown error';
      const code = typeof errorsArr[0].code === 'string' ? errorsArr[0].code : undefined;
      const statusCode = typeof e.statusCode === 'number' ? e.statusCode : undefined;
      return { message, code, statusCode };
    }
    if (typeof e.message === 'string') {
      const statusCode = typeof e.statusCode === 'number' ? e.statusCode : undefined;
      return { message: e.message, statusCode };
    }
  }
  return { message: String(err) };
}

export function useMutationError() {
  const [info, setInfo] = useState<MutationErrorInfo | null>(null);
  const capture = useCallback((err: unknown) => setInfo(extractMutationError(err)), []);
  const clear = useCallback(() => setInfo(null), []);
  return { info, capture, clear };
}

interface BannerProps {
  info: MutationErrorInfo | null;
  onDismiss: () => void;
}

export function MutationErrorBanner({ info, onDismiss }: BannerProps) {
  if (!info) return null;
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium">Save failed</p>
            <p className="text-sm mt-0.5 break-words">{info.message}</p>
            {(info.code || info.statusCode) && (
              <p className="text-xs opacity-70 mt-1 font-mono">
                {info.statusCode ? `${info.statusCode} · ` : ''}
                {info.code ?? ''}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="shrink-0 hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
