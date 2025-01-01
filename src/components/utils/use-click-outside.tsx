import {isSignal, QRL, Signal} from "@builder.io/qwik";
import {$, useOnDocument} from "@builder.io/qwik";

type Ref = Signal<HTMLElement | undefined> | HTMLElement | null;

export const useClickOutside = (
    ref: Ref[] | Ref,
    onClickOut: QRL<(event: Event, ref?: Ref) => void>
) => {
    const derivedRef = [ref].flat().map(i => isSignal(i) ? i.value : i);

    useOnDocument(
        "click",
        $((event) => {
            if (!derivedRef) {
                return;
            }

            const target = event.target as HTMLElement;

            let i = 0
            while (!derivedRef[i]?.contains(target)) {
                if (i === derivedRef.length) {
                    return;
                }
                i++;
            }

            onClickOut(event, derivedRef[i]);
        })
    );
};