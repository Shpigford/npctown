# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NPC Town is an AI-driven social simulation where autonomous NPCs create emergent stories. It's a terminal-style web app where visitors observe (and occasionally influence) AI characters living their lives in a 20x20 ASCII grid world.

## Key Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000
npm run build           # Build for production
npm run lint            # Run ESLint

# Database Management
npx supabase db push    # Push migrations to remote database
npx supabase migration new <name>  # Create new migration
npx supabase db pull    # Pull remote schema changes
```

## Architecture Overview

### Core Systems

1. **AI Decision Engine** (`app/api/npc-actions/route.ts`)
   - Each NPC uses GPT-4 to make decisions based on personality, stats, surroundings, and memory
   - Decisions include rich descriptions and internal thoughts
   - Memory system tracks last 10 significant events per NPC
   - Stats affect behavior: low energy → rest, high hunger → seek food, low social → seek companions

2. **Real-time Updates** (`lib/hooks/useGame.ts`)
   - Supabase subscriptions on all tables (npcs, buildings, world_state, events)
   - Fallback polling every 2 seconds for reliability
   - UI automatically updates when database changes

3. **World Clock** (`lib/hooks/useWorldClock.ts`, `app/api/world-tick/route.ts`)
   - 10-second intervals = 1 game hour
   - World tick updates time, weather, and triggers all NPC actions
   - Weather changes with 30% probability per tick

4. **Visitor Interactions** (`components/InteractionPrompt.tsx`)
   - 15% chance every 10 seconds for visitor to control an NPC
   - Contextual choices based on NPC state and personality
   - 15-second timer for decisions
   - NPCs remember being "guided by mysterious force"

### Database Schema

- **npcs**: position (x,y), personality (traits/likes/dislikes), stats (health/energy/hunger/social), memory array, current_action
- **buildings**: static world structures with types (residential, commerce, social, etc.)
- **world_state**: time_of_day (0-23), day_count, weather, global_events
- **events**: activity log with type (movement/interaction/dialogue/action/system), description, metadata

### UI Components Architecture

- **Terminal**: Main container, manages layout and interaction state
- **AnimatedWorldMap**: Grid visualization with Lucide icons, shows movement trails
- **EventLog**: Real-time feed showing NPC actions with thoughts in italics
- **PeopleDirectory**: Lists all NPCs with stats, sortable, expandable details
- **StatusBar**: Shows day/time/weather/population

## Critical Implementation Details

### NPC Stats System
- **Energy**: Decreases by 5 per action, restored by 15 when resting
- **Hunger**: Increases by 2 per tick
- **Social**: +10 for interactions/speaking, -1 otherwise
- **Health**: Decreases when energy=0 or hunger>90, slowly recovers otherwise

### AI Prompt Context
The AI receives:
- Personality profile (traits, likes, dislikes)
- Current stats with descriptive states
- Time/weather context
- Nearby NPCs with their apparent state
- Nearby buildings with distance
- Recent memories (last 3 events)

### Movement System
- 8-directional movement (N,S,E,W,NE,NW,SE,SW)
- Boundaries enforced (0-19 for x and y)
- Movement trails show last 5 positions, fade over 10 seconds
- Smooth animations using Framer Motion

### Required Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
OPENAI_API_KEY=<your-openai-key>
```

## Common Development Tasks

### Adding New NPCs
NPCs can be added via the UI spawner or by inserting into the database with personality traits from: curious, friendly, hardworking, creative, adventurous, cautious, ambitious, lazy, social, introverted

### Modifying AI Behavior
Edit the prompt in `app/api/npc-actions/route.ts` - the AI considers personality, stats, surroundings, and memories when making decisions. Responses must be valid JSON with action, target, description, dialogue, and thought fields.

### Adjusting Game Speed
Change `TICK_INTERVAL` in `lib/hooks/useWorldClock.ts` (default: 10000ms = 10 seconds per game hour)

### Testing Locally
Use the "TRIGGER WORLD TICK" button in debug controls to manually advance time and trigger NPC actions without waiting for the timer.

# Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

## File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
  gemini command:

### Examples:

**Single file analysis:**
gemini -p "@src/main.py Explain this file's purpose and structure"

Multiple files:
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"

Entire directory:
gemini -p "@src/ Summarize the architecture of this codebase"

Multiple directories:
gemini -p "@src/ @tests/ Analyze test coverage for the source code"

Current directory and subdirectories:
gemini -p "@./ Give me an overview of this entire project"

# Or use --all_files flag:
gemini --all_files -p "Analyze the project structure and dependencies"

Implementation Verification Examples

Check if a feature is implemented:
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"

Verify authentication implementation:
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"

Check for specific patterns:
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"

Verify error handling:
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"

Check for rate limiting:
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"

Verify caching strategy:
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"

Check for specific security measures:
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"

Verify test coverage for features:
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"

When to Use Gemini CLI

Use gemini -p when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase

Important Notes

- Paths in @ syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for --yolo flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results