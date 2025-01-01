import {Position} from "./main";

export function flipPosition(position: Position): Position {
    let res = ""

    if (position.startsWith("top")) {
        res = "bottom"
    } else if (position.startsWith("bottom")) {
        res = "top"
    } else if (position.startsWith("left")) {
        res = "right"
    } else {
        res = "left"
    }

    if (position.endsWith("start")) {
        res += "-start"
    } else if (position.endsWith("end")) {
        res += "-end"
    }

    return res as Position;
}

