import { toast } from 'sonner';

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

interface AppError {
  message: string;
  code?: string;
  severity?: ErrorSeverity;
  details?: any;
}

export function handleAppError(error: unknown, customMessage?: string, severity: ErrorSeverity = ErrorSeverity.ERROR) {
  console.error("Mirage App Error:", error);
  
  let errorMessage = customMessage || "An unexpected error occurred.";
  
  if (error instanceof Error) {
    errorMessage = customMessage ? `${customMessage}: ${error.message}` : error.message;
  } else if (typeof error === 'string') {
    errorMessage = customMessage ? `${customMessage}: ${error}` : error;
  }

  // Display user-friendly snackbar
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      toast.error(`CRITICAL FAILURE: ${errorMessage}`, {
        duration: 10000,
        style: { border: '1px solid #ff0044', backgroundColor: 'rgba(255, 0, 68, 0.1)' }
      });
      break;
    case ErrorSeverity.ERROR:
      toast.error(`${errorMessage}`, {
        duration: 5000,
      });
      break;
    case ErrorSeverity.WARNING:
      toast.warning(`${errorMessage}`, {
        duration: 4000,
        style: { border: '1px solid #F1C40F', backgroundColor: 'rgba(241, 196, 15, 0.1)' }
      });
      break;
    case ErrorSeverity.INFO:
      toast.info(`${errorMessage}`, {
        duration: 3000,
      });
      break;
    default:
      toast.error(`${errorMessage}`);
  }
}
