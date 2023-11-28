import AppLayout from "../../components/Layout/AppLayout";
import BtnBackToHome from "../../components/Utils/BtnBackToHome";
import functions from "../../functions";
import { useAuthStore } from "../../stores/AuthStore";

const Me = () => {
    const { user } = useAuthStore();

    return (
        <AppLayout documentTitle="Mon compte">
            <h1>Mon compte</h1>

            {user && (
                <>
                    <p>
                        <strong>Prénom</strong> : {user.firstName}
                    </p>
                    <p>
                        <strong>Nom</strong> : {user.lastName}
                    </p>
                    <p>
                        <strong>Email</strong> : {user.email}
                    </p>
                    <p>
                        <strong>{"Date d'inscription"}</strong> : {functions.date.format(user.accountCreationDate)}
                    </p>
                    <p>
                        <strong>Identifiant technique</strong> : {user.id}
                    </p>
                </>
            )}

            <BtnBackToHome />
        </AppLayout>
    );
};

export default Me;
