import { fr } from "@codegouvfr/react-dsfr";
import { PropsWithChildren } from "react";

type MetadataSectionProps = {
    title: string;
};

export default function MetadataSection({ title, children }: PropsWithChildren<MetadataSectionProps>) {
    return (
        <section className={fr.cx("fr-col-12")}>
            <h2 className={fr.cx("fr-h5", "fr-mb-3w")}>{title}</h2>
            {children}
        </section>
    );
}
