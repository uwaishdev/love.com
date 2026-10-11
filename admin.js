/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Our Love Story — Admin Control Center Engine
 * Manages question operations, live previews, persistence, image processing,
 * theme customization, and Google Sheets integration tests.
 */

(function () {
  'use strict';

  let config = null;
  let isDirty = false;
  let editingQuestionId = null;

  // Preset Color Palettes
  const THEME_PRESETS = {
    burgundy_rose: {
      bgPrimary: "#190914",
      bgSecondary: "#54152E",
      accentColor: "#E85D88",
      accentGlow: "rgba(232, 93, 136, 0.45)",
      cardBg: "rgba(35, 12, 27, 0.82)",
      cardBorder: "rgba(232, 93, 136, 0.3)",
      textPrimary: "#FFF7F2",
      textSecondary: "#E7C58D",
      textMuted: "#DCC8F2"
    },
    midnight_starlight: {
      bgPrimary: "#0B1021",
      bgSecondary: "#1E2A4A",
      accentColor: "#E0B0FF",
      accentGlow: "rgba(224, 176, 255, 0.45)",
      cardBg: "rgba(15, 23, 42, 0.85)",
      cardBorder: "rgba(224, 176, 255, 0.3)",
      textPrimary: "#F8FAFC",
      textSecondary: "#FDE047",
      textMuted: "#CBD5E1"
    },
    vintage_champagne: {
      bgPrimary: "#28171F",
      bgSecondary: "#4D2C3D",
      accentColor: "#E7C58D",
      accentGlow: "rgba(231, 197, 141, 0.45)",
      cardBg: "rgba(40, 23, 31, 0.85)",
      cardBorder: "rgba(231, 197, 141, 0.3)",
      textPrimary: "#FFFBF7",
      textSecondary: "#E7C58D",
      textMuted: "#E4D1C3"
    },
    lavender_dream: {
      bgPrimary: "#181024",
      bgSecondary: "#382352",
      accentColor: "#D884F7",
      accentGlow: "rgba(216, 132, 247, 0.45)",
      cardBg: "rgba(30, 20, 46, 0.85)",
      cardBorder: "rgba(216, 132, 247, 0.3)",
      textPrimary: "#FDFCFF",
      textSecondary: "#F5C77E",
      textMuted: "#DDD3EE"
    }
  };

  // Romantic Font Pairing Presets
  const FONT_PAIRING_PRESETS = {
    classic_romance: {
      heading: "'Great Vibes', cursive",
      body: "'Poppins', sans-serif",
      letter: "'Cormorant Garamond', serif"
    },
    sweet_calligraphy: {
      heading: "'Dancing Script', cursive",
      body: "'Quicksand', sans-serif",
      letter: "'Caveat', cursive"
    },
    french_elegance: {
      heading: "'Parisienne', cursive",
      body: "'Montserrat', sans-serif",
      letter: "'Marck Script', cursive"
    },
    luxury_editorial: {
      heading: "'Playfair Display', serif",
      body: "'Poppins', sans-serif",
      letter: "'Cormorant Garamond', serif"
    },
    fairytale_brush: {
      heading: "'Alex Brush', cursive",
      body: "'Nunito', sans-serif",
      letter: "'Bad Script', cursive"
    },
    regal_timeless: {
      heading: "'Cinzel', serif",
      body: "'Inter', sans-serif",
      letter: "'Cormorant Garamond', serif"
    }
  };

  document.addEventListener('DOMContentLoaded', initAdmin);

  function initAdmin() {
    config = window.LoveStoryConfig ? window.LoveStoryConfig.loadAppConfig() : null;
    if (!config) {
      alert('Could not initialize configuration engine.');
      return;
    }

    // Apply active theme variables to body
    applyActiveThemeToAdmin(config.theme);

    // Setup navigation
    setupSidebarNavigation();

    // Populate all form fields from config
    populateAllFormFields();

    // Setup events
    setupFormChangeListeners();
    setupQuestionManager();
    setupImageHandlers();
    setupGoogleSheetsTester();
    setupBackupHandlers();
    setupLivePreviewModal();

    // Warn on unsaved changes before page unload
    window.addEventListener('beforeunload', (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    updateOverviewStats();
  }

  function applyActiveThemeToAdmin(theme) {
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', theme.bgPrimary || '#190914');
    root.style.setProperty('--bg-secondary', theme.bgSecondary || '#54152E');
    root.style.setProperty('--accent-color', theme.accentColor || '#E85D88');
    root.style.setProperty('--text-secondary', theme.textSecondary || '#E7C58D');
    if (theme.fontHeading) root.style.setProperty('--font-heading', theme.fontHeading);
    if (theme.fontBody) root.style.setProperty('--font-body', theme.fontBody);
    if (theme.fontLetter) root.style.setProperty('--font-letter', theme.fontLetter);
  }

  function updateLiveFontPreview(headingFont, bodyFont, letterFont) {
    const headingEl = document.getElementById('fontPreviewHeading');
    const bodyEl = document.getElementById('fontPreviewBody');
    const letterEl = document.getElementById('fontPreviewLetter');
    const sigEl = document.getElementById('fontPreviewSignature');

    if (headingEl && headingFont) headingEl.style.fontFamily = headingFont;
    if (bodyEl && bodyFont) bodyEl.style.fontFamily = bodyFont;
    if (letterEl && letterFont) letterEl.style.fontFamily = letterFont;
    if (sigEl && headingFont) sigEl.style.fontFamily = headingFont;
  }

  /**
   * Navigation Tabs & Mobile Drawer
   */
  function setupSidebarNavigation() {
    const navItems = document.querySelectorAll('.admin-nav-item');
    const tabPanes = document.querySelectorAll('.admin-tab-pane');
    const viewTitle = document.getElementById('viewTitle');
    const sidebar = document.getElementById('adminSidebar');
    const mobileToggle = document.getElementById('mobileNavToggleBtn');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = item.getAttribute('data-tab');
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        tabPanes.forEach(pane => {
          pane.style.display = pane.id === targetTab ? 'block' : 'none';
        });

        const titleText = item.querySelector('span:last-child').textContent;
        if (viewTitle) viewTitle.textContent = titleText;

        if (sidebar && window.innerWidth < 900) {
          sidebar.classList.remove('open');
        }

        if (targetTab === 'tab-overview') {
          updateOverviewStats();
        }
      });
    });

    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        if (sidebar) sidebar.classList.toggle('open');
      });
    }
  }

  /**
   * Sets up dirty state and auto-tracking
   */
  function markDirty() {
    isDirty = true;
    const indicator = document.getElementById('saveIndicator');
    const msg = document.getElementById('saveStatusMsg');
    if (indicator) indicator.classList.add('dirty');
    if (msg) msg.textContent = 'Unsaved changes pending... Click Save to apply.';
  }

  function markSaved() {
    isDirty = false;
    const indicator = document.getElementById('saveIndicator');
    const msg = document.getElementById('saveStatusMsg');
    if (indicator) indicator.classList.remove('dirty');
    if (msg) msg.textContent = 'All changes saved to browser storage.';
  }

  /**
   * Populates form inputs with current loaded config
   */
  function populateAllFormFields() {
    // Welcome
    setCheckbox('welcomeEnabled', config.welcome.enabled !== false);
    setValue('welcomeBadge', config.welcome.badge);
    setValue('welcomeHeading', config.welcome.heading);
    setValue('welcomeSubheading', config.welcome.subheading);
    setValue('welcomeIntro', config.welcome.introMessage);
    setValue('welcomeBtnText', config.welcome.buttonText);
    setValue('welcomeImageUrl', config.welcome.imageUrl);

    // Name Entry
    setCheckbox('nameEnabled', config.nameEntry.enabled !== false);
    setCheckbox('nameRequired', config.nameEntry.required !== false);
    setValue('nameHeading', config.nameEntry.heading);
    setValue('nameSubheading', config.nameEntry.subheading);
    setValue('namePlaceholder', config.nameEntry.placeholder);
    setValue('nameDefaultGreeting', config.general.defaultGreeting);

    // Love Letter
    setCheckbox('letterEnabled', config.loveLetter.enabled !== false);
    setValue('letterPosition', config.loveLetter.position || 'before_proposal');
    setValue('letterTitle', config.loveLetter.title);
    setValue('letterDate', config.loveLetter.date);
    setValue('letterOpening', config.loveLetter.opening);
    setValue('letterBody', config.loveLetter.body);
    setValue('letterClosing', config.loveLetter.closing);
    setValue('letterSignature', config.loveLetter.signature);
    setValue('letterImageUrl', config.loveLetter.imageUrl);

    // Proposal
    setCheckbox('proposalEnabled', config.proposal.enabled !== false);
    setValue('proposalHeading', config.proposal.heading);
    setValue('proposalQuestion', config.proposal.question);
    setValue('proposalSubtext', config.proposal.subtext);
    setValue('proposalYesText', config.proposal.yesText);
    setValue('proposalNoText', config.proposal.noText);
    setValue('proposalNoMessages', (config.proposal.noPlayfulMessages || []).join('\n'));

    // Celebration
    setValue('celebHeading', config.celebration.heading);
    setValue('celebSubheading', config.celebration.subheading);
    setValue('celebMessage', config.celebration.message);
    setValue('celebEffect', config.celebration.effect || 'confetti_and_hearts');
    setCheckbox('celebShowLetterBtn', config.celebration.showLoveLetterBtn !== false);

    // Theme
    setValue('themePresetSelect', config.theme.preset || 'burgundy_rose');
    setValue('themeBgPrimary', config.theme.bgPrimary);
    setValue('themeBgSecondary', config.theme.bgSecondary);
    setValue('themeAccent', config.theme.accentColor);
    setValue('themeHeartStyle', config.theme.heartStyle || 'falling');
    setValue('themeBgImage', config.theme.backgroundImage);

    // Fonts
    const currentHeadingFont = config.theme.fontHeading || "'Great Vibes', cursive";
    const currentBodyFont = config.theme.fontBody || "'Poppins', sans-serif";
    const currentLetterFont = config.theme.fontLetter || "'Cormorant Garamond', serif";
    setValue('fontHeadingSelect', currentHeadingFont);
    setValue('fontBodySelect', currentBodyFont);
    setValue('fontLetterSelect', currentLetterFont);

    let matchingPreset = 'custom';
    for (const [key, preset] of Object.entries(FONT_PAIRING_PRESETS)) {
      if (preset.heading === currentHeadingFont && preset.body === currentBodyFont && preset.letter === currentLetterFont) {
        matchingPreset = key;
        break;
      }
    }
    setValue('fontPresetSelect', matchingPreset);

    updateLiveFontPreview(currentHeadingFont, currentBodyFont, currentLetterFont);

    // Photos
    setValue('couplePhotoUrl', config.images.couplePhoto);
    updateImagePreview('couplePhotoPreview', config.images.couplePhoto);

    // Social
    setCheckbox('whatsappEnabled', config.social.whatsapp.enabled !== false);
    setValue('waCountryCode', config.social.whatsapp.countryCode);
    setValue('waPhone', config.social.whatsapp.phoneNumber);
    setValue('waMessage', config.social.whatsapp.prefilledMessage);

    setCheckbox('igEnabled', config.social.instagram.enabled !== false);
    setValue('igHandle', config.social.instagram.usernameOrUrl);

    // Google Sheets
    setValue('sheetsEndpointUrl', config.integrations.googleAppsScriptUrl);
    updateSheetsStatusBadge(config.integrations.googleAppsScriptUrl);

    // Question list
    renderQuestionList();
  }

  function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? val : '';
  }

  function setCheckbox(id, val) {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
  }

  /**
   * Listen for form changes to update config object
   */
  function setupFormChangeListeners() {
    const inputs = document.querySelectorAll('.admin-input, .admin-textarea, .admin-select, input[type="checkbox"]');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        syncFormToDraftConfig();
        markDirty();
      });
      input.addEventListener('change', () => {
        syncFormToDraftConfig();
        markDirty();
      });
    });

    // Theme Preset Selector handler
    const presetSelect = document.getElementById('themePresetSelect');
    if (presetSelect) {
      presetSelect.addEventListener('change', () => {
        const presetKey = presetSelect.value;
        if (THEME_PRESETS[presetKey]) {
          const p = THEME_PRESETS[presetKey];
          config.theme.preset = presetKey;
          config.theme.bgPrimary = p.bgPrimary;
          config.theme.bgSecondary = p.bgSecondary;
          config.theme.accentColor = p.accentColor;
          config.theme.accentGlow = p.accentGlow;
          config.theme.cardBg = p.cardBg;
          config.theme.cardBorder = p.cardBorder;
          config.theme.textPrimary = p.textPrimary;
          config.theme.textSecondary = p.textSecondary;
          config.theme.textMuted = p.textMuted;

          setValue('themeBgPrimary', p.bgPrimary);
          setValue('themeBgSecondary', p.bgSecondary);
          setValue('themeAccent', p.accentColor);

          applyActiveThemeToAdmin(config.theme);
          markDirty();
        }
      });
    }

    // Font Preset and Individual Font Selectors
    const fontPresetSelect = document.getElementById('fontPresetSelect');
    const fontHeadingSelect = document.getElementById('fontHeadingSelect');
    const fontBodySelect = document.getElementById('fontBodySelect');
    const fontLetterSelect = document.getElementById('fontLetterSelect');

    if (fontPresetSelect) {
      fontPresetSelect.addEventListener('change', () => {
        const key = fontPresetSelect.value;
        if (FONT_PAIRING_PRESETS[key]) {
          const combo = FONT_PAIRING_PRESETS[key];
          if (fontHeadingSelect) fontHeadingSelect.value = combo.heading;
          if (fontBodySelect) fontBodySelect.value = combo.body;
          if (fontLetterSelect) fontLetterSelect.value = combo.letter;

          config.theme.fontHeading = combo.heading;
          config.theme.fontBody = combo.body;
          config.theme.fontLetter = combo.letter;

          applyActiveThemeToAdmin(config.theme);
          updateLiveFontPreview(combo.heading, combo.body, combo.letter);
          markDirty();
        }
      });
    }

    [fontHeadingSelect, fontBodySelect, fontLetterSelect].forEach(selectElem => {
      if (selectElem) {
        selectElem.addEventListener('change', () => {
          if (fontPresetSelect) fontPresetSelect.value = 'custom';
          config.theme.fontHeading = fontHeadingSelect ? fontHeadingSelect.value : config.theme.fontHeading;
          config.theme.fontBody = fontBodySelect ? fontBodySelect.value : config.theme.fontBody;
          config.theme.fontLetter = fontLetterSelect ? fontLetterSelect.value : config.theme.fontLetter;

          applyActiveThemeToAdmin(config.theme);
          updateLiveFontPreview(config.theme.fontHeading, config.theme.fontBody, config.theme.fontLetter);
          markDirty();
        });
      }
    });

    // Save Buttons
    const saveBtns = [document.getElementById('btnQuickSave'), document.getElementById('btnBarSave')];
    saveBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', saveAllConfig);
      }
    });
  }

  /**
   * Reads form inputs into the draft config object
   */
  function syncFormToDraftConfig() {
    // Welcome
    config.welcome.enabled = document.getElementById('welcomeEnabled').checked;
    config.welcome.badge = document.getElementById('welcomeBadge').value.trim();
    config.welcome.heading = document.getElementById('welcomeHeading').value.trim();
    config.welcome.subheading = document.getElementById('welcomeSubheading').value.trim();
    config.welcome.introMessage = document.getElementById('welcomeIntro').value.trim();
    config.welcome.buttonText = document.getElementById('welcomeBtnText').value.trim();
    config.welcome.imageUrl = document.getElementById('welcomeImageUrl').value.trim();

    // Name Entry
    config.nameEntry.enabled = document.getElementById('nameEnabled').checked;
    config.nameEntry.required = document.getElementById('nameRequired').checked;
    config.nameEntry.heading = document.getElementById('nameHeading').value.trim();
    config.nameEntry.subheading = document.getElementById('nameSubheading').value.trim();
    config.nameEntry.placeholder = document.getElementById('namePlaceholder').value.trim();
    config.general.defaultGreeting = document.getElementById('nameDefaultGreeting').value.trim() || 'My Love';

    // Love Letter
    config.loveLetter.enabled = document.getElementById('letterEnabled').checked;
    config.loveLetter.position = document.getElementById('letterPosition').value;
    config.loveLetter.title = document.getElementById('letterTitle').value.trim();
    config.loveLetter.date = document.getElementById('letterDate').value.trim();
    config.loveLetter.opening = document.getElementById('letterOpening').value.trim();
    config.loveLetter.body = document.getElementById('letterBody').value;
    config.loveLetter.closing = document.getElementById('letterClosing').value.trim();
    config.loveLetter.signature = document.getElementById('letterSignature').value.trim();
    config.loveLetter.imageUrl = document.getElementById('letterImageUrl').value.trim();

    // Proposal
    config.proposal.enabled = document.getElementById('proposalEnabled').checked;
    config.proposal.heading = document.getElementById('proposalHeading').value.trim();
    config.proposal.question = document.getElementById('proposalQuestion').value.trim();
    config.proposal.subtext = document.getElementById('proposalSubtext').value.trim();
    config.proposal.yesText = document.getElementById('proposalYesText').value.trim();
    config.proposal.noText = document.getElementById('proposalNoText').value.trim();
    const rawNoMsgs = document.getElementById('proposalNoMessages').value.split('\n').map(s => s.trim()).filter(Boolean);
    if (rawNoMsgs.length > 0) config.proposal.noPlayfulMessages = rawNoMsgs;

    // Celebration
    config.celebration.heading = document.getElementById('celebHeading').value.trim();
    config.celebration.subheading = document.getElementById('celebSubheading').value.trim();
    config.celebration.message = document.getElementById('celebMessage').value.trim();
    config.celebration.effect = document.getElementById('celebEffect').value;
    config.celebration.showLoveLetterBtn = document.getElementById('celebShowLetterBtn').checked;

    // Theme
    config.theme.bgPrimary = document.getElementById('themeBgPrimary').value;
    config.theme.bgSecondary = document.getElementById('themeBgSecondary').value;
    config.theme.accentColor = document.getElementById('themeAccent').value;
    config.theme.heartStyle = document.getElementById('themeHeartStyle').value;
    config.theme.backgroundImage = document.getElementById('themeBgImage').value.trim();

    // Fonts
    if (document.getElementById('fontHeadingSelect')) {
      config.theme.fontHeading = document.getElementById('fontHeadingSelect').value;
    }
    if (document.getElementById('fontBodySelect')) {
      config.theme.fontBody = document.getElementById('fontBodySelect').value;
    }
    if (document.getElementById('fontLetterSelect')) {
      config.theme.fontLetter = document.getElementById('fontLetterSelect').value;
    }

    // Photos
    config.images.couplePhoto = document.getElementById('couplePhotoUrl').value.trim();

    // Social
    config.social.whatsapp.enabled = document.getElementById('whatsappEnabled').checked;
    config.social.whatsapp.countryCode = document.getElementById('waCountryCode').value.trim();
    config.social.whatsapp.phoneNumber = document.getElementById('waPhone').value.trim();
    config.social.whatsapp.prefilledMessage = document.getElementById('waMessage').value.trim();

    config.social.instagram.enabled = document.getElementById('igEnabled').checked;
    config.social.instagram.usernameOrUrl = document.getElementById('igHandle').value.trim();

    // Integrations
    config.integrations.googleAppsScriptUrl = document.getElementById('sheetsEndpointUrl').value.trim();
  }

  /**
   * Saves all configuration to localStorage
   */
  function saveAllConfig() {
    syncFormToDraftConfig();
    const res = window.LoveStoryConfig.saveAppConfig(config);
    if (res.success) {
      markSaved();
      showToast('Settings saved successfully! ❤️', 'success');
      updateOverviewStats();
    } else {
      showToast(res.error || 'Failed to save settings.', 'error');
    }
  }

  /**
   * Question Manager Functions
   */
  function setupQuestionManager() {
    const btnAdd = document.getElementById('btnAddNewQuestion');
    const modalBackdrop = document.getElementById('questionModalBackdrop');
    const btnClose = document.getElementById('btnModalClose');
    const btnCancel = document.getElementById('btnModalCancel');
    const questionForm = document.getElementById('questionForm');
    const questionTypeSelect = document.getElementById('modalQuestionType');
    const btnAddOption = document.getElementById('btnAddOptionRow');

    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        openQuestionModal(null);
      });
    }

    if (btnClose) btnClose.addEventListener('click', closeQuestionModal);
    if (btnCancel) btnCancel.addEventListener('click', closeQuestionModal);

    if (questionTypeSelect) {
      questionTypeSelect.addEventListener('change', () => {
        toggleModalQuestionTypeFields(questionTypeSelect.value);
      });
    }

    if (btnAddOption) {
      btnAddOption.addEventListener('click', () => {
        addOptionRowToModal('', '✨');
      });
    }

    if (questionForm) {
      questionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveQuestionFromModal();
      });
    }
  }

  function renderQuestionList() {
    const container = document.getElementById('questionsListContainer');
    if (!container) return;

    if (!Array.isArray(config.questions) || config.questions.length === 0) {
      container.innerHTML = `
        <div class="admin-card text-center" style="padding: 30px;">
          <p style="color: var(--text-muted);">No questions configured yet. Click "Add New Question" above!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = config.questions.map((q, idx) => {
      const typeLabel = q.type === 'option' ? 'Multiple Choice' : (q.multiline ? 'Paragraph Text' : 'Short Text');
      const enabledBadge = q.enabled !== false ? 
        '<span style="color: #10B981; font-weight: 500;">● Active</span>' : 
        '<span style="color: #6B7280; font-weight: 500;">○ Disabled</span>';

      return `
        <div class="question-item-card" data-qid="${window.LoveStoryConfig.escapeHtml(q.id)}">
          <div class="question-item-info">
            <div class="question-item-title">
              <span style="color: var(--text-secondary); margin-right: 6px;">#${idx + 1}</span>
              ${window.LoveStoryConfig.escapeHtml(q.title)}
            </div>
            <div class="question-item-meta">
              <span>Type: <strong>${typeLabel}</strong></span>
              <span>•</span>
              <span>${enabledBadge}</span>
              <span>•</span>
              <span>${q.required ? 'Required' : 'Optional'}</span>
            </div>
          </div>
          <div class="question-item-controls">
            <button type="button" class="admin-icon-btn btn-q-up" title="Move Up" ${idx === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="admin-icon-btn btn-q-down" title="Move Down" ${idx === config.questions.length - 1 ? 'disabled' : ''}>↓</button>
            <button type="button" class="admin-icon-btn btn-q-edit" title="Edit Question">✏️ Edit</button>
            <button type="button" class="admin-icon-btn btn-q-dup" title="Duplicate Question">📋</button>
            <button type="button" class="admin-icon-btn danger btn-q-delete" title="Delete Question">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    // Attach row events
    container.querySelectorAll('.question-item-card').forEach((card, idx) => {
      const qid = card.getAttribute('data-qid');

      card.querySelector('.btn-q-up').addEventListener('click', () => moveQuestion(idx, -1));
      card.querySelector('.btn-q-down').addEventListener('click', () => moveQuestion(idx, 1));
      card.querySelector('.btn-q-edit').addEventListener('click', () => openQuestionModal(qid));
      card.querySelector('.btn-q-dup').addEventListener('click', () => duplicateQuestion(qid));
      card.querySelector('.btn-q-delete').addEventListener('click', () => deleteQuestion(qid));
    });
  }

  function moveQuestion(index, direction) {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= config.questions.length) return;
    const temp = config.questions[index];
    config.questions[index] = config.questions[newIdx];
    config.questions[newIdx] = temp;
    renderQuestionList();
    markDirty();
  }

  function duplicateQuestion(qid) {
    const orig = config.questions.find(q => q.id === qid);
    if (!orig) return;
    const copy = JSON.parse(JSON.stringify(orig));
    copy.id = 'q_' + Date.now();
    copy.title = copy.title + ' (Copy)';
    config.questions.push(copy);
    renderQuestionList();
    markDirty();
    showToast('Question duplicated.', 'info');
  }

  function deleteQuestion(qid) {
    const q = config.questions.find(item => item.id === qid);
    if (!q) return;
    if (confirm(`Are you sure you want to delete "${q.title}"?`)) {
      config.questions = config.questions.filter(item => item.id !== qid);
      renderQuestionList();
      markDirty();
      showToast('Question deleted.', 'info');
    }
  }

  function openQuestionModal(qid) {
    editingQuestionId = qid;
    const modalBackdrop = document.getElementById('questionModalBackdrop');
    const modalTitle = document.getElementById('questionModalTitle');
    const typeSelect = document.getElementById('modalQuestionType');
    const optionsContainer = document.getElementById('modalOptionsContainer');

    optionsContainer.innerHTML = '';

    if (qid) {
      const q = config.questions.find(item => item.id === qid);
      if (!q) return;
      modalTitle.textContent = 'Edit Question';
      typeSelect.value = q.type || 'text';
      document.getElementById('modalQuestionTitle').value = q.title || '';
      document.getElementById('modalQuestionDesc').value = q.description || '';
      document.getElementById('modalQuestionBadge').value = q.badge || '';
      document.getElementById('modalQuestionEnabled').checked = q.enabled !== false;
      document.getElementById('modalQuestionRequired').checked = q.required !== false;
      document.getElementById('modalQuestionMultiline').checked = !!q.multiline;
      document.getElementById('modalQuestionPlaceholder').value = q.placeholder || '';
      document.getElementById('modalQuestionAutoAdvance').checked = q.autoAdvance !== false;

      if (q.type === 'option' && Array.isArray(q.options)) {
        q.options.forEach(opt => addOptionRowToModal(opt.label, opt.emoji));
      }
    } else {
      modalTitle.textContent = 'Add New Question';
      typeSelect.value = 'text';
      document.getElementById('modalQuestionTitle').value = '';
      document.getElementById('modalQuestionDesc').value = '';
      document.getElementById('modalQuestionBadge').value = 'Memory & Wonder';
      document.getElementById('modalQuestionEnabled').checked = true;
      document.getElementById('modalQuestionRequired').checked = true;
      document.getElementById('modalQuestionMultiline').checked = false;
      document.getElementById('modalQuestionPlaceholder').value = '';
      document.getElementById('modalQuestionAutoAdvance').checked = true;
      addOptionRowToModal('First Choice', '✨');
      addOptionRowToModal('Second Choice', '💖');
    }

    toggleModalQuestionTypeFields(typeSelect.value);
    modalBackdrop.classList.add('active');
  }

  function closeQuestionModal() {
    const modalBackdrop = document.getElementById('questionModalBackdrop');
    modalBackdrop.classList.remove('active');
    editingQuestionId = null;
  }

  function toggleModalQuestionTypeFields(type) {
    const textFields = document.getElementById('modalTextFields');
    const optionFields = document.getElementById('modalOptionFields');
    if (type === 'option') {
      textFields.style.display = 'none';
      optionFields.style.display = 'block';
    } else {
      textFields.style.display = 'block';
      optionFields.style.display = 'none';
    }
  }

  function addOptionRowToModal(label = '', emoji = '✨') {
    const container = document.getElementById('modalOptionsContainer');
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.alignItems = 'center';

    row.innerHTML = `
      <input type="text" class="admin-input opt-emoji-input" value="${window.LoveStoryConfig.escapeHtml(emoji)}" style="width: 50px; text-align: center;" placeholder="✨">
      <input type="text" class="admin-input opt-label-input" value="${window.LoveStoryConfig.escapeHtml(label)}" style="flex-grow: 1;" placeholder="Option label..." required>
      <button type="button" class="admin-icon-btn danger btn-remove-opt">✕</button>
    `;

    row.querySelector('.btn-remove-opt').addEventListener('click', () => {
      row.remove();
    });

    container.appendChild(row);
  }

  function saveQuestionFromModal() {
    const type = document.getElementById('modalQuestionType').value;
    const title = document.getElementById('modalQuestionTitle').value.trim();
    if (!title) return;

    const desc = document.getElementById('modalQuestionDesc').value.trim();
    const badge = document.getElementById('modalQuestionBadge').value.trim();
    const enabled = document.getElementById('modalQuestionEnabled').checked;
    const required = document.getElementById('modalQuestionRequired').checked;

    let targetQuestion = null;

    if (editingQuestionId) {
      targetQuestion = config.questions.find(q => q.id === editingQuestionId);
    } else {
      targetQuestion = { id: 'q_' + Date.now() };
      config.questions.push(targetQuestion);
    }

    targetQuestion.type = type;
    targetQuestion.title = title;
    targetQuestion.description = desc;
    targetQuestion.badge = badge;
    targetQuestion.enabled = enabled;
    targetQuestion.required = required;

    if (type === 'option') {
      const optRows = document.querySelectorAll('#modalOptionsContainer > div');
      const options = [];
      optRows.forEach((r, idx) => {
        const optEmoji = r.querySelector('.opt-emoji-input').value.trim();
        const optLabel = r.querySelector('.opt-label-input').value.trim();
        if (optLabel) {
          options.push({
            id: `opt_${Date.now()}_${idx}`,
            label: optLabel,
            emoji: optEmoji || '✨'
          });
        }
      });
      targetQuestion.options = options;
      targetQuestion.autoAdvance = document.getElementById('modalQuestionAutoAdvance').checked;
    } else {
      targetQuestion.multiline = document.getElementById('modalQuestionMultiline').checked;
      targetQuestion.placeholder = document.getElementById('modalQuestionPlaceholder').value.trim();
    }

    renderQuestionList();
    closeQuestionModal();
    markDirty();
    showToast('Question updated.', 'success');
  }

  /**
   * Image Upload Handlers with Automatic Compression
   */
  function setupImageHandlers() {
    const fileInput = document.getElementById('uploadCouplePhoto');
    const urlInput = document.getElementById('couplePhotoUrl');

    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        showToast('Compressing photo...', 'info');
        try {
          const compressedDataUrl = await window.LoveStoryConfig.compressImageFile(file, 800, 0.72);
          urlInput.value = compressedDataUrl;
          config.images.couplePhoto = compressedDataUrl;
          updateImagePreview('couplePhotoPreview', compressedDataUrl);
          markDirty();
          showToast('Photo compressed and attached!', 'success');
        } catch (err) {
          showToast('Failed to process image: ' + err.message, 'error');
        }
      });
    }

    if (urlInput) {
      urlInput.addEventListener('input', () => {
        updateImagePreview('couplePhotoPreview', urlInput.value.trim());
      });
    }
  }

  function updateImagePreview(containerId, url) {
    const box = document.getElementById(containerId);
    if (!box) return;
    if (url && url.length > 5) {
      box.style.display = 'block';
      const img = box.querySelector('img');
      if (img) img.src = window.LoveStoryConfig.sanitizeUrl(url);
    } else {
      box.style.display = 'none';
    }
  }

  /**
   * Google Sheets Tester
   */
  function setupGoogleSheetsTester() {
    const btnTest = document.getElementById('btnTestSheetsConnection');
    const resultBox = document.getElementById('sheetsTestResult');
    const btnGuide = document.getElementById('btnOpenSetupGuide');

    if (btnTest) {
      btnTest.addEventListener('click', async () => {
        const url = document.getElementById('sheetsEndpointUrl').value.trim();
        if (!url || !url.startsWith('http')) {
          showToast('Please enter a valid Google Apps Script Web App URL first.', 'error');
          return;
        }

        btnTest.disabled = true;
        btnTest.innerHTML = '<span>⏳ Testing Connection...</span>';
        resultBox.style.display = 'block';
        resultBox.style.background = 'rgba(231, 197, 141, 0.15)';
        resultBox.style.color = '#E7C58D';
        resultBox.textContent = 'Sending test event to Google Apps Script...';

        const testPayload = {
          sessionId: 'test_admin_' + Date.now(),
          respondentName: 'Admin Connection Test',
          eventType: 'Connection Test',
          proposalStatus: 'Test Mode',
          details: 'Verified from Proposal Admin Dashboard.'
        };

        const res = await window.LoveStoryConfig.submitToGoogleAppsScript(url, testPayload);
        btnTest.disabled = false;
        btnTest.innerHTML = '<span>⚡ Test Connection Now</span>';

        if (res.status === 'success' || res.status === 'network_warning') {
          resultBox.style.background = 'rgba(16, 185, 129, 0.15)';
          resultBox.style.color = '#10B981';
          resultBox.innerHTML = `✅ <strong>Connected!</strong> Request was received by Google Apps Script. Check your Google Sheet "Events" tab to verify the new row!`;
          updateSheetsStatusBadge(url, true);
        } else {
          resultBox.style.background = 'rgba(239, 68, 68, 0.15)';
          resultBox.style.color = '#ef4444';
          resultBox.innerHTML = `❌ <strong>Failed:</strong> ${window.LoveStoryConfig.escapeHtml(res.message || 'Could not connect.')}<br><small>Ensure your Web App deployment is configured with: "Who has access: Anyone".</small>`;
          updateSheetsStatusBadge(url, false);
        }
      });
    }

    if (btnGuide) {
      btnGuide.addEventListener('click', () => {
        alert(
          "GOOGLE SHEETS SETUP STEPS:\n\n" +
          "1. Open your Google Sheet.\n" +
          "2. In the menu, click Extensions > Apps Script.\n" +
          "3. Paste the contents of 'google-apps-script.js'.\n" +
          "4. Click Deploy > New deployment > Web app.\n" +
          "5. Set 'Execute as: Me' and 'Who has access: Anyone'.\n" +
          "6. Authorize permissions and copy the Web App URL.\n" +
          "7. Paste that Web App URL here and click 'Test Connection Now'!\n\n" +
          "See README.md for full step-by-step screenshots & troubleshooting."
        );
      });
    }
  }

  function updateSheetsStatusBadge(url, isConnected = null) {
    const badge = document.getElementById('sheetsStatusBadge');
    if (!badge) return;

    if (!url || !url.startsWith('http')) {
      badge.textContent = 'Status: Unconfigured';
      badge.style.background = 'rgba(255, 255, 255, 0.1)';
      badge.style.color = 'var(--text-muted)';
      return;
    }

    if (isConnected === true) {
      badge.textContent = 'Status: Active & Connected';
      badge.style.background = 'rgba(16, 185, 129, 0.2)';
      badge.style.color = '#10B981';
    } else if (isConnected === false) {
      badge.textContent = 'Status: Error';
      badge.style.background = 'rgba(239, 68, 68, 0.2)';
      badge.style.color = '#ef4444';
    } else {
      badge.textContent = 'Status: URL Configured';
      badge.style.background = 'rgba(231, 197, 141, 0.2)';
      badge.style.color = '#E7C58D';
    }
  }

  /**
   * Backup, JSON Export & Reset
   */
  function setupBackupHandlers() {
    const btnExport = document.getElementById('btnExportConfig');
    const importFile = document.getElementById('importConfigFile');
    const btnReset = document.getElementById('btnResetToDefaults');

    if (btnExport) {
      btnExport.addEventListener('click', () => {
        syncFormToDraftConfig();
        const json = JSON.stringify(config, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `love-story-proposal-config-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Settings exported as JSON file.', 'success');
      });
    }

    if (importFile) {
      importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            if (!imported || typeof imported !== 'object' || !imported.general) {
              throw new Error('Invalid JSON schema. Missing general proposal keys.');
            }
            if (confirm('Import settings and overwrite current configuration?')) {
              config = imported;
              window.LoveStoryConfig.saveAppConfig(config);
              populateAllFormFields();
              markSaved();
              showToast('Configuration imported successfully!', 'success');
            }
          } catch (err) {
            alert('Import failed: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('⚠️ WARNING: This will reset all questions, texts, and colors to factory defaults. Continue?')) {
          const res = window.LoveStoryConfig.resetAppConfig();
          if (res.success) {
            config = res.config;
            populateAllFormFields();
            markSaved();
            showToast('All settings reset to defaults.', 'info');
          }
        }
      });
    }
  }

  /**
   * Overview Stats Updater
   */
  function updateOverviewStats() {
    const totalQ = document.getElementById('statQuestionsCount');
    const enabledQ = document.getElementById('statQuestionsEnabled');
    const themeName = document.getElementById('statThemePreset');
    const sheetsStatus = document.getElementById('statSheetsStatus');
    const flowList = document.getElementById('flowOverviewList');

    const questions = config.questions || [];
    const activeQuestions = questions.filter(q => q.enabled !== false);

    if (totalQ) totalQ.textContent = questions.length;
    if (enabledQ) enabledQ.textContent = activeQuestions.length;
    if (themeName) themeName.textContent = config.theme.preset ? config.theme.preset.replace('_', ' ') : 'Custom';
    if (sheetsStatus) {
      sheetsStatus.textContent = config.integrations.googleAppsScriptUrl ? 'Configured' : 'Not Connected';
      sheetsStatus.style.color = config.integrations.googleAppsScriptUrl ? '#10B981' : '#E7C58D';
    }

    if (flowList) {
      const items = [];
      if (config.welcome.enabled !== false) items.push({ icon: '✨', title: 'Welcome Screen', status: 'Enabled' });
      if (config.nameEntry.enabled !== false) items.push({ icon: '👤', title: 'Name Entry Screen', status: 'Enabled' });
      items.push({ icon: '❓', title: `${activeQuestions.length} Romantic Questions`, status: `${activeQuestions.length} active` });
      if (config.loveLetter.enabled !== false) items.push({ icon: '💌', title: 'Personal Love Letter', status: config.loveLetter.position || 'before proposal' });
      if (config.proposal.enabled !== false) items.push({ icon: '💍', title: 'Final Proposal Screen (Will you be my forever?)', status: 'Active with evasive No button' });
      items.push({ icon: '🎉', title: 'Celebration & Ring Screen', status: 'Enabled' });

      flowList.innerHTML = items.map((it, idx) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(0,0,0,0.25); border-radius: 10px; border-left: 3px solid var(--accent-color);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">${it.icon}</span>
            <span style="font-weight: 500; font-size: 0.95rem;">${idx + 1}. ${it.title}</span>
          </div>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">${it.status}</span>
        </div>
      `).join('');
    }
  }

  /**
   * Live Interactive Preview Modal
   */
  function setupLivePreviewModal() {
    const btnOpen = document.getElementById('btnOpenLivePreview');
    const modalBackdrop = document.getElementById('previewModalBackdrop');
    const btnClose = document.getElementById('btnPreviewClose');
    const previewContainer = document.getElementById('previewFrameContainer');
    const tabButtons = document.querySelectorAll('.preview-tab-btn');

    let activePreviewScreen = 'welcome';

    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        syncFormToDraftConfig();
        modalBackdrop.classList.add('active');
        renderLivePreview(activePreviewScreen);
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        modalBackdrop.classList.remove('active');
      });
    }

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        activePreviewScreen = btn.getAttribute('data-preview-screen');
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderLivePreview(activePreviewScreen);
      });
    });

    function renderLivePreview(screenType) {
      if (!previewContainer) return;
      applyActiveThemeToAdmin(config.theme);

      switch (screenType) {
        case 'welcome':
          previewContainer.innerHTML = `
            <div class="romance-card text-center" style="padding: 24px 16px;">
              <div class="romance-badge">${window.LoveStoryConfig.escapeHtml(config.welcome.badge || 'A Surprise')}</div>
              <h2 class="romance-title" style="font-size: 2rem;">${window.LoveStoryConfig.escapeHtml(config.welcome.heading)}</h2>
              <p class="romance-subtitle" style="font-size: 0.9rem;">${window.LoveStoryConfig.escapeHtml(config.welcome.subheading)}</p>
              <button class="btn-primary" style="font-size: 0.9rem; padding: 12px 24px;">
                <span>${window.LoveStoryConfig.escapeHtml(config.welcome.buttonText)}</span>
              </button>
            </div>
          `;
          break;

        case 'name':
          previewContainer.innerHTML = `
            <div class="romance-card" style="padding: 24px 16px;">
              <div class="romance-badge">Personalized</div>
              <h2 class="romance-title" style="font-size: 1.8rem;">${window.LoveStoryConfig.escapeHtml(config.nameEntry.heading)}</h2>
              <p class="romance-subtitle" style="font-size: 0.85rem;">${window.LoveStoryConfig.escapeHtml(config.nameEntry.subheading)}</p>
              <input type="text" class="romance-input" placeholder="${window.LoveStoryConfig.escapeHtml(config.nameEntry.placeholder)}" style="margin-bottom: 16px;">
              <button class="btn-primary" style="width: 100%;">
                <span>${window.LoveStoryConfig.escapeHtml(config.nameEntry.buttonText)}</span>
              </button>
            </div>
          `;
          break;

        case 'question':
          const q = (config.questions && config.questions[0]) || { title: 'Sample Question', type: 'text' };
          previewContainer.innerHTML = `
            <div class="romance-card" style="padding: 24px 16px;">
              <div class="romance-badge">${window.LoveStoryConfig.escapeHtml(q.badge || 'Memory')}</div>
              <h2 class="romance-title" style="font-size: 1.7rem;">${window.LoveStoryConfig.escapeHtml(q.title)}</h2>
              <p class="romance-subtitle" style="font-size: 0.85rem;">${window.LoveStoryConfig.escapeHtml(q.description || '')}</p>
              ${q.type === 'option' ? `
                <div class="romance-options-list">
                  ${(q.options || []).map(opt => `
                    <button class="romance-option-btn" style="padding: 10px 14px;">
                      <span>${window.LoveStoryConfig.escapeHtml(opt.emoji || '✨')}</span>
                      <span>${window.LoveStoryConfig.escapeHtml(opt.label)}</span>
                    </button>
                  `).join('')}
                </div>
              ` : `
                <input type="text" class="romance-input" placeholder="Type answer..." style="margin-bottom: 16px;">
              `}
              <button class="btn-primary" style="width: 100%;">Continue ✨</button>
            </div>
          `;
          break;

        case 'letter':
          previewContainer.innerHTML = `
            <div class="love-letter-envelope" style="padding: 24px 18px; margin: 0;">
              <div class="letter-header">
                <h3 class="letter-title" style="font-size: 1.8rem;">${window.LoveStoryConfig.escapeHtml(config.loveLetter.title)}</h3>
                <span class="letter-date" style="font-size: 0.85rem;">${window.LoveStoryConfig.escapeHtml(config.loveLetter.date || '')}</span>
              </div>
              <div class="letter-body" style="font-size: 1.05rem;">${window.LoveStoryConfig.escapeHtml(config.loveLetter.body)}</div>
              <div class="letter-signature" style="font-size: 1.8rem;">${window.LoveStoryConfig.escapeHtml(config.loveLetter.signature)}</div>
            </div>
          `;
          break;

        case 'proposal':
          previewContainer.innerHTML = `
            <div class="romance-card text-center" style="padding: 24px 16px;">
              <div class="romance-badge">The Question</div>
              <h2 class="romance-title" style="font-size: 1.8rem;">${window.LoveStoryConfig.escapeHtml(config.proposal.heading)}</h2>
              <div class="proposal-question-text" style="font-size: 2.2rem; margin: 12px 0;">
                ${window.LoveStoryConfig.escapeHtml(config.proposal.question)}
              </div>
              <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px;">
                <button class="btn-proposal-yes" style="padding: 12px 24px; font-size: 1.05rem;">${window.LoveStoryConfig.escapeHtml(config.proposal.yesText)}</button>
                <button class="btn-proposal-no" id="previewNoBtn" style="padding: 10px 18px;">${window.LoveStoryConfig.escapeHtml(config.proposal.noText)}</button>
              </div>
            </div>
          `;
          const noB = document.getElementById('previewNoBtn');
          if (noB) {
            noB.addEventListener('mouseover', () => {
              const x = (Math.random() - 0.5) * 120;
              const y = (Math.random() - 0.5) * 60;
              noB.style.transform = `translate(${x}px, ${y}px)`;
            });
          }
          break;

        case 'celebration':
          previewContainer.innerHTML = `
            <div class="romance-card celebration-box" style="padding: 24px 16px;">
              <div class="celebration-ring" style="font-size: 3.5rem;">💍</div>
              <h2 class="celebration-title" style="font-size: 2rem;">${window.LoveStoryConfig.escapeHtml(config.celebration.heading)}</h2>
              <p class="celebration-message" style="font-size: 0.95rem;">${window.LoveStoryConfig.escapeHtml(config.celebration.message)}</p>
            </div>
          `;
          break;
      }
    }
  }

  /**
   * Toast notification helper
   */
  function showToast(text, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'error') toast.style.borderLeftColor = '#ef4444';
    if (type === 'success') toast.style.borderLeftColor = '#10B981';

    const icon = type === 'success' ? '✅' : (type === 'error' ? '⚠️' : 'ℹ️');
    toast.innerHTML = `<span>${icon}</span> <span>${window.LoveStoryConfig.escapeHtml(text)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

})();
