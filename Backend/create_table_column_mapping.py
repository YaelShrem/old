#!/usr/bin/python3.6

import sys
import csv
from collections import defaultdict

all_info = sys.argv[1]
file_name = sys.argv[2]
data = defaultdict(list) 
data_list = list()

try:
   with open(file_name) as fd:
      reader = csv.reader(fd)
      data_list = list(reader)
except IOError as error:
   print("Fail to read file with ERROR:" + str(error))

for row in data_list: 
   if not data[row[0]]:
      data[row[0]].append(row[1])
   else:
      data[row[0]].append(',' + row[1])

try:
   with open(all_info) as fd:
      reader = csv.reader(fd, quotechar='"')
      data_list = list(reader)
except IOError as error:
   print("Fail to read all info file with ERROR:" + str(error))

for each_row in data_list:
   if each_row[1]:
      each_row[0] = '"' + each_row[0] + '"'
      each_row.append('"' + ''.join(data[each_row[1]]) + '"\n')

#c = 0
#for row in data_list:
#   if c > 50:
#      break
#   c = c + 1
#   print(row)

try:
   with open(file_name + '.csv', 'a') as fd:
      for each_row in data_list:
         if each_row[1]:
            fd.write(','.join(each_row))
except IOError as error:
   print("Fail to write file with ERROR:" + str(error))

