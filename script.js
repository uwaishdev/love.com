/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Our Love Story — Public Interactive Proposal Experience Engine
 * Drives state navigation, dynamic questions, interactive proposal arena,
 * evasive No button, confetti celebrations, and Google Sheets submissions.
 */

(function () {
  'use strict';

  // Application State
  const state = {
    config: null,
    sessionId: '',
    screens: [],
    currentScreenIndex: 0,
    respondentName: '',
    answers: {},
    loveLetterRead: false,
    proposalAccepted: false,
    isSubmitting: false,
    submissionAttempted: false
  };

  // Heart particle animation interval / state
  let heartInterval = null;
  let noButtonAttemptCount = 0;

  /**
   * Initialize Experience on DOM Ready
   */
  document.addEventListener('DOMContentLoaded', initApp);

  function initApp() {
    // 1. Load configuration safely
    state.config = window.LoveStoryConfig ? window.LoveStoryConfig.loadAppConfig() : null;
    if (!state.config) {
      console.error('Failed to load application configuration.');
      return;
    }

    state.sessionId = window.LoveStoryConfig.getOrCreateSessionId();

    // 2. Set browser title & apply theme styles
    document.title = state.config.general.browserTitle || state.config.general.experienceTitle;
    applyTheme(state.config.theme);

    // 3. Update brand header text
    const brandElem = document.getElementById('headerBrandTitle');
    if (brandElem && state.config.general.experienceTitle) {
      brandElem.innerHTML = `<span>${window.LoveStoryConfig.escapeHtml(state.config.general.experienceTitle)}</span> <span>❤️</span>`;
    }

    // 4. Update footer text
    const footerText = document.getElementById('appFooterText');
    if (footerText && state.config.general.footerText) {
      footerText.textContent = state.config.general.footerText;
    }

    // 5. Initialize background particles
    initHeartParticles(state.config.theme);

    // 6. Build linear journey screen sequence
    buildScreenSequence();

    // 7. Render initial screen
    renderCurrentScreen();

    // Record Milestone Event: Journey Started
    recordMilestoneEvent('Journey Started', 'User opened proposal website');
  }

  /**
   * Applies CSS Custom Properties dynamically from theme configuration
   */
  function applyTheme(theme) {
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', theme.bgPrimary || '#190914');
    root.style.setProperty('--bg-secondary', theme.bgSecondary || '#54152E');
    root.style.setProperty('--accent-color', theme.accentColor || '#E85D88');
    root.style.setProperty('--accent-glow', theme.accentGlow || 'rgba(232, 93, 136, 0.45)');
    root.style.setProperty('--card-bg', theme.cardBg || 'rgba(35, 12, 27, 0.82)');
    root.style.setProperty('--card-border', theme.cardBorder || 'rgba(232, 93, 136, 0.3)');
    root.style.setProperty('--text-primary', theme.textPrimary || '#FFF7F2');
    root.style.setProperty('--text-secondary', theme.textSecondary || '#E7C58D');
    root.style.setProperty('--text-muted', theme.textMuted || '#DCC8F2');
    root.style.setProperty('--gradient-direction', theme.gradientDirection || '135deg');
    root.style.setProperty('--bg-overlay-opacity', theme.bgOverlayOpacity !== undefined ? theme.bgOverlayOpacity : 0.65);

    if (theme.fontHeading) root.style.setProperty('--font-heading', theme.fontHeading);
    if (theme.fontBody) root.style.setProperty('--font-body', theme.fontBody);
    if (theme.fontLetter) root.style.setProperty('--font-letter', theme.fontLetter);

    // Custom background image support
    const backdrop = document.getElementById('romanticBackdrop');
    if (backdrop) {
      if (theme.backgroundImage && theme.backgroundImage.trim().length > 0) {
        backdrop.style.backgroundImage = `url('${window.LoveStoryConfig.sanitizeUrl(theme.backgroundImage)}')`;
      } else {
        backdrop.style.backgroundImage = `linear-gradient(${theme.gradientDirection || '135deg'}, ${theme.bgPrimary || '#190914'} 0%, ${theme.bgSecondary || '#54152E'} 100%)`;
      }
    }
  }

  /**
   * Heart Background Particle Engine
   */
  function initHeartParticles(theme) {
    const container = document.getElementById('heartParticleContainer');
    if (!container) return;

    if (heartInterval) clearInterval(heartInterval);
    container.innerHTML = '';

    const style = theme.heartStyle || 'falling';
    if (style === 'none' || theme.reducedMotion) return;

    const heartSymbols = ['❤️', '💖', '💕', '💗', '✨', '🌸', '💘'];
    const isMobile = window.innerWidth < 640;
    const maxParticles = isMobile ? 18 : 36;
    const intervalMs = isMobile ? 800 : 450;

    heartInterval = setInterval(() => {
      if (document.hidden) return;
      if (container.children.length >= maxParticles) return;

      const heart = document.createElement('div');
      heart.className = 'heart-particle';
      const symbol = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
      heart.textContent = symbol;

      const size = Math.random() * (isMobile ? 18 : 26) + 12; // 12px to 38px
      const left = Math.random() * 100;
      const duration = (Math.random() * 6 + 6); // 6s to 12s
      const delay = Math.random() * 2;
      const opacity = Math.random() * 0.5 + 0.35;

      heart.style.fontSize = `${size}px`;
      heart.style.left = `${left}%`;
      heart.style.opacity = opacity;

      if (style === 'floating') {
        heart.style.bottom = '-40px';
        heart.style.animation = `floatHeart ${duration}s ease-in-out forwards`;
      } else {
        heart.style.top = '-40px';
        heart.style.animation = `fallHeart ${duration}s ease-in-out forwards`;
      }

      container.appendChild(heart);

      setTimeout(() => {
        if (heart.parentNode === container) {
          container.removeChild(heart);
        }
      }, (duration + delay) * 1000);

    }, intervalMs);
  }

  /**
   * Builds the linear journey based on configuration
   */
  function buildScreenSequence() {
    const screens = [];
    const cfg = state.config;

    // 1. Welcome Screen
    if (cfg.welcome && cfg.welcome.enabled !== false) {
      screens.push({ type: 'welcome', id: 'screen_welcome' });
    }

    // 2. Name Entry Screen
    if (cfg.nameEntry && cfg.nameEntry.enabled !== false) {
      screens.push({ type: 'name_entry', id: 'screen_name' });
    }

    // 3. Dynamic Questions
    if (Array.isArray(cfg.questions)) {
      cfg.questions.forEach((q, idx) => {
        if (q.enabled !== false) {
          screens.push({
            type: 'question',
            id: q.id || `q_${idx}`,
            questionData: q,
            questionIndex: idx
          });
        }
      });
    }

    // 4. Love Letter (if position is before proposal)
    if (cfg.loveLetter && cfg.loveLetter.enabled !== false && cfg.loveLetter.position !== 'after_proposal') {
      screens.push({ type: 'love_letter', id: 'screen_love_letter' });
    }

    // 5. Final Proposal Screen
    if (cfg.proposal && cfg.proposal.enabled !== false) {
      screens.push({ type: 'proposal', id: 'screen_proposal' });
    }

    // 6. Love Letter (if position is after proposal)
    if (cfg.loveLetter && cfg.loveLetter.enabled !== false && cfg.loveLetter.position === 'after_proposal') {
      screens.push({ type: 'love_letter', id: 'screen_love_letter' });
    }

    // 7. Celebration Screen
    screens.push({ type: 'celebration', id: 'screen_celebration' });

    state.screens = screens;
  }

  /**
   * Updates Progress Bar
   */
  function updateProgress() {
    const wrap = document.getElementById('journeyProgressWrap');
    if (!wrap) return;

    const currentScreen = state.screens[state.currentScreenIndex];
    // Hide progress on welcome and celebration screens
    if (!currentScreen || currentScreen.type === 'welcome' || currentScreen.type === 'celebration') {
      wrap.style.display = 'none';
      return;
    }

    wrap.style.display = 'flex';
    const total = state.screens.length;
    const current = state.currentScreenIndex + 1;
    const percent = Math.min(100, Math.round((current / total) * 100));

    const fill = document.getElementById('journeyProgressFill');
    const stepLabel = document.getElementById('journeyStepLabel');
    const percentLabel = document.getElementById('journeyPercentLabel');

    if (fill) fill.style.width = `${percent}%`;
    if (stepLabel) stepLabel.textContent = `Chapter ${current} of ${total}`;
    if (percentLabel) percentLabel.textContent = `${percent}%`;
  }

  /**
   * Renders the current active screen
   */
  function renderCurrentScreen() {
    const stage = document.getElementById('screenStage');
    if (!stage) return;

    const screen = state.screens[state.currentScreenIndex];
    if (!screen) return;

    updateProgress();

    // Scroll smoothly to top of stage
    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (screen.type) {
      case 'welcome':
        renderWelcomeScreen(stage);
        break;
      case 'name_entry':
        renderNameEntryScreen(stage);
        break;
      case 'question':
        renderQuestionScreen(stage, screen.questionData);
        break;
      case 'love_letter':
        renderLoveLetterScreen(stage);
        break;
      case 'proposal':
        renderProposalScreen(stage);
        break;
      case 'celebration':
        renderCelebrationScreen(stage);
        break;
      default:
        stage.innerHTML = '<div class="romance-card"><p>Welcome to Our Love Story.</p></div>';
    }
  }

  /**
   * Screen 1: Welcome Screen
   */
  function renderWelcomeScreen(container) {
    const w = state.config.welcome;
    const imgHtml = w.imageUrl ? `
      <div class="romance-image-wrapper">
        <img src="${window.LoveStoryConfig.sanitizeUrl(w.imageUrl)}" alt="Love" class="romance-image" loading="lazy">
      </div>
    ` : '';

    container.innerHTML = `
      <div class="romance-card text-center">
        <div class="romance-badge">${window.LoveStoryConfig.escapeHtml(w.badge || 'A Special Surprise')}</div>
        <h1 class="romance-title">${window.LoveStoryConfig.escapeHtml(w.heading)}</h1>
        <p class="romance-subtitle">${window.LoveStoryConfig.escapeHtml(w.subheading)}</p>
        ${imgHtml}
        ${w.introMessage ? `<p class="romance-subtitle" style="font-style: italic; margin-bottom: 32px;">${window.LoveStoryConfig.escapeHtml(w.introMessage)}</p>` : ''}
        <div class="romance-actions" style="justify-content: center;">
          <button id="btnWelcomeStart" class="btn-primary">
            <span>${window.LoveStoryConfig.escapeHtml(w.buttonText || 'Open My Little Love Story ✨')}</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById('btnWelcomeStart').addEventListener('click', () => {
      goToNextScreen();
    });
  }

  /**
   * Screen 2: Name Entry Screen
   */
  function renderNameEntryScreen(container) {
    const ne = state.config.nameEntry;
    const canGoBack = state.currentScreenIndex > 0;

    container.innerHTML = `
      <div class="romance-card">
        <div class="romance-badge">Personalized For You</div>
        <h2 class="romance-title">${window.LoveStoryConfig.escapeHtml(ne.heading)}</h2>
        <p class="romance-subtitle">${window.LoveStoryConfig.escapeHtml(ne.subheading)}</p>
        
        <div class="romance-input-group">
          <label for="respondentNameInput" class="romance-label">What should I call you?</label>
          <input 
            type="text" 
            id="respondentNameInput" 
            class="romance-input" 
            placeholder="${window.LoveStoryConfig.escapeHtml(ne.placeholder || 'Your beautiful name...')}"
            value="${window.LoveStoryConfig.escapeHtml(state.respondentName)}"
            maxlength="60"
            autocomplete="off"
            autofocus
          >
          <div id="nameValidationMsg" class="input-validation-msg">
            <span>⚠️</span> <span>Please enter your sweet name so I know it's you!</span>
          </div>
        </div>

        <div class="romance-actions">
          ${canGoBack ? `
            <button id="btnNameBack" class="btn-secondary" type="button">
              <span>← Back</span>
            </button>
          ` : '<div></div>'}
          <button id="btnNameNext" class="btn-primary" type="button">
            <span>${window.LoveStoryConfig.escapeHtml(ne.buttonText || "Let's Begin ❤️")}</span>
          </button>
        </div>
      </div>
    `;

    const input = document.getElementById('respondentNameInput');
    const msg = document.getElementById('nameValidationMsg');

    input.addEventListener('input', () => {
      msg.classList.remove('visible');
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        validateAndProceed();
      }
    });

    if (canGoBack) {
      document.getElementById('btnNameBack').addEventListener('click', goToPreviousScreen);
    }

    document.getElementById('btnNameNext').addEventListener('click', validateAndProceed);

    function validateAndProceed() {
      const val = input.value.trim();
      if (ne.required && val.length === 0) {
        msg.classList.add('visible');
        input.focus();
        return;
      }
      state.respondentName = val || state.config.general.defaultGreeting || 'My Love';
      goToNextScreen();
    }
  }

  /**
   * Screen 3: Dynamic Question Screen (Text or Option)
   */
  function renderQuestionScreen(container, question) {
    const qId = question.id;
    const savedAnswer = state.answers[qId] || '';
    const canGoBack = state.currentScreenIndex > 0;
    const personalizedTitle = personalizeText(question.title);
    const personalizedDesc = personalizeText(question.description);

    const imgHtml = question.imageUrl ? `
      <div class="romance-image-wrapper">
        <img src="${window.LoveStoryConfig.sanitizeUrl(question.imageUrl)}" alt="${window.LoveStoryConfig.escapeHtml(question.title)}" class="romance-image" loading="lazy">
      </div>
    ` : '';

    let inputHtml = '';

    if (question.type === 'option') {
      // Option Question
      const options = Array.isArray(question.options) ? question.options : [];
      inputHtml = `
        <div class="romance-options-list" role="radiogroup" aria-label="${window.LoveStoryConfig.escapeHtml(question.title)}">
          ${options.map(opt => {
            const isSelected = savedAnswer === opt.label || savedAnswer === opt.id;
            return `
              <button 
                type="button" 
                class="romance-option-btn ${isSelected ? 'selected' : ''}" 
                data-opt-id="${window.LoveStoryConfig.escapeHtml(opt.id)}"
                data-opt-label="${window.LoveStoryConfig.escapeHtml(opt.label)}"
                role="radio"
                aria-checked="${isSelected}"
              >
                ${opt.emoji ? `<span class="romance-option-emoji">${window.LoveStoryConfig.escapeHtml(opt.emoji)}</span>` : ''}
                <span class="romance-option-text">${window.LoveStoryConfig.escapeHtml(opt.label)}</span>
                <span class="romance-option-check">✓</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    } else {
      // Text Question
      if (question.multiline) {
        inputHtml = `
          <div class="romance-input-group">
            <textarea 
              id="questionTextInput" 
              class="romance-textarea" 
              placeholder="${window.LoveStoryConfig.escapeHtml(question.placeholder || 'Type your answer here...')}"
              maxlength="${question.maxLength || 500}"
            >${window.LoveStoryConfig.escapeHtml(savedAnswer)}</textarea>
            <div id="qValidationMsg" class="input-validation-msg">
              <span>⚠️</span> <span>Please write a few words before continuing!</span>
            </div>
          </div>
        `;
      } else {
        inputHtml = `
          <div class="romance-input-group">
            <input 
              type="text" 
              id="questionTextInput" 
              class="romance-input" 
              placeholder="${window.LoveStoryConfig.escapeHtml(question.placeholder || 'Type your answer here...')}"
              value="${window.LoveStoryConfig.escapeHtml(savedAnswer)}"
              maxlength="${question.maxLength || 200}"
              autocomplete="off"
            >
            <div id="qValidationMsg" class="input-validation-msg">
              <span>⚠️</span> <span>Please share your thoughts with me!</span>
            </div>
          </div>
        `;
      }
    }

    container.innerHTML = `
      <div class="romance-card">
        <div class="romance-badge">${window.LoveStoryConfig.escapeHtml(question.badge || 'Memory & Wonder')}</div>
        <h2 class="romance-title">${window.LoveStoryConfig.escapeHtml(personalizedTitle)}</h2>
        ${personalizedDesc ? `<p class="romance-subtitle">${window.LoveStoryConfig.escapeHtml(personalizedDesc)}</p>` : ''}
        ${imgHtml}
        ${inputHtml}

        <div class="romance-actions">
          ${canGoBack ? `
            <button id="btnQBack" class="btn-secondary" type="button">
              <span>← Back</span>
            </button>
          ` : '<div></div>'}
          <button id="btnQNext" class="btn-primary" type="button">
            <span>Continue ✨</span>
          </button>
        </div>
      </div>
    `;

    // Handle Option Click
    if (question.type === 'option') {
      const optButtons = container.querySelectorAll('.romance-option-btn');
      optButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          optButtons.forEach(b => {
            b.classList.remove('selected');
            b.setAttribute('aria-checked', 'false');
          });
          btn.classList.add('selected');
          btn.setAttribute('aria-checked', 'true');

          const chosenLabel = btn.getAttribute('data-opt-label');
          state.answers[qId] = chosenLabel;

          // Milestone event dispatch
          recordMilestoneEvent('Question Answered', `Answered ${question.title}: ${chosenLabel}`);

          if (question.autoAdvance !== false) {
            setTimeout(() => {
              goToNextScreen();
            }, 320);
          }
        });
      });
    } else {
      // Text Question events
      const textInput = document.getElementById('questionTextInput');
      const valMsg = document.getElementById('qValidationMsg');
      if (textInput && valMsg) {
        textInput.addEventListener('input', () => {
          valMsg.classList.remove('visible');
        });
        if (!question.multiline) {
          textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') validateTextAndProceed();
          });
        }
      }
    }

    if (canGoBack) {
      document.getElementById('btnQBack').addEventListener('click', goToPreviousScreen);
    }

    document.getElementById('btnQNext').addEventListener('click', () => {
      if (question.type === 'option') {
        if (question.required && !state.answers[qId]) {
          alert('Please choose one of the options to continue ❤️');
          return;
        }
        goToNextScreen();
      } else {
        validateTextAndProceed();
      }
    });

    function validateTextAndProceed() {
      const textInput = document.getElementById('questionTextInput');
      const valMsg = document.getElementById('qValidationMsg');
      const val = textInput ? textInput.value.trim() : '';

      if (question.required && (!val || val.length < (question.minLength || 1))) {
        if (valMsg) valMsg.classList.add('visible');
        if (textInput) textInput.focus();
        return;
      }

      state.answers[qId] = val;
      recordMilestoneEvent('Question Answered', `Answered ${question.title}: ${val}`);
      goToNextScreen();
    }
  }

  /**
   * Screen 4: Romantic Love Letter
   */
  function renderLoveLetterScreen(container) {
    const letter = state.config.loveLetter;
    const canGoBack = state.currentScreenIndex > 0;
    state.loveLetterRead = true;

    // Record Milestone
    recordMilestoneEvent('Love Letter Opened', 'Respondent opened the personal love letter');

    const formattedBody = personalizeText(letter.body);
    const greeting = personalizeText(letter.title);

    const imgHtml = letter.imageUrl ? `
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="${window.LoveStoryConfig.sanitizeUrl(letter.imageUrl)}" alt="Love letter" style="max-height: 200px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.15);" loading="lazy">
      </div>
    ` : '';

    container.innerHTML = `
      <div class="romance-card">
        <div class="romance-badge">${window.LoveStoryConfig.escapeHtml(letter.badge || 'Straight From My Heart')}</div>
        
        <div class="love-letter-envelope">
          <div class="letter-header">
            <h2 class="letter-title">${window.LoveStoryConfig.escapeHtml(greeting)}</h2>
            ${letter.date ? `<span class="letter-date">${window.LoveStoryConfig.escapeHtml(letter.date)}</span>` : ''}
          </div>

          ${imgHtml}

          ${letter.opening ? `<div class="letter-opening">${window.LoveStoryConfig.escapeHtml(personalizeText(letter.opening))}</div>` : ''}

          <div class="letter-body">${window.LoveStoryConfig.escapeHtml(formattedBody)}</div>

          ${letter.closing ? `<div class="letter-closing">${window.LoveStoryConfig.escapeHtml(letter.closing)}</div>` : ''}

          ${letter.showSignature !== false && letter.signature ? `
            <div class="letter-signature">${window.LoveStoryConfig.escapeHtml(letter.signature)}</div>
          ` : ''}
        </div>

        <div class="romance-actions">
          ${canGoBack ? `
            <button id="btnLetterBack" class="btn-secondary" type="button">
              <span>← Back</span>
            </button>
          ` : '<div></div>'}
          <button id="btnLetterNext" class="btn-primary" type="button">
            <span>${window.LoveStoryConfig.escapeHtml(letter.buttonText || "Continue to What's Next ✨")}</span>
          </button>
        </div>
      </div>
    `;

    if (canGoBack) {
      document.getElementById('btnLetterBack').addEventListener('click', goToPreviousScreen);
    }
    document.getElementById('btnLetterNext').addEventListener('click', goToNextScreen);
  }

  /**
   * Screen 5: Final Proposal Screen (With Evasive No Button!)
   */
  function renderProposalScreen(container) {
    const p = state.config.proposal;
    const canGoBack = state.currentScreenIndex > 0;
    noButtonAttemptCount = 0;

    const imgHtml = p.imageUrl ? `
      <div class="romance-image-wrapper">
        <img src="${window.LoveStoryConfig.sanitizeUrl(p.imageUrl)}" alt="Proposal" class="romance-image" loading="lazy">
      </div>
    ` : '';

    container.innerHTML = `
      <div class="romance-card text-center proposal-box">
        <div class="romance-badge">${window.LoveStoryConfig.escapeHtml(p.badge || 'One Sacred Question')}</div>
        <h2 class="romance-title" style="font-size: 2.3rem;">${window.LoveStoryConfig.escapeHtml(personalizeText(p.heading))}</h2>
        
        ${imgHtml}

        <div class="proposal-question-text">
          ${window.LoveStoryConfig.escapeHtml(p.question || 'Will you be my forever?')}
        </div>
        
        ${p.subtext ? `<p class="romance-subtitle">${window.LoveStoryConfig.escapeHtml(p.subtext)}</p>` : ''}

        <div class="proposal-arena" id="proposalArena">
          <button id="btnProposalYes" class="btn-proposal-yes" type="button">
            <span>${window.LoveStoryConfig.escapeHtml(p.yesText || 'Yes, Absolutely! 💍❤️')}</span>
          </button>
          
          <button id="btnProposalNo" class="btn-proposal-no" type="button">
            <span>${window.LoveStoryConfig.escapeHtml(p.noText || 'No 🙈')}</span>
          </button>

          <div id="evasiveToast" class="evasive-toast">
            Oops! That button is shy! 😉
          </div>
        </div>

        ${canGoBack ? `
          <div style="margin-top: 36px; text-align: left;">
            <button id="btnProposalBack" class="btn-secondary" type="button">
              <span>← Back to Memories</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    const arena = document.getElementById('proposalArena');
    const noBtn = document.getElementById('btnProposalNo');
    const yesBtn = document.getElementById('btnProposalYes');
    const toast = document.getElementById('evasiveToast');

    if (canGoBack) {
      document.getElementById('btnProposalBack').addEventListener('click', goToPreviousScreen);
    }

    // YES Button Click
    yesBtn.addEventListener('click', onAcceptProposal);

    // Evasive No Button Behaviors (Pointer, Touch, Click)
    setupEvasiveNoButton(noBtn, arena, toast);
  }

  /**
   * Evasive No Button Handler
   */
  function setupEvasiveNoButton(noBtn, arena, toast) {
    const messages = state.config.proposal.noPlayfulMessages || [
      'Are you sure? Try clicking again! 😉',
      'Oops! That button is a bit shy! 🏃‍♂️',
      'Nice try, but your heart says YES! 💖',
      'Almost caught it... but not quite! 🙈',
      'You know the only true answer is YES! ✨'
    ];

    let currentX = 0;
    let currentY = 0;

    function moveAway(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      noButtonAttemptCount++;
      const arenaRect = arena.getBoundingClientRect();
      const btnRect = noBtn.getBoundingClientRect();

      // Calculate maximum bounds relative to current position
      const maxX = Math.min(180, Math.max(80, (arenaRect.width - btnRect.width) / 2));
      const maxY = 65;

      // Random displacement that is significantly far from current
      let newX = (Math.random() - 0.5) * 2 * maxX;
      let newY = (Math.random() - 0.5) * 2 * maxY;

      // Prevent jumping to exact same spot
      if (Math.abs(newX - currentX) < 40) {
        newX = newX > 0 ? newX + 50 : newX - 50;
      }

      currentX = newX;
      currentY = newY;

      noBtn.style.transform = `translate(${newX}px, ${newY}px)`;

      // Show playful message
      const msg = messages[(noButtonAttemptCount - 1) % messages.length];
      if (toast) {
        toast.textContent = msg;
        toast.classList.add('active');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
          toast.classList.remove('active');
        }, 2200);
      }
    }

    // Pointer approach (desktop hover)
    noBtn.addEventListener('mouseenter', moveAway);
    noBtn.addEventListener('mouseover', moveAway);
    
    // Touch interactions (mobile phone tap avoidance)
    noBtn.addEventListener('touchstart', moveAway, { passive: false });
    noBtn.addEventListener('click', moveAway);

    // Keyboard accessibility fallback (Enter / Spacebar)
    noBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        moveAway();
        // Gently suggest focus to Yes button
        const yesBtn = document.getElementById('btnProposalYes');
        if (yesBtn) yesBtn.focus();
      }
    });
  }

  /**
   * Proposal Accepted Handler
   */
  async function onAcceptProposal() {
    if (state.proposalAccepted) return; // Prevent double submission
    state.proposalAccepted = true;

    const yesBtn = document.getElementById('btnProposalYes');
    if (yesBtn) {
      yesBtn.disabled = true;
      yesBtn.innerHTML = '<span>💖 Accepted! Forever & Always! 💍</span>';
    }

    // Trigger Canvas Confetti and Hearts Burst
    launchCelebrationConfetti();

    // Record Milestone Event
    recordMilestoneEvent('Proposal Accepted', 'SHE SAID YES! Best day ever!');

    // Submit Complete Proposal Data to Google Sheets
    submitProposalDataToSheets();

    // Transition to celebration screen smoothly
    setTimeout(() => {
      // If the very next screen is love_letter (when position is after_proposal), go there
      const nextScreen = state.screens[state.currentScreenIndex + 1];
      if (nextScreen && nextScreen.type === 'love_letter') {
        state.currentScreenIndex++;
        renderCurrentScreen();
      } else {
        const celebIdx = state.screens.findIndex(s => s.type === 'celebration');
        if (celebIdx !== -1) {
          state.currentScreenIndex = celebIdx;
          renderCurrentScreen();
        }
      }
    }, 1200);
  }

  /**
   * Screen 6: Celebration Screen
   */
  function renderCelebrationScreen(container) {
    const c = state.config.celebration;
    const soc = state.config.social;

    const whatsappLink = soc && soc.whatsapp && soc.whatsapp.enabled ? 
      window.LoveStoryConfig.buildWhatsAppLink(soc.whatsapp.countryCode, soc.whatsapp.phoneNumber, soc.whatsapp.prefilledMessage) : '';

    const instagramLink = soc && soc.instagram && soc.instagram.enabled ? 
      window.LoveStoryConfig.buildInstagramLink(soc.instagram.usernameOrUrl) : '';

    const imgHtml = c.imageUrl ? `
      <div class="romance-image-wrapper">
        <img src="${window.LoveStoryConfig.sanitizeUrl(c.imageUrl)}" alt="Celebration" class="romance-image" loading="lazy">
      </div>
    ` : '';

    container.innerHTML = `
      <div class="romance-card celebration-box">
        <div class="celebration-ring">💍</div>
        <h1 class="celebration-title">${window.LoveStoryConfig.escapeHtml(c.heading || 'SHE SAID YES! ❤️')}</h1>
        <p class="romance-subtitle" style="font-size: 1.25rem; color: var(--text-secondary); font-weight: 600;">
          ${window.LoveStoryConfig.escapeHtml(c.subheading || 'Best day of our lives!')}
        </p>
        
        ${imgHtml}

        <p class="celebration-message">
          ${window.LoveStoryConfig.escapeHtml(c.message || 'Some moments are too sacred for words. I promise to love and cherish you every single day.')}
        </p>

        ${(whatsappLink || instagramLink) ? `
          <div class="social-buttons-wrap">
            ${whatsappLink ? `
              <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="btn-social btn-social-whatsapp">
                <span>💬</span> <span>${window.LoveStoryConfig.escapeHtml(soc.whatsapp.buttonLabel || 'Share the Good News on WhatsApp')}</span>
              </a>
            ` : ''}
            ${instagramLink ? `
              <a href="${instagramLink}" target="_blank" rel="noopener noreferrer" class="btn-social btn-social-instagram">
                <span>📸</span> <span>${window.LoveStoryConfig.escapeHtml(soc.instagram.buttonLabel || 'Share on Instagram')}</span>
              </a>
            ` : ''}
          </div>
        ` : ''}

        <div style="margin-top: 32px; display: flex; flex-direction: column; gap: 12px; align-items: center;">
          ${c.showLoveLetterBtn && state.config.loveLetter && state.config.loveLetter.enabled !== false ? `
            <button id="btnReadLoveLetterAgain" class="btn-secondary" type="button" style="width: 100%; max-width: 320px;">
              <span>💌 Read Love Letter Again</span>
            </button>
          ` : ''}
          ${state.config.general.enableRestart !== false ? `
            <button id="btnRestartJourney" class="btn-secondary" type="button" style="width: 100%; max-width: 320px; font-size: 0.85rem;">
              <span>🔄 Experience Our Story Again</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    // Re-read love letter
    const readLetterBtn = document.getElementById('btnReadLoveLetterAgain');
    if (readLetterBtn) {
      readLetterBtn.addEventListener('click', () => {
        const letterIdx = state.screens.findIndex(s => s.type === 'love_letter');
        if (letterIdx !== -1) {
          state.currentScreenIndex = letterIdx;
          renderCurrentScreen();
        }
      });
    }

    // Restart journey
    const restartBtn = document.getElementById('btnRestartJourney');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        state.currentScreenIndex = 0;
        state.proposalAccepted = false;
        renderCurrentScreen();
      });
    }

    // Fire additional sparkle confetti
    launchCelebrationConfetti();
  }

  /**
   * Navigation Helpers
   */
  function goToNextScreen() {
    if (state.currentScreenIndex < state.screens.length - 1) {
      state.currentScreenIndex++;
      renderCurrentScreen();
    }
  }

  function goToPreviousScreen() {
    if (state.currentScreenIndex > 0) {
      state.currentScreenIndex--;
      renderCurrentScreen();
    }
  }

  /**
   * Helper to substitute {{name}} or [name] in user text
   */
  function personalizeText(text) {
    if (!text) return '';
    const name = state.respondentName || state.config.general.defaultGreeting || 'My Love';
    return text
      .replace(/\{\{name\}\}/gi, name)
      .replace(/\[name\]/gi, name)
      .replace(/\{name\}/gi, name);
  }

  /**
   * Milestone event logger
   */
  function recordMilestoneEvent(eventType, details) {
    if (!state.config || !state.config.integrations || !state.config.integrations.sendEvents) return;
    const endpoint = state.config.integrations.googleAppsScriptUrl;
    if (!endpoint || !endpoint.startsWith('http')) return;

    const payload = {
      sessionId: state.sessionId,
      respondentName: state.respondentName || 'Anonymous',
      eventType: eventType,
      proposalStatus: state.proposalAccepted ? 'Accepted (YES!)' : 'In Progress',
      details: details,
      timestamp: new Date().toISOString()
    };

    window.LoveStoryConfig.submitToGoogleAppsScript(endpoint, payload);
  }

  /**
   * Submits all captured answers and acceptance data to Google Sheets
   */
  async function submitProposalDataToSheets() {
    if (state.isSubmitting) return;
    state.isSubmitting = true;

    const endpoint = state.config.integrations ? state.config.integrations.googleAppsScriptUrl : '';
    if (!endpoint || !endpoint.startsWith('http')) {
      console.log('Google Sheets endpoint is unconfigured. Answers preserved in local session.');
      state.isSubmitting = false;
      return;
    }

    // Form array of responses
    const formattedResponses = [];
    const questions = state.config.questions || [];

    questions.forEach(q => {
      const ans = state.answers[q.id];
      if (ans !== undefined && ans !== '') {
        formattedResponses.push({
          questionId: q.id,
          questionText: q.title,
          questionType: q.type,
          answer: ans
        });
      }
    });

    const payload = {
      sessionId: state.sessionId,
      respondentName: state.respondentName || 'My Love',
      proposalStatus: 'Accepted (YES!)',
      accepted: true,
      responses: formattedResponses,
      eventType: 'Proposal Accepted',
      details: `Completed romantic journey with ${formattedResponses.length} answers submitted.`
    };

    const result = await window.LoveStoryConfig.submitToGoogleAppsScript(endpoint, payload);
    state.isSubmitting = false;
    state.submissionAttempted = true;
    console.log('Submission result:', result);
  }

  /**
   * High-Performance Canvas Confetti & Heart Sparkle Engine
   */
  function launchCelebrationConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#FF4081', '#E85D88', '#FFD6E3', '#E7C58D', '#FFF7F2', '#DCC8F2', '#FF85A1'];
    const totalCount = window.innerWidth < 640 ? 70 : 130;

    for (let i = 0; i < totalCount; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 100,
        y: canvas.height * 0.5,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() * -18) - 6,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        isHeart: Math.random() > 0.45,
        gravity: 0.38,
        opacity: 1
      });
    }

    let animationFrame;
    const startTime = Date.now();

    function renderConfetti() {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let aliveCount = 0;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.rotation += p.rotSpeed;

        if (p.y > canvas.height * 0.7) {
          p.opacity -= 0.015;
        }

        if (p.opacity > 0 && p.y < canvas.height + 50) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);

          if (p.isHeart) {
            ctx.fillStyle = p.color;
            ctx.font = `${p.size * 2}px sans-serif`;
            ctx.fillText('❤️', -p.size, p.size);
          } else {
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
          }

          ctx.restore();
        }
      });

      if (aliveCount > 0 && elapsed < 8000) {
        animationFrame = requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }

    renderConfetti();
  }

})();
