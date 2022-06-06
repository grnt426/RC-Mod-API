/**
 * The below are all the currently expected functions and properties of a mod. Functions not of this form will not
 * be called by the HookDispatcher.
 *
 * NOTE: The below API is extremely unstable, and subject to rapid change and iteration. It is new, after all :)
 */
class ModPrototype {

    constructor() {
        this.name = "ModPrototype";
    }

    /**
     * Called when the game has finished the init setup for a game; not when the Rising Constellation application
     * has loaded. This is useful for mod authors that need to do something only after a game is initialized
     * and not in the constructor.
     */
    gameLoaded() {

    }

    /**
     * When the user attempts to send a chat message, this will be called on all implementing mods to give them a chance
     * to intercept the message as a command.
     *
     * @param data  The chat message the user was trying to send.
     * @returns {boolean}   Mods should return TRUE if they attempted processing of the command as it at least partially
     *                      matched the mod's basic structure for a command. FALSE if the message was not applicable
     *                      to the mod.
     */
    chatMessage(data) {
        return false;
    }

    /**
     * Called when an incremental update is made to the game state just after it arrives from the authoritative game
     * server. NOTE: this is called *before* the game has a chance to process the update.
     *
     * @param data  The contents of the incremental update.
     */
    update(data) {

    }
}