"use client";

import { useMemo, useState } from "react";
import useArrayState from "use-array-state";

export default function MvmlUpdate() {
  const [value, valueActions] = useArrayState();

  useMemo(() => {
    if (typeof window !== "undefined") {
      (window as any).electronAPI.onLog(function (message) {
        console.log(value);
        console.log(value.concat(message));
        valueActions.push(message);
        console.log("f");
      });
      (window as any).electronAPI.onPreparing(function (message) {
        console.log("Recieved Preparation Message", message);
        console.log(value);
        console.log(value.concat("Preparing to begin installing mvml"));
        valueActions.push(value.concat("Preparing to begin installing mvml"));
        console.log("e");
      });
    }
  }, [typeof window !== "undefined"]);

  return (
    <div className="flex h-screen">
      <div className="m-auto ">
        {value.map((va) => {
          const v = va as string;
          return <div key={v}>{v}</div>;
        })}
      </div>
    </div>
  );
}
