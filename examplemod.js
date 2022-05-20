class MyMod {
    constructor() {
        this.hello = 1;
        console.log("Example mod has loaded!");
    }

    update(update) {
        // Do something!
    }
}

window.granite.addHookListener(new MyMod());