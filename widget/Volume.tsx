import { createBinding, createComputed } from "ags";
import AstalWp from "gi://AstalWp?version=0.1";
import { GrackleLevel } from "../components/GrackleLevel";

export const Volume = () => {
  const buttonWidth = 100;
  const maxVol = 1.0;
  const { defaultSpeaker: speaker } = AstalWp.get_default()!;

  const volume = createBinding(speaker, "volume");
  const speakerStatus = createComputed([
    volume,
    createBinding(speaker, "mute"),
  ]);
  const label = speakerStatus((stat) =>
    stat[1] ? "V: ̶M̶" : `V: ${Math.round(100 * (stat[0] / maxVol))}`,
  );

  return (
    <GrackleLevel
      width={buttonWidth}
      maxValue={maxVol}
      currentValue={volume}
      label={label}
      onDragClick={(endValuePct) => {
        speaker.set_volume(endValuePct * maxVol);
      }}
    />
  );
};
