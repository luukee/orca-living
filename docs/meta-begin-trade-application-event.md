# Meta (Facebook) customer event: Begin Trade Application

This doc describes how the **Begin Application** click is tracked as a custom Meta (Facebook) pixel event for the Orca Trade landing experience.

## Overview

- **Storefront:** A click on the "Begin Application" link (to `/account/register`) is published as a Shopify customer event.
- **Shopify admin (custom pixel):** That event is subscribed to and sent to Meta as a custom event for the "Meta Begin Trade Application" pixel.

## 1. Element and DOM context

**Link element:** The "Begin Application" link in the custom landing section (trade page), pointing to `/account/register`.

## 2. Theme: publishing the customer event

**File:** `sections/custom-landingpage.liquid` (lines 201–226)

- The section runs a small script that finds the register link **inside this section** and attaches a click listener.
- Selector used: `#section-{{ section.id }} a[href*="account/register"]` so it works for both relative (`/account/register`) and absolute (`https://www.orcaliving.com/account/register`) URLs and only targets this section's link.
- On click, if `Shopify.analytics.publish` is available, it publishes:
  - **Event name:** `begin_application_clicked`
  - **Payload:** `{ href, label }` (href from the link, label from trimmed text content).

## 3. Shopify admin: Meta custom pixel

**Pixel name in admin:** "Meta Begin Trade Application"

- **Step 1:** Standard Meta pixel SDK is loaded and initialised (e.g. `fbq('init', '<pixel_id>')`).
- **Step 2:** Subscribe to the theme event and send a custom event to Meta:
  - `analytics.subscribe('begin_application_clicked', (event) => { ... })`
  - Inside the callback: `fbq('trackCustom', 'BeginApplicationClicked', { href: event.customData?.href, label: event.customData?.label })`

So the event that appears in Meta (Events Manager / Ads Manager) is the **custom event** `BeginApplicationClicked`, with optional parameters `href` and `label`.

## 4. Customer privacy (Shopify pixel settings)

In the Shopify admin pixel configuration you can set:

- **Permission:** e.g. "Required" with Marketing and/or Analytics purposes.
- **Data sale:** e.g. "Data collected qualifies as data sale" so the pixel respects "Do not sell" where applicable.

These affect when the pixel (and thus this custom event) runs; see "Customer privacy" in Shopify for how it applies to your store.

## 5. Verifying without Ads Manager

- **Meta Pixel Helper (browser extension):** Should show "Events received" and list `begin_application_clicked` (and/or the resulting Meta event) with `href` and `label` when you click "Begin Application".
- **Browser Network tab:** After clicking, look for requests to `facebook.com` (e.g. `.../tr` or `.../pixel/register`) with status 200 to confirm the event is sent.

## 6. How it appears in Meta

- In **Events Manager** (and reporting): look for the **custom event** named **BeginApplicationClicked**.
- You can create a **Custom conversion** based on this event and then use it in **Ads Manager** for optimization and reporting.

## See also

- [Shopify: Pixels](https://help.shopify.com/en/manual/promoting-marketing/pixels)
