import { createBinding, createComputed, With } from "ags";
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

  const barInputs = createComputed([speakerStatus], (stat) => {
    return {
      volume: stat[0],
      label: stat[1] ? "V: ̶M̶" : `V: ${Math.round(100 * (stat[0] / maxVol))}`,
      className: stat[1] ? "grackle-level-red" : "grackle-level",
    };
  });

  return (
    <box>
      <With value={barInputs}>
        {(input) => {
          return (
            <GrackleLevel
              width={buttonWidth}
              maxValue={maxVol}
              currentValue={input.volume}
              label={input.label}
              onDragClick={(endValuePct) => {
                speaker.set_volume(endValuePct * maxVol);
              }}
              className={input.className}
            />
          );
        }}
      </With>
    </box>
  );
};
