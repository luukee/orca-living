---
name: Announcement bar rotation
overview: Change the announcement bar from stacking multiple blocks to showing one at a time and rotating every 3 seconds (e.g. trade first, then planting palette), with optional configurable delay and a single close that dismisses the whole strip.
todos: []
isProject: false
---

# Announcement bar rotation plan

## Goal

When multiple announcement blocks exist, show **one bar at a time** and **rotate** between them every 3 seconds (first block on load, then second, then loop). No stacking.

## Current behavior (reference)

- [sections/announcement-bar.liquid](sections/announcement-bar.liquid): Lines 24–52 loop over `section.blocks` and output a full `.announcement-bar` per block, so they stack.
- Dismiss is per-bar via `data-announcement-bar-id` and localStorage (lines 87–111).

## Implementation

### 1. Markup (Liquid)

- **When there are 2+ announcement blocks**: wrap the loop in a single container, e.g. `<div class="announcement-bar__rotating" data-rotation-delay-ms="3000">`, and add `data-announcement-index="{{ forloop.index0 }}"` to each bar so JS can target slides.
- **When there is only 1 block**: keep current output (no wrapper, no rotation) so single-announcement behavior is unchanged.
- Preserve each bar’s existing structure (link, text, close button, `data-announcement-bar-id`) for styling and for a unified “dismiss strip” behavior.

### 2. CSS

- Inside the existing `<style>` block, add rules for the rotating wrapper:
  - **Layout**: `.announcement-bar__rotating` is `position: relative`. Inactive bars are `position: absolute; top: 0; left: 0; right: 0; opacity: 0; pointer-events: none; transition: none`. Active bar is `position: relative; opacity: 1; pointer-events: auto`. Bars switch instantly (no transition on the bar) so the background never flashes.
  - **Content-only transition**: Apply opacity transition only to `.announcement-bar__inner` (text + close), not the bar background. Inactive bars’ inner stays `opacity: 0`; `.is-active .announcement-bar__inner` is `opacity: 1` with `transition: opacity 0.25s ease`. Result: new bar’s background appears immediately; only the message and close button fade in.

### 3. JavaScript

- Extend the existing `<script>` (lines 86–111):
  - **Init**: If `.announcement-bar__rotating` exists, gather its `.announcement-bar` elements, add `is-active` to the first, read `data-rotation-delay-ms` (default 3000).
  - **Rotation**: `setInterval` at that interval: remove `is-active` from current bar, add to next (wrap index so last → first).
  - **Close**: When any close button inside the rotating container is clicked, dismiss the **entire** strip (e.g. add a class like `is-dismissed` to the wrapper and persist with one localStorage key for the section, or sessionStorage so it reappears on new session). Remove or repurpose per-bar dismiss for bars inside the rotating wrapper so one close hides the rotating strip.
- Leave per-bar dismiss logic unchanged when the bar is **not** inside a rotating wrapper (single-block case).

### 4. Optional: configurable delay

- In the section schema, add a number setting (e.g. `rotation_interval_seconds`, default 3) and output it on the wrapper as `data-rotation-delay-ms="{{ section.settings.rotation_interval_seconds | times: 1000 }}"` so the theme editor can change the 3s delay.

## Order of announcements

Block order in the theme editor = rotation order (first block shows first, then second after 3s, etc.). No code change needed; client keeps “trade” first and “planting palette” second in the section.

## Files to change

- **Single file**: [sections/announcement-bar.liquid](sections/announcement-bar.liquid) (markup, CSS, script, and optionally schema).

## Edge cases

- **Single block**: No wrapper, no rotation script path; current behavior preserved.
- **Dismissed state**: One localStorage/sessionStorage key for “rotating strip dismissed” so the whole strip stays hidden until the user clears storage or returns in a new session (if using sessionStorage).

