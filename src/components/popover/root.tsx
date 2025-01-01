import {PopoverProps, usePopover} from "./use-popover";
import {component$, Slot} from "@builder.io/qwik";


export const Root = component$<PopoverProps>((props) => {
    usePopover(props)

    return <Slot/>
})