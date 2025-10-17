/* Copyright (c) 2024 P.Prevautel
    released under the CeCILL-B license (French BSD license)
    (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import * as olColor from "ol/color";
import Control from "ol/control/Control";

import "../../sass/pages/espaceco/drawcenter.scss";

type DisplayCenterOptions = {
    color?: number[] | string;
    width?: number;
};

const defaultColor = "#000";

/** DisplayCenter draw a target at the center of the map.
 * @param
 *  - color  {ol.Color or string} line color
 *	- width {integer} line width
 */
class DisplayCenterControl extends Control {
    constructor(options: DisplayCenterOptions) {
        const { color = defaultColor, width = 1 } = options;

        let c: string = defaultColor;
        try {
            if (Array.isArray(color)) {
                c = olColor.asString(color);
            } else if (typeof color === "string") {
                olColor.fromString(color) as olColor.Color;
                c = color;
            }
        } catch (_) {
            c = "#000";
        }

        const div = document.createElement("div");
        div.className = "ol-target ol-unselectable ol-control";
        div.style.setProperty("--drawcenter-background", c);
        div.style.setProperty("--drawcenter-width", `${width}px`);

        super({ element: div });
    }
}

export default DisplayCenterControl;
