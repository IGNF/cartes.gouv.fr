import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import MuiSkeleton from "@mui/material/Skeleton";
import { FC } from "react";

type SkeletonProps = {
    count: number;
};
const Skeleton: FC<SkeletonProps> = ({ count }) => {
    return (
        <MuiDsfrThemeProvider>
            {[...Array(count).keys()].map((n) => (
                <MuiSkeleton className={fr.cx("fr-my-2v")} key={n} variant="rectangular" height={50} />
            ))}
        </MuiDsfrThemeProvider>
    );
};

export default Skeleton;
