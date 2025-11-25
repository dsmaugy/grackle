import { createComputed, createState, With } from "ags";
import { monitorFile } from "ags/file";
import { Gtk } from "ags/gtk4";
import { exec, execAsync } from "ags/process";
import { GrackleLevel } from "../components/GrackleLevel";

export const Brightness = () => {
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
      max: max,
      curr: curr,
    }),
  );

  return (
    <box>
      <With value={brightness}>
        {(brightness) => {
          return (
            <GrackleLevel
              width={buttonWidth}
              maxValue={brightness.max ?? 0}
              currentValue={brightness.curr ?? 0}
              label={
                brightness.curr && brightness.max
                  ? `B: ${Math.round((brightness.curr / brightness.max) * 100)}`
                  : `B: ${brightness.curr ?? 0}`
              }
              onDragClick={(endValuePct) => {
                execAsync([
                  "brightnessctl",
                  "set",
                  `${endValuePct * 100}%`,
                ]).catch((e) => print(e));
              }}
            />
          );
        }}
      </With>
    </box>
  );
};
