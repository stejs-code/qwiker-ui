import {
  $,
  Slot,
  component$,
  useSignal,
  useTask$,
  type QRL,
  Signal,
  CSSProperties,
  useStore,
  NoSerialize,
  noSerialize,
  createContextId,
  useContextProvider,
  useContext,
  PropsOf,
} from "@builder.io/qwik";
import { isBrowser, isServer } from "@builder.io/qwik/build";
import { createFocusTrap } from "focus-trap";

type Position = "right" | "left" | "center";

type RootProps = {
  position?: Position;
  "bind:visible": Signal<boolean>;
  onClose$?: QRL<() => boolean | void>;
  onShow$?: QRL<() => void>;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  closeOnOutsideClick?: boolean;
  trapFocus?: boolean;

  // requestClose$?: QRL<() => boolean>;
};

type Store = Pick<RootProps, "onClose$" | "onShow$"> &
  Required<
    Pick<
      RootProps,
      | "position"
      | "closeOnEscape"
      | "closeOnBackdrop"
      | "closeOnOutsideClick"
      | "trapFocus"
    >
  > & {
    show: boolean;
    dialogRef: HTMLDivElement | null;
    modalRef: HTMLDivElement | null;

    nativeKeyDownFunc: NoSerialize<(e: KeyboardEvent) => void> | null;
    hasBackdrop: boolean;
    state: "open" | "opening" | "closing" | "closed";
  };

export const contextId = createContextId<Store>("cz.stejs.qwiker.modal");

export const Root = component$<RootProps>((props) => {
  const store = useStore<Store>({
    onClose$: props.onClose$,
    onShow$: props.onShow$,
    position: props.position ?? "center",
    closeOnEscape: props.closeOnEscape ?? true,
    closeOnBackdrop: props.closeOnBackdrop ?? true,
    closeOnOutsideClick: props.closeOnOutsideClick ?? true,
    trapFocus: props.trapFocus ?? true,
    show: props["bind:visible"].value,

    state: "closed",

    dialogRef: null,
    modalRef: null,
    nativeKeyDownFunc: null,
    hasBackdrop: false,
  });
  useContextProvider(contextId, store);

  /**
   * Binding signal to store.visible + onClose from signal change
   */
  useTask$(({ track }) => {
    track(props["bind:visible"]);

    if (!props["bind:visible"].value && isBrowser) {
      requestClose(store);
    } else {
      store.show = props["bind:visible"].value;
    }
  });

  useTask$(({ track }) => {
    track(() => store.show);

    props["bind:visible"].value = store.show;

    if (isBrowser) {
      store.state = store.show ? "opening" : "closing";
    }
  });

  /**
   * Top-layer shenanigans
   */
  useTask$(({ track }) => {
    track(() => store.state);
    track(() => store.dialogRef);

    if (isServer) return;

    try {
      if (store.state === "opening") {
        store.dialogRef?.showPopover();
      } else if (store.state === "closed") {
        store.dialogRef?.hidePopover();
      }
    } catch (e) {
      console.error("Qwicker modal:", e);
    }
  });

  /**
   * Esc preventing and scroll blocking and focus trap
   */
  useTask$(({ track, cleanup }) => {
    track(() => store.state);

    if (isServer) return;

    document.body.style.overflow = store.state === "open" ? "hidden" : "auto";

    cleanup(() => {
      document.body.style.overflow = "auto";
    });

    const nativeKeyDownDefinition = async function (e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();

        if (store.closeOnEscape) {
          requestClose(store);
        }
      }

      if (e.key === "a") {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (store.dialogRef) {
            selectText(store.dialogRef);
          }
        }
      }
    };

    if (!store.nativeKeyDownFunc) {
      store.nativeKeyDownFunc = noSerialize(nativeKeyDownDefinition);
    }

    if (store.state === "opening") {
      if (store.onShow$) {
        store.onShow$();
      }
    }

    if (store.state === "opening" || store.state === "open") {
      if (store.nativeKeyDownFunc) {
        document.addEventListener("keydown", store.nativeKeyDownFunc);
      }

      cleanup(
        () =>
          store.nativeKeyDownFunc &&
          document.removeEventListener("keydown", store.nativeKeyDownFunc)
      );
    }
  });

  useTask$(({ track, cleanup }) => {
    track(() => store.show);

    if (isServer) return;

    if (store.trapFocus) {
      // Defer focus trapping to after the render
      const registerFocusTrap = () => {
        if (store.show && store.dialogRef) {
          const focusTrap = createFocusTrap(store.dialogRef, {
            initialFocus: false,
          });

          try {
            focusTrap.activate();

            cleanup(() => {
              focusTrap.deactivate();
            });
          } catch (e) {
            requestAnimationFrame(registerFocusTrap);
          }
        }
      };

      requestAnimationFrame(registerFocusTrap);
    }
  });

  /**
   * Closing state
   */

  const endPartialState = useSignal<NoSerialize<() => any>>();

  useTask$(({ track, cleanup }) => {
    track(() => store.state);

    if (isServer) return;
    if (store.modalRef?.dataset) {
      store.modalRef.dataset.state = store.state;
    }
    const { animationDuration, transitionDuration } = getComputedStyle(
      store.modalRef!
    );

    console.log(animationDuration, transitionDuration);

    const hasAnimation =
      animationDuration !== "0s" || transitionDuration !== "0s";

    if (store.state === "opening") {
      endPartialState.value = noSerialize(() => (store.state = "open"));
    }

    if (store.state === "closing") {
      endPartialState.value = noSerialize(() => (store.state = "closed"));
    }

    if (!hasAnimation) {
      endPartialState.value!();
    }

    if (
      hasAnimation &&
      (store.state === "closing" || store.state === "opening")
    ) {
      store.modalRef?.addEventListener("animationend", endPartialState.value!);
      store.modalRef?.addEventListener("transitionend", endPartialState.value!);

      cleanup(() => {
        store.modalRef?.removeEventListener(
          "animationend",
          endPartialState.value!
        );
        store.modalRef?.removeEventListener(
          "transitionend",
          endPartialState.value!
        );
      });
    }
  });

  return (
    <div
      ref={(ref) => (store.dialogRef = ref)}
      popover={"manual"}
      style={{
        inset: 0,
        width: "100%",
        height: "100%",
        display: store.state !== "closed" ? "flex" : "none",
        position: "absolute",
        margin: 0,
        maxWidth: "unset",
        border: "none",
        padding: 0,
        maxHeight: "unset",
        background: "unset",
        pointerEvents: "none",
      }}
    >
      <Slot />
    </div>
  );
});

type BackdropProps = Omit<PropsOf<"div">, "style"> & { style?: CSSProperties };
export const Backdrop = component$<BackdropProps>(({ style, ...rest }) => {
  const store = useContext(contextId);

  const onClick = $(async () => {
    if (store.closeOnBackdrop) {
      requestClose(store);
    }
  });

  useTask$(({ track, cleanup }) => {
    track(() => store.hasBackdrop);

    if (!store.hasBackdrop) {
      store.hasBackdrop = true;
    }

    cleanup(() => (store.hasBackdrop = false));
  });

  return (
    <div
      onClick$={store.closeOnBackdrop ? onClick : undefined}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "all",
        ...style,
      }}
      {...rest}
    >
      <Slot />
    </div>
  );
});

type PanelProps = Omit<PropsOf<"div">, "style"> & { style?: CSSProperties };
export const Panel = component$<PanelProps>(({ style, ...rest }) => {
  const store = useContext(contextId);

  return (
    <div
      ref={(ref) => (store.modalRef = ref)}
      class={"panel red"}
      data-state={store.state}
      style={{ ...getPanelStyles(store.position), ...style }}
      {...rest}
    >
      <Slot />
    </div>
  );
});

export function getPanelStyles(position: Position): CSSProperties | undefined {
  const base: CSSProperties = { pointerEvents: "all" };
  if (position === "right")
    return {
      ...base,
      marginLeft: "auto",
    };

  if (position === "left")
    return {
      ...base,
      marginRight: "auto",
    };

  if (position === "center")
    return {
      ...base,
      marginLeft: "auto",
      marginRight: "auto",
    };
}

export const requestClose = $(async (store: Store) => {
  if (store.onClose$) {
    const res = await store.onClose$();

    if (typeof res === "boolean") {
      store.show = !res;
    } else {
      store.show = false;
    }
  }
  store.show = false;
});

export const Modal = {
  Root,
  Backdrop,
  Panel,
};

export function selectText(el: HTMLElement) {
  if (window.getSelection) {
    const range = document.createRange();
    range.selectNode(el);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
  }
}
