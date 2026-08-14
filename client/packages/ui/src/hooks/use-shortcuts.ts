/* eslint-disable react-hooks/refs */
'use client';

import { useEffect, useRef } from 'react';

export type NormalizedCombo = {
  alt: boolean;
  shift: boolean;
  mod: boolean; // Cmd on mac / Ctrl on others
  key: string;
};

export function normalizeCombo(combo: string): NormalizedCombo {
  const parts = combo
    .toLowerCase()
    .replace('⌘', 'mod')
    .split('+')
    .map((p) => p.trim())
    .filter(Boolean);
  const key = parts.find((p) => !['alt', 'shift', 'mod'].includes(p)) ?? '';
  return {
    alt: parts.includes('alt'),
    shift: parts.includes('shift'),
    mod: parts.includes('mod'),
    key,
  };
}

function isTextInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return (el as HTMLElement).isContentEditable;
}

export function eventMatches(event: KeyboardEvent, combo: NormalizedCombo) {
  const isMac =
    typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);
  const moduleHeld = isMac ? event.metaKey : event.ctrlKey;
  const eventKey =
    event.key.length === 1 ? event.key.toLowerCase() : event.key.toLowerCase();
  const matches =
    combo.alt === event.altKey &&
    combo.shift === event.shiftKey &&
    combo.mod === moduleHeld &&
    combo.key === eventKey;
  return matches;
}

export interface ShortcutAction {
  id?: string;
  combo: string; // e.g. "mod+v", "mod+shift+k", "backspace"
  run: () => void;
  when?: () => boolean; // optional guard
  preventDefault?: boolean; // default true
}

/**
 * useShortcuts
 *
 * Registers global keyboard shortcuts. Provide a stable array of actions and optional deps to re-bind.
 */
export function useShortcuts(actions: ShortcutAction[], deps: unknown[] = []) {
  const actionsReference = useRef<ShortcutAction[]>(actions);
  actionsReference.current = actions;

  useEffect(() => {
    const normalized = actionsReference.current.map((a) => ({
      ...a,
      parsed: normalizeCombo(a.combo),
    }));

    const handler = (event: KeyboardEvent) => {
      if (isTextInputFocused()) return;
      for (const act of normalized) {
        if (act.when && !act.when()) continue;
        if (eventMatches(event, act.parsed)) {
          if (act.preventDefault !== false) event.preventDefault();
          act.run();
          break;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
