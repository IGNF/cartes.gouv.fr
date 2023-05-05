import React from "react";

import AppLayout from "../../components/Layout/AppLayout";
import BtnBackToHome from "../../components/Utils/BtnBackToHome";

const PageNotFound = () => {
    return (
        <AppLayout>
            <h1>404, page non trouvée</h1>
            <BtnBackToHome />
        </AppLayout>
    );
};

export default PageNotFound;
