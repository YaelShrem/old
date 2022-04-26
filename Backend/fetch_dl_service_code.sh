#!/usr/bin/tcsh
source $HOME/.login >& /dev/null
set application = "$1"
set version = "$2"
set topic = "$3"
set table_name = "$4"
set jira_intake = `echo "$5" | sed 's/-/_/'`

alias newdefinit 'refresh_p4user && setenv TMP_P4CLIENT ${TMPP4USER}_${USER}_${HOST}_${TMP_VERNUM}-Release && setenv TMP_VER v${TMP_VERNUM} && harset_product -p $TMP_PROJ -b $TMP_BB -v default > /dev/null && source ~mb_ccvsp/data/profile.ini >& /dev/null && set_user $TMP_PROJ $TMP_BB  $TMP_P4CLIENT > /dev/null && setenv P4BRANCH ${TMP_VERNUM}-Release && setenv P4CLIENT ${TMP_P4CLIENT} && touch ~/.exrc && \rm -f ~/.exrc && echo "set tags=${MASTER_BUILD_HOME}/ctags/data/VersionTags_${CCVER}.ctags" > ~/.exrc && setenv P4CONFIG .p4config && mkdir -p ~/$TMP_P4CLIENT && cd ~/$TMP_P4CLIENT && p4 workspace -o -S //TMUS/${TMP_VERNUM}-Release $TMP_P4CLIENT | sed "s/LineEnd:^Ilocal/LineEnd:^Iunix/g" | sed "s/nocompress/compress/g" | sed "s/nomodtime/modtime/g" | sed "s#/\.\.\.#/sam/bb/${TMP_BB}/\.\.\.#g" | p4 workspace -i > /dev/null && mv ~/.p4config ~/.p4config_temp && grep -v P4CLIENT ~/.p4config_temp > ~/.p4config && echo "P4CLIENT=$TMP_P4CLIENT" >> ~/.p4config && unlockall && revertOldUnchanged && \rm -rf ~/.p4config_temp > /dev/null && cd - && touch ~/.envBackup.source && \rm -f ~/.envBackup.source && env | sed '\''s/=/ "/'\'' | sed '\''s/$/"/'\'' | sed '\''s/^/setenv /'\'' > ~/.envBackup.source && tmp_p4_matching_ws_display ${TMP_VERNUM} '\''$TMP_PROJ $TMP_BB'\''    '
alias bptcrtp 'setenv TMP_VERNUM {\!*} ; setenv TMP_PROJ vsb${TMP_VERNUM} ; setenv TMP_BB bptcrtp ; pre_definit_check_failed ; pre_definit_check_success && newdefinit; '

bptcrtp "$version"
cds $topic

set change_list = `p4 --field Description="$application Linux - $jira_intake - $table_name BPTCRs #review" change -o | p4 change -i | awk '{print $2}'`

if ( "$change_list" == "" ) then
   echo "Error: Failed to create changelist."
   exit
endif

echo "change_list: <$change_list>"

