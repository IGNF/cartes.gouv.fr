import { copyToClipboard } from "@/utils";
import { useEffect, useRef, useState } from "react";

export function useCopyToClipboard() {
    const [copied, setCopied] = useState(false);
    const timeout = useRef<NodeJS.Timeout>();

    async function copy(text: string) {
        try {
            await copyToClipboard(text);
            setCopied(true);
            clearTimeout(timeout.current);
            timeout.current = setTimeout(() => setCopied(false), 5000);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        return () => clearTimeout(timeout.current);
    }, []);

    return { copied, copy };
}
