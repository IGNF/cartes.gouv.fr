import { KeyValuesForm } from "@/components/Input/KeyValueList";

type Data = (string | null)[] | Record<string, string | null>;

export function useKeyValue(data: Data) {
    const useKeys = !(data instanceof Array);
    return {
        keyValue: {
            useKeys,
            values:
                data instanceof Array
                    ? data.map((item) => ({ key: item ?? "", value: item ?? "" }))
                    : Object.entries(data).map(([key, value]) => ({ key, value: value ?? "" })),
        },
        transformKeyValue: ({ useKeys, values }: KeyValuesForm): Data =>
            useKeys ? Object.fromEntries(values.map(({ key, value }) => [key, value || null])) : values.map(({ value }) => value || null),
    };
}
