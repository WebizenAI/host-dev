import Vue from 'vue';

import { Store } from 'vuex';

export default abstract class Service {

    protected app: Vue;

    public readonly ready: Promise<void>;

    constructor(app: Vue, ...args: any[]) {
        this.app = app;

        // defer calling init() until constructor has completed
        this.ready = Promise.resolve().then(() => this.init(...args));
    }

    public async destroy(): Promise<void> {
        this.unregisterStoreModule(this.app.$store);
    }

    protected async init(...args: any[]): Promise<void> {
        this.registerStoreModule(this.app.$store);
    }

    protected registerStoreModule(store: Store<any>): void {
        // override to initialize vuex module
    }

    protected unregisterStoreModule(store: Store<any>): void {
        // override to remove vuex module
    }

}