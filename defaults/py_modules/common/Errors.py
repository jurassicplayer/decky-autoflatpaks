#!/usr/bin/env python
import decky
import traceback, uuid


def warn(exception):
  decky.logger.warning(f'{type(exception).__name__}: {exception}')

def error(exception):
  decky.logger.error(f'{type(exception).__name__}: {exception}')

def exception(exception):
  decky.logger.exception(exception)
  raise Exception(traceback.format_exc())

class UserFacingException(Exception):
  def __init__(self, message: str, recordID: uuid.UUID = None):
    super().__init__(message)
    self.errorType = type(self).__name__
    self.errorID = uuid.uuid4()
    self.recordID = recordID

class FatalException(Exception):
  def __init__(self, message: str, recordID: uuid.UUID = None):
    super().__init__(message)
    self.errorType = type(self).__name__
    self.errorID = uuid.uuid4()
    self.recordID = recordID