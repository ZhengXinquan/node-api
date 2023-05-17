class CryptId {
  constructor() {
    this.DIFFERENCE = 316;
    this.book = [
      '-t',
      '_G',
      '_d',
      '-i',
      '-M',
      '-h',
      '_E',
      '-a',
      '-P',
      '-V',
      '_H',
      '_u',
      '_e',
      '-o',
      '-n',
      '_q',
      '-O',
      '-K',
      '-j',
      '_o',
      '-b',
      '_Q',
      '_Z',
      '_w',
      '_W',
      '-H',
      '_i',
      '_p',
      '-J',
      '-N',
      '-s',
      '_l',
      '-r',
      '_z',
      '-e',
      '-Y',
      '_y',
      '_a',
      '_X',
      '_k',
      '-T',
      '-g',
      '_B',
      '_t',
      '-y',
      '_V',
      '_h',
      '-q',
      '_J',
      '_R',
      '_L',
      '-I',
      '_I',
      '-E',
      '-l',
      '_N',
      '-D',
      '-k',
      '_b',
      '-W',
      '-w',
      '_U',
      '_T',
      '-L',
      '-Z',
      '-B',
      '_s',
      '_m',
      '-x',
      '-m',
      '_D',
      '-c',
      '_C',
      '-v',
      '_F',
      '_n',
      '-U',
      '-d',
      '-A',
      '-f',
      '-p',
      '_K',
      '_v',
      '_j',
      '-z',
      '_f',
      '-R',
      '-u',
      '_P',
      '_A',
      '_c',
      '_Y',
      '-Q',
      '-X',
      '-C',
      '_M',
      '_r',
      '-G',
      '-S',
      '_g',
      '_O',
      '-F',
      '_S',
      '_x',
    ];
    // 干扰
    this.interfere = this.book.slice(100);
  }
  getRandomInterfere() {
    let l = this.interfere.length;
    let r = Math.floor(Math.random() * l);
    return this.interfere[r];
  }
  getOddOrEven(isOdd) {
    let r = Math.floor(Math.random() * 9);
    if (r % 2 == 0 && isOdd) {
      r++;
    }
    if (r % 2 == 1 && !isOdd) {
      r++;
    }
    return r;
  }
  // 编码
  encoded(x) {
    x = Number(x);
    x = x + this.DIFFERENCE;
    x = x * x;
    x = String(x);
    l = x.length;
    //加0，确保偶数位
    if (l % 2 == 1) {
      x = '0' + x;
    }
    x = x.split('');
    // 2位数转换 00~99
    let re = [];
    for (let i = 0; i < x.length / 2; i++) {
      let x2 = x[2 * i] + x[2 * i + 1];
      let bookIndex = Number(x2);
      let j = this.book[bookIndex];
      re.push(j);
    }
    // 加干扰
    while (re.length < 10) {
      let rd = this.getRandomInterfere();
      let ri = Math.floor(Math.random() * re.length);
      re.splice(ri, 0, rd);
    }
    let reString = re.join('');
    // 反向
    reString = reString.split('').reverse().join('');
    // —_转数字
    while (reString.includes('-') || reString.includes('_')) {
      reString = reString.replace('-', this.getOddOrEven(true)); //奇数
      reString = reString.replace('_', this.getOddOrEven(false));
    }
    return reString;
  }
  // 解码
  decode(reString) {
    // 去数字
    reString = reString.replace(/[13579]/g, '-');
    reString = reString.replace(/[24680]/g, '_');
    // 反向
    reString = reString.split('').reverse().join('');
    // 去干扰
    this.interfere.forEach(d => {
      let reg = new RegExp(d, 'g');
      reString = reString.replace(reg, '');
    });
    // 2位转2位数字
    let re = '';
    let ar = reString.split('');
    for (let i = 0; i < ar.length / 2; i++) {
      let x2 = ar[2 * i] + ar[2 * i + 1];
      let bookIndex = this.book.indexOf(x2);
      if (bookIndex < 10) bookIndex = '0' + bookIndex;
      let j = String(bookIndex);
      re += j;
    }
    // 开方-316 计算
    re = Number(re);
    re = Math.sqrt(re) - this.DIFFERENCE;
    return re;
  }
}
module.exports = new CryptId();
