from dataobject import DataObjectType, DataObject, ObjectType
from permission import *

class InstallationType(DataObjectType):
  def __init__(self, sectionName:str, displayName:str, path:str, priority:int, storageType:str, configFile:str):
    id = "__".join([configFile,sectionName,path])
    self.objectType = ObjectType.INSTALLATION
    super().__init__(id, self.objectType)
    self.sectionName = sectionName
    self.displayName = displayName
    self.path = path
    self.priority = priority
    self.storageType = storageType
    self.configFile = configFile

class InstallationObject(InstallationType, DataObject):
  def __init__(self, sectionName:str, path:str, displayName:str=None, priority:int=None, storageType:str=None, configFile:str="NOCONFIGFILE"):
    super().__init__(sectionName, displayName, path, priority, storageType, configFile)
  # Implement InstallationObject specific functions here

