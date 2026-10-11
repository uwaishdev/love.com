/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Our Love Story — Shared Configuration & Utility Engine
 * Provides persistent configuration, schema definitions, validation,
 * image processing, and Google Sheets submission dispatchers.
 */

const STORAGE_KEY = 'romanticProposalConfig_v1';
const SESSION_STORAGE_KEY = 'romanticProposalSession_v1';

// Full default configuration schema
const DEFAULT_CONFIG = {
  version: 1,
  general: {
    experienceTitle: "Our Love Story — An Interactive Proposal Experience",
    browserTitle: "A Special Journey For You ❤️",
    defaultGreeting: "My Love",
    footerText: "Made with all my heart, forever and always.",
    enableRestart: true
  },
  welcome: {
    enabled: true,
    badge: "A Little Surprise For You ✨",
    heading: "Someone has a little something special for you...",
    subheading: "A tiny journey filled with love, memories, and one very important question.",
    introMessage: "Take a deep breath, smile, and let me take you on a walk down our memory lane.",
    buttonText: "Open My Little Love Story ✨",
    imageUrl: ""
  },
  nameEntry: {
    enabled: true,
    required: true,
    heading: "Before we start... what should I call you?",
    subheading: "Your nickname, your sweet name, or whatever makes you smile most.",
    placeholder: "Your beautiful name...",
    buttonText: "Let's Begin ❤️"
  },
  questions: [
    {
      id: "q_1",
      type: "text",
      enabled: true,
      required: true,
      title: "What was the first thing you noticed about me?",
      description: "Be totally honest! I still remember the exact moment our eyes first met.",
      placeholder: "Tell me the honest truth...",
      multiline: false,
      minLength: 2,
      maxLength: 200,
      badge: "First Impressions",
      imageUrl: "",
      options: [],
      autoAdvance: false
    },
    {
      id: "q_2",
      type: "option",
      enabled: true,
      required: true,
      title: "Which of these describes us best?",
      description: "Every single chapter of our story feels like a dream.",
      badge: "Us in a Nutshell",
      imageUrl: "",
      autoAdvance: true,
      options: [
        { id: "opt_1", label: "Best Friends & Soulmates", emoji: "✨" },
        { id: "opt_2", label: "Partners in Crime", emoji: "🕵️‍♀️" },
        { id: "opt_3", label: "Two Souls, One Story", emoji: "📖" },
        { id: "opt_4", label: "My Favorite Person in the Universe", emoji: "🌌" }
      ]
    },
    {
      id: "q_3",
      type: "text",
      enabled: true,
      required: true,
      title: "What is your favorite memory of us so far?",
      description: "Whether it was a big adventure or a quiet late-night talk in pajamas.",
      placeholder: "Write about our special moment...",
      multiline: true,
      minLength: 3,
      maxLength: 500,
      badge: "Cherished Memories",
      imageUrl: "",
      options: [],
      autoAdvance: false
    },
    {
      id: "q_4",
      type: "option",
      enabled: true,
      required: false,
      title: "Where is our next dream getaway together?",
      description: "Anywhere in the world, as long as your hand is in mine.",
      badge: "Our Future Adventures",
      imageUrl: "",
      autoAdvance: true,
      options: [
        { id: "opt_beach", label: "A cozy beach sunset with waves crashing", emoji: "🌅" },
        { id: "opt_mountain", label: "A foggy mountain cabin with hot cocoa", emoji: "🏔️" },
        { id: "opt_city", label: "Late night stroll under glowing city lights", emoji: "✨" },
        { id: "opt_couch", label: "Curled up under blankets watching movies", emoji: "🛋️" }
      ]
    },
    {
      id: "q_5",
      type: "text",
      enabled: true,
      required: true,
      title: "One promise you want me to keep forever?",
      description: "Tell me what matters most to your sweet heart.",
      placeholder: "Your wish is my lifelong promise...",
      multiline: false,
      minLength: 2,
      maxLength: 250,
      badge: "A Sacred Promise",
      imageUrl: "",
      options: [],
      autoAdvance: false
    }
  ],
  loveLetter: {
    enabled: true,
    position: "before_proposal", // "before_proposal" | "after_proposal"
    badge: "Straight From My Heart",
    title: "My Dearest Love",
    date: "For Today, Tomorrow & Always",
    opening: "If you are reading this, I want you to know how deeply you have changed my life.",
    body: "From the very day you walked into my life, you turned ordinary days into pure magic. Your laughter is my favorite melody, your warmth is my sanctuary, and your sweet smile makes every worry disappear.\n\nThrough every silly joke we've laughed at, every quiet evening we've treasured, and every little dream we've whispered, I have realized one undeniable truth: life isn't just better with you—it only makes sense with you by my side.\n\nThank you for choosing me, for believing in us, and for making my world brighter than I ever dreamed it could be.",
    closing: "With all my love and devotion,",
    signature: "Yours Forever ❤️",
    showSignature: true,
    imageUrl: "",
    buttonText: "Turn the Page to What's Next ✨"
  },
  proposal: {
    enabled: true,
    badge: "The Most Important Question",
    heading: "I have one last question for you...",
    question: "Will you be my forever?",
    subtext: "Through every adventure, every high, every low, and every tomorrow.",
    yesText: "Yes, Absolutely! 💍❤️",
    noText: "No 🙈",
    noPlayfulMessages: [
      "Are you sure? Try clicking again! 😉",
      "Oops! That button is a bit shy! 🏃‍♂️",
      "Nice try, but your heart says YES! 💖",
      "Almost caught it... but not quite! 🙈",
      "Resistance is adorable, but impossible! 🥰",
      "You know the only true answer is YES! ✨"
    ],
    imageUrl: ""
  },
  celebration: {
    heading: "You Just Made My World More Beautiful! 💍✨❤️",
    subheading: "SHE SAID YES! Best day of my life!",
    message: "Some moments are too sacred and pure for words. This is the happiest moment of my life, and I promise to love, protect, and cherish you with everything I have, every single day.",
    effect: "confetti_and_hearts", // "confetti_and_hearts", "hearts", "none"
    imageUrl: "",
    showLoveLetterBtn: true,
    showSocialButtons: true,
    showRestartBtn: true
  },
  images: {
    couplePhoto: "",
    boyfriendPhoto: "",
    girlfriendPhoto: "",
    backgroundImage: ""
  },
  theme: {
    preset: "burgundy_rose",
    bgPrimary: "#190914",
    bgSecondary: "#54152E",
    accentColor: "#E85D88",
    accentGlow: "rgba(232, 93, 136, 0.45)",
    cardBg: "rgba(35, 12, 27, 0.85)",
    cardBorder: "rgba(232, 93, 136, 0.3)",
    textPrimary: "#FFF7F2",
    textSecondary: "#E7C58D",
    textMuted: "#DCC8F2",
    fontHeading: "'Great Vibes', cursive",
    fontBody: "'Poppins', sans-serif",
    fontLetter: "'Cormorant Garamond', serif",
    gradientDirection: "135deg",
    bgOverlayOpacity: 0.65,
    heartStyle: "falling", // "falling", "floating", "stars_hearts", "glow_gradient", "none"
    heartSpeed: "medium", // "slow", "medium", "fast"
    heartDensity: "normal", // "low", "normal", "high"
    reducedMotion: false
  },
  social: {
    whatsapp: {
      enabled: true,
      countryCode: "1",
      phoneNumber: "",
      prefilledMessage: "I said YES! 💍❤️ Our love story is forever!",
      buttonLabel: "Tell the World on WhatsApp 💬"
    },
    instagram: {
      enabled: true,
      usernameOrUrl: "",
      buttonLabel: "Share to Instagram 📸"
    }
  },
  integrations: {
    googleAppsScriptUrl: "",
    sendEvents: true,
    sendAnswers: true
  }
};

/**
 * Deep merge utility to ensure backwards compatibility when config expands
 */
function deepMerge(target, source) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Loads configuration from localStorage safely with deep fallback
 */
function loadAppConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
    // Deep merge to guarantee all keys exist
    const merged = deepMerge(DEFAULT_CONFIG, parsed);
    // Ensure questions array is preserved from parsed if valid
    if (Array.isArray(parsed.questions)) {
      merged.questions = parsed.questions;
    }
    return merged;
  } catch (err) {
    console.error('Failed to parse config from localStorage, falling back to defaults:', err);
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
}

/**
 * Saves configuration to localStorage with quota check
 */
function saveAppConfig(config) {
  try {
    const json = JSON.stringify(config);
    localStorage.setItem(STORAGE_KEY, json);
    return { success: true };
  } catch (err) {
    console.error('Failed to save config to localStorage:', err);
    let msg = 'Failed to save settings to browser storage.';
    if (err && (err.name === 'QuotaExceededError' || err.code === 22)) {
      msg = 'Storage limit exceeded. This usually happens if high-resolution images were uploaded locally. Please use image URLs or smaller images.';
    }
    return { success: false, error: msg };
  }
}

/**
 * Resets configuration to defaults
 */
function resetAppConfig() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { success: true, config: JSON.parse(JSON.stringify(DEFAULT_CONFIG)) };
  } catch (err) {
    return { success: false, error: 'Could not reset storage.' };
  }
}

/**
 * Session ID manager
 */
function getOrCreateSessionId() {
  try {
    let sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
    }
    return sid;
  } catch (e) {
    return 'session_' + Date.now();
  }
}

/**
 * Text and URL sanitization
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const str = String(text);
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, m => map[m]);
}

function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }
  return '';
}

/**
 * Normalizes WhatsApp link
 */
function buildWhatsAppLink(countryCode, phoneNumber, message) {
  const cleanCode = (countryCode || '').replace(/\D/g, '');
  const cleanPhone = (phoneNumber || '').replace(/\D/g, '');
  const fullPhone = cleanCode + cleanPhone;
  if (!fullPhone) return '';
  const encodedText = encodeURIComponent(message || '');
  return `https://wa.me/${fullPhone}?text=${encodedText}`;
}

/**
 * Normalizes Instagram link
 */
function buildInstagramLink(usernameOrUrl) {
  if (!usernameOrUrl) return '';
  const trimmed = usernameOrUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return sanitizeUrl(trimmed);
  }
  const cleanHandle = trimmed.replace(/^@/, '').replace(/[^a-zA-Z0-9._]/g, '');
  if (!cleanHandle) return '';
  return `https://instagram.com/${cleanHandle}`;
}

/**
 * Compresses an image file from local upload to avoid filling up localStorage
 * Resizes down to maxWidth 800px and exports as JPEG quality 0.75
 */
function compressImageFile(file, maxWidth = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/image.*/)) {
      reject(new Error('File is not an image'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const image = new Image();
      image.onload = () => {
        let width = image.width;
        let height = image.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target.result);
          return;
        }
        ctx.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      image.onerror = () => reject(new Error('Invalid image file'));
      image.src = readerEvent.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Submits payload to Google Apps Script endpoint
 * Uses text/plain body to avoid CORS preflight failures on Google Apps Script Web Apps
 */
async function submitToGoogleAppsScript(endpointUrl, payload) {
  if (!endpointUrl || !endpointUrl.startsWith('http')) {
    return {
      status: 'unconfigured',
      message: 'Google Apps Script endpoint is not configured. Responses are stored in your current browser session.'
    };
  }

  try {
    // Mode 'no-cors' allows sending to Google Apps Script without preflight rejection,
    // but browser cannot read response body. When mode is standard or CORS is allowed, we try standard first.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Try parsing JSON if accessible
    let data = null;
    try {
      data = await response.json();
    } catch (_) {
      // Cross-origin redirect in Google Apps Script can result in opaque response
    }

    if (response.ok || response.type === 'opaque') {
      return {
        status: 'success',
        data: data,
        message: 'Submission successfully received by Google Apps Script!'
      };
    } else {
      return {
        status: 'error',
        message: `Submission returned HTTP ${response.status}. Please check Apps Script deployment.`
      };
    }
  } catch (err) {
    console.warn('Google Apps Script request notice:', err);
    // Google Apps Script redirects (302) to script.googleusercontent.com which sometimes
    // triggers browser CORS errors even when the row was recorded in the Sheet!
    return {
      status: 'network_warning',
      message: 'Request sent to Google Apps Script. If your script handles 302 redirects, data may have been recorded.',
      error: err.message
    };
  }
}

// Export to window for browser access
window.LoveStoryConfig = {
  DEFAULT_CONFIG,
  STORAGE_KEY,
  SESSION_STORAGE_KEY,
  loadAppConfig,
  saveAppConfig,
  resetAppConfig,
  getOrCreateSessionId,
  escapeHtml,
  sanitizeUrl,
  buildWhatsAppLink,
  buildInstagramLink,
  compressImageFile,
  submitToGoogleAppsScript
};
