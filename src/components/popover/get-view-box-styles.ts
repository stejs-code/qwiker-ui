import {Position} from "./main";

export function getViewBoxStyles(position: Position) {
    if (position.startsWith("top") || position.startsWith("bottom")) {
        const base = {
            [position.startsWith("top") ? "bottom" : "top"]: "0",
        }

        if (position.endsWith("start")) {
            return {
                ...base,
                left: "0",
            }
        }

        if (position.endsWith("end")) {
            return {
                ...base,
                right: "0",
            }
        }

        return {
            ...base,
            left: "50%",
            transform: "translateX(-50%)",
        }
    }

    const base = {
        [position.startsWith("left") ? "right" : "left"]: "0",
    }

    if (position.endsWith("start")) {
        return {
            ...base,
            top: "0",
        }
    }

    if (position.endsWith("end")) {
        return {
            ...base,
            bottom: "0",
        }
    }

    return {
        ...base,
        top: "50%",
        transform: "translateY(-50%)",
    }
}