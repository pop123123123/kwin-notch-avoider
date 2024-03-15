# KWin Script Notch Cut Accommodation for Plasma 5

This is a KWin script that automatically resizes all windows so that they're not obstructed by the MacBook's notch and adjusts the taskbar size to match it. It also hides the taskbar when a window is in fullscreen to avoid a conspicuous light at the top of the screen.

## Features

- Automatically resizes all windows so that they're not obstructed by the MacBook's notch
- Adjusts taskbar size to match the notch whatever the screen scaling
- Hides the taskbar when a window is in fullscreen (you can still access it by moving the mouse to the top of the screen)
- Works with multiple displays (only applies to the display with the notch)

## Installation

### From KDE Store

1. Go to System Settings > Window Management > KWin Scripts

2. Click on "Get New Scripts" and search for "Kwin/Plasma notch avoider"

3. Click on "Install" and then enable it

### From Source

1. Clone this repository:
```bash
git clone https://github.com/user/kwin-notch-avoider.git
```

2. Navigate to the cloned directory:
```bash
cd kwin-notch-avoider
```

3. Build and install the script:
```bash
make install
```
OR

3. Build the script:
```bash
make
```
And install the script:
Go to `System Settings > Window Management > KWin Scripts` and click on "Install from file" and select the `notch.kwinscript` file.

4. To enable it, go to `System Settings > Window Management > KWin Scripts` and check `Kwin/Plasma notch avoider`.

## Configuration

You can configure the script by going to `System Settings > Window Management > KWin Scripts` and clicking on the "Configure" button next to `Kwin/Plasma notch avoider`.
You can then change the following settings:
- **Notch Thickness**: The thickness of the notch in real pixels (default: 65, the value found on the M1 MacBook Pro 16"), you can find this value by setting the screen scaling to 100% and changing the taskbar size until it matches the notch.
- **Main Screen Width**: The width of the main screen in real pixels (default: 3456, the value found on the M1 MacBook Pro 16"), you can find this value in `System Settings > Display and Monitor > Display Configuration`.
- **Main Screen Height**: The height of the main screen in real pixels (default: 2232, the value found on the M1 MacBook Pro 16"), same as above.

**Don't forget to put the taskbar on top of the screen for the script to work.**

The colors below the taskbar (in fullscreen) will be your wallpaper, so I would recommend editing it to add a black bar at the top with the right size to match the notch, and setting the taskbar to opaque.
For instance:
- My wallpaper is 3200x2000 (a bit wider aspect ratio than my screen, so the full height will be visible)
- I have a 65px notch and a 2232px height
The thickness of the black bar I need to draw onto the wallpaper is 65px * 2000px / 2232px ≈ 58px

## Uninstallation

If you wish to uninstall the script, you can do so by running:
```bash
kpackagetool5 -t KWin/Script -r notch
```
or by going to the cloned directory and running:
```bash
make uninstall
```

or by going to `System Settings > Window Management > KWin Scripts` and unchecking `Kwin/Plasma notch avoider`, then clicking on "Apply". You can also click on the "Delete" icon to remove the script from your system (then click "Apply").

## Troubleshooting

### Known Issues

- Taskbar autohide doesn't properly work when stuck between two displays

This issue is solved in plasma 6.1, see this issue for more information and workarounds:
https://bugs.kde.org/show_bug.cgi?id=351175

If you have any issues, please report them on the issue tracker.