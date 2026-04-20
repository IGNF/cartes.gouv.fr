import { useEffect } from "react";

export default function TestSSE() {
    useEffect(() => {
        const eventSource = new EventSource("/test-sse");
        eventSource.onmessage = (event) => {
            let data = null;
            try {
                data = JSON.parse(event.data);
                console.log("Message from server:", data);
            } catch (error) {
                console.error("Error parsing SSE data:", error);
            }
        };
        return () => eventSource.close();
    }, []);

    return (
        <div>
            <h1>Test SSE</h1>
            <p>Check the console for messages from the server.</p>
        </div>
    );
}
