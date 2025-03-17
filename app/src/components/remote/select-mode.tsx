import { Group, SegmentedControl } from "@mantine/core";
import { Modes, useMobile } from "../../lib/use-mobile";

export function SelectMode() {
  const { mode: selectedMode, loading, changeMode } = useMobile();

  return (
    <Group position="center">
      <SegmentedControl
        classNames={{
          root: "bg-transparent",
          label: "text-baby-blue hover:text-white",
          labelActive: "!text-dark-blue",
          active: "bg-baby-blue rounded-full",
          control: "!border-x-0",
        }}
        value={selectedMode}
        onChange={changeMode}
        data={Modes.map((m) => ({
          label: m
            .split("_")
            .map(
              (w) =>
                w[0].toLocaleUpperCase() + w.substring(1).toLocaleLowerCase()
            )
            .join(" "),
          value: m,
        }))}
      />
    </Group>
  );
}
