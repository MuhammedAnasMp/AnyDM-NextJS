# Visual Flow Builder

The Visual Flow Builder is an interactive node-based canvas for designing customized conversation flows, trigger conditions, multi-message DM sequences, and public comment replies.

> **View in Application →** [Open Flow Builder](/dashboard/automations)

![Screenshot placeholder: Visual Flow Builder Canvas](./images/automations-builder.png)
> **Screenshot:** Visual Flow Builder canvas showing Trigger, Condition, and Action nodes connected by workflow arrows, with side inspection panels and interactive mobile chat preview.

## Overview

The Visual Flow Builder provides a drag-and-drop workspace where creators construct complex marketing funnels visually. You can define exact keyword conditions, link workflows to specific Instagram posts or reels via the Instagram Media Picker, customize DM formats (Plain Text, Quick Replies, Generic Carousels, Button Templates), and preview simulated user interactions live.

## What You Can Do

- Add and connect **Trigger**, **Condition**, and **Action** nodes on an infinite canvas.
- Select specific Instagram media items (Reels, Posts) or apply rules across all posts.
- Configure keyword matching filters with case-insensitive logic.
- Design rich Instagram DM messages: text messages, button links, quick reply pills, and product carousels.
- Set randomized public comment replies to increase natural engagement and avoid spam detection.
- Simulate and test the full conversational experience in the live interactive Mobile Preview panel.
- Save, validate, and publish workflows directly to your live Instagram profile.

## How to Use

### Step 1: Set the Trigger Node
1. Click on the **Trigger Node** on the canvas.
2. In the right-hand properties sidebar, select the trigger source:
   - *User comments on post*
   - *User sends direct message*
   - *User clicks welcome icebreaker*
3. If targeting specific content, click **Select Media** to open the **Instagram Media Picker** and choose a post or reel.

### Step 2: Define Keyword Conditions
1. Click the **Condition Node** connected to your trigger.
2. Enter trigger keywords separated by commas (e.g., `BUY, DISCOUNT, LINK, PRICE`).
3. Set match mode to *Contains any keyword* or *Exact keyword*.

### Step 3: Configure Response Actions
1. Click the **Action Node**.
2. Select your **DM Format**:
   - **Text**: Standard direct message with emoji and personalization placeholders.
   - **Buttons / Quick Replies**: Direct messages with interactive CTA buttons linking to your storefront or checkout.
   - **Generic Template / Carousel**: Multi-card swipeable product cards.
3. Configure optional **Public Comment Reply**: Enter multiple variations (e.g., *"Check your DM! 📩"*, *"Sent you the link in messages! ✨"*). The system will cycle through them automatically.

### Step 4: Preview and Save
1. Test your conversation in the right-side **Interactive Chat Simulator**.
2. Click **Save & Publish Flow** in the top bar.

> **Video tutorial placeholder**
>
> Add a video walkthrough demonstrating how to create a high-converting Comment-to-DM automated funnel using the Visual Flow Builder.

## Node Types & Configuration

| Node Type | Purpose & Options |
|---|---|
| **Trigger Node** | Defines the entry event: Comment on Post/Reel, Inbound DM, Story Tag, or Welcome Icebreaker. Includes media picker. |
| **Condition Node** | Evaluates rules such as required keywords, user follow status, or engagement filters. |
| **Action Node** | Dispatches output actions: sends Instagram Direct Message, fires public comment reply, or sets customer lead tag. |
| **DM Formats** | Supports Plain Text, Quick Reply Buttons, Button Templates (URL/Postback), and Generic Multi-Card Carousels. |
| **Live Simulator** | Interactive real-time phone emulator for testing user taps and message delivery before publishing. |

## Related Features

- [Automations Catalog](./catalog) — Manage, toggle, and view analytics for all published flows.
- [Product Catalog](../products/catalog) — Integrate direct product links into button templates.
- [Instagram Post Scheduler](../schedule) — Coordinate automated reply rules with scheduled reel launches.
