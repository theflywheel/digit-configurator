import { createContext, useContext, useRef, useCallback, type RefObject } from 'react';

/**
 * DOM-level hover highlight for the theme preview.
 *
 * Why DOM-level and not React state: hovering 38 color fields in quick
 * succession would trigger 38 re-renders of ThemePreview (and its `useWatch`
 * child). Instead, we mutate a single attribute on the preview root and let
 * a short imperative pass toggle a class on matching `[data-token]` elements.
 * Zero React re-renders, no context value churn.
 */
export interface HoverContextValue {
  previewRootRef: RefObject<HTMLDivElement | null>;
  setHoveredToken: (token: string | null) => void;
}

const HIGHLIGHT_CLASS = 'theme-token-hover';

const HoverContext = createContext<HoverContextValue | null>(null);

export function useHoverContext(): HoverContextValue | null {
  return useContext(HoverContext);
}

export { HoverContext };

/** Creates the setter paired with a ref to the preview root. Call once at
 *  the editor level and pass the pair down via context. */
export function useCreateHoverContext(): HoverContextValue {
  const previewRootRef = useRef<HTMLDivElement | null>(null);
  const lastSelectorRef = useRef<string | null>(null);

  const setHoveredToken = useCallback((token: string | null) => {
    const root = previewRootRef.current;
    if (!root) return;
    // Clear previous highlights.
    if (lastSelectorRef.current) {
      root.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => {
        el.classList.remove(HIGHLIGHT_CLASS);
      });
      lastSelectorRef.current = null;
    }
    if (!token) return;
    // CSS attribute selectors can't have escaped commas / colons without quoting,
    // so we filter by exact match against the full token path stored on data-token.
    // Multiple tokens on one element are space-separated (e.g. "colors.border colors.input-border").
    const matches = Array.from(root.querySelectorAll<HTMLElement>('[data-token]'))
      .filter((el) => {
        const list = el.dataset.token?.split(/\s+/) ?? [];
        return list.includes(token);
      });
    matches.forEach((el) => el.classList.add(HIGHLIGHT_CLASS));
    lastSelectorRef.current = token;
  }, []);

  return { previewRootRef, setHoveredToken };
}

export const HIGHLIGHT_CLASS_NAME = HIGHLIGHT_CLASS;
