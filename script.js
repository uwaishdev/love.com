/* ==========================================================================
   ROMANTIC PROPOSAL WEBSITE - JAVASCRIPT ENGINE (script.js)
   Features: 8-Screen Multi-Step Flow, Rock-Solid OPEN Button,
             Audio Synthesizer, Confetti & Google Sheets Integration
   ========================================================================== */

/* 1. PERSONALIZATION CONFIGURATION (YOU CAN EDIT THESE) */
/* script.js - Updated Part */

// 1. CONFIGURATION
const GIRLFRIEND_NAME = "My Love";
const YOUR_NAME = "Yours Forever";
const YOUR_WHATSAPP_NUMBER = "919876543210"; // <-- Yahan apna WhatsApp number Country code ke sath likhein (e.g. 91...)
const GOOGLE_APPS_SCRIPT_WEB_APP_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE"; // <-- Yahan Web App URL dalein

// Unique Session ID for this attempt
const SUBMISSION_ID = "PROP-" + Date.now().toString(36).toUpperCase();

// Helper to send individual step data to Google Sheet
async function saveStepToGoogleSheet(stepNumber, fieldName, fieldValue) {
  if (!GOOGLE_APPS_SCRIPT_WEB_APP_URL || !GOOGLE_APPS_SCRIPT_WEB_APP_URL.startsWith("http")) return;

  const payload = {
    submissionId: SUBMISSION_ID,
    step: "Question " + stepNumber,
    field: fieldName,
    answer: fieldValue,
    girlfriendName: GIRLFRIEND_NAME
  };

  try {
    fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
      mode: "no-cors"
    });
  } catch (err) {
    console.warn("Sheet save error:", err);
  }
}

/* Updated validateAndGo with Auto Save on Next */
window.validateAndGo = function (current, next) {
  let isValid = true;
  let inputEl = null;
  let fieldName = "";
  const errEl = document.getElementById("errStep" + current);

  if (current === 3) { inputEl = document.getElementById("ansBestMemory"); fieldName = "Special Memory"; }
  if (current === 4) { inputEl = document.getElementById("ansDreamDestination"); fieldName = "Weekend Escape"; }
  if (current === 5) { inputEl = document.getElementById("ansCuteHabit"); fieldName = "Cute Annoying Habit"; }
  if (current === 6) { inputEl = document.getElementById("ansOurSong"); fieldName = "Our Song"; }

  // Strict Validation: Textbox empty nahi hona chahiye
  if (inputEl && inputEl.value.trim() === "") {
    isValid = false;
    if (errEl) errEl.style.display = "block";
  } else {
    if (errEl) errEl.style.display = "none";
  }

  if (isValid) {
    // Background me Google Sheet par save karein
    saveStepToGoogleSheet(current - 2, fieldName, inputEl.value.trim());
    window.showStep(next);
  }
};

/* Submit Final Answer & WhatsApp Send logic */
document.addEventListener("DOMContentLoaded", function () {
  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) {
    submitBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const finalMsgInput = document.getElementById("ansFinalMessage");
      const errStep7 = document.getElementById("errStep7");

      if (!finalMsgInput || finalMsgInput.value.trim() === "") {
        if (errStep7) errStep7.style.display = "block";
        return;
      }
      if (errStep7) errStep7.style.display = "none";

      saveStepToGoogleSheet(5, "Final Message", finalMsgInput.value.trim());
      window.showStep(8);
      if (typeof startConfetti === "function") startConfetti();
    });
  }

  // WhatsApp Button Handler
  const sendWhatsappBtn = document.getElementById("sendWhatsappBtn");
  if (sendWhatsappBtn) {
    sendWhatsappBtn.addEventListener("click", function () {
      const q1 = document.getElementById("ansBestMemory")?.value || "N/A";
      const q2 = document.getElementById("ansDreamDestination")?.value || "N/A";
      const q3 = document.getElementById("ansCuteHabit")?.value || "N/A";
      const q4 = document.getElementById("ansOurSong")?.value || "N/A";
      const q5 = document.getElementById("ansFinalMessage")?.value || "N/A";

      const text = `❤️ *Proposal Answers From ${GIRLFRIEND_NAME}* ❤️\n\n` +
                   `1. *Special Memory:* ${q1}\n\n` +
                   `2. *Weekend Escape:* ${q2}\n\n` +
                   `3. *Cute Habit:* ${q3}\n\n` +
                   `4. *Our Song:* ${q4}\n\n` +
                   `💌 *Heart's Message:* ${q5}`;

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${YOUR_WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, "_blank");
    });
  }
});

/* Custom Music Control from Admin Settings */
let customAudio = null;
function toggleMusic() {
  const customUrl = localStorage.getItem("admin_custom_music_url");
  const btnText = document.getElementById("audioBtnText");

  if (customUrl) {
    if (!customAudio) {
      customAudio = new Audio(customUrl);
      customAudio.loop = true;
    }
    if (customAudio.paused) {
      customAudio.play();
      if (btnText) btnText.textContent = "Mute";
    } else {
      customAudio.pause();
      if (btnText) btnText.textContent = "Play Music";
    }
  } else {
    // Fallback to synth if no custom audio provided
    if (typeof playSynthesizedTone === "function") {
      // Default Synthesizer logic
    }
  }
}

/* ==========================================================================
   2. INITIALIZE PERSONALIZATION ON PAGE LOAD
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function () {
  // Update girlfriend name across the page
  document.querySelectorAll(".gf-name").forEach(function (el) {
    el.textContent = GIRLFRIEND_NAME;
  });

  const sigEl = document.getElementById("yourNameSignature");
  if (sigEl) {
    sigEl.textContent = YOUR_NAME;
  }

  // Bind OPEN ❤️ button explicitly
  const openBtn = document.getElementById("openBtn");
  if (openBtn) {
    openBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.showStep(2);
    });
  }

  // Create floating background particles
  createFloatingParticles();
});

/* ==========================================================================
   3. ROCK-SOLID NAVIGATION ENGINE (FIXES THE OPEN BUTTON & ALL SCREENS)
   ========================================================================== */
window.showStep = function (stepNum) {
  // Hide all screens 1 to 8
  for (let i = 1; i <= 8; i++) {
    const screen = document.getElementById("step" + i);
    if (screen) {
      screen.classList.remove("active");
    }
  }

  // Display the target screen
  const targetScreen = document.getElementById("step" + stepNum);
  if (targetScreen) {
    targetScreen.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Play subtle sparkle tone
  playSparkle();
};

/* Validate input before moving forward */
window.validateAndGo = function (current, next) {
  let isValid = true;
  let inputEl = null;
  const errEl = document.getElementById("errStep" + current);

  if (current === 3) inputEl = document.getElementById("ansBestMemory");
  if (current === 4) inputEl = document.getElementById("ansDreamDestination");
  if (current === 5) inputEl = document.getElementById("ansCuteHabit");
  if (current === 6) inputEl = document.getElementById("ansOurSong");

  if (inputEl && inputEl.value.trim() === "") {
    isValid = false;
    if (errEl) errEl.style.display = "block";
  } else {
    if (errEl) errEl.style.display = "none";
  }

  if (isValid) {
    window.showStep(next);
  }
};

/* ==========================================================================
   4. DATA SUBMISSION: GOOGLE SHEETS & LOCAL STORAGE BACKUP
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function () {
  const submitBtn = document.getElementById("submitBtn");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", async function (e) {
    e.preventDefault();

    const finalMsgInput = document.getElementById("ansFinalMessage");
    const errStep7 = document.getElementById("errStep7");

    if (!finalMsgInput || finalMsgInput.value.trim() === "") {
      if (errStep7) errStep7.style.display = "block";
      return;
    }
    if (errStep7) errStep7.style.display = "none";

    // Disable button & show delivering state
    submitBtn.disabled = true;
    submitBtn.innerHTML = "<span>Delivering with Love...</span> <span>💖</span>";

    const payload = {
      submissionId: "PROP-" + Date.now().toString(36).toUpperCase(),
      submissionDate: new Date().toLocaleString(),
      girlfriendName: GIRLFRIEND_NAME,
      bestMemory: (document.getElementById("ansBestMemory")?.value || "").trim(),
      dreamDestination: (document.getElementById("ansDreamDestination")?.value || "").trim(),
      cuteHabit: (document.getElementById("ansCuteHabit")?.value || "").trim(),
      ourSong: (document.getElementById("ansOurSong")?.value || "").trim(),
      finalMessage: finalMsgInput.value.trim(),
      status: "Submitted with Love ❤️"
    };

    // 1. ALWAYS Save locally in browser so no answer is EVER lost
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
      existing.unshift(payload);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
    } catch (err) {
      console.warn("Local storage write error:", err);
    }

    // 2. Post to Google Sheets if Web App URL is provided
    if (GOOGLE_APPS_SCRIPT_WEB_APP_URL && GOOGLE_APPS_SCRIPT_WEB_APP_URL.startsWith("http")) {
      try {
        await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          mode: "no-cors" // Google Apps Script redirects require no-cors in browser client
        });
      } catch (scriptErr) {
        console.warn("Apps Script forward warning:", scriptErr);
      }
    }

    // Show Thank You Screen & start celebration confetti
    window.showStep(8);
    startConfetti();
  });
});

/* ==========================================================================
   5. AMBIENT ROMANTIC SOUND SYNTHESIZER (NO EXTERNAL AUDIO FILES NEEDED)
   ========================================================================== */
let audioCtx = null;
let isAudioPlaying = false;
let audioTimer = null;

function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playSynthesizedTone(freq, delaySec, durationSec) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime + delaySec;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + durationSec + 0.1);
}

function playSparkle() {
  try {
    initAudioContext();
    [523.25, 659.25, 783.99, 1046.5].forEach(function (f, idx) {
      playSynthesizedTone(f, idx * 0.05, 0.4);
    });
  } catch (e) {
    // Audio autoplay fallback
  }
}

// Gentle romantic chord progression: Cmaj7 -> Am7 -> Fmaj7 -> G
const romanticChords = [
  [261.63, 329.63, 392.0, 493.88],
  [220.0, 261.63, 329.63, 392.0],
  [174.61, 261.63, 329.63, 349.23],
  [196.0, 246.94, 293.66, 392.0]
];
let chordIndex = 0;

function toggleMusic() {
  initAudioContext();
  const btnText = document.getElementById("audioBtnText");

  if (isAudioPlaying) {
    isAudioPlaying = false;
    if (audioTimer) clearInterval(audioTimer);
    if (btnText) btnText.textContent = "Play Music";
  } else {
    isAudioPlaying = true;
    if (btnText) btnText.textContent = "Mute";

    const playNextChord = function () {
      const notes = romanticChords[chordIndex];
      notes.forEach(function (freq, idx) {
        playSynthesizedTone(freq, idx * 0.3, 2.5);
      });
      chordIndex = (chordIndex + 1) % romanticChords.length;
    };

    playNextChord();
    audioTimer = setInterval(playNextChord, 3000);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const audioBtn = document.getElementById("audioToggleBtn");
  if (audioBtn) {
    audioBtn.addEventListener("click", toggleMusic);
  }
});

/* ==========================================================================
   6. FLOATING PARTICLES & CELEBRATION CONFETTI
   ========================================================================== */
function createFloatingParticles() {
  const container = document.getElementById("particleContainer");
  if (!container) return;

  for (let i = 0; i < 16; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.innerHTML = i % 2 === 0 ? "❤️" : "✨";
    p.style.left = (Math.random() * 95) + "%";
    p.style.animationDuration = (8 + Math.random() * 8) + "s";
    p.style.animationDelay = (Math.random() * 6) + "s";
    p.style.fontSize = (12 + Math.random() * 12) + "px";
    container.appendChild(p);
  }
}

function startConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#ff007f", "#ff4d94", "#ff80bf", "#ffd1dc", "#ffffff", "#ffd700"];

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height * 0.6,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    });
    requestAnimationFrame(loop);
  }
  loop();
}
