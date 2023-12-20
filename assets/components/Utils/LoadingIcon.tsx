import { fr } from "@codegouvfr/react-dsfr";
import { FC, memo } from "react";

import "../../sass/components/spinner.scss";

type LoadingIconProps = {
    className?: string;
};
const LoadingIcon: FC<LoadingIconProps> = ({ className = "" }) => {
    return <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg") + " frx-icon-spin " + className} />;
};

export default memo(LoadingIcon);
