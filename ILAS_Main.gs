function runILAS() {

  // ======== START: Capture execution start time ========
  var startTime = new Date();

  // ======== CONFIGURATION SECTION ========
  // List of senders/domains to apply controlled cleanup
  // Rule: Only delete AFTER reading + delay period
  var senders = [
    "care@emaila.1mg.com",            // Tata 1mg specific sender
    "1mg.com",                        // Covers all 1mg variations
    "lem3905.emailer.pharmeasy.in",   // PharmEasy alerts
    "noreply@es9.cashify.in",         // Cashify notifications
    "info@whizlabs.com",              // Whizlabs emails
    "jobalerts-noreply@linkedin.com", // LinkedIn job alerts
    "naukrialerts@naukri.com"         // Naukri alerts
  ];

  // Delay (in days) before deleting read emails from senders
  var daysForSenders = 2;

  // Delay (in days) before deleting spam emails
  var daysForSpam = 3;

  Logger.log("====================================");
  Logger.log("ILAS EXECUTION STARTED");
  Logger.log("Start Time: " + startTime);
  Logger.log("====================================");

  // ======== PART 1: SENDER-BASED CLEANUP ========
  // Query explanation:
  // from:(...)         → match emails from specified senders/domains
  // is:read            → only process emails that user has already read
  // older_than:Xd      → apply safety delay before deletion
  var senderQuery =
    'from:(' + senders.join(' OR ') + ') is:read older_than:' + daysForSenders + 'd';

  var threads = GmailApp.search(senderQuery);

  Logger.log(" ");
  Logger.log("---- SENDER CLEANUP ----");
  Logger.log("Query Used: " + senderQuery);
  Logger.log("Threads Found: " + threads.length);

  var deletedCount = 0;

  // Iterate through matching email threads and delete them
  for (var i = 0; i < threads.length; i++) {
    var subject = threads[i].getFirstMessageSubject();
    Logger.log("Deleting Sender Mail: " + subject);

    threads[i].moveToTrash(); // Move thread to Trash
    deletedCount++;
  }

  Logger.log("Total Sender Emails Deleted: " + deletedCount);


  // ======== PART 2: SPAM CLEANUP ========
  // Query explanation:
  // in:spam            → target spam folder
  // older_than:Xd      → avoid deleting very recent spam (optional safety)
  // NOTE: No "is:read" → deletes both read and unread spam
  var spamQuery = 'in:spam older_than:' + daysForSpam + 'd';
  var spamThreads = GmailApp.search(spamQuery);

  Logger.log(" ");
  Logger.log("---- SPAM CLEANUP ----");
  Logger.log("Query Used: " + spamQuery);
  Logger.log("Threads Found: " + spamThreads.length);

  var spamDeleted = 0;

  for (var j = 0; j < spamThreads.length; j++) {
    var subject = spamThreads[j].getFirstMessageSubject();
    Logger.log("Deleting Spam Mail: " + subject);

    spamThreads[j].moveToTrash();
    spamDeleted++;
  }

  Logger.log("Total Spam Emails Deleted: " + spamDeleted);


  // ======== PART 3: SOCIAL TAB CLEANUP (FULL WIPE) ========
  // Query explanation:
  // category:social    → all emails under Social tab
  // No filters → deletes everything (read/unread, old/new)
  var socialQuery = 'category:social';
  var socialThreads = GmailApp.search(socialQuery);

  Logger.log(" ");
  Logger.log("---- SOCIAL CLEANUP ----");
  Logger.log("Query Used: " + socialQuery);
  Logger.log("Threads Found: " + socialThreads.length);

  var socialDeleted = 0;

  for (var k = 0; k < socialThreads.length; k++) {
    var subject = socialThreads[k].getFirstMessageSubject();
    Logger.log("Deleting Social Mail: " + subject);

    socialThreads[k].moveToTrash();
    socialDeleted++;
  }

  Logger.log("Total Social Emails Deleted: " + socialDeleted);


  // ======== FINAL SUMMARY ========
  var endTime = new Date();
  var duration = (endTime - startTime) / 1000; // execution time in seconds

  var summary =
    "Inbox Lifecycle Automation System (ILAS)\n\n" +
    "Execution Summary:\n" +
    "----------------------------------\n" +
    "Sender Emails Deleted : " + deletedCount + "\n" +
    "Spam Emails Deleted   : " + spamDeleted + "\n" +
    "Social Emails Deleted : " + socialDeleted + "\n\n" +
    "Execution Time        : " + duration + " seconds\n" +
    "Start Time            : " + startTime + "\n" +
    "End Time              : " + endTime + "\n" +
    "----------------------------------\n\n" +
    "System Status: SUCCESS";

  Logger.log(" ");
  Logger.log("==== FINAL SUMMARY ====");
  Logger.log(summary);
  Logger.log("====================================");


  // ======== NOTIFICATION ========
  // Sends execution report to your email
  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: "ILAS Report | " + startTime.toLocaleString(),
    body: summary
  });

}
