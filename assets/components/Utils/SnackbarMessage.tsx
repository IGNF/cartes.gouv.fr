import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Slide, SlideProps, Snackbar } from "@mui/material";
import { FC, memo } from "react";

import { useSnackbarStore } from "../../stores/SnackbarStore";

function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="up" />;
}

const SnackbarMessage: FC = () => {
    const message = useSnackbarStore((state) => state.message);
    const messageUuid = useSnackbarStore((state) => state.messageUuid);
    const clearMessage = useSnackbarStore((state) => state.clearMessage);

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }

        clearMessage();
    };

    return (
        message && (
            <Snackbar key={`${message}_${messageUuid}`} open={!!message} autoHideDuration={6000} onClose={handleClose} TransitionComponent={SlideTransition}>
                <div
                    style={{
                        border: "solid 1.5px",
                        borderColor: fr.colors.decisions.border.actionHigh.blueFrance.default,
                        backgroundColor: fr.colors.decisions.background.contrast.grey.default,
                    }}
                    className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-px-2v", "fr-py-1v")}
                >
                    <span
                        style={{
                            color: fr.colors.decisions.text.actionHigh.blueFrance.default,
                        }}
                    >
                        {message}
                    </span>
                    &nbsp;
                    <Button priority="tertiary no outline" title="Fermer" iconId="ri-close-line" onClick={handleClose} />
                </div>
            </Snackbar>
        )
    );
};

export default memo(SnackbarMessage);
