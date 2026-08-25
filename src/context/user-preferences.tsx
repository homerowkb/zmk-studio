import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState } from 'react';
import { KEYBOARD_LANG_LAYOUTS } from '../hid-usage-name-overrides';

interface UserPreferencesContextValue {
    keyboard_lang_layout: KEYBOARD_LANG_LAYOUTS;
    set_keyboard_lang_layout: Dispatch<SetStateAction<KEYBOARD_LANG_LAYOUTS>>;
}

const UserPreferencesContext = createContext<UserPreferencesContextValue | undefined>(undefined);

export const UserPreferencesProvider = ({ children }: PropsWithChildren<{}>) => {
    const [keyboard_lang_layout, set_keyboard_lang_layout] = useState<KEYBOARD_LANG_LAYOUTS>(KEYBOARD_LANG_LAYOUTS["US-INTERNATIONAL"]);

    return (
        <UserPreferencesContext.Provider value={{
            keyboard_lang_layout,
            set_keyboard_lang_layout
        }}>
            {children}
        </UserPreferencesContext.Provider>
    );
}

export const useUserPreferences = (): UserPreferencesContextValue => {
    const context = useContext(UserPreferencesContext);
    if (!context) {
        throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
    }
    return context;
}