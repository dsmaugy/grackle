import { createComputed, createState, With } from "ags";
import { monitorFile } from "ags/file";
import { Gtk } from "ags/gtk4";
import { exec, execAsync } from "ags/process";

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
      max: max,
      curr: curr,
    }),
  );

  return (
    <button
      class="grackle-bar-item internet-button"
      css="padding: 0;"
      $={(self) => {
        let gestureStartX = 0;
        const dragGesture = new Gtk.GestureDrag();

        dragGesture.connect("drag-update", (_, x, y) => {
          const dragPct = Math.max(
            Math.min((gestureStartX + x) / buttonWidth, 1),
            0,
          );
          print(`Dragged: X=${x}, Y=${y}. PCT: ${dragPct}%`);
          setCurrBrightness(dragPct * (maxBrightness.get() ?? 1));
          execAsync(["brightnessctl", "set", `${dragPct * 100}%`]).catch((e) =>
            print(e),
          );
        });
        dragGesture.connect("drag-end", () => {
          self.remove_controller(dragGesture);
          self.add_controller(dragGesture);
        });
        dragGesture.connect("drag-begin", (_, x) => {
          gestureStartX = x;
        });

        const clickGesture = new Gtk.GestureClick();
        clickGesture.connect("pressed", (_, n_press, x) => {
          print(`Clicked at ${x}`);
          const clickPct = Math.max(Math.min(x / buttonWidth, 1), 0);

          setCurrBrightness(clickPct * (maxBrightness.get() ?? 1));
          execAsync(["brightnessctl", "set", `${clickPct * 100}%`]).catch((e) =>
            print(e),
          );
          self.remove_controller(clickGesture);
          self.add_controller(clickGesture);
        });

        self.add_controller(clickGesture);
        self.add_controller(dragGesture);
      }}
    >
      <With value={brightness}>
        {(brightness) => {
          const max = brightness?.max ?? 1;
          const curr = brightness?.curr ?? 0;
          const currPct = Math.round((curr / max) * 100);
          return (
            <levelbar
              value={curr}
              minValue={0}
              maxValue={max}
              widthRequest={buttonWidth}
            >
              <box halign={Gtk.Align.CENTER}>
                <label label={`L: ${currPct}`}></label>
              </box>
            </levelbar>
          );
        }}
      </With>
    </button>
  );
};
