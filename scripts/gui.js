var GUI = {}

CF.userMain = function() {

	/*parameters for lpc module should look like 
	{
		host: 'ip or hostname without http:// and / symbols',
		port: 'port',
		login: 'login',
		password: 'password',
		updateInterval: 'interval in ms for requesting feedback',
		joins: {
			// 'outlet number' : 'digital join that you assign to button',
			'1' : 'd1',  //or other digital join that you want to control and feedback selected outlet
			'2' : 'd5',
			...
			'8' : 'd48'
		}
	}
	*/
	GUI.lpcDemo = lpc({
    	host: 'lpc.digital-loggers.com',
    	login: 'admin',
    	password: '4321',
    	updateInterval: 5000,
    	joins: {'1':'d1', '2':'d2', '3':'d3', '4':'d4', '5':'d5', '6':'d6', '7':'d7', '8':'d8'}
    });
	GUI.lpcDemo.startup();
}