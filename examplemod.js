class MyMod {
    constructor() {
        this.hello = 1;
    }

    update(update) {
        window.granite.debug("Hello, World! " + update);
    }
}

if(window.mods && Array.isArray(window.mods.hooks))
    window.mods.hooks.push(new MyMod());