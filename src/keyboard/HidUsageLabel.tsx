import { useUserPreferences } from "../context/user-preferences";
import {
  hid_usage_get_labels,
  hid_usage_page_and_id_from_usage,
} from "../hid-usages";

export interface HidUsageLabelProps {
  hid_usage: number;
}
export const HidUsageLabel = ({ hid_usage }: HidUsageLabelProps) => {
  const { keyboard_lang_layout } = useUserPreferences();
  let [page, id] = hid_usage_page_and_id_from_usage(hid_usage);

  // TODO: Do something with implicit mods!
  page &= 0xff;

  let labels = hid_usage_get_labels(page, id, {
    keyboard_lang_layout,
    removePrefix: true,
  });

  return (
    <>
      <span
        className="@[10em]:before:content-[attr(data-long-content)] @[6em]:before:content-[attr(data-med-content)] before:content-[attr(aria-label)]"
        aria-label={(labels.short)}
        data-med-content={(labels.med || labels.short)}
        data-long-content={(
          labels.long || labels.med || labels.short
        )}
      />

      {labels.secondary && (
        <p className="absolute top-1 right-1 text-xs opacity-80">
          {labels.secondary}
        </p>
      )}
      {labels.tertiary && (
        <p className="absolute bottom-1 right-1 text-xs opacity-80">
          {labels.tertiary}
        </p>
      )}
    </>
  );
};
