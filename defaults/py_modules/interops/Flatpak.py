import decky
#from common.Errors import UserFacingException, FatalException
import asyncio, os, uuid

def BuildFlatpakCmd(cmd:str, installLocation:str = None) -> str:
  cmd += " --noninteractive -y"
  match installLocation:
    case "system" | "default":
      cmd += " --system"
    case "user":
      cmd += " --user"
    case None:
      pass
    case _:
      cmd += f" --installation={installLocation}"
  return cmd

async def ExecSubprocess(cmd):
  decky.logger(f'Running command: {cmd}')
  cmdID = uuid.uuid4()
  await decky.emit("flatpakCMD", cmdID, {"status": "start"})
  xdgRuntimeDir = os.environ.get("XDG_RUNTIME_DIR")
  proc = await asyncio.create_subprocess_shell(
    cmd,
    stdout=asyncio.subprocess.PIPE,
    stderr=asyncio.subprocess.PIPE,
    stdin=asyncio.subprocess.PIPE,
    env={"XDG_RUNTIME_DIR": xdgRuntimeDir})
  await decky.emit("flatpakCMD", cmdID, {"status": "running"})
  stdout = await proc.stdout.readline()
  while stdout:
    await decky.emit("flatpakCMD", cmdID, {"output": stdout.decode("utf-8").rstrip()})
    stdout = await proc.stdout.readline()
  await proc.wait()
  await decky.emit("flatpakCMD", cmdID, {"status": "complete", "returncode": proc.returncode})

async def UpdateAll():
  cmd = 'flatpak update'
  await ExecSubprocess(BuildFlatpakCmd(cmd))

async def Install(packages:list[str], installLocation:str):
  cmd = f"flatpak install {' '.join(packages)} --or-update"
  await ExecSubprocess(BuildFlatpakCmd(cmd, installLocation))

async def Uninstall(packages:list[str], installLocation:str):
  cmd = f"flatpak uninstall {' '.join(packages)}"
  await ExecSubprocess(BuildFlatpakCmd(cmd, installLocation))

async def Repair(installLocation:str):
  cmd = f"flatpak repair"
  await ExecSubprocess(BuildFlatpakCmd(cmd, installLocation))