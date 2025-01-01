import {component$, PropsOf, Slot, useContext} from "@builder.io/qwik";
import {popoverContextId} from "./main";

type TriggerProps = {} & PropsOf<"button">

export const Trigger = component$<TriggerProps>((rest) => {
    const store = useContext(popoverContextId)

    return <button ref={(ref) => store.triggerRef = ref} onClick$={() => store.open = !store.open} {...rest}>
        <Slot/>
    </button>
})