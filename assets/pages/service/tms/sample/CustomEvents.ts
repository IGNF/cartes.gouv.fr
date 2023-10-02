import BaseEvent from "ol/events/Event";

class ChangeExtentEvent extends BaseEvent {
    center: number[];
    area: string;

    constructor(center: number[], area: string) {
        super("extentchanged");

        this.center = center;
        this.area = area;
    }
}

export { ChangeExtentEvent };
