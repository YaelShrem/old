#!/usr/bin/python3.6

import sys
import json
import requests

def fetchUserInfo():
   json_data = requests.get('http://devsam30.unix.gsm1900.org/users', auth = ('DChaudh1', 'Linux11!'))
   with open(jsonFile, 'w') as fd:
      fd.write(json.dumps(json_data.json(), indent=None, separators=(',', ':')));

#--------------------------------------------------
#  Check number of arguments passed to the script
#--------------------------------------------------
if len(sys.argv) != 2:
   print("Incorrect arguments passed.\nUsage:", sys.argv[0], "<JSON file>") 
   sys.exit(1)

jsonFile = sys.argv[1]
fetchUserInfo()

