Description
======================

This module was written when i received request for non commercial work.
Here is my ad: https://groups.google.com/forum/#!topic/commandfusion/IC1oX51V_kw

The device is this: 
http://www.digital-loggers.com/lpc.html 

User guide: 
http://www.digital-loggers.com/LPC6man.pdf 

FAQ: 
http://www.digital-loggers.com/lpcfaqs.html 

Live Access - (user = admin & pass = 4321) 
http://lpc.digital-loggers.com/ 

Features: 
. ON and OFF switches 
. feedback for all switches 

Usage
======================

At first you need define your module like in script "gui.js". You can use any digital joins for your buttons but you should define it like in my script for all eight outlets.

Then you add your buttons with your digital joins, set "Simulate Feedback" and "Toggle" options. Also to every button you must assign javascript command click() for your instance. In my case its "GUI.lpcDemo.click()". I made this because i defined CF.watch for digital join change and when i get feedback i change joins and it can call infinite loop. So when click() function is called it assign true to _joinChangedFromGUI and after sending "/outlet?" request it assign to false.


Also you can use function switchOutletByNumber(number, value). In this case you send direct value "ON" or "OFF" to selected outlet. For example switchOutletByNumber(5, 'ON') always switch on outlet 5. In this case you needn't assign specific join to button and assign click() command.
