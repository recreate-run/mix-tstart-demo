# Claude Code Integration

## Development Commands

<bash_commands>
make dev          # start the frontend  (autoreloads and auto compiles)
make tail-log     # Reads the current log file (last 100 lines of code)
make clean
make help
make typecheck     # Always use this for frontend typechecking

</bash_commands>

- Do NOT build the program yourself to check for errors—ever. All output is written to `dev.log`. Run `make tail-log` to view it.
- Do NOT stop the dev server. It stays running, auto-compiles, and auto-reloads via the Go `air` package, logging to `dev.log`.
- Run `make` from the project's top-level directory. If it fails, you probably weren't there.
- You MUST check the tail-log after finishing each task

## Architecture

1. Frontend - Tanstack start app with react

## Tech Stack

- ALWAYS use TanStack Query for data fetching

## Code style

1. As this is an early-stage startup, YOU MUST prioritize simple, readable code with minimal abstraction—avoid premature optimization. Strive for elegant, minimal solutions that reduce complexity.Focus on clear implementation that’s easy to understand and iterate on as the product evolves.
2. NEVER mock LLM API calls
3. DO NOT preserve backward compatibility unless the user specifically requests it
4. Do not handle errors (eg. API failures) gracefully, raise exceptions immediately.
