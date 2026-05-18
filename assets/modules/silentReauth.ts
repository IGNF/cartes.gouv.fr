const SILENT_REAUTH_TIMEOUT_MS = 10_000;
const SILENT_REAUTH_MESSAGE_TYPE = "cgfr_silent_reauth";

/**
 * Tente une ré-authentification silencieuse via une iframe Keycloak (prompt=none).
 * Résout true si le cookie a été renouvelé, false si le SSO Keycloak est aussi expiré.
 */
export function attemptSilentReauth(): Promise<boolean> {
    return new Promise((resolve) => {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = "/login?prompt=none&silent=1";

        let done = false;

        const finish = (success: boolean) => {
            if (done) return;
            done = true;
            window.removeEventListener("message", onMessage);
            iframe.remove();
            resolve(success);
        };

        const onMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (!event.data || event.data.type !== SILENT_REAUTH_MESSAGE_TYPE) return;
            finish(event.data.status === "ok");
        };

        window.addEventListener("message", onMessage);
        document.body.appendChild(iframe);
        setTimeout(() => finish(false), SILENT_REAUTH_TIMEOUT_MS);
    });
}
