import {Position} from "./main";

export function getViewPointerPosition(position: Position, gutter: number, rect: DOMRect): { x: number, y: number } {

    if (position.startsWith("top") || position.startsWith("bottom")) {
        const y = rect.top + (position.startsWith("top") ? -gutter : gutter + rect.height)
        if (position.endsWith("start")) {
            return {
                x: rect.left,
                y: y,
            }
        }

        if (position.endsWith("end")) {
            return {
                x: rect.left + rect.width,
                y: y,
            }
        }

        return {
            x: rect.left + rect.width / 2,
            y: y,
        }
    }

    const x = rect.left + (position.startsWith("left") ? -gutter : gutter + rect.width)

    if (position.endsWith("start")) {
        return {
            x: x,
            y: rect.top ,
        }
    }

    if (position.endsWith("end")) {
        return {
            x: x,
            y: rect.top  + rect.height,
        }
    }

    return {
        x: x,
        y: rect.top + rect.height / 2,
    }

}