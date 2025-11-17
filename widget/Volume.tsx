import { createBinding, With } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import AstalWp from "gi://AstalWp?version=0.1";
import { GrackleLevel } from "../components/GrackleLevel";

export const Volume = () => {
  const buttonWidth = 100;
  const maxVol = 1.5;
  const { defaultSpeaker: speaker } = AstalWp.get_default()!;

  const volume = createBinding(speaker, "volume");
  const label = volume((vol) => `V: ${Math.round(100 * (vol / maxVol))}`);

  return (
    <GrackleLevel
      width={buttonWidth}
      maxValue={maxVol}
      currentValue={volume}
      label={label}
    />
  );
};
