import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";

type MaybeCartesApiException = {
    code?: unknown;
    status?: unknown;
    message?: unknown;
    details?: unknown;
};

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const isCartesApiException = (error: unknown): error is MaybeCartesApiException => {
    if (!isObject(error)) return false;

    // loose guard: apiFetch rejects raw JSON objects
    return "code" in error && "status" in error;
};

const isAuthError = (error: unknown): boolean => {
    if (!isCartesApiException(error)) return false;

    return error.code === 401;
};

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (isAuthError(error)) return false;

                // 2 retries (3 attempts total)
                return failureCount < 2;
            },
        },
    },
});

export const persister = createAsyncStoragePersister({
    storage: window.localStorage,
});
