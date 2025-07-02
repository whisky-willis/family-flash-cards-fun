import React, { useState, useEffect } from 'react';

const NameCycler: React.FC = () => {
  const [currentNameIndex, setCurrentNameIndex] = useState(0);
  const names = ['George', 'Maggie', 'Tom'];

  useEffect(() => {
    console.log('🔄 NameCycler: Starting interval');
    
    const interval = setInterval(() => {
      console.log('⏰ NameCycler: Interval fired');
      setCurrentNameIndex(prevIndex => {
        const newIndex = (prevIndex + 1) % 3;
        console.log(`📝 NameCycler: ${prevIndex} -> ${newIndex} (${names[newIndex]})`);
        return newIndex;
      });
    }, 2000);

    return () => {
      console.log('🧹 NameCycler: Cleanup');
      clearInterval(interval);
    };
  }, []);

  console.log('🎨 NameCycler: Rendering with index', currentNameIndex, 'name:', names[currentNameIndex]);

  return (
    <div className="bg-yellow-100 p-4 border border-yellow-300 rounded mb-4">
      <h2 className="text-lg font-bold">Name Cycler Test</h2>
      <p>Current Index: {currentNameIndex}</p>
      <p>Current Name: <strong>{names[currentNameIndex]}</strong></p>
      <p className="text-sm text-gray-600">Check console for debug logs</p>
    </div>
  );
};

export default NameCycler;