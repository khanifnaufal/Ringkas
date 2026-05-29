# Ringkas - Intelligent Text Summarizer

**Ringkas** is an AI-powered web application designed to intelligently summarize long texts. By leveraging Google's Gemini AI model, Ringkas provides concise summaries, extracts key points, determines categories, analyzes sentiment, and estimates the reading time of the original text.

Currently, Ringkas has completed its **Minimum Viable Product (MVP)** phase, allowing users to paste any text (such as articles, emails, or reports) and receive structured analysis instantly.

## Tech Stack
- **Framework:** Next.js (App Router)
- **UI & Styling:** Tailwind CSS + shadcn/ui
- **AI Integration:** Vercel AI SDK (`ai`, `@ai-sdk/google`) with Google Gemini

---

## Development Roadmap

Below is the planned roadmap for Ringkas's upcoming features:

### Phase 2 — This week: Polish & Share
- **Deploy to Vercel:** Publish the app so it can be shared with others with a single command.
- **Input Article URL:** Allow users to paste a URL so the app can automatically fetch and summarize the content.
- **Share Results:** Generate unique links for each summary that can be easily shared.
- **Streaming Output:** Stream the summary text progressively, so users don't have to wait for the entire process to finish before reading.

### Phase 3 — Next week: Users & History
- **Auth with Clerk:** Implement Google/GitHub login and save summary history per user.
- **Summary History:** A dedicated dashboard to view and search all previously generated summaries.
- **Upload PDF:** Drag and drop PDF files for immediate summarization.
- **Collections:** Organize summaries into folders based on topics or specific projects.

### Phase 4 — Next month: Smarter AI
- **Chat with Text:** Allow users to ask specific questions about the original text after the summary is generated.
- **Bulk Summarize:** Input 5-10 URLs at once and view the summaries on a single page.
- **Compare Articles:** Summarize two texts simultaneously to highlight their similarities and differences.
- **Multi-language Support:** Summarize content in a preferred language, rather than being limited to just one language.

### Phase 5 — Taking it seriously: SaaS Transition
- **Public API:** Provide developers with API key access to use Ringkas programmatically.
- **Billing & Plans:** Implement a payment system using Stripe (limited Free tier, unlimited Pro tier).
- **Browser Extension:** A browser extension that allows users to instantly summarize the web page they are currently viewing.
- **Slack / Telegram Bot:** A dedicated bot where users can paste URLs in chats, and the bot immediately replies with the summary.
