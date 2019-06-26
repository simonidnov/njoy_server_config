#!/bin/bash
#sleep 10
killall chromium-browser

sudo rngd -o /dev/random -r /dev/urandom

export DISPLAY=:0
# IMPOTANT SIMON : --ignore-gpu-blacklist is disabled for perf new update pi chromium
# chromium-browser --noerrdialogs --ignore-gpu-blacklist --disable-infobars --disable-session-crashed-bubble --incognito --kiosk --start-maximized http://10.3.141.1:3000/receptor
# chromium-browser --noerrdialogs --disable-infobars --disable-session-crashed-bubble --incognito --kiosk --start-maximized http://10.3.141.1:3000/receptor
epiphany-browser -a --profile ~/.config http://10.3.141.1:3000/receptor

#chromium-browser --noerrdialogs --disable-infobars --disable-session-crashed-bubble --incognito --kiosk --start-maximized http://10.3.141.1:3000/receptor

#chromium-browser --start-maximized --noerrdialogs --disable-infobars --disable-session-crashed-bubble --start-maximized http://10.3.141.1:3000/receptor

#sudo amixer cset numid=1<<njoynjoy
#sleep 15
#xte "key F11" -x:0

#chromium-browser --kiosk http://10.3.141.1:3000/receptor
#sleep 10
#epiphany http://10.3.141.1:3000/receptor --display=:0 &
#sleep 15
#xte "key F11" -x:0
