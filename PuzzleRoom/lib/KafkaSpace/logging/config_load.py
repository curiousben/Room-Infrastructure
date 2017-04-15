import json
import types
def config_load(configPath):
    try:
        with open (configPath) as configFile:
            configData = json.loads(configFile.read())
    except IOError as ioe:
        raise IOError("Config file does not exist. Details:\n\t%s" % str(ioe))
    configKeys = ["app_name","fmt","datefmt","stdout_lvl","file_lvl","logfile"]
    try:
        for key in configData:
            if key not isinstance(key, types.StringType):
                raise TypeError("%s is not a string" % (str(key)))
            if key not in configKeys:
                raise KeyError("%s is not in the logging config section" % (key))
    return config
