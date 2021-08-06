// Register for storage changes
RegisterForStorageChanges();

// Kick things off by loading the email templates
ReadStorageValues();


function RegisterForStorageChanges()
{
    // Register a change handler for the synced values
    chrome.storage.onChanged.addListener(
        function(changes, namespace) 
        {
            ReadStorageValues()
        }
    );
}

function ReadStorageValues()
{
    chrome.storage.sync.get(
    {
        "notificationSubject"    : notificationSubjectDefault,
        "notificationBody"       : notificationBodyDefault,
        "changesRequiredSubject" : changesRequiredSubjectDefault,
        "changesRequiredBody"    : changesRequiredBodyDefault
    },
        function(items)
        {
            var error = chrome.runtime.lastError;
            if (error)
            {
                console.error(error);
            }
            else
            {
                CreateHyperlinks(items.notificationSubject, items.notificationBody, items.changesRequiredSubject, items.changesRequiredBody);
            }
        }
    );
}

String.prototype.replaceAll = function(strReplace, strWith) {
    // See http://stackoverflow.com/a/3561711/556609
    var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var reg = new RegExp(esc, 'ig');
    return this.replace(reg, strWith);
};

function CreateHyperlinks(notificationSubject, notificationBody, changesRequiredSubject, changesRequiredBody)
{
    var elements = document.getElementsByClassName('menu-pillbox');
    if (elements.length > 0)
    {
        // Get the ride poster's email address
        var posterEmailAddress = GetTextByClassName("field-name-field-contact-email");
        if (posterEmailAddress == "")
        {
            posterEmailAddress = "NO-EMAIL-ADDRESS-PROVIDED";
        }

        // Get the ride poster's full name
        var posterFullName = GetTextByClassName("field-name-field-contact-name");

        // Get the poster's first name
        var posterFirstName = posterFullName.split(" ")[0];

        // Get the ride approver's full name
        var approverFullName = GetCurrentUserName();

        // Get the ride approver's first name
        var approverFirstName = approverFullName.split(" ")[0];

        // Get the ride's name
        var rideName = GetTextByClassName("page-title");

        // Get the ride's URL
        var rideUrl = document.getElementsByName("twitter:url")[0].content;

        // Remove the links if they exist
        var existingLinks = document.getElementById("extension-hyperlinks");
        if (existingLinks)
        {
            existingLinks.remove();
        }

        // If we have ALL of these...
        if (posterEmailAddress != "" && approverFullName != "" && approverFullName != "" && rideName != "" && rideUrl != "")
        {
            // Replace all of the tokens
            notificationSubject = notificationSubject.replaceAll(rideNameToken, rideName).replaceAll(rideUrlToken, rideUrl).replaceAll(posterFullNameToken, posterFullName).replaceAll(posterFirstNameToken, posterFirstName).replaceAll(approverFullNameToken, approverFullName).replaceAll(approverFirstNameToken, approverFirstName);
            notificationBody = notificationBody.replaceAll(rideNameToken, rideName).replaceAll(rideUrlToken, rideUrl).replaceAll(posterFullNameToken, posterFullName).replaceAll(posterFirstNameToken, posterFirstName).replaceAll(approverFullNameToken, approverFullName).replaceAll(approverFirstNameToken, approverFirstName);
            changesRequiredSubject = changesRequiredSubject.replaceAll(rideNameToken, rideName).replaceAll(rideUrlToken, rideUrl).replaceAll(posterFullNameToken, posterFullName).replaceAll(posterFirstNameToken, posterFirstName).replaceAll(approverFullNameToken, approverFullName).replaceAll(approverFirstNameToken, approverFirstName);
            changesRequiredBody = changesRequiredBody.replaceAll(rideNameToken, rideName).replaceAll(rideUrlToken, rideUrl).replaceAll(posterFullNameToken, posterFullName).replaceAll(posterFirstNameToken, posterFirstName).replaceAll(approverFullNameToken, approverFullName).replaceAll(approverFirstNameToken, approverFirstName);

            // Create a new paragraph element to hold our huperlinks
            var feedbackParagraph = document.createElement("p");
            feedbackParagraph["id"] = "extension-hyperlinks";

            // Add the "fix this posting" link
            AppendFeedbackHyperlink("mailto:" + posterEmailAddress + "?cc=cbcrides@cascade.org&subject=" + encodeURIComponent(changesRequiredSubject) + "&body=" + encodeURIComponent(changesRequiredBody),
                                    "Send Correction Request to Ride Poster",
                                    feedbackParagraph);

            // Add a line break
            feedbackParagraph.appendChild(document.createElement("br"));

            // Add the "I fixed this posting" link
            AppendFeedbackHyperlink("mailto:" + posterEmailAddress + "?cc=cbcrides@cascade.org&subject=" + encodeURIComponent(notificationSubject) + "&body=" + encodeURIComponent(notificationBody),
                                    "Send Correction Notification to Ride Poster",
                                    feedbackParagraph);

            // Add the paragraph after the menu
            elements[0].after(feedbackParagraph);
        }
    }
}


function GetCurrentUserName()
{
    // Find the logged in user from the comment entry form
    var userLink = document.querySelector("form.comment-form div[id='edit-author--2'] a.username");
    if (userLink)
    {
        return userLink.innerText;
    }
    return "";
}


function AppendFeedbackHyperlink(hyperlink, text, parent)
{
    // Create the hyperlink element
    var mailtoHyperlinkElement = document.createElement("a");

    // Create the URI
    mailtoHyperlinkElement.href = hyperlink;

    // Set the friendly link name
    mailtoHyperlinkElement.innerText = text;

    // Add the hyperlink to the paragraph
    parent.appendChild(mailtoHyperlinkElement);
}



function GetTextByClassName(className)
{
    // Assume we didn't find it
    var result = "";

    // Find all the elements with this class name...
    var elements = document.getElementsByClassName(className);

    // But we want unique items, so make sure there is only one.
    if (elements.length == 1)
    {
        // Save the text
        result = elements[0].innerText;
    }
    return result;
}


