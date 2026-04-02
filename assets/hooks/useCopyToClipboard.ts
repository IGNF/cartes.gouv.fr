import { copyToClipboard } from "@/utils";
import { useEffect, useRef, useState } from "react";

export function useCopyToClipboard() {
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const timeout = useRef<NodeJS.Timeout>();

    async function copy(text: string) {
        try {
            await copyToClipboard(text);
            setCopiedText(text);
            clearTimeout(timeout.current);
            timeout.current = setTimeout(() => setCopiedText(null), 5000);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        return () => clearTimeout(timeout.current);
    }, []);

    return {
        copiedText,
        copied: Boolean(copiedText),
        copy,
    };
}
