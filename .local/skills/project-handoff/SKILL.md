---
name: project-handoff
description: Move this conversation into a project, or create a separate project for a different piece of work — with or without a confirmation card.
---

# Project Handoff

<choose_where_the_work_belongs>
Work happens on one of two surfaces with different lifecycles:
- This conversation runs in a small sandbox — files, a shell, code execution, and the user's connectors and MCP servers. It operates the user's connected systems (like a calendar, Notion page, or Linear issue), process files and assets (transform CSV or JSON, analyze data), research, run small one-off scripts, or make one-off files (like a document, chart, image, or a one-off HTML document — a report, invoice, flyer, or printable — delivered with `presentAsset`). This sandbox is for ephemeral work. Once delivered, that work is done. It cannot host <replit_artifacts>, the Design canvas, or deployments.
- A project is where builds live durably and grow over time. A project is a workspace the user can reopen, iterate in, share, and publish from, with everything builds need — databases, deployments, App Builder, and the Design canvas. Its builds are <replit_artifacts>. The project workspace opens in one of two editor modes: Build, the default, is where every artifact is implemented and delivered, slide decks included; Design, an immersive canvas for exploring visual direction (like mockups, layout options, look and feel), when the user needs options to react to rather than a working thing.

Route by lifecycle: if delivering a result completes the request, work here now with the available tools; offer a project when the result has a future. If a need mixes both ephemeral and not, the ephemeral first, then offer a project for the persistent build.

A common pitfall: answering a design or video request with raw media generation in this sandbox. When someone asks for a design, mockup, or alternatives of something (like "create 5 alternative designs for this instagram post" or "create 2 ui screens for an onboarding"), they usually mean Design explorations on a project's Design canvas, not a batch of generated images; when someone asks for a video, they usually mean an Animation project, not a single AI-generated clip. When the user explicitly says "design", they almost always mean a project — go there without asking. When unsure, err toward a project; ask with the AskQuestion tool only when you think they may genuinely want a generated image or video clip here in chat:
- For visuals, offer: 1) Generate full professional designs with Replit Design, or 2) Create AI-generated images here in chat.
- For video, offer: 1) Generate a professional motion-graphic video with Replit Animation, or 2) Create a short AI-generated video clip.

Always pose this question through the AskQuestion tool, never as plaintext in your message — the user is less likely to answer a question written out in prose.

Some requests are never ambiguous — graduate to a project immediately, do not generate an image or mockup of one, and do not ask the question above:
- A website, landing page, app, store, portfolio, or any other <replit_artifacts> — assume the user wants a website artifact or mobile app artifact rather than a generated image or a Replit Design, even phrased as "design me an app": "design" as a verb on an artifact is not a request for an image.
- A mockup, UI prototype, poster, or AI ad creative — assume they want Replit Design (`editorMode: 'design'`).
When you genuinely cannot tell which of those two the user means, ask with the AskQuestion tool whether they want a working backend or something ready to publish, or just a visual mockup — then route to a web app project or a Design project accordingly.

- `transitionToProject({ askUser, title, templateId?, editorMode? })` moves this conversation into a project. When moving, your full conversation context and the files in this sandbox carry over into the project. Prefer it over createNewProject in most cases.
  - For `title` choose a few, meaningful words.
  - `editorMode` chooses between Build and Design modes (default to Build.)
- `createNewProject({ askUser: true, prompt, title, templateId? })` for the rare case when the user explicitly asks for work in a separate project, or when building multiple projects at once. This conversation will continue untouched. Set `askUser: true` always.
  - `prompt` briefs the separate agent that builds the new project. A transition has no `prompt` — you continue with the full conversation context.

More info for `askUser`:
- With `askUser: true`, a user consent modal appears before transitioning. There's no need to ask for user consent in prose.
- For `transitionToProject` only, set `askUser: false` when it's unambiguous that an <replit_artifacts> will benefit the user or they ask to skip confirmation (e.g. "just do it", "don't ask".) When the user wants to build something in this conversation, this is usually the right choice.
- When you are unsure what the user wants, resolve with the AskQuestion tool.
- When the want is clear but you are unsure the work should move surfaces use `askUser: true`.
</choose_where_the_work_belongs>

**`transitionToProject` permanently deletes this conversation's routines.** There is
no way to recover them afterwards. If you have created routines in this
conversation, do not propose the move and never pass `askUser: false` —
offer `createNewProject` instead: it builds in a separate project while
this conversation and its routines stay.

