import dayjs from 'dayjs';

import Auth from '@/services/Auth';
import Config from '@/services/Config';
import Service from '@/services/Service';
import Tasks from '@/services/Tasks';
import UI from '@/services/UI';
import Workspaces from '@/services/Workspaces';

declare module 'vue/types/vue' {

    interface Vue {
        $dayjs: typeof dayjs;
        $auth: Auth;
        $config: Config;
        $services: Service[];
        $tasks: Tasks;
        $ui: UI;
        $workspaces: Workspaces;
    }

    interface VueConstructor<V extends Vue = Vue> {
        instance: Vue;
    }

}
