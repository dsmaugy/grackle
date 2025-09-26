import { createBinding, For, With } from "ags";
import Hyprland from "gi://AstalHyprland?version=0.1";

type StringMap = { [key: string]: string };

export const Workspaces = () => {
  const hypr = Hyprland.get_default();

  const focusedWs = createBinding(hypr, "focused_workspace");
  const workspaces = createBinding(hypr, "workspaces");
  const workspacesReversed = workspaces((ws) =>
    ws.slice().sort((a, b) => a.get_id() - b.get_id()),
  );

  const wsMap: StringMap = {
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
                  onClicked={() => {
                    // some weird bug where hyprland will try to go to workspace that doesn't exist
                    if (fws.get_id() != ws.get_id()) {
                      hypr.dispatch("workspace", ws.get_id().toString());
                    }
                  }}
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
};
