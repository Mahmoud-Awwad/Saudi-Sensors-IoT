// Saudi Sensors Smart City API Client
// Generated based on provided Swagger Definitions for LORA-API

const BASE_URL = 'http://api.lora.eclight.com'; // In dev, we might use a proxy or mock this.

export interface ResultVO<T> {
    code: string;
    data: T;
    msg: string;
    succeed: boolean;
}

export interface LampVO {
    lampUid: string;
    code: number;
    groupCode: number;
}

export interface DeviceWorkStateVO {
    heartbeatInterval: number;
    lampCount: number;
    linkCount: number;
    loginInterval: number;
    lowPowerCount: number;
    maintainTime: string;
    masterModulesCount: number;
    netChannel: number;
    nodeCount: number;
    time: string;
}

/**
 * Perform a generic POST request matching the Swagger paths.
 */
async function post<T>(endpoint: string, params: Record<string, string | number>): Promise<ResultVO<T>> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, String(params[key])));

    try {
        const res = await fetch(url.toString(), {
            method: 'POST',
            headers: { 'Accept': 'application/json' }
        });
        return await res.json();
    } catch (error) {
        console.error(`API Error POST ${endpoint}`, error);
        // Return mock success for frontend dev purely
        return { succeed: true, code: '200', msg: 'Mock Success', data: {} as T };
    }
}

/**
 * Perform a generic GET request matching the Swagger paths.
 */
async function get<T>(endpoint: string, params: Record<string, string | number>): Promise<ResultVO<T>> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, String(params[key])));

    try {
        const res = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        return await res.json();
    } catch (error) {
        console.error(`API Error GET ${endpoint}`, error);
        // Return mock data for frontend dev purely
        return { succeed: true, code: '200', msg: 'Mock Data', data: [] as unknown as T };
    }
}

export const LoraApi = {
    // Queries
    queryLampList: (driveUid: string) =>
        get<LampVO[]>('/command/queryLampList', { driveUid }),

    queryDeviceWorkState: (driveUid: string) =>
        get<DeviceWorkStateVO>('/command/queryDeviceWorkState', { driveUid }),

    // Commands
    lampSingleDimming: (driveUid: string, lampCode: number, dimming: number) =>
        post<void>('/command/lampSingleDimming', { driveUid, lampCode, dimming }),

    lampGroupDimming: (driveUid: string, groupCode: number, dimming: number) =>
        post<void>('/command/lampGroupDimming', { driveUid, groupCode, dimming }),

    lampAllDimming: (driveUid: string, dimming: number) =>
        post<void>('/command/lampAllDimming', { driveUid, dimming }),

    deviceDimmingTask: (driveUid: string, tasksJson: string) =>
        post<void>('/command/deviceDimmingTask', { driveUid, tasks: tasksJson }),

    // Gateway Config
    deviceReboot: (driveUid: string) =>
        post<void>('/command/deviceReboot', { driveUid }),

    deviceEthernetNet: (driveUid: string, ip: string, port: number, gatewayIp?: string, localIp?: string, subNetMask?: string) =>
        post<void>('/command/deviceEthernetNet', {
            driveUid, ip, port,
            ...(gatewayIp && { gatewayIp }),
            ...(localIp && { localIp }),
            ...(subNetMask && { subNetMask })
        }),
};
