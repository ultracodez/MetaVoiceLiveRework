# MetaVoiceLive UI Rework & Cleanup
A fork of MVL that cleans up the code and reworks the UI.

## Changelog

 - Added "More Voices" to carousel with advanced selection screen
 - Made "Start Conversion" display "Start Conversion For <voice>" for more transparency with more voices
 - Enabled scanning functionality for speakers in %appdata/MetaVoiceLive/speakers
 - Made "More Voices" in carousel display the custom voice's avatar when selected, or a check next to the no avatar icon to indicate a selected voice
 - bugfixes, including an advanced server is-alive ping functionality
 - Added "Frames Inactive/Stable/Dropping" indicator
 - Added "Server online/offline" indicator
 - Added favoriting
 - Added custom update directory
 - Added swift Review & Share drawer
 - Cleanup up code, especially Electron code, into separate files so it is more organized

## Screenshots

![image](https://github.com/ultracodez/MetaVoiceLiveRework/assets/80412399/1dd6ca13-3e99-4947-9cb2-891ed2fc8e36)

![image](https://github.com/ultracodez/MetaVoiceLiveRework/assets/80412399/213f874a-18ce-45fc-9f69-4900f883c220)

![image](https://github.com/ultracodez/MetaVoiceLiveRework/assets/80412399/7d54a06c-b896-4bca-bfc8-6ca8344067a4)

![image](https://github.com/ultracodez/MetaVoiceLiveRework/assets/80412399/000dc89c-6a11-4b7d-be2d-a6883216c8f6)

![image](https://github.com/ultracodez/MetaVoiceLiveRework/assets/80412399/de7b4a9b-6baf-4b9c-85ac-82a6c1b5d290)

![image](https://github.com/ultracodez/MetaVoiceLiveRework/assets/80412399/6ae50ce2-cd0f-4400-97f2-ec8646abf303)

![image](https://github.com/ultracodez/MetaVoiceLiveRework/assets/80412399/f7c31b72-0ae3-4ce1-b932-f130e5d157c3)

![image](https://github.com/ultracodez/MetaVoiceLiveRework/assets/80412399/49490e42-a467-43cc-b97d-d87b4bcc3031)

![image](https://github.com/ultracodez/MetaVoiceLiveRework/assets/80412399/5dd93909-a22c-447b-9e90-233c9944a716)


## Setup

Download the .zip from release and manually copy `mvml` into `resources/app/dist`

**OR**

Start `metavoice.exe` in mvml manually

Either way, you'll know it has worked because the "Server Online" indicator will turn on

## Building

The scripts are in `package.json`, the only thing you need to do in install any missing python packages and/or copy model.pt and model_b.pt from mvml into `ai`, as these are too big for Github.

(will update this soon)
