// 刻隆对象
function funcObjectClone(object) {
  var obj = {};
  for (var i in object) {
    obj[i] = object[i];
  }
  return obj;
}

// 根据16进制生成rgb颜色
function funcColor(colorString) {
  var rgb = [];
  for (var i = 1; i <= 5; i += 2) {
    var color = '0x' + colorString.substr(i, 2) - 0;
    rgb.push(color);
  }
  return cc.color(rgb[0], rgb[1], rgb[2], 255);
}

// 生成一个0到n-1的随机正整数, 第二个参数是需要排除的一个数字
function funcRand(n, excludeNum) {
  var num = 0;
  for (var i = 0; i < 1000; i += 1) {
    num = parseInt(Math.random() * n);
    if (num !== excludeNum) break;
  }
  return num;
}

// 加密一个字符串
function funcEncrypt(text) {
	var s = base64encode(text);
	s = base64encode(s);
	s = s.substr(0, s.length - 2);
	s = s.split('');
	var ss = '';
	s.map(function(chr) {
		var c = chr.charCodeAt();
		c = c.toString(12);
		ss = c + ss;
	});
	return ss;
}

// 解密一个字符串
function funcDecryption(text) {
	var s = '';
	for (var i = 0; i < text.length; i += 2) {
		var c = text.substr(i, 2);
		c = parseInt(c, 12);
		c = String.fromCharCode(c);
		s = c + s;
	}
	s += '==';
	s = base64decode(s);
	s = base64decode(s);
	return s;
}
