import {createContextId} from "@builder.io/qwik";

export type PositionBase = "top" | "bottom" | "left" | "right"
export type Position = `${PositionBase}-start` | `${PositionBase}-end` | PositionBase;

// type CloseOn = "mouse-outside" | "click-outside"


export type PopoverStore = {
    open: boolean,
    position: Position,
    pointerRef: HTMLDivElement | null,
    triggerRef: HTMLButtonElement | null,
    viewRef: HTMLDivElement | null,
    gutter: number,
    distance: number,
    closeOnEsc: boolean,
    x: number,
    y: number,
}

export const popoverContextId = createContextId<PopoverStore>("cz.stejs.qwiker.popover")
