import { FC } from "react";

import AppLayout from "../../components/Layout/AppLayout";
import PageNotFound from "./PageNotFound";

const PageNotFoundWithLayout: FC = () => {
    return (
        <AppLayout>
            <PageNotFound />
        </AppLayout>
    );
};

export default PageNotFoundWithLayout;
