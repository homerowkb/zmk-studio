import { Pencil, Minus, Plus, Stamp } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  DropIndicator,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Selection,
  Text,
  useDragAndDrop,
} from "react-aria-components";
import { useModalRef } from "../misc/useModalRef";
import { GenericModal } from "../GenericModal";

interface Layer {
  id: number;
  name?: string;
}

export type LayerClickCallback = (index: number) => void;
export type LayerMovedCallback = (index: number, destination: number) => void;
export type LayerCloneCallback = (sourceIndex: number, destIndex: number) => void;

interface LayerPickerProps {
  layers: Array<Layer>;
  selectedLayerIndex: number;
  canAdd?: boolean;
  canRemove?: boolean;

  onLayerClicked?: LayerClickCallback;
  onLayerMoved?: LayerMovedCallback;
  onAddClicked?: () => void | Promise<void>;
  onRemoveClicked?: () => void | Promise<void>;
  onLayerNameChanged?: (
    id: number,
    oldName: string,
    newName: string
  ) => void | Promise<void>;
  onCloneLayer?: LayerCloneCallback;
}

interface EditLabelData {
  id: number;
  name: string;
}

const EditLabelModal = ({
  open,
  onClose,
  editLabelData,
  handleSaveNewLabel,
}: {
  open: boolean;
  onClose: () => void;
  editLabelData: EditLabelData;
  handleSaveNewLabel: (
    id: number,
    oldName: string,
    newName: string | null
  ) => void;
}) => {
  const ref = useModalRef(open);
  const [newLabelName, setNewLabelName] = useState(editLabelData.name);

  const handleSave = () => {
    handleSaveNewLabel(editLabelData.id, editLabelData.name, newLabelName);
    onClose();
  };

  return (
    <GenericModal
      ref={ref}
      onClose={onClose}
      className="min-w-min w-[30vw] flex flex-col"
    >
      <span className="mb-3 text-lg">New Layer Name</span>
      <input
        className="p-1 border rounded border-base-content border-solid"
        type="text"
        defaultValue={editLabelData.name}
        autoFocus
        onChange={(e) => setNewLabelName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
          }
        }}
      />
      <div className="mt-4 flex justify-end">
        <button className="py-1.5 px-2" type="button" onClick={onClose}>
          Cancel
        </button>
        <button
          className="py-1.5 px-2 ml-4 rounded-md bg-gray-100 text-black hover:bg-gray-300"
          type="button"
          onClick={() => {
            handleSave();
          }}
        >
          Save
        </button>
      </div>
    </GenericModal>
  );
};

interface CloneMenuState {
  sourceId: number;
  triggerEl: HTMLButtonElement;
}

export const LayerPicker = ({
  layers,
  selectedLayerIndex,
  canAdd,
  canRemove,
  onLayerClicked,
  onLayerMoved,
  onAddClicked,
  onRemoveClicked,
  onLayerNameChanged,
  onCloneLayer,
  ...props
}: LayerPickerProps) => {
  const [editLabelData, setEditLabelData] = useState<EditLabelData | null>(null);
  const [cloneMenu, setCloneMenu] = useState<CloneMenuState | null>(null);
  const cloneTriggerRef = useRef<HTMLButtonElement | null>(null);

  const layer_items = useMemo(() => {
    return layers.map((l, i) => ({
      name: l.name || i.toLocaleString(),
      id: l.id,
      index: i,
      selected: i === selectedLayerIndex,
    }));
  }, [layers, selectedLayerIndex]);

  const selectionChanged = useCallback(
    (s: Selection) => {
      if (s === "all") {
        return;
      }
      onLayerClicked?.(layer_items.findIndex((l) => s.has(l.id)));
    },
    [onLayerClicked, layer_items]
  );

  let { dragAndDropHooks } = useDragAndDrop({
    renderDropIndicator(target) {
      return (
        <DropIndicator
          target={target}
          className={"data-[drop-target]:outline outline-1 outline-accent"}
        />
      );
    },
    getItems: (keys) =>
      [...keys].map((key) => ({ "text/plain": key.toLocaleString() })),
    onReorder(e) {
      let startIndex = layer_items.findIndex((l) => e.keys.has(l.id));
      let endIndex = layer_items.findIndex((l) => l.id === e.target.key);
      onLayerMoved?.(startIndex, endIndex);
    },
  });

  const handleSaveNewLabel = useCallback(
    (id: number, oldName: string, newName: string | null) => {
      if (newName !== null) {
        onLayerNameChanged?.(id, oldName, newName);
      }
    },
    [onLayerNameChanged]
  );

  const openCloneMenu = useCallback((sourceId: number, triggerEl: HTMLButtonElement) => {
    cloneTriggerRef.current = triggerEl;
    setCloneMenu({ sourceId, triggerEl });
  }, []);

  const closeCloneMenu = useCallback(() => {
    setCloneMenu(null);
  }, []);

  const sourceItem = cloneMenu
    ? layer_items.find((l) => l.id === cloneMenu.sourceId)
    : null;
  const cloneTargets = sourceItem
    ? layer_items.filter((l) => l.id !== cloneMenu!.sourceId)
    : [];

  return (
    <div className="flex flex-col min-w-40">
      <div className="grid grid-cols-[1fr_auto_auto] items-center">
        <Label className="after:content-[':'] text-sm">Layers</Label>
        {onRemoveClicked && (
          <button
            type="button"
            className="hover:text-primary-content hover:bg-primary rounded-sm"
            disabled={!canRemove}
            onClick={onRemoveClicked}
          >
            <Minus className="size-4" />
          </button>
        )}
        {onAddClicked && (
          <button
            type="button"
            disabled={!canAdd}
            className="hover:text-primary-content ml-1 hover:bg-primary rounded-sm disabled:text-gray-500 disabled:hover:bg-base-300 disabled:cursor-not-allowed"
            onClick={onAddClicked}
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>
      {editLabelData !== null && (
        <EditLabelModal
          open={editLabelData !== null}
          onClose={() => setEditLabelData(null)}
          editLabelData={editLabelData}
          handleSaveNewLabel={handleSaveNewLabel}
        />
      )}
      <ListBox
        aria-label="Keymap Layer"
        selectionMode="single"
        items={layer_items}
        disallowEmptySelection={true}
        selectedKeys={
          layer_items[selectedLayerIndex]
            ? [layer_items[selectedLayerIndex].id]
            : []
        }
        className="ml-2 items-center justify-center cursor-pointer"
        onSelectionChange={selectionChanged}
        dragAndDropHooks={dragAndDropHooks}
        {...props}
      >
        {(layer_item) => (
          <ListBoxItem
            textValue={layer_item.name}
            className="p-1 b-1 my-1 group grid grid-cols-[1fr_auto_auto] items-center aria-selected:bg-primary aria-selected:text-primary-content border rounded border-transparent border-solid hover:bg-base-300"
          >
            <span>{layer_item.name}</span>
            <Pencil
              className="h-4 w-4 mx-1 invisible group-hover:visible"
              onClick={() =>
                setEditLabelData({ id: layer_item.id, name: layer_item.name })
              }
            />
            {onCloneLayer && (
              <button
                type="button"
                className="p-0.5 rounded invisible group-hover:visible"
                aria-label="Clone layer"
                onClick={(e) => {
                  e.stopPropagation();
                  openCloneMenu(layer_item.id, e.currentTarget);
                }}
              >
                <Stamp className="h-4 w-4 mx-1" />
              </button>
            )}
          </ListBoxItem>
        )}
      </ListBox>

      {onCloneLayer && (
        <Popover
          triggerRef={cloneTriggerRef as React.RefObject<HTMLButtonElement>}
          isOpen={cloneMenu !== null}
          onOpenChange={(open) => { if (!open) closeCloneMenu(); }}
          placement="right top"
          className="shadow-md text-base-content rounded border border-base-content bg-base-100"
        >
          <div className="text-xs font-semibold text-base-content/60 px-2 pt-2 pb-1">
            Clone into…
          </div>
          <ListBox
            items={cloneTargets}
            onAction={(key) => {
              const dest = cloneTargets.find((l) => l.id === key);
              if (dest && sourceItem) {
                onCloneLayer(sourceItem.index, dest.index);
              }
              closeCloneMenu();
            }}
            className="min-w-32 outline-none"
          >
            {(layer) => (
              <ListBoxItem
                id={layer.id}
                textValue={layer.name}
                className="p-1 px-2 cursor-pointer hover:bg-base-200 first:rounded-t last:rounded-b outline-none"
              >
                <Text slot="label">{layer.name}</Text>
              </ListBoxItem>
            )}
          </ListBox>
        </Popover>
      )}
    </div>
  );
};
