import { Extent } from "ol/extent";
import MapEvent from "ol/MapEvent";
import { transformExtent } from "ol/proj";

const drawExtent = (e: MapEvent, extent: Extent) => {
    if (!extent.length) {
        return;
    }

    const ext3857 = transformExtent(extent, "EPSG:4326", "EPSG:3857");

    const canvas = e.map.getViewport().querySelector("canvas");
    const context = canvas?.getContext("2d");
    if (canvas && context) {
        context.save();

        const firstPoint = e.map.getPixelFromCoordinate([ext3857[0], ext3857[1]]);
        const p2 = e.map.getPixelFromCoordinate([ext3857[0], ext3857[3]]);
        const p3 = e.map.getPixelFromCoordinate([ext3857[2], ext3857[3]]);
        const p4 = e.map.getPixelFromCoordinate([ext3857[2], ext3857[1]]);

        context.beginPath();

        context.moveTo(0, 0);
        context.lineTo(canvas.width, 0);
        context.lineTo(canvas.width, canvas.height);
        context.lineTo(0, canvas.height);
        context.lineTo(0, 0);
        context.closePath();

        context.moveTo(p4[0], p4[1]);
        context.lineTo(p3[0], p3[1]);
        context.lineTo(p2[0], p2[1]);
        context.lineTo(firstPoint[0], firstPoint[1]);
        context.lineTo(p4[0], p4[1]);
        context.closePath();

        context.fillStyle = "rgba(66, 73, 73, 0.6)";
        context.strokeStyle = "rgb(66, 73, 73)";
        context.lineWidth = 1;
        context.fill();
        context.stroke();
    }
};

export default drawExtent;
