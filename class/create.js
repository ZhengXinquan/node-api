var { utilsSql, moment, fs, TOKEN, HtmlSpecialChars, config, path } = require('../utils');
const TEMPLATE_URL = path.join(__dirname, 'template');
class className {
  constructor(TOKEN_USER_INFO) {
    this.TOKEN_USER_INFO = TOKEN_USER_INFO;
  }
  setToken(TOKEN_USER_INFO) {
    this.TOKEN_USER_INFO = TOKEN_USER_INFO;
  }

  pageIndex() {
    const sqlString =
      "SELECT a.*,b.name FROM `zz_article` as a, `zz_user` as b  WHERE  a.create_name = b.user and a.public='0' ORDER BY a.create_time DESC Limit 10";

    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      connection.connect();
      const sqlParams = [];
      //查
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
          return;
        }
        let LIST_HTML = '';
        console.log(result.length);
        if (Array.isArray(result)) {
          result.forEach((row, iii) => {
            // 默认
            let img = '<img src="/zz_img/bk02.jpg" alt="...">';
            // 值
            let time = moment(row.create_time).format('YYYY-MM-DD HH:mm:ss');
            let id = row.id;
            let title = row.title;
            let name = row.name;
            let introduction = row.introduction;
            let key_word = row.key_word;
            let markdown = row.markdown;
            let content = row.content;

            let reg;
            const HTML_CONTENT = HtmlSpecialChars.decode(content);
            console.log(iii + '1 -----------markdown 判断正则--------', markdown);

            console.log(iii + '1.5 HTML_CONTENT', HTML_CONTENT);

            if (markdown == '1') {
              // markdown的图片正则
              reg = /!\[(.*?)\]\((.*?)\)/i;
            } else {
              // reg = /<\s*img\s+[^>]*?src\s*=\s*(\'|\")(.*?)\\1[^>]*?\/?\s*>/i;
              reg = /<img\s.{0,10}src="data:image(.*?)>/i;
            }
            console.log(iii + '2 MATCH_IMG_LIST', reg);

            const MATCH_IMG_LIST = HTML_CONTENT.match(reg);

            console.log(iii + '3 MATCH_IMG_LIST 结果', MATCH_IMG_LIST);
            if (Array.isArray(MATCH_IMG_LIST) && MATCH_IMG_LIST.length > 0) {
              const MATCH_IMG_LIST_LENGTH = MATCH_IMG_LIST.length;
              for (let index = 0; index < MATCH_IMG_LIST_LENGTH; index++) {
                const MATCH_IMG = MATCH_IMG_LIST[index];
                if (
                  !MATCH_IMG ||
                  MATCH_IMG.includes('img.t.sinajs.cn') ||
                  MATCH_IMG.includes('layui/images/face')
                ) {
                  continue;
                } else {
                  img = MATCH_IMG;
                  break;
                }
              }

              console.log(iii + '4 -----------img--------', img);
              console.log(iii + '5 -----------markdown 判断图片结果-------', markdown);

              if (markdown == 1) {
                const IMG_ARR = img.split('](');
                if (IMG_ARR.length == 2) {
                  const IMG_URL = IMG_ARR[1].slice(0, -1);
                  const IMG_ALT = IMG_ARR[0].slice(2);
                  img = '<img src="' + IMG_URL + '" alt="' + IMG_ALT + '">';
                }
              }
            }

            let keywordHtml = '';
            let arr1 = key_word.split(',');
            let arr2 = key_word.split('+');
            let arr = arr1.length > arr2.length ? arr1 : arr2;
            arr.forEach(key => {
              if (key != '' && key != ' ') {
                keywordHtml += '<a href="/zz_article/?word=' + key + '">' + key + '</a>';
              }
            });
            let html = `<article id="${id}" class="post well well-lg">
                   <div class="post-head">
                       <h3 class="post-title">
                            <a href="/zz_article/${id}.html">${title}</a>
                       </h3>
                       <div class="post-meta">
                           <span class="author">作者：<a href="/zz_article/?word=${name}">${name}</a></span> •
                           <time class="post-date" datetime="${time}" title="${time}">${time}</time>
                       </div>
                   </div>
                   <div class="featured-media ">
                       <a href="/zz_article/${id}.html">${img}</a>
                   </div>
                   <div class="post-introduction">
                       <p>${introduction}</p>
                   </div>
                   <footer class="post-footer">
                       <div class="pull-left tag-list">
                           <span class="glyphicon glyphicon-paste" aria-hidden="true"></span>${keywordHtml}
                       </div>
                       <div class="pull-right">
                       	<a href="/zz_article/${id}.html" class="btn btn-default">阅读全文</a>
                       </div>
                   </footer>
               </article>`;
            LIST_HTML += html;
          });
        }

        let TEMPLATE_LIST_HTML = fs.readFileSync(path.join(TEMPLATE_URL, 'index.html'), 'utf-8');
        TEMPLATE_LIST_HTML = TEMPLATE_LIST_HTML.replace('${NSQ_LIST_HTML}', LIST_HTML);
        let create_url = path.join(config.NSQ_DIR, 'index.html');
        fs.writeFile(create_url, TEMPLATE_LIST_HTML, err => {
          resolve('<br> 生成<a href="' + create_url + '" target="_blank">index</a>成功');
        });
      });
    });
  }
  articleList() {
    const sqlString =
      'SELECT a.id,a.title, a.introduction, a.create_time,  b.name FROM zz_article AS a, zz_user AS b WHERE ( a.create_name = b.user AND a.public =0) ORDER BY a.create_time DESC';

    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      connection.connect();
      const sqlParams = [];
      //查
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
          return;
        }
        let LIST_HTML = '';
        let last_y = '';
        let html_year = '';
        if (Array.isArray(result)) {
          result.forEach(async row => {
            // 默认
            let img = '<img src="/zz_img/bk02.jpg" alt="...">';
            // 值
            let create_time = moment(row.create_time).format('YYYY-MM-DD HH:mm:ss');
            let time_y = moment(row.create_time).format('YYYY');
            let time_m_d = moment(row.create_time).format('MM月DD日');
            let id = row.id;
            let title = row.title;
            // let name = row.name;
            let introduction = row.introduction;
            // let key_word = row.key_word;
            // let markdown = row.markdown;
            // let content = row.content;

            if (last_y == time_y) {
              html_year = '';
            } else {
              last_y = time_y;
              html_year = `<span class="title_year">${time_y}</span><hr>`;
            }

            let html = `${html_year}
            <div id="${id}" class="row article-list" >
              <span class="article-list-time col-md-2 col-sm-2 col-xs-3"  title="${create_time}">${time_m_d}</span>
              <span class="article-list-title col-md-10 col-sm-10 col-xs-9">
                <a href="/zz_article/${id}.html">${title}</a>
                <br>			
                <small class="article-list-introduction" >${introduction}</small>
              </span>
            </div>`;
            LIST_HTML += html;
          });
        }

        let TEMPLATE_LIST_HTML = fs.readFileSync(
          path.join(TEMPLATE_URL, 'articleList.html'),
          'utf-8',
        );
        TEMPLATE_LIST_HTML = TEMPLATE_LIST_HTML.replace('${NSQ_LIST_HTML}', LIST_HTML);
        let create_url = path.join(config.NSQ_ARTICLE_DEFAULT_DIR, 'index.html');
        fs.writeFile(create_url, TEMPLATE_LIST_HTML, err => {
          resolve(
            '<br> 生成<a href="' + create_url + '" target="_blank">article index.html</a>成功',
          );
        });
      });
    });
  }
  photoList() {
    const sqlString =
      "SELECT a.*,b.name FROM `zz_pic` as a, `zz_user` as b  WHERE ( a.create_name = b.user and a.from='photo') ORDER BY a.create_time DESC";

    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      connection.connect();
      const sqlParams = [];
      //查
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
          return;
        }
        let LIST_HTML_NAV = '';
        let LIST_HTML_CONTENT = '';
        let jsonByGroup = {};
        if (Array.isArray(result)) {
          result.forEach(async row => {
            // 值
            let time = moment(row.create_time).format('YYYY-MM-DD HH:mm:ss');
            let id = row.id;
            let name = row.name;
            let url = row.url;
            let alt = row.alt;
            let group = row.group;
            let from = row.from;
            if (!jsonByGroup[group]) {
              jsonByGroup[group] = [];
            }
            jsonByGroup[group].unshift({ url, alt, name, time });
          });
        }

        let m = 0;
        for (let key in jsonByGroup) {
          m++;
          let active_nav = m == 1 ? ' active ' : '';
          let active_content = m == 1 ? ' active in ' : '';
          let html_nav = `<li class="${active_nav}"><a href="#photo${m}" data-toggle="tab">${key}</a></li>`;
          let html_content = `<div class="tab-pane fade ${active_content}" id="photo${m}"><div class="tz-gallery"><div class="row">`;

          let imgObjList = jsonByGroup[key];
          imgObjList.forEach((img, n) => {
            html_content += `<div class="col-sm-6 col-md-4"><a class="lightbox" href="${img.url}"> <img src="/img.php?${img.url}&100&100" alt="${img.alt}"> </a></div>`;
          });
          html_content += '</div></div></div>';

          LIST_HTML_NAV += html_nav;
          LIST_HTML_CONTENT += html_content;
        }

        let TEMPLATE_LIST_HTML = fs.readFileSync(
          path.join(TEMPLATE_URL, 'photoList.html'),
          'utf-8',
        );
        TEMPLATE_LIST_HTML = TEMPLATE_LIST_HTML.replace('${NSQ_LIST_HTML_NAV}', LIST_HTML_NAV);
        TEMPLATE_LIST_HTML = TEMPLATE_LIST_HTML.replace(
          '${NSQ_LIST_HTML_CONTENT}',
          LIST_HTML_CONTENT,
        );
        let create_url = path.join(config.NSQ_PHOTO_DEFAULT_DIR, 'index.html');
        fs.writeFile(create_url, TEMPLATE_LIST_HTML, err => {
          resolve('<br> 生成<a href="' + create_url + '" target="_blank">photoList</a>成功');
        });
      });
    });
  }
  bookList() {
    const THIS_CLASS = this;
    const LIST = [...arguments];
    let id_sql = LIST.length == 1 && LIST[0] ? "AND b.id='" + LIST[0] + "' " : '';
    const idSqlString =
      'SELECT a.id as aid,b.id as bid FROM zz_article AS a, zz_book AS b WHERE ( a.group = b.id and b.id!=0 ' +
      id_sql +
      ')';

    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      connection.connect();
      const sqlParams = [];
      //查
      connection.query(idSqlString, sqlParams, function (idErr, idResult) {
        if (idErr) {
          reject(idErr);
          return;
        }
        let aid2bid = {};
        if (Array.isArray(idResult)) {
          idResult.forEach(row => {
            aid2bid[row.aid] = row.bid;
          });
        }

        const sqlString =
          'SELECT zz_book . * , zz_user.name as username FROM zz_book inner join zz_user on zz_user.user=zz_book.create_name';

        connection.query(sqlString, sqlParams, function (err, result) {
          if (err) {
            reject(err);
            return;
          }

          let LIST_HTML = '';
          if (Array.isArray(result)) {
            result.forEach(async row => {
              let n = 0,
                toArticleLink = '';
              for (let aid in aid2bid) {
                if (row.id == aid2bid[aid]) {
                  n++;
                  toArticleLink += `<a href="/zz_article/${aid}.html" class="btn  btn-primary btn-sm" role="button">读后 <span class="badge">${n}</span></a>`;
                }
              }

              let html = `
            <div class="col-sm-6 col-md-4 book-box">
                <div class="thumbnail">
                  <img src="${row.url}" alt="${row.name}">
                  <div class="caption">
                    <h3>${row.name}</h3>
                    <p>${row.introduction}</p>
                    <p>
                    ${toArticleLink}
                  </div>
                </div>
            </div>`;
              LIST_HTML += html;
            });
          }

          let TEMPLATE_LIST_HTML = fs.readFileSync(
            path.join(TEMPLATE_URL, 'bookList.html'),
            'utf-8',
          );
          TEMPLATE_LIST_HTML = TEMPLATE_LIST_HTML.replace('${NSQ_LIST_HTML}', LIST_HTML);
          let create_url = path.join(config.NSQ_BOOK_DEFAULT_DIR, 'index.html');
          fs.writeFile(create_url, TEMPLATE_LIST_HTML, err => {
            resolve('<br> 生成<a href="' + create_url + '" target="_blank">bookList</a>成功');
          });
        });
      });
    });
  }
  linkList() {
    const sqlString = 'SELECT * FROM `zz_link` ORDER BY create_time DESC';

    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      connection.connect();
      const sqlParams = [];
      //查
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
          return;
        }
        let LIST_HTML = '';
        if (Array.isArray(result)) {
          result.forEach(async row => {
            // 值
            let time = moment(row.create_time).format('YYYY-MM-DD HH:mm:ss');
            let id = row.id;
            let link = row.link;
            let name = row.name;
            let img = row.img;

            let html = `
            <a href="${link}" target="_blank" class="list-group-item">
              <img src="${img}" alt="${name}" class="img-circle"><h4>${name}</h4>
            </a>`;
            LIST_HTML += html;
          });
        }

        let TEMPLATE_LIST_HTML = fs.readFileSync(
          path.join(TEMPLATE_URL, 'friendList.html'),
          'utf-8',
        );
        TEMPLATE_LIST_HTML = TEMPLATE_LIST_HTML.replace('${NSQ_LIST_HTML}', LIST_HTML);
        let create_url = path.join(config.NSQ_FRIEND_DEFAULT_DIR, 'index.html');
        fs.writeFile(create_url, TEMPLATE_LIST_HTML, err => {
          resolve('<br> 生成<a href="' + create_url + '" target="_blank">friendList</a>成功');
        });
      });
    });
  }

  siteMap() {
    const sqlString =
      'SELECT id,title,key_word,create_time FROM zz_article  WHERE public = 0 ORDER BY create_time';

    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      connection.connect();
      const sqlParams = [];
      //查
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
          return;
        }
        let LIST_HTML_XML = '';
        let LIST_HTML_HTML = '';
        let KEY_WORD_LIST = [];
        if (Array.isArray(result)) {
          result.forEach(async row => {
            // 值
            let time = moment(row.create_time).format();
            let id = row.id;
            let title = row.title;
            let key_word = row.key_word;
            LIST_HTML_XML += `<url><loc>https://www.nanshanqiao.com/zz_article/${id}.html</loc><lastmod>${time}</lastmod><priority>0.50</priority></url>"`;
            LIST_HTML_HTML += `<li class="lpage"><a href="https://www.nanshanqiao.com/zz_article/${id}.html" title="${title}">${title}</a></li>`;

            key_word.split(',').forEach(k => {
              if (k !== ' ' && k && !KEY_WORD_LIST.includes(k)) {
                KEY_WORD_LIST.push(k);
              }
            });
          });

          LIST_HTML_HTML = `
        <li class="lhead"><a href="https://www.nanshanqiao.com/zz_article/">zz_article/  <span class="lcount"> 关尔先生的文章列表  ${result.length} pages</span></a></li>
        ${LIST_HTML_HTML}
        <li class="lhead">article label/  <span class="lcount">${KEY_WORD_LIST.length} pages</span></li>`;

          let nowTime = moment().format();

          KEY_WORD_LIST.forEach(k => {
            LIST_HTML_XML += `<url><loc>https://www.nanshanqiao.com/zz_article/?word=${k}</loc><lastmod>${nowTime}</lastmod><priority>0.50</priority></url>`;
            LIST_HTML_HTML += `<li class="lpage"><a href="https://www.nanshanqiao.com/zz_article/?word=${k}" title="${k}">${k}</a></li>`;
          });
        }

        let resolveString = '';

        let TEMPLATE_LIST_XML = fs.readFileSync(path.join(TEMPLATE_URL, 'siteMap.xml'), 'utf-8');
        TEMPLATE_LIST_XML = TEMPLATE_LIST_XML.replace('${NSQ_LIST_HTML}', LIST_HTML_XML);
        let create_url_xml = path.join(config.NSQ_DIR, 'siteMap.xml');
        fs.writeFile(create_url_xml, TEMPLATE_LIST_XML, err => {
          let temp = resolveString;
          resolveString += `<br> 生成<a href="${create_url_xml}" target="_blank">siteMap.xml</a>成功`;
          if (temp) resolve(resolveString);
        });

        let TEMPLATE_LIST_HTML = fs.readFileSync(path.join(TEMPLATE_URL, 'siteMap.html'), 'utf-8');
        TEMPLATE_LIST_HTML = TEMPLATE_LIST_HTML.replace('${NSQ_LIST_HTML}', LIST_HTML_HTML);
        let create_url_html = path.join(config.NSQ_DIR, 'siteMap.html');
        fs.writeFile(create_url_html, TEMPLATE_LIST_HTML, err => {
          let temp = resolveString;
          resolveString += `<br> 生成<a href="${create_url_html}" target="_blank">siteMap.html</a>成功`;
          if (temp) resolve(resolveString);
        });
      });
    });
  }
  page404() {
    const sqlString =
      "SELECT a.*,b.name FROM `zz_article` as a, `zz_user` as b  WHERE  a.create_name = b.user and a.public='0' ORDER BY a.create_time DESC Limit 10";

    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      connection.connect();
      const sqlParams = [];
      //查
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
          return;
        }
        let LIST_HTML = '';
        if (Array.isArray(result)) {
          result.forEach(async row => {
            // 默认
            let img = '<img src="/zz_img/bk02.jpg" alt="...">';
            // 值
            let time = moment(row.create_time).format('YYYY-MM-DD HH:mm:ss');
            let id = row.id;
            let title = row.title;
            let name = row.name;
            let introduction = row.introduction;
            let key_word = row.key_word;
            let markdown = row.markdown;
            let content = row.content;

            let html = `<h3><a href="/zz_article/${id}.html">${title}</a></h3>
            <p><span >作者：<a href="/zz_article/?word=${name}">${name}</a></span> •<time>${time}</time></p>
            <small>${introduction}</small>`;
            LIST_HTML += html;
          });
        }

        let TEMPLATE_LIST_HTML = fs.readFileSync(path.join(TEMPLATE_URL, '404.html'), 'utf-8');
        TEMPLATE_LIST_HTML = TEMPLATE_LIST_HTML.replace('${NSQ_LIST_HTML}', LIST_HTML);
        let create_url = path.join(config.NSQ_DIR, '404.html');
        fs.writeFile(create_url, TEMPLATE_LIST_HTML, err => {
          resolve('<br> 生成<a href="' + create_url + '" target="_blank">404</a>成功');
        });
      });
    });
  }
  all() {
    return Promise.all([
      this.pageIndex(),
      this.articleList(),
      this.photoList(),
      this.bookList(),
      this.linkList(),
      this.siteMap(),
      this.page404(),
    ]);
  }
}

module.exports = className;
