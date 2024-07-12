import { datastoreNavItemsFrTranslations } from "../../config/datastoreNavItems";
import { navItemsFrTranslations } from "../../config/navItems";
import { AccessesRequestFrTranslations } from "../../entrepot/pages/AccessesRequest";
import { AddMemberFrTranslations } from "../../entrepot/pages/communities/AddMember";
import { CommunityMembersFrTranslations } from "../../entrepot/pages/communities/CommunityMembers";
import { DashboardProFrTranslations } from "../../entrepot/pages/dashboard/DashboardPro";
import { DatasheetListFrTranslations } from "../../entrepot/pages/datasheet/DatasheetList/DatasheetList";
import { DatasheetUploadFormFrTranslations } from "../../entrepot/pages/datasheet/DatasheetNew/DatasheetUploadForm";
import { PyramidListItemFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/PyramidList/PyramidListItem";
import { VectorDbListItemFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasetListTab/VectorDbList/VectorDbListItem";
import { DatasheetViewFrTranslations } from "../../entrepot/pages/datasheet/DatasheetView/DatasheetView";
import { DatastorePermissionsFrTranslations } from "../../entrepot/pages/datastore/ManagePermissions/DatastorePermissionsTr";
import { DatastoreManageStorageFrTranslations } from "../../entrepot/pages/datastore/ManageStorage/DatastoreManageStorage";
import { AccessRestrictionsFrTranslations } from "../../entrepot/pages/service/AccessRestrictions";
import { TableSelectionFrTranslations } from "../../entrepot/pages/service/TableSelection";
import { MetadatasFormFrTranslations } from "../../entrepot/pages/service/metadatas/metadatas-form-tr";
import { ValidationMetadatasFrTranslations } from "../../entrepot/pages/service/metadatas/metadatas-validation-tr";
import { PyramidVectorTmsServiceFormFrTranslations } from "../../entrepot/pages/service/tms/PyramidVectorTmsServiceForm";
import { WfsServiceFormFrTranslations } from "../../entrepot/pages/service/wfs/WfsServiceForm";
import { UploadStyleFileFrTranslations } from "../../entrepot/pages/service/wms-vector/UploadStyleFile";
import { WmsVectorServiceFormFrTranslations } from "../../entrepot/pages/service/wms-vector/WmsVectorServiceForm";
import { MeFrTranslations } from "../../entrepot/pages/users/Me";
import { MyAccessKeysFrTranslations } from "../../entrepot/pages/users/MyAccessKeys";
import { UserKeyFrTranslations } from "../../entrepot/pages/users/keys/UserKeyTr";
import { UserKeysListTabFrTranslations } from "../../entrepot/pages/users/keys/UserKeysListTab";
import { PermissionsFrTranslations } from "../../entrepot/pages/users/permissions/PermissionsTr";
import { CommunityListFrTranslations } from "../../espaceco/pages/communities/CommunityListTr";
import { ManageCommunityFrTranslations } from "../../espaceco/pages/communities/ManageCommunityTr";
import { ManageCommunityValidationsFrTranslations } from "../../espaceco/pages/communities/management/validationTr";
import { SearchEnTranslations, SearchFrTranslations } from "../../espaceco/pages/communities/management/Search";
import { TMSStyleFilesManagerFrTranslations } from "../../modules/Style/TMSStyleFilesManager";
import { contactFrTranslations } from "../../pages/assistance/contact/Contact";
import { mapboxStyleValidationFrTranslations } from "../../validations/MapboxStyleValidator";
import { SldStyleValidationErrorsFrTranslations } from "../../validations/SldStyleValidationErrorsTr";
import { BreadcrumbFrTranslations } from "../Breadcrumb";
import { commonFrTranslations } from "../Common";
import { RightsFrTranslations } from "../Rights";
import { StyleFrTranslations } from "../Style";

import type { Translations } from "../i18n";

export const translations: Translations<"fr"> = {
    Common: commonFrTranslations,
    Breadcrumb: BreadcrumbFrTranslations,
    Rights: RightsFrTranslations,
    Style: StyleFrTranslations,
    Me: MeFrTranslations,
    AddMember: AddMemberFrTranslations,
    CommunityMembers: CommunityMembersFrTranslations,
    DashboardPro: DashboardProFrTranslations,
    MyAccessKeys: MyAccessKeysFrTranslations,
    UserKeysListTab: UserKeysListTabFrTranslations,
    UserKey: UserKeyFrTranslations,
    Permissions: PermissionsFrTranslations,
    MetadatasForm: MetadatasFormFrTranslations,
    ValidationMetadatas: ValidationMetadatasFrTranslations,
    Contact: contactFrTranslations,
    AccessesRequest: AccessesRequestFrTranslations,
    navItems: navItemsFrTranslations,
    datastoreNavItems: datastoreNavItemsFrTranslations,
    VectorDbListItem: VectorDbListItemFrTranslations,
    PyramidListItem: PyramidListItemFrTranslations,
    DatasheetView: DatasheetViewFrTranslations,
    SldStyleValidationErrors: SldStyleValidationErrorsFrTranslations,
    mapboxStyleValidation: mapboxStyleValidationFrTranslations,
    TMSStyleFilesManager: TMSStyleFilesManagerFrTranslations,
    DatastoreManageStorage: DatastoreManageStorageFrTranslations,
    DatastorePermissions: DatastorePermissionsFrTranslations,
    WmsVectorServiceForm: WmsVectorServiceFormFrTranslations,
    WfsServiceForm: WfsServiceFormFrTranslations,
    TableSelection: TableSelectionFrTranslations,
    UploadStyleFile: UploadStyleFileFrTranslations,
    PyramidVectorTmsServiceForm: PyramidVectorTmsServiceFormFrTranslations,
    DatasheetUploadForm: DatasheetUploadFormFrTranslations,
    DatasheetList: DatasheetListFrTranslations,
    AccessRestrictions: AccessRestrictionsFrTranslations,
    CommunityList: CommunityListFrTranslations,
    ManageCommunity: ManageCommunityFrTranslations,
    ManageCommunityValidations: ManageCommunityValidationsFrTranslations,
    Search: SearchFrTranslations,
};
