// Tokens that can appear in email templates
const rideNameToken          = "<rideName>";
const rideUrlToken           = "<rideUrl>";
const posterFullNameToken    = "<posterFullName>";
const posterFirstNameToken   = "<posterFirstName>";
const approverFullNameToken  = "<approverFullName>";
const approverFirstNameToken = "<approverFirstName>";

// Default email template values
const notificationSubjectDefault    = "Your \"<rideName>\" ride"
const notificationBodyDefault       = "Hi <posterFirstName>!\n\nRide posting: <rideUrl>\n\nI approved your ride, but I made the following changes:\n\n\n\nPlease let me know if you have any questions or concerns.\n\nThanks for posting rides!\n- <approverFirstName>"
const changesRequiredSubjectDefault = "Your \"<rideName>\" ride"
const changesRequiredBodyDefault    = "Hi <posterFirstName>!\n\nRide posting: <rideUrl>\n\nI am reviewing this ride and encountered a few problems that need to be addressed before I approve it.\n\n\n\nPlease reply all to this email when you are done making changes, and I will take another look.\n\nThanks for posting rides!\n- <approverFirstName>"

function ResetStorage()
{
    chrome.storage.sync.clear(
        function()
    {
        var error = chrome.runtime.lastError;
        if (error)
        {
            console.error(error);
        }
        else
        {
            LoadValuesToDocument();
        }
    });
}

function StoreValuesFromDocument()
{
    chrome.storage.sync.set(
    {
        "notificationSubject"    : document.getElementById("notificationSubject").value,
        "notificationBody"       : document.getElementById("notificationBody").value,
        "changesRequiredSubject" : document.getElementById("changesRequiredSubject").value,
        "changesRequiredBody"    : document.getElementById("changesRequiredBody").value}, 
        function() 
    {
        var error = chrome.runtime.lastError;
        if (error)
        {
            console.error(error);
        }
    });
}


function LoadValuesToDocument()
{
    chrome.storage.sync.get(
    {
        "notificationSubject"    : notificationSubjectDefault,
        "notificationBody"       : notificationBodyDefault,
        "changesRequiredSubject" : changesRequiredSubjectDefault,
        "changesRequiredBody"    : changesRequiredBodyDefault }, 
        function(items)
    {
        var error = chrome.runtime.lastError;
        if (error)
        {
            console.error(error);
        }
        else
        {
            document.getElementById("notificationSubject").value    = items.notificationSubject;
            document.getElementById("notificationBody").value       = items.notificationBody;
            document.getElementById("changesRequiredSubject").value = items.changesRequiredSubject;
            document.getElementById("changesRequiredBody").value    = items.changesRequiredBody;
        } 
    });
}

function ResetDefaults()
{
    document.getElementById("notificationSubject").value    = notificationSubjectDefault;
    document.getElementById("notificationBody").value       = notificationBodyDefault;
    document.getElementById("changesRequiredSubject").value = changesRequiredSubjectDefault;
    document.getElementById("changesRequiredBody").value    = changesRequiredBodyDefault;
}
