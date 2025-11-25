import { Accessor, createComputed, createState, With } from "ags";
import { Gtk } from "ags/gtk4";

type GrackleBarProps = {
  width: number;
  currentValue: number;
  maxValue: number;
  label: string;
  onDragClick?: (endValuePct: number) => void;
  className?: string;
};

export const GrackleLevel = ({
  width,
  currentValue,
  maxValue,
  label,
  onDragClick,
  className = "grackle-level",
}: GrackleBarProps) => {
  return (
    <button
      class={`grackle-bar-item ${className}`}
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
                print("Drag end");
              });
              dragGesture.connect("drag-begin", (_, x) => {
                gestureStartX = x;
                print("Drag start");
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
      <levelbar
        value={Math.min(currentValue, maxValue)}
        minValue={0}
        maxValue={maxValue}
        widthRequest={width}
      >
        <box halign={Gtk.Align.CENTER}>
          <label label={label}></label>
        </box>
      </levelbar>
    </button>
  );
};
