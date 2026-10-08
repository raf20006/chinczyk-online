// CHINCZYK ONLINE - Supabase connection

const SUPABASE_URL = "https://yzqavcqynxxrsaqwyqkw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_PMlDCynWJ4nqjCgOyQRd-w_IRBPkNCJ";

const $ = id => document.getElementById(id);

let client;
let currentGame = null;
let currentPlayer = null;
let realtimeChannel = null;

// Load Supabase
const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

script.onload = () => {
  client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  console.log("Supabase connected");

  $("create").addEventListener("click", createGame);
  $("join").addEventListener("click", joinGame);
  $("roll").addEventListener("click", rollDice);
};

document.head.appendChild(script);


// -------------------------
// CREATE GAME
// -------------------------

async function createGame() {
  const name = ($("name").value.trim() || "Raf").slice(0, 20);

  const code = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  const gameState = {
    version: 1,
    status: "waiting",
    turn: 1,
    dice: null,
    last_roll_by: null
  };

  const { data, error } = await client
    .from("games")
    .insert({
      code: code,
      player1_name: name,
      player1_team: "Portland Trail Blazers 🔴",
      game_state: gameState
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    $("message").textContent = "Could not create game: " + error.message;
    return;
  }

  currentGame = data;
  currentPlayer = 1;

  startRealtime();

  $("lobby").classList.add("hidden");
  $("game").classList.remove("hidden");

  $("status").textContent =
    `${name} 🔴 created game ${code}. Waiting for Gaz 🟢 to join.`;
}


// -------------------------
// JOIN GAME
// -------------------------

async function joinGame() {
  const code = $("code").value.trim().toUpperCase();
  const name = ($("name").value.trim() || "Gaz").slice(0, 20);

  if (code.length < 4) {
    $("message").textContent = "Enter the game code.";
    return;
  }

  const { data: game, error } = await client
    .from("games")
    .select("*")
    .eq("code", code)
    .single();

  if (error || !game) {
    console.error(error);
    $("message").textContent = "Game not found.";
    return;
  }

  if (game.player2_name) {
    $("message").textContent = "This game already has two players.";
    return;
  }

  const newGameState = {
    ...(game.game_state || {}),
    status: "ready"
  };

  const { data, error: updateError } = await client
    .from("games")
    .update({
      player2_name: name,
      player2_team: "Boston Celtics 🟢",
      game_state: newGameState
    })
    .eq("id", game.id)
    .select()
    .single();

  if (updateError) {
    console.error(updateError);
    $("message").textContent = "Could not join game: " + updateError.message;
    return;
  }

  currentGame = data;
  currentPlayer = 2;

  startRealtime();

  $("lobby").classList.add("hidden");
  $("game").classList.remove("hidden");

  $("status").textContent =
    `${data.player1_name} 🔴 Portland Trail Blazers vs ${name} 🟢 Boston Celtics — CONNECTED`;
}


// -------------------------
// REALTIME CONNECTION
// -------------------------

function startRealtime() {
  if (!currentGame) return;

  if (realtimeChannel) {
    client.removeChannel(realtimeChannel);
  }

  realtimeChannel = client
    .channel(`game-${currentGame.id}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "games",
        filter: `id=eq.${currentGame.id}`
      },
      payload => {
        currentGame = payload.new;

        updateGameDisplay(payload.new);

        console.log("Realtime update:", payload.new);
      }
    )
    .subscribe(status => {
      console.log("Realtime status:", status);
    });

  updateGameDisplay(currentGame);
}


// -------------------------
// UPDATE SCREEN
// -------------------------

function updateGameDisplay(game) {
  if (!game) return;

  if (game.player1_name && game.player2_name) {
    $("status").textContent =
      `${game.player1_name} 🔴 Portland Trail Blazers vs ` +
      `${game.player2_name} 🟢 Boston Celtics — CONNECTED`;
  } else {
    $("status").textContent =
      `${game.player1_name} 🔴 created game ${game.code}. Waiting for Gaz 🟢 to join.`;
  }

  const state = game.game_state || {};

  if (state.dice) {
    const diceSymbols = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    $("dice").textContent =
      diceSymbols[state.dice - 1] + " " + state.dice;
  } else {
    $("dice").textContent = "—";
  }
}


// -------------------------
// ROLL DICE
// -------------------------

async function rollDice() {
  if (!currentGame) return;

  const dice = Math.floor(Math.random() * 6) + 1;

  const newGameState = {
    ...(currentGame.game_state || {}),
    dice: dice,
    last_roll_by: currentPlayer
  };

  const { error } = await client
    .from("games")
    .update({
      game_state: newGameState
    })
    .eq("id", currentGame.id);

  if (error) {
    console.error(error);
    $("status").textContent = "Could not update the game.";
    return;
  }

  console.log("Dice rolled:", dice);
}
