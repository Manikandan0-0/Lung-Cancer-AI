import { useState, useEffect, useCallback, useRef } from 'react';
import { BackendConnectionStatus, BackendHealthResponse } from '../types/api';
import { apiService } from '../services/api';

/**
 * Polls the FastAPI backend health endpoint.
 *
 * @param autoPoll   – enable automatic polling (default: true)
 * @param intervalMs – poll interval in ms (default: 30 000)
 *
 * Returns `pausePolling` / `resumePolling` so callers can suppress polls
 * during long-running inference (Grad-CAM) to avoid false disconnects.
 */
export function useBackendHealth(autoPoll = true, intervalMs = 30000) {
  const [status, setStatus] = useState<BackendConnectionStatus>('checking');
  const [healthData, setHealthData] = useState<BackendHealthResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Ref flag: when true, scheduled polls are skipped (not cancelled)
  const pausedRef = useRef(false);

  const check = useCallback(async () => {
    setStatus('checking');
    try {
      const res = await apiService.checkHealth();
      if (res.isConnected && res.data) {
        setStatus('connected');
        setHealthData(res.data);
        setErrorMessage(null);
      } else {
        setStatus('disconnected');
        setHealthData(null);
        setErrorMessage(res.error || 'Cannot connect to FastAPI backend');
      }
    } catch (err: unknown) {
      setStatus('disconnected');
      setHealthData(null);
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLastChecked(new Date());
    }
  }, []);

  /** Call before starting a long inference request to suppress false disconnects. */
  const pausePolling = useCallback(() => {
    pausedRef.current = true;
  }, []);

  /** Call after inference completes — triggers an immediate recheck then resumes polling. */
  const resumePolling = useCallback(() => {
    pausedRef.current = false;
    check(); // recheck immediately after inference finishes
  }, [check]);

  useEffect(() => {
    check();

    if (!autoPoll) return;

    const interval = setInterval(() => {
      // Skip this tick if inference is in progress
      if (pausedRef.current) return;
      check();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [check, autoPoll, intervalMs]);

  return {
    status,
    isConnected: status === 'connected',
    isChecking: status === 'checking',
    isDisconnected: status === 'disconnected',
    healthData,
    errorMessage,
    lastChecked,
    recheck: check,
    pausePolling,
    resumePolling,
    baseUrl: apiService.getBaseUrl(),
  };
}
