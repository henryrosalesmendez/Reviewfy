$(document).ready(function() {
    
    D = {}; // Datos de los documentos, ejemplo:
    //D =  {1: {"fileName":"abc.csv", "type":"ACM", "name":"Henry","searchQuery":"..", "dateUpload":"2018-03-02", "timeUpload":"10:30am", "repited":{"1":12, "2":3}, "typePubl":{"articles":2, "procedings":4}, "length":50, "description":"ABABAB", "content":["id"]} };
    // In order tounify the input script, first words of the columns
    Head = {"ACM":'"type","id","author"'};
    //alowing publications
    Allow = {"ACM":{"article":0}};
    
    // My Names of the fields
    invMap = { 0: "type",
            1: "id",
            2: "author",
            3: "editor",
            4: "advisor",
            5: "note",
            6: "title",
            7: "pages",
            8: "article_no",
            9: "num_pages",
            10:"keywords",
            11:"doi",
            12:"journal",
            13:"issue_date",
            14:"volume",
            15:"issue_no",
            16:"description",
            17:"month",
            18:"year",
            19:"issn",
            20:"booktitle",
            21:"acronym",
            22:"edition",
            23:"isbn",
            24:"conf_loc",
            25:"publisher",
            26:"publisher_loc"
      };
    //In order to unify the input of the csv
    Map = {"ACM":{
            "type" : 0,
            "id" : 1,
            "author" : 2,
            "editor" : 3,
            "advisor" : 4,
            "note" : 5,
            "title" : 6,
            "pages" : 7,
            "article_no" : 8,
            "num_pages" : 9,
            "keywords" : 10,
            "doi" : 11,
            "journal" : 12,
            "issue_date" : 13,
            "volume" : 14,
            "issue_no" : 15,
            "description": 16,
            "month" : 17,
            "year" : 18,
            "issn": 19,
            "booktitle" : 20,
            "acronym" : 21,
            "edition" : 22,
            "isbn" : 23,
            "conf_loc" : 24,
            "publisher" : 25,
            "publisher_loc" : 26}
      }
    
    // Global because I specify in the clic-time the kind of library: ACM, IEEE, etc
    newDoc = {};
    // to filtering
    filterList = [];
    
    $('ul.tabs li').click(function(){
        var tab_id = $(this).attr('data-tab');

        $('ul.tabs li').removeClass('current');
        $('.tab-content').removeClass('current');

        $(this).addClass('current');
        $("#"+tab_id).addClass('current');
    })
    
    clearFilter = function(){
        $("#tagFilter").val('').trigger("change");
        filterList = [];
    }

    warning_alert = function(text){
        BootstrapDialog.show({
            title: 'Information',
            message: text,
            buttons: [ {
                label: 'Ok',
                action: function(dialog) {
                    dialog.close();
                }
            }]
        });
    }


    isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    replaceAll = function(str, term, replacement){
            //console.log("-->"+str+"|"+term+"|"+replacement);
            return str.replace(new RegExp(term, 'g'), replacement);
    }
    
    trim_1 = function(txt){
        var ini = 0;
        var fin = txt.length-1;
        
        while ((txt[ini] == " " || txt[ini] == '"' || txt[ini] == "\n") && ini!=txt.lenth){
            ini = ini +1;
            //console.log("avoiding ini:",txt[ini-1]);
        }
        
        var parentesis = false;
        while ((txt[fin] == " " || txt[fin] == '"' || txt[fin] == "\n") && fin!=0){
            fin = fin -1;
            //console.log("avoiding fin:",txt[fin+1]);
            if (txt[fin] == ">" || txt[fin] == "<"){ parentesis = true;}
        }
        
        //console.log(ini,fin);
        return txt.substr(ini,fin-ini+1);
    }

    
   
   updateMainTable = function(){
       $("#doc_table").empty();
       
       
       
       var html_table = '<thead>'+
        '<tr>'+
            '<th scope="col" style="width: 50px;">#</th>'+
            '<th scope="col" style="width: 100px;">Date</th>'+
            '<th scope="col" style="width: 100px;">Time</th>'+
            '<th scope="col" style="width: 50px;">Length</th>'+
            '<th scope="col" style="width: 150px;">Name</th>'+
            '<th scope="col">Description</th>'+
            '<th scope="col">Query</th>'+
            '<th scope="col"></th>'+
        '</tr>'+
        '</thead>'+
        '<tbody>'+
        '</tbody>';
       
       
       $("#doc_table").html(html_table);
       var pos = 1;
       for (i in D){
           var d = D[i];
           var actions =  '<button class="btn btn-secondary btnEdit" type="button" idd="'+i+'" data-toggle="tooltip" title="Edit the data of this dump"><i class="glyphicon glyphicon-edit"></i></button>';
           actions = actions + '<button class="btn btn-secondary btnDetails" type="button" idd="'+i+'" data-toggle="tooltip" title="Details"><i class="glyphicon glyphicon-th"></i></button>';
           actions = actions + '<button class="btn btn-secondary btnDelete" type="button" idd="'+i+'" data-toggle="tooltip" title="Delete this document"><i class="glyphicon glyphicon-erase"></i></button>';
           actions = actions + '<button class="btn btn-secondary btnDifference" type="button" idd="'+i+'" data-toggle="tooltip" title="Difference with respect others dumps"><i class="glyphicon glyphicon-transfer"></i></button>';
           actions = actions + '<button class="btn btn-secondary btnSearch" type="button" idd="'+i+'" data-toggle="tooltip" title="Display Content"><i class="glyphicon glyphicon-pushpin"></i></button>';
           
           $("#doc_table").append('<tr id="tr'+i+'"><td>'+pos.toString()+'</td><td>'+d["dateUpload"]+'</th><td>'+d["timeUpload"]+'</td><td>'+d["length"]+'</td><td>'+d["name"]+'</td><td>'+d["description"]+'</td><td>'+d["searchQuery"]+'</td><td style="text-align:right">'+actions+'</td></tr>');
           pos = pos + 1;
       }
   }
   

    //e.target.
    //see https://www.html5rocks.com/en/tutorials/file/dndfiles/
    tempFileInput = "";
    function readBlob(opt_startByte, opt_stopByte) {
        var files = document.getElementById('input-b9').files;
        if (!files.length) {
            warning_alert('Please select a file!');
            return;
        }

        var file = files[0];
        
        file_temp = file;		
        fr = new FileReader();
                //fr.onload = receivedText;
        fr.onload = function(e){
            var result = e.target.result;
            //console.log(result);
            textFromUpload = e.target.result;
            //console.log(textFromUpload);
            //$("#btn_inputNIF").click();
            if (typeInput == "env"){
                parseEnvInput();
            }
            else{
                parseTextInput();
            }
        }
        fr.readAsText(file);
    }
        
        $('#modalUpload_upload').click(function(evt) {
            /*warning_alert("It's not working yet :(, you should try to copy/paste the nif content in the text area and apply the next button");
        /**/if (evt.target.tagName.toLowerCase() == 'button') {
            var startByte = evt.target.getAttribute('data-startbyte');
            var endByte = evt.target.getAttribute('data-endbyte');
            readBlob(startByte, endByte);
        }
        $("#divShow").removeClass("hide");/**/
    });


    
    // count the ocurrences of the values and return the dictionary 
    invert_counting = function(O){
        var invO = {}
        for (k in O){
            if (O[k] in invO){
                invO[O[k]] = invO[O[k]] + 1;
            }
            else{
                invO[O[k]] = 1;
            }
        }
        return invO;
    }



    if (!String.prototype.trim) {
	  String.prototype.trim = function () {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	  };
	}


    textFromUpload = undefined;
    parseTextInput = function(){
        var text = undefined;
        if (textFromUpload == undefined){
            text = $("#inDoc").val();
        } else{
          text = textFromUpload;
          textFromUpload = undefined;
        }
        
        
        //meta-data
        var dname = $("#inName").val();if (dname == undefined){dname = "";}
        var ddescription = $("#inDescription").val();if (ddescription == undefined){ddescription = "";}
        var dquery = $("#inQuery").val();if (dquery == undefined){dquery = "";}
        
        newDoc["name"] = dname;
        newDoc["description"] = ddescription;
        newDoc["searchQuery"] = dquery;
        var M = Map[newDoc["type"]];
        var A = Allow[newDoc["type"]];
        
        // parsing
        var Rr = {}; // couting the repetitions
        var Rt = {}; // counting by type
        var L = text.split("\n");
        var first = true;
        var cant = 0;
        var newidDoc = Object.keys(D).length+1;
        for (i in L){
            var l = L[i];
            if (trim_1(l) == ""){continue;}
            if (first){  // first line have the columns names
                if (l.indexOf(Head[newDoc["type"]]) != -1){
                    continue; 
                }
            }
            
            var H = l.split('","');
            
            // seeing the type of publication
            var ptype = trim_1(H[M["type"]]);
            if (ptype in Rt){
                Rt[ptype] = Rt[ptype] + 1;                
            }
            else{
                Rt[ptype] = 1;
            }
            
            if (!(ptype in A)){
                continue;
            }
            
            //seeing if it repeated 
            var pid = trim_1(H[M["id"]]);
            if (pid in Rr){
                Rr[pid] = Rr[pid] + 1;
                continue; 
            }
            else{
                Rr[pid] = 1;
            }
            
            //
            var newPub = {};  
            for (j in H){
                h = trim_1(H[j]);
                var k = invMap[j];
                if (k != -1){
                    newPub[k] = h;                    
                }        
            }
            newPub["meta:tags"] = 0; // etiqueta por las que se filtra
            newPub["meta:iddoc"] = newidDoc;
            //newDoc["content"].push(newPub);
            //find suitable position
            var pp = 0;
            var _id = parseInt(newPub["id"]);
            for (t in newDoc["content"]){
                n = newDoc["content"][t];
                if(parseInt(n["id"])>_id){
                    break;
                }
                pp = pp + 1;
            }
            
            //insert in position
            newDoc["content"].splice(pp, 0, newPub);
            cant = cant + 1;
            
        }
        
        newDoc["fileName"] = tempFileInput;
        newDoc["timeUpload"]= new Date().toLocaleTimeString();
        newDoc["dateUpload"]= new Date().toLocaleDateString();
        newDoc["repited"] = invert_counting(Rr);
        newDoc["typePubl"] = jQuery.extend({}, Rt);
        newDoc["length"] = cant;
        D[newidDoc] = newDoc;

       //Update table
       updateMainTable();
    };

    
    
    // We suppose that the sentences are ordered
    
    
    
    $("#input-b9").fileinput({
        showPreview: false,
        showUpload: false,
        elErrorContainer: '#kartik-file-errors',
        allowedFileExtensions: ["csv","xml"]
        //uploadUrl: '/site/file-upload-single'
    });


    typeInput = "";
    $("#btn_upload").click(function(){
        newDoc = {"fileName":"-", "type":"ACM", "name":"-","searchQuery":"-", "dateUpload":"-", "timeUpload":"-", "repited":{}, "typePubl":{}, "length":0, "description":"-", "content":[]};
        typeInput = "dump";
        $("#modalUpload").modal("show");
    });
    

    // ---- modal details
    $(document).on('click', '.btnDetails', function () {
        $("#details_table").empty();
        
        var html_table = '<thead>'+
            '<tr>'+
                '<th scope="col">Cardinality</th>'+
                '<th scope="col">Quantity</th>'+
            '</tr>'+
        '</thead>'+
        '<tbody>'+
        '</tbody>';
            
   
        $("#details_table").html(html_table);
        var idd = $(this).attr("idd");
        var doc = D[idd];
        var pos = 1;
        for (i in doc["repited"]){
            var h = doc["repited"][i];
            $("#details_table").append('<tr><td class="text-primary">'+i+'</td><td class="text-primary">'+h+'</td></tr>');
            pos = pos + 1;
        }
        
        
        //---------------------
        $("#type_table").empty();
        
        var html_table = '<thead>'+
            '<tr>'+
                '<th scope="col">Type</th>'+
                '<th scope="col">Quantity</th>'+
            '</tr>'+
        '</thead>'+
        '<tbody>'+
        '</tbody>';
            
   
        $("#type_table").html(html_table);
        var idd = $(this).attr("idd");
        var doc = D[idd];
        var pos = 1;
        for (i in doc["typePubl"]){
            var h = doc["typePubl"][i];
            $("#type_table").append('<tr><td class="text-success">'+i+'</td><td class="text-success">'+h+'</td></tr>');
            pos = pos + 1;
        }
        
        $('#modalDetails').modal("show");
    
    });
    
    
    
    //-- showing content
    tag2color = {'-':"", "exclude":"danger", "include":"success", "maybe":"info"};
    id2color = {"0":"", "1":"info", "2":"danger", "3":"success"};
    //id2color = ["danger", "success", "info"];
    
    activeDoc = -1;
    $(document).on('click', '.btnSearch', function () {
        var idd = $(this).attr("idd");
        activeDoc = idd;
        showContent();
        show_with_filter();
        clearFilter();
    });
    
    show_with_filter = function(){
        $( ".divContent" ).each(function(index) {
            $(this).removeClass("hide");
        });
    }
    
    hide_all = function(){
        $( ".divContent" ).each(function(index) {
            $(this).addClass("hide");
        });
    }
    
    show_with_out_filter = function(){
        hide_all();
        $( ".divContent_without_filter" ).each(function(index) {
            $(this).removeClass("hide");
        });
    }
    
    getPub = function(idd,idc){
        var doc = D[idd];
        for (i in doc["content"]){
            pub = doc["content"][i];
            if (pub["id"] == idc){
                return pub;
            }
        }
        return undefined;
    }
    
    esta_en = function(A,a){
        for (k in A){
            if (a == A[k]){
                return true;
            }
        }
        return false;
    }
    
    
    apply_on_change_to_selects = function(){
        $(document).on('change', '.trSelectChange', function () {
            var idc = $(this).attr("idc");
            
            for (i in ListTaxonomy){
                var l = ListTaxonomy[i];
                $("#tr_cont_"+idc).removeClass(tag2color[l["text"]]);
            }
            
            $("#tr_cont_"+idc).addClass(id2color[$(this).val()]);
            
            //updating tag in memory
            var idd = $(this).attr("idd");
            var pub = getPub(idd,idc);
            pub["meta:tags"] = $(this).val();
        });
    }
    
    
    showContent = function(){
        var idd = activeDoc;
        $("#content_table").empty();
        
        var html_table = '<thead>'+
            '<tr>'+
                '<th scope="col" style="width: 50px;">#</th>'+
                '<th scope="col" style="width: 150px;">ID</th>'+
                '<th scope="col" style="width: 50px;">Year</th>'+
                '<th scope="col">Title</th>'+
                '<th scope="col">Authors</th>'+
                '<th scope="col">Tags</th>'+
                '<th scope="col"></th> '+
            '</tr>'+
        '</thead>'+
        '<tbody>'+
        '</tbody>';
            
        
        $("#content_table").html(html_table);
        
        var doc = D[idd];
        $("#spanDocName").html("("+doc["length"]+") Showing: "+doc["name"]);
        var M = Map[doc["type"]];
        var pos = 1;

        var idfilter = -1;
        var Lfilter = [];
        if (filterList.length != 0){
            idfilter = invListTags[filterList[0]];
            
            for (j in filterList){
                Lfilter.push(invListTags[filterList[j]]);
            }
        }
        
        for (i in doc["content"]){
            var pub = doc["content"][i];
            
            // filtering
            if (filterList.length != 0){
                if (esta_en(Lfilter,pub["meta:tags"])==false){continue;}
            }
            
            // selecting tag
            var sel=["","","",""];
            sel[pub["meta:tags"]] = 'selected="selected"';
            
            // contructing table
            $("#content_table").append('<tr class="'+id2color[pub["meta:tags"]]+'" id="tr_cont_'+pub["id"]+'">'+
                        '<td>'+pos+'</td>'+
                        '<td>'+pub["id"]+'</td>'+
                        '<td>'+pub["year"]+'</td>'+
                        '<td>'+pub["title"]+'</td>'+
                        '<td>'+pub["author"]+'</td>'+
                        //'<td><input type="text" style="width:100%!important;min-width: 100px!important;" idd="'+pub["id"]+'" id="taxonomy'+pub["id"]+'" class="taxonomyPubs"/></td>'+
                        '<td>'+
                            '<select class="trSelectChange" idd="'+activeDoc+'" idc="'+pub["id"]+'">'+
                                    '<option '+sel[0]+' value="0">-</option>'+
                                    '<option '+sel[1]+'value="1">include</option>'+
                                    '<option '+sel[2]+'value="2">exclude</option>'+
                                    '<option '+sel[3]+'value="3">maybe</option>'+
                            '</select>'+
                        '</td>'+
                        '<td>-</td>'+
                    '</tr>');
            pos = pos +1 ;
        }

        apply_on_change_to_selects();
    }
    
     
    
    
    // Filtering Tags---
    
    ListTaxonomy = [
        {id: 0, text: '-'},
        {id: 1, text: 'include'},
		{id: 2, text: 'exclude'},
		{id: 3, text: 'maybe'},
    ];
    
    invListTags = {
        '-': 0,
        'include':1,
        'exclude':2,
        'maybe':3
    }

   
   $("#tagFilter").select2({
        createSearchChoice:function(term, data) { 
            if ($(data).filter(function() { 
                return this.text.localeCompare(term)===0; 
            }).length===0) 
            {return {id:term, text:term};} 
        },
        multiple: true,
        //data: [{id: 0, text: 'nerd:Organization'},{id: 1, text: 'dbpo:Company'},{id: 2, text: 'task'}]
        data:ListTaxonomy
    });
   
   
    $("#btnFilterTag").click(function(){
        var listTags = $("#tagFilter").select2('data');
        filterList = [];
        for (i in listTags){
            l = listTags[i];
            filterList.push(l["text"]);
        }
        showContent();
    });
    
    
    
    
    // --- Difference
    /*$("#btnDifference").click(function(){
        alert("there");
    });*/
    
    targetDoc = 0;
    $(document).on('click', '.btnDifference', function () {
        var idd = $(this).attr("idd");
        $("#difference_choose_table").empty();
        
        var html_table = '<thead>'+
            '<tr>'+
                '<th scope="col">#</th>'+
                '<th scope="col"></th>'+
                '<th scope="col">Date</th>'+
                '<th scope="col">Time</th>'+
                '<th scope="col">Length</th>'+
                '<th scope="col">Name</th>'+
            '</tr>'+
        '</thead>'+
        '<tbody>'+
        '</tbody>';
            
        $("#difference_choose_table").html(html_table);
        
        var pos = 1;
        for (i in D){
           if (i == idd){continue;}
           var d = D[i];
           var check = '<input type="checkbox" class="chkDiff" idd="'+i+'">';
           $("#difference_choose_table").append('<tr><td>'+pos.toString()+'</td>'+
                                      '<td>'+check+'</td>'+
                                      '<td>'+d["dateUpload"]+'</td>'+
                                      '<td>'+d["timeUpload"]+'</td>'+
                                      '<td>'+d["length"]+'</td>'+
                                      '<td>'+d["name"]+'</td></tr>');
           pos = pos + 1;
        }
        targetDoc = idd;
        $('#modalDifference').modal("show");
    });
    
    
    
    // This return a copy of the publications, each of them has a identifier of the corresponding document
    operation_doc = function(type, list_of_other){
        var doc = D[targetDoc];
        
        // contructing super set of others
        var So = new Set();
        for (x in list_of_other){
            xdoc = D[list_of_other[x]];
            for (y in xdoc["content"]){
                ypub = xdoc["content"][y];
                So.add(ypub["id"]);
            }
        }
        
        IDs = []
        if (type == "1-0"){
            for (y in doc["content"]){
                ypub = doc["content"][y];
                if (So.has(ypub["id"]) == false){
                    IDs.push(ypub);
                }
            }
        }
        else if (type == "1-1"){
           for (y in doc["content"]){
                ypub = doc["content"][y];
                if (So.has(ypub["id"]) == true){
                    IDs.push(ypub);
                }
            } 
        }
        else if (type == "0-1"){
            var S = new Set();
            for (y in doc["content"]){
                ypub = doc["content"][y];
                S.add(ypub["id"]);
            }

            var arrSo = Array.from(So);
            for (y in arrSo){
                yid = arrSo[y];
                if (S.has(yid) == false){
                    IDs.push(ypub);
                }
            } 
        }

        return IDs;
    }
    
    
    
    // type:  1-0 will shows the publications that are in the target document but not in the others
    //        0-1: the opposite
    //        1-1: intersection
    relationCalculation = function(type){
        activeDoc = -1;
        $("#content_table").empty();
        clearFilter();
        
        var html_table = '<thead>'+
            '<tr>'+
                '<th scope="col" style="width: 50px;">#</th>'+
                '<th scope="col" style="width: 150px;">Dump</th>'+
                '<th scope="col" style="width: 150px;">ID</th>'+
                '<th scope="col" style="width: 50px;">Year</th>'+
                '<th scope="col">Title</th>'+
                '<th scope="col">Authors</th>'+
                '<th scope="col">Tags</th>'+
                '<th scope="col"></th> '+
            '</tr>'+
        '</thead>'+
        '<tbody>'+
        '</tbody>';
            
        
        $("#content_table").html(html_table);
        
        var list_of_other = [];

        $("input:checkbox[class=chkDiff]:checked").each(function() {
            list_of_other.push($(this).attr("idd"));
        });
        
        if (list_of_other.length == 0){
            warning_alert("Please, select which dumps do you want to compare it with!");
            return false;
        }
        
        var other_str = list_of_other.join(",");
        $("#spanDocName").html("("+D[targetDoc]["length"]+") Comparison "+type+"| source:"+targetDoc+"  |against:"+other_str);
        
        
        var doc = operation_doc(type,list_of_other);
        var pos = 1;
        for (i in doc){
            var pub = doc[i];
            
            // selecting tag
            var sel=["","","",""];
            sel[pub["meta:tags"]] = 'selected="selected"';
            
            // contructing table
            var item = '<tr class="'+id2color[pub["meta:tags"]]+'" id="tr_cont_'+pub["id"]+'">'+
                        '<td>'+pos+'</td>'+
                        '<td>'+pub["meta:iddoc"]+'</td>'+
                        '<td>'+pub["id"]+'</td>'+
                        '<td>'+pub["year"]+'</td>'+
                        '<td>'+pub["title"]+'</td>'+
                        '<td>'+pub["author"]+'</td>'+
                        '<td>'+
                            '<select class="trSelectChange" idd="'+pub["meta:iddoc"]+'" idc="'+pub["id"]+'">'+
                                    '<option '+sel[0]+' value="0">-</option>'+
                                    '<option '+sel[1]+'value="1">include</option>'+
                                    '<option '+sel[2]+'value="2">exclude</option>'+
                                    '<option '+sel[3]+'value="3">maybe</option>'+
                            '</select>'+
                        '<td>'+
                        '</td>'+
                        '<td>-</td>'+
                    '</tr>';
            $("#content_table").append(item);
            pos = pos +1 ;
        }
        
        
        apply_on_change_to_selects();
        show_with_out_filter();
        $('#modalDifference').modal("hide");
    }
    
    
    
    $("#modalDifference_1_0").click(function(){
        relationCalculation("1-0");
    });
    
    $("#modalDifference_1_1").click(function(){
        relationCalculation("1-1");
    });
    
    $("#modalDifference_0_1").click(function(){
        relationCalculation("0-1");
    });
    
    
    
    
    // --- downloading environment
    
    CreateEnvironment = function(){
        var doc = document.implementation.createDocument("", "", null);
        var envElem = doc.createElement("environment");
        var dumpElem = doc.createElement("dump");
        for (i in D){
            var d = D[i];
            console.log(d);
            
            var dumpItemElem = doc.createElement("dumpItem");
            dumpItemElem.setAttribute("id", i);
            dumpItemElem.setAttribute("fileName", d["fileName"]);
            dumpItemElem.setAttribute("type", d["type"]);
            dumpItemElem.setAttribute("name", d["name"]);
            dumpItemElem.setAttribute("searchQuery", d["searchQuery"]);
            dumpItemElem.setAttribute("dateUpload", d["dateUpload"]);
            dumpItemElem.setAttribute("timeUpload", d["timeUpload"]);
            dumpItemElem.setAttribute("length", d["length"]);
            dumpItemElem.setAttribute("description", d["description"]);
            
            
            var dumpItemRepitedElem = doc.createElement("dumpItemRepited");
            for (j in d["repited"]){
                var rp = d["repited"][j];
                var dumpItemRepitedElemItem = doc.createElement("dumpItemRepitedItem");
                dumpItemRepitedElemItem.setAttribute("key", j);
                dumpItemRepitedElemItem.setAttribute("value", rp);
                dumpItemRepitedElem.appendChild(dumpItemRepitedElemItem);
            }
            dumpItemElem.appendChild(dumpItemRepitedElem);
            
            var dumpItemTypeElem = doc.createElement("dumpItemType");
            for (j in d["typePubl"]){
                var tp = d["typePubl"][j];
                var dumpItemTypeElemItem = doc.createElement("dumpItemTypeItem");
                dumpItemTypeElemItem.setAttribute("key", j);
                dumpItemTypeElemItem.setAttribute("value", tp);
                dumpItemTypeElem.appendChild(dumpItemTypeElemItem);
            }
            dumpItemElem.appendChild(dumpItemTypeElem);
            
            var dumpContentElem = doc.createElement("dumpContent");  
            for (j in d["content"]){
                var content = d["content"][j];             
                var dumpItemContentElem = doc.createElement("dumpItemContent");              
                for (k in content){
                    var dumpItemContentElemItem = doc.createElement("dumpItemContentItem");  
                    console.log(["k:",k," content[k]:",content[k]]);
                    dumpItemContentElemItem.setAttribute("key", k);
                    dumpItemContentElemItem.setAttribute("value", content[k]);
                    dumpItemContentElem.appendChild(dumpItemContentElemItem);
                }
                dumpContentElem.appendChild(dumpItemContentElem);
            }
            dumpItemElem.appendChild(dumpContentElem);
            
            
            dumpElem.appendChild(dumpItemElem);
        }
        
        envElem.appendChild(dumpElem);
        doc.appendChild(envElem);
        
        /*var text = $("#inNotes").val();
        console.log(text);
        var noteElem = doc.createElement("notes");
        var newText = doc.createTextNode(text);
        noteElem.appendChild(newText);
        doc.appendChild(noteElem);*/
        
        var xml_str = '<?xml version="1.0" encoding="UTF-8"?>';
        var xml_body = new XMLSerializer().serializeToString(doc);
        return xml_str + xml_body;
    }
    
    
    
    $("#btn_download").click(function(){
        if ('Blob' in window) {
            BootstrapDialog.show({
                message: '<label for="filename_input" class="col-form-label">File Name:</label> ' +
                        '<input type="text" class="form-control espacioAbajo" id="filename_input" '+
                        'placeholder="Name of the file">',
                title: 'File Name Input',
                buttons: [{
                    label: 'Close',
                    action: function(dialog) {
                        dialog.close();
                    }
                }, {
                    label: 'Ok',
                    action: function(dialog) {
                        var fileName = $("#filename_input").val();
                        if (fileName) {
                            //var htmlText = $('#nifdoc').html();
                            //htmlText = replaceAll(htmlText,"&nbsp;"," ");
                            //var textToWrite = Encoder.htmlDecode(replaceAll(htmlText,"<br>","\n"));
                            textToWrite = CreateEnvironment();
                            var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
                            if ('msSaveOrOpenBlob' in navigator) {
                                navigator.msSaveOrOpenBlob(textFileAsBlob, fileName);
                            } else {
                                var downloadLink = document.createElement('a');
                                downloadLink.download = fileName;
                                downloadLink.innerHTML = 'Download File';
                                if ('webkitURL' in window) {
                                    // Chrome allows the link to be clicked without actually adding it to the DOM.
                                    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
                                } else {
                                    // Firefox requires the link to be added to the DOM before it can be clicked.
                                    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                                    downloadLink.onclick = function(){};
                                    downloadLink.style.display = 'none';
                                    document.body.appendChild(downloadLink);
                                }
                            downloadLink.click();
                            }
                        }
                        dialog.close();
                    }
                }]
            });
        
        } else {
        alert('Your browser does not support the HTML5 Blob.');
        }
    });
    
    
    
    ///-- uploading environment
    $("#btn_upload_environment").click(function(){
        typeInput = "env";
        $("#modalUpload").modal("show");
    });
    
    
    //see https://davidwalsh.name/convert-xml-json
    parseEnvInput = function(){
        D = {};
        var text = undefined;
        if (textFromUpload == undefined){
            text = $("#inDoc").val();
        } else{
          text = textFromUpload;
          textFromUpload = undefined;
        }
        
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(text,"text/xml");
        
        
        var dumpItem = xmlDoc.getElementsByTagName("dumpItem");
        console.log(["dumpItem",dumpItem]);
        console.log(["len:",dumpItem.length]);
        
        //for (di in dumpItem){
        //for (var di = 0; di < dumpItem.childNodes.length; di++){
        for (var di = 0; di < dumpItem.length; di++){
            //var dump = dumpItem.childNodes.item(di);
            var dump = dumpItem[di];
            console.log("--- new doc ---");
            
            newDoc = {};
            for (var j = 0; j < dump.attributes.length; j++) {
                var attribute = dump.attributes.item(j);
                newDoc[attribute.nodeName] = attribute.nodeValue;
            }
            console.log(["newDoc:",newDoc]);
            
            
            if (dump.hasChildNodes()) {
                for(var i = 0; i < dump.childNodes.length; i++) {
                    var item = dump.childNodes.item(i);
                    var nodeName = item.nodeName;
                    if (nodeName == "dumpItemRepited"){
                        if (item.hasChildNodes()) {
                            var rdic = {};
                            for(var j = 0; j < item.childNodes.length; j++) {
                                var rep = item.childNodes.item(j);
                                
                                var dd = {};
                                for (var k = 0; k < rep.attributes.length; k++) {
                                    var attribute = rep.attributes.item(k);
                                    dd[attribute.nodeName] = attribute.nodeValue;
                                }
                                var _k = dd["key"];
                                var _v = dd["value"];
                                rdic[parseInt(_k)] = parseInt(_v);
                                console.log(["_k:",_k]);
                                console.log(["_v:",_v]);
                            }
                            console.log(["rdic:",rdic]);
                            //alert("time");
                            newDoc["repited"] = rdic;
                        }                        
                    }
                    else if (nodeName == "dumpItemType"){
                        if (item.hasChildNodes()) {
                            var tdic = {};
                            for(var j = 0; j < item.childNodes.length; j++) {
                                var rep = item.childNodes.item(j);
                                
                                var dd = {};
                                for (var k = 0; k < rep.attributes.length; k++) {
                                    var attribute = rep.attributes.item(k);
                                    dd[attribute.nodeName] = attribute.nodeValue;
                                }
                                var _k = dd["key"];
                                var _v = dd["value"];
                                tdic[_k] = parseInt(_v);
                                console.log(["_k:",_k]);
                                console.log(["_v:",_v]);
                            }
                            console.log(["tdic:",tdic]);
                            //alert("time2");
                            newDoc["typePubl"] = tdic;
                        }
                    }
                    else if (nodeName == "dumpContent"){
                        var content = [];
                        if (item.hasChildNodes()) {
                            for(var j = 0; j < item.childNodes.length; j++) {
                                var rcont = item.childNodes.item(j);
                                P = {}
                                for(var k = 0; k < rcont.childNodes.length; k++) {
                                    var pub = rcont.childNodes.item(k);
                                    var dd = {};
                                    for (var t = 0; t < pub.attributes.length; t++) {
                                        var attribute = pub.attributes.item(t);
                                        dd[attribute.nodeName] = attribute.nodeValue;
                                    }
                                    var _k = dd["key"];
                                    var _v = dd["value"];
                                    P[_k] = _v;
                                    console.log(["_k:",_k]);
                                    console.log(["_v:",_v]);
                                    //alert("time3");
                                }
                                console.log(["P:",P]);
                                content.push(P);
                            }
                            
                        }
                        newDoc["content"] = content;
                    }
                }
            } 
            console.log(newDoc);
            D[newDoc["id"]] = newDoc;
        }
        updateMainTable();
    }
    
    
    // ---- modal details
    docEditId = 0;
    $(document).on('click', '.btnEdit', function () {
        docEditId = $(this).attr("idd");
        doc = D[docEditId];
        console.log(["D[name]",doc["name"]]);
        $("#inNameEdit").val(doc["name"]);
        $("#inDescriptionEdit").val(doc["description"]);
        $("#inQueryEdit").val(doc["searchQuery"]);
        
        $("#modalEdit").modal("show");
        
    });
    
    //$("#btnEditModify").click(function(){
    $(document).on('click', '#btnEditModify', function () {
        console.log("here");
        var doc = D[docEditId];
        
        doc["name"] = $("#inNameEdit").val(); if (doc["name"] == undefined){doc["name"] = "";}
        doc["description"] = $("#inDescriptionEdit").val(); if (doc["description"] == undefined){doc["description"] = "";}
        doc["searchQuery"] = $("#inQueryEdit").val(); if (doc["searchQuery"] == undefined){doc["searchQuery"] = "";}
        updateMainTable();
    });
    
    
    /// -- btn delete
    $(document).on('click', '.btnDelete', function () {
        var idd = $(this).attr("idd");        
        
        BootstrapDialog.show({
            title: 'Erasing document',
            message: 'Are you sure you want to delete the document number '+idd+'?',
            buttons: [{
                cssClass: 'btn-primary',
                label: 'Yes',
                action: function(dialog) {
                    //--
                    delete D[idd];
                    updateMainTable();
                    dialog.close();
                }
            }, {
                label: 'No',
                action: function(dialog) {
                    dialog.close();
                }
            }]
        });
        
        
    });
    
    
});



















