import Vue from 'vue';

import List from '@/models/soukai/List';
import Task from '@/models/soukai/Task';
import Workspace from '@/models/soukai/Workspace';

import EventBus from '@/utils/EventBus';

declare global {

    interface TestingRuntime {
        instance: Vue;
        eventBus: typeof EventBus;
        start(): Promise<void>;
        require(name: string): any;
        createWorkspace(name: string, storage?: string): Promise<Workspace>;
        createList(workspace: Workspace, name: string): Promise<List>;
        createTask(list: List, name: string): Promise<Task>;
    }

    interface Window {
        Runtime?: TestingRuntime;
    }

}
