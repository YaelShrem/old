#!/usr/bin/bash

export PATH="/opt/jdk1.8.0_191_32bit/bin:/oravl01/oracle/11.2.0.4_32/bin:/opt/tuxedo12.1.3.0.0/bin:/opt/intel/compilers_and_libraries/linux/bin/ia32:/opt/intel/compilers_and_libraries/linux/bin:/vspchome/mb_ccvsp/bin:/opt/shareplex/bin:/vstusr1/dev/csm/mmadhur1/proj/vsb210600/bin:/vsphome/ccvsp/proj/vsb210600/bin:/opt/jdk1.8.0_191_32bit/bin:/oravl01/oracle/11.2.0.4_32/bin:/opt/tuxedo12.1.3.0.0/bin:/opt/intel/compilers_and_libraries/linux/bin/ia32:/opt/intel/compilers_and_libraries/linux/bin:/vspchome/mb_ccvsp/bin:/opt/shareplex/bin:/vstusr1/dev/csm/ckoyari/.local/bin:/vstusr1/dev/csm/bpatil2/XBuild:/usr/openv/pdde/pdopensource/bin:/vstusr1/dev/csm/ckoyari/script/openssl/openssl-1.0.1h/apps:/opt/java8/bin:/vstusr1/dev/csm/ckoyari/.encctools/bin:/vsphome/mb_ccvsp/bin/tip_tool:/vstusr1/dev/csm/ckoyari/script/tools/node-v14.15.4-linux-x64/bin:/vsphome/mb_ccvsp/ccmngr/tools/build/bin:/usr/local/bin:/opt/ansic/bin:/usr/bin:/usr/ccs/bin:/bin:/vsphome/mb_ccvsp/bin:/amdocs/Perforce:/usr/sbin:/opt/perf/bin:/etc:.:/opt/jdk1.8.0_191/bin:/oravl01/oracle/11.2.0.4_64/bin:/opt/tuxedo12.1.3.0.0_64/bin:/opt/intel/compilers_and_libraries/linux/bin/intel64:/oravl01/oracle/11.2.0/bin:/opt/dmexpress9.4/bin:/opt/ossasn1/8.4.0/bin:/opt/ossasn1/linux-x86-32/10.7.0/bin:/opt/dmexpress8.5/bin:/usr/local/ccmngr/bin:/usr/local/ccmngr/infcell/scripts:/opt/CA/harvest7/config/tmo/bin:CCMNGRHOME/bin:/usr/contrib/bin:/usr/contrib/bin/X11:/usr/vue/bin:/usr/bin/X11:/opt/langtools/bin:/opt/langtools/dde/softbench/bin:/opt/imake/bin:/opt/foc694:/vsphome/mb_ccvsp/ccmngr/tools/build/bin_xref:/vsphome/ccvsp/INSURE_COB_CONFIG/cob_config:/vsphome/ccvsp/procob_10g:/vsphome/ccvsp/test_CC/bin:/vsphome/ccvsp/xref:/opt/insure7.0/bin.hp11:/usr/bin:/usr/local/bin:/vsphome/mb_ccvsp/ccmngr/tools/build/bin:/opt/CA/harvest7/config/tmo/bin:CCMNGRHOME/bin:/opt/ansic/bin:/usr/contrib/bin:/usr/contrib/bin/X11:/usr/vue/bin:/usr/bin/X11:/usr/sbin:/opt/langtools/bin:/usr/ccs/bin:/opt/perf/bin:/etc:/usr/local/ccmngr/bin:/opt/langtools/dde/softbench/bin:/opt/imake/bin:/bin:/opt/foc694:/opt/shareplex/bin:/opt/dmexpress8.5/bin:/vsphome/mb_ccvsp/ccmngr/tools/build/bin_xref:/usr/local/ccmngr/infcell/scripts:/vsphome/ccvsp/INSURE_COB_CONFIG/cob_config:/vsphome/ccvsp/procob_10g:/vsphome/ccvsp/test_CC/bin:/vsphome/ccvsp/xref:/vsphome/ccvsp/proj/vsb210600/bin:/opt/insure7.0/bin.hp11"
export ORACLE_HOME='/oravl01/oracle/11.2.0.4_32'

date_time=`date '+%Y%m%d_%H%M%S'`

{
if [ -f "$HOME/cr_status_info.json" ]
then
   if [ "`diff $HOME/cr_status_info.json $HOME/Dc/SCRIPTS/LB_BPTCR_CHECK/BPTCR_BASE_FILES/cr_status_info.json`" != "" ]
   then
      $HOME/DC/SCRIPTS/LB_BPTCR_CHECK/bptcr_frontend_files.sh
   fi
fi
} &> $HOME/DC/SCRIPTS/LB_BPTCR_CHECK/LOGS/bptcr_frontend_files_${date_time}.log
