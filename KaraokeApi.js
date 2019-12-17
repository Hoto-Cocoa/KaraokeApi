/**
 * @file KaraokeApi.js
 * @author Hoto Cocoa <cocoa@hoto.us>
 * @license AGPL-3.0
 */
const asyncRequest = require('./AsyncRequest'), cheerio = require('cheerio'), iconv = require('iconv-lite');
module.exports = class KaraokeApi {
	/**
	 * Get Song List from Provider
	 * @param {String} provider 
	 * @param {String} searchValue 
	 * @returns {(Array|Error)} Result of Search
	 */
	async getSongsList(provider = '', searchValue = '') {
		switch(provider) {
			case 'tj': case '태진':
				var requestResult = (await asyncRequest(`https://www.tjmedia.co.kr/tjsong/song_search_list.asp?strType=0&strText=${searchValue}&strCond=0&strSize01=100&strSize02=100&strSize03=100&strSize04=100&strSize05=100`).catch(e => e));
				if(requestResult instanceof Error) return new Error('REQUEST_ERROR');
				var $ = cheerio.load(requestResult.body);
				var songsData = [];
				$('#contents > form > #BoardType1 > table > tbody > tr').each((i, e) => {
					var songData = [], needOver60 = false, isMR = false;
					$(e).find('td').each((i, e) => e.children[0] && e.children[0].data !== '검색결과를 찾을수 없습니다.' && songData.push($(e).html().replace(/<span class="txt">/g, '').replace(/<\/span>/g, '').replace('<img class="mr_icon" src="/images/tjsong/60s_icon.png">', () => { needOver60 = true; return ''; }).replace('<img class="mr_icon" src="/images/tjsong/mr_icon.png">', () => { isMR = true; return ''; }).replace(/&#x([A-Z0-9]{4});/g, (m, p1) => { return String.fromCharCode(`0x${p1}`); }).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, '\'')));
					if(songData.length) songsData.push({ number: songData.shift(), title: songData.shift(), singer: songData.shift(), lyricist: songData.shift(), composer: songData.shift(), needOver60, isMR });
				});
				return songsData;
			case '금영': case 'ky':
				var requestResult = (await asyncRequest(`http://www.ikaraoke.kr/isong/search_result.asp?sch_txt=${`%${require('iconv-lite').encode(searchValue, 'EUC-KR').join('%')}`.replace(/%(\d*)/g, (m, p1) => `%${parseInt(p1).toString(16).toUpperCase()}`)}`, null, 'GET', null, null).catch(e => e));
				if(requestResult instanceof Error) return new Error('REQUEST_ERROR');
				var $ = cheerio.load(iconv.decode(requestResult.body, 'EUC-KR'));
				var songsData = [];
				$('.tbl_board > table > tbody > tr').each((i, e) => e.attribs.onmouseover && $(e).find('td.ac').first().text() && songsData.push({ number: $(e).find('td.ac').first().text(), title: $(e).find('td.pl8').first().find('span')[0] && $(e).find('td.pl8').first().find('span')[0].attribs.title ? $(e).find('td.pl8').first().find('span')[0].attribs.title : $(e).find('td.pl8').first().find('a.b')[0].attribs.title, singer: $(e).find('.tit').first().text(), lyricist: $(e).find('.pl8').last().html().split('<br>')[1].replace(/&#x([A-Z0-9]{4});/g, (m, p1) => { return String.fromCharCode(`0x${p1}`); }).replace(/\s*작곡/, ''), composer: $(e).find('.pl8').last().html().split('<br>')[0].replace(/&#x([A-Z0-9]{4});/g, (m, p1) => { return String.fromCharCode(`0x${p1}`); }).replace(/\s*작사/, '') }));
				return songsData;
			default: return new Error('NO_PROVIDER');
		}
	}
}
