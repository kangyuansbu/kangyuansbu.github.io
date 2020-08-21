var rules_basic = {
    condition: 'AND',
    rules: [{
        id: 'patients.person_id',
        label: 'patients.person_id',
        operator: 'equal',
        value: ""
    }]
};

$(document).ready(function () {

    $('#builder').queryBuilder({
        plugins: ['bt-tooltip-errors'],

        filters: [{
            id: 'patients.person_id',
            label: 'patients.person_id',
            type: 'integer'
        },
            {
                id: 'patients.dob',
                label: 'patients.dob',
                type: 'date', plugin: 'datepicker',
                plugin_config: {
                    format: 'yyyy/mm/dd',
                    todayBtn: 'linked',
                    todayHighlight: true,
                    autoclose: true
                }
            },
            {
                id: 'patients.zipcode',
                label: 'patients.zipcode',
                type: 'string'
            },
            {
                id: 'patients.race',
                label: 'patients.race',
                type: 'string'
            },
            {
                id: 'patients.ethnicity',
                label: 'patients.ethnicity',
                type: 'string'
            },
            {
                id: 'encounters.encounter_id',
                label: 'encounters.encounter_id',
                type: 'integer'
            },
            {
                id: 'encounters.admittime',
                label: 'encounters.admittime',
                type: 'datetime'
            },
            {
                id: 'encounters.dischtime',
                label: 'encounters.dischtime',
                type: 'datetime'
            },
            {
                id: 'encounters.admission_location',
                label: 'encounters.admission_location',
                type: 'string'
            },
            {
                id: 'encounters.insurance',
                label: 'encounters.insurance',
                type: 'string'
            },
            {
                id: 'encounters.language',
                label: 'encounters.language',
                type: 'string'
            },
            {
                id: 'labevents.charttime',
                label: 'labevents.charttime',
                type: 'string'
            },
            {
                id: 'labevents.item_id',
                label: 'labevents.item_id',
                type: 'integer'
            },
            {
                id: 'labevents.value',
                label: 'labevents.value',
                type: 'string'
            },
            {
                id: 'labevents.numvalue',
                label: 'labevents.numvalue',
                type: 'integer'
            },
            {
                id: 'labevents.normal_low',
                label: 'labevents.normal_low',
                type: 'string'
            },
            {
                id: 'labevents.normal_high',
                label: 'labevents.normal_high',
                type: 'string'
            },
            {
                id: 'labevents.flag',
                label: 'labevents.flag',
                type: 'string'
            },
            {
                id: 'diagnosis.diagnosis_id',
                label: 'diagnosis.diagnosis_id',
                type: 'integer'
            },
            {
                id: 'apgar_event.baby_no',
                label: 'apgar_event.baby_no',
                type: 'integer'
            },
            {
                id: 'apgar_event.item',
                label: 'apgar_event.item',
                type: 'integer'
            },
            {
                id: 'apgar_event.value',
                label: 'apgar_event.value',
                type: 'string'
            },
            {
                id: 'apgar_event.time',
                label: 'apgar_event.time',
                type: 'string'
            },
            {
                id: 'birthdatetime.birth_date_time',
                label: 'birthdatetime.birth_date_time',
                type: 'datetime'
            },
            {
                id: 'fhr_vital.height',
                label: 'fhr_vital.height',
                type: 'string'
            },
            {
                id: 'fhr_vital.weight',
                label: 'fhr_vital.weight',
                type: 'string'
            },
            {
                id: 'fhr_vital.bmi',
                label: 'fhr_vital.bmi',
                type: 'string'
            },
            {
                id: 'fhr_vital.bsa',
                label: 'fhr_vital.bsa',
                type: 'string'
            },
            {
                id: 'procedures.code',
                label: 'procedures.code',
                type: 'string'
            }
        ],
        rules: rules_basic
    });
    /****************************************************************
     Triggers and Changers QueryBuilder
     *****************************************************************/

    $('#btn-get').on('click', function () {
        var result = $('#builder').queryBuilder('getRules');
        if (!$.isEmptyObject(result)) {
            alert(JSON.stringify(result, null, 2));
        } else {
            console.log("invalid object :");
        }
        console.log(result);

        var queryJson = result
        if (!$.isEmptyObject(result)) {
            callServer(queryJson)
        }


    });


    $('#btn-reset').on('click', function () {
        $('#builder').queryBuilder('reset');
    });

    $('#btn-set').on('click', function () {
        //$('#builder').queryBuilder('setRules', rules_basic);
        var result = $('#builder').queryBuilder('getRules');
        if (!$.isEmptyObject(result)) {
            rules_basic = result;
        }
    });

    //When rules changed :
    $('#builder').on('getRules.queryBuilder.filter', function (e) {
        //$log.info(e.value);
    });

});

function callServer(queryJsonObj) {
    queryJson = JSON.stringify(queryJsonObj)

    //alert(queryJson)
    var Texas = "Texas";
    var Counties = ["Collin", "Dallas", "Denton", "Ellis", "Hood", "Hunt", "Johnson", "Kaufman", "Parker", "Rockwall", "Somervell", "Tarrant", "Wise"]
    var bodyData = {"Texas": 1};
    fetch('http://127.0.0.1:5000//getQueryResults', {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(queryJsonObj)
    })
        .then((response) => {
            return response.json();

        })
        .then((data) => {
            console.log("data from sever", data)
            //alert("patient Name : "+data['PatientName']+"\n"+"Patient DOB :"+ data['dob'])
            displayResults(data)
        });
}

function displayResults(data) {


    var arrItems = [];      // THE ARRAY TO STORE JSON ITEMS.
    $.each(data, function (index, value) {
        arrItems.push(value);       // PUSH THE VALUES INSIDE THE ARRAY.
    });


    var col = [];
    for (var i = 0; i < arrItems.length; i++) {
        for (var key in arrItems[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        }
    }

    var titles = [];
    for (var i = 0; i < col.length; i++) {
        var title_dict = {}
        title_dict["title"] = col[i];
        titles.push(title_dict)
    }

    var dataSet = [];
    for (var i = 0; i < arrItems.length; i++) {

        var row = []

        for (var j = 0; j < col.length; j++) {
            row.push(arrItems[i][col[j]]);
        }

        dataSet.push(row)
    }


    // CREATE DYNAMIC TABLE.
    var table = document.createElement("table");
    table.id = "tb_show";

    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

    var tr = table.insertRow(-1);                   // TABLE ROW.

    for (var i = 0; i < col.length; i++) {
        var th = document.createElement("th");      // TABLE HEADER.
        th.innerHTML = col[i];
        tr.appendChild(th);
    }

    // ADD JSON DATA TO THE TABLE AS ROWS.
    for (var i = 0; i < arrItems.length; i++) {

        tr = table.insertRow(-1);

        for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);
            tabCell.innerHTML = arrItems[i][col[j]];
        }
    }

    // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
    var divContainer = document.getElementById("showData");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);

    $('#tb_show').DataTable({
        data: dataSet,
        columns: titles
    });

    var countLable = document.getElementById("countLable")

    countLable.innerHTML = "Total no of Records retrieved : " + arrItems.length
    countLable.style["color"] = "red"
    countLable.style["display"] = 'inline'

}