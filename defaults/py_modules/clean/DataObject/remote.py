from dataobject import DataObjectType, DataObject, ObjectType

class RemoteType(DataObjectType):
  def __init__(self, id:str, name:str, title:str, url:str, collection_id:str, subset:str, filter:str, priority:str, options:str, comment:str, description:str, homepage:str, icon:str):
    id = "__".join(url,name)
    self.objectType = ObjectType.REMOTE
    super().__init__(id, self.objectType)
    self.name = name
    self.title = title
    self.url = url
    self.collection_id = collection_id
    self.subset = subset
    self.filter = filter
    self.priority = priority
    self.options = options
    self.comment = comment
    self.description = description
    self.homepage = homepage
    self.icon = icon

class RemoteObject(RemoteType, DataObject):
  def __init__(self, name:str, title:str, url:str, collection_id:str, subset:str, filter:str, priority:str, options:str, comment:str, description:str, homepage:str, icon:str):
    super().__init__(name, title, url, collection_id, subset, filter, priority, options, comment, description, homepage, icon)
  # Implement InstallationObject specific functions here