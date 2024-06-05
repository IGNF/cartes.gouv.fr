import { datastoreNavItemsEnTranslations } from "../../config/datastoreNavItems";
import { navItemsEnTranslations } from "../../config/navItems";
import { AccessesRequestEnTranslations } from "../../entrepot/pages/AccessesRequest";
import { AddMemberEnTranslations } from "../../entrepot/pages/communities/AddMember";
import { CommunityMembersEnTranslations } from "../../entrepot/pages/communities/CommunityMembers";
import { DashboardProEnTranslations } from "../../entrepot/pages/dashboard/DashboardPro";
import { DatasheetListEnTranslations } from "../../entrepot/pages/datasheet/DatasheetList/DatasheetList";
import { PyramidListItemFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidList/PyramidListItem";
import { VectorDbListItemEnTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/VectorDbList/VectorDbListItem";
import { DatasheetViewEnTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasheetView";
import { DatastorePermissionsEnTranslations } from "../../entrepot/pages/datastore/ManagePermissions/DatastorePermissionsTr";
import { DatastoreManageStorageEnTranslations } from "../../entrepot/pages/datastore/ManageStorage/DatastoreManageStorage";
import { AccessRestrictionsEnTranslations } from "../../entrepot/pages/service/AccessRestrictions";
import { TableSelectionEnTranslations } from "../../entrepot/pages/service/TableSelection";
import { MetadatasFormEnTranslations } from "../../entrepot/pages/service/metadatas/metadatas-form-tr";
import { ValidationMetadatasEnTranslations } from "../../entrepot/pages/service/metadatas/metadatas-validation-tr";
import { PyramidVectorTmsServiceFormEnTranslations } from "../../entrepot/pages/service/tms/PyramidVectorTmsServiceForm";
import { WfsServiceFormEnTranslations } from "../../entrepot/pages/service/wfs/WfsServiceForm";
import { UploadStyleFileEnTranslations } from "../../entrepot/pages/service/wms-vector/UploadStyleFile";
import { WmsVectorServiceFormEnTranslations } from "../../entrepot/pages/service/wms-vector/WmsVectorServiceForm";
import { MeEnTranslations } from "../../entrepot/pages/users/Me";
import { MyAccessKeysEnTranslations } from "../../entrepot/pages/users/MyAccessKeys";
import { UserKeyEnTranslations } from "../../entrepot/pages/users/keys/UserKeyTr";
import { UserKeysListTabEnTranslations } from "../../entrepot/pages/users/keys/UserKeysListTab";
import { PermissionsEnTranslations } from "../../entrepot/pages/users/permissions/PermissionsTr";
import { EspaceCoCommunitiesEnTranslations } from "../../espaceco/pages/communities/EspaceCoCommunitiesTr";
import { TMSStyleFilesManagerEnTranslations } from "../../modules/Style/TMSStyleFilesManager";
import { contactEnTranslations } from "../../pages/contact/Contact";
import { mapboxStyleValidationEnTranslations } from "../../validations/MapboxStyleValidator";
import { SldStyleValidationErrorsEnTranslations } from "../../validations/SldStyleValidationErrorsTr";
import { commonEnTranslations } from "../Common";
import { RightsEnTranslations } from "../Rights";
import { StyleEnTranslations } from "../Style";
import type { Translations } from "../i18n";

export const translations: Translations<"en"> = {
    Common: commonEnTranslations,
    Rights: RightsEnTranslations,
    Style: StyleEnTranslations,
    Me: MeEnTranslations,
    AddMember: AddMemberEnTranslations,
    CommunityMembers: CommunityMembersEnTranslations,
    DashboardPro: DashboardProEnTranslations,
    MyAccessKeys: MyAccessKeysEnTranslations,
    UserKeysListTab: UserKeysListTabEnTranslations,
    UserKey: UserKeyEnTranslations,
    Permissions: PermissionsEnTranslations,
    ValidationMetadatas: ValidationMetadatasEnTranslations,
    MetadatasForm: MetadatasFormEnTranslations,
    Contact: contactEnTranslations,
    AccessesRequest: AccessesRequestEnTranslations,
    navItems: navItemsEnTranslations,
    datastoreNavItems: datastoreNavItemsEnTranslations,
    VectorDbListItem: VectorDbListItemEnTranslations,
    PyramidListItem: PyramidListItemFrTranslations,
    DatasheetView: DatasheetViewEnTranslations,
    SldStyleValidationErrors: SldStyleValidationErrorsEnTranslations,
    mapboxStyleValidation: mapboxStyleValidationEnTranslations,
    TMSStyleFilesManager: TMSStyleFilesManagerEnTranslations,
    DatastoreManageStorage: DatastoreManageStorageEnTranslations,
    DatastorePermissions: DatastorePermissionsEnTranslations,
    WmsVectorServiceForm: WmsVectorServiceFormEnTranslations,
    WfsServiceForm: WfsServiceFormEnTranslations,
    TableSelection: TableSelectionEnTranslations,
    UploadStyleFile: UploadStyleFileEnTranslations,
    PyramidVectorTmsServiceForm: PyramidVectorTmsServiceFormEnTranslations,
    EspaceCoCommunities: EspaceCoCommunitiesEnTranslations,
    DatasheetList: DatasheetListEnTranslations,
    AccessRestrictions: AccessRestrictionsEnTranslations,
};
