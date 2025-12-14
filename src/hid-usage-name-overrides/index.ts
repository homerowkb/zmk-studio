export enum KEYBOARD_LANG_LAYOUTS {
    "US-INTERNATIONAL" = "us-intl",
    "ITALIAN" = "it",
}

export interface HidLabels {
  short?: string;
  med?: string;
  long?: string;
  secondary?: string;
}

type hid_usage_name_overrides_entry = Record<string, Record<string, HidLabels>>

const hid_usage_name_overrides: Record<KEYBOARD_LANG_LAYOUTS, hid_usage_name_overrides_entry> = {
    [KEYBOARD_LANG_LAYOUTS["US-INTERNATIONAL"]]: require("./hid-usage-name-overrides-us-intl.json"),
    [KEYBOARD_LANG_LAYOUTS["ITALIAN"]]: require("./hid-usage-name-overrides-it.json"),
}

export const get_hid_usage_name_overrides = (layout: KEYBOARD_LANG_LAYOUTS): hid_usage_name_overrides_entry => {
    return hid_usage_name_overrides[layout];
} 