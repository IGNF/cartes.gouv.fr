import Map from "ol/Map";
import type View from "ol/View";
import type { Control } from "ol/control";
import { buffer } from "ol/extent";
import WKT from "ol/format/WKT";
import Point from "ol/geom/Point";
import { fromExtent } from "ol/geom/Polygon";
import type { Interaction } from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import { toLonLat, transformExtent } from "ol/proj";
import RenderEvent from "ol/render/Event";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";

import type { Capabilities } from "../../../../../@types/ol";
import olDefaults from "../../../../../data/ol-defaults.json";
import { ChangeExtentEvent } from "./CustomEvents";

export const EXTENT_CHANGED_EVENT = "extentchanged" as const;

export interface SampleMapOptions {
    target?: string | HTMLElement;
    view?: View;
    interactions?: Interaction[];
    controls?: Control[];
}

export default class SampleMap extends Map {
    private _size!: number;

    constructor(options: SampleMapOptions) {
        super(options);

        this.on("moveend", () => {
            const center3857 = this.getView().getCenter();
            if (!center3857) return;
            const center = toLonLat(center3857);
            const area = this._getArea();
            this.dispatchEvent(new ChangeExtentEvent(center, area));
        });
    }

    addBackgroundLayer(capabilities: Capabilities): void {
        // En strict mode (dev) cette fonction est appelée deux fois
        if (this.getLayers().getLength()) {
            return;
        }

        const wmtsOptions = optionsFromCapabilities(capabilities, {
            layer: olDefaults.default_background_layer,
        });

        if (!wmtsOptions) {
            // Impossible de construire la couche WMTS (capabilities incomplètes)
            return;
        }

        const layer = new TileLayer({
            opacity: 1,
            source: new WMTS(wmtsOptions),
        });
        this.addLayer(layer);
        this._initialize();

        layer.on("postrender", (e: RenderEvent) => {
            this._drawExtent(e);
        });
    }

    private _initialize(): void {
        const targetEl = this.getTargetElement();
        if (!targetEl) return;

        const numPixelsX = targetEl.clientWidth;
        const numPixelsY = targetEl.clientHeight;

        const view = this.getView();
        const zoom = view.getZoom();
        if (zoom === undefined) return;
        const resForZoom = view.getResolutionForZoom(zoom);
        if (resForZoom === undefined) return;

        this._size = resForZoom * 256 * 10;

        const resX = this._size / numPixelsX;
        const resY = this._size / numPixelsY;
        const resMax = Math.max(resX, resY);

        const zoomForRes = view.getZoomForResolution(resMax);
        if (zoomForRes !== undefined) {
            const z = Math.floor(zoomForRes);
            view.setZoom(z);
            view.setMaxZoom(z);
        }
    }

    /**
     * Dessin du masque et de l'échantillon
     */
    private _drawExtent(e: RenderEvent): void {
        if (!this._size || !e.frameState || !e.context || !(e.context instanceof CanvasRenderingContext2D)) return;

        const view = this.getView();
        const currentZoom = view.getZoom();
        if (currentZoom === undefined) return;
        const resForZoom = view.getResolutionForZoom(currentZoom);
        if (resForZoom === undefined) return;
        const dxy = this._size / resForZoom;
        const dxy2 = dxy / 2;

        const ctx = e.context;
        const ratio = e.frameState.pixelRatio;

        ctx.save();
        ctx.scale(ratio, ratio);
        const cx = ctx.canvas.width / (2 * ratio);
        const cy = ctx.canvas.height / (2 * ratio);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(ctx.canvas.width, 0);
        ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
        ctx.lineTo(0, ctx.canvas.height);

        ctx.moveTo(cx + dxy2, cy - dxy2);
        ctx.lineTo(cx - dxy2, cy - dxy2);
        ctx.lineTo(cx - dxy2, cy + dxy2);
        ctx.lineTo(cx + dxy2, cy + dxy2);
        ctx.closePath();

        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        ctx.strokeRect(cx - dxy2, cy - dxy2, dxy, dxy);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Retourne la surface de l'échantillon en WKT (lon, lat)
     */
    private _getArea(): string {
        const center = this.getView().getCenter();
        if (!center) return "";
        const point = new Point(center);
        let extent = point.getExtent();
        extent = buffer(extent, this._size / 2);
        extent = transformExtent(extent, "EPSG:3857", "EPSG:4326");

        const polygon = fromExtent(extent);
        const wkt = new WKT();
        return wkt.writeGeometry(polygon, { dataProjection: "EPSG:4326", decimals: 5 });
    }
}
