import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Skeleton from "@mui/material/Skeleton";
import { FC } from "react";

const CommunitiesSkeleton: FC = () => {
    return (
        <MuiDsfrThemeProvider>
            {[...Array(10).keys()].map((n) => (
                <Skeleton className={fr.cx("fr-my-2v")} key={n} variant="rectangular" height={50} />
            ))}
        </MuiDsfrThemeProvider>
    );
};

export default CommunitiesSkeleton;
