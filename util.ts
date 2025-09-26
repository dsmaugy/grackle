import { fetch } from "ags/fetch";
import GLib from "gi://GLib?version=2.0";

export interface IpInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
}

export const GetSvgIconPath = (iconName: string): string => {
  return GLib.build_filenamev([
    GLib.get_current_dir(),
    "external",
    "svg",
    iconName + ".svg",
  ]);
};

export const GetInfoFromIP = async () => {
  const res = await fetch("https://ipinfo.io/", {
    method: "GET",
  });
  if (!res.ok) return null;

  return res.json() as Promise<IpInfo>;
};
