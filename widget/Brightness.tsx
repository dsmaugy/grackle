import { createComputed, createState, With } from "ags";
import { monitorFile } from "ags/file";
import { Gtk } from "ags/gtk4";
import { exec, execAsync } from "ags/process";
import { GrackleLevel } from "../components/GrackleLevel";

export const Brighness = () => {
  const buttonWidth = 100;
  const [maxBrightness, setMaxBrightness] = createState<number | undefined>(
    undefined,
  );
  const [currBrightness, setCurrBrightness] = createState<number | undefined>(
    undefined,
  );

  // TODO: support multiple monitors
  const backlightFile = exec([
    "sh",
    "-c",
    "ls -w1 /sys/class/backlight | head -1",
  ]);

  const updateBrightness = () => {
    execAsync(["brightnessctl", "get"])
      .then((out) => {
        const currentBrightness = parseInt(out);
        if (isNaN(currentBrightness)) {
          print(`Error parsing current brightness. Got: ${out}`);
          return 0;
        }

        setCurrBrightness(currentBrightness);
      })
      .catch((e) => {
        print(e);
        return 0;
      });
  };
  monitorFile(
    `/sys/class/backlight/${backlightFile}/actual_brightness`,
    updateBrightness,
  );

  // get max brightness once
  execAsync(["brightnessctl", "max"])
    .then((out) => {
      const maxBrightness = parseInt(out);
      if (isNaN(maxBrightness)) {
        print(`Error parsing max brightness. Got: ${out}`);
        return;
      }

      setMaxBrightness(maxBrightness);
    })
    .catch((e) => print(e));

  updateBrightness();

  const brightness = createComputed(
    [maxBrightness, currBrightness],
    (max, curr) => ({
      max: max ?? 1,
      curr: curr ?? 0,
    }),
  );

  return (
    <GrackleLevel
      width={buttonWidth}
      maxValue={maxBrightness((b) => b ?? 1)}
      currentValue={currBrightness((b) => b ?? 0)}
      label={brightness(
        (obj) => `L: ${Math.round((obj.curr * 100) / obj.max)}`,
      )}
      onDragClick={(endValuePct) => {
        // this ensures smooth dragging for brightness setting
        setCurrBrightness(endValuePct * (maxBrightness.get() ?? 1));
        execAsync(["brightnessctl", "set", `${endValuePct * 100}%`]).catch(
          (e) => print(e),
        );
      }}
    />
  );
};
