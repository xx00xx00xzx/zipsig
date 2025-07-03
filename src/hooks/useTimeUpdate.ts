import { useState, useEffect } from 'react';

interface TimeStatus {
  utcTime: string;
  localTime: string;
  apiStatus: 'checking' | 'online' | 'offline';
}

// メモ化された時刻更新フック - パフォーマンス最適化
export const useTimeUpdate = () => {
  const [timeStatus, setTimeStatus] = useState<TimeStatus>({
    utcTime: '',
    localTime: '',
    apiStatus: 'checking'
  });

  useEffect(() => {
    const checkTimeAPI = async (retryCount = 0) => {
      const retryDelay = Math.min(2000 * Math.pow(1.5, retryCount), 30000);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const utcTime = new Date(data.datetime).toISOString();
        const localTime = new Date().toISOString();
        
        setTimeStatus({
          utcTime,
          localTime,
          apiStatus: 'online'
        });
      } catch (error) {
        setTimeStatus(prev => ({
          ...prev,
          apiStatus: 'checking'
        }));
        
        setTimeout(() => {
          checkTimeAPI(retryCount + 1);
        }, retryDelay);
      }
    };

    checkTimeAPI();
    
    // requestAnimationFrame を使った効率的な時刻更新
    let rafId: number;
    let lastUpdate = Date.now();
    
    const updateTime = () => {
      const now = Date.now();
      // 1秒間隔でのみ更新（パフォーマンス最適化）
      if (now - lastUpdate >= 1000) {
        lastUpdate = now;
        setTimeStatus(prev => ({
          ...prev,
          localTime: new Date().toISOString()
        }));
      }
      rafId = requestAnimationFrame(updateTime);
    };
    
    rafId = requestAnimationFrame(updateTime);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return timeStatus;
};