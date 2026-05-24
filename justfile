# Dr. Pestana's Dental Office — task runner
# Run `just` (no args) to see all commands.

set shell := ["bash", "-cu"]

# Default: list available commands
default:
    @just --list

# Start the local dev server with live reload (drafts included)
dev:
    hugo server --buildDrafts --bind 127.0.0.1 --port 1313

# Same as `dev`, but without drafts (matches what production will show)
serve:
    hugo server --bind 127.0.0.1 --port 1313

# Open the running dev server in your default browser
open:
    open http://127.0.0.1:1313

# Build the production site into ./public
build:
    hugo --minify --gc

# Build, then preview the static output locally (closest to what visitors see)
preview: build
    cd public && python3 -m http.server 8080

# Remove build artifacts
clean:
    rm -rf public resources .hugo_build.lock

# Create a new announcement. Pass a kebab-case slug:
#   just new-announcement thanksgiving-closure
new-announcement slug:
    hugo new content "announcements/$(date +%Y-%m-%d)-{{slug}}.md"
    @echo ""
    @echo "Created. Open it in your editor and write the body."

# List announcements (most recent first)
announcements:
    @ls -1 content/announcements/ | grep -v '^_index' | sort -r

# Show Hugo version (useful for matching HUGO_VERSION in Cloudflare/Netlify)
version:
    @hugo version

# One-shot pre-deploy check: clean, build, report output size
check: clean build
    @echo ""
    @echo "Build OK. Site size:"
    @du -sh public
    @echo ""
    @echo "Ready to commit and push."

# Install/upgrade Hugo via Homebrew
install-hugo:
    brew install hugo || brew upgrade hugo
