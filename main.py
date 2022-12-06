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
        output = settings.read()
        return {'output': output}
    async def settings_commit(self):
        output = settings.commit()
        return {'output': output}
    async def settings_getSetting(self, key: str, defaults):
        output = settings.getSetting(key, defaults)
        return {'output': output}
    async def settings_setSetting(self, key: str, value):
        output = settings.setSetting(key, value)
        return {'output': output}

    async def pyexec_subprocess(self, cmd:str, input:str=''):
        logging.info(f'Calling python subprocess: "{cmd}"')
        proc = await asyncio.create_subprocess_shell(cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            stdin=asyncio.subprocess.PIPE)
        stdout, stderr = await asyncio.wait_for(proc.communicate(input.encode()), timeout=20)
        stdout = stdout.decode()
        stderr = stderr.decode()
        logging.info(f'Returncode: {proc.returncode}')
        logging.info(f'STDOUT: {stdout}')
        logging.info(f'STDERR: {stderr}')
        return {'returncode': proc.returncode, 'stdout': stdout, 'stderr': stderr}
    
    async def getUpdatePackageList(self):
        logging.info('Received request for list of available updates')
        cmd = 'flatpak update --no-deps'
        proc = await self.pyexec_subprocess(self, cmd)
        
        package_list = []
        lines = proc['stdout'].split('\n')
        for line in lines:
            if not line: continue
            package_match = re.match(r'(|\s)(?:\d+.)\s+(?P<application>[^\s,]+?)\s+(?P<branch>.*?)\s+(?P<op>(i|u|r))\s+(?P<remote>[^\s]+?)\s+<\s+(?P<download_size>((\d+(\.\d+)?)|(\.\d+)).(bytes|kB|MB|GB|TB|PB))(\s\((?P<partial>partial)\)|)', line)
            if not package_match:
                logging.info(f'Failed to parse: "{line}"')
                continue
            partial = False
            if package_match['partial']: partial = True
            package = {
                'application':      package_match['application'],
                'branch':           package_match['branch'],
                'op':               package_match['op'],
                'remote':           package_match['remote'],
                'download_size':    package_match['download_size'].replace(u"\u00A0", " "),
                'partial':          partial,
            }
            package_list.append(package)
        proc.update({'output': package_list})
        return proc

    async def getMaskList(self):
        logging.info('Received request for list of masks')
        proc = await self.pyexec_subprocess(self, 'flatpak mask')

        mask_list = []
        lines = proc['stdout'].split('\n')
        for line in lines:
            if not line: continue
            package_match = re.match(r'(\s+)(?P<mask>.*)', line)
            if not package_match: continue
            mask_list.append(package_match['mask'])
        proc.update({'output': mask_list})
        return proc

    async def getRemotePackageList(self, updateOnly = False):
        logging.info('Received request for list of remote packages')
        cmd = 'flatpak remote-ls --columns=name:f,installed-size:f,description:f,download-size:f,version:f,commit:f,branch:f,ref:f,origin:f,application:f,runtime:f,arch:f,options:f'
        if updateOnly: cmd += ' -a --updates'
        proc = await self.pyexec_subprocess(self, cmd)
        if proc['returncode'] != 0: raise NotImplementedError

        lines = proc['stdout'].split('\n')
        package_list = []
        for line in lines:
            package_match = re.match(r'(?P<name>.*?)\s+(?P<installed_size>((\d+(\.\d+)?)|(\.\d+)).(bytes|kB|MB|GB))\s+(?P<description>.*)\s+(?P<download_size>((\d+(\.\d+)?)|(\.\d+)).(bytes|kB|MB|GB))\s+(?P<version>.*?)\s+(?P<commit>[aA-fF0-9]{12})\s+(?P<branch>.*?)\s+(?P<ref>\S+)\s+(?P<origin>.*?)\s+(?P<application>\S+)\s+(?P<runtime>.*?)\s+(?P<arch>(x86_64|i386|aarch64|arm))(|\s+(?P<options>.*))$', line)
            if not package_match:
                if line: logging.info(f'Failed to parse: "{line}"')
                continue
            reference = package_match['ref'].split('/',1)
            package: dict[str,str|None] = {
                'name':             package_match['name'],
                'application':      package_match['application'],
                'description':      package_match['description'],
                'version':          package_match['version'],
                'branch':           package_match['branch'],
                'arch':             package_match['arch'],
                'origin':           package_match['origin'],
                'ref':              reference[1],
                'commit':           package_match['commit'],
                'runtime':          package_match['runtime'],
                'installed_size':   package_match['installed_size'].replace(u"\u00A0", " "),
                'download_size':    package_match['download_size'].replace(u"\u00A0", " "),
                'options':          package_match['options'],
                'packagetype':      reference[0],
                'parent':           None
            }
            if package['options'] and 'eol=' in package['options']: continue # Remove end of life packages from list
            if not package['description']: package['description'] = package['application']
            if package['application'] and (package['application'].endswith('.Debug') or package['application'].endswith('.Locale') or package['application'].endswith('.Sources')):
                package['parent'] = '{}/{}/{}'.format(package['application'].rsplit('.', 1)[0], package['arch'], package['branch'])
            package_list.append(package)
        proc.update({'output': package_list})
        return proc

    async def getLocalPackageList(self):
        LocalPackageList = []
        LPLRuntime      = (await self.pullLocalPackageList(self, packageType="runtime"))
        LPLApplication  = (await self.pullLocalPackageList(self, packageType="app"))
        LocalPackageList += LPLRuntime['output'] + LPLApplication['output']
        return {'output': LocalPackageList}

    async def pullLocalPackageList(self, packageType=""):
        loggingInfo = 'Received request for list of all local packages'
        cmd = 'flatpak list -a --columns=name:f,installation:f,description:f,size:f,version:f,active:f,branch:f,ref:f,origin:f,application:f,runtime:f,arch:f,options:f,latest:f'
        if packageType == "runtime":
            loggingInfo = 'Received request for list of local runtime packages'
            cmd+=" --runtime"
        elif packageType == "app":
            loggingInfo = 'Received request for list of local app packages'
            cmd+=" --app"
        logging.info(loggingInfo)
        proc = await self.pyexec_subprocess(self, cmd)
        if proc['returncode'] != 0: raise NotImplementedError

        lines = proc['stdout'].split('\n')
        package_list = []
        for line in lines:
            package_match = re.match(r'(?P<name>.*?)\s+(?P<installation>(system|user))\s+(?P<description>.*)\s+(?P<size>((\d+(\.\d+)?)|(\.\d+)).(bytes|kB|MB|GB|TB|PB))\s+(?P<version>.*?)\s+(?P<active>[aA-fF0-9]{12})\s+(?P<branch>.*?)\s+(?P<ref>\S+)\s+(?P<origin>.*?)\s+(?P<application>[^\s,]+)\s+(?P<runtime>.*?)\s+(?P<arch>(x86_64|i386|aarch64|arm))\s+(?P<options>.*)\s+(?P<latest>(-|[aA-fF0-9]{12}))$', line)
            if not package_match:
                if line and line not in ["Looking for updates…", "Proceed with these changes to the system installation? [Y/n]: n"]:
                    logging.info(f'Failed to parse: "{line}"')
                continue
            package: dict[str, str | None] = {
                'name':             package_match['name'],
                'application':      package_match['application'],
                'description':      package_match['description'],
                'version':          package_match['version'],
                'branch':           package_match['branch'],
                'arch':             package_match['arch'],
                'origin':           package_match['origin'],
                'ref':              package_match['ref'],
                'active':           package_match['active'],
                'runtime':          package_match['runtime'],
                'latest':           package_match['latest'],
                'installation':     package_match['installation'],
                'installed_size':   package_match['size'].replace(u"\u00A0", " "),
                'options':          package_match['options'],
                'packagetype':      packageType,
                'parent':           None
            }
            if not package['description']: package['description'] = package['application']
            if package['application'] and (package['application'].endswith('.Debug') or package['application'].endswith('.Locale') or package['application'].endswith('.Sources')):
                package['parent'] = '{}/{}/{}'.format(package['application'].rsplit('.', 1)[0], package['arch'], package['branch'])
            package_list.append(package)
        proc.update({'output': package_list})
        return proc

    async def MaskPackage(self, pkgref):
        logging.info(f'Received request to mask package: {pkgref}')
        return await self.pyexec_subprocess(self, f'flatpak mask {pkgref}')
    async def UnMaskPackage(self, pkgref):
        logging.info(f'Received request to unmask package: {pkgref}')
        return await self.pyexec_subprocess(self, f'flatpak mask --remove {pkgref}')
    async def InstallPackage(self, pkgref):
        logging.info(f'Received request to install package: {pkgref}')
        return await self.pyexec_subprocess(self, f'flatpak install --noninteractive {pkgref}')
    async def UnInstallPackage(self, pkgref):
        logging.info(f'Received request to uninstall package: {pkgref}')
        return await self.pyexec_subprocess(self, f'flatpak uninstall --noninteractive {pkgref}')
    async def UpdatePackage(self, pkgref):
        logging.info(f'Received request to update package: {pkgref}')
        return await self.pyexec_subprocess(self, f'flatpak update --noninteractive {pkgref}')

    async def UpdateAllPackages(self):
        logging.info('Received request to update all packages')
        return await self.pyexec_subprocess(self, 'flatpak update --noninteractive')