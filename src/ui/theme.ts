import { Classes } from "@blueprintjs/core";
import { EvidTheme } from "./api";

export type ClassNames = {
    [className: string]: boolean
};

export function themeClasses(currentTheme: EvidTheme): ClassNames {
  const classes: { [className: string]: boolean} = {};
  classes[Classes.DARK] = currentTheme == "dark";
  return classes;
}