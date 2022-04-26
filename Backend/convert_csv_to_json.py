#!/usr/bin/python3.6

import json
import csv
import sys

csv.field_size_limit(sys.maxsize)
def convertCsvToJson():
   arr = []
   with open(csvFileName)as csvFile:
      csvReader = csv.DictReader(csvFile)
      for csvRow in csvReader:
         arr.append(csvRow)
   with open(jsonFileName, "w") as jsonFile:
      if multipleRowsIndicator == 'Y':
         jsonFile.write(json.dumps(arr[0], indent=None, separators=(',', ':')))
      else: 
         jsonFile.write(json.dumps(arr, indent=None, separators=(',', ':')))

#--------------------------------------------------
#  Check number of arguments passed to the script
#--------------------------------------------------
if len(sys.argv) != 4:
   print("Incorrect arguments passed.\nUsage:", sys.argv[0], "<CSV file> <JSON file> <Multiple rows indicator>")
   sys.exit(1)

csvFileName = sys.argv[1]
jsonFileName = sys.argv[2]
multipleRowsIndicator = sys.argv[3]
#print(csvFileName)
#print(jsonFileName)
#print(multipleRowsIndicator)
convertCsvToJson()

