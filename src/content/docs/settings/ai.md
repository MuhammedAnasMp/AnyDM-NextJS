# AI Agent Configuration

Configure your AI assistant persona, system instructions, business knowledge base, support guidelines, and API token keys.

> **View in Application →** [Open AI Settings](/dashboard/settings/ai)

![Screenshot placeholder: AI Settings Configuration](./images/settings-ai.png)
> **Screenshot:** AI Agent Configuration dashboard showing Persona Prompt editor, business knowledge base cards (Store Hours, Return Policy, Address, Phone), and master AI token status.

## Overview

AnyDM features an intelligent conversational AI agent capable of answering customer questions in direct messages, recommending products, and sharing store policies 24/7. In AI Settings, you can train your AI on your specific business details and define its conversational tone.

## What You Can Do

- Customize your AI Assistant's **Persona & System Prompt** (e.g., tone of voice, emoji usage, brand voice).
- Configure business knowledge details: **Store Address**, **Business Hours**, **Customer Support Phone**, and **Shipping/Return Policies**.
- Enable or disable automated AI responses in Instagram Direct Messages.
- Creator Pro accounts automatically use the AnyDM Master AI Token without requiring custom OpenAI/Gemini API keys.
- Add custom API keys for third-party LLM providers if preferred.
- Test prompt responses with sample customer questions.

## How to Use

### Step 1: Open AI Settings
Navigate to **Settings > AI Settings** from the sidebar.

### Step 2: Define Agent Persona
1. In the **System Instructions** text box, define how the AI should represent your brand (e.g., *"You are the friendly AI assistant for Alex Rivera Studio. Keep responses concise, warm, and helpful. Always encourage customers to check our digital catalog"*).
2. Set response length preferences and tone parameters.

### Step 3: Populate Business Knowledge
1. Under **Business Information**, enter:
   - **Store Location / Address**: Physical studio or online store base.
   - **Operating Hours**: (e.g., *"Mon–Fri 9 AM – 6 PM IST"*).
   - **Contact Phone / Email**: Official support email or WhatsApp contact.
   - **Return & Refund Policy**: Explicit terms on digital downloads or physical goods.
2. The AI uses this data to answer incoming customer questions accurately.

### Step 4: Save & Activate
Click **Save AI Configuration**. Your AI agent is now active and will use this knowledge when generating direct message responses.

## Available AI Settings & Knowledge Fields

| Setting / Field | Purpose |
|---|---|
| **System Prompt / Persona** | Core behavioral guidelines and tone instructing the AI how to converse. |
| **Store Hours** | Business operating schedule shared with inquiring customers. |
| **Location & Address** | Physical store or dispatch origin details. |
| **Return & Refund Policy** | Policy rules used when customers ask about refunds or exchanges. |
| **Support Phone & Email** | Escalation contact details for complex issues. |
| **Master AI Token** | Built-in high-speed AI engine included with Creator Pro. |
| **Custom API Key** | Optional custom OpenAI / Gemini API key configuration for Free Trial users. |

## Related Features

- [Unified DM Live Chat](../inbox/chat) — Monitor AI responses and take over conversations when necessary.
- [Automations Catalog](../automations/catalog) — Complement AI chat with rule-based keyword triggers.
- [Product Catalog](../products/catalog) — Products referenced automatically by the AI during customer chats.
