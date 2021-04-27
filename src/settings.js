document.body.onload = function() 
{
    LoadValuesToDocument();
}

document.getElementById("applysettings").onclick = function() 
{
    StoreValuesFromDocument();
    window.close();
}

document.getElementById("resetdefaults").onclick = function() 
{
    ResetStorage();
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

