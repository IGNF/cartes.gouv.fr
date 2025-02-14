import { useTranslation } from "@/i18n";
import { useSnackbarStore } from "@/stores/SnackbarStore";

export function useCopyToClipboard() {
    const { t: tCommon } = useTranslation("Common");
    const setMessage = useSnackbarStore((state) => state.setMessage);

    return async (text: string, title?: string, description?: string, severity?: "info" | "success" | "warning" | "error") => {
        try {
            await navigator.clipboard.writeText(text);
            setMessage(title ?? tCommon("alert_copied"), description ?? tCommon("alert_copy_to_clipboard"), severity);
        } catch (e) {
            console.error(e);
        }
    };
}
