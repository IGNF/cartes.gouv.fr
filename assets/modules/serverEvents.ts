export type ServerEvent = { event: string; data: string };

// lecture d’un flux text/event-stream obtenu par fetch : l’EventSource natif ne peut ni envoyer d’en-tête ni faire un POST
export async function* readServerEvents(response: Response): AsyncGenerator<ServerEvent> {
    if (!response.body) return;

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";

    try {
        while (true) {
            // oxlint-disable-next-line no-await-in-loop -- un flux se lit morceau après morceau
            const { done, value } = await reader.read();
            if (done) return; // un bloc sans ligne vide finale est abandonné, comme le fait EventSource

            // shortcut: fins de ligne \n seules (format de ServerEvent de Symfony), gérer \r\n si un autre serveur est lu
            buffer += value;
            let end: number;
            while ((end = buffer.indexOf("\n\n")) !== -1) {
                const block = buffer.slice(0, end);
                buffer = buffer.slice(end + 2);

                let event = "message";
                const data: string[] = [];
                for (const line of block.split("\n")) {
                    const colon = line.indexOf(":");
                    const field = colon === -1 ? line : line.slice(0, colon);
                    const value = colon === -1 ? "" : line.slice(colon + 1).replace(/^ /, "");
                    if (field === "event") event = value;
                    else if (field === "data") data.push(value);
                }

                if (data.length > 0) yield { event, data: data.join("\n") };
            }
        }
    } finally {
        // sortie anticipée de la boucle de l’appelant : ferme la connexion
        reader.cancel().catch(() => {});
    }
}
