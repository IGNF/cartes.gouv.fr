import { Slide, SlideProps, Snackbar, SnackbarCloseReason } from "@mui/material";
import { FC, memo, useEffect, useState } from "react";

import { useSnackbarStore } from "../../stores/SnackbarStore";
import Alert from "@codegouvfr/react-dsfr/Alert";

function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="up" />;
}

const SnackbarMessage: FC = () => {
    const message = useSnackbarStore((state) => state.message);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (message?.id) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [message?.id]);

    function handleClose(_, reason: SnackbarCloseReason) {
        if (reason !== "clickaway") {
            close();
        }
    }

    function close() {
        setOpen(false);
    }

    return (
        <Snackbar key={message?.id ?? "empty"} autoHideDuration={6000} open={open} TransitionComponent={SlideTransition} onClose={handleClose}>
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
