---
title: Repurposing an old tablet with LineageOS and Home Assistant
excerpt: 'How I turned a forgotten tablet into a wall-mounted Home Assistant dashboard'
date: 2026-04-01
dateUpdated: 2026-04-01
layout: post.njk
tags: ['home assistant', 'lineageos']
img: '/images/ha-tablet-dashboard.jpeg'
imgAlt: 'home assistant dashboard showing controls for 3-4 lights, temperature guages, and buttons'
order: 200
---

My house is set up with [Home Assistant](https://www.home-assistant.io/), an open-source smart home/home automation software. For a year or so I've been switching out light switches, plugs, and other items around the house to expand what I can do with it.

I had an old Samsung Galaxy tablet (circa 2013!) laying around that was too old to do much with and definitely not getting android updates anymore. I decided to try to repurpose it for use as a wall-mounted Home Assistant dashboard, which required flashing it with LineageOS to replace the existing Android software. Here are some notes on that process!

{% imgCaption src="/images/ha-tablet-wall.jpeg", alt="tablet device mounted on a wall; there is a glare on the screen but you can see some of a home assistant dashboard on it.", caption="a glare-y photo of the final result" %}

## Tools used

I downloaded LineageOS and TWRP to my computer so that I could get them onto the tablet. I also installed adb and Heimdall on my mac to facilitate file transfer & flashing.

- [LineageOS](https://www.lineageos.org/): open-source operating system based on Android
    - provides updates for many devices long after Android itself has stopped supporting them
    - LineageOS is often used along with a [Google apps package](https://wiki.lineageos.org/gapps) to get the basic applications that come pre-installed on most Android devices
        - I opted not to install these, since they weren't necessary for my use case and it felt simpler & more secure without.
    - The LineageOS website didn't have an official version listed for my very old tablet, so I used [this "unofficial" LineageOS 14.1](https://drive.google.com/file/d/1h7jyZfCunhmQ6c1grybViaEJ9PT8XSVO/view) found in [XDA forums here](https://xdaforums.com/t/rom-gt-p52xx-unofficial-7-1-2-lineageos-14-1.3587761/page-124).
- [TWRP (Team Win Recovery Project)](https://twrp.me/): Recovery mode for Android devices; replaces the default recovery mode with one with additional abilities, including flashing a custom OS.
    - image I used: [twrp-3.3.1.2-santos10wifi.img](https://androidfilehost.com/?fid=6006931924117924840)

- `adb` (Android Debug Bridge): Debugging tool for Android devices (installed on computer)
    - lets you connect device to PC via USB and use the command line to do stuff on the device.
    - [LineageOS Wiki: ADB Fastboot Guide](https://wiki.lineageos.org/adb_fastboot_guide) - instructions here for installing adb on macOS (with homebrew) or others
- [Heimdall](https://www.glassechidna.com.au/heimdall/) - tool for flashing firmware onto Samsung devices - install on computer
    - I used this [MacOS Arm64 version](https://github.com/fathonix/heimdall-osx-arm64?tab=readme-ov-file) but had to go through some struggling with my Mac to allow it to run.
    - I didn't end up using the "frontend" part of this download, just used the executable which after downloading the release is in `heimdall-frontend.app/Contents/MacOS`

## Steps

- enable USB debugging on the tablet: enable developer options by going to _settings_ → _about_ and tapping _build number_ 7 times
    - Then under _developer options_, toggle _USB debugging_.
- connect tablet to Mac via USB
    - Not all USB cables worked here, something to do with the type of data transfer they support. My partner happened to have bought one recently to use with an old Kindle, which worked for me.
- once connected, open terminal and type `adb devices`
    - A dialog shows up on the tablet at this point, tap "ok" and "always allow" to avoid having to do this every time.
- `adb shell` - poke around a bit and examine the file structure
- copy downloaded LineageOS over to the tablet's SD card:
    - `adb push ~/path/to/your/file/lineage-14.1-20240311-UNOFFICIAL-santos10wifi.zip /sdcard`
    - (I knew `/sdcard` was a directory on the tablet from poking around with `adb shell` earlier)
- turn off tablet, restart it in download mode by pressing volume down + power button
    - when warning screen appears, follow directions to continue (volume up button)
- used Heimdall to flash twrp to the tablet with this command:
    - `heimdall-frontend.app/Contents/MacOS/heimdall flash --RECOVERY ./twrp-3.3.1-2-santos10wifi.img`
        - optionally add `--no-reboot` at the end
- then reboot tablet in recovery mode: volume up + home + power
    - a bit of struggle to do this without first somehow resetting back to the system's default recovery mode
        - if you don't reboot into recovery IMMEDIATELY, TWRP will be overwritten and reset back to the default recovery mode. So that happened about a zillion times, I kept getting the default recovery screen and having to go back and start over.
        - eventually I think what worked was to run the Heimdall command _without_ the `--no-reboot` option. Then basically pressing the buttons for recovery mode right away basically as soon as I ran that command.
- Once I finally had TWRP working, I roughly followed the instructions on this [YouTube video: (How to install Android 7 on Samsung Galaxy Tab 3)](https://www.youtube.com/watch?v=5zr8K7GXtNg), starting around minute 5, to wipe partition data and flash LineageOS
    - in TWRP press _wipe_ then _advanced wipe_
        - under _select partitions to wipe_ check the first 4 boxes (Dalvik / ART cache, System, Cache, and Data)
    - still in TWRP, tap _install_ and navigate to the LineageOS file copied earlier. Select and swipe right to go ahead and install it.
- After installation, use TWRP button that shows up to reboot the system. This took several minutes the first time but it worked!

## Home Assistant Tools/Setup

{% imgCaption src="/images/ha-tablet-dashboard.jpeg", alt="home assistant dashboard showing controls for 3-4 lights, temperature guages, and buttons", caption="the HA dashboard I'm using on the tablet at the moment " %}

- I'm using this [Fully Kiosk app](https://www.fully-kiosk.com/) to lock the tablet to the URL of the dashboard I built for it.
    - Note on installation: To install an app without google apps / playstore set up, need to configure LineageOS settings to allow packages from unknown sources: _Security → Unknown sources_. Then download apk file.
    - The app can use the device's camera to detect motion, so I've configured it to turn the tablet screen on only when motion is detected.
- [Fully Kiosk Home Assistant add-on](https://www.home-assistant.io/integrations/fully_kiosk/) uses remote administration to expose the device and several properties & actions in Home Assistant directly. A paid license for Fully Kiosk is required to use this, around $10, (though Fully also lets you test it for free).
- I'm also using the [kiosk-mode plugin](https://github.com/NemesisRE/kiosk-mode) (not related to Fully Kiosk app, just named similarly), which hides the Home Assistant header and sidebar drawer.
- I mounted the tablet on the wall, with charging cord attached, with some cheap wall mounts from Amazon.
- The charging cord is plugged into an MQTT smart plug, and I set up an automation to turn the charger on when the battery gets below 20%, and off when it gets back to full.
