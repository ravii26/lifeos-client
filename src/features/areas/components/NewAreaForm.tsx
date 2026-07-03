import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";

import { useCreateAreaMutation, useUpdateAreaMutation } from "../areasApi";
import { AREA_COLORS, AREA_ICONS } from "../constants";
import type { Area } from "../types";

export function NewAreaForm({
  area,
  onClose,
}: {
  /** When provided, the form edits this area instead of creating one. */
  area?: Area;
  onClose: () => void;
}) {
  const isEdit = !!area;
  const [name, setName] = useState(area?.name ?? "");
  const [color, setColor] = useState(area?.color ?? AREA_COLORS[0]);
  const [icon, setIcon] = useState(area?.icon ?? AREA_ICONS[0].name);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createArea, { isLoading: creating }] = useCreateAreaMutation();
  const [updateArea, { isLoading: updating }] = useUpdateAreaMutation();
  const isLoading = creating || updating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setFieldErrors({});
    setFormError(null);
    try {
      if (isEdit) {
        await updateArea({
          id: area.id,
          data: { name: name.trim(), color, icon },
        }).unwrap();
      } else {
        await createArea({ name: name.trim(), color, icon }).unwrap();
      }
      onClose();
    } catch (err) {
      const { fields, message } = parseApiErrors(err as ApiError);
      setFieldErrors(fields);
      setFormError(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-line bg-surface-1 p-5"
    >
      <div className="space-y-2">
        <Label htmlFor="area-name">Name</Label>
        <Input
          id="area-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Health, Career, Finance"
          aria-invalid={!!fieldErrors.name}
          autoFocus
        />
        {fieldErrors.name && (
          <p className="text-xs text-danger">{fieldErrors.name}</p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {AREA_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              title={c}
              className={cn(
                "size-7 rounded-full ring-2 ring-offset-2 ring-offset-surface-1 transition",
                color === c ? "ring-tx" : "ring-transparent",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label>Icon</Label>
        <div className="flex flex-wrap gap-2">
          {AREA_ICONS.map(({ name: iconName, Icon }) => (
            <button
              key={iconName}
              type="button"
              onClick={() => setIcon(iconName)}
              title={iconName}
              className={cn(
                "grid size-9 place-items-center rounded-lg border transition-colors",
                icon === iconName
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-line bg-surface-2 text-tx-2 hover:bg-surface-3",
              )}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>

      {formError && <p className="mt-4 text-sm text-danger">{formError}</p>}

      <div className="mt-5 flex gap-2">
        <Button type="submit" disabled={isLoading || !name.trim()}>
          {isLoading
            ? isEdit
              ? "Saving…"
              : "Creating…"
            : isEdit
              ? "Save changes"
              : "Create area"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
