# NPC Town - AI Social Experiment

A terminal-style simulation where AI-controlled NPCs make autonomous decisions and live their lives. Watch as they interact, form relationships, and create emergent stories.

## Features

- **ASCII Grid Map**: 20x20 world with NPCs (N) and buildings (#, H, M, T, h, F, W)
- **Real-time AI Decisions**: Each NPC uses GPT-4 to decide their actions based on personality, needs, and environment
- **Dynamic World**: Day/night cycles, weather changes, and time progression
- **Event Log**: Watch NPC actions, dialogues, and interactions in real-time
- **No User Control**: Pure observation of AI behavior

## Setup

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up Supabase:**
   - Create a new Supabase project at https://supabase.com
   - Note your project reference ID (found in Settings > General)
   - Copy your project URL and anon key

3. **Configure environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase credentials and OpenAI API key

4. **Link to your remote Supabase project:**
```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Link to your project (replace with your actual project ref)
npx supabase link --project-ref <your-project-ref>

# Push the migration to your remote database
npx supabase db push
```

5. **Run the development server:**
```bash
npm run dev
```

6. **Open http://localhost:3000**

## Managing Database Migrations

To create new migrations:
```bash
# Create a new migration
npx supabase migration new <migration_name>

# Edit the migration file in supabase/migrations/

# Push migrations to remote
npx supabase db push
```

To pull remote schema changes:
```bash
npx supabase db pull
```

## Architecture

- **Frontend**: Next.js with TypeScript, Tailwind CSS for terminal aesthetics
- **Backend**: Supabase for real-time database, Vercel AI SDK with OpenAI
- **Game Loop**: 30-second ticks represent 1 hour in-game
- **NPC AI**: Each NPC has personality traits, needs (hunger, energy, social), and memories

## How It Works

1. NPCs have personality traits that influence their decisions
2. Every game hour, each NPC receives world context and decides their action
3. Actions include: moving, talking, entering buildings, interacting with others
4. All events are logged and displayed in the terminal
5. NPCs' needs change over time, affecting their behavior

## Extending

- Add more NPCs by inserting into the `npcs` table
- Create new buildings in the `buildings` table
- Modify NPC decision-making in `app/api/npc-actions/route.ts`
- Adjust time speed in `lib/hooks/useWorldClock.ts`