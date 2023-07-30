import { Fragment, useRef, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Slider } from "@material-tailwind/react/src/components/Slider/index";
import { scaleBetween } from "../../helpers/scalebetween";

export default function SettingsModal({ open, setOpen }) {
  const [SERVER_BASE_URL, setBaseUrl] = useState("http://localhost:58000");
  const [defaultUpdatePath, setDefaultUpdatePath] = useState();
  const [updatePath, setUpdatePath] = useState();
  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined")
        setBaseUrl(await window.electronAPI.getServerBaseURL());
      setDefaultUpdatePath(await window.electronAPI.getDefaultUpdatePath());
    })();
  }, [typeof window]);

  const cancelButtonRef = useRef(null);

  const [noiseSuppression, setNoiseSuppression] = useState(20);

  const min = 800;
  const max = 1600;
  const step = 100;

  const [latency, setLatency] = useState(0);
  const realLatency = scaleBetween(latency, min, max, 0, 100) / 2;

  const [shareData, setShareData] = useState(true);
  const [sessionRecording, setSessionRecording] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("MV_UPDATE_PATH"))
      setUpdatePath(localStorage.getItem("MV_UPDATE_PATH"));
    if (localStorage.getItem("MV_SHARE_DATA"))
      setShareData(
        localStorage.getItem("MV_SHARE_DATA") === "true" ? true : false
      );
    if (localStorage.getItem("MV_SESSION_RECORDING"))
      setSessionRecording(
        localStorage.getItem("MV_SESSION_RECORDING") === "true" ? true : false
      );
    if (localStorage.getItem("MV_LATENCY"))
      setLatency(localStorage.getItem("MV_LATENCY"));
    if (localStorage.getItem("MV_NOISE_SUPPRESSION"))
      setNoiseSuppression(localStorage.getItem("MV_NOISE_SUPPRESSION"));
  }, [open]);

  useEffect(() => {
    (async () => {
      try {
        localStorage.setItem("MV_LATENCY", latency);
        await fetch(
          `${SERVER_BASE_URL}/callback-latency-ms?value=${realLatency}`,
          {
            method: "GET",
          }
        );
      } catch {
        setTimeout(async () => {
          try {
            localStorage.setItem("MV_LATENCY", latency);
            await fetch(
              `${SERVER_BASE_URL}/callback-latency-ms?value=${realLatency}`,
              {
                method: "GET",
              }
            );
          } catch {
            console.log("error settings callback latency");
          }
        }, 2000);
      }
    })();
  }, [latency]);

  useEffect(() => {
    (async () => {
      try {
        localStorage.setItem("MV_NOISE_SUPPRESSION", noiseSuppression);
        await fetch(
          `${SERVER_BASE_URL}/noise-suppression-threshold?value=${
            noiseSuppression / 20
          }`,
          { method: "GET" }
        );
      } catch {
        setTimeout(async () => {
          try {
            localStorage.setItem("MV_NOISE_SUPPRESSION", noiseSuppression);
            await fetch(
              `${SERVER_BASE_URL}/noise-suppression-threshold?value=${
                noiseSuppression / 20
              }`,
              { method: "GET" }
            );
          } catch {
            console.log("Error setting noise suppression server-side");
          }
        }, 2000);
      }
    })();
  }, [noiseSuppression]);

  const handleShareData = async (value) => {
    window.localStorage.setItem("MV_SHARE_DATA", value);
    try {
      await fetch(`${SERVER_BASE_URL}/data-share?value=${value}`, {
        method: "GET",
      });
    } catch (error) {
      console.log(`GET /data-share failed with error: ${error}`);
    }

    setShareData(value);
  };

  const handleSessionRecording = async (value) => {
    window.localStorage.setItem("MV_SESSION_RECORDING", value);
    try {
      await fetch(`${SERVER_BASE_URL}/session-recording?value=${value}`, {
        method: "GET",
      });
    } catch (error) {
      console.log(`GET /session-recording failed with error: ${error}`);
    }

    setSessionRecording(value);
  };

  //TODO: Implement Supabase Auth
  useEffect(() => {
    fetch(
      [
        SERVER_BASE_URL,
        "/register-user",
        "?email=",
        "example@example.com",
        "&issuer=",
        "example",
        "&share_data=",
        shareData,
        "&noise_suppression=",
        noiseSuppression,
        "&callback_latency_ms_=",
        realLatency,
      ].join(""),
      { method: "GET" }
    ).catch((error) => {
      console.log(`register user failed: ${error}`);
    });
  }, []);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-700 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-slate-700 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-slate-700 px-8 py-4">
                  <div className="">
                    <div className="  mt-1 text-center  sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-white"
                      >
                        Settings
                      </Dialog.Title>
                      <div className="mt-4 flex justify-between items-center">
                        <label
                          className="text-sm text-white
                          "
                          htmlFor="noise-suppression"
                        >
                          Latency: {realLatency * 2}ms
                        </label>
                        <div className="pl-8">
                          <Slider
                            color="red"
                            value={latency}
                            onChange={(e) => {
                              let scaledToLatency = scaleBetween(
                                parseInt(e.target.value),
                                min,
                                max,
                                0,
                                100
                              );
                              let scaledToLatencyStep =
                                Math.round(scaledToLatency / step) * step;
                              let scaledBackToPercent = scaleBetween(
                                scaledToLatencyStep,
                                0,
                                100,
                                min,
                                max
                              );
                              setLatency(scaledBackToPercent);
                            }}
                            min={0}
                            max={100}
                            step={1}
                            data-tip={"number"}
                            trackClassName="[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent rounded-full !bg-slate-600"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-white">
                          <div className="flex">
                            <div className=" w-full flex items-center text-white">
                              Session Recording{" "}
                            </div>
                            <div className="flex items-end justify-end">
                              <label
                                htmlFor="toggleB"
                                className="flex items-center cursor-pointer"
                              >
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    onChange={(e) => {
                                      handleSessionRecording(e.target.checked);
                                    }}
                                    checked={sessionRecording}
                                    id="toggleB"
                                    className="peer sr-only"
                                  />
                                  <div className="peer-checked:translate-x-full dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                                  <div className="block bg-gray-600 transition peer-checked:bg-[#ef4444] w-14 h-8 rounded-full"></div>
                                </div>
                              </label>
                            </div>
                          </div>
                        </p>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <label
                          className="text-sm text-white
                          "
                          htmlFor="noise-suppression"
                        >
                          Noise Suppression: {noiseSuppression / 20}
                        </label>
                        <div className="pl-8">
                          <Slider
                            color="red"
                            value={noiseSuppression}
                            onChange={(e) => {
                              setNoiseSuppression(e.target.value);
                            }}
                            min={0}
                            max={100}
                            step={10}
                            data-tip={"number"}
                            trackClassName="[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent rounded-full !bg-slate-600"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-white">
                          <div className="flex ">
                            <div className=" w-full flex items-center text-white">
                              Opt-in to sharing data{" "}
                            </div>
                            <div className="flex items-end justify-end w-full">
                              <label
                                htmlFor="toggleC"
                                className="flex items-center cursor-pointer"
                              >
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    id="toggleC"
                                    className="peer sr-only"
                                    onChange={(e) => {
                                      handleShareData(e.target.checked);
                                    }}
                                    checked={shareData}
                                  />

                                  <div className="peer-checked:translate-x-full dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                                  <div className="block bg-gray-600 transition peer-checked:bg-[#ef4444] w-14 h-8 rounded-full"></div>
                                </div>
                              </label>
                            </div>
                          </div>
                        </p>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-white">
                          <div className="flex ">
                            <div className=" w-full flex items-center text-white">
                              Update Path
                            </div>
                            <label
                              htmlFor="ctrl"
                              className="bg-slate-800 px-1 rounded-md"
                            >
                              {updatePath || defaultUpdatePath}
                              <input
                                type="button"
                                id="ctrl"
                                onClick={async () => {
                                  const folder =
                                    await window.electronAPI.showDirectoryPicker();
                                  console.log(folder);
                                  if (folder) {
                                    localStorage.setItem(
                                      "MV_UPDATE_PATH",
                                      folder
                                    );
                                    setUpdatePath(folder);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className=" px-4 py-3 gap-1 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-70 shadow-sm hover:bg-gray-300 sm:ml-3 sm:w-auto"
                    onClick={() => setOpen(false)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="mt-3 text-white hover:text-slate-700 inline-flex w-full justify-center rounded-md  px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
