import { Accessor, createComputed, With } from "ags";
import { Gtk } from "ags/gtk4";

type GrackleBarProps = {
  width: number;
  currentValue: Accessor<number>;
  maxValue: number;
  isDraggable?: boolean;
  label: Accessor<string>;
};

export const GrackleLevel = ({
  width,
  currentValue,
  maxValue,
  isDraggable = false,
  label,
}: GrackleBarProps) => {
  const displayAttrs = createComputed(
    [currentValue, label],
    (value, label) => ({
      value: value,
      label: label,
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
          const dragPct = Math.max(Math.min((gestureStartX + x) / width, 1), 0);
          print(`Dragged: X=${x}, Y=${y}. PCT: ${dragPct}%`);
          // setCurrBrightness(dragPct * (maxBrightness.get() ?? 1));
          // execAsync(["brightnessctl", "set", `${dragPct * 100}%`]).catch((e) =>
          //   print(e),
          // );
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
          const clickPct = Math.max(Math.min(x / width, 1), 0);

          // setCurrBrightness(clickPct * (maxBrightness.get() ?? 1));
          // execAsync(["brightnessctl", "set", `${clickPct * 100}%`]).catch((e) =>
          //   print(e),
          // );
          self.remove_controller(clickGesture);
          self.add_controller(clickGesture);
        });

        self.add_controller(clickGesture);
        self.add_controller(dragGesture);
      }}
    >
      <With value={displayAttrs}>
        {(attrs) => {
          return (
            <levelbar
              value={attrs.value}
              minValue={0}
              maxValue={maxValue}
              widthRequest={width}
            >
              <box halign={Gtk.Align.CENTER}>
                <label label={attrs.label}></label>
              </box>
            </levelbar>
          );
        }}
      </With>
    </button>
  );
};
