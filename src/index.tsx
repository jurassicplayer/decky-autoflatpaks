import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  Navigation,
  staticClasses
} from "@decky/ui";
import {
  addEventListener,
  removeEventListener,
  call,
  callable,
  definePlugin,
  toaster,
  // routerHook
} from "@decky/api"
// import { call, callable } from "@decky/backend";
import { useState } from "react";
import { FaShip } from "react-icons/fa";

// import logo from "../assets/logo.png";

// interface AddMethodArgs {
//   left: number;
//   right: number;
// }

interface Error {
  name: string
  pythonTraceback: string
  stack: string
}

const add = callable<[first: number, second: number], number>("add");
const errorFunction = callable<[trigger: boolean], boolean>("callableError")
const startTimer = callable<[], void>("start_timer");
function Content() {
  const [result, setResult] = useState<number | undefined>();
  const [trigger, setTrigger] = useState<boolean>(false)

  const onClick = async () => {
    const result = await add(Math.random(), Math.random());
    setResult(result);
  };
  const onClickCallFunctionError = async () => {
    try {
      const result = await call<[trigger: boolean], boolean>("callableError", trigger);
      setTrigger(!trigger)
      console.log(result)
    } catch (error) {
      let traceback = (error as Error).pythonTraceback.split('Exception: ').slice(1)[0]
      console.log(traceback)
    }
  };
  const onClickCallableFunctionError = async () => {
    try {
      const result = await errorFunction(trigger)
      setTrigger(!trigger)
      console.log(result)
    } catch (error) {
      let traceback = (error as Error).pythonTraceback.split('Exception: ').slice(1)[0]
      console.log(traceback)
    }
  }

  return (
    <PanelSection title="Panel Section">
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={onClickCallFunctionError}
        >Call function with error
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={onClickCallableFunctionError}
        >Callable function with error
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={onClick}
        >
          {result || "Add two numbers via Python"}
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => startTimer()}
        >
          {"Start Python timer"}
        </ButtonItem>
      </PanelSectionRow>

      {/* <PanelSectionRow>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={logo} />
        </div>
      </PanelSectionRow> */}

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Navigation.CloseSideMenus();
            Navigation.Navigate("/decky-plugin-test");
          }}
        >
          Router
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default definePlugin(() => {
  // serverApi.routerHook.addRoute("/decky-plugin-test", DeckyPluginRouterTest, {
  //   exact: true,
  // });
  // console.log("init plugin", call, callable)
  const listener = addEventListener<[
    test1: string,
    test2: boolean,
    test3: number
  ]>("test_event", (test1, test2, test3) => {
    console.log("Template got event", test1, test2, test3)
    toaster.toast({
      title: "template got event",
      body: `${test1}, ${test2}, ${test3}`
    });
  });
  return {
    name: "AutoFlatpaks",
    title: <div className={staticClasses.Title}>API v2 Example Plugin</div>,
    content: <Content />,
    icon: <FaShip />,
    onDismount() {
      console.log("Unloading")
      removeEventListener("test_event", listener);
      // serverApi.routerHook.removeRoute("/decky-plugin-test");
    },
  };
});
