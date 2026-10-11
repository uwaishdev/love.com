/**
 * =========================================================================
 * OUR LOVE STORY — GOOGLE APPS SCRIPT BACKEND
 * =========================================================================
 * 
 * This script receives proposal responses, milestone events, and final
 * answers from the "Our Love Story" interactive proposal experience,
 * and records them safely into a Google Sheet.
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open your Google Sheet (or create a new one named "Our Love Story Responses").
 * 2. In Google Sheets menu, click: Extensions > Apps Script.
 * 3. Delete any code in the editor, and paste the entire contents of this file.
 * 4. (Optional) If running as an independent script, set SPREADSHEET_ID below.
 *    If attached to the Sheet (Container-bound), leave SPREADSHEET_ID empty.
 * 5. Click the "Deploy" button (top right) > "New deployment".
 * 6. Select type: "Web app".
 * 7. Set Description: "Love Story Backend v1".
 * 8. Execute as: "Me" (your email account).
 * 9. Who has access: "Anyone" (allows your girlfriend's phone to submit responses).
 * 10. Click "Deploy", authorize the permissions prompt, and copy the Web App URL.
 * 11. Paste this Web App URL into the Admin Panel of your proposal website!
 * =========================================================================
 */

// CONFIGURATION
// If your Apps Script is directly created from within Google Sheets (Extensions > Apps Script),
// leave SPREADSHEET_ID as empty string "" and it will automatically use SpreadsheetApp.getActiveSpreadsheet().
// If created as a standalone script at script.google.com, paste your Google Sheet ID here:
var SPREADSHEET_ID = "";

var SHEET_NAMES = {
  RESPONSES: "Responses",
  EVENTS: "Events"
};

// Response sheet columns
var RESPONSES_HEADERS = [
  "Timestamp",
  "Session ID",
  "Respondent Name",
  "Question ID",
  "Question Text",
  "Question Type",
  "Answer",
  "Proposal Status"
];

// Event sheet columns
var EVENTS_HEADERS = [
  "Timestamp",
  "Session ID",
  "Respondent Name",
  "Event Type",
  "Proposal Status",
  "Details"
];

/**
 * Handles incoming GET requests (health check & diagnostics)
 * Does NOT expose spreadsheet data to public visitors.
 */
function doGet(e) {
  var result = {
    status: "active",
    message: "Our Love Story Google Apps Script Endpoint is running and healthy.",
    timestamp: new Date().toISOString(),
    instruction: "Submit HTTP POST requests with JSON body to record proposal responses."
  };
  return createJsonResponse(result, 200);
}

/**
 * Handles incoming POST requests
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  
  // Wait up to 10 seconds for concurrent requests
  try {
    lock.waitLock(10000);
  } catch (lockError) {
    return createJsonResponse({
      success: false,
      error: "Server is currently busy processing another request. Please retry shortly."
    }, 429);
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        success: false,
        error: "Missing request body."
      }, 400);
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createJsonResponse({
        success: false,
        error: "Invalid JSON payload in request."
      }, 400);
    }

    // Connect to spreadsheet
    var spreadsheet = getSpreadsheet();
    if (!spreadsheet) {
      return createJsonResponse({
        success: false,
        error: "Spreadsheet could not be accessed. Please verify SPREADSHEET_ID or container binding."
      }, 500);
    }

    // Ensure required sheets and headers exist
    var responsesSheet = getOrCreateSheet(spreadsheet, SHEET_NAMES.RESPONSES, RESPONSES_HEADERS);
    var eventsSheet = getOrCreateSheet(spreadsheet, SHEET_NAMES.EVENTS, EVENTS_HEADERS);

    var timestamp = new Date();
    var formattedDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone() || "GMT", "yyyy-MM-dd HH:mm:ss");

    var sessionId = sanitizeCell(payload.sessionId || "unknown_session");
    var respondentName = sanitizeCell(payload.respondentName || payload.name || "Anonymous / Unspecified");
    var proposalStatus = sanitizeCell(payload.proposalStatus || (payload.accepted ? "Accepted (YES!)" : "In Progress"));

    var recordedResponsesCount = 0;
    var recordedEventsCount = 0;

    // 1. Process individual or batched question answers
    if (payload.responses && Array.isArray(payload.responses)) {
      payload.responses.forEach(function(item) {
        if (item && (item.questionId || item.answer !== undefined)) {
          var row = [
            formattedDate,
            sessionId,
            respondentName,
            sanitizeCell(item.questionId || ""),
            sanitizeCell(item.questionText || item.title || ""),
            sanitizeCell(item.questionType || item.type || "text"),
            sanitizeCell(formatAnswer(item.answer)),
            proposalStatus
          ];
          responsesSheet.appendRow(row);
          recordedResponsesCount++;
        }
      });
    } else if (payload.singleResponse) {
      var item = payload.singleResponse;
      var row = [
        formattedDate,
        sessionId,
        respondentName,
        sanitizeCell(item.questionId || ""),
        sanitizeCell(item.questionText || item.title || ""),
        sanitizeCell(item.questionType || item.type || "text"),
        sanitizeCell(formatAnswer(item.answer)),
        proposalStatus
      ];
      responsesSheet.appendRow(row);
      recordedResponsesCount++;
    }

    // 2. Process milestone events (e.g. Journey Started, Love Letter Read, Proposal Accepted)
    if (payload.eventType) {
      var eventDetails = sanitizeCell(payload.details || payload.note || "");
      var eventRow = [
        formattedDate,
        sessionId,
        respondentName,
        sanitizeCell(payload.eventType),
        proposalStatus,
        eventDetails
      ];
      eventsSheet.appendRow(eventRow);
      recordedEventsCount++;
    } else if (payload.events && Array.isArray(payload.events)) {
      payload.events.forEach(function(ev) {
        var eventRow = [
          formattedDate,
          sessionId,
          respondentName,
          sanitizeCell(ev.eventType || ev.name || "Custom Event"),
          proposalStatus,
          sanitizeCell(ev.details || "")
        ];
        eventsSheet.appendRow(eventRow);
        recordedEventsCount++;
      });
    }

    return createJsonResponse({
      success: true,
      message: "Data successfully saved to Google Sheets.",
      sessionId: sessionId,
      recordedResponses: recordedResponsesCount,
      recordedEvents: recordedEventsCount,
      timestamp: formattedDate
    }, 200);

  } catch (err) {
    return createJsonResponse({
      success: false,
      error: "Execution error: " + err.toString()
    }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Accesses target spreadsheet
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim().length > 0) {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Finds or creates sheet tab with headers and styling
 */
function getOrCreateSheet(spreadsheet, sheetName, headers) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  
  // If sheet is completely empty or has no first row, write headers
  if (sheet.getLastRowNum() === 0) {
    sheet.appendRow(headers);
    
    // Style headers: bold text, soft rose background, frozen header row
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#F7E6ED");
    headerRange.setFontColor("#3D1D2B");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    
    // Auto-fit column widths reasonably
    for (var i = 1; i <= headers.length; i++) {
      sheet.setColumnWidth(i, 160);
    }
  }
  return sheet;
}

/**
 * Mitigates Spreadsheet Formula Injection (CSV / Excel Injection)
 * Prevents malicious or accidental input starting with =, +, -, @, tab, or carriage return
 * from being evaluated as a dynamic formula by Google Sheets.
 */
function sanitizeCell(val) {
  if (val === null || val === undefined) return "";
  var str = String(val);
  
  // Check formula injection dangerous prefixes
  var firstChar = str.charAt(0);
  if (firstChar === "=" || firstChar === "+" || firstChar === "-" || firstChar === "@" || firstChar === "\t" || firstChar === "\r") {
    return "'" + str; // Prefix with single quote so spreadsheet treats it as pure string literal
  }
  return str;
}

/**
 * Formats answer values (handles arrays, objects, booleans, strings)
 */
function formatAnswer(ans) {
  if (ans === null || ans === undefined) return "";
  if (Array.isArray(ans)) return ans.join(", ");
  if (typeof ans === "object") return JSON.stringify(ans);
  return String(ans);
}

/**
 * Helper to construct JSON response with CORS headers
 */
function createJsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
