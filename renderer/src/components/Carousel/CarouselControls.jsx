import classNames from "classnames";
import React from "react";
import { IoCaretForwardOutline, IoCaretBackOutline } from "react-icons/io5";

const CarouselControlsL = (props) => {
  return (
    <button
      onClick={() => {
        if (props.canScrollPrev) {
          props.onPrev();
        }
      }}
      disabled={!props.canScrollPrev}
      className={classNames({
        "text-white px-2": true,
      })}
    >
      <IoCaretBackOutline color={"white  "} />
    </button>
  );
};

const CarouselControlsR = (props) => {
  return (
    <button
      onClick={() => {
        if (props.canScrollNext) {
          props.onNext();
        }
      }}
      disabled={!props.canScrollNext}
      className={classNames({
        "text-white px-2": true,
      })}
    >
      <IoCaretForwardOutline color={"white  "} />
    </button>
  );
};

export { CarouselControlsL, CarouselControlsR };
