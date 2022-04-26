#!/usr/bin/python3
import re
import glob
from collections import defaultdict

all_table_columns_set = set()
all_version_table_dict = defaultdict(list)
all_versions_tables_dict = defaultdict(list)
version_files = glob.glob('*_all_table_info.csv')
proj = '/vsphome/ccvsp/proj'

def createMissingTableQueries(file_name, list_name, list_type):
   if list_name:
      delim = ''
      if list_type == 'T':
         delim = ','
      try:
         with open(file_name, 'w') as fd:
            fd.write(delim.join(list_name))
      except IOError as error:
         print("Failed to write oper file with ERROR:" + str(error))

try:
   with open('all_table_columns.csv') as fd:
      for line in fd:
         all_table_columns_set.add(line.split(',')[0])
except IOError as error:
   print("Failed to read file with ERROR:" + str(error))

for each_file in version_files:
   try:
      with open(each_file) as fd:
         for line in fd:
            split_line = line.split(',')
            all_version_table_dict[split_line[1]].append(split_line)
            if all_versions_tables_dict[split_line[1]]:
               all_versions_tables_dict[split_line[1]][0] = all_versions_tables_dict[split_line[1]][0] + ',' + split_line[0]
            else:
               all_versions_tables_dict[split_line[1]].extend(split_line)
   except IOError as error:
      print("Failed to read file with ERROR:" + str(error))

missing_app_tables_queries = list()
missing_ref_tables_queries = list()
missing_sec_tables_queries = list()
missing_oper_tables_queries = list()
missing_app_tables = list()
missing_ref_tables = list()
missing_sec_tables = list()
missing_oper_tables = list()
for table_name in all_version_table_dict:
   if table_name not in all_table_columns_set:
      versions = list()
      for row in all_version_table_dict[table_name]:
         versions.append(int(row[0]))
      versions = sorted(versions)
      if versions[-1] == 219999 and len(versions) > 1:
         version = versions[-2]
      else:
         version = versions[-1]
      sql_file = proj + '/' + 'vsb' + str(version) + '/vstgdd/' + all_version_table_dict[table_name][0][-1].rstrip().split('.')[0] + '.sql'
      db_area = all_version_table_dict[table_name][0][2]
      try:
         with open(sql_file) as fd:
            sql_file_content = re.sub(r'&[a-zA-Z0-9_#$]+', ' ', fd.read()) + '\n'
      except IOError as error:
         print("Failed to read file with ERROR:" + str(error))

      if db_area == 'oper':
        #try:
        #   with open('oper.sql', 'a') as fd:
        #      fd.write(sql_file_content)
        #except IOError as error:
        #   print("Failed to write oper file with ERROR:" + str(error))
        missing_oper_tables_queries.append(sql_file_content) 
        missing_oper_tables.append("'" + table_name + "'")
      elif re.search(r'^ref.*', db_area):
        #try:
        #   with open('ref.sql', 'a') as fd:
        #      fd.write(sql_file_content)
        #except IOError as error:
        #   print("Failed to write ref file with ERROR:" + str(error))
        missing_ref_tables_queries.append(sql_file_content)
        missing_ref_tables.append("'" + table_name + "'")
      elif re.search(r'^sec.*', db_area):
        #try:
        #   with open('sec.sql', 'a') as fd:
        #      fd.write(sql_file_content)
        #except IOError as error:
        #   print("Failed to write sec file with ERROR:" + str(error))
        missing_sec_tables_queries.append(sql_file_content)
        missing_sec_tables.append("'" + table_name + "'")
      else:
        #try:
        #   with open('app.sql', 'a') as fd:
        #      fd.write(sql_file_content)
        #except IOError as error:
        #   print("Failed to write app file with ERROR:" + str(error))
        missing_app_tables_queries.append(sql_file_content)
        missing_app_tables.append("'" + table_name + "'")

createMissingTableQueries('oper.sql', missing_oper_tables_queries, 'Q')
createMissingTableQueries('ref.sql', missing_ref_tables_queries, 'Q')
createMissingTableQueries('sec.sql', missing_sec_tables_queries, 'Q')
createMissingTableQueries('app.sql', missing_app_tables_queries, 'Q')
createMissingTableQueries('missing_oper_tables.csv', missing_oper_tables, 'T')
createMissingTableQueries('missing_ref_tables.csv', missing_ref_tables, 'T')
createMissingTableQueries('missing_sec_tables.csv', missing_sec_tables, 'T')
createMissingTableQueries('missing_app_tables.csv', missing_app_tables, 'T')

#try:
#   with open('missing_app_tables.csv', 'w') as fd:
#      fd.write(','.join(missing_app_tables))
#except IOError as error:
#   print("Failed to write app file with ERROR:" + str(error))
#try:
#   with open('missing_ref_tables.csv', 'w') as fd:
#      fd.write(','.join(missing_ref_tables))
#except IOError as error:
#   print("Failed to write ref file with ERROR:" + str(error))
#try:
#   with open('missing_sec_tables.csv', 'w') as fd:
#      fd.write(','.join(missing_sec_tables))
#except IOError as error:
#   print("Failed to write sec file with ERROR:" + str(error))
#try:
#   with open('missing_oper_tables.csv', 'w') as fd:
#      fd.write(','.join(missing_oper_tables))
#except IOError as error:
#   print("Failed to write oper file with ERROR:" + str(error))

try:
   with open('all_versions_tables_columns.csv', 'w') as fd:
      data_list = list()
      for table_name in all_versions_tables_dict:
         data_list.append('"' + all_versions_tables_dict[table_name][0] + '",' + ','.join(all_versions_tables_dict[table_name][1:]))
      fd.write(''.join(data_list))
except IOError as error:
   print("Failed to write oper file with ERROR:" + str(error))
   
