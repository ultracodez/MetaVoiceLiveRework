import requests
import numpy as np
from typing import List
import concurrent.futures

from ai.spectrogram_conversion.params import min_level_db

MAX_THREADS = 4
UV_URL = "http://v6:1234/predictions/uv"

def call_uv(spect_trg: np.ndarray) -> np.ndarray:
    """
    Takes in spectrogram of size (H, W) and returns a 2-d numpy array
    containing raw audio values. Should be (1, timesteps). We keep the 
    batch-dim as tensorboard logging expects that.
    Note: spectrogram is expected as-if straight output of VC.
    """
    if len(spect_trg.shape) != 2:
        raise Exception("Expects a 2-D array, no batch-dim needed.")

    # denormalise
    spect_trg = spect_trg * (-min_level_db) + min_level_db
    spect_trg = np.log(10 ** (spect_trg / 20))
 
    try:
        json = {"input": spect_trg.tolist()}
        result = requests.post(UV_URL, json = json)
        return np.array(result.json())
    except Exception:
        result = np.zeros((1, 32678))
        return result

    


def batched_call_uv(spect_trg: np.ndarray) -> List[np.ndarray]:
    """
    Takes in spectrogram of size (B, H, W) and returns a list of
    size B of 2-d numpy arrays of audio of shape (1, timesteps). 
    We keep the  batch-dim as tensorboard logging expects that.
    Note: spectrogram is expected as-if straight output of VC.
    """
    if len(spect_trg.shape) != 3:
        raise Exception("Expects a 3-D array, batch-dim was not found.")

    return_audios = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        res = executor.map(call_uv, [x for x in spect_trg])
        for r in res:
            return_audios.append(r)

    return return_audios
