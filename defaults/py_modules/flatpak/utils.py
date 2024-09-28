#!/usr/bin/env python
from enum import Enum
import sys

class string:
  Empty = '__VARIABLENOTSET__'
class integer:
  Empty = -sys.maxsize
class float:
  Empty = -sys.float_info.max
class VariableNotSet(Enum):
  STRING = '__VARIABLENOTSET__'
  INTEGER = -sys.maxsize
  FLOAT = -sys.float_info.max