import { fr } from "@codegouvfr/react-dsfr";
import AppLayout from "../../components/Layout/AppLayout";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";

const NewsletterSubscribe = () => {
    const newsletterSubscribeAction = (document.getElementById("app_env") as HTMLDivElement)?.dataset?.["newsletterSubscribeAction"] ?? null;

    return (
        <AppLayout documentTitle="S’inscrire à la lettre d’information">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>S’inscrire à la lettre d’information</h1>
                    <p>Pour être alerté des dernières actualités...</p>
                    {newsletterSubscribeAction === null ? (
                        <p>Le formulaire d’inscription n’est pas disponible</p>
                    ) : (
                        <form action={newsletterSubscribeAction} name="form" method="post">
                            <Input
                                state="default"
                                label="Votre adresse électronique"
                                hintText="ex. : nom@domaine.fr"
                                nativeInputProps={{
                                    placeholder: "Votre adresse électronique (ex. : nom@domaine.fr)",
                                    type: "email",
                                    autoComplete: "email",
                                    id: "contact_email",
                                    name: "contact_email",
                                }}
                            />
                            <Button id="newsletter-button" type="submit" title="S’abonner à notre lettre d’information">
                                S’abonner
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default NewsletterSubscribe;
