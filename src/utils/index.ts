export { formatDate, toDateStr, toTimeStr, toDate, todayStr } from "./format-date";
export { handleError } from "./error-handler";
export { parseMasucoFromRequest } from "./api-helpers";
export { generateRandomIncidentCodeParts } from "./incident-code";
export { checkIsAdmin } from "./permissions";
export {
  safeToString,
  safeParseInt,
  toNullableString,
  formatBooleanOption,
  parseBooleanOption,
} from "./helpers";
export {
  buildPhongSelectOptions,
  buildPhongSelectOptions as buildPhongOptions,
  buildPhongNoiSelectOptions,
  buildPhongNoiSelectOptions as buildPhongNoiOptions,
  buildDepartmentSelectOptions,
} from "./phong-helpers";
export { KHOA_PHONG_MAP, DANH_MUC_PHAI } from "@/constants/department";
