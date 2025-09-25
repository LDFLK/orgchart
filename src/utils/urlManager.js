class UrlManager{
    constructor(){
        this.componentConfigs = new Map();
        this.globalState = {};
        this.subscribers = new Set();
    }

    registerComponent(componentId, config){
        this.componentConfigs.set(componentId, {
            ...config,
            id: componentId
        })
    }

    generateUrl(baseUrl, params = {}){
        const url = new URL(baseUrl);

        Object.entries(params).forEach(([key, value]) => {
            if(value != null && value != undefined && value != ''){
                if(typeof value == 'Object'){
                    url.searchParams.set(key, JSON.stringify(value));
                } else {
                    url.searchParams.set(key, value.toString());
                }
            }
        });

        return url.toString();
    }

    parseUrl(urlString){
        try{
            const url = new URL(urlString);
            const params = {};

            url.searchParams.forEach((value, key) => {
                try{
                    params[key] = JSON.parse(value);
                } catch{
                    params[key] = value;
                }
            });

            return params;
        } catch {
            return {};
        }
    }

    getShareableState(componentId){
        const config = this.componentConfigs.get(componentId);
        if(!config) return null;

        const state = {};
        config.shareableKeys.forEach(key => {
            if(this.globalState[key] != undefined){
                state[key] = this.globalState[key];
            }
        });

        return state;
    }

    updateGlobalState(updates){
        this.globalState = {...this.globalState, ...updates};
        this.notifySubscribers();
    }

    subscribe(callback){
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notifySubscribers(){
        this.subscribers.forEach(callback => callback(this.globalState));
    }
}

export const urlManager = new UrlManager();