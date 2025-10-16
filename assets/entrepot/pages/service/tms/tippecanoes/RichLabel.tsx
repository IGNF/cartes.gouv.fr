import { FC } from "react";

type RichLabelProps = {
    label: string;
    image: string;
};

const RichLabel: FC<RichLabelProps> = ({ label, image }) => {
    return (
        <>
            {label}
            <img className={"frx-radio__image"} src={image} alt={`Illustration pour ${label}`} />
        </>
    );
};

export default RichLabel;
