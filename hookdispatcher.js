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
                                window.granite.debug("ERROR: Failed to load mod '" + file + "'. Reason: " + err);
                            });
                    }
                    catch(err) {
                        // This should basically be impossible
                        window.granite.debug("FATAL: FAILED IN LOADING MODS. " + err);
                        this.fatal = true;
                    }
                }
            });
        });
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
                        window.granite.debug("ERROR in dispatching hook for mod " + m + ". " + err);
                    }
                }
            });
        }
    }
}

window.granite.dispatcher = new HookDispatcher();