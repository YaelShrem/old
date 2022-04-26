let crSmOptionsValues = null;
let tablesInfo = null;

let appTopics = ['APP_ARDB', 'APP_BLDB', 'APP_CustDB', 'APP_SCDB', 'APP_USGDB', 'PostProd_App', 'CleanUpDB'];
let refTopics = ['PostProd_Ref', 'REFDB_PostPP', 'REFDB_PrePP'];
let topicsNotChecked = ['OnOff', 'PlaceHolder', 'SecurityDB'];
let dataTableColumns = ['jiraIntakeID', 'scrumMasterID', 'crNameID', 'userNameID', 'versionID', 'codeDropID', 'topicID', 'targetEnvironmentID', 'tableNameID', 'applicationID', 'queryTypeID', 'status', 'changeList', 'sqlFiles', 'mainQueryID', 'validationQueryID', 'rollbackQueryID'];

if (!crSmOptionsValues && window.location.pathname === '/create_new_bptcr') {
  fetch('/api/cr_information')
    .then(response => response.json())
    .then(data => {
      crSmOptionsValues = data;
    });
}

$('#userNameID').on('change', handleUserNameChange);
$('#jiraIntakeID').on('change', handleJiraIntakeChange);
$('#jiraIntakeID').mouseup(handleJiraIntakeChange);
$('#scrumMasterID').on('change', handleScrumMasterChange);
$('#crNameID').on('change', handleCrNameChange);
$('#versionID').on('change', handleVersionChange);
$('#codeDropID').on('change', handleCodeDropChange);
$('#topicID').on('change', handleTopicChange);
$('#targetEnvironmentID').on('change', handleTargetEnvironmentChange);
$('#tableNameID').on('change', handleTableNameChange);
$('#queryTypeID').on('change', handleQueryTypeChange);
$('#applicationID').on('change', handleApplicationChange);
$('#newBptcrFormID').on('submit', handleNewBptcrFormChange);
$('#sqlScriptsFormID').on('submit', handleSqlScriptFormChange);
$('#createSqlValidateFormID').on('submit', handleSqlValidatedFormChange);
$('#updateAndCreateSqlScriptsFormID').on('submit', handleUpdateAndCreateSqlFormChange);
$('#updateAndCreateSqlScriptsValidateFormID').on('submit', handleUpdateAndCreateSqlValidatedFormChange);

function openNewBptcrForm() {
  location.href = 'http://localhost:3000/create_new_bptcr';
}

function openOnHoldBptcrForm() {
  location.href = 'http://localhost:3000/update_and_create_existing_bptcr';
}

function openExistingBptcr() {
  location.href = 'http://localhost:3000/fetch_existing_bptcrs';
}

function redirToHomepage() {
  location.href = 'http://localhost:3000/';
}

$(document).ready(function() {
  if (window.location.pathname === '/create_new_bptcr') {
    if (!tablesInfo) {
      fetch('http://localhost:3000/api/all_table_columns')
        .then(response => response.json())
        .then(data => {
          tablesInfo = data;
        });
    }
    $('#createBtnID').remove();
    markPopulatedBptcrField($('#userNameID'));
    markPopulatedBptcrField($('#jiraIntakeID'));
    markPopulatedBptcrField($('#scrumMasterID'));
    markPopulatedBptcrField($('#crNameID'));
    markPopulatedBptcrField($('#versionID'));
    markPopulatedBptcrField($('#codeDropID'));
    markPopulatedBptcrField($('#topicID'));
    markPopulatedBptcrField($('#targetEnvironmentID'));
    markPopulatedBptcrField($('#tableNameID'));
    markPopulatedBptcrField($('#queryTypeID'));
    markPopulatedBptcrField($('#applicationID'));
  }
  if (window.location.pathname === '/create_sql_scripts' || window.location.pathname === '/create_sql_scripts_validated' ||
      window.location.pathname === '/update_and_create_sql_scripts_validated') {
    $('#createBtnID').remove();
    $('textarea').each(function() {
      textAreaAdjust(this);
    });
  }
  if (window.location.pathname === '/update_and_create_existing_bptcr') {
    $('#updateAndCreateBtnID').remove();
    $('textarea').each(function() {
      textAreaAdjust(this);
    });
    let dtable = $('#updateAndCreateBptcrTable').DataTable({
      columns: [
        null, null, null, null, null, null, null, null, null, null, null, null, null,
        {
          "render": function(data, type, row) {
            return data.split(",").join("<br/>");
          }
        },
        null, null, null
      ],
      select: true,
      rowCallback: function(row, data, index) {
        if (data[11] === 'New') {
          $(row).find('td:eq(11)').css('background-color', '#CCF5E0');
        }
      }
    });
    $("#updateAndCreateBptcrTable").css("display", "table");
    $('#updateAndCreateBptcrTable tbody').on('click', 'tr', function() {
      $(this).toggleClass('selected');
      let selectedRow = dtable.rows('.selected').data()[0];
      const form = document.createElement('form');
      form.method = 'post';
      form.action = '/update_and_create_existing_bptcr';

      for (let i = 0; i < selectedRow.length; i++) {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = dataTableColumns[i];
        hiddenField.value = selectedRow[i];
        form.appendChild(hiddenField);
      }
      document.body.appendChild(form);
      form.submit();
    });
  }
  if (window.location.pathname === '/fetch_existing_bptcrs') {
    $('#viewBptcrsBtnID').remove();
    $('#bptcrTable').DataTable({
      columns: [
        null, null, null, null, null, null, null, null, null, null, null, null, null,
        {
          "render": function(data, type, row) {
            return data.split(",").join("<br/>");
          }
        }
      ],
      dom: 'lBfrtip',
      buttons: [
        'copy',
        'csv'
      ],
      select: true,
      rowCallback: function(row, data, index) {
        if (data[11] === 'New') {
          $(row).find('td:eq(11)').css('background-color', '#CCF5E0');
        }
      }
    });
    $("#bptcrTable").css("display", "table");
    $('#bptcrTable tbody').on('click', 'tr', function() {
      $(this).toggleClass('selected');
    });
  }
});

function handleUserNameChange() {
  markPopulatedBptcrField($('#userNameID'));
}

function handleJiraIntakeChange() {
  populateCrSmInfo();
}

function handleScrumMasterChange() {
  let crSmRow = $.grep(crSmOptionsValues, function(row, i) {
    if (!$('#scrumMasterID').val().localeCompare(row.scrumMaster)) {
      return row;
    }
  })[0];
  if (!crSmRow) {
    $('#scrumMasterID').val('');
  }
  markPopulatedBptcrField($('#scrumMasterID'));
}

function handleCrNameChange() {
  let crNum = $('#crNameID').val();
  let crSmRow = $.grep(crSmOptionsValues, function(row, i) {
    if (!$('#crNameID').val().localeCompare(row.crNumber + '-' + row.crDescription)) {
      return row;
    }
  })[0];
  if (!crSmRow) {
    $('#crNameID').val(crNum);
  }
  markPopulatedBptcrField($('#crNameID'));
}

function handleVersionChange() {
  console.log("\nIn Version change\n");

  updateVersionTopicsList();
  if ($('#versionID').val() && $('#topicID').val()) {
    handleTableNameChange();
  }
  markPopulatedBptcrField($('#versionID'));
}

function handleCodeDropChange() {
  console.log("\nInCode Drop change\n");
  let codeDropFound = false;
  let children = $('#codeDropList').children();
  for (let i = 0; i < children.length; i++) {
    if (!$('#codeDropID').val().localeCompare(children[i].innerText)) {
      codeDropFound = true;
      break;
    }
  }
  if (!codeDropFound) {
    $('#codeDropID').val('');
  }
  markPopulatedBptcrField($('#codeDropID'));
}

function handleTopicChange() {
  let topicFound = false;
  let children = $('#topicList').children();
  for (let i = 0; i < children.length; i++) {
    console.log('In Handle topic change\n',children[i].innerText);

    if (!$('#topicID').val().localeCompare(children[i].innerText)) {
      if ($('#versionID').val() && $('#topicID').val()) {
        handleTableNameChange();
      }
      topicFound = true;
      break;
    }
  }
  if (!topicFound) {
    $('#topicID').val('');
  }
  updateTargetEnvList();
  markPopulatedBptcrField($('#topicID'));
}

function handleTargetEnvironmentChange() {
  let targetEnvironmentFound = false;
  let children = $('#targetEnvironmentList').children();
  for (let i = 0; i < children.length; i++) {
    console.log("In Debug\n");
    console.log('In Handle topic change\n',children[i].innerText);

    if (!children[i].hasAttribute('disabled') && !$('#targetEnvironmentID').val().localeCompare(children[i].innerText)) {
      targetEnvironmentFound = true;
      break;
    }
  }
  if (!targetEnvironmentFound) {
    $('#targetEnvironmentID').val('');
  }
  markPopulatedBptcrField($('#targetEnvironmentID'));
}

function handleTableNameChange() {
  let tableNameFound = false;
  let children = $('#tableNameList').children();
  if ($('#tableNameID').val()) {
    for (let i = 0; i < children.length; i++) {
      if (!$('#tableNameID').val().localeCompare(children[i].innerText)) {
        if ($('#versionID').val() && $('#topicID').val()) {
          let tableInfoRow = $.grep(tablesInfo, function(row, i) {
            if (!$('#tableNameID').val().localeCompare(row.table_name)) {
              return row;
            }
          })[0];
          if (tableInfoRow) {
            if (tableInfoRow.versions.split(',').includes($('#versionID').val())) {
              let db_area = tableInfoRow.db_area.substring(0, 3);
              if ((db_area === 'app' && appTopics.includes($('#topicID').val())) ||
                (db_area === 'ref' && refTopics.includes($('#topicID').val())) ||
                topicsNotChecked.includes($('#topicID').val())) {
                console.log('Found');
                tableNameFound = true;
              }
            }
          }
        }
        break;
      }
    }
    if (!tableNameFound) {
      $('#tableNameID').val('');
    }
  }
  markPopulatedBptcrField($('#tableNameID'));
}

function handleApplicationChange() {
   console.log('Application\n');
  let applicationFound = false;
  let children = $('#applicationList').children();
  for (let i = 0; i < children.length; i++) {
    if (!$('#applicationID').val().localeCompare(children[i].innerText)) {
      applicationFound = true;
      break;
    }
  }
  if (!applicationFound) {
    $('#applicationID').val('');
  }
  markPopulatedBptcrField($('#applicationID'));
}

function handleQueryTypeChange() {
  let queryTypeFound = false;
  let children = $('#queryTypeList').children();
  for (let i = 0; i < children.length; i++) {
    if (!$('#queryTypeID').val().localeCompare(children[i].innerText)) {
      queryTypeFound = true;
      break;
    }
  }
  if (!queryTypeFound) {
    $('#queryTypeID').val('');
  }
  markPopulatedBptcrField($('#queryTypeID'));
}


function populateCrSmInfo() {
  let jiraIntake = $('#jiraIntakeID').val();
  if (jiraIntake) {
    let crSmRow = $.grep(crSmOptionsValues, function(row, i) {
      if (!row.jiraIntake.localeCompare(jiraIntake)) {
        return row;
      }
    })[0];
    if (crSmRow) {
      $('#scrumMasterID').val(crSmRow.scrumMaster);
      $('#crNameID').val(crSmRow.crNumber + '-' + crSmRow.crDescription);
    } else {
      $('#jiraIntakeID').val(jiraIntake);
      $('#scrumMasterID').val('');
      $('#crNameID').val('');
    }
  } else {
    $('#jiraIntakeID').val('');
    $('#scrumMasterID').val('');
    $('#crNameID').val('');
  }
  markPopulatedBptcrField($('#jiraIntakeID'));
  markPopulatedBptcrField($('#scrumMasterID'));
  markPopulatedBptcrField($('#crNameID'));
}

function updateVersionTopicsList() {
  console.log('Versio Id\n');
  if ($('#versionID').val()) {
    let versionTopicsUrl = 'http://localhost:3000/api/bptcr_topics/' + $('#versionID').val();
    fetch(versionTopicsUrl)
      .then(response => response.json())
      .then(data => {
        fillTopicsDatalist(data)
      }).catch((err) => {
        console.log(err);
        $('#versionID').val('');
        markPopulatedBptcrField($('#versionID'));
      });
  }
}

function fillTopicsDatalist(data) {
  topicFound = false;
  $('#topicList').empty();
  data.topics.split(',').forEach(function(topic) {
    $('#topicList').append('<option value=\'' + topic + '\'>' + topic + '</option>');
    if (!topic.localeCompare($('#topicID').val())) {
      topicFound = true;
    }
  });
  if ($('#topicID').val() && !topicFound) {
    $('#topicID').val('');
    markPopulatedBptcrField($('#topicID'));
  }
}

function updateTargetEnvList() {
  if (!$('#topicID').val().localeCompare('CleanUpDB')) {
    console.log('Tar\n',targetEnvironmentID);
    let children = $('#targetEnvironmentList').children();

    $('#targetEnvironmentID').val('');

    for (let i = 0; i < children.length; i++) {
      if (children[i].innerText.localeCompare('ProductionOnly') && children[i].innerText.localeCompare('PETOnly')) {
        document.querySelector('#targetEnvironmentList').children[i].setAttribute('disabled', true);
      }
    }
  } else {
    $('#targetEnvironmentList').children().removeAttr('disabled');
  }
  markPopulatedBptcrField($('#targetEnvironmentID'));
}

function markPopulatedBptcrField(event) {
  if (!event.hasClass('is-valid') && event.val()) {
    event.addClass('is-valid');
  } else if (event.hasClass('is-valid') && !event.val()) {
    event.removeClass('is-valid');
  }
}

function textAreaAdjust(element) {
  element.style.height = '1px';
  element.style.height = (25 + element.scrollHeight) + 'px';
}

function handleNewBptcrFormChange() {
  let baseInfoObj = {};
  let formData = new FormData(document.getElementById('newBptcrFormID'));
  for (let eachPair of formData) {
    baseInfoObj[eachPair[0]] = eachPair[1]
  };
  sessionStorage.setItem('baseInfo', JSON.stringify(baseInfoObj));
}

function handleSqlScriptFormChange() {
  $('#sqlCreateBtn').attr('disabled', true);
  $('#sqlCreateBtn span').removeAttr('hidden');
  $('textarea').attr('readonly', true);
}

function handleSqlValidatedFormChange() {
  $('#sqlCreateBtn').attr('disabled', true);
  $('#sqlCreateBtn span').removeAttr('hidden');
  $('textarea').attr('readonly', true);
}

function handleUpdateAndCreateSqlFormChange() {
  $('#sqlCreateBtn').attr('disabled', true);
  $('#sqlCreateBtn span').removeAttr('hidden');
  $('textarea').attr('readonly', true);
}

function handleUpdateAndCreateSqlValidatedFormChange() {
  $('#sqlCreateBtn').attr('disabled', true);
  $('#sqlCreateBtn span').removeAttr('hidden');
  $('textarea').attr('readonly', true);
}
