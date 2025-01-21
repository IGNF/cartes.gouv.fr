export interface INewAlert {
    title: string;
    description?: string;
    link: { url?: string; label?: string };
    severity: "info" | "warning" | "alert" | "weather-orange" | "weather-purple" | "weather-red" | "kidnapping" | "cyberattack" | "witness" | "attack";
    details: string;
    date: Date;
    visibility: {
        homepage: boolean;
        contact: boolean;
        map: boolean;
        serviceLevel: boolean;
    };
}

export interface IAlert extends INewAlert {
    id: string;
}
