"use client";
import Carousel from "../components/Carousel/Carousel";
import {
  IoArrowForward,
  IoCaretUp,
  IoMic,
  IoMicOutline,
  IoVolumeHighOutline,
} from "react-icons/io5";
import Settings from "../components/Nav/Settings";
import { useState, useEffect } from "react";
import type DeviceMap from "../helpers/devicemaptypes";
import ResultDrawer from "../components/ResultDrawer";
import { baseVoicesTemp } from "../helpers/tempconstants";
import { toast } from "react-hot-toast";

function App() {
  const [SERVER_BASE_URL, setBaseUrl] = useState("http://localhost:58000");
  const [appVersion, setAppVersion] = useState(undefined);
  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined")
        setBaseUrl(await (window as any).electronAPI.getServerBaseURL());
      setAppVersion(await (window as any).electronAPI.getAppVersion());
      setBaseVoices(await (window as any).electronAPI.getBaseVoices());
    })();
  }, [typeof window]);

  const [converting, setConverting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("none");
  const [areFramesDropping, setAreFramesDropping] = useState(null);
  const [deviceMap, setDeviceMap] = useState<DeviceMap>();
  const [inputDeviceId, setInputDeviceId] = useState("");
  const [outputDeviceId, setOutputDeviceId] = useState("");
  const [convertStartTime, setConvertStartTime] = useState<number>();
  const [originalAudio, setOriginalAudio] = useState<string>();
  const [convertedAudio, setConvertedAudio] = useState<string>();
  const [baseVoices, setBaseVoices] = useState(baseVoicesTemp);
  const [sessionRecordingUI, setSessionRecordingUI] = useState(true);

  function handleConverting(newState) {
    if (
      newState &&
      inputDeviceId !== "" &&
      outputDeviceId !== "" &&
      selectedVoice
    ) {
      setProcessing(true);
      const convertStartTime_ = Date.now();
      setConvertStartTime(convertStartTime_);
      console.log(
        "e",
        [
          SERVER_BASE_URL,
          "/start-convert",
          "?input_device_idx=",
          inputDeviceId,
          "&output_device_idx=",
          outputDeviceId,
          "&app_version=",
          appVersion || "0.3.0", //process.env.npm_package_version
          "&target_speaker=",
          selectedVoice.toLowerCase(),
        ].join("")
      );
      fetch(
        [
          SERVER_BASE_URL,
          "/start-convert",
          "?input_device_idx=",
          inputDeviceId,
          "&output_device_idx=",
          outputDeviceId,
          "&app_version=",
          appVersion || "0.3.0", //process.env.npm_package_version
          "&target_speaker=",
          selectedVoice.toLowerCase(),
        ].join(""),
        { method: "GET", keepalive: true }
      )
        .then((_response) => {
          setProcessing(false);
          // TODO: @sidroopdaska, add comment - why did we move setButtonClicked(buttonClickedNewState) inside
          //       each of these statements, instead of after it?
          setConverting(newState);
        })
        .catch((error) => {
          console.log("Failed to start converting");
          // TODO: send auth info
          toast.error("Failed to start converting. Is the server online?");
          console.log(error);
          setProcessing(false);
          setConverting(false);
        });
    } else if (inputDeviceId && outputDeviceId && selectedVoice) {
      setProcessing(true);
      fetch(`${SERVER_BASE_URL}/stop-convert`, {
        method: "GET",
        keepalive: true,
      })
        .then(async (_response) => {
          let latencyRecord = null;
          try {
            // TODO: below works,
            latencyRecord = await _response.json();
            latencyRecord = latencyRecord["latency_records"];
          } catch (error) {
            latencyRecord = error;
            console.log(error);
          }

          setConverting(false);

          let responses = await Promise.all([
            fetch(`${SERVER_BASE_URL}/audio?audio_type=original`, {
              method: "GET",
            }),
            fetch(`${SERVER_BASE_URL}/audio?audio_type=converted`, {
              method: "GET",
            }),
          ]);

          if (localStorage.getItem("MV_SESSION_RECORDING") === "true") {
            let originalBlob = await responses[0].blob();
            let convertedBlob = await responses[1].blob();

            const originalBlobUrl = URL.createObjectURL(originalBlob);
            setOriginalAudio(originalBlobUrl);
            setConvertedAudio(URL.createObjectURL(convertedBlob));

            setProcessing(false);
          }
        })
        .catch((error) => {
          console.log("Failed to stop converting");
          console.log(error);
          setProcessing(false);
        });
    }
  }

  useEffect(() => {
    if (!converting) setAreFramesDropping(null);
  }, [converting]);

  useEffect(() => {
    // Fetch the device map when the server comes online
    if (!isServerOnline) return;
    fetchDeviceMap();
    // only run the websocket setters if actually converting
    var ws = new WebSocket("ws://127.0.0.1:58000/ws-frame-health");
    ws.onerror = (error) => {
      console.log(error);
    };
    ws.onmessage = function (event) {
      if (JSON.parse(event.data)[0] == 0) {
        if (converting) setAreFramesDropping(false);
      } else {
        if (converting) setAreFramesDropping(true);
      }
    };
  }, [isServerOnline, converting]);

  const fetchDeviceMap = () => {
    fetch(`${SERVER_BASE_URL}/device-map?mode=prod`, { method: "GET" })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        setDeviceMap(data);
      })
      .catch((error) => {
        console.log(`Error: ${error}`);
      });
  };

  const [hasCheckedServerIsOnline, setHasCheckedServerIsOnline] =
    useState(false);

  function checkServerIsOnline(ms) {
    if (!hasCheckedServerIsOnline) {
      setHasCheckedServerIsOnline(true);
      if (SERVER_BASE_URL)
        fetch(`${SERVER_BASE_URL}/is-alive`, { method: "GET" })
          .then((_response) => {
            console.log("server online");

            setIsServerOnline(true);
            setTimeout(checkServerIsOnline, 5000, 5000);
          })
          .catch((error) => {
            setIsServerOnline(false);
            setTimeout(checkServerIsOnline, ms, ms * 2 > 7000 ? 7000 : ms * 2);
          });
    }
  }
  useEffect(() => {
    setTimeout(checkServerIsOnline, 1, 2000);
  }, []);

  return (
    <div className="relative bg-slate-800 min-h-screen flex">
      <ResultDrawer
        sessionRecordingEnabled={sessionRecordingUI}
        originalAudio={originalAudio}
        convertedAudio={convertedAudio}
      />
      <Settings
        onSessionRecordingChanged={setSessionRecordingUI}
        isServerOnline={isServerOnline}
        areFramesDropping={areFramesDropping}
      />
      <div className="m-auto">
        <div className="text-5xl text-center text-white font-semibold mb-10">
          MetaVoice Live
        </div>
        <Carousel
          setVoice={setSelectedVoice}
          className="w-[35rem]"
          voices={baseVoices}
        />
        <div className="w-[45rem] flex justify-between mt-10">
          <div>
            <label
              htmlFor="hs-select-label"
              className="ml-2 block text-sm font-medium mb-2 dark:text-white"
            >
              Input Device
            </label>
            <div className="flex">
              <div className="py-3 pr-4 pl-4 block border-t border-l border-b bg-slate-700 border-gray-600 rounded-l-full text-sm text-gray-400">
                <IoMicOutline color={"gray-400"} size={20} />
              </div>
              <select
                name="input"
                id="input"
                value={inputDeviceId}
                onChange={(e) => {
                  setInputDeviceId(e.target.value);
                }}
                className="py-3 px-4 pr-9 block w-full rounded-r-full text-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-700 border-gray-600 text-gray-400"
              >
                <option value="" disabled>
                  Choose an input device
                </option>
                {deviceMap?.inputs?.map((input) => {
                  return (
                    <option value={input.index} key={input.index}>
                      {input.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="text-white mt-8">
            <IoArrowForward color={"white"} size={20} />
          </div>
          <div>
            <label
              htmlFor="hs-select-label"
              className="ml-2 block text-sm font-medium mb-2 dark:text-white"
            >
              Output Device
            </label>

            <div className="flex">
              <div className="py-3 pr-4 pl-4 block border-t border-l border-b border-gray-600 bg-slate-700 rounded-l-full text-sm text-gray-400">
                <IoVolumeHighOutline color={"gray-400"} size={20} />
              </div>
              <select
                name="output"
                id="output"
                value={outputDeviceId}
                onChange={(e) => {
                  setOutputDeviceId(e.target.value);
                }}
                className="py-3 px-4 pr-9 block w-full rounded-r-full text-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-700 border-gray-600 text-gray-400"
              >
                <option value="" disabled>
                  Choose an output device
                </option>
                {deviceMap?.outputs?.map((input) => {
                  return (
                    <option value={input.index} key={input.index}>
                      {input.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-10">
          {/* Invisible elements so the styles compile */}
          <div className="hidden bg-slate-700" />
          <div className="hidden bg-red-500" />
          <button
            onClick={() => {
              handleConverting(!converting);
            }}
            disabled={
              processing ||
              !(inputDeviceId !== "" && outputDeviceId !== "" && selectedVoice)
            }
            className={`rounded-full disabled:border-gray-500 disabled:bg-slate-700 disabled:text-slate-400 bg-${
              converting ? "red-500" : "slate-700"
            } border text-white border-gray-600 py-4 px-16`}
          >
            {processing ? (
              "Please Wait"
            ) : (
              <>
                {converting ? "Stop" : "Start"} Conversion{" "}
                {!converting &&
                  !processing &&
                  selectedVoice &&
                  selectedVoice !== "none" &&
                  "For " + selectedVoice}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export default App;
