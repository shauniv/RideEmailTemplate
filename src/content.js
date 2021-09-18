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
                AddRegistrationAnnotations();
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

function AddRegistrationAnnotations()
{
    var tables = document.getElementsByClassName("sticky-table");
    if (tables != null)
    {
        if (tables.length == 1)
        {
            var table = tables[0];
            for (var row of table.rows)
            {
                for (var cell of row.cells)
                {
                    if (IsRideLeaderUrl(cell.innerText))
                    {
                        cell.innerHTML = cell.innerHTML + "<span style=\"color:red;font-style:italic;font-weight:bold;\"> (RL)</span>" ;
                    }
                }
            }
        }
    }
}

function CreateHyperlinks(notificationSubject, notificationBody, changesRequiredSubject, changesRequiredBody)
{
    // If approved by isn't visible, the user isn't an admin, so don't add feedback hyperlinks
    var approvedBy = document.getElementsByClassName('views-label-field-approver');
    if (approvedBy.length > 0)
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

function IsRideLeaderUrl(innerHtmlValue)
{
    const rideLeaders = [
        "4cathy@live.com",
        "aaronbobby.tr@gmail.com",
        "abentley@abentley.digitalspacemail8.net",
        "ablynch@gmail.com",
        "admin@cascade.org",
        "afung80@gmail.com",
        "agafour@msn.com",
        "alan@seattlephoto.net",
        "albert.meerscheidt@gmail.com",
        "albertfiedler@gmail.com",
        "alexa.volwiler@gmail.com",
        "alfred.hellstern@hotmail.com",
        "alicia.the.airplane@gmail.com",
        "allan@blarg.net",
        "alohrmann1@gmail.com",
        "amiller7x7@comcast.net",
        "ampfrog001@gmail.com",
        "andra@fastmail.com",
        "aquaria@comcast.net",
        "asevenson@gmail.com",
        "astrbear@comcast.net",
        "awilliams53@gmail.com",
        "b_tannenbaum@yahoo.com",
        "ballardbiker13@gmail.com",
        "balr@icloud.com",
        "billjodylemke@gmail.com",
        "blackratty@gmail.com",
        "blmix@mindspring.com",
        "blythehopp@gmail.com",
        "bmoss12157@gmail.com",
        "bobco85@gmail.com",
        "bradryno@hotmail.com",
        "bread-man@hotmail.com",
        "brendar13511@gmail.com",
        "bruce.klouzal@comcast.net",
        "bruce_zunser@hotmail.com",
        "bvandroo@comcast.net",
        "c.h.nelson@hotmail.com",
        "camanosail@camano.net",
        "cameron.mclean@gmail.com",
        "carlball99@yahoo.com",
        "cascade.cyclist@gmail.com",
        "cascadewaiver@cascadebicycleclub.org",
        "caseyhawley@frontier.com",
        "cavecreekgoat@yahoo.com",
        "cbc+gabe@thinkshout.com",
        "cbctest1002@gmail.com",
        "chaoc224@gmail.com",
        "cheryl.funkhouser@gmail.com",
        "chialoon@gmail.com",
        "chiyaoshih@yahoo.com",
        "chris.c.stewart@kp.org",
        "christhill@hotmail.com",
        "christopherhirata@gmail.com",
        "ciccpublic@gmail.com",
        "cjalmgren1@hotmail.com",
        "cjworthen@comcast.net",
        "clemens4christ@comcast.net",
        "clhopper3@hotmail.com",
        "colleen.r.kelley@gmail.com",
        "coryvolkert@outlook.com",
        "csackett49@comcast.net",
        "cwsbike@yahoo.com",
        "cyclechuck@yahoo.com",
        "cynthia4christ@comcast.net",
        "d2brubeck@gmail.com",
        "dalech@comcast.net",
        "danelmanperry@hotmail.com",
        "dave.owen.gm@gmail.com",
        "davereid88@gmail.com",
        "davethorbeck@hotmail.com",
        "davidmchatham@gmail.com",
        "davidu@cascade.org",
        "davies.john@comcast.net",
        "dawnapril9@yahoo.com",
        "dayleellison@yahoo.com",
        "deb.campbell@comcast.net",
        "dg98033@gmail.com",
        "discoumpire@gmail.com",
        "djoda2@gmail.com",
        "dmmoise@gmail.com",
        "donmartin@raincity.com",
        "dorothe.nl@gmail.com",
        "dottiezsmith@yahoo.com",
        "drgarretson@live.com",
        "dsandovalpoc@gmail.com",
        "dselk@msn.com",
        "dskurnik@gmail.com",
        "ecraig12345@gmail.com",
        "edgrubbs@hotmail.com",
        "efish2002@yahoo.com",
        "eric_gunnerson@hotmail.com",
        "fairbanksds@gmail.com",
        "fernandokingsanchez@rocketmail.com",
        "fhorwitz@gmail.com",
        "fishtory@msn.com",
        "fleming806@yahoo.com",
        "flyboydanny@gmail.com",
        "fuzzyhornet@frontier.com",
        "gailnew.9752@gmail.com",
        "garratt.roger@gmail.com",
        "garyzuk@gmail.com",
        "gina.bredberg@gmail.com",
        "ginareneebrooks@gmail.com",
        "grajkovic@gmail.com",
        "grassercycleman@hotmail.com",
        "greglikesbikes1211@gmail.com",
        "gregskyles@gmail.com",
        "griffin185zx@msn.com",
        "happybeingme@live.com",
        "hdavidmattson@gmail.com",
        "heidikschillinger@gmail.com",
        "iamkimbo@hotmail.com",
        "jack_on_cbr1000burner@yahoo.com",
        "jackson.geoffrey@gmail.com",
        "jalmgren@uw.edu",
        "jamesborthen@comcast.net",
        "janbike@outlook.com",
        "jbclimber@yahoo.com",
        "jchengj@gmail.com",
        "jdileonardo@gmail.com",
        "jeannedagloria@gmail.com",
        "jeff.cao@gmail.com",
        "jeff.duchin@gmail.com",
        "jeffreytpowers@gmail.com",
        "jeffstew1@hotmail.com",
        "jericayb@gmail.com",
        "jimi.boulet@gmail.com",
        "jleeinwa@leesinwa.com",
        "jlkearney8@comcast.net",
        "jmoormeier@mac.com",
        "joecyclist66@gmail.com",
        "joggerbill43@gmail.com",
        "john.knutzen@tetratech.com",
        "johnjaymullins@hotmail.com",
        "johnkugler@comcast.net",
        "johnmhub@msn.com",
        "johnweller46@msn.com",
        "johnweller46-rl@msn.com",
        "joni.griffis@gmail.com",
        "josephr+rl@cascade.org",
        "josephr+rla@cascade.org",
        "josephr5000@yahoo.com",
        "josephr5000+rla@gmail.com",
        "jouster1@hotmail.com",
        "jowen1838@hotmail.com",
        "jpearlsea@gmail.com",
        "jtcnelson@gmail.com",
        "juli@pacificgp.com",
        "justimagineglass@comcast.net",
        "jveritas007@gmail.com",
        "kathyreynolds578@gmail.com",
        "kawasakikc@msn.com",
        "kcbuddee@me.com",
        "keithcorndog@gmail.com",
        "kenjmeyer@outlook.com",
        "kentenure@msn.com",
        "klherpoldt@gmail.com",
        "lagoetsch@aol.com",
        "larrydebardi@yahoo.com",
        "larsensven@me.com",
        "laurie@regattasail.com",
        "lehmanj3@gmail.com",
        "lfweppler@gmail.com",
        "lifsgr834@gmail.com",
        "likhi.ondov@gmail.com",
        "lindavt22@gmail.com",
        "lindseth@uw.edu",
        "lists@christopherdorris.net",
        "liu_bin@outlook.com",
        "lizsanocki@hotmail.com",
        "lois.smith317@gmail.com",
        "lolaj@outlook.com",
        "lorrainevstewart@hotmail.com",
        "lvdemo@comcast.net",
        "lynneh13@hotmail.com",
        "machikoshoji@yahoo.com",
        "makelsey@comcast.net",
        "marc.means@live.com",
        "marg2009@comcast.net",
        "marijmorgan@comcast.net",
        "marizel.miller@gmail.com",
        "mary.remoaldo@gmail.com",
        "maryhcpa@gmail.com",
        "massivedetermination@hotmail.com",
        "matthew.wong@comcast.net",
        "mdwong2004@yahoo.com",
        "me@carlwainwright.com",
        "me@julip.co",
        "megancowell0@gmail.com",
        "merlinrain@gmail.com",
        "merrilyalexrollsalong@gmail.com",
        "mfmoreland166@yahoo.com",
        "mgopalan@live.in",
        "michael@hdltcollaborative.com",
        "midnitespirit65@gmail.com",
        "mikaelajang@gmail.com",
        "miken@tta-group.com",
        "millhollens@yahoo.com",
        "mizuef@gmail.com",
        "mjcunanan@comcast.net",
        "mkeithly@outlook.com",
        "mlm01140@gmail.com",
        "mmclum@gmail.com",
        "mnjzils@comcast.net",
        "mrahim@cascade.org",
        "mschill1972@yahoo.com",
        "msconklin@yahoo.com",
        "mupsall1949@gmail.com",
        "mwboyer@gmail.com",
        "nancy.helm@outlook.com",
        "nanhaberman@gmail.com",
        "naomind@gmail.com",
        "nelson141@zazzo.com",
        "njcunanan@yahoo.com",
        "noelhowes@me.com",
        "notathotmailoryahoo@gmail.com",
        "nwtarheelrunner@yahoo.com",
        "p1dunmore@comcast.net",
        "pam.means@live.com",
        "pasinger@comcast.net",
        "patty.lyman@gmail.com",
        "patty.sather@outlook.com",
        "paul.constantine@gmail.com",
        "paul@aurynia.com",
        "paulfranks@frontier.com",
        "paulsoreff@icloud.com",
        "paulverm@gmail.com",
        "pbrynes@gmail.com",
        "pdh5775@gmail.com",
        "peng@refinezone.com",
        "pers@raincity.com",
        "peter.breyfogle@gmail.com",
        "petra.silverstein@yahoo.com",
        "pgrey@hotmail.com",
        "philip.rueker@live.com",
        "piano2day@yahoo.com",
        "picalily@hotmail.com",
        "piper.peterson1@gmail.com",
        "pjhallson@yahoo.com",
        "prurton@comcast.net",
        "prurton2@comcast.net",
        "raduban@gmail.com",
        "raymartial@hotmail.com",
        "recornwell@live.com",
        "reid.lily@gmail.com",
        "renussbaum@outlook.com",
        "rgmoul@comcast.net",
        "rhetorike@hotmail.com",
        "richardjaywolf@gmail.com",
        "richknox@gmail.com",
        "rickwiltfong@gmail.com",
        "rider.x@coliz.com",
        "rlatino@live.com",
        "rlcert@cascade.org",
        "rls3213@yahoo.com",
        "rmpuratich@centurytel.net",
        "robert.rozycki@gmail.com",
        "rockylwhite@gmail.com",
        "rodjalepeno@aol.com",
        "ronishi@comcast.net",
        "roopasalsa@gmail.com",
        "rosemaryferrentino@me.com",
        "rschranck@gmail.com",
        "ryan.bede@gmail.com",
        "s.williamson@comcast.net",
        "salponce@gmail.com",
        "salvador.assumpcao@gmail.com",
        "samanddiedrich@comcast.net",
        "sandilnavarro@aol.com",
        "saulsnatsky@comcast.net",
        "sblachowicz@gmail.com",
        "sbmitchell@comcast.net",
        "schutteconnie@gmail.com",
        "scotgibson@pm.me",
        "scott@kaz-fam.com",
        "scott@scottkralik.org",
        "scrosby72@gmail.com",
        "sean.m.obrien@gmail.com",
        "sg7263@gmail.com",
        "sghulsman@comcast.net",
        "shanavt@raincity.com",
        "sharonwchen@hotmail.com",
        "shaun@ivory.org",
        "sjfoto1@gmail.com",
        "skycaptaintwo@gmail.com",
        "slonimfamily@comcast.net",
        "smboggs@live.com",
        "smith.lyssa@gmail.com",
        "softailmama@comcast.net",
        "stevedouglas44@gmail.com",
        "takeo_kuraishi@yahoo.com",
        "tandersoncascade@gmail.com",
        "tcwithington@mac.com",
        "tim.johnson.ing@outlook.com",
        "tinamwilliamson1@gmail.com",
        "tmeloy10@gmail.com",
        "tmurison@hotmail.com",
        "tniebling@gmail.com",
        "tomandtrudylarson@gmail.com",
        "tommbaker@hotmail.com",
        "trekmann13@gmail.com",
        "trp893@gmail.com",
        "txomin@mac.com",
        "unadvertised@hotmail.com",
        "vaelin4@gmail.com",
        "valarindri@gmail.com",
        "vehaag@comcast.net",
        "viduong75@gmail.com",
        "voltadh@gmail.com",
        "voltaji@yahoo.com",
        "vrisham@yahoo.com",
        "wallydavis3@gmail.com",
        "wangcyeung@yahoo.com",
        "wcagness@comcast.net",
        "whoelse@outlook.com",
        "wilfried.mack@gmail.com",
        "windsorlewis@live.com",
        "wmrohay@gmail.com",
        "writeforsales@gmail.com",
        "zabo999@gmail.com",
    ];
    var lowercaseInput = innerHtmlValue.toLowerCase();
    for(var i = 0; i < rideLeaders.length; ++i)
    { 
        if (rideLeaders[i] === lowercaseInput)
        {
            return true;
        }
    }
    return false;
}
