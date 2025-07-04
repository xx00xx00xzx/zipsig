import { useState, useEffect } from 'react';
import type { TimeStatus } from '../types';

/**
 * 時刻関連のロジックを管理するカスタムフック
 * WorldTimeAPIからUTC時刻を取得し、ローカル時刻を定期更新する
 */
export const useTime = () => {
  const [timeStatus, setTimeStatus] = useState<TimeStatus>({
    utcTime: '',
    localTime: '',
    apiStatus: 'checking'
  });

  useEffect(() => {
    const checkTimeAPI = async (retryCount = 0) => {
      const retryDelay = Math.min(2000 * Math.pow(1.5, retryCount), 30000); // Exponential backoff with max 30s
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
        
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
        
        // console.log(`WorldTimeAPI connected successfully after ${retryCount + 1} attempts`);
      } catch (error) {
        // console.warn(`WorldTimeAPI attempt ${retryCount + 1} failed:`, error);
        
        // Show checking status during retries
        setTimeStatus(prev => ({
          ...prev,
          apiStatus: 'checking'
        }));
        
        // Retry indefinitely with exponential backoff
        setTimeout(() => {
          checkTimeAPI(retryCount + 1);
        }, retryDelay);
      }
    };

    checkTimeAPI();
    
    // Update local time every second - use RAF for better performance on mobile
    let rafId: number;
    let lastUpdate = Date.now();
    let isActive = true;
    
    const updateTime = () => {
      if (!isActive) return;
      
      const now = Date.now();
      if (now - lastUpdate >= 1000) {
        lastUpdate = now;
        setTimeStatus(prev => ({
          ...prev,
          localTime: new Date().toISOString()
        }));
      }
      rafId = requestAnimationFrame(updateTime);
    };
    
    // Start the animation frame loop
    rafId = requestAnimationFrame(updateTime);

    return () => {
      isActive = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return {
    timeStatus,
    setTimeStatus
  };
};