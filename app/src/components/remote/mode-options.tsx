import { Button, Group, Modal } from "@mantine/core";
import { useState } from "react";
import tc from "tinycolor2";

import { useMobile } from "../../lib/use-mobile";
import { ColorPicker } from "../color-picker";

function SingleColorModeOptions() {
  const { loading, changeModeParams, objects } = useMobile();
  const [opened, setOpened] = useState(false);
  const [color, setColor] = useState<tc.Instance>(objects[0].color);

  const close = () => setOpened(false);

  return (
    <>
      <Modal
        opened={opened}
        centered
        onClose={close}
        withCloseButton={false}
        classNames={{
          modal: "text-baby-blue bg-dark-blue rounded-xl",
          body: "flex flex-col items-center",
        }}
      >
        <ColorPicker
          initialColor={objects[0].color}
          onChange={(newColor) => setColor(newColor)}
        />

        <Group position="right" mt="sm" className="self-stretch">
          <Button
            onClick={close}
            radius="xl"
            className="text-baby-blue hover:bg-baby-blue hover:text-dark-blue"
          >
            Back
          </Button>
          <Button
            radius="xl"
            className="bg-baby-blue text-dark-blue hover:text-baby-blue hover:bg-transparent"
            onClick={async () => {
              changeModeParams("SINGLE_COLOR", {
                objects: objects.map((_, id) => id),
                color,
              });
              close();
            }}
          >
            Change colors
          </Button>
        </Group>
      </Modal>
      <Group position="center">
        <Button
          className="text-baby-blue hover:text-dark-blue hover:bg-baby-blue"
          radius="xl"
          disabled={loading}
          onClick={() => setOpened(true)}
        >
          Change all
        </Button>
      </Group>
    </>
  );
}

export function ModeOptions() {
  const { mode } = useMobile();

  switch (mode) {
    case "SINGLE_COLOR":
      return <SingleColorModeOptions />;
    case "RAINBOW":
      return null;
    case "COLOR_ROTATE":
      return null;
  }
}
