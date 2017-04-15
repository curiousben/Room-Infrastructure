import logging
import KafkaSpace.logging.config_load


def init_logger(config_path):
    """ Create a logger with some specific parameters.

    Args:
		config (json):
			app_name (str): name of the logger for a specific app.
        	fmt (str): log message format.
        	datefmt (str): datetime format.
        	stdout_lvl (str): logging level for STDOUT.
        	file_lvl (str): logging level for file.
        	logfile (str): absoloue path to log file.

    Returns:
        logging.Logger: the generated logger.
    """
    try:
        config_data = config_load(config_path)
    except IOError as ioe:
        console.log (str(ioe))
        exit() 
    except TypeError as te:
        console.log (str(te))
        exit() 
    except KeyError as ke:
        console.log (str(ke))
        exit() 

    logging_levels = {
        "CRITICAL": logging.CRITICAL,
        "ERROR": logging.ERROR,
        "WARNING": logging.WARNING,
        "INFO": logging.INFO,
        "DEBUG": logging.DEBUG,
        "NOTSET": logging.NOTSET
    }
	
    app_name = config_data['name']
    fmt = config_data['fmt']
    datefmt = config_data['datefmt']
    stdout_lvl = config_data['stdout_lvl']
    logfile = config_data['logfile']

    logging.basicConfig(format=fmt,
                        datefmt=datefmt,
                        level=logging_levels[stdout_lvl])

    logger = logging.getLogger(app_name)
    file_handler = RotatingFileHandler(logfile, maxBytes=1048576,
                                       backupCount=1)
    file_format = logging.Formatter(fmt=fmt, datefmt=datefmt)
    file_handler.setFormatter(file_format)
    file_handler.setLevel(logging_levels[file_lvl])
    logger.addHandler(file_handler)

	return logger
