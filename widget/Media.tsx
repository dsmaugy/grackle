import { createBinding, createEffect, createMemo, For } from "ags";
import { Gtk } from "ags/gtk4";
import AstalApps from "gi://AstalApps?version=0.1";
import AstalMpris from "gi://AstalMpris?version=0.1";
import Pango from "gi://Pango?version=1.0";

export function Media() {
  const mpris = AstalMpris.get_default();
  const apps = new AstalApps.Apps();
  const players = createBinding(mpris, "players");
  const maxChars = 15;
  const validPlayers = createMemo(() => {
    const validPlayers: AstalMpris.Player[] = [];
    players().forEach((p) => {
      const title = createBinding(p, "title")();
      const artist = createBinding(p, "artist")();

      if (title || artist) {
        validPlayers.push(p);
      }
    });

    return validPlayers;
  });
  createEffect(() => {
    const p = players();
    const v = validPlayers();
    print(`${v.length} / ${p.length} valid players`);
    p.forEach((p) => {
      print(p.busName);
    });
  });
  return (
    <box class={validPlayers((v) => (v.length > 0 ? "media-display" : ""))}>
      <For each={validPlayers}>
        {(player) => {
          print("Media player detected:", player.busName);
          print("Cover art:", player.coverArt);

          return (
            <box>
              <box overflow={Gtk.Overflow.HIDDEN} class={"media-art-box"}>
                <image
                  pixelSize={32}
                  file={createBinding(
                    player,
                    "coverArt",
                  )((s) => s ?? "static/images/chicken.png")}
                />
              </box>
              <box orientation={Gtk.Orientation.VERTICAL}>
                <label
                  ellipsize={Pango.EllipsizeMode.END}
                  selectable={true}
                  wrap={false}
                  maxWidthChars={maxChars}
                  halign={Gtk.Align.START}
                  label={createBinding(player, "title")((s) => s ?? "")}
                ></label>
                <label
                  ellipsize={Pango.EllipsizeMode.END}
                  selectable={true}
                  wrap={false}
                  maxWidthChars={maxChars}
                  halign={Gtk.Align.START}
                  label={createBinding(player, "artist")((s) => s ?? "")}
                ></label>
              </box>
              <button
                class={"media-status-button"}
                onClicked={() => {
                  player.play_pause();
                }}
              >
                <image
                  iconName={createBinding(
                    player,
                    "playbackStatus",
                  )((s) =>
                    s === AstalMpris.PlaybackStatus.PLAYING
                      ? "media-playback-pause-symbolic"
                      : "media-playback-start-symbolic",
                  )}
                />
              </button>
            </box>
          );
        }}
      </For>
    </box>
  );
}
