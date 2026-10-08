// Online-ready starter.
// For the first test this works locally. The next step is connecting this
// lobby to Supabase Realtime so two devices share the same game state.

const $ = id => document.getElementById(id);
let playerName = "";

$("create").addEventListener("click", () => {
  playerName = ($("name").value.trim() || "Player 1").slice(0,20);
  const code = Math.random().toString(36).slice(2,8).toUpperCase();
  $("lobby").classList.add("hidden");
  $("game").classList.remove("hidden");
  $("status").textContent = `${playerName} created game ${code}. Send this code to your daughter.`;
});

$("join").addEventListener("click", () => {
  const code = $("code").value.trim().toUpperCase();
  playerName = ($("name").value.trim() || "Player 2").slice(0,20);
  if (code.length < 4) {
    $("message").textContent = "Enter the game code.";
    return;
  }
  $("lobby").classList.add("hidden");
  $("game").classList.remove("hidden");
  $("status").textContent = `${playerName} joined game ${code}.`;
});

$("roll").addEventListener("click", () => {
  const n = Math.floor(Math.random()*6)+1;
  $("dice").textContent = ["⚀","⚁","⚂","⚃","⚄","⚅"][n-1] + " " + n;
});
