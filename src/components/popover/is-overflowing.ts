import {isServer} from "@builder.io/qwik/build";
import {Position} from "./main";

export function isOverflowing(pointerX: number, pointerY: number, gutter: number, viewRect: DOMRect, position: Position, minDistance: number = 0) {
    if (isServer) return false;

    const minY = viewRect.height + minDistance + gutter
    const maxY = window.innerHeight - viewRect.height - minDistance - gutter

    const minX = viewRect.width + minDistance + gutter
    const maxX = window.innerWidth - viewRect.width - minDistance - gutter

    if (position.startsWith("top")) {
        return pointerY < minY
    }

    if (position.startsWith("bottom")) {
        return pointerY > maxY
    }

    if (position.startsWith("left")) {
        return pointerX < minX
    }

    if (position.startsWith("right")) {
        return pointerX > maxX
    }

    return false;
}
