#!/usr/bin/env python
from ..dataobject.installation import InstallationObject
from configparser import ConfigParser
import decky, os
import decky

def getAll() -> list[InstallationObject]:
  installationPaths: list[InstallationObject] = []
  # check for user installation
  userInstallationPath = os.path.join(decky.DECKY_USER_HOME, '.local/share/flatpak')
  if os.path.exists(userInstallationPath):
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
  config = ConfigParser()
  for file in os.listdir(rootConfigPath):
    filepath = os.path.join(rootConfigPath, file)
    try:
      config.read(filepath)
    except Exception as e:
      decky.logger.error(e)
      continue
    for section in config.sections():
      sectionName = '"'.join(section.split('"')[1:-1]) # Remove outermost quotations
      configPath = InstallationObject({
        'id': sectionName,
        'configFile': file,
        'path': config[section].get('path'),
        'displayName': config[section].get('displayname', sectionName),
        'priority': int(config[section].get('priority', 0)),
        'storageType': config[section].get('StorageType')
      })
      installationPaths.append(configPath)
  installationPaths.sort(key=lambda x: x.priority, reverse=True)
  uniquePaths = set(installationPath.path for installationPath in installationPaths)
  if len(uniquePaths) != len(installationPaths):
    print('Warning: Some installation paths are shared between installations')
  return installationPaths

def update():
  pass
def add():
  pass
def remove():
  pass