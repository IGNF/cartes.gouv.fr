import { useCallback, useEffect, useRef, useState } from "react";

import {
    EventSourceError,
    EventSourceEventHandlers,
    EventSourceEventMap,
    EventSourceStatus,
    UseEventSourceOptions,
    UseEventSourceResult,
} from "./useEventSource.types";

const MESSAGE_EVENT_NAME = "message";

const getNamedEventNames = <TEvents extends EventSourceEventMap>(handlers: EventSourceEventHandlers<TEvents>): string[] => {
    const eventNames = new Set<string>();

    Object.keys(handlers).forEach((name) => {
        if (name !== MESSAGE_EVENT_NAME) {
            eventNames.add(name);
        }
    });

    return [...eventNames];
};

const useEventSource = <TEvents extends EventSourceEventMap>(options: UseEventSourceOptions<TEvents>): UseEventSourceResult => {
    const { url, autoConnect = false, withCredentials = false, handlers = {}, onError } = options;

    const [status, setStatus] = useState<EventSourceStatus>("idle");
    const [error, setError] = useState<EventSourceError | null>(null);

    const eventSourceRef = useRef<EventSource | null>(null);
    // On garde les callbacks à jour sans rouvrir le flux à chaque render.
    const handlersRef = useRef<EventSourceEventHandlers<TEvents>>(handlers);
    const onErrorRef = useRef<UseEventSourceOptions<TEvents>["onError"]>(onError);
    const namedListenersRef = useRef<Map<string, (event: Event) => void>>(new Map());

    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    const emitError = useCallback((error: EventSourceError): void => {
        setError(error);
        onErrorRef.current?.(error);
    }, []);

    const closeSource = useCallback((): void => {
        const source = eventSourceRef.current;

        if (!source) {
            return;
        }

        namedListenersRef.current.forEach((listener, eventName) => {
            source.removeEventListener(eventName, listener as EventListener);
        });

        namedListenersRef.current.clear();
        source.onopen = null;
        source.onmessage = null;
        source.onerror = null;
        source.close();
        eventSourceRef.current = null;
    }, []);

    const connect = useCallback((): void => {
        if (!url) {
            setStatus("error");
            emitError({
                type: "configuration",
                message: "URL SSE manquante.",
            });

            return;
        }

        if (eventSourceRef.current) {
            return;
        }

        setStatus("connecting");
        setError(null);

        const source = new EventSource(url, { withCredentials });
        eventSourceRef.current = source;

        const handleEvent = (eventName: string, event: MessageEvent<string>): void => {
            const handler = handlersRef.current[eventName as keyof TEvents];

            let payload: unknown;

            try {
                payload = JSON.parse(event.data);
            } catch (error) {
                emitError({
                    type: "parse",
                    message: `Impossible d'interpréter l'événement SSE "${eventName}".`,
                    eventName,
                    cause: error,
                });

                return;
            }

            if (handler) {
                (handler as (payload: unknown, rawEvent: MessageEvent<string>) => void)(payload, event);
            }
        };

        source.onopen = () => {
            setStatus("open");
        };

        source.onmessage = (event) => {
            handleEvent(MESSAGE_EVENT_NAME, event as MessageEvent<string>);
        };

        getNamedEventNames(handlersRef.current).forEach((eventName) => {
            const listener = (event: Event) => {
                handleEvent(eventName, event as MessageEvent<string>);
            };

            namedListenersRef.current.set(eventName, listener);
            source.addEventListener(eventName, listener);
        });

        source.onerror = () => {
            setStatus("error");
            emitError({
                type: "connection",
                message: "La connexion SSE a été interrompue.",
            });

            // On coupe explicitement le flux pour garder un cycle de vie déterministe côté React.
            closeSource();
        };
    }, [closeSource, emitError, url, withCredentials]);

    const disconnect = useCallback((): void => {
        closeSource();
        setStatus("closed");
    }, [closeSource]);

    useEffect(() => {
        if (!autoConnect) {
            return;
        }

        connect();

        return () => {
            closeSource();
        };
    }, [closeSource, connect, autoConnect]);

    useEffect(() => {
        return () => {
            closeSource();
        };
    }, [closeSource]);

    return {
        status,
        error,
        connect,
        disconnect,
    };
};

export default useEventSource;
