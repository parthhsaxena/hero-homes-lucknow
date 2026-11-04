/**
 * GOOGLE APPS SCRIPT FOR HERO HOMES PRE-LAUNCH LEAD CAPTURE
 * 
 * ==============================================================================
 * STEP-BY-STEP SETUP INSTRUCTIONS:
 * ==============================================================================
 * 1. Open Google Sheets (go to https://sheets.new)
 * 2. In Row 1, add these exact column headers:
 *    Col A: Timestamp
 *    Col B: Name
 *    Col C: Phone
 *    Col D: Form Type
 *    Col G: Lead Intent
 *    Col F: Page URL
 *    Col G: UTM Source
 *    Col H: UTM Medium
 *    Col I: UTM Campaign
 * 
 * 3. In Google Sheets menu, click: Extensions -> Apps Script
 * 4. Replace any default code in Code.gs with this entire script.
 * 5. Click "Deploy" (top right) -> "New deployment"
 * 6. Select type: "Web app" (click the gear icon)
 * 7. Configure:
 *    - Description: "Hero Homes Pre-Launch Lead Webhook"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (CRITICAL: Must be Anyone so web forms can submit)
 * 8. Click "Deploy", authorize permissions when prompted.
 * 9. Copy the generated Web App URL (starts with https://script.google.com/macros/s/...)
 * 10. Paste that URL into src/config/site.ts at `googleScriptUrl`.
 * ==============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};

    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    var timestamp = new Date();
    var name = data.name || "";
    var phone = data.phone || "";
    var formType = data.formType || data.form_type || "prelaunch_enquiry";
    var leadIntent = data.leadIntent || data.lead_intent || "Pre-Launch Enquiry";
    var pageUrl = data.pageUrl || data.source_url || "";
    var utmSource = data.utm_source || "direct";
    var utmMedium = data.utm_medium || "organic";
    var utmCampaign = data.utm_campaign || "none";

    // Append lead row to Google Sheet
    sheet.appendRow([
      timestamp,
      name,
      "'" + phone, // Prefix with apostrophe so leading zeros are preserved
      formType,
      leadIntent,
      pageUrl,
      utmSource,
      utmMedium,
      utmCampaign
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "Lead recorded successfully"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Hero Homes Pre-Launch Lead API Webhook is live."
  })).setMimeType(ContentService.MimeType.JSON);
}
