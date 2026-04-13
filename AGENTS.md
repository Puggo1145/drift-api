# CLAUDE.md

This file provides guidance to Coding Agents when working with code in this repository.

## Project

Drift API is the backend for an AI white-noise generation app. It accepts a natural-language prompt, runs an agent loop to understand user's white-noise description, use tools to concurrently call the ElevenLabs text-to-sound-effect API, and returns the raw audio segments. Mixing is deferred to the frontend — the backend only returns individual effects.

## Stack

- **Runtime + package manager**: Bun
- **Framework**: NestJS with the Fastify adapter
- **Agent**: Vercel AI SDK (`ai` + `@ai-sdk/openai`), OpenAI `gpt-5.4-mini`
- **Audio**: ElevenLabs text-to-sound-effect API
- **Validation**: Zod (env schema + tool parameter schemas)
- **Logging**: pino via `nestjs-pino`
- **Concurrency**: `p-limit`

## Commands

```bash
bun install            # install deps
bun run dev            # dev server with --hot reload
bun run start          # production-style run
bun run typecheck      # tsc --noEmit
```

## Architecture

### Agent loop
The agent is implemented with Vercel AI SDK. A general sound generation flow is:

1. Receives an array of `{ id, prompt, durationSec }` from the LLM.
2. Calls ElevenLabs concurrently through `p-limit(3)`, with retry + timeout.
3. Stores successful audio buffers
4. Returns **only metadata** (id, status, duration) back to the LLM — buffers are deliberately excluded to keep token usage low.

After the loop terminates, the service reads the buffer Map, base64-encodes each entry, and assembles the final response. This split — LLM sees metadata, service sees buffers — is load-bearing; don't merge them.

### Module boundaries
The `audio` module owns everything request-specific: controller, service, agent wiring, ElevenLabs client. The `health` module is a deployment probe. `shared/config` validates env with Zod at startup and hard-fails on missing values.

## Conventions

### Code standard
- YAGNI
- Fail fast and loudly. Do not write fallback logic unless it is explicitly requested

### Error handling
- Do not handle errors inside business layers. Let exceptions/errors bubble up early

### Tests
- Prove a bug/problem exists by failing it. Only write tests that will definitely pass proves nothing
- use random numbers instead of hardcoded value when tests input is uncertain
