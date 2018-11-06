<?php
//-- Function to check if the request is an AJAX request
function is_ajax() {
  return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
}

//equal to the previous function, but, taking into account the second search starting in the end of the first.
function get_between($tt, $t1, $t2){

    $start = strpos($tt, $t1);
    $nt1 = strlen($t1);
    if ($start!=false){
        if ($t2 == false){            
            return substr($tt, $start + $nt1);
        }
        else{
            $tt2 = substr($tt, $start + $nt1);
            $end = strpos($tt2, $t2) + $start + $nt1;
            if ($end!=false){
                return substr($tt, $start + $nt1 , $end - $start - $nt1);
            }
        }
    }
    return false;
}



function ACM_response($data){
    try {
        //$text_coded = rawurlencode($data["doi"]);
        //$text_coded = "Obama";
        //$qry_str = "?doid=1276958.1277208&preflayout=flat";
        $short_doi = end(explode("/",$data["doi"]));
        $qry_str = "?doid=".$short_doi."&preflayout=flat";
        //echo $qry_str;
        $ch = curl_init();

        // Set query data here with the URL
        curl_setopt($ch, CURLOPT_URL, 'https://dl.acm.org/citation.cfm' . $qry_str); 

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $content = trim(curl_exec($ch));
        if (curl_errno($ch)) {
            echo '{"error":"'.curl_error($ch).'"}';
            return false;
        }

        curl_close($ch);
        //echo $content;
        
       
        // processing json    var_dump
        //$c =  json_decode($content,true);
        //var_dump($content);
        
        $response= get_between($content,'<div style="display:inline">',"</div>");
        $abstract = str_replace('"',"'",$response);
        echo '{"response":"'.$abstract.'"}';
        //echo '{"response":"'.$qry_str.'"}';
        
    } catch (Exception $e) {
        echo '{"error":'.$e->getMessage().'}';
    }
}
        

//---
if (is_ajax()) {
    try {
        if (isset($_POST["values"]) && !empty($_POST["values"])) { //Checks if data value exists
            $data = $_POST["values"];            

            switch($data["library"]) { //Switch case for value of data
                case "ACM": ACM_response($data); break;

            }

        }
    } catch (Exception $e) {
        echo '{"error":'.$e->getMessage().'}';
    }
}
?>




