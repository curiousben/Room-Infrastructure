#!/usr/bin/env python
from bluepy.btle import Scanner, DefaultDelegate
import time
import json
import zmq
from operator import itemgetter

class ScanDelegate(DefaultDelegate):
    """This is the BLE scanner Class that gathers all BLE devices"""
    def __init__(self):
        DefaultDelegate.__init__(self)

    def handleDiscovery(self, scanEntry, isNewDev, isNewData):
        """Handles the discovery of any BLE device currently not in use"""
        if isNewDev:
            # print "new device", scanEntry.addr
            pass
        elif isNewData:
            # print "new data from", scanEntry.addr
            pass

class Listener(object):
    """This class controls intializes the BLE listner"""
    def __init__(self):
    	self.scan_interval = 0.5
        self.scan_program = Scanner()

    def get_devs(self, scans):
        ''' Recieves ALL BLE devices in detection range
        TODO: Error Handling '''
        dev_detected = []
        for _ in range(0, scans):
            scanner = self.scan_program.withDelegate(ScanDelegate())
            devices = scanner.scan(self.scan_interval)
            dev_detected.append(devices)
        return dev_detected

    def get_scan_interval(self):
        ''' Gets scan interval'''
        return self.scan_interval

    def set_scan_interval(self, new_interval):
        ''' Sets scan interval'''
        self.scan_interval = new_interval

class ZeroMQ(object):
    """This class controls intializes the ZeroMQ producer"""
    def __init__(self, config_file_path):
        self.z_ctx = zmq.Context.instance()
        self.zmq_config = self._config_load(config_file_path)
        self._publisher_init()

    @staticmethod
    def _config_load(config_file_path):
        ''' Gets the config file with known ble's uuids
        TODO: Error Handling '''
        device_list_file = open(config_file_path)
        registered_bles = json.load(device_list_file)
        device_list_file.close()
        return registered_bles["ZeroMQ_Producer"]

    def _publisher_init(self):
        publisher = self.z_ctx.socket(zmq.PUB)
        publisher.sndhwm = 1100000
        publisher.bind('{scm}://{broker}:{port}'.format(
        				scm=self.zmq_config["scheme"],
        				broker=self.zmq_config["broker"],
        				port=self.zmq_config["port"]))
        self.publisher = publisher

    def send(self, topic, payload):
        ''' This funtion sends a string using the intialized publisher'''
        self.publisher.send('{top} {pay}'.format(
        				top=topic,
        				pay=payload))

class PuzzleRoomDetector(object):
    """ This class handles the actual BLE detecting"""
    def __init__(self, config):
        self.ble_listener = Listener()
        self.zmq_producer = ZeroMQ(config)

    def detection(self):
        ''' This function sends the whole scan payload to the scan analyzier '''
        while True:
            group_scan = self.ble_listener.get_devs(5)
            payload = json.loads(group_scan)
            self.zmq_producer.send("BLESwitch1", payload)

if __name__ == "__main__":
    BLEPROGRAM = PuzzleRoomDetector("/opt/puzzle/config/Puzzle_Room.config")
