## Audio
sample_rate = 22050

## Mel-filterbank
n_fft = 2048
num_mels = 80
num_samples = 128  # input spect shape num_mels * num_samples
hop_length = 256  # int(0.0125 * sample_rate)  # 12.5ms - in line with Tacotron 2 paper
win_length = 1024  # int(0.05 * sample_rate)  # 50ms - same reason as above
fmin = 0
fmax = 8000

# corresponds to 1.486s of audio, or 32768 samples in the time domain. This is the number of samples
# fed into the VC module
MAX_INFER_SAMPLES_VC = num_samples * hop_length

min_level_db = -100
ref_level_db = 20

## Voice Activation Detection
# Window size of the VAD. Must be either 10, 20 or 30 milliseconds.
# This sets the granularity of the VAD. Should not need to be changed.
vad_window_length = 30  # In milliseconds
# Number of frames to average together when performing the moving average smoothing.
# The larger this value, the larger the VAD variations must be to not get smoothed out.
vad_moving_average_width = 8
# Maximum number of consecutive silent frames a segment can have.
vad_max_silence_length = 16


## Audio volume normalization
audio_norm_target_dBFS = -30

## Vocoder
# The vocoder requires 13 spec frames of right context in it's receptive field. We take it as 16 since power of 2.
# So for a given part we're synthesising, we don't synthesize the last 16 spec frames. These will get synthesized in the next
# iteration. However, to ensure the vocoder predicts consistent phase for this 16 spec frames,
# we need receptive field on the left as well. The receptive field on the left is 15 spec frames, and again we use 16 frames
# because power of two. This leaves us with a total overlap of 16*2.
VOCODER_FUTURE_CONTEXT_SPEC_FRAMES = 16 * 2

SEED = 1234  # numpy & torch PRNG seed
GENERATOR_MLPACKAGE_OUTPUT_VAR = "var_154"
