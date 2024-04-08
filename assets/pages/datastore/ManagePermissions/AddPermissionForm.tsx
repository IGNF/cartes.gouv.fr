import { FC } from "react";

type AddPermissionFormProps = {
    datastoreId: string;
};

const AddPermissionForm: FC<AddPermissionFormProps> = ({ datastoreId }) => {
    console.log(datastoreId);
    return null;
};

export default AddPermissionForm;
