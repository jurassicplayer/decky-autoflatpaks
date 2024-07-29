#!/usr/bin/env python
import decky
import traceback


def warn(exception):
  decky.logger.warning(f'{type(exception).__name__}: {exception}')

def error(exception):
  decky.logger.error(f'{type(exception).__name__}: {exception}')

def exception(exception):
  decky.logger.exception(exception)
  raise Exception(traceback.format_exc())