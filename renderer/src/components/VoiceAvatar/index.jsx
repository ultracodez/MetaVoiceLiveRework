import { useEffect, useState } from "react";
import {
  IoCheckmarkCircle,
  IoEllipsisHorizontal,
  IoEllipsisHorizontalCircle,
  IoPersonCircle,
} from "react-icons/io5";
import ExtraVoicesModal from "./ExtraVoices";
import Image from "next/image";

export default function VoiceAvatar({
  img: { alt, src } = { alt: "multi", src: "multi" },
  name,
  setVoice,
  isActive,
  onClick,
  index,
  type = "normal",
}) {
  const isMulti = type === "multi";

  const [isModalActive, setIsModalActive] = useState(false);

  useEffect(() => {
    if (isActive && !isMulti) setVoice(name);
    if (isActive && isMulti && !isModalActive) setIsModalActive(true);
  }, [isActive]);

  function setOpen(val) {
    setIsModalActive(val);
  }

  const [multiCustomAvatar, setMultiCustomAvatar] = useState(null);

  return (
    <div
      onClick={() => {
        if (!isMulti) onClick(index);
        else if (isMulti) {
          onClick(index);
          setIsModalActive(true);
        }
      }}
      className="p-4 justify-center"
    >
      {isMulti && (
        <ExtraVoicesModal
          setCustomAvatar={setMultiCustomAvatar}
          setVoice={setVoice}
          open={isModalActive}
          setOpen={setOpen}
        />
      )}
      <div
        className={`border-4 flex transition ease-in-out delay-300 h-36 w-36 rounded-full overflow-hidden relative  ${
          isActive ? "border-sky-500" : "border-transparent"
        }`}
      >
        {isMulti ? (
          multiCustomAvatar ? (
            multiCustomAvatar === "selected" ? (
              <>
                <div className="absolute inset-0 rounded-full bg-gray-500 bg-opacity-0 opacity-0 hover:opacity-100 hover:bg-opacity-60 transition-opacity">
                  <IoEllipsisHorizontal className="m-auto absolute text-slate-300 z-10 h-full w-full p-8" />
                </div>
                <IoCheckmarkCircle className="absolute top-4 right-4 text-green-400 h-8 w-8 bg-slate-800 rounded-full" />
                <IoPersonCircle className="text-slate-500 m-auto h-32 w-32" />
              </>
            ) : (
              <>
                {" "}
                <div className="absolute inset-0 rounded-full bg-gray-500 bg-opacity-0 opacity-0 hover:opacity-100 hover:bg-opacity-60 transition-opacity">
                  <IoEllipsisHorizontal className="m-auto absolute text-slate-300 z-10 h-full w-full p-8" />
                </div>
                <img
                  src={multiCustomAvatar}
                  alt={"Select from Additional Voices"}
                  className="text-slate-500 rounded-full m-auto h-[8.7rem] w-[8.7rem]"
                />
              </>
            )
          ) : (
            <>
              {/*<IoPersonCircle
              className="object-contain m-auto rounded-full text-slate-500 hover:text-slate-400 hover:bg-slate-700 "
              size={137 /* 135 */
              /*}
            /> */}
              <div className="absolute inset-0 rounded-full bg-gray-500 bg-opacity-0 opacity-0 hover:opacity-100 hover:bg-opacity-60 transition-opacity">
                <IoEllipsisHorizontal className="m-auto absolute text-slate-300 z-10 h-full w-full p-8" />
              </div>
              <IoPersonCircle className="text-slate-500 m-auto h-32 w-32" />
            </>
          )
        ) : (
          <img className="object-contain rounded-full" src={src} alt={alt} />
        )}
      </div>
      <div
        className={`mt-2 flex justify-center text-2xl text-white ${
          isActive && "font-semibold"
        }`}
      >
        {isMulti ? "More Voices" : name}
      </div>
    </div>
  );
}
