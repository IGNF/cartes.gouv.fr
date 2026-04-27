export type EventSourceStatus = "idle" | "connecting" | "open" | "error" | "closed";

export type EventSourceEventMap = {
    message?: unknown;
} & Record<string, unknown>;

export type EventSourceErrorType = "configuration" | "connection" | "parse";

export type EventSourceError = {
    type: EventSourceErrorType;
    message: string;
    eventName?: string;
    cause?: unknown;
};

export type EventSourceEventHandlers<TEvents extends EventSourceEventMap> = {
    [K in keyof TEvents]?: (payload: TEvents[K], event: MessageEvent<string>) => void;
};

export type UseEventSourceOptions<TEvents extends EventSourceEventMap> = {
    url?: string;
    autoConnect?: boolean;
    withCredentials?: boolean;
    handlers?: EventSourceEventHandlers<TEvents>;
    onError?: (error: EventSourceError) => void;
};

export type UseEventSourceResult = {
    status: EventSourceStatus;
    error: EventSourceError | null;
    connect: () => void;
    disconnect: () => void;
};
