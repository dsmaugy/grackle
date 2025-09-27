import { createBinding, With } from "ags";
import AstalNetwork from "gi://AstalNetwork?version=0.1";

export const Wireless = () => {
  const network = AstalNetwork.get_default();
  const wifi = createBinding(network, "wifi");

  return (
    <box>
      <With value={wifi}>
        {(w) => {
          const activeAp = createBinding(w, "activeAccessPoint");
          return (
            <menubutton class="grackle-bar-item internet-button">
              <With value={activeAp}>
                {(ap) => {
                  const labelTxt = `I: ${ap.ssid}`;
                  return (
                    <levelbar
                      value={createBinding(ap, "strength")}
                      minValue={0}
                      maxValue={100}
                    >
                      <box>
                        <label label={labelTxt}></label>
                        <image iconName="network-wireless-symbolic" />
                      </box>
                    </levelbar>
                  );
                }}
              </With>
            </menubutton>
          );
        }}
      </With>
    </box>
  );
};
