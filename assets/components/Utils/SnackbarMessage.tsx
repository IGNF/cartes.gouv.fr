import { Slide, SlideProps, Snackbar, SnackbarCloseReason } from "@mui/material";
import { FC, memo, useState } from "react";

import { useSnackbarStore } from "../../stores/SnackbarStore";
import Alert from "@codegouvfr/react-dsfr/Alert";

function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="up" />;
}

const SnackbarMessage: FC = () => {
    const message = useSnackbarStore((state) => state.message);
    const [closedId, setClosedId] = useState<string>();
    const open = !!message?.id && message.id !== closedId;

    function handleClose(_: unknown, reason: SnackbarCloseReason) {
        if (reason !== "clickaway") {
            close();
        }
    }

    function close() {
        setClosedId(message?.id);
    }

    return (
        <Snackbar key={message?.id ?? "empty"} autoHideDuration={6000} open={open} slots={{ transition: SlideTransition }} onClose={handleClose}>
            {message ? (
                <Alert
                    closable
                    description={message.description}
                    isClosed={false}
                    severity={message.severity ?? "success"}
                    title={message.title}
                    onClose={close}
                    style={{ backgroundColor: "var(--background-default-grey)" }}
                />
            ) : undefined}
        </Snackbar>
    );
};

export default memo(SnackbarMessage);
