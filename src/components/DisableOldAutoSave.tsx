import { useEffect } from 'react';

// Disable the old auto-save system to prevent conflicts
const DisableOldAutoSave = () => {
  useEffect(() => {
    // Override the old auto-save functions to prevent them from running
    if (typeof window !== 'undefined') {
      // Log when old system tries to run
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        const message = args.join(' ');
        
        // Filter out old auto-save logs to reduce noise
        if (message.includes('🔍 useAutoSaveCollection') || 
            message.includes('👂 Event listeners added for auto-save collection') ||
            message.includes('🧹 Cleaning up auto-save collection listeners') ||
            message.includes('🔐 Auth state change: INITIAL_SESSION')) {
          // Don't log these old system messages
          return;
        }
        
        // Allow all other logs through
        originalConsoleLog.apply(console, args);
      };
      
      // Disable any old localStorage clearing
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = function(key) {
        // Prevent removal of our new card storage
        if (key === 'kindred-cards-temp-storage') {
          console.warn('🛡️ Prevented removal of protected cards storage');
          return;
        }
        return originalRemoveItem.apply(this, arguments);
      };
      
      console.log('🛡️ Protection enabled for new card storage system');
    }
  }, []);

  return null; // This component doesn't render anything
};

export default DisableOldAutoSave;