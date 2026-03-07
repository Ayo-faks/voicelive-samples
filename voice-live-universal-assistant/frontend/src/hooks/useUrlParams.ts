import { useMemo } from 'react';

export type InputMode = 'voice' | 'text';

interface UrlParams {
  /** Locked input mode from ?mode=voice|text. Undefined = user can toggle. */
  lockedMode: InputMode | undefined;
  /** True when ?lock=true — hides settings gear and mode toggle entirely. */
  isLocked: boolean;
}

/**
 * Parse URL query parameters for UI locking behavior.
 *
 * - ?mode=voice|text  → lock to that input mode, hide toggle
 * - ?lock=true        → hide settings gear + mode toggle (full server config)
 */
export function useUrlParams(): UrlParams {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);

    const modeParam = params.get('mode')?.toLowerCase();
    const lockedMode: InputMode | undefined =
      modeParam === 'voice' || modeParam === 'text' ? modeParam : undefined;

    const isLocked = params.get('lock')?.toLowerCase() === 'true';

    return { lockedMode, isLocked };
  }, []);
}
