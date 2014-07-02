Eager Beaver
============

![Eager Beaver](https://dl.dropboxusercontent.com/u/41921564/eagerbeaver.png)

http://eagerbeaver.io

Testing
-------

 - Install [ngrok](https://ngrok.com/download)
 - Start local server: `node server`
 - Unzip and start ngrok at port 8000: `./ngrok 8000`
 - Set up ngrok url (http://somethingsomething.ngrok.com) as webhook url under Service Hooks for some Staticstack-based GH repo

TODO
----

 - Modulize code
 - Integrate modules
 - Use rimraf for cleanup
 - Use async for queue?

Packages
--------

- https://www.npmjs.org/package/rimraf
- https://www.npmjs.org/package/pump
- https://www.npmjs.org/package/async
