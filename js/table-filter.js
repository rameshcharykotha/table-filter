var filterTableData = {};
var currentTableFilter = undefined;
var tableFilter = function (){
	var modal = '<div class="modal" id="table-filter-preview">'+
    '<div class="modal-dialog">'+
        '<div class="modal-content">'+
            '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'+
                 '<h4 class="modal-title">Table Filter</h4>'+
            '</div>'+
            '<div class="modal-body">'+
            '<table class="table table-bordered no-more-tables" id="table_filter_table">'+
            '</table>'+
            '</div>'+
            '<div class="modal-footer">'+ 
            '<a href="javascript:void(0)" id="update" class="btn btn-primary">Update</a>'+
            '<a href="javascript:void(0)" data-dismiss="modal" class="btn btn-default">Close</a>'+
            '</div>'+
        '</div>'+
    '</div>'+
    '</div>';
	
	function filterTable(table){
		$('body').append(modal);

		
		if(filterTableData[table] == undefined){
			console.log("table is adding data to it");
            var d = new Array();
            $(table).find("tr").each(function(i){
                 d[i] = new Array();
                 $(this).find("td").each(function(j){
                      d[i][j] = $(this).text();
                });
            });
			var totalData = d;
			filterTableData[table] = totalData;
		}
		var data = filterTableData[table];
		
		if(currentTableFilter == undefined || currentTableFilter != table){
			currentTableFilter = table;
			$('#table_filter_table').empty();
			var options = ["=="];

			
			$(table).find('tr:first th').each(function(i){
				
				$('#table_filter_table').append('<tr><td>'+$(this).text()+'</td>'+
						'<td><select id=\"operator_'+i+'\"></select></td>'+
						'<td><select id=\"column_'+i+'\"></select></td></tr>');
				
				for(var val in options) {
				    $("<option />", {value: options[val], text: options[val]}).appendTo($("#operator_"+i));
				}
				
				$("<option />", {value: "", text: "All"}).appendTo($("#column_"+i));
			});
			var arr = new Array();
			$.each(data,function(j){
				$.each(this, function(k){
					if(arr[k] == undefined || arr[k].length == 0)
						arr[k] = new Array();
					var val = this.toString().trim();
					if(arr[k].indexOf(val) === -1){
						arr[k].push(val);
						
						if(val.length > 50){
							val = val.substring(0,30)+'...';
						}
						if($.isNumeric(this) && $("#operator_"+k).children('option').length ==1){
							var options = ["<",">","<=",">="];
							for(var optionVal in options) {
							    $("<option />", {value: options[optionVal], text: options[optionVal]}).appendTo($("#operator_"+k));
							}			
						}
						$("#column_"+k).append('<option value=\"'+this+'"\>'+val+'</option>');
					}
				});
			});
			
			$(table).find('tr:first th').each(function(i){
				$("#column_"+i).html($("#column_"+i+" option").sort(function (a, b) {
				    return a.text == b.text ? 0 : a.text < b.text ? -1 : 1;
				}));
				$("#column_"+i).val(''); 
			});
		}
		

		$("#update").off();
		$("#update").click(function(){
			var arr = [];
			var entered = false;
			for(var i = 0; i<data.length; i++){
				var row = data[i];
				var found = false;
				
				for(var j=0; j<row.length; j++){
					
					if($("#column_"+j).val() != undefined && $("#column_"+j).val() != ''){
						console.log($("#column_"+j).val());
						entered = true;
						if(new VarOperator($("#operator_"+j).val()).evaluate(row[j], $("#column_"+j).val())){
							found = true;
						}else{
							found = false;
							break;
						}
					}
				}
				if(found){
					console.log("pushing elements"+row);
					arr.push(row);
				}
			}
			if(entered){
				if(arr.length == 0){
					alert("No Results found for the given search.!");
				}else{
					updateTable(arr);
					$('#table-filter-preview').modal('hide');
				}
			}
			else{
				updateTable(data);
				$('#table-filter-preview').modal('hide');
			}
		});
		
		$("#table-filter-preview").modal();
	}
	
	function updateTable(data){
		$(currentTableFilter).find("tr:gt(0)").remove();
		$(data).each(function(i){
			var tr = $('<tr>');
            $(this).each(function(j){
            	tr.append($('<td>').text(data[i][j]));
           });
           $(currentTableFilter).append(tr);
       });
	}
	function VarOperator(op) { //you object containing your operator
	    this.operation = op;

	    this.evaluate = function evaluate(param1, param2) {
	    	console.log('operation is'+this.operation);
	        switch(this.operation) {
	            case "==":
	                return param1 == param2;
	            case "<":
	            	console.log("< is called with "+param1+","+param2+" and result is "+param1 < param2);
	                return parseFloat(param1) < parseFloat(param2);
	            case ">":
	            	return parseFloat(param1) > parseFloat(param2);
	            case "<=":
	            	return parseFloat(param1) <= parseFloat(param2);
	            case ">=":
	            	return parseFloat(param1) >= parseFloat(param2);
	        }
	    }
	}
	return {
		filter : function(table){
			console.log("table filter called # "+table);
			filterTable(table);
		},
		update : function(){
			console.log("table filter update called");
			updateTable();
		}
	}
}();