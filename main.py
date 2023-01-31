import logging
import asyncio, json, os, re
from typing import Callable

from settings import SettingsManager # type: ignore
from helpers import get_user_id, get_home_path # type: ignore

# Setup environment variables
settingsDir = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]
loggingDir = os.environ["DECKY_PLUGIN_LOG_DIR"]
defaultAppDataDirectory = os.path.join(get_home_path(), '.var', 'app')
XDG_RUNTIME_DIR = os.path.join(os.path.abspath(os.sep), 'run', 'user', str(get_user_id()))

# Setup backend logger
logging.basicConfig(filename=os.path.join(loggingDir, 'backend.log'),
                    format='[AutoFlatpaks] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

# Migrate any old settings
oldSettingsPath = os.path.join(get_home_path(), 'settings', 'autoflatpaks.json')
if os.path.exists(oldSettingsPath):
    os.replace(oldSettingsPath, os.path.join(settingsDir, 'settings.json'))

# Setup decky-loader SettingsManager
settings = SettingsManager(name="settings", settings_directory=settingsDir)
settings.read()

parentPackageOverrides = {
    'org.DolphinEmu.dolphin_emu' : 'org.DolphinEmu.dolphin-emu'
}

class CLIPostProcessor:
    @staticmethod
    def getUpdatePackageList(item, kwargs):
        item['partial'] = True if item['partial'] else False
        return item
    @staticmethod
    def getMaskList(item, kwargs):
        if item.get('mask'): return item['mask']
    @staticmethod
    def getPackageHistory(item, kwargs):
        if item.get('entry'): return json.loads(item['entry'])
    @staticmethod
    def getLocalPackageList(item, kwargs):
        if kwargs.get('packageType'): item['packagetype'] = kwargs['packageType']
        return CLIPostProcessor.pullPackageListPostProcess(item, kwargs)
    @staticmethod
    def getRemotePackageList(item, kwargs):
        reference = item['ref'].split('/',1)
        item['ref'] = reference[1]
        item['packagetype'] = reference[0]
        return CLIPostProcessor.pullPackageListPostProcess(item, kwargs)
    @staticmethod
    def pullPackageListPostProcess(item, kwargs):
        if not item['description']: item['description'] = item['application']
        if item.get('installed_size'): item['installed_size'] = item['installed_size'].replace(u"\u00A0", " ").replace("?", " ")
        if item.get('download_size'): item['download_size'] = item['download_size'].replace(u"\u00A0", " ").replace("?", " ")
        if item.get('application') and (item['application'].endswith('.Debug') or item['application'].endswith('.Locale') or item['application'].endswith('.Sources')):
            childPackage = item['application'].rsplit('.', 1)[0]
            item['parent'] = '{}/{}/{}'.format(childPackage, item['arch'], item['branch'])
            # Parent package overrides for the oddballs that don't have the same package name between the two
            if childPackage in parentPackageOverrides: item['parent'] = '{}/{}/{}'.format(parentPackageOverrides[childPackage], item['arch'], item['branch'])
        return item

class Plugin:
    async def settings_read(self):
        output = settings.read()
        return {'output': output, 'returncode': 0, 'stdout': '', 'stderr': ''}
    async def settings_commit(self):
        output = settings.commit()
        return {'output': output, 'returncode': 0, 'stdout': '', 'stderr': ''}
    async def settings_getSetting(self, key: str, defaults):
        output = settings.getSetting(key, defaults)
        return {'output': output, 'returncode': 0, 'stdout': '', 'stderr': ''}
    async def settings_setSetting(self, key: str, value):
        output = settings.setSetting(key, value)
        return {'output': output, 'returncode': 0, 'stdout': '', 'stderr': ''}
    async def getAppDataDirectory(self):
        output = os.path.realpath(defaultAppDataDirectory)
        return {'output': output, 'returncode': 0, 'stdout': '', 'stderr': ''}
    async def pyexec_subprocess(self, cmd:str, input:str=''):
        logging.info(f'Calling python subprocess: "{cmd}"')
        runtimeDir = os.environ.get("XDG_RUNTIME_DIR")
        if not runtimeDir: runtimeDir = XDG_RUNTIME_DIR
        proc = await asyncio.create_subprocess_shell(cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            stdin=asyncio.subprocess.PIPE,
            env={"XDG_RUNTIME_DIR": runtimeDir})
        stdout, stderr = await proc.communicate(input.encode())
        stdout = stdout.decode()
        stderr = stderr.decode()
        logging.info(f'Returncode: {proc.returncode}\nSTDOUT: {stdout[:300]}\nSTDERR: {stderr[:300]}')
        return {'returncode': proc.returncode, 'stdout': stdout, 'stderr': stderr}

    async def digestCLIOutput(self, cmd: str, regex: str, linePostProcess: Callable|None = None, **kwargs):
        logging.info(f'Digest CLI output: {cmd}')
        proc = await self.pyexec_subprocess(self, cmd) # type: ignore
        proc.update({'output': ''})
        try:
            if proc['returncode'] != 0: raise NotImplementedError
            lines = proc['stdout'].split('\n')
            matchList = []
            for line in lines:
                regexMatch = re.match(regex, line)
                if not regexMatch:
                    if line: logging.info(f'Failed to parse: "{line}"')
                    continue
                dictMatch = regexMatch.groupdict()
                if linePostProcess: dictMatch = linePostProcess(dictMatch, kwargs)
                matchList.append(dictMatch)
            proc.update({'output': matchList})
        except Exception as e:
            logging.info(f'Failed to digest CLI output: {e}')
        return proc
    
    async def getSpaceRemaining(self):
        logging.info('Received request for space remaining')
        return await self.pyexec_subprocess(self, 'df -P {}'.format(os.path.join(get_home_path(),'.var','app'))) # type: ignore

    async def getPackageHistory(self):
        logging.info('Received request for package history')
        # Returns json objects with most recent on top
        cmd = 'journalctl $(which flatpak) -t flatpak -o json -r --output-fields=MESSAGE'
        regex = r'(?P<entry>.+)$'
        proc = await self.digestCLIOutput(self, cmd, regex, CLIPostProcessor.getPackageHistory) # type: ignore
        return proc
    async def getUnusedPackageList(self):
        logging.info('Received request for list of unused packages')
        cmd = 'flatpak remove --unused'
        regex = r'(?:|\s)(?:\d+.)\s+(?P<application>[^\s,]+?)\s+(?P<branch>.*?)\s+(?P<op>i|u|r)'
        proc = await self.digestCLIOutput(self, cmd, regex) # type: ignore
        return proc
    async def getRunningPackageList(self):
        logging.info('Received request for list of running packages')
        cmd = 'flatpak ps --columns=instance:f,application:f,arch:f,branch:f,commit:f,runtime:f,pid:f,runtime-branch:f,child-pid:f,active:f,runtime-commit:f,background:f'
        regex = r'(?P<instance>\d+)\s+(?P<application>\S+)\s+(?P<arch>(x86_64|i386|aarch64|arm))\s+(?P<branch>.*?)\s+(?P<commit>[aA-fF0-9]{12})\s+(?P<runtime>.*?)\s+(?P<pid>\d+)\s+(?P<runtime_branch>.*?)\s+(?P<child_pid>\d+)\s+(?P<active>.*?)\s+(?P<runtime_commit>[aA-fF0-9]{12})\s+(?P<background>.*?)$'
        proc = await self.digestCLIOutput(self, cmd, regex) # type: ignore
        return proc
    async def getUpdatePackageList(self):
        logging.info('Received request for list of available updates')
        cmd = 'flatpak update --no-deps'
        regex = r'(|\s)(?:\d+.)\s+(?P<application>[^\s,]+?)\s+(?P<branch>.*?)\s+(?P<op>i|u|r)\s+(?P<remote>[^\s]+?)\s+<\s+(?P<download_size>((\d+(\.\d+)?)|(\.\d+)).(bytes|kB|MB|GB|TB|PB))(\s\((?P<partial>partial)\)|)'
        proc = await self.digestCLIOutput(self, cmd, regex, CLIPostProcessor.getUpdatePackageList) # type: ignore
        return proc
    async def getMaskList(self):
        logging.info('Received request for list of masks')
        cmd = 'flatpak mask'
        regex = r'\s+(?P<mask>.+)$'
        proc = await self.digestCLIOutput(self, cmd, regex, CLIPostProcessor.getMaskList) # type: ignore
        return proc
    async def getRemotePackageList(self, updateOnly = False):
        logging.info('Received request for list of remote packages')
        cmd = 'flatpak remote-ls --columns=name:f,installed-size:f,description:f,download-size:f,version:f,commit:f,branch:f,ref:f,origin:f,application:f,runtime:f,arch:f,options:f'
        if updateOnly: cmd += ' -a --updates'
        regex = r'(?P<name>.*?)\s+(?P<installed_size>((\d+(\.\d+)?)|(\.\d+)).(bytes|kB|MB|GB))\s+(?P<description>.*)\s+(?P<download_size>((\d+(\.\d+)?)|(\.\d+)).(bytes|kB|MB|GB))\s+(?P<version>.*?)\s+(?P<commit>[aA-fF0-9]{12})\s+(?P<branch>.*?)\s+(?P<ref>\S+)\s+(?P<origin>.*?)\s+(?P<application>\S+)\s+(?P<runtime>.*?)\s+(?P<arch>(x86_64|i386|aarch64|arm))(|\s+(?P<options>.*))$'
        proc = await self.digestCLIOutput(self, cmd, regex, CLIPostProcessor.getRemotePackageList) # type: ignore
        return proc
    async def getLocalPackageList(self):
        logging.info('Received request for list of local packages')
        cmd = 'flatpak list -a --columns=name:f,installation:f,description:f,size:f,version:f,active:f,branch:f,ref:f,origin:f,application:f,runtime:f,arch:f,options:f,latest:f'
        regex = r'(?P<name>.*?)\s+(?P<installation>(system|user))\s+(?P<description>.*)\s+(?P<installed_size>((\d+(\.\d+)?)|(\.\d+)).(bytes|kB|MB|GB|TB|PB))\s+(?P<version>.*?)\s+(?P<active>[aA-fF0-9]{12})\s+(?P<branch>.*?)\s+(?P<ref>\S+)\s+(?P<origin>.*?)\s+(?P<application>[^\s,]+)\s+(?P<runtime>.*?)\s+(?P<arch>(x86_64|i386|aarch64|arm))\s+(?P<options>.*)\s+(?P<latest>(-|[aA-fF0-9]{12}))$'
        LPLApplication = await self.digestCLIOutput(self, f'{cmd} --app', regex, CLIPostProcessor.getLocalPackageList, packageType="app") # type: ignore
        LPLRuntime     = await self.digestCLIOutput(self, f'{cmd} --runtime', regex, CLIPostProcessor.getLocalPackageList, packageType="runtime") # type: ignore
        LocalPackageList = LPLRuntime['output'] + LPLApplication['output']
        returncode = LPLRuntime['returncode'] | LPLApplication['returncode']
        stdout = "{}\n{}".format(LPLRuntime['stdout'], LPLApplication['stdout'])
        stderr = "{}\n{}".format(LPLRuntime['stderr'], LPLApplication['stderr'])
        return {'output': LocalPackageList, 'returncode': returncode, 'stdout': stdout, 'stderr': stderr}

    async def MaskPackage(self, pkgref):
        logging.info(f'Received request to mask package: {pkgref}')
        return await self.pyexec_subprocess(self, f'flatpak mask {pkgref}') # type: ignore
    async def UnMaskPackage(self, pkgref):
        logging.info(f'Received request to unmask package: {pkgref}')
        return await self.pyexec_subprocess(self, f'flatpak mask --remove {pkgref}') # type: ignore
    async def InstallPackage(self, pkgref):
        logging.info(f'Received request to install package: {pkgref}')
        return await self.pyexec_subprocess(self, f'flatpak install --noninteractive {pkgref}') # type: ignore
    async def UnInstallPackage(self, pkgref, removeUnused = False):
        logging.info(f'Received request to uninstall package: {pkgref}')
        cmd = f'flatpak uninstall --noninteractive'
        if removeUnused: cmd += ' --no-related' # Add --no-related for when using RemoveUnusedPackages function
        return await self.pyexec_subprocess(self, '{} {}'.format(cmd, pkgref)) # type: ignore
    async def UpdatePackage(self, pkgref):
        logging.info(f'Received request to update package: {pkgref}')
        return await self.pyexec_subprocess(self, f'flatpak install --noninteractive --no-auto-pin --or-update {pkgref}') # type: ignore
    async def RepairPackages(self, dryrun = True):
        cmd = 'flatpak repair'
        if dryrun: cmd += ' --dry-run'
        logging.info('Received request to repair flatpak installation')
        return await self.pyexec_subprocess(self, cmd) # type: ignore
