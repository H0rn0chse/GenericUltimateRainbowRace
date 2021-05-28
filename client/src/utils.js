let start = Date.now();
export function guid () {
    start += 1;
    return start;
}

export function getRandomInt (max) {
    return Math.floor(Math.random() * Math.floor(max));
}
