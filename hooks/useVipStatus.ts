import { useAuth } from '@/contexts/AuthContext';
import { fetchCallerStatus } from '@/services/aiService';
import { useEffect, useState } from 'react';

// Cached across screens rather than fetched per screen: two of them ask the
// same question, and the answer only changes when the session does. Which is
// why the auth status is the cache key.
let cached: { key: string; isVip: boolean } | null = null;

/** Whether this caller has unlimited corrections, by account or by network. */
export function useVipStatus(): boolean {
  const { status } = useAuth();
  const [isVip, setIsVip] = useState(() => (cached?.key === status ? cached.isVip : false));

  useEffect(() => {
    if (status === 'loading') return;

    if (cached?.key === status) {
      setIsVip(cached.isVip);
      return;
    }

    let cancelled = false;

    fetchCallerStatus()
      .then(result => {
        cached = { key: status, isVip: result.isVip };
        if (!cancelled) setIsVip(result.isVip);
      })
      // Not unlimited is the safe answer when the question cannot be asked.
      // The cost of being wrong that way is a crown that fails to appear;
      // the other way round it would promise unlimited over a limit that is
      // still being enforced.
      .catch(() => {
        if (!cancelled) setIsVip(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  return isVip;
}
