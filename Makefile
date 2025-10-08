.PHONY: build dev docs clean install install-air install-deps help update-blender-init release-macos go-lint go-test generate-mix_sdk gsap-server

# Default target
help:
	@echo "Available targets:"
	@echo "  dev         - Install dependencies and run all development servers (backend, frontend, GSAP)"
	@echo "  tail-log    - Show the last 100 lines of the log"
	@echo "  typecheck - Run TypeScript typecheck on frontend code"
	@echo "  format - Run knip linter on frontend code"
	@echo "  lint - Run knip linter on frontend code"
	@echo "  knip - Run biome linter on frontend code"
	@echo "  help        - Show this help message"
	@echo ""


# Run development server with hot reloading (installs deps first)
# This starts backend, frontend, and GSAP server together
dev: install-deps
	@ENV=development ./scripts/shoreman.sh

# Display the last 100 lines of development log with ANSI codes stripped
tail-log:
	@tail -100 ./dev.log | perl -pe 's/\e\[[0-9;]*m(?:\e\[K)?//g'

# Run TypeScript typecheck on frontend code
typecheck:
	@echo "Running frontend TypeScript typecheck..."
	bun run typecheck

format:
	@echo "Running biome formatter on frontend..."
	bunx biome format --write

lint:
	@echo "Running biome linter on frontend..."
	bunx biome check --write

knip:
	@echo "Running knip linter on frontend..."
	bun knip
