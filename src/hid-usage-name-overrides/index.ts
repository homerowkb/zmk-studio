import HidUsageOverridesUSInt from "./us-intl.json"
import HidUsageOverridesIt from "./it.json"

export enum KEYBOARD_LANG_LAYOUTS {
    "US-INTERNATIONAL" = "us-intl",
    "ITALIAN" = "it",
}

export interface HidLabels {
    short?: string;
    med?: string;
    long?: string;
    secondary?: string;
    tertiary?: string;
}

type hid_usage_name_overrides_entry = Record<string, Record<string, HidLabels>>

const hid_usage_name_overrides: Record<KEYBOARD_LANG_LAYOUTS, hid_usage_name_overrides_entry> = {
    [KEYBOARD_LANG_LAYOUTS["US-INTERNATIONAL"]]: HidUsageOverridesUSInt,
    [KEYBOARD_LANG_LAYOUTS["ITALIAN"]]: HidUsageOverridesIt,
}

export const get_hid_usage_name_overrides = (layout: KEYBOARD_LANG_LAYOUTS): hid_usage_name_overrides_entry => {
    return hid_usage_name_overrides[layout];
} 