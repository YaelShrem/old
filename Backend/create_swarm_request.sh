#!/usr/bin/tcsh
source $HOME/.login >& /dev/null
set application = "$1"
set version = "$2"
set topic = "$3"
set target_env = "$4"
set table_name = "$5"
set jira_intake = `echo "$6" | sed 's/-/_/'`
set main_query = "$7"
set validation_query = "$8"
set rollback_query = "$9"
set user_name = "$10"
set scrum_master = "$11"
set cr_name = "$12"
set line_one = "---------------------------------------------------------------"
set line_two = "---------------------------------------------------------------"
set store_date = `date "+%d-%m-%Y"`
echo "$store_date"
set insert_data = "Insert Script"
set rollback_data = "Delete Script"
set select_data = "Validation Script"

alias newdefinit 'refresh_p4user && setenv TMP_P4CLIENT ${TMPP4USER}_${USER}_${HOST}_${TMP_VERNUM}-Release && setenv TMP_VER v${TMP_VERNUM} && harset_product -p $TMP_PROJ -b $TMP_BB -v default > /dev/null && source ~mb_ccvsp/data/profile.ini >& /dev/null && set_user $TMP_PROJ $TMP_BB  $TMP_P4CLIENT > /dev/null && setenv P4BRANCH ${TMP_VERNUM}-Release && setenv P4CLIENT ${TMP_P4CLIENT} && touch ~/.exrc && \rm -f ~/.exrc && echo "set tags=${MASTER_BUILD_HOME}/ctags/data/VersionTags_${CCVER}.ctags" > ~/.exrc && setenv P4CONFIG .p4config && mkdir -p ~/$TMP_P4CLIENT && cd ~/$TMP_P4CLIENT && p4 workspace -o -S //TMUS/${TMP_VERNUM}-Release $TMP_P4CLIENT | sed "s/LineEnd:^Ilocal/LineEnd:^Iunix/g" | sed "s/nocompress/compress/g" | sed "s/nomodtime/modtime/g" | sed "s#/\.\.\.#/sam/bb/${TMP_BB}/\.\.\.#g" | p4 workspace -i > /dev/null && mv ~/.p4config ~/.p4config_temp && grep -v P4CLIENT ~/.p4config_temp > ~/.p4config && echo "P4CLIENT=$TMP_P4CLIENT" >> ~/.p4config && unlockall && revertOldUnchanged && \rm -rf ~/.p4config_temp > /dev/null && cd - && touch ~/.envBackup.source && \rm -f ~/.envBackup.source && env | sed '\''s/=/ "/'\'' | sed '\''s/$/"/'\'' | sed '\''s/^/setenv /'\'' > ~/.envBackup.source && tmp_p4_matching_ws_display ${TMP_VERNUM} '\''$TMP_PROJ $TMP_BB'\''    '
alias bptcrtp 'setenv TMP_VERNUM {\!*} ; setenv TMP_PROJ vsb${TMP_VERNUM} ; setenv TMP_BB bptcrtp ; pre_definit_check_failed ; pre_definit_check_success && newdefinit; '

bptcrtp "$version"
cds $topic

set change_list = `p4 --field Description="$application Linux - $jira_intake - $table_name BPTCRs #review" change -o | p4 change -i | awk '{print $2}'`
#echo "change_list: <$change_list>"

if ( "$change_list" == "" ) then
   echo "Error: Failed to create changelist."
   exit
endif

set  last_5_change_list_digits = `echo "$change_list" | grep -o '.\{5\}$'`
set main_file = "${last_5_change_list_digits}_${jira_intake}_${table_name}_${application}_${target_env}.sql" 
set validation_file = "${last_5_change_list_digits}_${jira_intake}_${table_name}_${application}_${target_env}_VALIDATION.sql" 
set rollback_file = "${last_5_change_list_digits}_${jira_intake}_${table_name}_${application}_${target_env}_ROLLBACK.sql" 
echo   "$line_one" > $main_file
echo   "--  Requested By           -   "$user_name" " >> $main_file
echo   "--  Reviewer               -   "$scrum_master" " >> $main_file
echo   "--  Area                   -   "$application" " >> $main_file
echo   "--  Date                   -   "$store_date" " >> $main_file
echo   "--  BPTCR                  -   "$change_list" " >> $main_file
echo   "--  CR number              -   "$cr_name" " >> $main_file
echo   "--  Script Type            -   "$insert_data" " >> $main_file
echo   "$line_two" >> $main_file
echo   "$main_query" >> $main_file

echo   "$line_one" > $validation_file
echo   "--  Requested By           -   "$user_name" " >> $validation_file
echo   "--  Reviewer               -   "$scrum_master" " >> $validation_file
echo   "--  Area                   -   "$application" " >> $validation_file
echo   "--  Date                   -   "$store_date" " >> $validation_file
echo   "--  BPTCR                  -   "$change_list" " >> $validation_file
echo   "--  CR number              -   "$cr_name" " >> $validation_file
echo   "--  Script Type            -   "$select_data" " >> $validation_file
echo   "$line_two" >> $validation_file
echo   "$validation_query" >> $validation_file


echo   "$line_one" > $rollback_file
echo   "--  Requested By           -   "$user_name" " >> $rollback_file
echo   "--  Reviewer               -   "$scrum_master" " >> $rollback_file
echo   "--  Area                   -   "$application" " >> $rollback_file
echo   "--  Date                   -   "$store_date" " >> $rollback_file
echo   "--  BPTCR                  -   "$change_list" " >> $rollback_file
echo   "--  CR number              -   "$cr_name" " >> $rollback_file
echo   "--  Script Type            -   "$rollback_data" " >> $rollback_file
echo  "$line_two" >> $rollback_file
echo  "$rollback_query" >> $rollback_file

p4 add -c $change_list $main_file $validation_file $rollback_file 
if ( $status != 0 ) then
   echo "Error: Failed to add files to change list."
   p4 change -d $change_list
   exit
endif

#shelve $change_list 
p4 shelve -f -c $change_list
if ( $status != 0 ) then
   echo "Error: Failed to shelve files."
   p4 revert -c $change_list $main_file $validation_file $rollback_file
   p4 change -d $change_list
   exit
endif

#echo "$main_file"
#echo "$validation_file"
#echo "$rollback_file"
curl -u "DChaudh1:Linux11!" -d "topic=changes/$change_list" -d "body=BPTCR raised on behalf of $user_name" "http://devsam30.unix.gsm1900.org/api/v4/comments" >& /dev/null
echo "change_list: <$change_list,$main_file,$validation_file,$rollback_file>"
#set review_id = `p4 describe $change_list | grep -oE '#review-[0-9]+' | cut -f 2 -d '-'`
#echo "review_id: <$review_id>"

