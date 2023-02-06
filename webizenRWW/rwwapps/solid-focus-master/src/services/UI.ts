import { Component, AsyncComponent } from 'vue';
import { SolidModel } from 'soukai-solid';
import { Store } from 'vuex';

import Service from '@/services/Service';

import Arr from '@/utils/Arr';
import AsyncOperation from '@/utils/AsyncOperation';
import UUIDGenerator from '@/utils/UUIDGenerator';

import Alert from '@/dialogs/Alert.vue';
import Confirm from '@/dialogs/Confirm.vue';
import Loading from '@/dialogs/Loading.vue';

import Styles, { StyleVariables } from '@/styles/variables';

interface State {
    dialogs: Dialog[];
    snackbar: Snackbar | null;
    navigationDrawerOpen: boolean;
}

export enum Layout {
    Mobile = 'mobile',
    Tablet = 'tablet',
    Desktop = 'desktop',
}

export interface Dialog {
    id: string;
    component: Component | AsyncComponent;
    props: { [property: string]: any };

    reject(...args: any[]): void,
    resolve(...args: any[]): void,
}

export interface Snackbar {
    message: string;
    loading?: boolean;
}

export default class UI extends Service {

    private loadingDialogID: string | null = null;

    public get layout(): Layout {
        return this.mobile ? Layout.Mobile : null
            || this.tablet ? Layout.Tablet : null
            || Layout.Desktop;
    }

    public get mobile(): boolean {
        return this.app.$vuetify.breakpoint.xs;
    }

    public get tablet(): boolean {
        return this.app.$vuetify.breakpoint.sm;
    }

    public get desktop(): boolean {
        return this.app.$vuetify.breakpoint.mdAndUp;
    }

    public get dialogs(): Dialog[] {
        return this.app.$store.state.ui.dialogs;
    }

    public get snackbar(): Snackbar | null {
        return this.app.$store.state.ui.snackbar;
    }

    public get toolbarHeight(): number {
        return this.mobile ? 56 : 64;
    }

    public get navigationDrawerOpen(): boolean {
        return this.app.$store.state.ui.navigationDrawerOpen;
    }

    public get styles(): StyleVariables {
        return Styles;
    }

    public get mobileBreakpoint(): number {
        return 600;
    }

    public showLoading(message: string | null = null): void {
        if (this.loadingDialogID === null) {
            this.openDialog(Loading, message ? { message } : {});
            this.loadingDialogID = Arr.last(this.dialogs).id;
        }
    }

    public hideLoading(): void {
        if (this.loadingDialogID !== null) {
            this.completeDialog(this.loadingDialogID);
            this.loadingDialogID = null;
        }
    }

    public showError(error: any): void {
        this.openDialog(Alert, {
            type: 'error',
            title: 'Error',
            message: typeof error === 'string'
                ? error
                : error.message || 'Unknown Error',
        });
    }

    public confirm(message: string, confirmLabel?: string): Promise<boolean> {
        return this.openDialog(Confirm, {
            message,
            confirmLabel,
        });
    }

    public openDialog(
        component: Component | AsyncComponent,
        props: { [property: string]: any } = {},
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            const dialog: Dialog = {
                id: UUIDGenerator.generate(),
                component,
                props,
                resolve,
                reject,
            };

            this.app.$store.commit('addDialog', dialog);
        });
    }

    public closeDialog(id: string, ...args: any[]): void {
        for (const dialog of this.dialogs) {
            if (dialog.id === id) {
                dialog.reject(...args);
                break;
            }
        }

        this.app.$store.commit('removeDialog', id);
    }

    public completeDialog(id: string, ...args: any[]): void {
        for (const dialog of this.dialogs) {
            if (dialog.id === id) {
                dialog.resolve(...args);
                break;
            }
        }

        this.app.$store.commit('removeDialog', id);
    }

    async updateModel<Model extends SolidModel>(
        model: Model,
        update: (model: Model) => Promise<any> | any,
        affectedAttributes: string[] = [],
    ): Promise<void> {
        const operation = new AsyncOperation();
        const initialAttributes = affectedAttributes.map(attribute => model.getAttribute(attribute));

        try {
            operation.start();

            await update(model);
            await model.save();

            operation.complete();
        } catch (error) {
            operation.fail(error);

            // TODO implement this.task.setAttributes(originalAttributes); in soukai
            affectedAttributes.forEach((attribute, index) => {
                model.setAttribute(attribute, initialAttributes[index]);
            });
        }
    }

    public async wrapAsyncOperation(
        operation: Promise<any> | (() => Promise<any>),
        message: string | null = null
    ): Promise<any> {
        this.showLoading(message);

        try {
            const promise = typeof operation === 'function' ? operation() : operation;
            const result = await promise;

            this.hideLoading();

            return result;
        } catch (error) {
            this.hideLoading();
            this.showError(error);
        }
    }

    public showSnackbar(snackbar: Snackbar): void {
        this.app.$store.commit('setSnackbar', snackbar);
    }

    public hideSnackbar(): void {
        this.app.$store.commit('setSnackbar', null);
    }

    public setNavigationDrawerOpen(open: boolean): void {
        this.app.$store.commit('setNavigationDrawerOpen', open);
    }

    public toggleNavigationDrawer(): void {
        this.app.$store.commit('setNavigationDrawerOpen', !this.navigationDrawerOpen);
    }

    protected registerStoreModule(store: Store<State>): void {
        store.registerModule('ui', {
            state: {
                dialogs: [],
                snackbar: null,
                navigationDrawerOpen: false,
            },
            mutations: {
                addDialog(state: State, dialog: Dialog) {
                    state.dialogs.push(dialog);
                },
                removeDialog(state: State, id: string) {
                    for (const dialog of state.dialogs) {
                        if (dialog.id === id) {
                            state.dialogs.splice(state.dialogs.indexOf(dialog), 1);
                            break;
                        }
                    }
                },
                setSnackbar(state: State, snackbar: Snackbar | null) {
                    state.snackbar = snackbar;
                },
                setNavigationDrawerOpen(state: State, open: boolean) {
                    state.navigationDrawerOpen = open;
                },
            },
        });
    }

    protected unregisterStoreModule(store: Store<State>): void {
        store.unregisterModule('ui');
    }

}
