import BaseEvent from "ol/events/Event";
import { type Extent } from "ol/extent";

class ChangeExtentEvent extends BaseEvent {
    extent: Extent;

    constructor(extent: Extent) {
        super("extentchanged");
        this.extent = extent;
    }
}

export { ChangeExtentEvent };
