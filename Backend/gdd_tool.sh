#!/bin/ksh
#-------------------------------------------------------------------------------------------
# GDD Tool
# Created By : Suhasini Ramakrishnan
# Supervisor : Sujit Kumar Samantaray
# Date       : 26-June-14
#-------------------------------------------------------------------------------------------
clear

echo "Enter Topic : \c"
read TOPIC

echo "TOPIC : $TOPIC"

echo "Enter Version :\c"
read VERSION

echo "VERSION : $VERSION"

AREA_LIST=area_list.make

if [ -f "$AREA_LIST" ]
then
  echo "area_list.make file found"  

else

  echo "area_list.make file not found....Copying from CC to local"

  if [[ $VERSION -eq 1400 ]]
  then
    cp /aiohome/aio/cc/mb_ccaio/ws_aio_1400-Dev_ilhp129/ENS/bb/mtrgdd/${TOPIC}/area_list.make .
  else
    cp /aiohome/aio/cc/mb_ccaio/ws_aio_${VERSION}-Release_ilhp129/ENS/bb/mtrgdd/${TOPIC}/area_list.make .
  fi
  chmod 777 area_list.make  
  echo "Copied."

fi


echo "\n Please enter TABLE_NAME in CAPS: \c"
read TABLE_NAME

echo "\nTABLE_NAME: $TABLE_NAME"

typeset -l FILE_NAME
FILE_NAME=$TABLE_NAME
echo "FILE_NAME : $FILE_NAME"

echo "Please enter ABBREVIATION in CAPS : \c"
read ABBREVIATION

echo "ABBREVIATION: $ABBREVIATION"

typeset -l abbreviation
abbreviation=$ABBREVIATION
echo "abbreviation : $abbreviation"

while [[ $INPUT != 0 ]]; do 
echo "\n"
echo "\nPLEASE CHOOSE CORRECT OPTION FROM BELOW LIST:"
echo "----------------------------------------------\n"

echo "        1. Please enter 1 to create a cre RQL and DDL."
echo "        2. Please enter 2 to create a pk RQL and DDL."
echo "        3. Please enter 3 to create a DMF, DMV and DDL."
echo "        4. Please enter 4 to create only DMV and DDL."
echo "        5. Please enter 5 to create only DDL."
echo "        6. Please enter 6 to create Index files."
echo "        7. Please enter 7 to create FK RQL."
echo "        0. Quit."

echo "\nPlease make any valid choice from above options: \c"
read INPUT

typeset loop=0
while [[ $loop != 1 ]]; do
case $INPUT in
     +([0-7]) ) loop=1
     break
     ;;
     * ) echo "\nInvalid choice. Please select again: \c"
     read INPUT
     ;;
    esac
done

if [[ $INPUT -eq 0 ]]
then
   echo "#---------------------------------------------------" >> area_list.make
  
   exit -1
fi

echo "llalalala"

echo "INPUT: $INPUT"

#--------------------------------------------------------------------------------------------------------------

if [[ $INPUT -eq 1 ]]
then

  RQL_NAME=${FILE_NAME}_cre.rql

  echo "RQL_NAME: $RQL_NAME"

  echo "--ABBREVIATION = $ABBREVIATION" >> $RQL_NAME


  echo "CREATE TABLE $TABLE_NAME (" >> $RQL_NAME
  echo "CREATE TABLE ${TABLE_NAME} (" >> ${FILE_NAME}_cre_rql.csv

  echo "\n Please enter NO_OF_COLUMNS. Also, Please count the Control fields as one column : \c"
  read NO_OF_COLUMNS

  echo "\nNO_OF_COLUMNS: $NO_OF_COLUMNS"

  while [ $NO_OF_COLUMNS -gt 0 ]
  do
    echo "NO_OF_COLUMNS remaining : $NO_OF_COLUMNS"

    echo "Enter Name of COLUMN in CAPS [Enter CTRL_FLD to add the control fields in the column list] : \c"
    read COLUMN_NAME

    echo "COLUMN_NAME : $COLUMN_NAME"

    if [ $COLUMN_NAME = "CTRL_FLD" ]
    then
      if [[ $NO_OF_COLUMNS -gt 1 ]]
      then
        echo "        COPY \"control_fld.rql\"," >> $RQL_NAME
        cat "/mbaioproj/aio/ccaio/proj/mtb${VERSION}V32/mtrgdd/control_fld.sql" >> ${FILE_NAME}_cre_rql.csv
        NO_OF_COLUMNS=`expr $NO_OF_COLUMNS - 1`
        continue
      else
        echo "        COPY \"control_fld.rql\")" >> $RQL_NAME
        cat "/mbaioproj/aio/ccaio/proj/mtb${VERSION}V32/mtrgdd/control_fld.sql" >> ${FILE_NAME}_cre_rql.csv
        printf "        );" >> ${FILE_NAME}_cre_rql.csv
        NO_OF_COLUMNS=`expr $NO_OF_COLUMNS - 1`
        continue
      fi
    fi


    echo "Enter the domain type: \c"
    read DOM_TYPE
    echo "DOM_TYPE : $DOM_TYPE"

    echo "Enter 1  if the CONSTRAINT is NOT_NULL: \c"
    read CONSTRAINT
    echo "CONSTRAINT : $CONSTRAINT"

    if [[ $NO_OF_COLUMNS -gt 1 ]]
    then
      if [[ $CONSTRAINT -eq 1 ]]
      then
        echo "Inside if"
        echo "        $COLUMN_NAME\tCOPY \"$DOM_TYPE\"" >> $RQL_NAME
        echo "                CONSTRAINT ${ABBREVIATION}_${COLUMN_NAME}_NN\tNOT NULL," >> $RQL_NAME

        printf "        $COLUMN_NAME       " >> ${FILE_NAME}_cre_rql.csv
        cat  "/mbaioproj/aio/ccaio/proj/mtb${VERSION}V32/mtrgdd/${DOM_TYPE}" >> ${FILE_NAME}_cre_rql.csv
        printf "    NOT NULL,\n" >> ${FILE_NAME}_cre_rql.csv 
 
      else
        echo "Inside else"
        echo "        ${COLUMN_NAME}\tCOPY \"${DOM_TYPE}\"," >> $RQL_NAME

        printf "        $COLUMN_NAME       " >> ${FILE_NAME}_cre_rql.csv
        cat "/mbaioproj/aio/ccaio/proj/mtb${VERSION}V32/mtrgdd/${DOM_TYPE}" >> ${FILE_NAME}_cre_rql.csv 
        printf ",\n" >> ${FILE_NAME}_cre_rql.csv
 
      fi 
    else
      if [[ $CONSTRAINT -eq 1 ]]
      then
        echo "Inside if"
        echo "        ${COLUMN_NAME}\tCOPY \"${DOM_TYPE}\"" >> $RQL_NAME
        echo "                CONSTRAINT ${ABBREVIATION}_${COLUMN_NAME}_NN\tNOT NULL)" >> $RQL_NAME

        printf "        $COLUMN_NAME       " >> ${FILE_NAME}_cre_rql.csv
        cat  "/mbaioproj/aio/ccaio/proj/mtb${VERSION}V32/mtrgdd/${DOM_TYPE}" >> ${FILE_NAME}_cre_rql.csv
        printf "    NOT NULL);\n" >> ${FILE_NAME}_cre_rql.csv

      else
        echo "Inside else"
        echo "        ${COLUMN_NAME}\tCOPY \"${DOM_TYPE}\")" >> $RQL_NAME

        printf "        $COLUMN_NAME       " >> ${FILE_NAME}_cre_rql.csv
        cat "/mbaioproj/aio/ccaio/proj/mtb${VERSION}V32/mtrgdd/${DOM_TYPE}" >> ${FILE_NAME}_cre_rql.csv
        printf ");\n" >> ${FILE_NAME}_cre_rql.csv

      fi
    fi

    NO_OF_COLUMNS=`expr $NO_OF_COLUMNS - 1`

  done

  echo "&${ABBREVIATION}_TB_PCT" >> $RQL_NAME
  echo "&${ABBREVIATION}_TB_TBS" >> $RQL_NAME
  echo "&${ABBREVIATION}_TB_TRN" >> $RQL_NAME
  echo "&${ABBREVIATION}_TB_STG;" >> $RQL_NAME

  echo "RQL generated"

  echo "Enter 1 to create the DDL File without a PK_RQL file."
  read PK

  DDL_NAME=t_${abbreviation}.ddl

  if [[ $PK -eq 1 ]]
  then

    echo "Generating DDL...."
    echo "COPY \"${RQL_NAME}\"" >> $DDL_NAME

  fi

  echo "Making entry in area_list.make file. "

  echo "Enter area_name [appmst/refst/...] :\c"
  read AREA_NAME

  echo "AREA_NAME : $AREA_NAME"

  echo "$AREA_NAME :         $RQL_NAME" >> area_list.make

fi

#-------------------------------------------------------------------------------------------------------------------------

if [[ $INPUT -eq 2 ]]
then

  PK_RQL_NAME=${FILE_NAME}_cre_pk.rql

  echo "PK_RQL_NAME = $PK_RQL_NAME"



  echo "ALTER TABLE $TABLE_NAME" >> $PK_RQL_NAME
  echo "        ADD CONSTRAINT ${TABLE_NAME}_PK" >> $PK_RQL_NAME
  echo "        PRIMARY KEY (" >> $PK_RQL_NAME

  echo "ALTER TABLE $TABLE_NAME" >> ${FILE_NAME}_pk_rql.csv
  echo "        ADD CONSTRAINT ${TABLE_NAME}_PK" >> ${FILE_NAME}_pk_rql.csv
  echo "        PRIMARY KEY (" >> ${FILE_NAME}_pk_rql.csv

  echo "Enter number of Primary Key Colums\n"
  read NO_OF_PK

  while [ $NO_OF_PK -gt 0 ]
  do
    echo "NO_OF_PK remaining : $NO_OF_PK"

    echo "Enter Name of COLUMN in CAPS: \c"
    read COLUMN_NAME
    echo "COLUMN_NAME : $COLUMN_NAME"

    if [[ $NO_OF_PK -gt 1 ]]
    then
        echo "Inside if"
        echo "                ${COLUMN_NAME}," >> $PK_RQL_NAME
        echo "                ${COLUMN_NAME}," >> ${FILE_NAME}_pk_rql.csv
      else
        echo "Inside else"
        echo "                ${COLUMN_NAME})" >> $PK_RQL_NAME
        echo "                ${COLUMN_NAME})" >> ${FILE_NAME}_pk_rql.csv
    fi

    NO_OF_PK=`expr $NO_OF_PK - 1`

  done


  echo "    USING INDEX" >> $PK_RQL_NAME
  echo "&${ABBREVIATION}_PK_PCT" >> $PK_RQL_NAME
  echo "&${ABBREVIATION}_PK_TBS" >> $PK_RQL_NAME
  echo "&${ABBREVIATION}_PK_TRN" >> $PK_RQL_NAME
  echo "&${ABBREVIATION}_PK_STG;" >> $PK_RQL_NAME

  echo "PK_RQL generated."

  echo "Generating DDL...."

  DDL_NAME_CRE=t_${abbreviation}.ddl
  echo "DDL_NAME_CRE : $DDL_NAME_CRE"

  DDL_NAME_PK=t_${abbreviation}_k.ddl
  echo "DDL_NAME_PK : $DDL_NAME_PK"

  echo "USE COPY \"${PK_RQL_NAME}\"" >> $DDL_NAME_CRE
  echo "COPY \"${RQL_NAME}\""  >> $DDL_NAME_CRE

  echo  "USE COPY \"${RQL_NAME}\"" >> $DDL_NAME_PK
  echo "COPY \"${PK_RQL_NAME}\"" >> $DDL_NAME_PK
  
  echo "Making entry in area_list.make file. "

  echo "Enter area_name [appmst/refst/...] : \c"
  read AREA_NAME

  echo "AREA_NAME : $AREA_NAME"

  echo "${AREA_NAME} :         ${PK_RQL_NAME}" >> area_list.make


fi


#------------------------------------------------------------------------------------------
if [[ $INPUT -eq 3 ]]
then
 
  echo "Enter View Number : \c"
  read VIEW

  echo "VIEW : ${VIEW}V"
 
  DMV_NAME=${FILE_NAME}_${VIEW}v.dmv
  DDL_NAME=t_${abbreviation}_${VIEW}v.ddl

  DMF_NAME=${FILE_NAME}_${VIEW}v.dmf

  echo "DMF_NAME : $DMF_NAME"

  echo "Enter NO_OF_COLUMNS :\c"
  read NO_OF_COLUMNS

  echo "NO_OF_COLUMNS : $NO_OF_COLUMNS"

  while [ $NO_OF_COLUMNS -gt 0 ]
  do
    echo "NO_OF_COLUMNS remaining : $NO_OF_COLUMNS"

    echo "Enter Name of COLUMN in CAPS [Enter CTRL_FLD to add the control fields in the column list] : \c"
    read COLUMN_NAME
    echo "COLUMN_NAME : $COLUMN_NAME"

    if [ $COLUMN_NAME = "CTRL_FLD" ]
    then
      if [[ $NO_OF_COLUMNS -gt 1 ]]
      then
        echo "        COPY \"control_fld.rql\"," >> $DMF_NAME
        NO_OF_COLUMNS=`expr $NO_OF_COLUMNS - 1`
        continue
      else
        echo "        COPY \"control_fld.rql\")" >> $DMF_NAME
        NO_OF_COLUMNS=`expr $NO_OF_COLUMNS - 1`
        continue
      fi
    fi

    echo "Enter the domain type: \c"
    read DOM_TYPE
    echo "DOM_TYPE : $DOM_TYPE"

    echo "Enter 1 if CONSTRAINT is NOT NULL"
    read CONSTRAINT
    echo "CONSTRAINT : $CONSTRAINT"

    if [[ $NO_OF_COLUMNS -gt 1 ]]
    then
        echo "Inside if"
        if [[ $CONSTRAINT -eq 1 ]]
        then
          echo "  ${COLUMN_NAME}     COPY \"${DOM_TYPE}\" NOT NULL," >> $DMF_NAME
        else
          echo "  ${COLUMN_NAME}     COPY \"${DOM_TYPE}\"," >> $DMF_NAME
        fi
    else
        echo "Inside else"
        if [[ $CONSTRAINT -eq 1 ]]
        then
          echo "  ${COLUMN_NAME}     COPY \"${DOM_TYPE}\" NOT NULL" >> $DMF_NAME
        else
          echo "  ${COLUMN_NAME}     COPY \"${DOM_TYPE}\"" >> $DMF_NAME
        fi   

    fi

    NO_OF_COLUMNS=`expr $NO_OF_COLUMNS - 1`



  done

  echo "Creating DMV File..."

  echo "DMV_NAME : $DMV_NAME"

  STRUCT_NAME=${TABLE_NAME}_${VIEW}V

  echo "STRUCT_NAME = $STRUCT_NAME"

  echo " CREATE STRUCTURE ${STRUCT_NAME}  (" >> $DMV_NAME

  echo "DMF_NAME : $DMF_NAME"

  echo "    COPY \"${DMF_NAME}\"" >> $DMV_NAME

  echo "    );" >> $DMV_NAME

  echo "DMV file Generated...."

  echo "Creating DDL File"

  echo "  COPY \"$DMV_NAME\"" >> $DDL_NAME

  echo "DDL File Created"

fi 

#--------------------------------------------------------------------------------------------------

if [[ $INPUT -eq 4 ]]
then

  echo "Enter View Number : \c"
  read VIEW

  DMV_NAME=${FILE_NAME}_cre_${VIEW}v.dmv
  DDL_NAME=t_${abbreviation}_${VIEW}v.ddl

  echo "DMV_NAME : $DMV_NAME"

  echo "CREATE STRUCTURE ${TABLE_NAME}_${VIEW}V (" >> $DMV_NAME

  echo "Enter NO_OF_COLUMNS :\c"
  read NO_OF_COLUMNS

  echo "NO_OF_COLUMNS : $NO_OF_COLUMNS"

  while [ $NO_OF_COLUMNS -gt 0 ]
  do
    echo "NO_OF_COLUMNS remaining : $NO_OF_COLUMNS"

    echo "Enter Name of COLUMN in CAPS [Enter CTRL_FLD to add the control fields in the column list] : \c"
    read COLUMN_NAME
    echo "COLUMN_NAME : $COLUMN_NAME"

    if [ $COLUMN_NAME = "CTRL_FLD" ]
    then
      if [[ $NO_OF_COLUMNS -gt 1 ]]
      then
        echo "        COPY \"control_fld.rql\"," >> $DMV_NAME
        NO_OF_COLUMNS=`expr $NO_OF_COLUMNS - 1`
        continue
      else
        echo "        COPY \"control_fld.rql\")" >> $DMV_NAME
        NO_OF_COLUMNS=`expr $NO_OF_COLUMNS - 1`
        continue
      fi
    fi



    echo "Enter the domain type: \c"
    read DOM_TYPE
    echo "DOM_TYPE : $DOM_TYPE"

    echo "Enter 1 if CONSTRAINT is NOT NULL"
    read CONSTRAINT
    echo "CONSTRAINT : $CONSTRAINT"

    if [[ $NO_OF_COLUMNS -gt 1 ]]
    then
        echo "Inside if"
        if [[ $CONSTRAINT -eq 1 ]]
        then
          echo "  ${COLUMN_NAME}     COPY \"${DOM_TYPE}\" NOT NULL," >> $DMV_NAME
        else
          echo "  ${COLUMN_NAME}     COPY \"${DOM_TYPE}\"," >> $DMV_NAME
        fi
    else
        echo "Inside else"
        if [[ $CONSTRAINT -eq 1 ]]
        then
          echo "  ${COLUMN_NAME}     COPY \"${DOM_TYPE}\" NOT NULL);" >> $DMV_NAME
        else
          echo "  ${COLUMN_NAME}     COPY \"${DOM_TYPE}\");" >> $DMV_NAME
        fi

    fi

    NO_OF_COLUMNS=`expr $NO_OF_COLUMNS - 1`

  done

  echo "DMV file Generated...."

  echo "Creating DDL File"

  echo "  COPY \"$DMV_NAME\"" >> $DDL_NAME

  echo "DDL File Created"


fi

#--------------------------------------------------------------------------------------------------

if [[ $INPUT -eq 5 ]]
then

  DDL_NAME=t_${abbreviation}.ddl

  echo "DDL_NAME = ${DDL_NAME}"

  echo "CREATE TABLE ${TABLE_NAME}(" >> $DDL_NAME

  echo "Enter NO_OF_COLUMNS :\c"
  read NO_OF_COLUMNS

  echo "NO_OF_COLUMNS : $NO_OF_COLUMNS"

  while [ $NO_OF_COLUMNS -gt 0 ]
  do
    echo "NO_OF_COLUMNS remaining : $NO_OF_COLUMNS"

    echo "Enter Name of COLUMN in CAPS [Enter CTRL_FLD to add the control fields in the column list] : \c"
    read COLUMN_NAME
    echo "COLUMN_NAME : $COLUMN_NAME"

    if [ $COLUMN_NAME = "CTRL_FLD" ]
    then
      if [[ $NO_OF_COLUMNS -gt 1 ]]
      then
        echo "        COPY \"control_fld.rql\"," >> $DDL_NAME
        NO_OF_COLUMNS=`expr $NO_OF_COLUMNS - 1`
        continue
      else
        echo "        COPY \"control_fld.rql\")" >> $DDL_NAME
        NO_OF_COLUMNS=`expr $NO_OF_COLUMNS - 1`
        continue
      fi
    fi

    echo "Enter the domain type: \c"
    read DOM_TYPE
    echo "DOM_TYPE : $DOM_TYPE"

    echo "Enter 1 if CONSTRAINT is NOT NULL"
    read CONSTRAINT
    echo "CONSTRAINT : $CONSTRAINT"

    if [[ $NO_OF_COLUMNS -gt 1 ]]
    then
        echo "Inside if"
        if [[ $CONSTRAINT -eq 1 ]]
        then
          echo "  ${COLUMN_NAME}     COPY \"${DOM_TYPE}\" NOT NULL," >> $DDL_NAME
        else
          echo "  ${COLUMN_NAME}     COPY \"${DOM_TYPE}\"," >> $DDL_NAME
        fi
    else
        echo "Inside else"
        if [[ $CONSTRAINT -eq 1 ]]
        then
          echo "  ${COLUMN_NAME}     COPY \"${DOM_TYPE}\" NOT NULL);" >> $DDL_NAME
        else
          echo "  ${COLUMN_NAME}     COPY \"${DOM_TYPE}\");" >> $DDL_NAME
        fi

    fi

    NO_OF_COLUMNS=`expr $NO_OF_COLUMNS - 1`

  done
  
fi

#--------------------------------------------------------------------------------------------------

if [[ $INPUT -eq 6 ]]
then

  echo "Enter index number : \c"
  read INDX

  INDX_NAME=${FILE_NAME}_cre_${INDX}ix.rql

  echo "CREATE INDEX ${TABLE_NAME}_${INDX}IX ON ${TABLE_NAME}(" >> $INDX_NAME

  echo "Enter NO_OF_COLUMNS :\c"
  read NO_OF_COLUMNS

  echo "NO_OF_COLUMNS : $NO_OF_COLUMNS"

  while [ $NO_OF_COLUMNS -gt 0 ]
  do
    echo "NO_OF_COLUMNS remaining : $NO_OF_COLUMNS"

    echo "Enter Name of COLUMN in CAPS [Enter CTRL_FLD to add the control fields in the column list] : \c"
    read COLUMN_NAME
    echo "COLUMN_NAME : $COLUMN_NAME"

    if [[ $NO_OF_COLUMNS -gt 1 ]]
    then
        echo "Inside if"
        echo "                ${COLUMN_NAME}," >> $INDX_NAME       
    else
        echo "Inside else"
        echo "                ${COLUMN_NAME})" >> $INDX_NAME
    fi

    NO_OF_COLUMNS=`expr $NO_OF_COLUMNS - 1`

  done

  echo "&${ABBREVIATION}_TB_PCT" >> $INDX_NAME
  echo "&${ABBREVIATION}_TB_TBS" >> $INDX_NAME
  echo "&${ABBREVIATION}_TB_TRN" >> $INDX_NAME
  echo "&${ABBREVIATION}_TB_STG;" >> $INDX_NAME

  echo "Making entry in area_list.make file. "
  echo "Enter area_name [appmst/refst/...] : \c"
  read AREA_NAME
  echo "AREA_NAME : $AREA_NAME"
  echo "${AREA_NAME} :         ${INDX_NAME}" >> area_list.make
fi

#------------------------------------------------------------------------------------------------------------

if [[ $INPUT -eq 7 ]]
then

  echo " Enter FK number : \c"
  read FK

  FK_RQL_NAME=${FILE_NAME}_cre_${FK}fk.rql

  echo "FK_RQL_NAME = $FK_RQL_NAME"

  echo "ALTER TABLE ${TABLE_NAME}" >> $FK_RQL_NAME
  
  echo "        ADD CONSTRAINT ${TABLE_NAME}_${FK}FK" >> $FK_RQL_NAME

  echo "        FOREIGN KEY (" >> $FK_RQL_NAME

  echo "Enter REFERENCE Table in CAPS : \c"
  read REF_TABLE

  echo "REF_TABLE : $REF_TABLE"

  echo "Enter NO_OF_COLUMNS :\c"
  read NO_OF_COLUMNS

  NO_OF_REF_COL=$NO_OF_COLUMNS

  echo "NO_OF_COLUMNS : $NO_OF_COLUMNS"
  echo "NO_OF_REF_COL : $NO_OF_REF_COL"

  while [ $NO_OF_COLUMNS -gt 0 ]
  do
    echo "NO_OF_COLUMNS remaining : $NO_OF_COLUMNS"

    echo "Enter Name of COLUMN in CAPS : \c"
    read COLUMN_NAME
    echo "COLUMN_NAME : $COLUMN_NAME"

    if [[ $NO_OF_COLUMNS -gt 1 ]]
    then
        echo "Inside if"
        echo "                ${COLUMN_NAME}," >> $FK_RQL_NAME
    else
        echo "Inside else"
        echo "                ${COLUMN_NAME})" >> $FK_RQL_NAME
        echo "        REFERENCES ${REF_TABLE} (" >> $FK_RQL_NAME
        while [ $NO_OF_REF_COL -gt 0 ]
        do
          echo "NO_OF_REF_COL remaining : $NO_OF_REF_COL"
          
          echo "Enter Name of REF_COL : \c"
          read REF_COL
          echo "REF_COL : $REF_COL"

          if [[ $NO_OF_REF_COL -gt 1 ]]
          then
              echo "                ${REF_COL}," >> $FK_RQL_NAME
          else
              echo "                ${COLUMN_NAME});" >> $FK_RQL_NAME
          fi

          NO_OF_REF_COL=`expr ${NO_OF_REF_COL} - 1`
        done

    fi
    NO_OF_COLUMNS=`expr $NO_OF_COLUMNS - 1`

  done

  echo "Making entry in area_list.make file. "

  echo "Enter area_name [appmst/refst/...] : \c"
  read AREA_NAME

  echo "AREA_NAME : $AREA_NAME"

  echo "${AREA_NAME} :         ${FK_RQL_NAME}" >> area_list.make
fi

done


