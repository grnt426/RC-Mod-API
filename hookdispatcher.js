let fs = require("fs");

class HookDispatcher {
    constructor() {
        this.modHooks = window.granite.mods.hooks;
        this.SCANNED_MODS_FILES = [];
        this.KNOWN_HOOKS = ["update"]
        this.fatal = false;

        // This relative path assumes we are starting from the root directory where the executable is running.
        // It seems the FS lib starts from the exe rather than where the js file is located on disk.
        this.SOURCE_DIR = "./dist/main/";

        this.#setupLogging(this.SOURCE_DIR);

        // Load the mods last, after we have prepared everything else, so they can use any APIs that might need to be
        // instantiated first
        fs.readdir(this.SOURCE_DIR, (err, files) => {
            files.forEach(file => {
                if(file.indexOf("mod.js") !== -1) {
                    this.SCANNED_MODS_FILES.push(file);

                    // while dynamic import is a Promise and failures within the Promise won't bubble out to here,
                    // there could be other failures I don't know about and so am defensively guarding against that
                    try {
                        import("./" + file)
                            .then(mod => {
                                // success. Mod should load itself into window.hooks
                                window.granite.debug("Successfully loaded " + file);
                            })
                            .catch(err => {
                                // ignoring
                                window.granite.debug(
                                    "ERROR: Failed to load mod '" + file + "'. Reason: " + err,
                                    window.granite.levels.ERROR);
                            });
                    }
                    catch(err) {
                        // This should basically be impossible
                        window.granite.debug("FATAL: FAILED IN LOADING MODS. " + err, window.granite.levels.ERROR);
                        this.fatal = true;
                    }
                }
            });
        });
    }

    #setupLogging(dir) {
        this.logFileLoc = dir + "rc_mod.log";

        this.logFile = false;
        fs.open(this.logFileLoc, "a+", (err, f) => {
            if(err) {
                window.console.error("Failed to open log file: " + err);
            }
            else {
                this.logFile = f;

                // We need to set this somewhere we can globally access it, as the #debug function defined here will
                // lose its `this` context and won't be able to find this.logFile.
                window.granite.mods.logFile = f;
            }
        });

        window.granite.levels = {DEBUG:"debug", INFO:"info", ERROR:"error"};
        window.granite.debug = this.#debug;
    }

    /**
     * Handles parsing chat messages, which is different from `hook()`. This one allows multiple mods to intercept and
     * listen for chat commands. If any of the mods processed the message as a command, this will prevent the client
     * from sending the chat message to everyone else.
     *
     * @param message  The Chat object, containing the message to be sent.
     * @returns {boolean} True if the chat message should be sent as a regular message. False if the message shouldn't
     * be sent to the server for everyone else to see.
     */
    chat(message) {

        // If something terrible happened while trying to load mods, process none of them.
        if(this.fatal) {
            return true;
        }

        // We don't want to bother with overly short messages
        if(!message || message.length < 2) {
            return true;
        }

        // Ignore messages without a slash at the front
        if(message[0] !== "/") {
            return true;
        }

        let processed = false;

        let data = message.substring(1, message.length);;

        // Give this chat message to all mods
        this.modHooks.forEach(m => {

            // If a listener doesn't implement the function, we silently ignore the listener and move on
            if(m.chatMessage) {
                try {
                    processed |= m.chatMessage(data);
                }
                catch(err) {

                    // We ignore all failures within hook handlers. This isolates failing mods from the rest
                    window.granite.debug(
                        "ERROR in dispatching chatMessage for mod " + m.name + ". " + err,
                        window.granite.levels.ERROR
                    );
                }
            }
        });

        // If we processed the message, we DON'T want it to get sent, thus we return the inverse. We also DON'T want
        // the message to go through if the message starts with a slash. If a user installs mods that handle commands,
        // but they fail to load, then that intent for a command will be ignored.
        // TODO: Need to indicate failure to process a command to the user, somehow?
        return message[0] !== "/" || !processed;
    }

    /**
     * Dispatches the given function to all listeners if they implement it.
     *
     * @param data  Any data to send to listeners.
     * @param func  String name of the function to call.
     */
    hook(data, func) {

        // If something terrible happened while trying to load mods, process none of them.
        if(this.fatal) {
            return;
        }

        // Defensively verify the requested function is known to be good before trying to run it against listeners.
        if(this.KNOWN_HOOKS.includes(func)) {

            // We will apply this update to all listeners, regardless if they can consume it or not, for simplicity
            this.modHooks.forEach(m => {
                let fn = m[func];

                // If a listener doesn't implement the function, we silently ignore the listener and move on
                if(fn) {
                    try {
                        fn.apply(m, [data]);
                    }
                    catch(err) {
                        // We ignore all failures within hook handlers. This isolates failing mods from the rest
                        window.granite.debug(
                            "ERROR in dispatching hook for mod " + m.name + ". " + err,
                            window.granite.levels.ERROR
                        );
                    }
                }
            });
        }
    }

    /**
     * Splits messages to both a log file and the console, at the appropriate log level.
     * @param message   The string to be logged to console and log file.
     * @param level     The level to log at. DEBUG, INFO, or ERROR.
     */
    #debug(message, level=window.granite.levels.INFO) {
        let levelString = " [INFO] ";
        let func = window.console.info;

        switch(level) {
            case window.granite.levels.INFO: break;
            case window.granite.levels.DEBUG: func = window.console.debug; levelString = " [DEBUG] "; break;
            case window.granite.levels.ERROR: func = window.console.error; levelString = " [ERROR] "; break;
            default: window.console.error("Unknown type in parsing logging level : " + level);
        }

        let log = new Date().toISOString() + levelString + message + "\n";

        func(message);

        let fd = window.granite.mods.logFile;
        if(fd) {
            fs.write(fd, log, err => {
                if(err) {
                    window.console.error("Failed in writing to logfile! " + err);
                }
            });
        }
    }
}

window.granite.dispatcher = new HookDispatcher();