import { createState, With } from "ags";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import { GetInfoFromIP, IpInfo } from "../util";

const WireguardDetails = () => {
  const [ipDetails, setIpDetails] = createState<IpInfo | null>(null);

  // GetInfoFromIP()
  //   .then((info) => {
  //     if (info) {
  //       setIpDetails(info);
  //       print("IP Info updated");
  //     }
  //   })
  //   .catch((e) => {
  //     print(e);
  //   });

  return (
    <box>
      <label label="<b>woo</b><i>hmm</i>" wrap={true} useMarkup={true}></label>
      <label label="westford massachusetts"></label>
    </box>
  );
  // return (
  //   <With value={ipDetails}>
  //     {(ipDetails) =>
  //       ipDetails && (
  //         <box>
  //           <label label={`IP: ${ipDetails.ip}`}></label>
  //           <label
  //             label={`${ipDetails.city}, ${ipDetails.region} ${ipDetails.country}`}
  //           ></label>
  //         </box>
  //       )
  //     }
  //   </With>
  // );
};

// only handles 1 wireguard connection
export const WireguardStatus = () => {
  const getWgName = async () => {
    let query: string;
    try {
      query = await execAsync(["ip", "-o", "link", "show"]);
    } catch (e) {
      return null;
    }
    const matches = query.match(/(^|\n)\d+: (wg_[a-zA-Z0-9_]+)/);
    if (!matches || matches.length < 3) {
      return null;
    }
    return matches[2];
  };

  const wgInterfaces = createPoll(null, 2000, getWgName);
  const wgObj = wgInterfaces((i) => {
    if (!i) return null;

    const shortName = i
      .split("_")
      .reduce((prev, curr) => prev + curr[0].toUpperCase(), "");

    return {
      interface: i,
      shortName: shortName,
    };
  });

  return (
    <box>
      <With value={wgObj}>
        {(wgObj) =>
          wgObj && (
            <menubutton name="vpn-button" class="vpn-button">
              <box class="vpn-icon">
                <label label="WG" />
                <image
                  iconName="network-vpn-symbolic"
                  tooltipText={wgObj.interface}
                />
                <label label={wgObj.shortName} />
              </box>
              <popover>
                <WireguardDetails />
              </popover>
            </menubutton>
          )
        }
      </With>
    </box>
  );
};
