# cleans the build directory from mvml and zips the electron build.
# assumes `npm run react-package && npm run electron-package-build` has been run

import sys
import shutil
import boto3
import os
import json

from dotenv import load_dotenv
load_dotenv()


def deploy():
    el_version = json.load(open("package.json"))["version"]

    src_path = sys.argv[1]

    print(f'cleaning {src_path} ...')
    # remove dist folder
    if os.path.exists(src_path + "/resources/app/dist"):
        print('- removing /resources/app/dist ...')
        shutil.rmtree(src_path + "/resources/app/dist")

    # remove mvml-*.zip files
    for f in os.listdir(src_path + "/resources/app"):
        if f.startswith("mvml-") and f.endswith(".zip"):
            print('- removing /resources/app/' + f + ' ...')
            os.remove(src_path + "/resources/app/" + f)


if __name__ == '__main__':
    deploy()
