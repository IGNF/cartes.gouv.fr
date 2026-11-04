import { describe, expect, it, vi } from "vitest";

import { readServerEvents, type ServerEvent } from "./serverEvents";

function streamOf(chunks: string[], onCancel?: () => void): Response {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
        start(controller) {
            chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
            if (!onCancel) controller.close();
        },
        cancel: onCancel,
    });
    return new Response(body);
}

async function collect(response: Response): Promise<ServerEvent[]> {
    const events: ServerEvent[] = [];
    for await (const event of readServerEvents(response)) events.push(event);
    return events;
}

describe("readServerEvents", () => {
    it("produit un événement par bloc", async () => {
        const events = await collect(streamOf(['event: started\ndata: {"a":1}\n\nevent: done\ndata: {}\n\n']));
        expect(events).toEqual([
            { event: "started", data: '{"a":1}' },
            { event: "done", data: "{}" },
        ]);
    });

    it("prend « message » quand event: est absent", async () => {
        expect(await collect(streamOf(["data: x\n\n"]))).toEqual([{ event: "message", data: "x" }]);
    });

    it("concatène les lignes data: d’un même bloc", async () => {
        expect(await collect(streamOf(["data: a\ndata: b\n\n"]))).toEqual([{ event: "message", data: "a\nb" }]);
    });

    it("recolle un bloc coupé entre deux lectures", async () => {
        expect(await collect(streamOf(["event: prog", "ress\ndata: 4", "2\n", "\n"]))).toEqual([{ event: "progress", data: "42" }]);
    });

    it("ignore les commentaires, les blocs sans data: et un bloc final incomplet", async () => {
        expect(await collect(streamOf([": ping\n\nretry: 1000\n\ndata: ok\n\ndata: perdu"]))).toEqual([{ event: "message", data: "ok" }]);
    });

    it("ferme le flux quand l’appelant sort de la boucle", async () => {
        let cancelled = false;
        const response = streamOf(["data: 1\n\ndata: 2\n\n"], () => {
            cancelled = true;
        });
        for await (const event of readServerEvents(response)) {
            expect(event.data).toBe("1");
            break;
        }
        await vi.waitFor(() => expect(cancelled).toBe(true));
    });
});
