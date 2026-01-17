import { useEffect, useCallback, useRef } from 'react';

interface UseUnsavedChangesWarningOptions {
  hasUnsavedChanges: boolean;
  message?: string;
}

export const useUnsavedChangesWarning = ({
  hasUnsavedChanges,
  message = 'You have unsaved changes. Are you sure you want to leave?'
}: UseUnsavedChangesWarningOptions) => {
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);

  // Keep ref in sync
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Handle browser navigation (refresh, close tab, external links)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChangesRef.current) {
        e.preventDefault();
        // Modern browsers ignore custom messages, but we need to set returnValue
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [message]);

  // Function to bypass the warning (for programmatic navigation after save)
  const bypassWarning = useCallback(() => {
    hasUnsavedChangesRef.current = false;
  }, []);

  return { bypassWarning };
};
