#!/usr/bin/env python
from .dataobject import DataObject, ObjectType


class InstallationObject(DataObject):
  class Sql(DataObject.Sql):
    tableName = 'Installations'
    tableColumns = [
        ('sectionName', 'TEXT'),
        ('configFile', 'TEXT'),
        ('path', 'TEXT'),
        ('displayName', 'TEXT'),
        ('priority', 'NUMERIC'),
        ('storageType' 'TEXT')
      ]
    tableOptions = [
      'UNIQUE(sectionName)'
    ]

  def __init__(self, data=None):
    self.sectionName: str = ''
    self.configFile:str = 'autoflatpak.conf'
    self.path:str = ''
    self.displayName:str = ''
    self.priority:int = 0
    self.storageType:str = ''
    setattr(self, 'objectType', ObjectType.INSTALLATION)
    super().__init__(data)