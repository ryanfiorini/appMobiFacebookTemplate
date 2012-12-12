-------------------------------------------
appMobiFacebookTemplate Readme:
-------------------------------------------


This template will pull down an AppMobiPage.xaml and the necessary HTML content placed in a HTML folder.  

* You will need to update the WMAppManifest.xml in the Properties folder.  Change the Navigation Page to AppMobiPage.xaml.

    In the OnLaunched method of the App.xaml.cs file change the rootFrame from MainPage to AppMobiPage.  

    if (!rootFrame.Navigate(typeof(AppMobiPage), args.Arguments))

    Add using AppMobiWindow8Template; to the top of App.xaml.cs file.

   
Other appMobi WP8 Templates:
    Install-Package AppMobiWindows8JqMobiTemplate
    Install-Package AppMobiWindows8DirectCanvasTemplate
    Install-Package AppMobiWindows8BlankTemplate
    Install-Package AppMobiWindows8FacebookTemplate
    Install-Package AppMobiWindows8JqMobiSimpleSampleTemplate


Developr Notes:
    html/_appMobi/window.js	- overwrites the alert, onerror event, console.log, console.warn, console.error as well as handle 
    MS Touch events.  Remove the script include in the index.html to revert back to device defaults.