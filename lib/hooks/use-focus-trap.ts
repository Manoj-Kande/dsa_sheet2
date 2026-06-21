"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab/Shift+Tab focus inside the returned container ref while `active`
 * is true, and restores focus to the previously focused element on close.
 *
 * - Moves focus into the container (to `initialFocusRef` if provided, else
 *   the first focusable element, else the container itself) when activated.
 * - Cycles focus from last -> first (and first -> last on Shift+Tab) so
 *   keyboard users can never tab out behind the overlay.
 * - Restores focus to whatever was focused before the trap activated.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  initialFocusRef?: React.RefObject<HTMLElement | null>
) {
  const containerRef = useRef<T | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    const focusFirst = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }
      const first = container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (first) {
        first.focus();
        return;
      }
      // No focusable descendant — fall back to the container itself so
      // focus still lands inside the trap (and Escape/swipe-to-close still work).
      if (container && !container.hasAttribute("tabindex")) {
        container.setAttribute("tabindex", "-1");
      }
      container?.focus();
    };

    // Defer one tick so the element is mounted/visible before we focus it.
    const raf = requestAnimationFrame(focusFirst);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || !container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (e.shiftKey) {
        if (current === first || !container.contains(current)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (current === last || !container.contains(current)) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [active, initialFocusRef]);

  return containerRef;
}
