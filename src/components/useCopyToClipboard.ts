"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BUBBLE_EXIT_MS } from "./motion";

/**
 * Drives a "click to copy" control and the bubble that reports back.
 *
 * Extracted because FooterAlt and ContactContent each had their own copy of this
 * state machine, and they had drifted: one held the confirmation for a flat 2s
 * and let hover re-trigger while it was showing, the other was touch-aware and
 * guarded hover. This is the second one, which was the more considered of the
 * two, now shared.
 *
 * The two-stage dismissal matters. `bubbleVisible` goes false first so the
 * bubble fades out still reading "copied", and only once it's gone does `copied`
 * reset — otherwise the label visibly flips back to "click to copy" mid-fade.
 */

/**
 * How long the confirmation stays up once the copy has happened. Long enough to
 * read two words and no longer — it was 2s, which left the pill sitting there
 * after the message had landed. Touch gets less again: there's no pointer resting
 * on the control, so nothing implies the bubble is still wanted.
 */
const HOLD_TOUCH_MS = 800;
const HOLD_POINTER_MS = 1100;

export function useCopyToClipboard(value: string) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Both timers are tracked so unmounting mid-confirmation can't fire setState
  // on a dead component — the original two implementations both leaked these.
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fadeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(holdTimer.current);
      clearTimeout(fadeTimer.current);
    },
    []
  );

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      // Blocked by permissions, or no secure context. Say nothing in the UI
      // rather than claiming a copy that didn't happen.
      console.error("Failed to copy:", err);
      return;
    }

    setCopied(true);
    setConfirming(true);
    // The pointer is still over the control, but hover is no longer what's
    // keeping the bubble up — clearing it hands ownership to the timer.
    setHovered(false);

    const isTouch =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      setConfirming(false);
      // Reset the label only once the bubble has finished leaving. This used to
      // be a hardcoded 300ms against a 500ms fade, so the label visibly flipped
      // back to "click to copy" while the bubble was still on screen. Deriving it
      // from the bubble's own duration means the two can't disagree again.
      clearTimeout(fadeTimer.current);
      fadeTimer.current = setTimeout(() => setCopied(false), BUBBLE_EXIT_MS);
    }, isTouch ? HOLD_TOUCH_MS : HOLD_POINTER_MS);
  }, [value]);

  return {
    /** Whether the confirmation state is active — drives the bubble's label. */
    copied,
    /** Whether the bubble should be on screen at all. */
    bubbleVisible: confirming || hovered,
    copy,
    /**
     * Spread onto the control. Hover is ignored while confirming so moving the
     * pointer can't cut the confirmation short or restart it.
     */
    hoverHandlers: {
      onMouseEnter: () => !copied && setHovered(true),
      onMouseLeave: () => !copied && setHovered(false),
    },
  };
}
