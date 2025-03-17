import { ModeOptions } from "./mode-options";
import { Objects } from "./objects";
import { SelectMode } from "./select-mode";

export function Remote() {
  return (
    <div>
      <SelectMode />
      <Objects />
      <ModeOptions />
    </div>
  );
}