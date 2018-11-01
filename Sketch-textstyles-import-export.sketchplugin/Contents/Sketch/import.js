

var doc;
var sharedStyles;

function initVars(context) {
    doc = context.document;
    sharedStyles = doc.documentData().layerTextStyles()
}

function loadFonts(context, target) {

    console.log("");
    console.log("import loadFonts():");
    console.log("");

    initVars(context)
    var app = NSApp.delegate();
    var open = NSOpenPanel.openPanel();

    // Open file picker
    open.setAllowedFileTypes(["json"]);
    open.setCanChooseDirectories(true);
    open.setCanChooseFiles(true);
    open.setCanCreateDirectories(true);
    open.setTitle("Choose a file");
    open.setPrompt("Choose");
    open.runModal();

    var path = open.URLs().firstObject().path();
    var errorPtr = MOPointer.alloc().init()
    var fileContents = NSString.stringWithContentsOfFile_encoding_error(path, NSUTF8StringEncoding, errorPtr);
    var stylesContents = JSON.parse(fileContents);

    var styles = stylesContents.styles;
    var fonts = [];

    if (styles.length > 0) {
        for (var i = 0; i < styles.length; i++) {

            var size = styles[i].size;
            var family = styles[i].font;
            var name = styles[i].name;

            // console.log(family);
            var red = styles[i].color.red;
            var green = styles[i].color.green;
            var blue = styles[i].color.blue;
            var alpha = styles[i].color.alpha;

            var align = styles[i].alignment || 0;
            var spacing = styles[i].spacing || 0;
            var paragraphSpacing = styles[i].paragraphSpacing || 0;
            var lineHeight = styles[i].lineHeight || 0;

            var textTransform = styles[i].textTransform || 0;

            var strikethrough = styles[i].strikethrough || 0;
            var underline = styles[i].underline || 0;

            var rectTextFrame = NSMakeRect(0, 0, 250, 50);
            var newText = [[MSTextLayer alloc] initWithFrame:rectTextFrame];

            fonts.push(MSColor.colorWithRed_green_blue_alpha(red, green, blue, alpha))

            var color = fonts[i];

            newText.name = name;
            newText.stringValue = name + ' ' + size + 'px';
            newText.fontSize = size;
            newText.fontPostscriptName = family;

            if (isNaN(red) != true) {
                newText.textColor = color;
            } else {
                newText.textColor = MSColor.colorWithNSColor(NSColor.colorWithGray(0.0));
            }

            newText.textAlignment = align;
            [newText setCharacterSpacing: spacing];
            [newText setLineHeight: lineHeight];
            newText.addAttribute_value("MSAttributedStringTextTransformAttribute", textTransform)

            var paragraphStyle = newText.paragraphStyle();
            paragraphStyle.setParagraphSpacing(paragraphSpacing);
            newText.addAttribute_value("NSParagraphStyle", paragraphStyle);

            newText.addAttribute_value("NSStrikethrough", strikethrough);
            newText.addAttribute_value("NSUnderline", underline);

            checkForMatchingStyles(context, sharedStyles.objects(), name, newText.style());
            findLayersWithSharedStyleNamed_inContainer(context, newText.name() , newText.style())





            doc.reloadInspector()
        };

        [doc showMessage: 'Text style(s) are imported.']

    } else { NSApp.displayDialog("The file you're importing is empty."); }
}

function importFonts(context){
    loadFonts(context, "document");
    ga(context, "fontImport");
}

function checkForMatchingStyles(context, existingTextObjects, newStyleName, newStyle) {
    initVars(context)
    console.log("");
    console.log("import checkForMatchingStyles():");
    // console.log("existingTextObjects:");
    // console.log(existingTextObjects);
    console.log("");

    if (existingTextObjects.count() != 0) {
        for (var i = 0; i < existingTextObjects.count(); i++) {
            var existingName = existingTextObjects[i].name();
            var style = existingTextObjects.objectAtIndex(i);
            var textStyle;


            if(existingName == newStyleName) {
                existingTextObjects[i].updateToMatch(newStyle);
                existingTextObjects[i].resetReferencingInstances();
                return;
            }
        }

    }
}

var findLayersMatchingPredicate_inContainer_filterByType = function(context, predicate, container, layerType) {
    var scope;
    initVars(context)

    switch (layerType) {
        case MSPage :
            scope = doc.pages()
            return scope.filteredArrayUsingPredicate(predicate)
        break;

        case MSArtboardGroup :
            if(typeof container !== 'undefined' && container != nil) {
                if (container.className == "MSPage") {
                    scope = container.artboards()
                    return scope.filteredArrayUsingPredicate(predicate)
                }
            } else {
                // search all pages
                var filteredArray = NSArray.array()
                var loopPages = doc.pages().objectEnumerator(), page;
                while (page = loopPages.nextObject()) {
                    scope = page.artboards()
                    filteredArray = filteredArray.arrayByAddingObjectsFromArray(scope.filteredArrayUsingPredicate(predicate))
                }
                return filteredArray
            }
        break;

        default :
            if(typeof container !== 'undefined' && container != nil) {
                scope = container.children()
                return scope.filteredArrayUsingPredicate(predicate)
            } else {
                var filteredArray = NSArray.array()
                var loopPages = doc.pages().objectEnumerator(), page;
                while (page = loopPages.nextObject()) {
                    scope = page.children()
                    filteredArray = filteredArray.arrayByAddingObjectsFromArray(scope.filteredArrayUsingPredicate(predicate))
                }
                return filteredArray
            }
    }
    return NSArray.array() // Return an empty array if no matches were found
}

var findLayersWithSharedStyleNamed_inContainer = function(context, styleName, newStyle, container) {
    initVars(context)

    // Get sharedObjectID of shared style with specified name
    var allStyles = doc.documentData().layerTextStyles().objects()
    var styleSearchPredicate = NSPredicate.predicateWithFormat("name == %@", styleName)
    var filteredStyles = allStyles.filteredArrayUsingPredicate(styleSearchPredicate)

    var filteredLayers = NSArray.array()
    var loopStyles = filteredStyles.objectEnumerator(), style, predicate;

    while (style = loopStyles.nextObject()) {
        predicate = NSPredicate.predicateWithFormat("style.sharedObjectID == %@", style.objectID())
        filteredLayers = filteredLayers.arrayByAddingObjectsFromArray(findLayersMatchingPredicate_inContainer_filterByType(context, predicate, container))
    }

    for (var i = 0; i < filteredLayers.length; i++) {
        filteredLayers[i].setStyle(newStyle);
    }

    return filteredLayers
}


/*  Default */

function openUrlInBrowser(url) {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
}
function website(context) {
    console.log("open");
    openUrlInBrowser("http://kevinvanbreemaat.nl/");
    ga(context, "HelpTextJson   ");
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
