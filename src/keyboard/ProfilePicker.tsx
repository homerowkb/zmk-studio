import {
  Button,
  Key,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  Text,
} from "react-aria-components";
import { useCallback, useMemo } from "react";

export type ProfileClickCallback = (index: number) => void;

export interface ProfilePickerProps {
  profileCount: number;
  activeProfile: number;
  onProfileClicked?: ProfileClickCallback;
}

interface ProfileItem {
  id: number;
  name: string;
}

export const ProfilePicker = ({
  profileCount,
  activeProfile,
  onProfileClicked,
}: ProfilePickerProps) => {
  const profiles = useMemo<ProfileItem[]>(() => {
    return Array.from({ length: profileCount }, (_, i) => ({
      id: i,
      name: `Profile ${i + 1}`,
    }));
  }, [profileCount]);

  const selectionChanged = useCallback(
    (key: Key) => {
      const index = profiles.findIndex((p) => p.id === key);
      if (index !== -1) {
        onProfileClicked?.(index);
      }
    },
    [profiles, onProfileClicked]
  );

  if (profileCount <= 1) {
    return null;
  }

  return (
    <Select
      onSelectionChange={selectionChanged}
      className="flex flex-col"
      selectedKey={profiles[activeProfile]?.id}
    >
      <Label className="after:content-[':'] text-sm">Profile</Label>
      <Button className="ml-2 p-1 rounded min-w-24 text-left hover:bg-base-300">
        <SelectValue<ProfileItem>>
          {(v) => {
            return <span>{v.selectedItem?.name}</span>;
          }}
        </SelectValue>
      </Button>
      <Popover className="min-w-[var(--trigger-width)] max-h-4 shadow-md text-base-content rounded border-base-content bg-base-100">
        <ListBox items={profiles}>
          {(profile) => (
            <ListBoxItem
              id={profile.id}
              textValue={profile.name}
              className="p-1 aria-selected:bg-primary aria-selected:text-primary-content cursor-pointer first:rounded-t last:rounded-b"
            >
              <Text slot="label">{profile.name}</Text>
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </Select>
  );
};
