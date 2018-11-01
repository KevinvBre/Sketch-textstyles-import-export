
/*  Default */

function openUrlInBrowser(url) {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
}
function website(context) {
    console.log("open");
    openUrlInBrowser("http://kevinvanbreemaat.nl/");
    ga(context, "HelpRename");
};



/*

    Everything below this line except the trackingID is a copy paste from:
    https://github.com/Ashung/Automate-Sketch

*/


function ga(context, eventCategory) {

    var trackingID = "UA-25194603-2";

    var uuidKey = "google.analytics.uuid";
    var uuid = NSUserDefaults.standardUserDefaults().objectForKey(uuidKey);
    if (!uuid) {
        uuid = NSUUID.UUID().UUIDString();
        NSUserDefaults.standardUserDefaults().setObject_forKey(uuid, uuidKey);
    }

    var appName = encodeURI(context.plugin.name()),
        appId = context.plugin.identifier(),
        appVersion = context.plugin.version();

    var url = "https://www.google-analytics.com/collect?v=1";
    // Tracking ID
    url += "&tid=" + trackingID;
    // Source
    url += "&ds=sketch" + MSApplicationMetadata.metadata().appVersion;
    // Client ID
    url += "&cid=" + uuid;
    // User GEO location
    url += "&geoid=" + NSLocale.currentLocale().countryCode();
    // User language
    url += "&ul=" + NSLocale.currentLocale().localeIdentifier().toLowerCase();
    // pageview, screenview, event, transaction, item, social, exception, timing
    url += "&t=event";
    // App Name
    url += "&an=" + appName;
    // App ID
    url += "&aid=" + appId;
    // App Version
    url += "&av=" + appVersion;
    // Event category
    url += "&ec=" + encodeURI(eventCategory);
    // Event action
    // url += "&ea=" + encodeURI(eventAction);
    url += "&ea=" + encodeURI(context.command.identifier());
    // Event label
    // if (eventLabel) {
    //     url += "&el=" + encodeURI(eventLabel);
    // }
    // Event value
    // if (eventValue) {
    //     url += "&ev=" + encodeURI(eventValue);
    // }

    var session = NSURLSession.sharedSession();
    var task = session.dataTaskWithURL(NSURL.URLWithString(NSString.stringWithString(url)));
    task.resume();

}
