import { FC } from "react";
import MuiPagination from "@mui/material/Pagination";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { fr } from "@codegouvfr/react-dsfr";

// getItemAriaLabel

type PaginationProps = {
    page: number;
    count: number;
    shape?: "circular" | "rounded";
    size?: "small" | "large";
    onChange: (_, value: number) => void;
};

const Pagination: FC<PaginationProps> = (props: PaginationProps) => {
    const { page, count, shape = "rounded", size = "small", onChange } = props;
    console.log("count : ", count);

    return (
        <MuiDsfrThemeProvider>
            <MuiPagination page={page} count={count} size={size} shape={shape} variant={"outlined"} showFirstButton showLastButton onChange={onChange} />
        </MuiDsfrThemeProvider>
    );
};

export default Pagination;
