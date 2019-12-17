const karaokeApi = new (require('./KaraokeApi'))();
require('http').createServer(async (req, res) => {
	req.args = require('url').parse(req.url).query? JSON.parse(`{"${require('url').parse(req.url).query.replace(/=/g, '": "').replace(/&/g, '", "')}"}`) : {};
	switch(req.url.split('/')[1].split('?')[0]) {
		case 'getSongsList': {
			if(!req.args.provider || !req.args.query) return res.writeHead(400) & res.end();
			const songsList = await karaokeApi.getSongsList(req.args.provider, req.args.query).catch(e => res.writeHead(500) & res.end(e.stack));
			if(songsList instanceof Error) switch(songsList.message) {
				case 'REQUEST_ERROR': return res.writeHead(500) & res.end(JSON.stringify({ success: false, result: songsList.message }));
				case 'NO_PROVIDER': return res.writeHead(400) & res.end(JSON.stringify({ success: false, result: songsList.message }));
				default: return res.writeHead(400) & res.end(JSON.stringify({ success: false, result: 'UNHANDLED_ERROR' }));
			}
			return res.end(JSON.stringify({ success: true, result: songsList }));
		}
		default: {
			return res.writeHead(404) & res.end();
		}
	}
}).listen(require('./config').Port);
