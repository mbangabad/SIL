/**
 * Telemetry Types and Event Schema
 * Defines all trackable events in the SIL platform
 */

export type TelemetryEventType =
  | 'game_session_start'
  | 'game_session_end'
  | 'player_action'
  | 'error'
  | 'ab_assignment'
  | 'page_view'
  | 'feature_flag_evaluation';

export interface BaseTelemetryEvent {
  eventId: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  type: TelemetryEventType;
}

export interface GameSessionStartEvent extends BaseTelemetryEvent {
  type: 'game_session_start';
  metadata: {
    gameId: string;
    mode: string;
    seed: string;
  };
}

export interface GameSessionEndEvent extends BaseTelemetryEvent {
  type: 'game_session_end';
  metadata: {
    gameId: string;
    mode: string;
    score: number;
    durationMs: number;
    completed: boolean;
    skillSignals?: Record<string, number>;
  };
}

export interface PlayerActionEvent extends BaseTelemetryEvent {
  type: 'player_action';
  metadata: {
    gameId: string;
    actionType: string;
    payload: any;
  };
}

export interface ErrorEvent extends BaseTelemetryEvent {
  type: 'error';
  metadata: {
    errorMessage: string;
    errorStack?: string;
    componentStack?: string;
    gameId?: string;
    url: string;
  };
}

export interface ABAssignmentEvent extends BaseTelemetryEvent {
  type: 'ab_assignment';
  metadata: {
    experimentId: string;
    variantId: string;
    assignmentMethod: 'random' | 'deterministic';
  };
}

export interface PageViewEvent extends BaseTelemetryEvent {
  type: 'page_view';
  metadata: {
    path: string;
    referrer?: string;
  };
}

export type TelemetryEvent =
  | GameSessionStartEvent
  | GameSessionEndEvent
  | PlayerActionEvent
  | ErrorEvent
  | ABAssignmentEvent
  | PageViewEvent;

/**
 * Telemetry Service
 * Handles event tracking and analytics
 */
export class TelemetryService {
  private events: TelemetryEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private generateEventId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  /**
   * Track any telemetry event
   */
  track(event: Omit<TelemetryEvent, 'eventId' | 'timestamp' | 'sessionId'>): void {
    const fullEvent: TelemetryEvent = {
      ...event,
      eventId: this.generateEventId(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
    } as TelemetryEvent;

    this.events.push(fullEvent);

    // In production, send to backend
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.sendToBackend(fullEvent);
    } else {
      // In development, log to console
      console.log('[Telemetry]', fullEvent);
    }
  }

  /**
   * Track game session start
   */
  trackGameStart(gameId: string, mode: string, seed: string, userId?: string): void {
    this.track({
      type: 'game_session_start',
      userId,
      metadata: { gameId, mode, seed },
    });
  }

  /**
   * Track game session end
   */
  trackGameEnd(
    gameId: string,
    mode: string,
    score: number,
    durationMs: number,
    completed: boolean,
    skillSignals?: Record<string, number>,
    userId?: string
  ): void {
    this.track({
      type: 'game_session_end',
      userId,
      metadata: { gameId, mode, score, durationMs, completed, skillSignals },
    });
  }

  /**
   * Track error
   */
  trackError(
    errorMessage: string,
    errorStack?: string,
    componentStack?: string,
    gameId?: string,
    userId?: string
  ): void {
    this.track({
      type: 'error',
      userId,
      metadata: {
        errorMessage,
        errorStack,
        componentStack,
        gameId,
        url: typeof window !== 'undefined' ? window.location.href : '',
      },
    });
  }

  /**
   * Track page view
   */
  trackPageView(path: string, referrer?: string, userId?: string): void {
    this.track({
      type: 'page_view',
      userId,
      metadata: { path, referrer },
    });
  }

  /**
   * Get all events (for admin dashboard)
   */
  getEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType(type: TelemetryEventType): TelemetryEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  /**
   * Send event to backend
   */
  private async sendToBackend(event: TelemetryEvent): Promise<void> {
    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send telemetry event:', error);
    }
  }

  /**
   * Clear all events (for testing)
   */
  clear(): void {
    this.events = [];
  }
}

// Singleton instance
export const telemetry = new TelemetryService();
