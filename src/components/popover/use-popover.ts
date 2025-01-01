import {$, useContextProvider, useStore, useTask$} from "@builder.io/qwik";
import {popoverContextId, PopoverStore, Position} from "./main";
import {isServer} from "@builder.io/qwik/build";
import {flipPosition} from "./flip-position";
import {getViewPointerPosition} from "./get-view-pointer-position";
import {isOverflowing} from "./is-overflowing";
import {getViewBoxStyles} from "./get-view-box-styles";

export type PopoverProps = {
    closeOnEsc?: boolean,
    position?: Position,
    gutter?: number,
    distance?: number,
}

export function usePopover(props: PopoverProps) {
    const store = useStore<PopoverStore>({
        open: false,
        position: props.position || "bottom",
        pointerRef: null,
        triggerRef: null,
        viewRef: null,
        gutter: props.gutter ?? 10,
        closeOnEsc: props.closeOnEsc ?? true,
        x: 0,
        y: 0,
        distance: props.distance ?? 10
    }, {deep: false})

    const outsideClick = $((event: MouseEvent) => {
        console.log("aa")
        if (!store.open) return;
        let el = event.target as HTMLElement | null

        while (el) {
            if (el === store.pointerRef || el === store.triggerRef) {
                return
            }

            el = el.parentElement
        }

        store.open = false;
    })

    useContextProvider(popoverContextId, store)

    /**
     * outside click event register
     * Top-layer shenanigans
     */
    useTask$(({track, cleanup}) => {
        track(() => store.open)
        track(() => store.pointerRef)

        if (isServer) return

        if (store.open) {
            document.addEventListener("click", outsideClick)
            cleanup(() => document.removeEventListener("click", outsideClick))
        }

        try {
            if (store.open) {
                store.pointerRef?.showPopover()
            } else {
                store.pointerRef?.hidePopover()
            }
        } catch (_) {
            /** empty **/
        }
    })

    /**
     * Rendering process
     */
    useTask$(({track}) => {
        track(() => store.open)

        if (isServer) return

        const flippedPosition = flipPosition(store.position)

        const render = () => {
            if (store.open) requestAnimationFrame(render)

            const trigger = store.triggerRef?.getBoundingClientRect() as DOMRect

            let {x: pointerX, y: pointerY} = getViewPointerPosition(store.position, store.gutter, trigger)

            const viewRect = store.viewRef?.getBoundingClientRect()

            if (!viewRect) return

            const shouldFlip = isOverflowing(
                pointerX, pointerY, store.gutter, viewRect, store.position, store.distance
            )


            if (shouldFlip) {
                const newPositions = getViewPointerPosition(flippedPosition, store.gutter, trigger);

                pointerX = newPositions.x
                pointerY = newPositions.y;
            }


            Object.entries({
                top: "",
                bottom: "",
                left: "",
                right: "",
                ...getViewBoxStyles(shouldFlip ? flippedPosition : store.position)
            }).forEach(([k, v]) => {
                if (store.viewRef) {
                    store.viewRef.style[k as any] = v // :)
                }
            })

            if (store.pointerRef) {
                store.pointerRef.style.top = pointerY + "px"
                store.pointerRef.style.left = pointerX + "px"
            }
        }

        requestAnimationFrame(render)
    })
}
