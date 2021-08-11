document.body.onload = function() 
{
    LoadValuesToDocument();
    document.getElementById("versionPlaceholder").innerText = " v" + chrome.runtime.getManifest().version;
}

document.getElementById("applysettings").onclick = function() 
{
    StoreValuesFromDocument();
    window.close();
}

document.getElementById("cancelsettings").onclick = function() 
{
    window.close();
}

document.getElementById("resetdefaults").onclick = function() 
{
    ResetDefaults()
}

document.getElementById("opentokenhelpdialog").onclick = function() 
{
    var dialog = document.getElementById("tokenhelpdialog"); 
    dialog.show(); 
}

document.getElementById("closetokenhelpdialog").onclick = function() 
{
    var dialog = document.getElementById("tokenhelpdialog"); 
    dialog.close(); 
}


