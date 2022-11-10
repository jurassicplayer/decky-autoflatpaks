import logging

logging.basicConfig(filename="/tmp/autoflatpaks.log",
                    format='[AutoFlatpaks] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

import asyncio, re

class Plugin:
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
    
    async def checkForUpdates(self):
        logging.info('Received request to check for updates')
        cmd = 'flatpak remote-ls --updates --columns=name:full,installed-size:full,description:full,download-size:full,version:full,commit:full,branch:full,ref:full,origin:full,arch:full,runtime:full,application:full,options:full'
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

    async def updateAllPackages(self):
        logging.info('Received request to update all packages')
        cmd = 'flatpak update --noninteractive'
        proc = await self.pyexec_subprocess(cmd)
        if proc['exitcode'] != 0: raise NotImplementedError
        logging.info(proc['output'])
        return proc['output']