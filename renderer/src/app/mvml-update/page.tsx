"use client";

import { useMemo, useState, useRef } from "react";
import useArrayState from "use-array-state";
import * as ScrollArea from "@radix-ui/react-scroll-area";

export default function MvmlUpdate() {
  const [value, valueActions] = useArrayState();
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const ref = useRef(null);
  const ref2 = useRef(null);

  useMemo(() => {
    if (typeof window !== "undefined") {
      (window as any).electronAPI.onLog(function (message) {
        if (!value.includes(message)) valueActions.push(message);
        const rect = ref2.current.getBoundingClientRect();
        const bottom =
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <=
            (window.innerWidth || document.documentElement.clientWidth);
        if (bottom && ref.current) ref.current.scrollIntoView();
      });
      (window as any).electronAPI.onPreparing(function (message) {
        console.log("Recieved Preparation Message", message);
        valueActions.push({
          msg: "Preparing to begin installing mvml...",
          type: "prepare",
        });
      });
    }
  }, [typeof window !== "undefined"]);

  const moddedValue = value
    .filter((val: any) => val.type !== "percent")
    .concat(value.filter((val: any) => val.type === "percent").at(-1));

  console.log(moddedValue);
  return (
    <div className="flex h-screen bg-slate-800">
      <div
        className="m-auto 
        text-white w-8/12 h-2/3"
      >
        <div className=" text-center text-4xl font-bold">
          Downloading New AI Package...
        </div>
        <ScrollArea.Root
          scrollHideDelay={200}
          className="mt-6 h-full  bg-slate-700/75 p-4 rounded-lg  text-slate-300"
        >
          <ScrollArea.Viewport className="w-full h-full">
            {moddedValue.map((va) => {
              if (!va) return;

              const v = va as any;
              switch (v.type) {
                case "log":
                  return (
                    <div className="break-all" key={v.msg}>
                      {" "}
                      {v.msg}
                    </div>
                  );
                case "prepare":
                  return (
                    <div className="text-blue-400 break-all" key={v.msg}>
                      {v.msg}
                    </div>
                  );
                case "info":
                  return (
                    <div className="text-slate-400 break-all" key={v.msg}>
                      {v.msg}
                    </div>
                  );
                default:
                  return (
                    <div className="break-all" key={v.msg}>
                      {" "}
                      {v.msg}
                    </div>
                  );
              }
            })}

            <div className="invisible h-2" ref={ref2} />
            <div className="invisible h-6" ref={ref} />
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="flex select-none touch-none p-0.5 bg-white/10 transition-colors duration-[160ms] ease-out data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="flex-1 bg-white/50 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
    </div>
  );
}
