import { Dialog, Transition, RadioGroup } from "@headlessui/react";
import { Fragment, useRef, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function ResultModal({ isModalOpen, setIsModalOpen }) {
  const cancelButtonRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [sendInProgress, setSendInProgress] = useState(false);

  const [SERVER_BASE_URL, setBaseUrl] = useState("http://localhost:58000");
  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined")
        setBaseUrl(await window.electronAPI.getServerBaseURL());
    })();
  }, [typeof window]);

  const handleSubmit = (_event) => {
    fetch(
      `${SERVER_BASE_URL}/feedback?content=${feedback}&duration=${duration}`,
      { method: "GET", keepalive: true }
    )
      .then((_response) => {
        setSendInProgress(false);
        setIsModalOpen(false);
        toast.success("Thanks for your feedback!")
      })
      .catch((_error) => {
        console.log(_error);
        toast.error("Something went wrong. Please try again.");
        setSendInProgress(false);
      });
    setSendInProgress(true);
  };

  return (
    <Transition.Root show={isModalOpen ?? false} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-100"
        initialFocus={cancelButtonRef}
        onClose={setIsModalOpen}
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
                        className="text-lg font-semibold leading-6 text-white"
                      >
                        Send Feedback
                      </Dialog.Title>
                    </div>
                  </div>
                </div>
                <div className="mx-8">
                  <div className="ms-auto">
                    <div className="mb-2 font-bold text-white">
                      Suggestions:
                    </div>
                    <textarea
                      value={feedback}
                      onChange={(e) => {
                        setFeedback(e.target.value);
                      }}
                      placeholder="What would you like us to improve?"
                      className="block p-2.5 h-40 w-full text-sm rounded-lg resize-none bg-slate-800/50 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                      maxLength={1024}
                    />

                    <RadioGroup
                      value={duration}
                      onChange={setDuration}
                      controlId="duration"
                      className="mb-3 mt-3"
                    >
                      <RadioGroup.Label className="my-2 font-bold text-white">
                        Audio length:
                      </RadioGroup.Label>
                      <RadioGroup.Option label="Entire session" value={0}>
                        {({ checked }) => (
                          <div className="flex text-white">
                            <input
                              type={"radio"}
                              className="my-auto w-3 h-3 appearance-none border-0  focus:ring-blue-600 ring-2 ring-offset-transparent ring-transparent mr-2"
                              checked={checked}
                              onClick={() => {
                                setDuration(0);
                              }}
                            />
                            Entire Session
                          </div>
                        )}
                      </RadioGroup.Option>
                      <RadioGroup.Option label="5 mins" value={300}>
                        {({ checked }) => (
                          <div className="flex text-white">
                            <input
                              type={"radio"}
                              className="my-auto w-3 h-3 appearance-none border-0  focus:ring-blue-600 ring-2 ring-offset-transparent ring-transparent mr-2"
                              checked={checked}
                              onClick={() => {
                                setDuration(300);
                              }}
                            />
                            5 minutes
                          </div>
                        )}
                      </RadioGroup.Option>
                      <RadioGroup.Option label="30 secs" value={30}>
                        {({ checked }) => (
                          <div className="flex text-white">
                            <input
                              type={"radio"}
                              className="my-auto w-3 h-3 appearance-none border-0  focus:ring-blue-600 ring-2 ring-offset-transparent ring-transparent mr-2"
                              checked={checked}
                              onClick={() => {
                                setDuration(30);
                              }}
                            />
                            30 seconds
                          </div>
                        )}
                      </RadioGroup.Option>
                    </RadioGroup>
                    {/*
                <Button variant="primary" type="submit" onClick={handleSubmit} disabled={sendInProgress} className="col-3 send-feedback-button">
                    {sendInProgress && <Spinner as='span' animation="border" size='sm' variant="light" className='spinner-border' />}
                    <i className="bi bi-send"></i> Send
                </Button>
                <OverlayTrigger
                    placement='right'
                    overlay={
                        <Tooltip id={`tooltip-right`}>
                            By clicking send, you agree to share your data with MetaVoice striclty for the purposes of providing you a better voice &#38; app experience.
                        </Tooltip>
                    }
                >
                    <i className="bi bi-info-circle-fill"></i>
                  </OverlayTrigger>*
                  {error && <p className="mv-error">{error}</p>}*/}
                  </div>
                  <div className=" py-3 gap-1 sm:flex sm:flex-row-reverse -mr-4">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-70 shadow-sm hover:bg-gray-300 sm:ml-3 sm:w-auto"
                      onClick={handleSubmit}
                    >
                      {sendInProgress ? (
                        <svg
                          class="animate-spin m-auto h-5 w-5 text-slate-800"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        "Send"
                      )}
                    </button>

                    <button
                      type="button"
                      className="mt-3 text-white hover:text-slate-700 inline-flex w-full justify-center rounded-md  px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setIsModalOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
                  </div>
                  <div className=" text-gray-300 mr-2 text-center pb-4 text-xs sm:flex sm:flex-row-reverse">
                    By clicking send, you agree to share your data with
                    MetaVoice strictly for the purposes of providing you a
                    better voice &#38; app experience.
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
