import os
import sys
import shutil

os = sys.argv[1]

print("platform: ", os)

if os == "windows":
    shutil.rmtree(
        "dist/metavoice/ai/spectrogram_conversion/saved_models", True)
    shutil.rmtree("dist/metavoice/ai/spectrogram_conversion/originals", True)
    shutil.rmtree("dist/metavoice/ai/studio_models/model.mlpackage", True)

    # rm -rf dist/metavoice/ai/spectrogram_conversion/saved_models
    # rm -rf dist/metavoice/ai/spectrogram_conversion/originals
    # rm -rf dist/metavoice/ai/studio_models/model.mlpackage
