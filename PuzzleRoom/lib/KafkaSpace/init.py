import logging
import sys
import KafakSpace.logging as logger

## TODO:https://lukeplant.me.uk/blog/posts/dissecting-python-part-1/
## FROM: http://stackoverflow.com/questions/1977362/how-to-create-module-wide-variables-in-python
this = sys.modules[__name__]
this.LOGGER = None

def init(configPath):
    this.LOGGER = logger.init_logger(configPath)
