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
        "wcagness@comcast.net",
        "allan@blarg.net",
        "cjalmgren1@hotmail.com",
        "jalmgren@uw.edu",
        "tandersoncascade@gmail.com",
        "piano2day@yahoo.com",
        "salvador.assumpcao@gmail.com",
        "tommbaker@hotmail.com",
        "laurie@regattasail.com",
        "carlball99@yahoo.com",
        "raduban@gmail.com",
        "txomin@mac.com",
        "camanosail@camano.net",
        "astrbear@comcast.net",
        "ryan.bede@gmail.com",
        "trekmann13@gmail.com",
        "jbclimber@yahoo.com",
        "merrilyalexrollsalong@gmail.com",
        "abentley@abentley.digitalspacemail8.net",
        "cyclechuck@yahoo.com",
        "jericayb@gmail.com",
        "roopasalsa@gmail.com",
        "blackratty@gmail.com",
        "sblachowicz@gmail.com",
        "smboggs@live.com",
        "jamesborthen@comcast.net",
        "jimi.boulet@gmail.com",
        "mwboyer@gmail.com",
        "rodjalepeno@aol.com",
        "gina.bredberg@gmail.com",
        "peter.breyfogle@gmail.com",
        "ginareneebrooks@gmail.com",
        "d2brubeck@gmail.com",
        "pbrynes@gmail.com",
        "jveritas007@gmail.com",
        "softailmama@comcast.net",
        "deb.campbell@comcast.net",
        "cbc+gabe@thinkshout.com",
        "greglikesbikes1211@gmail.com",
        "jeannedagloria@gmail.com",
        "cbctest1002@gmail.com",
        "rlcert@cascade.org",
        "kawasakikc@msn.com",
        "davidmchatham@gmail.com",
        "chaoc224@gmail.com",
        "sharonwchen@hotmail.com",
        "jchengj@gmail.com",
        "fleming806@yahoo.com",
        "peng@refinezone.com",
        "ciccpublic@gmail.com",
        "cynthia4christ@comcast.net",
        "clemens4christ@comcast.net",
        "rider.x@coliz.com",
        "msconklin@yahoo.com",
        "paul.constantine@gmail.com",
        "recornwell@live.com",
        "megancowell0@gmail.com",
        "ecraig12345@gmail.com",
        "scrosby72@gmail.com",
        "njcunanan@yahoo.com",
        "mjcunanan@comcast.net",
        "rhetorike@hotmail.com",
        "naomind@gmail.com",
        "davies.john@comcast.net",
        "wallydavis3@gmail.com",
        "larrydebardi@yahoo.com",
        "lvdemo@comcast.net",
        "jdileonardo@gmail.com",
        "stevedouglas44@gmail.com",
        "rmpuratich@centurytel.net",
        "jeff.duchin@gmail.com",
        "p1dunmore@comcast.net",
        "viduong75@gmail.com",
        "joecyclist66@gmail.com",
        "whoelse@outlook.com",
        "asevenson@gmail.com",
        "fairbanksds@gmail.com",
        "rosemaryferrentino@me.com",
        "albertfiedler@gmail.com",
        "paulfranks@frontier.com",
        "mizuef@gmail.com",
        "afung80@gmail.com",
        "cheryl.funkhouser@gmail.com",
        "agafour@msn.com",
        "garratt.roger@gmail.com",
        "drgarretson@live.com",
        "scotgibson@pm.me",
        "lagoetsch@aol.com",
        "sg7263@gmail.com",
        "lifsgr834@gmail.com",
        "mgopalan@live.in",
        "grassercycleman@hotmail.com",
        "dg98033@gmail.com",
        "pgrey@hotmail.com",
        "griffin185zx@msn.com",
        "joni.griffis@gmail.com",
        "cavecreekgoat@yahoo.com",
        "edgrubbs@hotmail.com",
        "eric_gunnerson@hotmail.com",
        "vehaag@comcast.net",
        "nanhaberman@gmail.com",
        "pjhallson@yahoo.com",
        "joggerbill43@gmail.com",
        "caseyhawley@frontier.com",
        "pdh5775@gmail.com",
        "alfred.hellstern@hotmail.com",
        "nancy.helm@outlook.com",
        "massivedetermination@hotmail.com",
        "4cathy@live.com",
        "klherpoldt@gmail.com",
        "christhill@hotmail.com",
        "lynneh13@hotmail.com",
        "christopherhirata@gmail.com",
        "paul@aurynia.com",
        "michael@hdltcollaborative.com",
        "clhopper3@hotmail.com",
        "blythehopp@gmail.com",
        "fhorwitz@gmail.com",
        "maryhcpa@gmail.com",
        "dalech@comcast.net",
        "noelhowes@me.com",
        "johnmhub@msn.com",
        "fishtory@msn.com",
        "sghulsman@comcast.net",
        "vrisham@yahoo.com",
        "dayleellison@yahoo.com",
        "shaun@ivory.org",
        "jackson.geoffrey@gmail.com",
        "sjfoto1@gmail.com",
        "lolaj@outlook.com",
        "mikaelajang@gmail.com",
        "janbike@outlook.com",
        "aquaria@comcast.net",
        "tim.johnson.ing@outlook.com",
        "scott@kaz-fam.com",
        "jlkearney8@comcast.net",
        "mkeithly@outlook.com",
        "colleen.r.kelley@gmail.com",
        "ballardbiker13@gmail.com",
        "makelsey@comcast.net",
        "fernandokingsanchez@rocketmail.com",
        "midnitespirit65@gmail.com",
        "bruce.klouzal@comcast.net",
        "richknox@gmail.com",
        "john.knutzen@tetratech.com",
        "scott@scottkralik.org",
        "picalily@hotmail.com",
        "johnkugler@comcast.net",
        "takeo_kuraishi@yahoo.com",
        "larsensven@me.com",
        "tomandtrudylarson@gmail.com",
        "rlatino@live.com",
        "alan@seattlephoto.net",
        "chialoon@gmail.com",
        "jleeinwa@leesinwa.com",
        "lehmanj3@gmail.com",
        "fuzzyhornet@frontier.com",
        "billjodylemke@gmail.com",
        "windsorlewis@live.com",
        "lindseth@uw.edu",
        "liu_bin@outlook.com",
        "alohrmann1@gmail.com",
        "cascade.cyclist@gmail.com",
        "andra@fastmail.com",
        "mmclum@gmail.com",
        "kcbuddee@me.com",
        "patty.lyman@gmail.com",
        "ablynch@gmail.com",
        "wilfried.mack@gmail.com",
        "donmartin@raincity.com",
        "mlm01140@gmail.com",
        "hdavidmattson@gmail.com",
        "jowen1838@hotmail.com",
        "dawnapril9@yahoo.com",
        "cameron.mclean@gmail.com",
        "marc.means@live.com",
        "pam.means@live.com",
        "albert.meerscheidt@gmail.com",
        "tmeloy10@gmail.com",
        "kenjmeyer@outlook.com",
        "amiller7x7@comcast.net",
        "keithcorndog@gmail.com",
        "marizel.miller@gmail.com",
        "samanddiedrich@comcast.net",
        "millhollens@yahoo.com",
        "sbmitchell@comcast.net",
        "blmix@mindspring.com",
        "dmmoise@gmail.com",
        "jouster1@hotmail.com",
        "marg2009@comcast.net",
        "jmoormeier@mac.com",
        "mfmoreland166@yahoo.com",
        "marijmorgan@comcast.net",
        "bmoss12157@gmail.com",
        "rgmoul@comcast.net",
        "johnjaymullins@hotmail.com",
        "alicia.the.airplane@gmail.com",
        "tmurison@hotmail.com",
        "sandilnavarro@aol.com",
        "c.h.nelson@hotmail.com",
        "jtcnelson@gmail.com",
        "nelson141@zazzo.com",
        "miken@tta-group.com",
        "tniebling@gmail.com",
        "renussbaum@outlook.com",
        "sean.m.obrien@gmail.com",
        "djoda2@gmail.com",
        "likhi.ondov@gmail.com",
        "ronishi@comcast.net",
        "dave.owen.gm@gmail.com",
        "jpearlsea@gmail.com",
        "me@julip.co",
        "danelmanperry@hotmail.com",
        "piper.peterson1@gmail.com",
        "trp893@gmail.com",
        "valarindri@gmail.com",
        "salponce@gmail.com",
        "jeffreytpowers@gmail.com",
        "mrahim@cascade.org",
        "merlinrain@gmail.com",
        "balr@icloud.com",
        "grajkovic@gmail.com",
        "bread-man@hotmail.com",
        "aaronbobby.tr@gmail.com",
        "davereid88@gmail.com",
        "reid.lily@gmail.com",
        "dorothe.nl@gmail.com",
        "mary.remoaldo@gmail.com",
        "kathyreynolds578@gmail.com",
        "josephr+rl@cascade.org",
        "josephr+rla@cascade.org",
        "josephr5000@yahoo.com",
        "josephr5000+rla@gmail.com",
        "wmrohay@gmail.com",
        "brendar13511@gmail.com",
        "robert.rozycki@gmail.com",
        "philip.rueker@live.com",
        "csackett49@comcast.net",
        "dsandovalpoc@gmail.com",
        "lizsanocki@hotmail.com",
        "patty.sather@outlook.com",
        "heidikschillinger@gmail.com",
        "mschill1972@yahoo.com",
        "rschranck@gmail.com",
        "cwsbike@yahoo.com",
        "schutteconnie@gmail.com",
        "writeforsales@gmail.com",
        "dselk@msn.com",
        "chiyaoshih@yahoo.com",
        "nwtarheelrunner@yahoo.com",
        "petra.silverstein@yahoo.com",
        "pasinger@comcast.net",
        "dskurnik@gmail.com",
        "gregskyles@gmail.com",
        "slonimfamily@comcast.net",
        "dottiezsmith@yahoo.com",
        "smith.lyssa@gmail.com",
        "iamkimbo@hotmail.com",
        "lois.smith317@gmail.com",
        "saulsnatsky@comcast.net",
        "rls3213@yahoo.com",
        "paulsoreff@icloud.com",
        "unadvertised@hotmail.com",
        "chris.c.stewart@kp.org",
        "jeffstew1@hotmail.com",
        "lorrainevstewart@hotmail.com",
        "skycaptaintwo@gmail.com",
        "pers@raincity.com",
        "shanavt@raincity.com",
        "bobco85@gmail.com",
        "notathotmailoryahoo@gmail.com",
        "b_tannenbaum@yahoo.com",
        "kentenure@msn.com",
        "admin@cascade.org",
        "cascadewaiver@cascadebicycleclub.org",
        "lindavt22@gmail.com",
        "davethorbeck@hotmail.com",
        "machikoshoji@yahoo.com",
        "mupsall1949@gmail.com",
        "davidu@cascade.org",
        "prurton2@comcast.net",
        "prurton@comcast.net",
        "bvandroo@comcast.net",
        "paulverm@gmail.com",
        "coryvolkert@outlook.com",
        "justimagineglass@comcast.net",
        "voltadh@gmail.com",
        "voltaji@yahoo.com",
        "alexa.volwiler@gmail.com",
        "me@carlwainwright.com",
        "discoumpire@gmail.com",
        "johnweller46@msn.com",
        "johnweller46-rl@msn.com",
        "gailnew.9752@gmail.com",
        "lfweppler@gmail.com",
        "rockylwhite@gmail.com",
        "awilliams53@gmail.com",
        "s.williamson@comcast.net",
        "tinamwilliamson1@gmail.com",
        "jack_on_cbr1000burner@yahoo.com",
        "rickwiltfong@gmail.com",
        "happybeingme@live.com",
        "tcwithington@mac.com",
        "ampfrog001@gmail.com",
        "richardjaywolf@gmail.com",
        "matthew.wong@comcast.net",
        "mdwong2004@yahoo.com",
        "cjworthen@comcast.net",
        "vaelin4@gmail.com",
        "raymartial@hotmail.com",
        "wangcyeung@yahoo.com",
        "zabo999@gmail.com",
        "juli@pacificgp.com",
        "mnjzils@comcast.net",
        "garyzuk@gmail.com",
        "bruce_zunser@hotmail.com",
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
