# Chińczyk Online — starter

This is the first web-app skeleton for the personalised Chińczyk project.

Included:
- personalised board artwork
- Create Game screen
- Join Game screen
- game code generation
- dice prototype

IMPORTANT:
The current version is NOT yet online multiplayer. The next technical step is
to connect the lobby and game state to a realtime backend.

Recommended backend:
Supabase Realtime.

Next build:
1. Create a Supabase project.
2. Create a games table containing game code, players and board state.
3. Enable Realtime.
4. Replace the temporary JavaScript state with Supabase Realtime.
5. Add proper Chińczyk rules and pawn selection.
6. Deploy the website to Vercel or another static host.

The supplied board image is in assets/board.png.
