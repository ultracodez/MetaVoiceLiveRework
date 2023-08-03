"use client";

import { useMemo, useState } from "react";
import useArrayState from "use-array-state";

export default function MvmlUpdate() {
  const [value, valueActions] = useArrayState();

  useMemo(() => {
    if (typeof window !== "undefined") {
      (window as any).electronAPI.onLog(function (message) {
        console.log(value);

        valueActions.push(message);
      });
      (window as any).electronAPI.onPreparing(function (message) {
        console.log("Recieved Preparation Message", message);
        valueActions.push(
          value.concat({
            msg: "Preparing to begin installing mvml...",
            type: "prepare",
          })
        );
      });
    }
  }, [typeof window !== "undefined"]);

  return (
    <div className="flex h-screen bg-slate-800">
      <div
        className="m-auto 
        text-white w-1/2"
      >
        <div className=" text-center text-4xl font-bold">
          Downloading New AI Package...
        </div>
        <div className=" mt-6 max-h-96 overflow-auto bg-slate-700/75 p-4 rounded-lg scroll-smooth text-slate-300">
          {value.map((va) => {
            const v = va as any;
            return (
              <div key={v.msg}>
                &gt; {v.msg} {v.type}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
