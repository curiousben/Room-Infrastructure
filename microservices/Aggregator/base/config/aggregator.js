{
  "cache": {
    "setup": "internal",
    "data": {
      "RecordLabel": ["Path","to","data","in","JSONObj"], 
      "SubRecordLabel": ["Path","to","data","in","JSONObj"],
    },
    "storage": {
      "strategy": "perEvent",
      "policy": {
        "uniqueData": true,
        "eventLimit": 10,
      },
      "byteSizeWatermark": 1000000
    },
    "flushStrategy": "single"
  }
}

