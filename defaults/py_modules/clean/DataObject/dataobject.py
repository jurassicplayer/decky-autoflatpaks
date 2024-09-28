#!/usr/bin/env python
from enum import Enum

class ObjectType(Enum):
    INSTALLATION = 'installation'
    PACKAGE = 'package'
    PERMISSION = 'permission'
    REMOTE = 'remote'

class DataObjectType:
  def __init__(self, id:str, objectType:ObjectType):
    self.id = id
    self.objectType = objectType

class DataObject(DataObjectType):
  def __init__(self, id:str, objectType:ObjectType):
    super().__init__(id, objectType)
  def loadData(self, id:str):
    print(f"loadData {self.id}")
  def save(self):
    print(f"save {self.id}")
  def remove(self):
    print(f"remove {self.id}")