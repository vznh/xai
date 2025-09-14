# Surface-Only Component Generator Backend

A Next.js serverless backend that generates React+Tailwind components from image analysis, powered by multi-model LLM agents.

## Features

- **Image Analysis**: Canvas-based color extraction and layout detection
- **Multi-Model LLM**: Supports GPT-5, Grok-4, Gemini-2.5-Pro, Claude-3-Opus
- **Component Generation**: Creates headless, accessible React TypeScript components
- **Sandbox Deployment**: Auto-deploys to Vercel for preview
- **Real-time Streaming**: Server-Sent Events for generation progress

## API Endpoints

### POST /api/generate
Generate components from images with real-time streaming.

**Request Body:**
```json
{
  "images": [
    {
      "id": "unique_id",
      "blobBase64": "base64_string",
      "mime": "image/jpeg",
      "tags": ["button", "primary"],
      "description": "A blue button with rounded corners"
    }
  ],
  "blend": {
    "paletteFromImageId": "image_id_or_null",
    "layoutFromImageId": "image_id_or_null"
  },
  "negatives": ["no-glassmorphism", "no-animations"],
  "providerKeys": {
    "openai": "sk-...",
    "grok": "grok-...",
    "gemini": "AIza...",
    "claude": "claude-..."
  }
}
```

**Response (SSE):**
- `progress`: Generation step updates
- `file`: Generated file contents
- `preview`: Deployed preview URL
- `done`: Final summary

### GET /api/versions
List all generated component versions.

### POST /api/promote/[version]
Promote a version (removes TTL, keeps permanently).

### GET /api/evaluation/[version]
Get basic SSIM evaluation scores (v1 minimal).

### GET /api/cron/purge?key=SECRET
Cleanup expired versions and files.

## Architecture

### Agent Pipeline
1. **Component Agent**: Creates base TypeScript component structure
2. **Style Agent**: Applies measured design tokens as Tailwind classes
3. **Layout Agent**: Adds responsive grid/flex layouts
4. **A11y Agent**: Implements accessibility features
5. **Preview Agent**: Generates sandbox preview page
6. **Fix Agent**: Validates and fixes code violations

### File Structure
```
src/
├── pages/api/              # Next.js API routes
├── services/               # Core business logic
│   ├── agents/            # LLM agent implementations
│   ├── measure.ts         # Image analysis
│   ├── sandbox.ts         # Vercel deployment
│   └── storage.ts         # File persistence
├── utils/                 # Utilities (SSE, hashing, etc.)
├── prompts/               # LLM prompt templates
└── types/                 # TypeScript definitions
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
# Required for deployment
VERCEL_TOKEN=your_vercel_token

# Required for security
CRON_SECRET=secure_random_string

# Optional limits
MAX_IMAGE_COUNT=5
MAX_IMAGE_MB=10
TTL_CODE_DAYS=14
```

## Constraints

- **No Fonts**: Never generates font-family declarations
- **No Animations**: Static components only in v1
- **Tailwind Only**: Minimal custom CSS exceptions
- **Headless Design**: Props-based, composable components
- **Surface Analysis**: Only visible design elements, no inference

## Development

```bash
npm install
npm run dev
```

The backend will be available at `http://localhost:3000/api/`

## Persistence

Currently uses localStorage for development. Production ready with Supabase configuration in environment variables.