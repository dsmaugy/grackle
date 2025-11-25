import { Accessor, createComputed, createState, With } from "ags";
import { Gtk } from "ags/gtk4";

type GrackleBarProps = {
  width: number;
  currentValue: Accessor<number>;
  maxValue: number | Accessor<number>;
  label: string | Accessor<string>;
  onDragClick?: (endValuePct: number) => void;
  className?: Accessor<string>;
};

export const GrackleLevel = ({
  width,
  currentValue,
  maxValue,
  label,
  onDragClick,
  className = createState("grackle-level")[0],
}: GrackleBarProps) => {
  const displayAttrs = createComputed(
    [
      currentValue,
      typeof label === "function" ? label : createState(label)[0],
      typeof maxValue === "function" ? maxValue : createState(maxValue)[0],
    ],
    (value, label, maxValue) => ({
      value: value,
      label: label,
      maxValue: maxValue,
    }),
  );

  return (
    <button
      class={className((cls) => `grackle-bar-item ${cls}`)}
      css="padding: 0;"
      $={
        onDragClick !== undefined
          ? (self) => {
              let gestureStartX = 0;
              const dragGesture = new Gtk.GestureDrag();

              dragGesture.connect("drag-update", (_, x, y) => {
                const dragPct = Math.max(
                  Math.min((gestureStartX + x) / width, 1),
                  0,
                );
                print(`Dragged: X=${x}, Y=${y}. PCT: ${dragPct}%`);
                onDragClick(dragPct);
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
                onDragClick(clickPct);

                self.remove_controller(clickGesture);
                self.add_controller(clickGesture);
              });

              self.add_controller(clickGesture);
              self.add_controller(dragGesture);
            }
          : () => null
      }
    >
      <With value={displayAttrs}>
        {(attrs) => {
          return (
            <levelbar
              value={Math.min(attrs.value, attrs.maxValue)}
              minValue={0}
              maxValue={attrs.maxValue}
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
