type SymfonyValidationMessagesProps = {
    message?: string;
};

function ServiceFormErrors({ message }: SymfonyValidationMessagesProps) {
    if (!message) {
        return "";
    }

    const messages = message?.split("\n");

    if (messages.length === 0) {
        return "";
    }

    if (messages.length === 1) {
        return messages[0];
    }

    return (
        <ul>
            {messages.map((m) => (
                <li key={m}>{m}</li>
            ))}
        </ul>
    );
}

export default ServiceFormErrors;
