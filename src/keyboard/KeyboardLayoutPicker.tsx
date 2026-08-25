import { useUserPreferences } from "../context/user-preferences";
import {
    KEYBOARD_LANG_LAYOUTS
} from "../hid-usage-name-overrides";

export const KeyboardLayoutPicker = () => {
    const { keyboard_lang_layout, set_keyboard_lang_layout } = useUserPreferences();

    return (
        <select
            value={keyboard_lang_layout}
            className="h-8 rounded"
            onChange={(e) => {
                const keyboard_layout = (e.target.value as KEYBOARD_LANG_LAYOUTS) ?? KEYBOARD_LANG_LAYOUTS["US-INTERNATIONAL"]
                set_keyboard_lang_layout(keyboard_layout);
            }}
        >
            {Object.values(KEYBOARD_LANG_LAYOUTS).map((kll) => (
                <option key={kll} value={kll}>
                    {kll}
                </option>
            ))}
        </select>
    );
};
