// main.js
define([
    'jquery',
    'json.sortify',
    '/bower_components/nthen/index.js',
    '/common/sframe-common.js',
    '/common/sframe-app-framework.js',
    '/common/common-util.js',
    '/common/common-hash.js',
    '/common/common-interface.js',
    '/common/modes.js',
    '/customize/messages.js',
    'css!/calendar/calendar.css',
    'less!/calendar/app-calendar.less'
], function (
    $,
    Sortify,
    nThen,
    SFCommon,
    Framework,
    Util,
    Hash,
    UI,
    Modes,
    Messages
    )
{

    var verbose = function (x) { console.log(x); };
    verbose = function () {}; // comment out to enable verbose logging

    // Calendar code
    var initCalendar = function (framework, calendar) {
        var defaultCalendar = [];

        if (!calendar) {
            verbose("Initializing with default calendar content");
            calendar = defaultCalendar;
        } else {
            verbose("Initializing with calendar content " + calendar);
        }

        return calendar; 
    };

    var mkHelpMenu = function (framework) {
        var $toolbarContainer = $('#cp-app-calendar-container');
        var helpMenu = framework._.sfCommon.createHelpMenu(['calendar']);
        $toolbarContainer.prepend(helpMenu.menu);

        framework._.toolbar.$drawer.append(helpMenu.button);
    };

    // Start of the main loop
    var andThen2 = function (framework) {

        var calendar;
        var $container = $('#cp-app-calendar-content');

        mkHelpMenu(framework);

        if (framework.isReadOnly()) {
            $container.addClass('cp-app-readonly');
        } else {
            framework.setFileImporter({}, function (content /*, file */) {
                var parsed;
                try { parsed = JSON.parse(content); }
                catch (e) { return void console.error(e); }
                return { content: parsed };
            });
        }

        framework.setFileExporter('json', function () {
            return new Blob([JSON.stringify("")], {
                type: 'application/json',
            });
        });

        framework.onEditableChange(function (unlocked) {
            if (framework.isReadOnly()) { return; }
        });

        framework.onContentUpdate(function (newContent) {
            // Init if needed
            if (!calendar) {
                calendar = initCalendar(framework, (newContent || {}).content);
                return;
            }

            // Need to update the content
            verbose("Content should be updated to " + newContent);
            var currentContent = "" // getBoardsJSON();
            var remoteContent = newContent.content;

            if (Sortify(currentContent) !== Sortify(remoteContent)) {
                // reinit calendar (TODO: optimize to diff only)
                verbose("Content is different.. Applying content");
            }
        });

        framework.setContentGetter(function () {
            if (!calendar) {
                return {
                    content: []
                };
            }
            var content = ""; 
            verbose("Content current value is " + content);
            return {
                content: content
            };
        });

        framework.onReady(function () {
        });

        framework.onDefaultContentNeeded(function () {
            calendar = initCalendar(framework);
        });

        framework.start();
    };

    var main = function () {
        // var framework;
        nThen(function (waitFor) {

            // Framework initialization
            var framework = Framework.create({
                toolbarContainer: '#cme_toolbox',
                contentContainer: '#cp-app-calendar-editor',
            }, waitFor(function (framework) {
                andThen2(framework);
            }));
            window.frames[0].window.cryptpad = framework;
        });
    };
    main();
});
