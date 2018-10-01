$(document).ready(function() {
    
    D = {}; // Datos de los documentos, ejemplo:
    //D =  {1: {"fileName":"abc.csv", "type":"ACM", "name":"Henry","searchQuery":"..", "dateUpload":"2018-03-02", "timeUpload":"10:30am", "dataUploading":{"repited":{"1":12, "2":3}, "typePubl":{"articles":2, "procedings":4}}, "length":50, "description":"ABABAB", "content":["id"]} };
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
       console.log("here");
       var pos = 1;
       for (i in D){
           var d = D[i];
           $("#doc_table").append('<tr><th scope="row">'+pos.toString()+'</th><td>'+d["dateUpload"]+'</th><td>'+d["timeUpload"]+'</td><td>'+d["length"]+'</td><td>'+d["name"]+'</td><td>('+d["fileName"]+')'+d["description"]+'</td><td>-</td><td>-</td></tr>');
           pos = pos + 1;
       }
   }
   

//e.target.
    //see https://www.html5rocks.com/en/tutorials/file/dndfiles/
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
            parseTextInput();
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


    //-------- download
    $("#btn_download").click(function(){
        /*BootstrapDialog.show({
            message: "It's not working yet :("
        });*/
        
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
                        var htmlText = $('#nifdoc').html();
                        htmlText = replaceAll(htmlText,"&nbsp;"," ");
                        var textToWrite = Encoder.htmlDecode(replaceAll(htmlText,"<br>","\n"));
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
        for (i in L){
            var l = L[i];
            if (trim_1(l) == ""){continue;}
            console.log(l);
            if (first){  // first line have the columns names
                if (l.indexOf(Head[newDoc["type"]]) != -1){
                    console.log("jumping")
                    continue; 
                }
            }
            
            var H = l.split('","');
            
            // seeing the type of publication
            var ptype = trim_1(H[M["type"]]);
            console.log("1");
            if (ptype in Rt){
                Rt[ptype] = Rt[ptype] + 1;                
            }
            else{
                Rt[ptype] = 1;
            }
            
            console.log(ptype);
            if (!(ptype in A)){
                console.log("------------------> salto 1");
                continue;
            }
            
            console.log("2");
            //seeing if it repeated 
            var pid = trim_1(H[M["id"]]);
            if (pid in Rr){
                Rr[pid] = Rr[pid] + 1;
                console.log("------------------> salto 2");
                continue; 
            }
            else{
                Rr[pid] = 1;
            }
            
            //
            console.log("entro");
            var newPub = {};  
            var cant = 0;
            for (j in H){
                h = trim_1(H[j]);
                console.log("----");
                console.log(h);
                console.log(j);
                var k = invMap[j];
                console.log(k);
                if (k != -1){
                    newPub[k] = h;                    
                }        
                cant = cant + 1;
            }
            newPub["length"] = cant;
            newDoc["content"].push(newPub);
        }
        D[Object.keys(D).length+1] = newDoc;

       //Update table
       updateMainTable();
    };

    
    
    // We suppose that the sentences are ordered
    
    
    
    $("#input-b9").fileinput({
        showPreview: false,
        showUpload: false,
        elErrorContainer: '#kartik-file-errors',
        allowedFileExtensions: ["csv"]
        //uploadUrl: '/site/file-upload-single'
    });

    var upload = function() {
		var photo = document.getElementById("fileNif");
		return false;
	};
    
    $("#btn_upload").click(function(){
        newDoc = {"fileName":"-", "type":"ACM", "name":"-","searchQuery":"-", "dateUpload":"-", "timeUpload":"-", "dataUploading":{"repited":{}, "typePubl":{}}, "length":0, "description":"-", "content":[]};
        $("#modalUpload").modal("show");
    });
    

});



















