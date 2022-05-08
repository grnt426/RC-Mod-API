class MyMod {
    constructor() {
        this.hello = 1;
    }

    update(update) {
        window.granite.debug("Hello, World! " + update);
    }
}

window.granite.mods.hooks.push(new MyMod());