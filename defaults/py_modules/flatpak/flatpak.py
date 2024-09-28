#!/usr/bin/env python

#region Notes
"""
This file should eventually be replaced with an actual python module with models for
the various flatpak "objects" (ex. remotes, packages, installations, history?, etc.),
but is going to be temporarily used as a functional placeholder with simplified
interactions with flatpak.

These interactions will be separated into 2 parts:
- command execution
- parse results

Every interaction should be categorized into 2 different categories:
- blocking (should return some sort of result)
- non-blocking (should emit a result)

List of commands:
- non-blocking
  - flatpak install
  - flatpak remote-ls
"""


async def install(packages:list[str], installation:str=None, remote:str=None, reinstall:bool=None, noDeploy:bool=None, noPull:bool=None, noRelated:bool=None, noDeps:bool=None, orUpdate:bool=True, includeSDK:bool=None, includeDebug:bool=None, assumeYes:bool=None, noninteractive:bool=True):
  # Only for package installations/reinstallations
  # flatpak install <packages>
  cmd = ['flatpak', 'install']
  if reinstall: cmd.append('--reinstall')
  if installation:
    if IsUserInstallation(installation): cmd.append('--user')
    else: cmd.append(f'--installation={installation}')
  if noDeploy: cmd.append('--no-deploy')
  if noPull: cmd.append('--no-pull')
  if noRelated: cmd.append('--no-related')
  if noDeps: cmd.append('--no-deps')
  if orUpdate: cmd.append('--or-update')
  if includeSDK: cmd.append('--include-sdk')
  if includeDebug: cmd.append('--include-debug')
  if assumeYes: cmd.append('--assumeyes')
  if noninteractive: cmd.append('--noninteractive')


  if remote: cmd.append(remote)
  cmd.append()
  f' {' '.join(packages)}'
  pass

async def update(installation, package, commit=None):
  # Only for package updates and downgrading
  pass

async def uninstall(installation, package):
  # Only for package removal
  pass

async def remoteInfo(installation, remote, package):
  # Request for commit history (in order to see available downgradeable package versions)
  pass

async def remotes(installation):
  pass

def IsUserInstallation(installation: str) -> bool:
  if installation == 'user':
    return True
  return False