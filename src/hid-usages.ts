// import { UsagePages } from "./HidUsageTables-1.5.json";
// Filtered with `cat src/HidUsageTables-1.5.json | jq '{ UsagePages: [.UsagePages[] | select([.Id] |inside([7, 12]))] }' > src/keyboard-and-consumer-usage-tables.json`
import { UsagePages } from "./keyboard-and-consumer-usage-tables.json";
import { KEYBOARD_LANG_LAYOUTS, HidLabels, get_hid_usage_name_overrides } from "./hid-usage-name-overrides";

export interface UsageId {
  Id: number;
  Name: string;
}

export interface UsagePageInfo {
  Name: string;
  UsageIds: UsageId[];
}

function remove_prefix(s?: string) {
  return s?.replace(/^Keyboard /, "");
}

export const hid_usage_from_page_and_id = (page: number, id: number) =>
  (page << 16) + id;

export const hid_usage_page_and_id_from_usage = (
  usage: number
): [number, number] => [(usage >> 16) & 0xffff, usage & 0xffff];

export const hid_usage_page_get_ids = (
  usage_page: number
): UsagePageInfo | undefined => UsagePages.find((p) => p.Id === usage_page);

export const hid_usage_get_label = (
  usage_page: number,
  usage_id: number,
  options: {
    keyboard_lang_layout?: KEYBOARD_LANG_LAYOUTS;
  } = { }
): string | undefined => {
  const overrides = get_hid_usage_name_overrides(options.keyboard_lang_layout ?? KEYBOARD_LANG_LAYOUTS["US-INTERNATIONAL"]);
  return overrides[usage_page.toString()]?.[usage_id.toString()]?.short ||
  UsagePages.find((p) => p.Id === usage_page)?.UsageIds?.find(
    (u) => u.Id === usage_id
  )?.Name;
}

export const hid_usage_get_labels = (
  usage_page: number,
  usage_id: number,
  options: {
    keyboard_lang_layout?: KEYBOARD_LANG_LAYOUTS;
    removePrefix?: boolean;
  } = { }
): HidLabels => {
  const overrides = get_hid_usage_name_overrides(options.keyboard_lang_layout ?? KEYBOARD_LANG_LAYOUTS["US-INTERNATIONAL"]);
  const labels = overrides[usage_page.toString()]?.[usage_id.toString()] || {
    short: UsagePages.find((p) => p.Id === usage_page)?.UsageIds?.find(
      (u) => u.Id === usage_id
    )?.Name,
  };
  if (options.removePrefix) {
    return {
      short: remove_prefix(labels.short),
      med: remove_prefix(labels.med),
      long: remove_prefix(labels.long),
      secondary: labels.secondary,
    };
  }
  return labels;
}
