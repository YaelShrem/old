#!/usr/bin/python3
import os
import sys
import json

#  --BPTCRSQLFile: /vsphome/mb_ccvsp/bb/bptcrtp/v21040_0/REFDB_PrePP/src/A9860_ACTIVITY_REASON_TEXT.sql
#  /vsphome/ccvsp/proj/vsb210100/bptcrtp/v210100_REFDB_PostPP_accumulated_production_bptcrs.sql
#  /vsphome/ccvsp/proj/vsb210100/bptcrtp/v210100_REFDB_PostPP_accumulated_testing_bptcrs.sql
#  /vsphome/ccvsp/proj/vsb210100/bptcrtp/v210100_REFDB_PostPP_accumulated_ST_bptcrs.sql
#{"jiraIntakeID":"BSWMDBS2-41789","scrumMasterID":"Amit Paropkari","crNameID":"PR212735-Streaming Conversions - Support New BPT Requests for Country Codes and SIC Codes","userNameID":"Dhruv Chaudhary (DChaudh1)","versionID":"210530","codeDropID":"CD#2","topicID":"REFDB_PrePP","targetEnvironmentID":"STOnly","tableNameID":"TOGGLE_ON_OFF","applicationID":"CSM","queryTypeID":"Insert","status":"New","changeList":"717926","sqlFiles":"17926_BSWMDBS2_41789_TOGGLE_ON_OFF_CSM_STOnly.sql,17926_BSWMDBS2_41789_TOGGLE_ON_OFF_CSM_STOnly_VALIDATION.sql,17926_BSWMDBS2_41789_TOGGLE_ON_OFF_CSM_STOnly_ROLLBACK.sql"}

def findSqlFileInAccumulatedSqlFile(accumulated_sql_file, sql_file):
   if os.path.exists(accumulated_sql_file):
      with open(accumulated_sql_file) as fd:
         for line in fd.readlines():
             if sql_file in line:
                return True
   return False

def checkAccumulatedBptcrs():
   print(bptcrs_file)
   with open(bptcrs_file) as fd:
      bptcr_dict = json.load(fd)
      for bptcr in bptcr_dict:
         if bptcr['topicID'] not in topicsNotChecked:
            accumulated_script_base_path = accumulated_script_root_path + bptcr['versionID'] + '/' + bb + '/v' + bptcr['versionID'] + '_' + bptcr['topicID'] + '_'
            accumulated_production_bptcrs_script = accumulated_script_base_path + accumulated_prod_sql
            accumulated_testing_bptcrs_script = accumulated_script_base_path + accumulated_testing_sql 
            accumulated_stonly_bptcrs_script = accumulated_script_base_path + accumulated_stonly_sql
            #print(accumulated_production_bptcrs_script)
            #print(accumulated_testing_bptcrs_script)
            #print(accumulated_stonly_bptcrs_script)
            bptcr_sql_file_pattern = bptcr_file_base_pattern + bptcr['versionID'][:-1] + '_' + bptcr['versionID'][-1] + '/' + bptcr['topicID'] + '/src/'
            for sql_file in bptcr['sqlFiles'].split(','):
               full_sql_file_path = bptcr_sql_file_pattern + sql_file
               #print(full_sql_file_path)
               if bptcr['targetEnvironmentID'] == 'ProductionOnly': 
                  sql_file_found = findSqlFileInAccumulatedSqlFile(accumulated_production_bptcrs_script, full_sql_file_path)
                  if not sql_file_found:
                     print(bptcr['changeList'], sql_file)
               elif bptcr['targetEnvironmentID'] == 'TestingOnly':
                  sql_file_found = findSqlFileInAccumulatedSqlFile(accumulated_testing_bptcrs_script, full_sql_file_path)
                  if not sql_file_found:
                     print(bptcr['changeList'], sql_file)
               elif bptcr['targetEnvironmentID'] == 'STOnly':
                  sql_file_found = findSqlFileInAccumulatedSqlFile(accumulated_stonly_bptcrs_script, full_sql_file_path)
                  if not sql_file_found:
                     print(bptcr['changeList'], sql_file)
               elif bptcr['targetEnvironmentID'] == 'Common':
                  sql_file_found = findSqlFileInAccumulatedSqlFile(accumulated_production_bptcrs_script, full_sql_file_path)
                  if not sql_file_found:
                     print(bptcr['changeList'], sql_file)
                  sql_file_found = findSqlFileInAccumulatedSqlFile(accumulated_testing_bptcrs_script, full_sql_file_path)
                  if not sql_file_found:
                     print(bptcr['changeList'], sql_file)
               #else:
               #   print('Check for PETOnly')
      
            #if os.path.exists(each_topic_area_list_make):

#--------------------------------------------------
#  Check number of arguments passed to the script
#--------------------------------------------------
if len(sys.argv) != 2:
   print('Incorrect arguments passed.\nUsage:', sys.argv[0], '<BPTCRs file>')
   sys.exit(1)

bb = 'bptcrtp'
bptcr_file_base_pattern = '--BPTCRSQLFile: /vsphome/mb_ccvsp/bb/bptcrtp/v'
root_dir = '/vstusr1/dev/csm/skaushi13/Dc/SCRIPTS/LB_BPTCR_CHECK/'
accumulated_script_root_path = '/vsphome/mb_ccvsp/proj/vsb'
topicsNotChecked = {'OnOff', 'PlaceHolder', 'SecurityDB'}
accumulated_prod_sql = 'accumulated_production_bptcrs.sql'
accumulated_testing_sql = 'accumulated_testing_bptcrs.sql'
accumulated_stonly_sql = 'accumulated_ST_bptcrs.sql'
bptcrs_file = root_dir + sys.argv[1]
checkAccumulatedBptcrs()
