class MyMod {
    constructor() {
        this.hello = 1;
        window.granite.debug("Example mod has loaded! " + this.hello);
    }

    update(update) {
        // Do something!
    }
}

window.granite.addHookListener(new MyMod());