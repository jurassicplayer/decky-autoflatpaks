import logging
logging.basicConfig(filename="/tmp/autoflatpaks.log",
                    format='[AutoFlatpaks] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

import asyncio
import os, re

from settings import SettingsManager
from helpers import get_home_path, get_homebrew_path, get_user

settings = SettingsManager(name="autoflatpaks", settings_directory='{}{}settings'.format(get_homebrew_path(get_home_path(get_user())), os.sep))
settings.read()


class Plugin:
    async def settings_read(self):
        return settings.read()
    async def settings_commit(self):
        return settings.commit()
    async def settings_getSetting(self, key: str, defaults):
        return settings.getSetting(key, defaults)
    async def settings_setSetting(self, key: str, value):
        return settings.setSetting(key, value)

    async def pyexec_subprocess(cmd:str):
        logging.info(f"Calling python subprocess: {cmd}")
        proc = await asyncio.create_subprocess_shell(cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE)
        stdout, stderr = await proc.communicate()
        output = stdout.decode()
        if proc.returncode != 0:
            output = stderr.decode()
        return {'exitcode': proc.returncode, 'output': output}
    
    async def CheckForUpdates(self):
        return await self.pullRemotePackageList(self, updateOnly=True)

    async def pullRemotePackageList(self, updateOnly=False):
        loggingInfo = 'Received request for list of remote packages'
        if updateOnly: loggingInfo = 'Received request to check for updates'
        logging.info(loggingInfo)
        cmd = 'flatpak remote-ls --columns=name:f,installed-size:f,description:f,download-size:f,version:f,commit:f,branch:f,ref:f,origin:f,arch:f,runtime:f,application:f,options:f'
        if updateOnly: cmd += ' --updates'
        proc = await self.pyexec_subprocess(cmd)
        if proc['exitcode'] != 0: raise NotImplementedError

        lines = proc['output'].split('\n')
        package_list = {}
        for line in lines:
            package_match = re.match(r'(?P<name>.*?)\s+(?P<installed_size>((\d+(\.\d+)?)|(\.\d+)).(bytes|kB|MB|GB))\s+(?P<description>.*)\s+(?P<download_size>((\d+(\.\d+)?)|(\.\d+)).(bytes|kB|MB|GB))\s+(?P<version>.*?)\s+(?P<commit>[aA-fF0-9]{12})\s+(?P<branch>.*?)\s+(?P<ref>\S+)\s+(?P<origin>.*?)\s+(?P<arch>(x86_64|i386|aarch64|arm))\s+(?P<runtime>.*?)\s+(?P<application>\S+)(|\s+(?P<options>.*))', line)
            if not package_match:
                if line: logging.info(f'Failed to parse: "{line}"')
                continue
            package = {
                'name':             package_match['name'],
                'application':      package_match['application'],
                'description':      package_match['description'],
                'version':          package_match['version'],
                'branch':           package_match['branch'],
                'arch':             package_match['arch'],
                'origin':           package_match['origin'],
                'ref':              package_match['ref'],
                'commit':           package_match['commit'],
                'runtime':          package_match['runtime'],
                'installed-size':   package_match['installed_size'],
                'download-size':    package_match['download_size'],
                'options':          package_match['options'],
            }
            package_list.update({package['ref']:package})
        return package_list

    async def LocalPackageList(self):
        LocalPackageList = {}
        LocalPackageList.update(await self.LocalPackageListRuntimes(self))
        LocalPackageList.update(await self.LocalPackageListApplications(self))
        return LocalPackageList
    
    async def LocalPackageListRuntimes(self):
        return await self.pullLocalPackageList(self, packageType="runtime")
    
    async def LocalPackageListApplications(self):
        return await self.pullLocalPackageList(self, packageType="app")

    async def pullLocalPackageList(self, packageType=""):
        loggingInfo = 'Received request for list of all local packages'
        cmd = 'flatpak list --columns=name:f,installation:f,description:f,size:f,version:f,active:f,branch:f,ref:f,origin:f,arch:f,runtime:f,application:f,options:f,latest:f'
        if packageType == "runtime":
            loggingInfo = 'Received request for list of local runtime packages'
            cmd+=" --runtime"
        elif packageType == "app":
            loggingInfo = 'Received request for list of local app packages'
            cmd+=" --app"
        if packageType: packageType += '/'
        logging.info(loggingInfo)
        proc = await self.pyexec_subprocess(cmd)
        if proc['exitcode'] != 0: raise NotImplementedError

        lines = proc['output'].split('\n')
        package_list = {}
        for line in lines:
            package_match = re.match(r'(?P<name>.*?)\s+(?P<installation>(system|user))\s+(?P<description>.*)\s+(?P<size>((\d+(\.\d+)?)|(\.\d+)).(bytes|kB|MB|GB))\s+(?P<version>.*?)\s+(?P<active>[aA-fF0-9]{12})\s+(?P<branch>.*?)\s+(?P<ref>\S+)\s+(?P<origin>.*?)\s+(?P<arch>(x86_64|i386|aarch64|arm))\s+(?P<runtime>.*?)\s+(?P<application>\S+)\s+(?P<options>.*)\s+(?P<latest>(-|[aA-fF0-9]{12}))', line)
            if not package_match:
                if line: logging.info(f'Failed to parse: "{line}"')
                continue
            package = {
                'name':             package_match['name'],
                'application':      package_match['application'],
                'description':      package_match['description'],
                'version':          package_match['version'],
                'branch':           package_match['branch'],
                'arch':             package_match['arch'],
                'origin':           package_match['origin'],
                'ref':              "{}{}".format(packageType, package_match['ref']),
                'active':           package_match['active'],
                'runtime':          package_match['runtime'],
                'latest':           package_match['latest'],
                'installation':     package_match['installation'],
                'size':             package_match['size'],
                'options':          package_match['options']
            }
            package_list.update({"{}{}".format(packageType, package_match['ref']):package})
        return package_list

    async def UpdateAllPackages(self):
        logging.info('Received request to update all packages')
        cmd = 'flatpak update --noninteractive'
        proc = await self.pyexec_subprocess(cmd)
        if proc['exitcode'] != 0: raise NotImplementedError
        logging.info(proc['output'])
        return proc['output']