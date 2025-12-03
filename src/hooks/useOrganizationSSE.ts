import { useEffect, useRef, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface SSEEvent {
  event: string;
  data: any;
}

/**
 * Hook to subscribe to organization SSE events
 * Automatically connects/disconnects based on organizationId and auth token
 */
export function useOrganizationSSE(
  organizationId: string | undefined,
  onEvent: (event: SSEEvent) => void
) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);

  // Keep callback ref up to date
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  // Setup SSE connection
  useEffect(() => {
    if (!organizationId) {
      console.log('[SSE] No organizationId, skipping connection');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('[SSE] No auth token, skipping connection');
      return;
    }

    // Create EventSource with token in query param (EventSource doesn't support headers)
    const url = `${API_BASE_URL}/api/sse/organizations/${organizationId}?token=${encodeURIComponent(token)}`;
    console.log(`[SSE] Connecting to organization ${organizationId}...`);

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    // Handle connection opened
    eventSource.addEventListener('open', () => {
      console.log(`[SSE] Connected to organization ${organizationId}`);
    });

    // Handle connection event
    eventSource.addEventListener('connected', (event) => {
      const data = JSON.parse(event.data);
      console.log('[SSE] Connection confirmed:', data);
    });

    // Handle invitation:accepted event
    eventSource.addEventListener('invitation:accepted', (event) => {
      const data = JSON.parse(event.data);
      console.log('[SSE] Invitation accepted:', data);
      onEventRef.current({ event: 'invitation:accepted', data });
    });

    // Handle generic message events
    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Generic message:', data);
        onEventRef.current({ event: 'message', data });
      } catch (error) {
        console.error('[SSE] Failed to parse message:', error);
      }
    });

    // Handle errors
    eventSource.addEventListener('error', (error) => {
      console.error('[SSE] Connection error:', error);

      // EventSource will automatically reconnect unless we close it
      // For auth errors (401), we should close the connection
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('[SSE] Connection closed by server');
      }
    });

    // Cleanup on unmount or when organizationId changes
    return () => {
      console.log(`[SSE] Disconnecting from organization ${organizationId}`);
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [organizationId]);

  // Return function to manually close connection if needed
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('[SSE] Manual disconnect');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  return { disconnect };
}
