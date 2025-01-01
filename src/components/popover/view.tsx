import {component$, PropsOf, Slot, useContext, useStylesScoped$} from "@builder.io/qwik";
import {popoverContextId} from "./main";
import {getViewBoxStyles} from "./get-view-box-styles";

type ViewProps = {} & Omit<PropsOf<"div">, "style">

export const View = component$<ViewProps>((rest) => {
    useStylesScoped$(`
    ::backdrop {
        display: none;
    }
    `)

    const store = useContext(popoverContextId)

    if (store.open) {
        return <div popover={"manual"} class={"blue"} ref={(ref) => store.pointerRef = ref} style={{
            position: "fixed",
            width: 0,
            border: "none",
            padding: 0,
            height: 0,
            margin: 0,
            overflow: "visible",
            zIndex: 1000,
            display: store.open ? "block" : "none",
        }}>

            <div ref={(ref) => store.viewRef = ref} style={{
                position: "absolute",
                ...getViewBoxStyles(store.position),
            }} {...rest}>
                <Slot/>
            </div>
        </div>
    }

    return ""
})
