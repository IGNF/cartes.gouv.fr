export const delta = {
    seconds: function (seconds: number = 1) {
        return seconds * 1000;
    },
    minutes: function (minutes: number = 1) {
        return minutes * 60 * 1000;
    },
    hours: function (hours: number = 1) {
        return hours * 60 * 60 * 1000;
    },
};
