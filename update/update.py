import sys
import os
import shutil
import requests
import xdialog
import traceback


print("This file is called by Updates.js with the first parameter being where to download the update from and the second being where to update to")
print("Before executing this file be sure to copy it outside the old MVL distribution but not in the new distribution")

if (os.name == 'nt'):
    try:
        downloadURL = sys.argv[1]
        updatePath = sys.argv[2]
        updateName = sys.argv[3]
        oldPath = sys.argv[4]

        print("Downloading update from: ", downloadURL)

        tempZipPath = os.path.join(updatePath, updateName + "-temp.zip")

        if (os.path.exists(tempZipPath)):
            os.remove(tempZipPath)

        response = requests.get(downloadURL)
        with open(tempZipPath, "wb") as f:  # opening a file handler to create new file
            f.write(response.content)

        toUpdatePath = os.path.join(updatePath, updateName)

        print("Updating to: ", toUpdatePath)

        if (os.path.exists(toUpdatePath)):
            shutil.rmtree(toUpdatePath)

        shutil.unpack_archive(tempZipPath, toUpdatePath)

        os.remove(tempZipPath)

        print("Moving mvml and deleting old version: ", oldPath)

        mvmlPath = os.path.join(oldPath, "resources/app/dist")

        print("Checking for mvml in: ", mvmlPath)

        if (os.path.exists(os.path.join(mvmlPath, "metavoice")) and os.path.exists(os.path.join(mvmlPath, ".unzip-finished"))):
            print("Moving mvml")
            newMvmlPath = os.path.join(toUpdatePath, "resources/app")
            shutil.move(mvmlPath, newMvmlPath)

        print("Deleting old version")
        shutil.rmtree(oldPath)

        print("done")

    except IndexError:
        print("The required parameters were not present")
        exit(1)
    except Exception as e:
        print("An unknown error occurred:", e)
        errorMessage = traceback.format_exc()
        xdialog.error(
            "An error occurred while updating MetaVoice Live", errorMessage)

        exit(1)
elif (os.name == 'posix'):
    print("POSIX (MacOs, OSX, UNIX, Linux) is not currently supported by the autoupdater")
    exit(1)
