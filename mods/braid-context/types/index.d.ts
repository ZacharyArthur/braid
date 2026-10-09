export type Ttl = '5m' | '1h';
// at: when the turn's last main-thread request that used the cache was sent, null when the turn reported no cache tokens.
// first: the session's first response, which always writes the whole cache, so its low hit rate is no alarm.
export type Cache = { at: number | null; ttl: Ttl; hit: number | null; first: boolean };
export type Braid = { level: string; change: string | null };
export type Session = { transcript: string; sid: string };

declare module 'claude-code' {
  interface PluginState {
    'braid-context': { cache: Cache | null; braid: Braid | null; session: Session | null };
  }
}
