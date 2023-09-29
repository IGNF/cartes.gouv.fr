import BaseEvent from "ol/events/Event";
import { type Extent } from "ol/extent";

class ChangeExtentEvent extends BaseEvent {
    center: number[];
    extent: Extent;

    constructor(center: number[], extent: Extent) {
        super("extentchanged");
        this.center = center;
        this.extent = extent;
    }
}

export { ChangeExtentEvent };
