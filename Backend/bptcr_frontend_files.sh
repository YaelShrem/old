#!/usr/bin/bash

CleanUpAndExitProcess(){
   \rm -f $output_dir/*.csv $output_dir/*.sql
   echo "Exiting..."
   exit
}

fetchCrStatusInfo(){
   if [ -f "$HOME/cr_status_info.json" ]
   then
      mv "$HOME/cr_status_info.json" .
   fi
}

#-------------------------
#  Fetch active versions
#-------------------------
fetchActiveVersions(){
   versions=`ls /tmp/Check_all_proj* | cut -f 2 -d '.' | grep -v V64 | sort -nr | uniq`
   if [ -z "$versions" ]
   then
      echo "No Versions Present."
      CleanUpAndExitProcess
   fi
   versions_string=\"`echo "$versions" |  paste -sd ','`\"
   echo "versions" > versions.csv
   echo $versions_string >> versions.csv 
   $cwd/convert_csv_to_json.py versions.csv versions.json 'Y'
}

fetchBptcrTopics(){
   echo "version,topics" > versions_bptcr_topics.csv
   for each_version in $versions
   do
      split_version=`echo "v$each_version" | sed 's/.\{1\}$/_&/'`
      topics_for_each_version=\"`awk -F'[ \t]*=[ \t]*' '/^[ \t]*topics[ \t]*=[ \t]*/ {print $NF}' $CCBB_bptcrtp/$split_version/bb_profile | tr ' ' ','`\"
      echo "$each_version,$topics_for_each_version" >> versions_bptcr_topics.csv
   done
   $cwd/convert_csv_to_json.py versions_bptcr_topics.csv versions_bptcr_topics.json 'N'
}

#--------------------------------
#  Fetch primary key of a table
#--------------------------------
fetchTableColumns(){
   table_name=${1^^}
   TABLE_COLUMNS=`sqlplus -s ${CONN_STR} <<EOF
   SET HEADING OFF;
   SET FEEDBACK OFF;
   SET ECHO OFF;
   SET PAGESIZE 0;
   SET TERMOUT OFF;
   SET LINESIZE 3500;
   SET ARRAYSIZE 5000;
   SET TERMOUT OFF;
   SET SERVEROUTPUT OFF;
   SET VERIFY OFF;
   SELECT TABLE_NAME || ',' || COLUMN_NAME FROM ALL_TAB_COLUMNS WHERE TABLE_NAME in ($table_name) AND OWNER in ('$ORA_APP_DB_USER','$ORA_REF_DB_USER','$ORA_OPR_DB_USER','$ORA_SEC_DB_USER') GROUP BY TABLE_NAME,COLUMN_ID,COLUMN_NAME;
EOF`
   if [ $? -ne 0 ]
   then
      echo "SQLPLUS Failed to fetch primary key(s) of table."
      echo "$TABLE_COLUMNS" 
      CleanUpAndExitProcess
   fi
   #echo "table_name:<$table_name>"
   #echo "CONN_STR:<$CONN_STR>"
   #echo "TABLE_COLUMNS:<$TABLE_COLUMNS>"
   echo "$TABLE_COLUMNS" >> all_table_columns.csv
}

#----------------------------------------------
#  Fetch all reference tables and its columns
#----------------------------------------------
fetchAllTableColumns(){
   OWNER=$1
   CONN_STR=$2
   TABLE_COLUMNS=`sqlplus -s ${CONN_STR} <<EOF
   SET HEADING OFF;
   SET FEEDBACK OFF;
   SET ECHO OFF;
   SET PAGESIZE 0;
   SET TERMOUT OFF;
   SET LINESIZE 3500;
   SET ARRAYSIZE 5000;
   SET TERMOUT OFF;
   SET SERVEROUTPUT OFF;
   SET VERIFY OFF;
   SELECT TABLE_NAME || ',' || COLUMN_NAME FROM ALL_TAB_COLUMNS WHERE OWNER = '$OWNER' GROUP BY TABLE_NAME,COLUMN_ID,COLUMN_NAME;
EOF`
   if [ $? -ne 0 ]
   then
      echo "SQLPLUS Failed to fetch all tables and its columns."
      echo "$TABLE_COLUMNS"
      CleanUpAndExitProcess 
   fi
   echo "$TABLE_COLUMNS" >> all_table_columns.csv 
}

fetchDBAreaTableMappingForEachVersion(){
  $cwd/create_db_area_table_mapping.py $version $v_version
}

fetchDBAreaTableMapping(){
   for version in $versions
   do
      v_version="v`echo "$version" | sed 's/.\{1\}$/_&/'`"
      echo "Working on: $v_version"
      fetchDBAreaTableMappingForEachVersion &
   done
   wait
}

executeSql(){
   CONN_STR=$1
   sql_file=$2
   result=`exit | sqlplus -s ${CONN_STR} @$sql_file` 
   #echo "result:<$result>"
   if [ $? -ne 0 ]
   then
      echo "SQLPLUS Failed to execute sql commands. ERROR: $result"
      echo "Failed to create $table_name_in_row table."
      CleanUpAndExitProcess
   fi
   if [ ! -z "`echo "$result" | grep -E 'ORA-[0-9]+|SP2-[0-9]+' | grep -v 'SP2-0734\|SP2-0044\|SP2-0103\|ORA-00955'`" ]
   then
      echo "SP2/ORA error received. ERROR: $result"
      echo "Failed to create $table_name_in_row table."
      #CleanUpAndExitProcess
   fi

}

executAndFetchMissingTableColumns(){
   sql_file=$1
   missing_table_csv=$2
   CONN_STR=$3
   if [ -f "$sql_file" ]
   then
      echo "Execute sql for missing tables in $sql_file."
      sed -i '/^[[:space:]]*$/d' $sql_file
      executeSql $CONN_STR $sql_file
      echo "Fetch columns."
      fetchTableColumns `cat "$missing_table_csv"`
   fi
}

fetchMissingTables(){
   echo "In fetchMissingTables"
   $cwd/create_missing_tables.py
   executAndFetchMissingTableColumns 'app.sql' 'missing_app_tables.csv' $APP_CONN_STR
   executAndFetchMissingTableColumns 'ref.sql' 'missing_ref_tables.csv' $REF_CONN_STR
   executAndFetchMissingTableColumns 'oper.sql' 'missing_oper_tables.csv' $OPR_CONN_STR
   executAndFetchMissingTableColumns 'sec.sql' 'missing_sec_tables.csv' $SEC_CONN_STR
   echo "Creating table and column mapping."
   sed -i '/^[[:space:]]*$/d' all_table_columns.csv
   $cwd/create_table_column_mapping.py all_versions_tables_columns.csv all_table_columns.csv
   echo  "Convert csv to json."
   $cwd/convert_csv_to_json.py all_table_columns.csv.csv all_table_columns.json 'N' 
}

fecthUserInfo(){
   $cwd/extract_user_info.py users.json
}


#-----------------
#  Initial Setup
#-----------------
ORA_APP_DB_USER='SSTAPP18'
ORA_APP_DB_PASSWORD='SSTAPP18'
ORA_REF_DB_USER='SSTREF18'
ORA_REF_DB_PASSWORD='SSTREF18'
ORA_OPR_DB_USER='SSTOPR18'
ORA_OPR_DB_PASSWORD='SSTOPR18'
ORA_SEC_DB_USER='SSTSEC_A'
ORA_SEC_DB_PASSWORD='SSTSEC_A'
ORA_DB_INSTANCE='DEVDB001'
APP_CONN_STR="$ORA_APP_DB_USER/$ORA_APP_DB_PASSWORD@$ORA_DB_INSTANCE"
REF_CONN_STR="$ORA_REF_DB_USER/$ORA_REF_DB_PASSWORD@$ORA_DB_INSTANCE"
OPR_CONN_STR="$ORA_OPR_DB_USER/$ORA_OPR_DB_PASSWORD@$ORA_DB_INSTANCE"
SEC_CONN_STR="$ORA_SEC_DB_USER/$ORA_SEC_DB_PASSWORD@$ORA_DB_INSTANCE"
CCBB_bptcrtp='/vsphome/ccvsp/bb/bptcrtp'

cwd='/vstusr1/dev/csm/skaushi13/Dc/SCRIPTS/LB_BPTCR_CHECK'
output_dir=$cwd/BPTCR_BASE_FILES

gdd_path='/vsphome/ccvsp/bb/vstgdd'
ref_topics='PostProd_Ref REFDB_PostPP REFDB_PrePP'
app_topics='APP_ARDB APP_BLDB APP_CustDB APP_SCDB APP_USGDB PostProd_App CleanUpDB'
topics_not_checked='OnOff PlaceHolder SecurityDB'
prod_topics='PostProd_App PostProd_Ref'

\rm -f $output_dir/*

#--------------
#  Processing
#--------------
cd $output_dir
echo "table_name,column_names" > all_table_columns.csv 
echo "versions,table_name,db_area,rql_file,column_names" > all_table_columns.csv.csv
fetchCrStatusInfo
fetchActiveVersions
fetchBptcrTopics
fetchAllTableColumns $ORA_APP_DB_USER $APP_CONN_STR
fetchAllTableColumns $ORA_REF_DB_USER $REF_CONN_STR
fetchAllTableColumns $ORA_OPR_DB_USER $OPR_CONN_STR
fetchAllTableColumns $ORA_SEC_DB_USER $SEC_CONN_STR
fetchDBAreaTableMapping
fetchMissingTables
fecthUserInfo
cd -

CleanUpAndExitProcess

