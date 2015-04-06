var chartGlobals = { 
	chart1: {
		chartObj: null, 
		basePre: 'verb.id != null', 
		where: 'verb.id != null',
		chartType: 'createMultiBarChart'
	},
	chart2: {
		chartObj: null, 
		basePre: 'verb.id != null', 
		where: 'verb.id != null',
		chartType: 'createBarChart'
	}
};

//Base where functions..
chartGlobals.chart1.preFunc = function(data){ data.where(chartGlobals.chart1.where); };
chartGlobals.chart2.preFunc = function(data){ data.where(chartGlobals.chart2.where); };

(function(){
	var query = window.location.search;

	//If we're asking for the video report
	if(query.indexOf("video") > -1){
		
		//Chart 1
		chartGlobals.chart1.basePre = chartGlobals.chart1.where = "object.id = /video/ and (verb.id = /watched|paused|completed/)";
		chartGlobals.chart1.chartObj = {
			container: '#svg',
			pre: chartGlobals.chart1.preFunc,
			aggregate: ADL.multiAggregate("actor.mbox", ADL.count),
			groupBy: 'object.id',
			innerGroupBy: 'verb.id',
			post: function(data){
				data.contents.forEach(function(elem){
					//This just cleans up the object.id labels. object.display would be nice here..
					elem.key = decodeURIComponent(elem.key.replace(/http.*\//gi, '').replace(/count$/gi, ''));			
					elem.values.forEach(function(elem){
						elem.in = decodeURIComponent(elem.in.replace(/http.*\//gi, '').replace(/count$/gi, ''));	
					});
				});
			},
			customize: function(nvd3Chart){
				nvd3Chart.yAxis.axisLabel("# instances");		
				nvd3Chart.xAxis.axisLabel("Object");		
			}
		};
		
		//Chart 2
		chartGlobals.chart2.chartType = 'createMultiBarChart';
		chartGlobals.chart2.basePre = chartGlobals.chart2.where = chartGlobals.chart1.basePre + " and result.duration != null";
		chartGlobals.chart2.preFunc = function(data){
			data.where(chartGlobals.chart2.where);
			data.contents.forEach(function(elem){
				elem.result.duration = parseTotalSeconds(elem.result.duration);
			});
		};
		
		chartGlobals.chart2.chartObj = {
			container: "#svg4",
			groupBy: 'actor.mbox',
			innerGroupBy: 'verb.display.en-US',
			pre: chartGlobals.chart2.preFunc,
			aggregate: ADL.multiAggregate(ADL.sum("result.duration")),
			post: function(data){
				data.contents.forEach(function(arr){
					arr.values.forEach(function(elem){
						elem.in = cleanEmail(elem.in);
					});
				});
			},
			customize: function(nvd3Chart, event){
				nvd3Chart.xAxis.axisLabel("Actor");
				nvd3Chart.yAxis.axisLabel("Time (seconds)");
			}
		};
	}
	
	//If we're asking for the book report
	else if(query.indexOf("book") > -1){
		
		//Chart 1
		chartGlobals.chart1.basePre = chartGlobals.chart1.where = "object.id = /page|paragraph|book/";
		chartGlobals.chart1.chartObj = {
			container: '#svg',
			pre: chartGlobals.chart1.preFunc,
			aggregate: ADL.multiAggregate("actor.mbox", ADL.count),
			groupBy: 'object.id',
			innerGroupBy: 'verb.id',
			post: function(data){
				data.contents.forEach(function(elem){
					//This just cleans up the object.id labels. object.display would be nice here..
					elem.key = decodeURIComponent(elem.key.replace(/http.*\//gi, '').replace(/count$/gi, ''));			
					elem.values.forEach(function(elem){
						elem.in = decodeURIComponent(elem.in.replace(/http.*\//gi, '').replace(/count$/gi, ''));	
					});
				});
			},
			customize: function(nvd3Chart){
				nvd3Chart.reduceXTicks(false);
				nvd3Chart.yAxis.axisLabel("# instances");		
				nvd3Chart.xAxis.axisLabel("Object");		
			}
		};
		
		//Chart 2
		chartGlobals.chart2.chartType = 'createMultiBarChart';
		chartGlobals.chart2.basePre = chartGlobals.chart2.where = chartGlobals.chart1.basePre + " and result.duration != null";
		chartGlobals.chart2.preFunc = function(data){
			data.where(chartGlobals.chart2.where);
			data.contents.forEach(function(elem){
				elem.result.duration = parseTotalSeconds(elem.result.duration);
			});
		};
			
		chartGlobals.chart2.chartObj = {
			container: "#svg4",
			groupBy: 'actor.mbox',
			innerGroupBy: 'verb.display.en-US',
			pre: chartGlobals.chart2.preFunc,
			aggregate: ADL.multiAggregate(ADL.sum("result.duration")),
			post: function(data){
				data.contents.forEach(function(arr){
					arr.values.forEach(function(elem){
						elem.in = cleanEmail(elem.in);
					});
				});
			},
			customize: function(nvd3Chart, event){
				nvd3Chart.xAxis.axisLabel("Actor");
				nvd3Chart.yAxis.axisLabel("Time (seconds)");
			}
		};
	}
	
	//Default to the assessment report
	else{
		
		//Chart 1
		chartGlobals.chart1.basePre = chartGlobals.chart1.where = "object.id = /question|assessment/ and verb.id = /answered|completed|passed|/";
		chartGlobals.chart1.chartObj = {
			container: '#svg',
			pre: chartGlobals.chart1.preFunc,
			aggregate: ADL.multiAggregate("actor.mbox", ADL.count),
			groupBy: 'actor.mbox',
			innerGroupBy: 'object.id',
			post: function(data){
				data.contents.forEach(function(elem){
					//This just cleans up the object.id labels. object.display would be nice here..
					elem.key = cleanIDLabel(elem);				
				});
			},
			customize: function(nvd3Chart){
				nvd3Chart.yAxis.axisLabel("# statements");		
				nvd3Chart.xAxis.axisLabel("Actor");		
			}
		};
		
		//Chart 2
		chartGlobals.chart2.basePre = chartGlobals.chart2.where = chartGlobals.chart1.basePre;
		chartGlobals.chart2.chartObj = {
			container: "#svg4",
			groupBy: 'verb.display.en-US',
			aggregate: ADL.count(),
			pre: chartGlobals.chart2.preFunc,
			post: function(data){
				data.orderBy('out', 'desc');
			},
			customize: function(nvd3Chart, event){
				nvd3Chart.xAxis.axisLabel("Verb");
				nvd3Chart.yAxis.axisLabel("Count");
			}
		};
	}
	
	//Util function to parse ISO 8601 formatted durations. Source: http://stackoverflow.com/questions/27851832/how-do-i-parse-an-iso-8601-formatted-duration-using-moment-js
	var regex = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/;
	function parseTotalSeconds(duration) {
		if(typeof duration == "number"){
			return duration;
		}
		else{
			var matches = duration.match(regex);

			//index 12: hours, index 14: minutes, index 16: seconds.
			return parseFloat(matches[12]) * 3600 || 0 + parseFloat(matches[14]) * 60 || 0 + parseFloat(matches[16]) || 0;
		}
	}
})();

//More util functions..
function cleanIDLabel(str){
	return decodeURIComponent(str.key.replace(/http.*\//gi, '').replace(/count$/gi, ''));
}	
function cleanEmail(str){
	return str.replace(/mailto\:|@.*/gi, '');
}	
		
window.statements = JSON.parse('[{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"launched"},"id":"http://adlnet.gov/expapi/verbs/launched"},"object":{"id":"http://example.com/activities/cool%20book","objectType":"Activity"}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"read"},"id":"http://example.com/verbs/read"},"object":{"id":"http://example.com/activities/page%201","objectType":"Activity"},"result":{"duration":"PT45S"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"read"},"id":"http://example.com/verbs/read"},"object":{"id":"http://example.com/activities/page%202","objectType":"Activity"},"result":{"duration":"PT15S"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"read"},"id":"http://example.com/verbs/read"},"object":{"id":"http://example.com/activities/page%203","objectType":"Activity"},"result":{"duration":"PT55S"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"read"},"id":"http://example.com/verbs/read"},"object":{"id":"http://example.com/activities/page%204","objectType":"Activity"},"result":{"duration":"PT45S"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"watched"},"id":"http://example.com/verbs/watched"},"object":{"id":"http://example.com/activities/video%201","objectType":"Activity"},"result":{"duration":"PT3M"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"page 4"}},"id":"http://example.com/activities/page%204","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"paused"},"id":"http://example.com/verbs/paused"},"object":{"id":"http://example.com/activities/video%201","objectType":"Activity"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"page 4"}},"id":"http://example.com/activities/page%204","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"resumed"},"id":"http://adlnet.gov/expapi/verbs/resumed"},"object":{"id":"http://example.com/activities/video%201","objectType":"Activity"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"page 4"}},"id":"http://example.com/activities/page%204","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"watched"},"id":"http://example.com/verbs/watched"},"object":{"id":"http://example.com/activities/video%201","objectType":"Activity"},"result":{"duration":"PT2M"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"page 4"}},"id":"http://example.com/activities/page%204","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"completed"},"id":"http://adlnet.gov/expapi/verbs/completed"},"object":{"id":"http://example.com/activities/video%201","objectType":"Activity"},"result":{"duration":"PT5M"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"page 4"}},"id":"http://example.com/activities/page%204","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"read"},"id":"http://example.com/verbs/read"},"object":{"id":"http://example.com/activities/page%205","objectType":"Activity"},"result":{"duration":"PT45S"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"answered"},"id":"http://adlnet.gov/expapi/verbs/answered"},"object":{"id":"http://example.com/activities/question%201","objectType":"Activity"},"result":{"response":"answer 2"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"assessment 1"}},"id":"http://example.com/activities/assessment%201","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"page 5"}},"id":"http://example.com/activities/page%205","objectType":"Activity"},{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"answered"},"id":"http://adlnet.gov/expapi/verbs/answered"},"object":{"id":"http://example.com/activities/question%201","objectType":"Activity"},"result":{"response":"answer 3"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"assessment 1"}},"id":"http://example.com/activities/assessment%201","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"page 5"}},"id":"http://example.com/activities/page%205","objectType":"Activity"},{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"answered"},"id":"http://adlnet.gov/expapi/verbs/answered"},"object":{"id":"http://example.com/activities/question%201","objectType":"Activity"},"result":{"response":"answer 2"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"assessment 1"}},"id":"http://example.com/activities/assessment%201","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"page 5"}},"id":"http://example.com/activities/page%205","objectType":"Activity"},{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"answered"},"id":"http://adlnet.gov/expapi/verbs/answered"},"object":{"id":"http://example.com/activities/question%202","objectType":"Activity"},"result":{"response":"answer 4"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"assessment 1"}},"id":"http://example.com/activities/assessment%201","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"page 5"}},"id":"http://example.com/activities/page%205","objectType":"Activity"},{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"answered"},"id":"http://adlnet.gov/expapi/verbs/answered"},"object":{"id":"http://example.com/activities/question%203","objectType":"Activity"},"result":{"response":"answer 1"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"assessment 1"}},"id":"http://example.com/activities/assessment%201","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"page 5"}},"id":"http://example.com/activities/page%205","objectType":"Activity"},{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"completed"},"id":"http://adlnet.gov/expapi/verbs/completed"},"object":{"id":"http://example.com/activities/assessment%201","objectType":"Activity"},"result":{"score":{"raw":2,"min":0,"max":3},"duration":"PT2M"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"page 5"}},"id":"http://example.com/activities/page%205","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"passed"},"id":"http://adlnet.gov/expapi/verbs/passed"},"object":{"id":"http://example.com/activities/assessment%201","objectType":"Activity"},"result":{"score":{"raw":2,"min":0,"max":3},"duration":"PT2M"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"page 5"}},"id":"http://example.com/activities/page%205","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"chapter 1"}},"id":"http://example.com/activities/chapter%201","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"suspended"},"id":"http://adlnet.gov/expapi/verbs/suspended"},"object":{"id":"http://example.com/activities/cool%20book","objectType":"Activity"},"context":{"contextActivities":{"grouping":[{"definition":{"name":{"en-US":"page 5"}},"id":"http://example.com/activities/page%205","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"resumed"},"id":"http://adlnet.gov/expapi/verbs/resumed"},"object":{"id":"http://example.com/activities/cool%20book","objectType":"Activity"},"context":{"contextActivities":{"grouping":[{"definition":{"name":{"en-US":"page 5"}},"id":"http://example.com/activities/page%205","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"read"},"id":"http://example.com/verbs/read"},"object":{"id":"http://example.com/activities/page%206","objectType":"Activity"},"result":{"duration":"PT45S"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"chapter 2"}},"id":"http://example.com/activities/chapter%202","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"read"},"id":"http://example.com/verbs/read"},"object":{"id":"http://example.com/activities/page%207","objectType":"Activity"},"result":{"duration":"PT25S"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"chapter 2"}},"id":"http://example.com/activities/chapter%202","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"read"},"id":"http://example.com/verbs/read"},"object":{"id":"http://example.com/activities/page%208","objectType":"Activity"},"result":{"duration":"PT1M15S"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"chapter 2"}},"id":"http://example.com/activities/chapter%202","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"exited"},"id":"http://adlnet.gov/expapi/verbs/exited"},"object":{"id":"http://example.com/activities/cool%20book","objectType":"Activity"},"context":{"contextActivities":{"grouping":[{"definition":{"name":{"en-US":"page 8"}},"id":"http://example.com/activities/page%208","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"launched"},"id":"http://adlnet.gov/expapi/verbs/launched"},"object":{"id":"http://example.com/activities/cool%20book","objectType":"Activity"}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"bookmarked"},"id":"http://example.com/verbs/bookmarked"},"object":{"id":"http://example.com/activities/page%209","objectType":"Activity"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"chapter 2"}},"id":"http://example.com/activities/chapter%202","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"highlighted"},"id":"http://example.com/verbs/highlighted"},"object":{"id":"http://example.com/activities/paragraph%206","objectType":"Activity"},"result":{"response":"need help"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"page 9"}},"id":"http://example.com/activities/page%209","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"chapter 2"}},"id":"http://example.com/activities/chapter%202","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"asked"},"id":"http://adlnet.gov/expapi/verbs/asked"},"object":{"id":"http://example.com/activities/page%209","objectType":"Activity"},"result":{"response":"Can you please clarify how this applies to science?"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"feedback 1"}},"id":"http://example.com/activities/feedback%201","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"chapter 2"}},"id":"http://example.com/activities/chapter%202","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"read"},"id":"http://example.com/verbs/read"},"object":{"id":"http://example.com/activities/page%209","objectType":"Activity"},"result":{"duration":"PT3M25S"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"chapter 2"}},"id":"http://example.com/activities/chapter%202","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"highlighted"},"id":"http://example.com/verbs/highlighted"},"object":{"id":"http://example.com/activities/paragraph%207","objectType":"Activity"},"result":{"response":"insightful"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"page 9"}},"id":"http://example.com/activities/page%209","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"chapter 2"}},"id":"http://example.com/activities/chapter%202","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"read"},"id":"http://example.com/verbs/read"},"object":{"id":"http://example.com/activities/page%2010","objectType":"Activity"},"result":{"duration":"PT1M04S"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"chapter 2"}},"id":"http://example.com/activities/chapter%202","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:teacher@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"responded"},"id":"http://adlnet.gov/expapi/verbs/responded"},"object":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"result":{"response":"Science is an art of understanding."},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"feedback 1"}},"id":"http://example.com/activities/feedback%201","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"page 9"}},"id":"http://example.com/activities/page%209","objectType":"Activity"},{"definition":{"name":{"en-US":"chapter 2"}},"id":"http://example.com/activities/chapter%202","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}},{"actor":{"mbox":"mailto:tyler@example.com","objectType":"Agent"},"verb":{"display":{"en-US":"commented"},"id":"http://adlnet.gov/expapi/verbs/commented"},"object":{"id":"http://example.com/activities/teacher","objectType":"Activity"},"result":{"response":"Okay thanks!"},"context":{"contextActivities":{"parent":[{"definition":{"name":{"en-US":"feedback 1"}},"id":"http://example.com/activities/feedback%201","objectType":"Activity"}],"grouping":[{"definition":{"name":{"en-US":"page 9"}},"id":"http://example.com/activities/page%209","objectType":"Activity"},{"definition":{"name":{"en-US":"chapter 2"}},"id":"http://example.com/activities/chapter%202","objectType":"Activity"},{"definition":{"name":{"en-US":"cool book"}},"id":"http://example.com/activities/cool%20book","objectType":"Activity"},{"definition":{"name":{"en-US":"cool class"}},"id":"http://example.com/activities/cool%20class","objectType":"Activity"}]}}}]');