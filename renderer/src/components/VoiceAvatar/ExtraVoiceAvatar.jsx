import {
  IoHeart,
  IoHeartOutline,
  IoPersonCircle,
  IoStar,
} from "react-icons/io5";
import { useHover } from "@uidotdev/usehooks";

export default function ExtraVoiceAvatar({
  voice,
  isActive,
  isFavorite = false,
  onFavoriteChange = () => {},
}) {
  const [ref, hovering] = useHover();

  return (
    <>
      {/* Invisible elements so the classes compile */}
      <div className="hidden text-pink-500" />
      <div className="hidden text-transparent" />
      <div
        className={`flex flex-col h-28 w-28  hover:text-pink-500 ${
          isFavorite ? "text-pink-500" : "text-transparent"
        } rounded-full relative `}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavoriteChange(voice.id);
          }}
          ref={ref}
          className="absolute focus-visible:text-pink-500 top-1 right-4"
        >
          {isFavorite || hovering ? (
            <IoHeart className="h-6 w-6" />
          ) : (
            <IoHeartOutline className=" h-6 w-6" />
          )}
        </button>
        <div className="flex">
          {voice.img?.src ? (
            <>
              {/* invisible elements to make the classes compile */}
              <div className="hidden border-sky-500" />
              <div className="hidden border-sky-700" />

              <img
                className={` transition ease-in-out delay-100 border-4 rounded-full text-slate-500 w-20 m-auto h-full ${
                  isActive ? "border-sky-500" : "border-slate-700"
                }  `}
                src={voice.img?.src}
                alt={voice.img?.alt}
              />
            </>
          ) : (
            <>
              {/* invisible elements to make the classes compile */}
              <div className="hidden border-sky-500" />
              <div className="hidden border-sky-700" />
              <IoPersonCircle
                className={` transition ease-in-out delay-100 border-4 rounded-full text-slate-500 w-20 m-auto h-full ${
                  isActive ? "border-sky-500" : "border-slate-700"
                }  `}
              />
            </>
          )}
        </div>

        <div
          className={`m-auto text-sm text-white ${isActive && "font-bold"} `}
        >
          {voice.name}
        </div>
      </div>
    </>
  );
}

export { ExtraVoiceAvatar };
