#!/usr/bin/env python
import decky
import traceback
from dataobject.dataobject import DataObject


def warn(exception):
  decky.logger.warning(f'{type(exception).__name__}: {exception}')

def error(exception):
  decky.logger.error(f'{type(exception).__name__}: {exception}')

def exception(exception):
  decky.logger.exception(exception)
  raise Exception(traceback.format_exc())

class UserFacingException(Exception): 
  def __init__(self, message: str, dataObject:DataObject):
    super().__init__(message)
    self.objectType = dataObject.objectType
    self.objectId = dataObject.id

