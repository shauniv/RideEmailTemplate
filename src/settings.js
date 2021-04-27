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

