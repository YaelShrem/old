#!/usr/bin/bash

export ORACLE_HOME="/oravl01/oracle/11.2.0.4_32"
export PATH="$PATH:$ORACLE_HOME:$ORACLE_HOME/bin"

ora_db_user='SSTREF20'
ora_db_password='SSTREF20'
ora_db_instance='DEVDB001'
conn_str="$ora_db_user/$ora_db_password@$ora_db_instance"

sql_query="$1"

query_result=`/oravl01/oracle/11.2.0.4_32/bin/sqlplus -s ${conn_str} <<EOF
SET HEADING OFF;
SET FEEDBACK OFF;
SET ECHO OFF;
SET PAGESIZE 0;
SET TERMOUT OFF;
SET LINESIZE 2000;
SET ARRAYSIZE 5000;
SET SERVEROUTPUT OFF;
SET VERIFY OFF;
$sql_query
ROLLBACK;
EOF`

if [ $? -ne 0 ]
then
   echo "$query_result"
   exit -1
fi

if [[ "$query_result" =~ SP2-[0-9]+ || "$query_result" =~ ORA-[0-9]+ ]]
then
   echo "$query_result"
   exit 0 
fi

exit 0

