import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import MuiSkeleton from "@mui/material/Skeleton";
import { FC } from "react";

type SkeletonProps = {
    count: number;
    rectangleHeight?: number;
};
const Skeleton: FC<SkeletonProps> = ({ count, rectangleHeight = 50 }) => {
    return (
        <MuiDsfrThemeProvider>
            {[...Array(count).keys()].map((n) => (
                <MuiSkeleton className={fr.cx("fr-my-2v")} key={n} variant="rectangular" height={rectangleHeight} />
            ))}
        </MuiDsfrThemeProvider>
    );
};

export default Skeleton;
