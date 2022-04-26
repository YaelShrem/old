#!/usr/bin/python3
import re
import os
import sys
import codecs

gdd_path='/vsphome/ccvsp/bb/vstgdd'

all_data = list()
version = sys.argv[1]
v_version = sys.argv[2]
gdd_dir = gdd_path + '/' + v_version

for each_topic in os.listdir(gdd_path + '/' + v_version):
   each_topic_area_list_make = gdd_dir + '/' + each_topic + '/area_list.make'
   if os.path.exists(each_topic_area_list_make):
      print(each_topic_area_list_make)
      try:
         with open(each_topic_area_list_make) as fd:
            for line in fd:
               if re.search(r"^[ \t]*[a-z]+[ \t]*:.+_cre.rql", line) is not None:
                  line_list = re.split(r"[ \t:\r\n]+", line)
                  try:
                     with codecs.open(gdd_dir + '/' + each_topic + '/' + line_list[1], 'r', encoding='utf-8', errors='ignore') as rql_fd:
                        rql_file_content = re.sub(r"[\r\n]", ' ', rql_fd.read())
                        matched_string_in_rql = re.search(r"CREATE[ \t]+(GLOBAL[ \t]+TEMPORARY[ \t]+)?TABLE[ \t]+[a-zA-Z0-9_$#]+[ \t]*\(", rql_file_content, re.IGNORECASE)
                        if matched_string_in_rql is not None:
                           table_name = re.split(r"[ \t\(]+", matched_string_in_rql.group(0))[-2]
                           all_data.append(version + ',' + table_name + ',' + line_list[0] + ',' + line_list[1])
                  except IOError as error:
                     print("Failed to read rql file with ERROR:" + str(error))
      except IOError as error:
         print("Failed to read file with ERROR:" + str(error))

try:
   with open(version + '_all_table_info.csv', 'w') as fd:
       fd.write('\n'.join(all_data)) 
except IOError as error:
   print("Failed to write file with ERROR:" + str(error))

