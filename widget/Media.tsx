import {
  createBinding,
  createComputed,
  createEffect,
  createMemo,
  For,
  With,
} from "ags";
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
          const computed = createComputed(
            [createBinding(player, "title"), createBinding(player, "artist")],
            (t, a) => ({
              title: t,
              artist: a,
            }),
          );

          return (
            <box>
              <With value={computed}>
                {(c) => {
                  if (c.title || c.artist) {
                    return (
                      <box>
                        <image
                          pixelSize={32}
                          file={createBinding(
                            player,
                            "coverArt",
                          )((s) => s ?? "static/images/chicken.png")}
                        />
                        <box orientation={Gtk.Orientation.VERTICAL}>
                          <label
                            ellipsize={Pango.EllipsizeMode.END}
                            selectable={true}
                            wrap={false}
                            maxWidthChars={maxChars}
                            halign={Gtk.Align.START}
                            label={createBinding(
                              player,
                              "title",
                            )((s) => s ?? "")}
                          ></label>
                          <label
                            ellipsize={Pango.EllipsizeMode.END}
                            selectable={true}
                            wrap={false}
                            maxWidthChars={maxChars}
                            halign={Gtk.Align.START}
                            label={createBinding(
                              player,
                              "artist",
                            )((s) => s ?? "")}
                          ></label>
                        </box>
                      </box>
                    );
                  }
                }}
              </With>
            </box>
          );
        }}
      </For>
    </box>
  );
}
