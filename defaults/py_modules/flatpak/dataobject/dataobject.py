#!/usr/bin/env python
from enum import Enum, auto
from ..error import exception
class ObjectType(Enum):
    INSTALLATION = 'installation'
    PACKAGE = 'package'
    PERMISSION = auto()
    REMOTE = auto()

import sqlite3
import decky
class DataObject:
  id: int
  objectType: ObjectType

  class Sql:
    tableName:str
    create:str = 'CREATE TABLE IF NOT EXISTS {} (id INTEGER PRIMARY KEY AUTOINCREMENT, {} {})'
    insert:str = "INSERT INTO {} ({}) VALUES ({})"
    delete:str = "DELETE FROM {} WHERE id = {}"
    getById:str = "SELECT {} FROM {} WHERE id = {}"
    search:str = "SELECT {} FROM {} WHERE {}"

  def __init__(self, data=None):
    objectData = data
    if type(data) == int:
      objectData = self.loadData(data)
    self.mutateObject(objectData)
  
  def mutateObject(self, data=None):
    if data:
      for key in data:
        if key == 'objectType': continue
        if hasattr(self, key):
          setattr(self, key, data[key])
  
  def loadData(self, id):
    try:
      # Request self.id from db
      columnOrder = ','.join(vars(self).keys())
      query = self.Sql.getById.format(
        columnOrder,
        self.Sql.tableName,
        id
      )
      data = SqlInterops.query(query)
      if not data: raise Exception('No data found')
      dbData = data.pop(0)
      res = {}
      for idx, column in enumerate(columnOrder):
        columnData = dbData[idx]
        if columnData == 'NULL': columnData = None
        res.update({column: columnData})
      return res
    except Exception as e:
      # Failed to find id in DB
      decky.logger.exception(e)
  
  def save(self):
    newData = vars(self)
    newData.pop('objectType')
    print(f'Saving data: {newData}')
    for key in newData:
      if type(newData[key]) == int or type(newData[key]) == float:
        newData[key] = str(newData[key])
      elif newData[key] == None:
        newData[key] = 'NULL'
      else:
        newData[key] = f"'{newData[key]}'"
    try:
      query = self.Sql.insert.format(
        self.Sql.tableName,
        ','.join(newData.keys()),
        ",".join(newData.values())
      )
      SqlInterops.query(query)
    except Exception as e:
      decky.logger.exception(e)
      raise e

  def load(self, id=None):
    if id: self.id = id
    data = self.loadData(id)
    self.mutateObject(data)
    

  def remove(self):
    pass

class FetchType(Enum):
  ONE = auto()
  MANY = auto()
  ALL = auto()
class SqlInterops:
  def insert(object: DataObject):
    # get columns and determine column order
    columns = vars(object).keys()
    columnOrder = ','.join(columns)
    # 
    query = object.Sql.insert.format()
    pass
  def fetch(object: DataObject, fetch: FetchType, filter=None):
    try:
      con = sqlite3.connect('tmp/cache.db')
      cur = con.cursor()
      match fetch:
        case FetchType.ONE:
          pass
        case FetchType.MANY:
          pass
        case FetchType.ALL:
          data = cur.execute(sqlquery).fetchall()
    
      con.commit()
      con.close()
      return data
    except Exception as e:
      raise exception(e)
  def query(sqlquery):
    print(f'Running query:\n{sqlquery}')
    try:
      con = sqlite3.connect('tmp/cache.db')
      cur = con.cursor()
      data = cur.execute(sqlquery).fetchall()
      con.commit()
      con.close()
      return data
    except Exception as e:
      raise exception(e)
    # except sqlite3.OperationalError as e:
    #   decky.logger.exception(e)
    #   decky.logger.info(sqlquery)
    #   print('Missing table, invalid column name in sql, some sort of sql syntax error')
    #   raise e
    # except sqlite3.IntegrityError as e:
    #   decky.logger.exception(e)
    #   print('Some sort of constraint error')
    #   raise e
    # except Exception as e:
    #   decky.logger.exception(e)
    #   raise e

  '''
    Installations
    - installationID
    - configFile
    - path
    - displayName
    - priority
    - storageType
    Remotes (flatpak remotes --columns=all)
    - remoteID
    - name (user-defined when adding repo)
    - title (repo-defined)
    - url
    - collection_id
    - subset
    - filter
    - priority
    - options
    - comment
    - description
    - homepage
    - icon
    InstallationRemoteMap
    - installationID
    - remoteID
    Packages
    - url (binding to remoteID isn't a great plan, there can be multiple remotes that all use the same url)
  '''
  # Installations