import app from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import Hyprland from "gi://AstalHyprland?version=0.1";
import { createBinding, For, With } from "ags";
import AstalWp from "gi://AstalWp?version=0.1";
import AstalBattery from "gi://AstalBattery?version=0.1";
import AstalPowerProfiles from "gi://AstalPowerProfiles?version=0.1";
import AstalNetwork from "gi://AstalNetwork?version=0.1";
import AstalTray from "gi://AstalTray?version=0.1";
import AstalMpris from "gi://AstalMpris?version=0.1";
import AstalApps from "gi://AstalApps?version=0.1";
import GLib from "gi://GLib?version=2.0";

type StringMap = { [key: string]: string };

function Workspaces() {
  const hypr = Hyprland.get_default();

  const focusedWs = createBinding(hypr, "focused_workspace");
  const workspaces = createBinding(hypr, "workspaces");
  const workspacesReversed = workspaces((ws) =>
    ws.slice().sort((a, b) => a.get_id() - b.get_id()),
  );

  const wsMap: StringMap = {
    // "1": "𝍠",
    // "2": "𝍡",
    // "3": "𝍢",
    // "4": "𝍢",
    // "5": "𝍤",
    // "6": "𝍥",
    // "7": "𝍦",
    // "8": "𝍧",
    // "9": "𝍨",
    // "1": "I",
    // "2": "II",
    // "3": "III",
    // "4": "IV",
    // "5": "V",
    // "6": "VI",
    // "7": "VII",
    // "8": "VIII",
    // "9": "IX",
    "1": "𓅰",
    "2": "𓅺",
    "3": "𓅹",
    "4": "𓆏",
    "5": "𓆜",
    "6": "𝍥",
    "7": "𝍦",
    "8": "𝍧",
    "9": "𝍨",
  };

  return (
    <box>
      <For each={workspacesReversed}>
        {(ws) => (
          <box>
            <With value={focusedWs}>
              {(fws) => (
                <button
                  class={
                    "ws-button" +
                    (fws.get_id() == ws.get_id() ? " focused-workspace" : "")
                  }
                  onClicked={() =>
                    hypr.dispatch("workspace", ws.get_id().toString())
                  }
                >
                  {/* <label label={`${ws.get_name() ?? ""}`} /> */}
                  <label label={`${wsMap[ws.get_name()] ?? ""}`} />
                </button>
              )}
            </With>
          </box>
        )}
      </For>
    </box>
  );
}

function AudioOutput() {
  const { defaultSpeaker: speaker } = AstalWp.get_default()!;

  return (
    <menubutton>
      <image iconName={createBinding(speaker, "volumeIcon")} />
      <popover>
        <box>
          <slider
            widthRequest={260}
            onChangeValue={({ value }) => speaker.set_volume(value)}
            value={createBinding(speaker, "volume")}
          />
        </box>
      </popover>
    </menubutton>
  );
}

function Battery() {
  const battery = AstalBattery.get_default();

  const percent = createBinding(
    battery,
    "percentage",
  )((p) => `${Math.floor(p * 100)}%`);

  print(battery.percentage);
  return (
    <levelbar
      class={"grackle-battery"}
      value={createBinding(battery, "percentage")}
      minValue={0}
      maxValue={1}
      widthRequest={10}
      orientation={Gtk.Orientation.VERTICAL}
      inverted={true}
      $={(self) => {
        self.add_offset_value("low", 0.2);
        self.add_offset_value("medium", 0.7);
        self.add_offset_value("high", 1.0);
      }}
    >
      <label label={percent} />
    </levelbar>
  );
  // return (
  //   {/* <menubutton visible={createBinding(battery, "isPresent")}> */}
  //   {/*   <box> */}
  //   {/*     <image iconName={createBinding(battery, "iconName")} /> */}
  //   {/*     <label label={percent} /> */}
  //   {/*   </box> */}
  //   {/* </progress> */}
  // );
}

function Mpris() {
  const mpris = AstalMpris.get_default();
  const apps = new AstalApps.Apps();
  const players = createBinding(mpris, "players");

  return (
    <menubutton>
      <box>
        <For each={players}>
          {(player) => {
            const [app] = apps.exact_query(player.entry);
            return <image visible={!!app.iconName} iconName={app?.iconName} />;
          }}
        </For>
      </box>
      <popover>
        <box spacing={4} orientation={Gtk.Orientation.VERTICAL}>
          <For each={players}>
            {(player) => (
              <box spacing={4} widthRequest={200}>
                <box overflow={Gtk.Overflow.HIDDEN} css="border-radius: 8px;">
                  <image
                    pixelSize={64}
                    file={createBinding(player, "coverArt")}
                  />
                </box>
                <box
                  valign={Gtk.Align.CENTER}
                  orientation={Gtk.Orientation.VERTICAL}
                >
                  <label xalign={0} label={createBinding(player, "title")} />
                  <label xalign={0} label={createBinding(player, "artist")} />
                </box>
                <box hexpand halign={Gtk.Align.END}>
                  <button
                    onClicked={() => player.previous()}
                    visible={createBinding(player, "canGoPrevious")}
                  >
                    <image iconName="media-seek-backward-symbolic" />
                  </button>
                  <button
                    onClicked={() => player.play_pause()}
                    visible={createBinding(player, "canControl")}
                  >
                    <box>
                      <image
                        iconName="media-playback-start-symbolic"
                        visible={createBinding(
                          player,
                          "playbackStatus",
                        )((s) => s === AstalMpris.PlaybackStatus.PLAYING)}
                      />
                      <image
                        iconName="media-playback-pause-symbolic"
                        visible={createBinding(
                          player,
                          "playbackStatus",
                        )((s) => s !== AstalMpris.PlaybackStatus.PLAYING)}
                      />
                    </box>
                  </button>
                  <button
                    onClicked={() => player.next()}
                    visible={createBinding(player, "canGoNext")}
                  >
                    <image iconName="media-seek-forward-symbolic" />
                  </button>
                </box>
              </box>
            )}
          </For>
        </box>
      </popover>
    </menubutton>
  );
}

function Tray() {
  const tray = AstalTray.get_default();
  const items = createBinding(tray, "items");

  const init = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
    btn.menuModel = item.menuModel;
    btn.insert_action_group("dbusmenu", item.actionGroup);
    item.connect("notify::action-group", () => {
      btn.insert_action_group("dbusmenu", item.actionGroup);
    });
  };

  return (
    <box>
      <For each={items}>
        {(item) => (
          <menubutton $={(self) => init(self, item)}>
            <image gicon={createBinding(item, "gicon")} />
          </menubutton>
        )}
      </For>
    </box>
  );
}

function Wireless() {
  const network = AstalNetwork.get_default();
  const wifi = createBinding(network, "wifi");

  const sorted = (arr: Array<AstalNetwork.AccessPoint>) => {
    return arr
      .filter((ap) => !!ap.ssid)
      .sort((a, b) => b.strength - a.strength);
  };

  async function connect(ap: AstalNetwork.AccessPoint) {
    // connecting to ap is not yet supported
    // https://github.com/Aylur/astal/pull/13
    try {
      await execAsync(`nmcli d wifi connect ${ap.bssid}`);
    } catch (error) {
      // you can implement a popup asking for password here
      console.error(error);
    }
  }

  return (
    <box visible={wifi(Boolean)}>
      <With value={wifi}>
        {(wifi) =>
          wifi && (
            <menubutton>
              <image iconName={createBinding(wifi, "iconName")} />
              <popover>
                <box orientation={Gtk.Orientation.VERTICAL}>
                  <For each={createBinding(wifi, "accessPoints")(sorted)}>
                    {(ap: AstalNetwork.AccessPoint) => (
                      <button onClicked={() => connect(ap)}>
                        <box spacing={4}>
                          <image iconName={createBinding(ap, "iconName")} />
                          <label label={createBinding(ap, "ssid")} />
                          <image
                            iconName="object-select-symbolic"
                            visible={createBinding(
                              wifi,
                              "activeAccessPoint",
                            )((active) => active === ap)}
                          />
                        </box>
                      </button>
                    )}
                  </For>
                </box>
              </popover>
            </menubutton>
          )
        }
      </With>
    </box>
  );
}

function Clock({ format = "%H:%M" }) {
  const time = createPoll("", 1000, () => {
    return GLib.DateTime.new_now_local().format(format)!;
  });

  return (
    <menubutton>
      <label label={time} />
      <popover>
        <Gtk.Calendar />
      </popover>
    </menubutton>
  );
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
  // const time = createPoll("", 1000, "date");
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      visible
      name="bar"
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox cssName="centerbox">
        <box $type="start">
          <Workspaces />
        </box>

        <box $type="center">
          <Mpris />
        </box>

        <box $type="end">
          <AudioOutput />
          <Wireless />
          <Battery />
          <Clock />
          <Tray />
        </box>
      </centerbox>
    </window>
  );

  // return (
  //   <window
  //     visible
  //     name="bar"
  //     class="Bar"
  //     gdkmonitor={gdkmonitor}
  //     exclusivity={Astal.Exclusivity.EXCLUSIVE}
  //     anchor={TOP | LEFT | RIGHT}
  //     application={app}
  //   >
  //     <centerbox cssName="centerbox">
  //       <button
  //         $type="start"
  //         onClicked={() => execAsync("echo hello").then(console.log)}
  //         hexpand
  //         halign={Gtk.Align.CENTER}
  //       >
  //         <label label="Welcome to AGS!" />
  //       </button>
  //       {/* <box $type="center" /> */}
  //       <menubutton $type="end" hexpand halign={Gtk.Align.CENTER}>
  //         <label label={time} />
  //         <popover>
  //           <Gtk.Calendar />
  //         </popover>
  //       </menubutton>
  //
  //       <Workspaces hypr={hypr} />
  //     </centerbox>
  //   </window>
  // );
}
