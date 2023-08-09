from typing import Any, Optional
import time
import math
import numpy as np
import queue
import uvicorn
from inference_rt import InferenceRt
from modules.portaudio_utils import get_devices
from modules.torch_utils import set_seed
from voice_conversion import ConversionPipeline
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket
import threading

lock = threading.Lock()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model
    start()
    yield
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"])

# venv\Scripts\pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
# venv\Scripts\pip install gradio sounddevice pyaudio librosa


# Samples, rates, etc.
sample_rate = 22050  # sampling rate yeah!
num_samples = 128  # input spect shape num_mels * num_samples
# int(0.0125 * sample_rate)  # 12.5ms - in line with Tacotron 2 paper
hop_length = 256
# Let's actually try that math, in line with Tacotron 2 paper!
hop_length = int(0.0125 * sample_rate)

# MVL: corresponds to 1.486s of audio, or 32768 samples in the time domain. This is the number of samples fed into the VC module
# Us: With our tweaked hop_length above, this is 35280 samples, about 1.6s of audio. This may improve the model's tone/pitch/timbre/intonation? Just a little more audio to work from.
MAX_INFER_SAMPLES_VC = num_samples * hop_length

SEED = 1234  # numpy & torch PRNG seed
set_seed(SEED)

# Hold the thread, model and devices.
inference_rt_thread = None
voice_conversion = None
devices = get_devices()


noise_suppression_threshold: Optional[Any] = None
callback_latency_ms: Optional[Any] = None
# USER_STATE: Optional[Any] = None


@app.get("/is-alive")
def get_is_alive():
    global voice_conversion
    print("voice_conversion check:")
    print(type(voice_conversion))
    return True


@app.get("/register-user")
def register_user(email: str, issuer: str, share_data: bool, noise_suppression: float, callback_latency_ms_: int):
    global noise_suppression_threshold, callback_latency_ms
    # USER_STATE.email = email
    # USER_STATE.issuer = issuer
    # USER_STATE.should_capture_data = share_data

    with lock:
        noise_suppression_threshold = noise_suppression
        callback_latency_ms = callback_latency_ms_
    return True


@app.get("/start-convert")
def startGenerateVoice(input_device_idx: int, output_device_idx: int, app_version: str, target_speaker: str):
    global inference_rt_thread, voice_conversion, devices, sample_rate, MAX_INFER_SAMPLES_VC, callback_latency_ms

    voice_conversion.set_target(target_speaker)

    inference_rt_thread = InferenceRt(input_device_idx, output_device_idx, callback_latency_ms,
                                      sample_rate, MAX_INFER_SAMPLES_VC, voice_conversion, queue.Queue(), queue.Queue(), args=())
    inference_rt_thread.start()

    # Wait for start queue
    txt = inference_rt_thread.start_queue.get()

    print(txt)

    return


is_paused = False


@app.get("/pause-convert")
def pauseGenerateVoice(val):
    global inference_rt_thread

    if (is_paused == val):
        return True
    elif inference_rt_thread is not None and inference_rt_thread.is_alive():
        is_paused = val
        inference_rt_thread.status_queue.put("pauseToggle")

    return True


@app.get("/stop-convert")
def stopGenerateVoice():
    global inference_rt_thread

    if inference_rt_thread is not None and inference_rt_thread.is_alive():
        # Wait for end.
        inference_rt_thread.status_queue.put("stop")
        inference_rt_thread.join()

    return True


@app.get("/device-map")
def get_device_map(mode: str = "all"):
    return get_devices()  # removed mode temporarily


# TODO
@app.websocket_route("/ws-frame-health")
async def get_latency(websocket: WebSocket):
    await websocket.accept()

    global frame_dropping

    while True:
        if False:  # frame_dropping:
            if len(frame_drops) > 0:
                await websocket.send_json(frame_drops)
            else:
                await time.sleep(1)
        else:
            await time.sleep(1)


@app.get("/noise-suppression-threshold")
def get_noise_suppression_threshold(value: float):
    global noise_suppression_threshold

    with lock:
        noise_suppression_threshold = value
    return True


@app.get("/callback-latency-ms")
def get_latency_ms(value: int):
    global callback_latency_ms

    with lock:
        callback_latency_ms = value
    return True


def start():
    global inference_rt_thread, voice_conversion, devices, sample_rate, MAX_INFER_SAMPLES_VC, voiceDirectory

    # Create the model.
    print("We're loading the model and warming it up, please standby! Approximately 30-50 seconds!")
    voice_conversion = ConversionPipeline(sample_rate)
    voice_conversion.set_target("yara")

    print("voice_conversion set:")
    print(type(voice_conversion))
    # warmup models into the cache
    warmup_iterations = 20
    warmup_frames_per_buffer = math.ceil(sample_rate * 400 / 1000)
    for _ in range(warmup_iterations):
        wav = np.random.rand(MAX_INFER_SAMPLES_VC).astype(np.float32)
        voice_conversion.run(wav, warmup_frames_per_buffer)
    print("Model ready and warmed up!")


if __name__ == '__main__':

    uvicorn.run("mvl:app", port=58000)
