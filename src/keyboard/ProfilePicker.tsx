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
  DialogTrigger,
} from "react-aria-components";
import { useCallback, useMemo, useRef, useState } from "react";
import { Stamp } from "lucide-react";

export type ProfileClickCallback = (index: number) => void;
export type ProfileCloneCallback = (destProfile: number) => void;

interface ProfileItem {
  id: number;
  name: string;
}

// --- ProfileSelect ---

interface ProfileSelectProps {
  profiles: ProfileItem[];
  activeProfile: number;
  onProfileClicked?: ProfileClickCallback;
}

export const ProfileSelect = ({
  profiles,
  activeProfile,
  onProfileClicked,
}: ProfileSelectProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectionChanged = useCallback(
    (key: Key) => {
      const index = profiles.findIndex((p) => p.id === key);
      if (index !== -1) {
        onProfileClicked?.(index);
      }
    },
    [profiles, onProfileClicked]
  );

  return (
    <Select
      onSelectionChange={selectionChanged}
      className="flex flex-col"
      selectedKey={profiles[activeProfile]?.id}
    >
      <Button
        ref={triggerRef}
        className="ml-2 p-1 rounded min-w-24 text-left hover:bg-base-300"
      >
        <SelectValue<ProfileItem>>
          {(v) => <span>{v.selectedItem?.name}</span>}
        </SelectValue>
      </Button>
      <Popover
        triggerRef={triggerRef}
        className="min-w-[var(--trigger-width)] max-h-4 shadow-md text-base-content rounded border-base-content bg-base-100"
        placement="right top"
      >
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

// --- ProfileCloneButton ---

interface ProfileCloneButtonProps {
  otherProfiles: ProfileItem[];
  onCloneProfile: ProfileCloneCallback;
}

export const ProfileCloneButton = ({
  otherProfiles,
  onCloneProfile,
}: ProfileCloneButtonProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button
        ref={triggerRef}
        className="p-0.5 rounded hover:bg-base-300"
        aria-label="Clone profile"
      >
        <Stamp size={14} />
      </Button>
      <Popover
        triggerRef={triggerRef}
        placement="right top"
        className="shadow-md text-base-content rounded border border-base-content bg-base-100"
      >
        <div className="text-xs font-semibold text-base-content/60 px-2 pt-2 pb-1">
          Clone into…
        </div>
        <ListBox
          items={otherProfiles}
          onAction={(key) => {
            const dest = otherProfiles.find((p) => p.id === key);
            if (dest !== undefined) {
              onCloneProfile(dest.id);
              setIsOpen(false);
            }
          }}
          className="min-w-32"
        >
          {(profile) => (
            <ListBoxItem
              id={profile.id}
              textValue={profile.name}
              className="p-1 px-2 cursor-pointer hover:bg-base-200 first:rounded-t last:rounded-b"
            >
              <Text slot="label">{profile.name}</Text>
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </DialogTrigger>
  );
};

// --- ProfilePicker ---

export interface ProfilePickerProps {
  profileCount: number;
  activeProfile: number;
  onProfileClicked?: ProfileClickCallback;
  onCloneProfile?: ProfileCloneCallback;
}

export const ProfilePicker = ({
  profileCount,
  activeProfile,
  onProfileClicked,
  onCloneProfile,
}: ProfilePickerProps) => {
  const profiles = useMemo<ProfileItem[]>(
    () =>
      Array.from({ length: profileCount }, (_, i) => ({
        id: i,
        name: `Profile ${i + 1}`,
      })),
    [profileCount]
  );

  const otherProfiles = useMemo<ProfileItem[]>(
    () => profiles.filter((p) => p.id !== activeProfile),
    [profiles, activeProfile]
  );

  if (profileCount <= 1) {
    return null;
  }

  return (
    <div>
      <div className="flex flex-row justify-between items-center gap-1">
        <Label htmlFor="profile-select" className="after:content-[':'] text-sm">
          Profile
        </Label>
        {onCloneProfile && (
          <ProfileCloneButton
            otherProfiles={otherProfiles}
            onCloneProfile={onCloneProfile}
          />
        )}
      </div>
      <ProfileSelect
        profiles={profiles}
        activeProfile={activeProfile}
        onProfileClicked={onProfileClicked}
      />
    </div>
  );
};
