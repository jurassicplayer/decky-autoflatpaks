#region Local Testing
# import sys
# sys.dont_write_bytecode = True
#from flatpak import *
from interops import *
# objs = Installation.getAll()
# print(objs[0].__dict__)
# from uuid import uuid4
# import sys

# import urllib.request as ur
# import urllib.error as ue
# import json
# import pprint as pp

# try:
#     response = ur.urlopen('https://flathub.org/api/v2/stats')
#     jresponse = json.loads(response.read())
#     pp.pprint(jresponse.get('category_totals'))
#     response = ur.urlopen('https://flathub.org/api/v2/collection/recently-added')
#     jresponse = json.loads(response.read())
#     pp.pprint(jresponse.get('hits')[0])
    
# except ue.URLError:
#     pass

# installs = Installation.getInstallations()
# print(installs)
# obj = Installation.InstallationObject()
# print(f'Created empty new Installation object: {vars(obj)}')
# obj = Installation.InstallationObject({'configFile': None})
# print(f'Created new Installation object based on data: {vars(obj)}')
# print(type(obj.configFile))
# obj.save()
# print(f'Saved new Installation object')
# objID = obj.id
# obj.load(objID)
# print(f'Loaded Installation object by Id: {objID} => {vars(obj)}')
# obj2 = Installation.InstallationObject(vars(obj))
# print(f'Created new Installation object from previous: {vars(obj2)}')
# obj2.save()
# print(f'Saved new Installation object')
# obj.id
#flatpakInterop.getInstallations()

#endregion


#region Plugin Template
import os

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code repo
# and add the `decky_loader/plugin/imports` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky
import asyncio, sys
from typing import Any

class Plugin:
    # A normal method. It can be called from the TypeScript side using @decky/api.
    async def add(self, left: int, right: int) -> int:
        return left + right

    async def callableError(self, trigger: bool) -> bool:
        if trigger:
            obj = Installation.InstallationObject()
            obj.save()
            raise Exception('Something has failed terribly')
        else:
            return trigger

    async def long_running(self):
        await asyncio.sleep(15)
        await decky.emit("test_event", "Hello from the backend!", True, 2)

    async def pyCall(self, className:str, functionName:str, args:Any):
        try:
            staticClass = getattr(sys.modules["interops"], className)
            staticFunction = getattr(staticClass, functionName)
            result = None
            if (args):
                result = await staticFunction(args)
            else:
                result = await staticFunction()
            #await decky.emit("test_event", result)
            return result
        except Exception as e:
            raise e

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        self.loop = asyncio.get_event_loop()
        decky.logger.info("Hello World!")

    # Function called first during the unload process, utilize this to handle your plugin being stopped, but not
    # completely removed
    async def _unload(self):
        decky.logger.info("Goodnight World!")
        pass

    # Function called after `_unload` during uninstall, utilize this to clean up processes and other remnants of your
    # plugin that may remain on the system
    async def _uninstall(self):
        decky.logger.info("Goodbye World!")
        pass

    async def start_timer(self):
        self.loop.create_task(self.long_running())

    # Migrations that should be performed before entering `_main()`.
    async def _migration(self):
        decky.logger.info("Migrating")
        # Here's a migration example for logs:
        # - `~/.config/decky-template/template.log` will be migrated to `decky.decky_LOG_DIR/template.log`
        decky.migrate_logs(os.path.join(decky.DECKY_USER_HOME,
                                               ".config", "decky-template", "template.log"))
        # Here's a migration example for settings:
        # - `~/homebrew/settings/template.json` is migrated to `decky.decky_SETTINGS_DIR/template.json`
        # - `~/.config/decky-template/` all files and directories under this root are migrated to `decky.decky_SETTINGS_DIR/`
        decky.migrate_settings(
            os.path.join(decky.DECKY_HOME, "settings", "template.json"),
            os.path.join(decky.DECKY_USER_HOME, ".config", "decky-template"))
        # Here's a migration example for runtime data:
        # - `~/homebrew/template/` all files and directories under this root are migrated to `decky.decky_RUNTIME_DIR/`
        # - `~/.local/share/decky-template/` all files and directories under this root are migrated to `decky.decky_RUNTIME_DIR/`
        decky.migrate_runtime(
            os.path.join(decky.DECKY_HOME, "template"),
            os.path.join(decky.DECKY_USER_HOME, ".local", "share", "decky-template"))
#endregion