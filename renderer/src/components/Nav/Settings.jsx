import { IoSettingsOutline } from "react-icons/io5";
import SettingsModal from "./SettingsModal";
import { useState } from "react";

export default function Settings({
  areFramesDropping,
  isServerOnline,
  ...options
}) {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => {
    setOpen(!open);
  };

  return (
    <div>
      <SettingsModal {...{ open, setOpen, ...options }} />
      {/* Invisible elements so the classes compile */}
      <div className="hidden bg-green-500" />
      <div className="hidden bg-red-500" />
      <div className="hidden bg-gray-500" />
      <div className="absolute flex top-4 right-4 justify-between w-72">
        <div className="my-auto flex">
          <div className=" text-white text-sm mx-1">
            {areFramesDropping === null
              ? "Frames Inactive"
              : areFramesDropping
              ? "Frames Dropping"
              : "Frames Stable"}
          </div>
          <div
            className={`h-2 w-2 rounded-full ${
              areFramesDropping === null
                ? "bg-gray-500"
                : !areFramesDropping
                ? "bg-green-500"
                : "bg-red-500"
            } my-auto mx-1`}
          ></div>
        </div>
        <div className="my-auto flex">
          <div className=" text-white text-sm mx-1">
            {isServerOnline ? "Server Online" : "Server Offline"}
          </div>
          <div
            className={`h-2 w-2 rounded-full ${
              isServerOnline ? "bg-green-500" : "bg-red-500"
            } my-auto mx-1`}
          ></div>
        </div>
        <IoSettingsOutline
          onClick={toggleOpen}
          color="white"
          size={18}
          className="my-auto"
        />
      </div>
    </div>
  );
}
