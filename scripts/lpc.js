/*
* Copyright (C) 2014 Vladimir Shabunin
* License: http://www.gnu.org/licenses/gpl.html GPL version 2 or higher
*/

var lpc = function(parameters) {

	/*parameters should look like 
	{
		host: 'ip or hostname without http:// and / symbols',
		port: 'port',
		login: 'login',
		password: 'password',
		updateInterval: 'interval in ms,
		joins: {
			// 'outlet number' : 'digital join that you assign to button',
			'1' : 'd1',  //or other digital join that you want to control and feedback selected outlet
			'2' : 'd5',
			...
			'8' : 'd48'
		}
	}
	*/

    var module = {
    	host: '',
    	login: '',
    	password: '',
    	updateInterval: 0,
    	_joinChangedFromGUI: false,
    	joins: {},
        _lastState: '',
    };

    module.host = parameters['host'] || 'lpc.digital-loggers.com';
    module.login = parameters['login'] || 'admin';
    module.password = parameters['password'] || '4321';
    module.joins = parameters['joins'] || {'1':'d1', '2':'d2', '3':'d3', '4':'d4', '5':'d5', '6':'d6', '7':'d7', '8':'d8'};
    module.port = parameters['port'] || '';
    module.updateInterval = parameters['updateInterval'] || 5000;

    module.headers = {
    	'Authorization' : 'Basic ' + Base64.encode(module.login + ':' + module.password),
    	'Host' : module.host,
    	'Accept' : '*/*'
    };
    module.startup = function(){

    	CF.log('LPC Startup');
    	// watch joins change
    	for (var outlet in module.joins) {
    		CF.watch(CF.JoinChangeEvent, module.joins[outlet], module.switchOutletByJoin);
    	}
    	// ask status
    	CF.request('http://' + module.host + module.port + '/index.htm', module.headers,
            function(status, headers, body) {
               if (status == 200) {
               	   //CF.log(body);
                   module._parseLpcState(body);
               } else {
                   CF.log("LPC Startup failed with status " + status + '/' + body);
                   CF.log('http://' + module.host + module.port + '/index.htm');
                   CF.log(JSON.stringify(module.headers));
               }
            });
        setInterval(module.update, module.updateInterval);
    };
    
    module.switchOutletByNumber = function(number, value) {
    	// number - number of outlet, value - ON||OFF 
    	CF.log('switchOutletByNumber #'+ number + ' value ' + value);
    	CF.request('http://' + module.host + module.port + '/outlet?' + number + '=' + value, module.headers,
        	function(status, headers, body) {
          		if (status == 200) {
    	   	   		CF.log('http://' + module.host + module.port + '/outlet?' + number + '=' + value);
        		} else {
                    CF.log("LPC switch outlet failed with status " + status);
                }
        }); 
    };
    module.switchOutletByJoin = function(join, value, tokens, tags) {
    	if(module._joinChangedFromGUI == true) {
	    	CF.log('Join #' + join + " switched from GUI to " + value);
    		var valueStr = '';
	    	if (value == 1) {
    			valueStr = 'ON';
    		} else {
	    		valueStr = 'OFF';
    		}
    		for (var outlet in module.joins) {
	    		if(module.joins[outlet] == join) {
    				CF.request('http://' + module.host + module.port + '/outlet?' + outlet + '=' + valueStr, module.headers,
        	    		function(status, headers, body) {
        		       		if (status == 200) {
    	        	   	   		CF.log('http://' + module.host + module.port + '/outlet?' + outlet + '=' + valueStr);
                                module._joinChangedFromGUI = false;
               				} else {
                                CF.log("LPC switch outlet failed with status " + status);
                                module.switchOutletByJoin(join, value, tokens, tags);
                            }
        	    	});
                    break;
    			}
    		}
    		
    	}
    };
    module._parseLpcState = function(body) {
    	CF.log('Parsing response');
    	//CF.log(body);
		var found = body.match(/state=../ig);
		if (found[0] != undefined) {
			var stateHex = found[0].match(/..$/ig);
			if (stateHex[0]  != undefined) {
				var stateBin = hex2bin(stateHex[0]);
				while(stateBin.length != 8) {
					stateBin = '0' + stateBin;
				}
				CF.log('State of outlets [8-1]: ' + stateBin);
				for(var i = stateBin.length - 1; i >= 0; i -= 1) {
					var outlet = stateBin.length - i;

					if (CF.getJoin(module.joins[outlet.toString()]) != parseInt(stateBin[i]) && module._joinChangedFromGUI != true) {
						CF.setJoin(module.joins[outlet.toString()], parseInt(stateBin[i]));
                        CF.log('Join changed by update: ' + module.joins[outlet.toString()] + ':' + parseInt(stateBin[i]));
					}
				}
			}
		}
	};
		
    module.update = function() {
    	//CF.log('LPC update')
        //ask state
    	CF.request('http://' + module.host + module.port + '/index.htm', module.headers,
            function(status, headers, body) {
               if (status == 200) {
                   CF.log('LPC got update!');
                   module._lastState = body;
                   module._parseLpcState(body);
               } else {
                   
                   CF.log("LPC Update state failed with status " + status);
               }
            });
    };
    module.click = function() {
    	module._joinChangedFromGUI = true;
    };
    module.cleanup = function() {

    	CF.log('LPC Cleanup');
    	// unwatch all events
    	for (var outlet in module.joins) {
    		CF.unwatch(CF.JoinChangeEvent, module.joins[outlet]);
    	}
    };

    return module;
}

