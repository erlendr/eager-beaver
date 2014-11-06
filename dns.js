var https = require('https');

if(!process.env.dnsimple_api_token) {
	console.error('DNSimple API token not set, exiting');
	return;
}

if(!process.env.dnsimple_email) {
	console.error('DNSimple email not set, exiting');
	return;
}

var config = {
	token: process.env.dnsimple_api_token,
	email: process.env.dnsimple_email,
	baseHost: 'api.dnsimple.com',
	basePath: '/v1/',
	basePort: '443',
}

authenticate(function(response) {
	console.log('User with id', response.user.id, 'authenticated');

	getDomains(function(response) {
		console.log('Domains:', response);

		getRecords('eagerbeaver.io', function(response) {
			console.log('Records:', response);
		})
	});
});



function createOptions(path) {
	var options = {
		host: config.baseHost,
		port: config.basePort, 
		path: config.basePath + path,
		headers: {
			'X-DNSimple-Token': config.email + ':' + config.token,
			Accept: 'application/json'
		}
	};

	return options;
}

function doRequest(options, callback) {
	var req = https.request(options, function(res) {
		res.setEncoding('utf8');
		
		res.on('data', function (chunk) {
			callback(null, chunk);
		});
	});

	req.on('error', function(e) {
		callback(err, null);
	});

	req.end();
}

function authenticate(callback) {
	console.log('Authenticating...');
	var options = createOptions('user');

	doRequest(options, function(err, response) {
		if(err) {
			console.err('Error authenticating:', err.message);
			return;
		}

		callback(JSON.parse(response));
	});
}

function getDomains(callback) {
	console.log('Getting list of domains...');
	var options = createOptions('domains');

	doRequest(options, function(err, response) {
		if(err) {
			console.err('Error getting domains:', err.message);
			return;
		}

		callback(JSON.parse(response));
	});
}

function getRecords(domainName, callback) {
	if(typeof(domainName) !== 'string') {
		console.error('Domain name not set');
	};

	console.log('Getting list of records for domain "' + domainName + '"...')
	var options = createOptions('domains/' + domainName + '/records');

	doRequest(options, function(err, response) {
		if(err) {
			console.err('Error getting records for domain:', err.message);
			return;
		}

		if(callback) {
			callback(JSON.parse(response));
		}
	});
}

