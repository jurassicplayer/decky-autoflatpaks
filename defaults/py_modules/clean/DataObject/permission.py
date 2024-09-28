from dataobject import DataObjectType, DataObject, ObjectType

class InstallationType(DataObjectType):
  def __init__(self, id:str, sectionName:str, displayName:str, path:str, priority:int, storageType:str, configFile:str):
    self.objectType = ObjectType.INSTALLATION
    super().__init__(id, self.objectType)
    self.sectionName = sectionName
    self.displayName = displayName
    self.path = path
    self.priority = priority
    self.storageType = storageType
    self.configFile = configFile

class InstallationObject(InstallationType, DataObject):
  def __init__(self, sectionName:str, displayName:str, path:str, priority:int, storageType:str, configFile:str):
    id = "__".join(configFile,sectionName,path)
    super().__init__(id, sectionName, displayName, path, priority, storageType, configFile)
  # Implement InstallationObject specific functions here

class PermissionType(DataObject):
  def __init__(self):
    pass