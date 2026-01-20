import { createBinding, For } from "ags";
import AstalApps from "gi://AstalApps?version=0.1";
import AstalMpris from "gi://AstalMpris?version=0.1";

export function Media() {
  const mpris = AstalMpris.get_default();
  const apps = new AstalApps.Apps();
  const players = createBinding(mpris, "players");

  return (
    <box>
      <For each={players}>
        {(player) => {
          print("Media player detected:", player.busName);
          return (
            <box>
              <image file={createBinding(player, "coverArt")} />
            </box>
          );
        }}
      </For>
    </box>
  );
}
