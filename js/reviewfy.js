$(document).ready(function() {
    
    D = {}; // Datos de los documentos, ejemplo:
    //D =  {1: {"fileName":"abc.csv", "type":"ACM", "name":"Henry","searchQuery":"..", "dateUpload":"2018-03-02", "timeUpload":"10:30am", "repited":{"1":12, "2":3}, "typePubl":{"articles":2, "procedings":4}, "length":50, "description":"ABABAB", "content":["id"]} };
    // In order tounify the input script, first words of the columns
    Head = {"ACM":'"type","id","author"'};
    Head = {"IEEE":'"Document Title",Authors,"Author Affiliations"'};
    //alowing publications
    Allow = {"ACM":{"article":0}};
    
    // My Names of the fields
    invMap = {"ACM": { 0: "type",
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
                
                 },
               "IEEE":{
                    100: "id", // autonumeric
                    1: "author",
                    0: "title",
                    16:"keywords",
                    13:"doi",
                    26:"issue_date",
                    6: "volume",
                    7: "issue_no", // issue
                    5:"year",
                    11:"issn",
                    3:"booktitle", // booktitle
                    12:"isbn",
                    28:"publisher"
               },
               "Springer":{
                    0:"title",
                    1:"booktitle",
                    3:"volume",
                    4:"issue_no",
                    5:"doi",
                    6:"author",
                    7:"year",
                    8:"url",
                    9:"type",
                    100:"id"
               }
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
                    "publisher_loc" : 26
        
           },
            
           "IEEE":{
                    "type" : -1,
                    "id" : 100, // autonumeric
                    "author" : 1,
                    "editor" : -1,
                    "advisor" : -1,
                    "note" : -1,
                    "title" : 0,
                    "pages" : -1,
                    "article_no" : -1,
                    "num_pages" : -1,
                    "keywords" : 16,
                    "doi" : 13,
                    "journal" : -1,
                    "issue_date" : 26,
                    "volume" : 6,
                    "issue_no" : 7, // issue
                    "description": -1,
                    "month" : -1,
                    "year" : 5,
                    "issn": 11,
                    "booktitle" : 3, // booktitle
                    "acronym" : -1,
                    "edition" : -1,
                    "isbn" : 12,
                    "conf_loc" : -1,
                    "publisher" : 28,
                    "publisher_loc" : -1               
           },
           "Springer":{
                    "title":0,
                    "booktitle":1,
                    "volume":3,
                    "issue_no":4,
                    "doi":5,
                    "author":6,
                    "year":7,
                    "url":8,
                    "type":9,
                    "id":100
               }
      }
    
    // Global because I specify in the clic-time the kind of library: ACM, IEEE, etc
    newDoc = {};
    // to filtering
    filterList = [];
    column_filtered = "";
    // for BibTex
    type2bibtexchr = {
        "ACM":{"start":'{', "end":'}'},
        "SCD":{"start":'"', "end":'"'},
    };
    
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

   
   
   type2color = {
       "ACM": "primary",
       "IEEE": "success",
       "SCD": "warning",
       "Springer": "info",
       "CMP": "default"
   };
   
   updateMainTable = function(){
       $("#doc_table").empty();
       
       var html_table = '<thead>'+
        '<tr>'+
            '<th scope="col" style="width: 50px;">Lib.</th>'+
            '<th scope="col" style="width: 50px;">Dump</th>'+
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
           var ttt = '<span class="label label-'+type2color[d["type"]]+'">'+d["type"]+'</span>';
           var actions =  '<button class="btn btn-secondary btnEdit" type="button" idd="'+i+'" data-toggle="tooltip" title="Edit the data of this dump"><i class="glyphicon glyphicon-edit"></i></button>';
           actions = actions + '<button class="btn btn-secondary btnDetails" type="button" idd="'+i+'" data-toggle="tooltip" title="Details"><i class="glyphicon glyphicon-th"></i></button>';
           
           actions = actions + '<button class="btn btn-secondary btnDelete" type="button" idd="'+i+'" data-toggle="tooltip" title="Delete this document"><i class="glyphicon glyphicon-erase"></i></button>';
           
           actions = actions + '<button class="btn btn-secondary btnDifference" type="button" idd="'+i+'" data-toggle="tooltip" title="Difference with respect others dumps"><i class="glyphicon glyphicon-transfer"></i></button>';
           
           if (d["type"] != "SCD"){
                actions = actions + '<button class="btn btn-secondary btnDownloadAbstract" type="button" idd="'+i+'" data-toggle="tooltip" title="Get the abstract from the publisher"><i class="glyphicon glyphicon-import"></i></button>';
           }
           
           actions = actions + '<button class="btn btn-secondary btnSearch" type="button" idd="'+i+'" data-toggle="tooltip" title="Display Content"><i class="glyphicon glyphicon-pushpin"></i></button>';
           
           $("#doc_table").append('<tr id="tr'+i+'"><td>'+ttt+'</td><td>'+i+'</td><td>'+d["dateUpload"]+'</th><td>'+d["timeUpload"]+'</td><td>'+d["length"]+'</td><td>'+d["name"]+'</td><td>'+d["description"]+'</td><td>'+d["searchQuery"]+'</td><td style="text-align:right">'+actions+'</td></tr>');
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
                if (typeFile == "CSV"){
                    parseTextInputCSV();
                }
                else{
                    parseTextInputBibTex();
                }
                
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

    
    /*max = function(A){
        var mmax = A[0];
        for (i in A){
            a = A[i];
            if (mmax < a){
                mmax = 
            }
        }
    }*/

    textFromUpload = undefined;
    typeFile = "";
    parseTextInputCSV = function(){
        var text = undefined;
        if (textFromUpload == undefined){
            text = $("#inDoc").val();
        } else{
          text = textFromUpload;
          textFromUpload = undefined;
        }
        
        // in the case of automatic identifier needed
        var randd = parseInt(Math.random()*10000);
        var randd_ = randd.toString();
        
        
        //meta-data
        var dname = $("#inName").val();if (dname == undefined){dname = "";}
        var ddescription = $("#inDescription").val();if (ddescription == undefined){ddescription = "";}
        var dquery = $("#inQuery").val();if (dquery == undefined){dquery = "";}
        
        newDoc["name"] = dname;
        newDoc["description"] = ddescription;
        newDoc["searchQuery"] = dquery;
        var M = Map[newDoc["type"]];
        var iM = invMap[newDoc["type"]];
        var A = Allow[newDoc["type"]];
        
        // parsing
        var Rr = {}; // couting the repetitions
        var Rt = {}; // counting by type
        var L = text.split("\n");
        var first = true;
        var cant = 0;
        //var newidDoc = Object.keys(D).length+1;
        //console.log(["Keys:",Object.keys(D)]);
        //console.log(["max:",_max(Object.keys(D))]);
        var Akey = Object.keys(D);
        var newidDoc = 1;
        if (Akey.length != 0){
            newidDoc = parseInt(Akey[Akey.length-1])+1;
        }
        
        for (i in L){
            var l = L[i];
            if (trim_1(l) == ""){continue;}
            if (first){  // first line have the columns names
                if (l.indexOf(Head[newDoc["type"]]) != -1){
                    console.log("saltando..");
                    continue; 
                }
            }
            
            var H = l.split('","');
            // seeing the type of publication
            if (A != undefined){
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
            }
            
            //seeing if it repeated 
            if (M["id"] < 100){
                var pid = trim_1(H[M["id"]]);
                if (pid in Rr){
                    Rr[pid] = Rr[pid] + 1;
                    continue; 
                }
                else{
                    Rr[pid] = 1;
                }
            }
            
            //
            var newPub = {};  
            for (j in H){
                h = trim_1(H[j]);
                var k = M[iM[j]];
                if (k != -1){
                    newPub[iM[j]] = h;                    
                }
            }
            
            //if there is autonumeric
            if (100 in iM){
                var cc = cant+100001;                
                newPub[iM[100]] = randd_.concat(cc.toString());
            }
            
            newPub["meta:tags"] = 0; // etiqueta por las que se filtra
            newPub["meta:iddoc"] = newidDoc;
            newDoc["content"].push(newPub);
            /*  NO BORRAR ----
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
            newDoc["content"].splice(pp, 0, newPub);*/
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
        allowedFileExtensions: ["csv","xml","bib"]
        //uploadUrl: '/site/file-upload-single'
    });


    typeInput = "";
    $("#btn_upload_ACM").click(function(){
        typeFile = "CSV";
        newDoc = {"fileName":"-", "type":"ACM", "name":"-","searchQuery":"-", "dateUpload":"-", "timeUpload":"-", "repited":{}, "typePubl":{}, "length":0, "description":"-", "content":[]};
        typeInput = "dump";
        $("#modalUpload").modal("show");
    });
    
    
    $("#btn_upload_IEEE").click(function(){
        typeFile = "CSV";
        newDoc = {"fileName":"-", "type":"IEEE", "name":"-","searchQuery":"-", "dateUpload":"-", "timeUpload":"-", "repited":{}, "typePubl":{}, "length":0, "description":"-", "content":[]};
        typeInput = "dump";
        $("#modalUpload").modal("show");
    });
    
    
    $("#btn_upload_Springer").click(function(){
        typeFile = "CSV";
        newDoc = {"fileName":"-", "type":"Springer", "name":"-","searchQuery":"-", "dateUpload":"-", "timeUpload":"-", "repited":{}, "typePubl":{}, "length":0, "description":"-", "content":[]};
        typeInput = "dump";
        $("#modalUpload").modal("show");
    });
    
    

    // ---- modal details
    $(document).on('click', '.btnDetails', function () {
        
        //--------
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
        
        //show_with_filter();
        clearFilter();
        clearFilterText();
        
        $("#textFilter").val("");
        column_filtered = "";
        
        showContent();
        
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
            pub = CAST(doc["content"][i]);
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
                //console.log(["l:",l,'l["text"]:',l["text"],'tag2color[l["text"]]:',tag2color[l["text"]]]);
                $("#tr_cont_"+idc).removeClass(tag2color[l["text"]]);
            }
            
            $("#tr_cont_"+idc).addClass(id2color[$(this).val()]);
            
            //updating tag in memory
            var idd = $(this).attr("idd");
            var pub = getPub(idd,idc);
            pub["meta:tags"] = $(this).val();
        });
    }
    
    
    // I'm including the the comparison  as document, but I just store the references to the publication to avoid duplicity and save space in memory.
    // So, some documents going to have real, and other references data. Here I unify the access to this publication
    CAST = function(_pub){
        if ("meta:ref_idd" in _pub){
            var _iddoc = _pub["meta:ref_idd"];
            var _idp = _pub["meta:ref_idp"];
            var _index  = idpub2index(_iddoc,_idp);
            if (_index == -1){
                return _pub;
            }
            return D[_iddoc]["content"][_index];
        }
        return _pub;
    }
    
    CAST_idd_index = function(idd,index){
        var __pub = D[idd]["content"][index];
        if ("meta:ref_idd" in __pub){
            var _iddoc = _pub["meta:ref_idd"];
            var _idp = _pub["meta:ref_idp"];
            var _index  = idpub2index(_iddoc,_idp);
            if (_index == -1){
                return [_idp,_index];
            }
        }
        return [idd,index];
    }
    
    
    columnsListDisplay = []
    showContent = function(){
        show_with_filter();
        var idd = activeDoc;
        $("#content_table").empty();
        
        var html_table = '<thead>'+
            '<tr>'+
                '<th scope="col" style="width: 50px;">#</th>'+
                //'<th scope="col" style="width: 150px;">ID</th>'+
                '<th scope="col" style="width: 50px;">Year</th>'+
                '<th scope="col">Title</th>'+
                '<th width="15%" scope="col">Authors</th>'+
                '<th scope="col">Abstract</th>'+
                '<th scope="col">Comments</th>'+
                '<th scope="col">Tags</th>'+
                '<th scope="col"></th> '+
            '</tr>'+
        '</thead>'+
        '<tbody>'+
        '</tbody>';
            
        
        $("#content_table").html(html_table);
        
        var doc = D[idd];
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
            var pub = CAST(doc["content"][i]);
            var pub_r = doc["content"][i];

            
            // filtering
            if (filterList.length != 0){
                if (esta_en(Lfilter,pub["meta:tags"])==false){continue;}
            }
            if (column_filtered!=""){
                //alert("here "+column_filtered);
                if (!("meta:filter" in pub_r)){
                    continue;
                }
            }
            
            // selecting tag
            var sel=["","","",""];
            sel[pub["meta:tags"]] = 'selected="selected"';
            
            
            
            // contructing table
            var actions =  '<button class="btn btn-secondary btnDetailsPub" type="button" idd="'+pub["meta:iddoc"]+'" idp="'+pub["id"]+'" data-toggle="tooltip" title="Details of this publication"><i class="glyphicon glyphicon-th"></i></button>'+ 
            
            (("meta:final_doi" in pub)? '<button class="btn btn-secondary" type="button" onclick="window.open(\''+pub["meta:final_doi"]+'\',\'_blank\')" data-toggle="tooltip" title="Details of this publication"><i class="glyphicon glyphicon-link"></i></button>':'')+
            
            '<button class="btn btn-secondary btnDeletePub" type="button" idd="'+pub["meta:iddoc"]+'" idp="'+pub["id"]+'" data-toggle="tooltip" title="Delete this publication"><i class="glyphicon glyphicon-trash"></i></button>' +
            
            '<button class="btn btn-secondary btnCommentPub" type="button" idd="'+pub["meta:iddoc"]+'" idp="'+pub["id"]+'" data-toggle="tooltip" title="Add/Edit the comments"><i class="glyphicon glyphicon-comment"></i></button>';
            
            
            var _year   = pub["year"];
            if (column_filtered == "year"){
                _year = pub_r["meta:filter"];
            }
            
            var _title  = pub["title"];
            if (column_filtered == "title"){
                _title = pub_r["meta:filter"];
            }
            
            var _author  = pub["author"];
            if (column_filtered == "author"){
                _author = pub_r["meta:filter"];
            }
            
            var _abstract  = "";
            if (pub["abstract"] != undefined){
                _abstract = pub["abstract"];
                if (column_filtered == "abstract"){
                    _abstract = pub_r["meta:filter"];
                }
            }
            
            var _comment = "";
            if ("meta:comment" in pub){
                _comment  = pub["meta:comment"];
                if (column_filtered == "meta:comment"){
                    _comment = pub_r["meta:filter"];
                }
            }
            

            $("#content_table").append('<tr class="'+id2color[pub["meta:tags"]]+'" id="tr_cont_'+pub["id"]+'">'+
                        '<td>'+pos+'</td>'+
                        //'<td>'+pub["id"]+'</td>'+
                        '<td>'+_year+'</td>'+
                        '<td>'+_title+'</td>'+
                        '<td>'+_author+'</td>'+
                        '<td>'+_abstract+'</td>'+
                        '<td>'+_comment+'</td>'+
                        '<td>'+
                            '<select class="trSelectChange" idd="'+activeDoc+'" idc="'+pub["id"]+'">'+
                                    '<option '+sel[0]+' value="0">-</option>'+
                                    '<option '+sel[1]+' value="1">include</option>'+
                                    '<option '+sel[2]+' value="2">exclude</option>'+
                                    '<option '+sel[3]+' value="3">maybe</option>'+
                            '</select>'+
                        '</td>'+
                        '<td style="text-align:right">'+actions+'</td>'+
                    '</tr>');
            pos = pos +1 ;
        }
        //$("#spanDocName").html("("+doc["length"]+") Showing: "+doc["name"]);
        var pos_l = pos-1;
        $("#spanDocName").html("("+pos_l+") Showing: #"+idd+" "+doc["name"]);
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
                '<th scope="col">Dump</th>'+
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
           var ttt = '<span class="label label-'+type2color[d["type"]]+'">'+d["type"]+'</span>';
           $("#difference_choose_table").append('<tr><td>'+ttt+' '+i+'</td>'+
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
    
    
    
    createSetbyDoc = function(idd){
        var S = new Set();
        console.log(["idd:",idd]);
        for (v in D[idd]["content"]){
            var pub = D[idd]["content"][v];
            S.add(pub["id"]);
        }
        return S;
    }
    
    
    setIntersection = function(s1,s2){
        return new Set([...s1].filter(x => s2.has(x))); 
    }
    
    
    // This return a copy of the publications, each of them has a identifier of the corresponding document
    operation_doc = function(type, list_of_other){
        var doc = D[targetDoc];
        var attr = $("#selectModalDiff").val();
        console.log(attr);
        
        // contructing super set of others
        var So = new Set();
        if (type != "1*-1*"){
            //console.log("here");
            for (x in list_of_other){
                xdoc = D[list_of_other[x]];
                for (y in xdoc["content"]){
                    ypub = CAST(xdoc["content"][y]);
                    if (ypub[attr] != ""){
                        So.add(ypub[attr]);                        
                    }
                }
            }            
        }
        
        
        IDs = []
        if (type == "1-0"){
            for (y in doc["content"]){
                ypub = CAST(doc["content"][y]);
                if (ypub[attr]!="" && So.has(ypub[attr]) == false){
                    IDs.push(ypub);
                }
            }
        }
        else if (type == "1-1"){  // intersection of the target with the union of the others
           for (y in doc["content"]){
                ypub = CAST(doc["content"][y]);
                if (ypub[attr]!="" && So.has(ypub[attr]) == true){
                    IDs.push(ypub);
                }
            } 
        }
        else if (type == "1*-1*"){ // this is the intersection of the  dumps separately
           console.log("here");
           var S_target = createSetbyDoc(targetDoc);           
           for (x in list_of_other){
                var xdoc = list_of_other[x];
                var s = createSetbyDoc(xdoc);
                S_target = setIntersection(S_target,s);
                console.log(["iterseccion:",S_target]);
            }   
            
            var already = new Set();
            var L = list_of_other.concat([targetDoc]);
            console.log(["L:",L]);
            for (ix in L){
                var xdoc = L[ix];
                console.log(["xdoc:",xdoc]);
                for (y in D[xdoc]["content"]){
                    ypub = CAST(D[xdoc]["content"][y]);
                    if (ypub[attr]!="" && S_target.has(ypub[attr]) && !(already.has(ypub[attr]))){
                        IDs.push(ypub);
                        already.add(ypub[attr]);
                    }
                }
            }            
        }
        else if (type == "0-1"){
            var S = new Set();
            for (y in doc["content"]){
                ypub = CAST(doc["content"][y]);
                if (ypub[attr]!=""){
                    S.add(ypub[attr]);                    
                }
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
    
    
    
    countNum = function(typedoc){
        var count = 1;
        for (var tt1 in D){
            var _doc = D[tt1];
            if (_doc["type"] == typedoc){
                count = count + 1;
            }
        }
        return count;
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
        
        
        /*
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
        
        pos = pos - 1;
        $("#spanDocName").html("("+pos+") Comparison "+type+"| source:"+targetDoc+"  |against:"+other_str);
        apply_on_change_to_selects();
        show_with_out_filter();
        */
        
        
        var doc = operation_doc(type,list_of_other);
        //{1: {"fileName":"abc.csv", "type":"ACM", "name":"Henry","searchQuery":"..", "dateUpload":"2018-03-02", "timeUpload":"10:30am", "repited":{"1":12, "2":3}, "typePubl":{"articles":2, "procedings":4}, "length":50, "description":"ABABAB", "content":["id"]} };        

        var num_cmp = countNum("CMP");
        newDoc = {"fileName":"-", "type":"CMP", "name":"Comparison #"+num_cmp,"searchQuery":"-", "dateUpload":"-", "timeUpload":"-", "repited":{}, "typePubl":{}, "length":doc.length, "description":"", "content":[]};
        newDoc["timeUpload"]= new Date().toLocaleTimeString();
        newDoc["dateUpload"]= new Date().toLocaleDateString();
        newDoc["searchQuery"] = "("+doc.length+") Comparison "+type+"| source:"+targetDoc+"  |against:"+other_str;
        
        for (o in doc){
            var pub = doc[o];
            newDoc["content"].push({
                "meta:ref_idd":pub["meta:iddoc"],
                "meta:ref_idp":pub["id"]                
            });
        }
        
        var Akey = Object.keys(D);
        var newidDoc = 1;
        if (Akey.length != 0){
            newidDoc = parseInt(Akey[Akey.length-1])+1;
        }
        
        console.log(["newidDoc:",newidDoc]);
        D[newidDoc] = newDoc;
        activeDoc = newidDoc;
        
        //update Content table
        showContent();
        
        // hide the modal
        $('#modalDifference').modal("hide");
        
        //Update main table
        updateMainTable();
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
    
    $("#modalDifference_1_1_").click(function(){
        relationCalculation("1*-1*");
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
        //console.log(["dumpItem",dumpItem]);
        //console.log(["len:",dumpItem.length]);
        
        //for (di in dumpItem){
        //for (var di = 0; di < dumpItem.childNodes.length; di++){
        for (var di = 0; di < dumpItem.length; di++){
            //var dump = dumpItem.childNodes.item(di);
            var dump = dumpItem[di];
            //console.log("--- new doc ---");
            
            newDoc = {};
            for (var j = 0; j < dump.attributes.length; j++) {
                var attribute = dump.attributes.item(j);
                newDoc[attribute.nodeName] = attribute.nodeValue;
            }
            //console.log(["newDoc:",newDoc]);
            
            
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
                                //console.log(["_k:",_k]);
                                //console.log(["_v:",_v]);
                            }
                            //console.log(["rdic:",rdic]);
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
                                //console.log(["_k:",_k]);
                                //console.log(["_v:",_v]);
                            }
                            //console.log(["tdic:",tdic]);
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
                                    //console.log(["_k:",_k]);
                                    //console.log(["_v:",_v]);
                                    //alert("time3");
                                }
                                //console.log(["P:",P]);
                                content.push(P);
                            }
                            
                        }
                        newDoc["content"] = content;
                    }
                }
            } 
            //console.log(newDoc);
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
                    unreferencing(idd);
                    delete D[idd];
                    updateMainTable();
                    hide_all();
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
    

    
    ///--- details of publication
    strip_doble_point = function(v){
        return replaceAll(v,":","-0000-");
    }
    
    //-
    $(document).on('click', '.btnDetailsPub', function () {
        var idp = $(this).attr("idp");
        var idd = $(this).attr("idd");
        
        
        $("#fields_table").empty();
        
        var html_table = '<thead>'+
            '<tr>'+
                '<th scope="col">Key</th>'+
                '<th scope="col">Value</th>'+
                '<th scope="col"></th>'+
            '</tr>'+
        '</thead>'+
        '<tbody>'+
        '</tbody>';
            
   
        $("#fields_table").html(html_table);
        var idd = $(this).attr("idd");
        var doc = D[idd];
        console.log(["doc",doc]);
        for (i in D[idd]["content"]){
            var pub = D[idd]["content"][i];
            
            if (pub["id"] == idp){
                for (k in pub){
                    var h  = pub[k];
                    var action = '<button class="btn btn-secondary btnEditDetailPublication" type="button" indexp="'+i+'" idd="'+idd+'" idkey="'+strip_doble_point(k)+'" data-toggle="tooltip" title="Edit this field!"><i class="glyphicon glyphicon-edit"></i></button>';

                    $("#fields_table").append('<tr><td id="detail_k-'+strip_doble_point(k)+'" class="text-primary">'+k+'</td><td class="text-primary" id="detail_v-'+strip_doble_point(k)+'">'+h+'</td><td id="detail_btn-'+strip_doble_point(k)+'">'+action+'</td></tr>');
                }
                
                $("#btnNewDetailPublication").attr("indexp",i);
                $("#btnNewDetailPublication").attr("idd",idd);
            }
        }
        
        $("#modalPublication").modal("show");
        
        
    });
    
    
    /// ----- Comment of the publication
    idpub2index = function(idd,idp){
        if (!(idd in D)){
            return -1;
        }
        
        for (ii in D[idd]["content"]){
            var pub = D[idd]["content"][ii];
            if (pub["id"] == idp){
                return ii;
            }
        }
        return -1;
    }
    
    $(document).on('click', '.btnCommentPub', function () {
        var idp = $(this).attr("idp");
        var idd = $(this).attr("idd");
        
        var current_comment = "";
        var _index = idpub2index(idd,idp);
        var pub = D[idd]["content"][_index];
        if ("meta:comment" in pub){
            current_comment = pub["meta:comment"];
        }
        
        $("#modalCommentInput").attr("idd",idd);
        $("#modalCommentInput").attr("index",_index);
        $("#modalCommentInput").val(current_comment);  
        $('#modalComment').on('shown.bs.modal', function () {
            $("#modalCommentInput").focus();
        });
        $("#modalComment").modal("show");
        
    });
    
    
    $("#modalComment_upload").click(function(){
        var idd = $("#modalCommentInput").attr("idd");
        var _index = $("#modalCommentInput").attr("index");
        
        var current_comment = $("#modalCommentInput").val();
        if (current_comment!=undefined && current_comment.length >0){
           D[idd]["content"][_index]["meta:comment"] = current_comment;
        }
        showContent();
    });
    
    
    
    
    
    /// ---- upload bibtex
    
    $("#btn_upload_SCD").click(function(){
        typeFile = "BibTex";
        newDoc = {"fileName":"-", "type":"SCD", "name":"-","searchQuery":"-", "dateUpload":"-", "timeUpload":"-", "repited":{}, "typePubl":{}, "length":0, "description":"-", "content":[]};
        typeInput = "dump";
        $("#modalUpload").modal("show");
    });
    
    
    textBetween = function(txt,ch1,ch2){
        if (txt.length == 0){return "";}
        var ppi = 0;
        var found = false;
        var begin = false;
        if (ch1 == "\n"){  // if the start char is \n then start the text from the beggining
            begin = true;
        }
        var ss = "";
        while (!found && ppi < txt.length){
            if (begin==false && txt[ppi] == ch1){
                begin = true;
            }
            else if (begin==true){
                if (txt[ppi] == ch2){
                    return ss;
                }
                ss = ss.concat(txt[ppi]);
            }
            ppi = ppi +1;
        }
        return ss;
    }
    
    parseTextInputBibTex = function(){
        var text = undefined;
        if (textFromUpload == undefined){
            text = $("#inDoc").val();
        } else{
          text = textFromUpload;
          textFromUpload = undefined;
        }
        
        // in the case of automatic identifier needed
        var randd = parseInt(Math.random()*10000);
        var randd_ = randd.toString();
        
        
        //meta-data
        var dname = $("#inName").val();if (dname == undefined){dname = "";}
        var ddescription = $("#inDescription").val();if (ddescription == undefined){ddescription = "";}
        var dquery = $("#inQuery").val();if (dquery == undefined){dquery = "";}
        
        newDoc["name"] = dname;
        newDoc["description"] = ddescription;
        newDoc["searchQuery"] = dquery;
        var T = type2bibtexchr[newDoc["type"]];
        console.log(["T:",T]);
        //
        var Rt = {}; // counting by type
        
        // parsing
        var L = text.split("\n");
        var cant = 0;
        //console.log(["Keys:",Object.keys(D)]);
        //console.log(["max:",_max(Object.keys(D))]);
        //var newidDoc = _max(Object.keys(D))+1;
        var Akey = Object.keys(D);
        var newidDoc = 1;
        if (Akey.length != 0){
            newidDoc = parseInt(Akey[Akey.length-1])+1;
        }
        var newPub = {};
        var satus = 0;
        var globalKey = "";
        var globalValue = "";
        for (i in L){
            var l = L[i];//trim_1(L[i]);
            if (trim_1(l) == ""){continue;}
            if (status == 0){  // only one line              
                
                //start publication
                if (l[0] == "@"){                
                    var ptype =  textBetween(l,"@","{");
                    newPub = {"type":ptype};               
                    if (ptype in Rt){
                        Rt[ptype] = Rt[ptype] + 1;                
                    }
                    else{
                        Rt[ptype] = 1;
                    }
                }
                else if (l == "}"){  // ---- end of the publication
                    //if there is autonumeric
                    var cc = cant+100001;                
                    newPub["id"] = randd_.concat(cc.toString());
                    
                    
                    newPub["meta:tags"] = 0; // etiqueta por las que se filtra
                    newPub["meta:iddoc"] = newidDoc;
                    newDoc["content"].push(newPub);
                    globalValue = "";
                    cant = cant + 1;
                }
                else{  // into the publication data
                    var key = trim_1(textBetween(l,"\n","="));
                    var val = textBetween(l,T["start"],T["end"]);
                    //console.log(["key:",key,"  val:",val]);
                    var l_rest = l.substring(l.indexOf(T["start"])+1,l.length+1);
                    if (l_rest.indexOf(T["end"]) == -1){
                        status = 1;
                        globalKey = key;
                        globalValue = globalValue + val;
                    }
                    else{                        
                        newPub[key] = trim_1(val);
                    }
                }
            }
            else{
                // long fields such as the abstract that have more than one line
                if (l.indexOf(T["end"]) == -1){
                    var val = textBetween(l,"\n",T["end"]);
                    globalValue = globalValue + "<br>" +trim_1(val);
                }
                else{         
                    newPub[globalKey] = trim_1(globalValue);
                    status = 0;
                }
            }
        }
        
        newDoc["fileName"] = tempFileInput;
        newDoc["timeUpload"]= new Date().toLocaleTimeString();
        newDoc["dateUpload"]= new Date().toLocaleDateString();
        //newDoc["repited"] = invert_counting(Rr);
        newDoc["typePubl"] = jQuery.extend({}, Rt);
        newDoc["length"] = cant;
        D[newidDoc] = newDoc;

       //Update table
       updateMainTable();
    }
    
    
    //---- 
    // This method is used when yoy have comparison with publication referencing to others (to save space in RAM), and then you wants to eliminate the source document,
    // Here, we put a copy of each publication of the document in process of deleting in the comparison document.
    unreferencing = function(_idd){
        for (var tt in D){
            var _d = D[tt];
            if (tt == _idd){
                continue;                
            }
            
            if (_d["type"] == "CMP"){
                for (var ll in _d["content"]){
                    var _p = _d["content"][ll];
                    if ("meta:ref_idd" in _p){
                        var _iddoc = _p["meta:ref_idd"];                
                        if (_iddoc == _idd){
                            var _idp = _p["meta:ref_idp"];
                            var _ind  = idpub2index(_iddoc,_idp);
                            D[tt]["content"][ll] = D[_idd]["content"][_ind];
                        }
                        
                    }
                }                
            }
        }
    }
    
    
    unreferencing_pub = function(_idd,_idp){
        for (var tt in D){
            var _d = D[tt];
            if (tt == _idd){
                continue;                
            }
            
            if (_d["type"] == "CMP"){
                for (var ll in _d["content"]){
                    var _p = _d["content"][ll];
                    if ("meta:ref_idd" in _p){
                        var _iddoc = _p["meta:ref_idd"];
                        var _idpub = _p["meta:ref_idp"];
                        if (_iddoc == _idd && _idpub==_idp){
                            var _idp = _p["meta:ref_idp"];
                            var _ind  = idpub2index(_iddoc,_idp);
                            D[tt]["content"][ll] = D[_idd]["content"][_ind];
                        }
                        
                    }
                }                
            }
        }
    }
    
    
    
    ////--- downloading the abstracts
    
    //-- 
    finalDoi = function(type_doc,pub){
        if ((type_doc == "ACM"||type_doc == "IEEE"||type_doc == "Springer") && "doi" in pub && pub["doi"]!=undefined && pub["doi"].length!=0){
            return "https://doi.org/"+pub["doi"]; 
        }
        return "";
    }
    
    //
    add_abstract_to_pub = function(idd,_index,response){
        try { 
            var json_response = JSON.parse(trim_1(response));
            if ("error" in json_response){
                //warning_alert("Error: " + json_response["error"]);
                console.log("--> Error: " + json_response["error"]);
            }
            else{
                D[idd]["content"][_index]["abstract"] = json_response["response"];
            }
        }
        catch(err) {
            console.log(["response:",response]);
            console.log("==> Error Parsing Abstrct: " + err);
        }
    }
    
    //-
    update_block_caption = function(id_div,progress,total){
        var porc = parseInt((progress*100)/total);
        $("#"+id_div).html("Progress: "+porc+"%");
    }
    
    //--
    sincronism_ajax = function(current_iddoc,current_index){
        if (current_index == D[current_iddoc]["content"].length){
            if (current_iddoc == activeDoc){
                showContent();
            }
            $.unblockUI();
        }
        else{
            //var pub = CAST(D[idd]["content"][i]);
            var ccast = CAST_idd_index(current_iddoc,current_index);
            var o_iddoc = ccast[0];
            var o_idpub = ccast[1];
            var pub = D[o_iddoc]["content"][o_idpub];
            
            var doi = finalDoi(D[o_iddoc]["type"], pub);
            if (doi != ""){
                update_block_caption('downloading_abstracts',current_index,D[current_iddoc]["content"].length);
                D[o_iddoc]["content"][o_idpub]["meta:final_doi"] = doi;
                if (!("abstract" in pub) || (pub["abstract"] == undefined || pub["abstract"] == "")){
                    $.ajax({
                        //data:params,
                        data:{"values":{
                            "doi":doi,
                            "library":D[o_iddoc]["type"]
                        }},
                        url: 'gettingabstracts.php',
                        type: 'POST',
                        dataType: "html",
                        beforeSend: function(){},
                        success: function(response){
                            //console.log(["response:",response]);
                            add_abstract_to_pub(current_iddoc,current_index,response);                    
                            sincronism_ajax(current_iddoc,current_index+1);
                        },
                        error: function(response){
                            //warning_alert("There were errors in the system API");
                            //$.unblockUI();
                            //return false;
                            sincronism_ajax(current_iddoc,current_index+1);
                        }
                    });
                }
                else{
                    sincronism_ajax(current_iddoc,current_index+1);
                }
            }
            else{
                sincronism_ajax(current_iddoc,current_index+1);
            }
        }        
    }
    
    //--
    $(document).on('click', '.btnDownloadAbstract', function () {
        var idd = $(this).attr("idd");
        BootstrapDialog.show({
            title: 'Gettings the abstracts',
            message: 'Are you sure? This action can take a long time.',
            buttons: [{
                cssClass: 'btn-primary',
                label: 'Yes',
                action: function(dialog) {
                    //-                    
                    //$.blockUI({ message: null });
                    $.blockUI( {
                            message: '<div id="downloading_abstracts">Progreso: 0%</div>',
                            css: { 
                                border: 'none', 
                                padding: '15px', 
                                backgroundColor: '#000', 
                                '-webkit-border-radius': '10px', 
                                '-moz-border-radius': '10px', 
                                opacity: .5, 
                                color: '#fff' 
                            }
                        }
                    );
                    sincronism_ajax(idd,0);
                    //-
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
    
    
    ///-- Deleting a publication
    deleting_referencing_pub = function(_idd,_idp){
        for (var tt in D){
            var _d = D[tt];
            if (tt == _idd){
                continue;                
            }
            
            if (_d["type"] == "CMP"){
                for (var ll in _d["content"]){
                    var _p = _d["content"][ll];
                    if ("meta:ref_idd" in _p){
                        var _iddoc = _p["meta:ref_idd"];
                        var _idpub = _p["meta:ref_idp"];
                        if (_iddoc == _idd && _idpub==_idp){
                            //var _ind  = idpub2index(_iddoc,_idp);
                            D[tt]["content"].splice(ll, 1);
                            D[tt]["length"] = parseInt(D[tt]["length"]) -1;
                        }
                        
                    }
                }                
            }
        }
    }
    
    //-
    deleting_publication_yes = function(id_doc,id_pub){
        var index = idpub2index(id_doc, id_pub);
        console.log(["id_doc:",id_doc,"  index:",index]);
        deleting_referencing_pub(id_doc,id_pub);
        D[id_doc]["content"].splice(index, 1);
        D[id_doc]["length"] = parseInt(D[id_doc]["length"]) -1;
    }
    
    //-
    $(document).on('click', '.btnDeletePub', function () {
        var id_pub = $(this).attr("idp");
        var id_doc = $(this).attr("idd");
        BootstrapDialog.show({
            title: 'Removing publication',
            message: 'Are you sure you want to delete the publication form the list?',
            buttons: [{
                cssClass: 'btn-primary',
                label: 'Yes',
                action: function(dialog) {
                    
                    deleting_publication_yes(id_doc,id_pub);
                    
                    updateMainTable();
                    showContent();
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
    
    
    //---   

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }



    // --- filter by fields
    fullfill_filter = function(fField, fText, pub){
        var new_res = "";
        if (pub[column_filtered]==undefined || pub[column_filtered]==""){
            return -1;
        }
        
        var low_pub = pub[column_filtered].toLowerCase();
        var low_f = fText.toLowerCase();
        if (fField.indexOf("substr@")!=-1){
            if (low_pub.indexOf(low_f)!=-1){
                new_res = replaceAll(low_pub,low_f,"<b style='color:#980020;'>"+low_f+"</b>");
                return new_res;
            } 
            else{
                return -1;
            }
        }
        else if (fField.indexOf("exact@")!=-1){
            //var pattr = "[ \n.,-]"+low_f+"[ \n.,-]";
            var pattr = "[ \n.,-]"+low_f+"[ \n.,-]|^"+low_f+"[ \n.,-]|[ \n.,-]"+low_f+"$|^"+low_f+"$";
            var myRe = new RegExp(pattr,'g');
            var sol = myRe.exec(low_pub);
            if (sol != null){
                new_res = replaceAll(low_pub,low_f,"<b style='color:#980020;'>"+low_f+"</b>");
                return new_res;
            } 
            else{
                return -1;
            }
        }
        else if (fField.indexOf("start@")!=-1){
            var pattr = "[ \n.,-]"+low_f+"|^"+low_f;
            var myRe = new RegExp(pattr,'g');
            var sol = myRe.exec(low_pub);
            if (sol != null){
                new_res = replaceAll(low_pub,low_f,"<b style='color:#980020;'>"+low_f+"</b>");
                return new_res;
            } 
            else{
                return -1;
            }
        }
        else if (fField.indexOf("equal@")!=-1){
            if (low_f==undefined || !isNumber(low_f) || low_pub==undefined || !isNumber(low_pub)){
                return -1;
            }

            if (low_f == low_pub){
                return low_f;
            } 
            else{
                return -1;
            }
        }
        else if (fField.indexOf("gte@")!=-1){
            if (low_f==undefined || !isNumber(low_f) || low_pub==undefined || !isNumber(low_pub)){
                return -1;
            }
            
            var _vf = parseInt(low_f);
            var _vp = parseInt(low_pub);
            if (_vf <= _vp){
                return low_pub;
            } 
            else{
                return -1;
            }
        }
        else if (fField.indexOf("lte@")!=-1){
            if (low_f==undefined || !isNumber(low_f) || low_pub==undefined || !isNumber(low_pub)){
                return -1;
            }
            
            var _vf = parseInt(low_f);
            var _vp = parseInt(low_pub);
            if (_vf >= _vp){
                return low_pub;
            } 
            else{
                return -1;
            }
        }
        
        
        if (new_res == pub[column_filtered]){
            return -1;
        }
        
        return -1;
    }
    
    //--
    clearFilterText = function(){
        for (pi in D[activeDoc]["content"]){
            if ("meta:filter" in D[activeDoc]["content"][pi]){    
                delete D[activeDoc]["content"][pi]["meta:filter"];
            }
        }
    }
    
    
    //--
    $("#btnFilterText").click(function(){
        var fText = $("#textFilter").val();
        var fField = $("#selectFilterText").val();
        
        clearFilterText();
        
        if (fText != undefined && fText!=""){
            column_filtered = fField.split("@")[1];
            
            for (pi in D[activeDoc]["content"]){
                var p = CAST(D[activeDoc]["content"][pi]);
                var res = fullfill_filter(fField, fText, p);
                if (res!=-1){    
                    D[activeDoc]["content"][pi]["meta:filter"] = res;
                }
            }
        }
        else{
            column_filtered = "";
        }
        
        showContent();        
    });
    
    
    //-- edit detail publication
    $(document).on('click', '.btnEditDetailPublication', function () {
        var index = $(this).attr("indexp");
        var idd = $(this).attr("idd");
        var idkey = $(this).attr("idkey");
        var key = replaceAll(idkey,"-0000-",":");
        
        var actual_key = $("#detail_k-"+idkey).html();
        var actual_val = $("#detail_v-"+idkey).html();

        
        var input_k = '<input class="my-form-control" type="text" style="width:100%!important;font-family: sans-serif;" id="detail_edition_k-'+idkey+'" value="'+actual_key+'" placeholder="Enter the Key"/>';
        $("#detail_k-"+idkey).html(input_k);
        
        var input_v = '<input class="my-form-control" type="text" style="width:100%!important;font-family: sans-serif;" id="detail_edition_v-'+idkey+'" value="'+actual_val+'" placeholder="Enter the Value"/>';
        $("#detail_v-"+idkey).html(input_v);
        
        var action_save = '<button class="btn btn-secondary btnSaveDetailPublication" type="button" indexp="'+index+'" idd="'+idd+'" idkey="'+idkey+'" data-toggle="tooltip" title="Edit this field!"><i class="glyphicon glyphicon-floppy-disk"></i></button>';
        $("#detail_btn-"+idkey).html(action_save);

    });
    
    
    $(document).on('click', '.btnSaveDetailPublication', function () {
        var index = $(this).attr("indexp");
        var idd = $(this).attr("idd");
        var idkey = $(this).attr("idkey");
        var key = replaceAll(idkey,"-0000-",":");
        
        var actual_key = $("#detail_edition_k-"+idkey).val();
        var actual_val = $("#detail_edition_v-"+idkey).val();
        
        console.log(["actual_key:",actual_key,"  actual_val:",actual_val]);
        
        D[idd]["content"][index][actual_key] = actual_val;
        $("#detail_k-"+idkey).html(actual_key);
        $("#detail_v-"+idkey).html(actual_val);
        
        var action_detail = '<button class="btn btn-secondary btnEditDetailPublication" type="button" indexp="'+index+'" idd="'+idd+'" idkey="'+key+'" data-toggle="tooltip" title="Edit this field!"><i class="glyphicon glyphicon-edit"></i></button>';
        $("#detail_btn-"+idkey).html(action_detail);
        
        showContent();
    });
    
    
    $("#btnNewDetailPublication").click(function(){
        var index = $(this).attr("indexp");
        var idd = $(this).attr("idd");
        
        var new_key = $("#detail_input_new_k").val();
        var new_val = $("#detail_input_new_v").val();
        
        D[idd]["content"][index][new_key] = new_val;
        var action_detail = '<button class="btn btn-secondary btnEditDetailPublication" type="button" indexp="'+index+'" idd="'+idd+'" idkey="'+strip_doble_point(new_key)+'" data-toggle="tooltip" title="Edit this field!"><i class="glyphicon glyphicon-edit"></i></button>';
        
        $("#fields_table").append('<tr><td id="detail_k-'+strip_doble_point(new_key)+'" class="text-primary">'+new_key+'</td><td class="text-primary" id="detail_v-'+strip_doble_point(new_key)+'">'+new_val+'</td><td id="detail_btn-'+strip_doble_point(new_key)+'">'+action_detail+'</td></tr>');
        
        $("#detail_input_new_k").val("");
        $("#detail_input_new_v").val("");
        showContent();
    });
    
    
});



















