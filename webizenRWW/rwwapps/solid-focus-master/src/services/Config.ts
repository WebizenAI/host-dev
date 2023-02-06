import Service from '@/services/Service';

export default class Config extends Service {

    public environment!: string;

    public version!: string;

    public get isDevelopment(): boolean {
        return this.environment === 'development';
    }

    protected async init(): Promise<void> {
        await super.init();

        this.environment = process.env.NODE_ENV as string;

        this.version = process.env.VUE_APP_VERSION + (this.isDevelopment ? '-next' : '');
    }

}
