import Drawer from "react-modern-drawer";
import { useState, useEffect } from "react";
import styles from "react-modern-drawer/dist/index.css";
import { IoMenuOutline, IoShareSocial } from "react-icons/io5";
import ResultRenderer from "./Result";
import ResultModal from "./ResultModal";

export default function ResultDrawer({
  originalAudio,
  convertedAudio,
  sessionRecordingEnabled,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  // we use onMouseDown to allow someone to 'drag' but just immediately expand it

  return (
    <div className={`${sessionRecordingEnabled ? "" : "hidden"}`}>
      <div className="hidden" />

      <div
        className="fixed cursor-pointer h-6 bottom-0 left-0 right-0 flex bg-slate-900 text-white"
        onMouseDown={toggleDrawer}
      >
        <IoMenuOutline className="h-full m-auto" />
      </div>
      <Drawer
        open={isOpen}
        onClose={toggleDrawer}
        style={styles}
        size={"20vw"}
        direction="bottom"
        className="bg-slate-800"
      >
        <div
          className="absolute  cursor-pointer h-6 -top-6 left-0 right-0 flex bg-slate-900 text-white"
          onMouseDown={toggleDrawer}
        >
          <IoMenuOutline className="h-full m-auto" />
        </div>
        <div className="flex h-full bg-slate-800">
          <div className="m-auto w-5/12">
            <div className="text-center w-full text-xl text-white">
              Review & Share
            </div>
            <div className="mt-4" />
            <ResultRenderer {...{ originalAudio, convertedAudio }} />
            <ResultModal
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
            />
            <button
              onClick={() => {
                setIsModalOpen(!isModalOpen);
                setIsOpen(false);
              }}
              className="flex text-white bg-red-500 rounded-full px-6 py-2 mt-6 m-auto"
            >
              <IoShareSocial className="my-auto mr-1" /> Share Feedback
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
