#!/usr/bin/env python
from ..dataobject.installation import InstallationObject
from configparser import ConfigParser
import decky, os
from ..error import UserFacingException



def getAll() -> tuple[list[InstallationObject], list[str]]:
  '''
  Checks file system for both default (system/user) and user-defined installation locations and
  returns a list of installations and any encountered config file errors. This function should
  ALWAYS return a result except in the event of config file errors, in which it should match the
  behaviour of the flatpak command.

  Returns:
    tuple: A tuple containing a list of installations and a list of errors 
  '''
  errors: list[UserFacingException] = []
  installationPaths: list[InstallationObject] = []
  # check for user installation (this one might be a little sus...need to double check return of decky.DECKY_USER_HOME and verify it's not root)
  userInstallationPath = os.path.join(decky.DECKY_USER_HOME, '.local/share/flatpak')
  if os.path.exists(userInstallationPath):
    decky.logger.info(f'User installation found: {userInstallationPath}')
    userInstallation = InstallationObject({
      'sectionName': 'user',
      'path': userInstallationPath,
      'displayName': 'User',
      'priority': 0
    })
    installationPaths.append(userInstallation)
  # system installation always exists
  systemInstallation = InstallationObject({
    'sectionName': 'default',
    'path': '/var/lib/flatpak',
    'displayName': 'System',
    'priority': 0
  })
  installationPaths.append(systemInstallation)

  rootConfigPath = '/etc/flatpak/installations.d'
  if not os.path.exists(rootConfigPath): return installationPaths
  for file in os.listdir(rootConfigPath):
    config = ConfigParser()
    # Files are processed in alphabetical order
    filepath = os.path.join(rootConfigPath, file)
    try:
      config.read(filepath)
    except Exception as e:
      # FIXME # raise Exception: Flatpak commands do NOT continue when any config cannot be properly read
      decky.logger.error(e)
      errors.append(f"While reading '{filepath}': {e}")
      continue
    for section in config.sections():
      sectionName = '"'.join(section.split('"')[1:-1]) # Remove outermost quotations
      path = config[section].get('path')
      if not path:
        # FIXME # raise Exception: Flatpak commands do NOT continue when any section of any config is missing a path
        errors.append(f"While reading '{filepath}': Key file does not have key “Path” in group “{section}”")
        continue
      if not os.path.exists(path):
        errors.append(f"While reading '{filepath}': Path '{path}' not found.")
      if sectionName in ('default', 'user'):
        errors.append(f"While reading '{filepath}': Bad installation ID '{sectionName}'. Ignoring")
        continue
      if next((x for x in installationPaths if x.sectionName == sectionName), None):
        errors.append(f"While reading '{filepath}': Duplicate installation ID '{sectionName}'. Ignoring")
        continue
      if next((x for x in installationPaths if x.path == path), None):
        errors.append(f"While reading '{filepath}': Duplicate path '{path}'. UI may exhibit odd behaviour")
      configPath = InstallationObject({
        'sectionName': sectionName,
        'configFile': file,
        'path': path,
        'displayName': config[section].get('displayname', sectionName),
        'priority': int(config[section].get('priority', 0)),
        'storageType': config[section].get('StorageType')
      })
      installationPaths.append(configPath)
  installationPaths.sort(key=lambda x: x.priority, reverse=True)
  return (installationPaths, errors)

def update():
  pass
def add():
  pass
def remove():
  pass