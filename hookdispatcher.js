class HookDispatcher {
    constructor() {
        this.modHooks = window.granite.mods.hooks;
        this.KNOWN_MODS = ["examplemod.js"];
        this.KNOWN_HOOKS = ["update"]
        this.fatal = false;

        this.KNOWN_MODS.forEach(modjs => {

            // while dynamic import is a Promise and failures within the Promise won't bubble out to here,
            // there could be other failures I don't know about and so am defensively guarding against that
            try {
                import("../../mods/" + modjs)
                    .then(mod => {
                        // success. Mod should load itself into window.hooks
                        window.granite.debug("Successfully loaded " + modjs);
                    })
                    .catch(err => {
                        // ignoring
                        window.granite.debug("ERROR: Failed to load mod '" + modjs + "'. Reason: " + err);
                    });
            }
            catch(err) {
                // This should basically be impossible
                window.granite.debug("FATAL: FAILED IN LOADING MODS. " + err);
                this.fatal = true;
            }
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
                        fn(data);
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