import { Fragment, useRef, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Slider } from "@material-tailwind/react/src/components/Slider/index";
import { scaleBetween } from "../../helpers/scalebetween";
import {
  IoConstruct,
  IoDiamond,
  IoDiamondOutline,
  IoPersonCircle,
} from "react-icons/io5";
import { ExtraVoiceAvatar } from "./ExtraVoiceAvatar";

export default function ExtraVoicesModal({
  setCustomAvatar,
  setVoice,
  open,
  setOpen,
}) {
  const [userCustomVoices, setUserCustomVoices] = useState([]);
  const [baseVoices, setBaseVoices] = useState([]);
  const [selectedVoiceID, setBackendSelectedVoiceID] = useState();

  function setSelectedVoiceID(voice) {
    setBackendSelectedVoiceID(voice.id);
    setVoice(voice.name);
    setCustomAvatar(voice.img?.src ?? "selected");
  }

  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined") {
        setUserCustomVoices(await window.electronAPI.getUserCustomVoices());
        setBaseVoices(await window.electronAPI.getBaseVoices());
        if (localStorage.getItem("MV_FAVORITE_VOICES"))
          setFavorites(JSON.parse(localStorage.getItem("MV_FAVORITE_VOICES")));
      }
    })();
  }, [typeof window]);

  function onFavoriteChange(id) {
    let newFavorites;
    if (favorites.includes(id))
      newFavorites = favorites.splice(favorites.indexOf(id), 1);
    else newFavorites = favorites.concat([id]);
    localStorage.setItem("MV_FAVORITE_VOICES", JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          console.log("FUCKYOU");
          setOpen(false);
        }}
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-slate-700 text-left shadow-xl transition-all sm:my-8 sm:w-full  sm:max-w-5xl">
                <div className="bg-slate-700 px-8 py-4">
                  <div className="">
                    <div className="  mt-1 text-center sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold leading-6 text-white"
                      >
                        Choose A Voice
                      </Dialog.Title>
                      <div className="text mt-2 text-white">Base Voices</div>
                      <div className="flex">
                        <div className="flex flex-wrap">
                          {baseVoices?.map((voice) => {
                            if (voice.isPremium) return;
                            const isActive = voice.id === selectedVoiceID;
                            return (
                              <button
                                key={voice.id}
                                onClick={() => {
                                  setSelectedVoiceID(voice);
                                }}
                                className="py-2 px-2 justify-center"
                              >
                                <ExtraVoiceAvatar
                                  {...{
                                    voice,
                                    isActive,
                                    onFavoriteChange,
                                    isFavorite: favorites.includes(voice.id),
                                  }}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text mt-2 text-white">
                        Premium Voices{"  "}
                        <span className="ml-1 inline-flex items-center rounded-md bg-yellow-200 bg-opacity-20 px-2 py-1 text-xs font-medium text-yellow-300 ring-1 ring-inset ring-yellow-600/20">
                          <IoDiamond />
                        </span>
                      </div>
                      <div className="flex">
                        <div className="flex flex-wrap">
                          {baseVoices?.map((voice) => {
                            if (!voice.isPremium) return;
                            const isActive = voice.id === selectedVoiceID;
                            return (
                              <button
                                key={voice.id}
                                onClick={() => {
                                  setSelectedVoiceID(voice);
                                }}
                                className="py-2 px-2 justify-center"
                              >
                                <ExtraVoiceAvatar
                                  {...{
                                    voice,
                                    isActive,
                                    onFavoriteChange,
                                    isFavorite: favorites.includes(voice.id),
                                  }}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text mt-2 text-white">
                        Custom Voices{" "}
                        <span className="ml-1 inline-flex items-center rounded-md bg-indigo-200 bg-opacity-20 px-2 py-1 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-600/20">
                          <IoConstruct />
                        </span>
                      </div>
                      <div className="flex">
                        <div className="flex flex-wrap">
                          {userCustomVoices?.map((voice) => {
                            const isActive = voice.id === selectedVoiceID;
                            return (
                              <button
                                key={voice.id}
                                onClick={() => {
                                  setSelectedVoiceID(voice);
                                }}
                                className="py-2 px-2 justify-center"
                              >
                                <ExtraVoiceAvatar
                                  {...{
                                    voice,
                                    isActive,
                                    onFavoriteChange,
                                    isFavorite: favorites.includes(voice.id),
                                  }}
                                />
                              </button>
                            );
                          })}
                        </div>
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
                    OK
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
