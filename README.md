# Our Love Story — An Interactive Proposal Experience

> A cinematic digital love story, interactive proposal journey, memory book, customizable Admin Control Center, and real Google Sheets backend integration.

---

## 1. Project Overview

**Our Love Story** is a web application designed for a boyfriend to create a deeply personalized, emotional proposal experience for his partner. The recipient opens the web app on her mobile phone or computer, steps through chapters of relationship memories, answers personalized questions, reads a heartfelt digital love letter, and reaches the final proposal screen featuring an evasive "No" button and an unforgettable "Yes!" celebration with confetti and hearts.

### Key Features
1. **Interactive Romantic Journey**: Multi-step guided narrative with dynamic progress indicators and smooth transitions.
2. **Personalized Name Entry**: Greets the recipient with her nickname throughout all questions and the love letter.
3. **Dynamic Questionnaire System**: Supports both custom text questions (short & multiline) and multiple-choice options with emoji support, validation, and auto-advance.
4. **Romantic Love Letter**: Parchment paper presentation, custom cursive typography, multiple paragraphs, and personal handwritten signature.
5. **Interactive Proposal Arena**:
   - High-energy, glowing **"Yes, Absolutely! 💍❤️"** button triggering canvas confetti and celebration rings.
   - Mischievous, evasive **"No 🙈"** button that dynamically leaps away on touch or mouseover within bounded screen coordinates, complete with playful toast messages and keyboard accessibility fallbacks.
6. **Celebration & Sharing**: Instant WhatsApp link construction with prefilled messages and Instagram profile tags.
7. **Comprehensive Admin Dashboard (`admin.html`)**:
   - Reorder, duplicate, add, edit, and toggle questions without touching code.
   - Real-time phone mockup preview with zero pollution of production response data.
   - Image uploads with client-side canvas compression to prevent `localStorage` quota overflows.
   - One-click Theme presets (Burgundy Rose, Midnight Starlight, Vintage Champagne, Lavender Dream) plus hex color pickers.
   - Full configuration JSON export and import for seamless cross-device migration.
8. **Real Google Sheets Backend (`google-apps-script.js`)**:
   - Automatically records each answer, timestamp, respondent name, and final "Proposal Accepted" status into dedicated `Responses` and `Events` tabs.
   - Built-in CSV/Excel formula injection sanitization and script concurrency locking.
   - Offline & cross-origin resilience (never blocks the proposal celebration if the internet drops).

---

## 2. Project File Structure

| File | Purpose |
| :--- | :--- |
| `index.html` | Public entry point for the proposal journey. Renders the dynamic screens, heart particles, and confetti canvas. |
| `admin.html` | Private Admin Control Center dashboard for customizing questions, text, themes, images, and integrations. |
| `style.css` | Universal stylesheet containing CSS Custom Properties, Google Fonts, glassmorphism, responsive mobile layouts, and admin controls. |
| `script.js` | Frontend engine for the public proposal journey (state management, question validation, evasive No button physics, confetti celebration, and submission). |
| `admin.js` | Administrative logic (form synchronizer, question CRUD, drag/reorder, image compressor, backup import/export, connection tester). |
| `config.js` | Shared configuration schema, default settings, `localStorage` persistence engine, URL sanitizers, and Google Apps Script dispatcher. |
| `google-apps-script.js` | Deployable Google Apps Script Web App backend that logs answers and events to Google Sheets. |
| `README.md` | Complete setup, configuration, security, and deployment documentation. |

---

## 3. Running Locally

The application uses standard vanilla HTML5, CSS3, and ES6+ JavaScript. No complex build pipelines or server installations are required to run or edit it.

### Option A: Using Vite Dev Server (Included in this project)
```bash
# Starts local development server on port 3000
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the public proposal or [http://localhost:3000/admin.html](http://localhost:3000/admin.html) for the admin dashboard.

### Option B: Using Any Static HTTP Server
```bash
# Python 3
python3 -m http.server 3000

# Or npx serve
npx serve .
```

> **Note on `file://` protocol**: While basic HTML will open by double-clicking, browser security policies restrict `localStorage`, camera/file uploads, and cross-origin Google Apps Script requests under the `file://` scheme. Always run through a local HTTP server or static web host.

---

## 4. Google Sheets Backend Setup Guide

Follow these step-by-step instructions to connect your proposal app to a Google Sheet:

### Step 1: Create the Google Sheet
1. Go to [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Title it: **"Our Love Story Responses"**.

### Step 2: Open Google Apps Script
1. In the Google Sheets top menu bar, click **Extensions** > **Apps Script**.
2. A new tab will open with the Apps Script code editor.

### Step 3: Insert Backend Code
1. Erase any placeholder code inside `Code.gs`.
2. Open the file `google-apps-script.js` from this repository.
3. Copy its entire content and paste it into the Apps Script editor.
4. Click the **Save** icon (diskette).

### Step 4: Configure Spreadsheet ID (Optional)
- Because this script is created directly from within your Google Sheet (*Container-bound script*), the script automatically detects the active sheet. You can leave `var SPREADSHEET_ID = "";` empty.
- If you ever run this as a standalone script at [script.google.com](https://script.google.com), copy the Spreadsheet ID from the sheet's URL:
  `https://docs.google.com/spreadsheets/d/`**`<SPREADSHEET_ID>`**`/edit`
  and paste it inside `var SPREADSHEET_ID = "YOUR_ID_HERE";`.

### Step 5: Deploy as a Web App
1. At the top right of the Apps Script editor, click **Deploy** > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `Love Story Backend v1`
   - **Execute as**: `Me (<your_email@gmail.com>)`
   - **Who has access**: `Anyone` *(Crucial: allows your girlfriend's mobile browser to send responses without requiring a Google login)*.
4. Click **Deploy**.
5. Google will ask you to **Authorize access**:
   - Click *Authorize Access* > Select your Google Account.
   - If you see "Google hasn't verified this app", click *Advanced* > *Go to Untitled project (unsafe)*.
   - Click *Allow*.
6. You will be provided with a **Web app URL** that looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`
7. Copy this URL!

### Step 6: Connect into the Proposal Admin Panel
1. Open `admin.html` on your browser.
2. Navigate to the **Google Sheets** tab on the left sidebar.
3. Paste your Web App URL into the **Google Apps Script Web App URL** input.
4. Click **⚡ Test Connection Now**.
5. You should see a green success notification:
   `Connected! Request was received by Google Apps Script.`
6. Return to your Google Sheet: you will notice two tabs automatically created and styled with soft rose headers:
   - **`Responses`**: Logs Timestamp, Session ID, Respondent Name, Question ID, Question Text, Question Type, Answer, and Proposal Status.
   - **`Events`**: Logs Milestone events like *Journey Started*, *Love Letter Opened*, *Proposal Accepted*.
7. Click **💾 Save All Changes** at the bottom of the Admin Panel.

---

## 5. Admin Panel Customization

Access the control panel at `/admin.html`:

- **Question Manager**:
  - Add single-line text, multiline essays, or multiple-choice questions.
  - Reorder questions using the **↑** and **↓** buttons.
  - Set questions as *Required* or *Optional*.
  - Enable *Auto-Advance on Click* for seamless mobile tapping.
- **Love Letter**:
  - Write multi-paragraph declarations with line-break preservation.
  - Use `{{name}}` anywhere in the text to automatically substitute her nickname.
  - Position the letter before or after the proposal question.
- **Proposal Screen**:
  - Customize the question and subtext.
  - Customize playful messages that trigger when she tries to touch the "No" button.
- **Theme, Atmosphere & Font Design (फ़ॉन्ट डिज़ाइन)**:
  - Switch between color presets or customize primary backgrounds, card backgrounds, and accent colors.
  - Choose from **Romantic Font Pairing Presets** (Classic Romance, Sweet & Playful, French Elegance, Luxury Editorial, Fairytale Script, Regal Royalty) or customize individually.
  - Independent selectors for **Heading & Proposal Font** (Great Vibes, Dancing Script, Parisienne, Alex Brush, Playfair Display, Cinzel, Pacifico).
  - Selectors for **Body Text Font** (Poppins, Montserrat, Quicksand, Nunito, Inter) and **Love Letter Font** (Cormorant Garamond, Caveat, Marck Script, Bad Script).
  - Real-time live typography preview card right inside the admin dashboard.
  - Toggle between falling hearts, floating hearts, or clean glowing gradients.
- **Photos & Images**:
  - Upload local photos. The built-in client engine scales and compresses the images down to lightweight Data URIs (under 150KB) so they do not exhaust browser `localStorage`.
- **Backup & Reset**:
  - Download `love-story-config.json` to keep a backup or transfer it to another computer or phone.

---

## 6. Static Web Deployment (Free Hosting)

Because this application requires no server-side Node.js runtime, you can host it for free on any static host:

### GitHub Pages
1. Push your repository to GitHub.
2. In GitHub, go to your repository's **Settings** > **Pages**.
3. Under *Branch*, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**.
5. Within 1–2 minutes, your website is live at:
   `https://<your-username>.github.io/<repo-name>/`
6. Open `/admin.html` once to configure your settings, or pre-configure default settings in `config.js`.

### Netlify
1. Log in to [Netlify](https://www.netlify.com).
2. Drag and drop the project folder into the Netlify dashboard, or connect via GitHub.
3. Leave the build command blank and publish directory as `.`.
4. Your site will be live instantly with a free HTTPS URL.

---

## 7. Security & Privacy Notes

1. **Client-Side Storage**: All custom settings are stored locally in the browser's `localStorage` (`romanticProposalConfig_v1`). No private passwords or secrets are kept in client code.
2. **Formula Injection Mitigation**: Untrusted responses typed into inputs that start with `=`, `+`, `-`, `@`, `\t`, or `\r` are sanitized by the Apps Script with a leading single quote (`'`) to prevent Google Sheets from interpreting user input as executable spreadsheet macros.
3. **Google Apps Script Access**: The Apps Script Web App is configured with `Who has access: Anyone` specifically so visitors can submit answers without requiring authentication. The script strictly allows `POST` requests for answer insertion and never exposes past responses or private spreadsheet contents to public GET visitors.

---

## 8. Troubleshooting

| Issue | Cause & Solution |
| :--- | :--- |
| **Google Sheets test says "Failed"** | Verify that during Apps Script deployment, **Who has access** was set to **Anyone** (not "Only myself"). If you edit `google-apps-script.js`, you must create a **New Version** in Deploy > Manage deployments. |
| **Responses not appearing in Sheet** | Check if the Google Sheet has been trashed or if your Google account storage is full. |
| **Images not saving in Admin Panel** | Browser `localStorage` has a ~5MB quota limit. Use smaller files or paste direct URLs from an image hosting service (such as Imgur, Cloudinary, or Google Drive direct link). |
| **Heart animation lags on older phones** | Select *Reduced Motion* or set heart animation to *None* in the Theme settings. |
| **Changes not visible on another device** | `localStorage` is unique to each device's browser. Use **Export Settings JSON** on your computer, send the `.json` file to your target device, and click **Import Settings JSON** in `admin.html`. |
