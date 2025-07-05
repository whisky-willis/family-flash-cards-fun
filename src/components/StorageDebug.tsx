import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStorageInfo, loadCardsFromLocalStorage, cleanupLocalStorage } from '@/lib/persistentStorage';

export const StorageDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const refreshDebugInfo = () => {
    const info = getStorageInfo();
    const cards = loadCardsFromLocalStorage();
    setDebugInfo({
      ...info,
      actualCards: cards,
      allLocalStorageKeys: Object.keys(localStorage),
      totalKeys: Object.keys(localStorage).length
    });
  };

  useEffect(() => {
    refreshDebugInfo();
    // Refresh every 5 seconds
    const interval = setInterval(refreshDebugInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCleanup = () => {
    const result = cleanupLocalStorage();
    console.log('🧹 Manual cleanup result:', result);
    refreshDebugInfo();
  };

  const handleClearOurCards = () => {
    localStorage.removeItem('kindred-cards-temp-storage');
    console.log('🗑️ Manually cleared our card storage');
    refreshDebugInfo();
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Debug Storage 🔍
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-auto">
      <Card className="bg-white shadow-xl border-2 border-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex justify-between items-center">
            Storage Debug Info
            <Button 
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          {debugInfo && (
            <>
              <div>
                <strong>Cards in Storage:</strong> {debugInfo.cardCount}
              </div>
              <div>
                <strong>Has Cards:</strong> {debugInfo.hasCards ? '✅' : '❌'}
              </div>
              <div>
                <strong>Storage Usage:</strong> {debugInfo.quotaInfo?.estimatedUsage || 'Unknown'}
              </div>
              <div>
                <strong>Our Card Size:</strong> {debugInfo.quotaInfo?.ourCardSize || '0 KB'}
              </div>
              <div>
                <strong>Total Keys:</strong> {debugInfo.totalKeys}
              </div>
              <div>
                <strong>Actual Cards:</strong> {debugInfo.actualCards?.length || 0}
              </div>
              
              <div className="border-t pt-2 mt-2">
                <strong>All localStorage Keys:</strong>
                <div className="max-h-20 overflow-y-auto text-xs">
                  {debugInfo.allLocalStorageKeys?.map((key: string, idx: number) => (
                    <div key={idx} className={key === 'kindred-cards-temp-storage' ? 'text-blue-600 font-bold' : 'text-gray-600'}>
                      {key}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button onClick={refreshDebugInfo} size="sm" variant="outline">
                  Refresh
                </Button>
                <Button onClick={handleCleanup} size="sm" variant="outline">
                  Cleanup
                </Button>
                <Button onClick={handleClearOurCards} size="sm" variant="destructive">
                  Clear Cards
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};