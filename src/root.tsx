import { Popover } from "./components/popover";
import { component$, Fragment, useSignal, useStyles$ } from "@builder.io/qwik";
import { Modal, Panel } from "./components/modal/modal";

export default component$(() => {
  useStyles$(`
    .red {
        color: white;
        background: red;
        opacity: 0.75;
    }
    
    .blue {
        color: white;
        background: blue;
        opacity: 0.75;
    }
    
    .spin-me {
        
        animation:spin 2s linear infinite;
    }
    
    @keyframes spin { 
        100% { 
             
            transform:translateX(260px); 
        } 
    }
    
    *:focus {
        background: green !important;
    }
.panel{
    background-color: skyblue;
    transform-origin: center;
}
// .panel {
//         animation: openAnimation 2s ease-out forwards;
//     }    

    .panel[data-state="opening"] {
        animation: openAnimation 2s ease-out forwards;
    }

    .panel[data-state="closing"] {
        
        animation: openAnimation 2s ease-out reverse;
        
    }

    @keyframes openAnimation {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
        }
    `);

  const basePos = ["top", "bottom", "left", "right"].flatMap((i) => [
    `${i}-start`,
    `${i}-end`,
    `${i}`,
  ]) as any[];

  const visible = useSignal(false);

  return (
    <>
      <head>
        <meta charset="utf-8" />
        <title>Qwik Blank App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div class={""}>
          <button onClick$={() => (visible.value = true)}>click hej</button>

          <Modal.Root
            bind:visible={visible}
            closeOnEscape={true}
            position={"right"}
            onClose$={() => true}
          >
            <Modal.Backdrop class={"blue"} />
            <Modal.Panel>
              ahoj
              <button onClick$={() => (visible.value = false)}>hello</button>
            </Modal.Panel>
          </Modal.Root>

          {basePos.map((i) => (
            <Fragment key={i}>
              <h1>{i}</h1>

              <Popover.Root position={i} gutter={10}>
                <Popover.Trigger class={"red"}>CLICK ME</Popover.Trigger>
                <Popover.View class={"blue"}>
                  <div style={{ width: 300 }}>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad
                    aliquid cumque debitis distinctio, expedita fuga ipsum
                    labore laborum magnam minus mollitia nam nisi quam sequi
                    tempora unde veritatis vitae voluptates.
                  </div>
                </Popover.View>
              </Popover.Root>

              <hr />
            </Fragment>
          ))}
        </div>
      </body>
    </>
  );
});
