import Map from "ol/Map";
import Point from "ol/geom/Point";
import { buffer } from "ol/extent";
import { transformExtent } from "ol/proj";
import { optionsFromCapabilities } from "ol/source/WMTS";
import WMTS from "ol/source/WMTS";
import TileLayer from "ol/layer/Tile";
import ChangeExtentEvent from "./CustomEvents";

export default class SampleMap extends Map {
    constructor(options) {
        super(options);

        this._bottomLevel = this.getView().getZoom();
        this._size;

        // Traitement apres avoir recuperer le GetCapabilities
        //this.on("getcapabilities", (e) => this._handleGetCapabilities(e));
        this.on("moveend", () => {
            const extent = this._getExtent();
            this.dispatchEvent(new ChangeExtentEvent(extent));
        });
    }

    addBackgroundLayer(capabilities) {
        const wmtsOptions = optionsFromCapabilities(capabilities, {
            layer: "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2",
        });

        const layer = new TileLayer({
            opacity: 1,
            source: new WMTS(wmtsOptions),
        });
        this.addLayer(layer);
        this._initialize();

        layer.on("postrender", (e) => {
            this._drawExtent(e);
        });
    }

    setBottomLevel(bottomLevel) {
        // On remet le maxZoom a son etat original sinon this.getView().getZoomForResolution (ligne 63)
        // retourne le nouveau zoom max
        this.getView().setMaxZoom(this._bottomLevel);

        this._bottomLevel = bottomLevel;
        this._initialize();
    }

    _initialize() {
        const target = this.getTarget();
        if (!target) return;

        const numPixelsX = target.clientWidth;
        const numPixelsY = target.clientHeight;

        const view = this.getView();
        this._size = view.getResolutionForZoom(view.getZoom()) * 256 * 10;

        const resX = this._size / numPixelsX;
        const resY = this._size / numPixelsY;
        const resMax = Math.max(resX, resY);

        const z = Math.floor(view.getZoomForResolution(resMax));
        view.setZoom(z);
        view.setMaxZoom(z);
    }

    /**
     * Dessin du masque et de l'echantillon
     * @param {*} event
     */
    _drawExtent(e) {
        let dxy = this._size / this.getView().getResolutionForZoom(this.getView().getZoom());
        let dxy2 = dxy / 2;

        let ctx = e.context;
        let ratio = e.frameState.pixelRatio;

        ctx.save();
        ctx.scale(ratio, ratio);
        let cx = ctx.canvas.width / (2 * ratio);
        let cy = ctx.canvas.height / (2 * ratio);

        ctx.beginPath();

        // La partie noire opacité 0.3 (surface principale clockwise)
        ctx.moveTo(0, 0);
        ctx.lineTo(ctx.canvas.width, 0);
        ctx.lineTo(ctx.canvas.width, 0);
        ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
        ctx.lineTo(0, ctx.canvas.height);

        // l'echantillon (trou anti-clockwise)
        ctx.moveTo(cx + dxy2, cy - dxy2);
        ctx.lineTo(cx - dxy2, cy - dxy2);
        ctx.lineTo(cx - dxy2, cy + dxy2);
        ctx.lineTo(cx + dxy2, cy + dxy2);
        ctx.closePath();

        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255,255,255,1)";
        ctx.strokeRect(cx - dxy2, cy - dxy2, dxy, dxy);

        ctx.restore();
    }

    /**
     * Retourne l'extent de l'echantillon en lon,lat
     * @returns
     */
    _getExtent() {
        let point = new Point(this.getView().getCenter());

        let extent = point.getExtent();
        extent = buffer(extent, this._size / 2);
        return transformExtent(extent, "EPSG:3857", "EPSG:4326");
    }
}
