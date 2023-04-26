function interopOverride(InteropBroker, provider, options, ...args) {
    class InteropOverride extends InteropBroker {
        constructor() {
            super();
        }
    }

    return new InteropOverride(provider, options, ...args);
}

fin.Platform.init({ interopOverride });