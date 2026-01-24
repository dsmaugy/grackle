import { createBinding, createComputed } from "ags";
import AstalBattery from "gi://AstalBattery?version=0.1";

export const Battery = () => {
  const battery = AstalBattery.get_default();

  const pctBinding = createBinding(battery, "percentage");
  const chargeBinding = createBinding(battery, "charging");
  const pctLabel = createComputed(
    () => `B: ${Math.floor(pctBinding() * 100)} ${chargeBinding() ? "↑" : "↓"}`,
  );

  return (
    <levelbar
      class={chargeBinding(
        (b) =>
          "grackle-bar-item " +
          (b ? "grackle-battery charging" : "grackle-battery"),
      )}
      value={createBinding(battery, "percentage")}
      minValue={0}
      maxValue={1}
      widthRequest={70}
      $={(self) => {
        self.add_offset_value("low", 0.2);
        self.add_offset_value("medium", 0.7);
        self.add_offset_value("high", 1.0);
      }}
    >
      <label label={pctLabel} />
    </levelbar>
  );
};
