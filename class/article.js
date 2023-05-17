var {
  utilsSql,
  moment,
  fs,
  TOKEN,
  HtmlSpecialChars,
  config,
  path,
} = require("../utils");
const Pic = require("../class/pic");
const PIC = new Pic();
const Create = require("../class/create");
const CREATE_CLASS = new Create();

class ClassName {
  constructor(TOKEN_USER_INFO) {
    this.tableName = "zz_article";
    this.TOKEN_USER_INFO = TOKEN_USER_INFO;
  }
  setToken(TOKEN_USER_INFO) {
    this.TOKEN_USER_INFO = TOKEN_USER_INFO;
  }
  getTypes() {
    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      connection.connect();

      const sqlString = ` SELECT DISTINCT  type From  ${this.tableName}`;
      const sqlParams = [];
      //查
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
          return;
        }

        resolve(result.map((e) => e.type));
      });
      connection.end();
    });
  }
  // 公开 上下页
  getU(id) {
    return this.getUD(id, [0, "<", id, "desc"]);
  }
  getD(id) {
    return this.getUD(id, [0, ">", id, "asc"]);
  }
  // 隐私 上下页 TODO:或许应该是 去public
  getUU(id) {
    return this.getUD(id, [1, "<", id, "desc"]);
  }
  getDD(id) {
    return this.getUD(id, [1, ">", id, "asc"]);
  }
  getUD(id, sql_params) {
    const DEFAULT_U_D = { p: "index", t: "无，返回列表" };
    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      const sqlString = `SELECT id,title FROM ${this.tableName} WHERE public=? and id ${sql_params[1]} ${sql_params[2]} order by id ${sql_params[3]} limit 1`;
      const sqlParams = sql_params;
      connection.query(sqlString, sqlParams, (err, result) => {
        if (err) {
          resolve(DEFAULT_U_D);
        } else {
          if (result.length == 1) {
            let one = result[0];
            resolve({ p: one.id, t: one.title });
          } else {
            resolve(DEFAULT_U_D);
          }
        }
      });
      connection.end();
    });
  }

  // public function getU($id) {

  // $this -> id = $id;
  // $result1 = mysql_query("select id,title from zz_article where public=0 and id < " . $this -> id . " order by id desc limit 1");

  // if (mysql_num_rows($result1) > 0) {
  //   // 输出数据
  //   while ($row = mysql_fetch_assoc($result1)) {
  //     $this -> u["p"] = $row["id"];
  //     $this -> u["t"] = $row["title"];
  //   }
  // return $this -> u;
  // public $u = array("p" => "index", "t" => "无，返回列表");
  // public $d = array("p" => "index", "t" => "无，返回列表");
  // public $uu = array("p" => "index", "t" => "无，返回列表");
  // public $dd = array("p" => "index", "t" => "无，返回列表");
  // }
  // return $this -> u;

  getById(id) {
    const connection = utilsSql();
    return new Promise((resolve, reject) => {
      let promiseList = [this.getU(id), this.getD(id)];

      Promise.all(promiseList)
        .then((res) => {
          const UD = {
            u: res[0],
            d: res[1],
          };

          const sqlString = `
          SELECT a.id,a.title,b.name,a.key_word,a.type,a.introduction,a.content,a.create_time,a.public,a.top,a.group,a.markdown,a.css 
          FROM ${this.tableName} AS a, zz_user AS b 
          WHERE a.id=? AND a.create_name = b.user`;
          const sqlParams = [id];

          connection.query(sqlString, sqlParams, function (err, result) {
            if (err) {
              reject(`SELECT ${this.tableName} ERROR`);
              return;
            }
            let one = result[0];

            one["ud"] = UD;
            one["create_name"] = one.name;
            // htmlspecialchars_decode(string,ENT_QUOTES)将特殊的HTML实体转换回普通字符, 单引号和双引号都转换。
            // htmlspecialchars — 将特殊字符转换为 HTML 实体
            one["content"] = HtmlSpecialChars.decode(one.content);

            resolve(one);
          });

          connection.end();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  isPublic(id, user) {
    const connection = utilsSql();
    return new Promise((resolve, reject) => {
      let sqlString = `SELECT content From ${this.tableName} WHERE (id=? AND create_name=?)`;
      if(user=='gr'){
        sqlString = `SELECT content From ${this.tableName} WHERE id=?`;
      }
      const sqlParams = [id, user];
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          console.log(err);

          console.log(err);

          reject(`SELECT ${user} Article content ERROR`);
          return;
        }
        if (Array.isArray(result) && result.length == 1) {
          let one = result[0];
          // htmlspecialchars_decode(string,ENT_QUOTES)将特殊的HTML实体转换回普通字符, 单引号和双引号都转换。
          // htmlspecialchars — 将特殊字符转换为 HTML 实体
          resolve(HtmlSpecialChars.decode(one.content));
        } else {
          reject(result);
        }
      });
      connection.end();
    });
  }

  add(o) {
    const THIS_CLASS = this;
    return new Promise((resolve, reject) => {
      const HTML_CONTENT = o.content;
      const connection = utilsSql();
      o["create_name"] = this.TOKEN_USER_INFO.user;
      o["create_time"] = moment().format("YYYY-MM-DD HH:mm:ss");
      o.content = HtmlSpecialChars.encoded(o.content);
      const sqlString = `INSERT INTO ${this.tableName} (title, key_word, type, introduction, content, create_name, create_time, public, top, \`group\`, markdown, css) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
      const sqlParams = [
        o.title,
        o.key_word,
        o.type,
        o.introduction,
        o.content,
        o.create_name,
        o.create_time,
        o.public,
        "0",
        o.group,
        o.markdown,
        o.css,
      ];

      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
        } else {
          // console.log('INSERT ID:', result.insertId);

          // 检测图片
          const reg = /<img\s.{0,10}src="data:image(.*?)>/gi;
          const MATCH_IMG_LIST = HTML_CONTENT.match(reg);
          if (Array.isArray(MATCH_IMG_LIST)) {
            MATCH_IMG_LIST.forEach((IMG, index) => {
              let temp = IMG.split("data:image/")[1];
              const IMG_BASE64 = "data:image/" + temp.split(/[\'\"]/)[0];
              // console.log(`---------- IMG ${index} start-----------------`);
              // 保存图片
              PIC.addBase64(IMG_BASE64)
                .then((uploadPic) => {
                  const oo = {
                    url: uploadPic.url,
                    alt: o.title + "_" + index,
                    from: "article",
                    group: result.insertId,
                    create_name: THIS_CLASS.TOKEN_USER_INFO.user,
                  };
                  // 写入数据库
                  PIC.add(oo).then((result) => {
                    // console.log('Article update => PIC.addBase64 => add result');
                    // console.log(result);
                  });
                })
                .catch((err) => {
                  // console.log('Article update => PIC.addBase64 => err');
                  // console.log(err);
                });
              // console.log(`---------- IMG ${index} end-----------------`);
            });
          }

          THIS_CLASS.create(result.insertId);
          THIS_CLASS.articleRelated(result.insertId);
          resolve(result.insertId);
        }
      });
      connection.end();
    });
  }

  list(o = {}) {
    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      let condition = { keys: [], values: [] };
      for (let key in o) {
        condition.keys.push(`\`${key}\` = ?`);
        condition.values.push(o[key]);
      }
      const conditionString = condition.keys.length
        ? condition.keys.join(" AND ")
        : "1=1";

      const sqlString = `SELECT id,title,public,create_name,type,create_time FROM ${this.tableName} WHERE  ${conditionString} ORDER BY id DESC`;
      const sqlParams = [...condition.values];

      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
      connection.end();
    });
  }
  update(o = {}) {
    const THIS_CLASS = this;
    return new Promise((resolve, reject) => {
      const HTML_CONTENT = o.content || "";
      const connection = utilsSql();
      let setter = { keys: [], values: [] };
      let condition = { keys: [], values: [] };

      for (let key in o) {
        if (key == "content") o.content = HtmlSpecialChars.encoded(o.content);
        if (key == "id") {
          condition.keys.push(`\`${key}\` = ?`);
          condition.values.push(o[key]);
        } else {
          setter.keys.push(`\`${key}\` = ?`);
          setter.values.push(o[key]);
        }
      }
      const sqlString = `UPDATE  ${this.tableName} SET  ${setter.keys.join(
        ","
      )}  WHERE ${condition.keys.join(",")}`;

      const sqlParams = [...setter.values, ...condition.values];
      // console.log('update sqlString', sqlString);
      // console.log('update sqlParams', sqlParams);
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
        } else {
          // 检测图片
          const reg = /<img\s.{0,10}src="data:image(.*?)>/gi;
          const MATCH_IMG_LIST = HTML_CONTENT.match(reg);
          if (Array.isArray(MATCH_IMG_LIST)) {
            MATCH_IMG_LIST.forEach((IMG, index) => {
              let temp = IMG.split("data:image/")[1];
              const IMG_BASE64 = "data:image/" + temp.split(/[\'\"]/)[0];
              // console.log(`---------- IMG ${index} start-----------------`);
              // 保存图片
              PIC.addBase64(IMG_BASE64)
                .then((uploadPic) => {
                  const oo = {
                    url: uploadPic.url,
                    alt: o.title + "_" + index,
                    from: "article",
                    group: o.id,
                    create_name: THIS_CLASS.TOKEN_USER_INFO.user,
                  };
                  // 写入数据库
                  PIC.add(oo).then((result) => {
                    // console.log('Article update => PIC.addBase64 => add result');
                    // console.log(result);
                  });
                })
                .catch((err) => {
                  // console.log('Article update => PIC.addBase64 => err');
                  // console.log(err);
                });
              // console.log(`---------- IMG ${index} end-----------------`);
            });
          }

          THIS_CLASS.create(o.id);
          THIS_CLASS.articleRelated(o.id);
          resolve(result.affectedRows);
        }
      });
      connection.end();
    });
  }
  delete(id) {
    return new Promise((resolve, reject) => {
      // 随机定义备份文件名
      const PATH =
        config.NSQ_BACKUP_DIR +
        "/delete_" +
        this.tableName +
        "_" +
        moment().format("YYYY-MM-DD_HHmmss") +
        ".txt";
      //获取备份信息
      this.getById(id)
        .then((result) => {
          const TXT = JSON.stringify(result);

          //备份
          fs.writeFile(PATH, TXT, (err) => {
            if (err) {
              reject(err);
            } else {
              //删除 id
              const connection = utilsSql();
              connection.connect();
              const sqlString = ` DELETE FROM  ${this.tableName} WHERE id = ?`;
              const sqlParams = [id];
              //查
              connection.query(sqlString, sqlParams, function (err, result) {
                if (err) {
                  reject(err);
                  return;
                }
                resolve(result);
              });
              connection.end();
            }
            resolve(PATH);
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  search(word) {
    let user = "guest";
    if (this.TOKEN_USER_INFO && this.TOKEN_USER_INFO.user) {
      user = this.TOKEN_USER_INFO.user;
    }
    return new Promise((resolve, reject) => {
      const connection = utilsSql();
      connection.connect();

      const sqlString = `
      SELECT a.id,a.title, a.introduction, a.create_time,  b.name  FROM ${this.tableName} AS a, zz_user AS b  WHERE  a.create_name = b.user  and    (a.public= 0 OR(a.public= 1  AND a.create_name= ?) )  and(
        b.name like '%${word}%'
        or a.type like '%${word}%'
        or a.key_word like '%${word}%'
        or a.content like '%${word}%'
        or a.title like '%${word}%'
        or a.introduction like '%${word}%'
     )
     order by a.top desc, a.create_time desc`;
      const sqlParams = [user];

      // console.log(sqlString, sqlParams);
      //查
      connection.query(sqlString, sqlParams, function (err, result) {
        if (err) {
          reject(err);
          return;
        }
        let LIST_HTML = "";
        let last_y = "";
        let html_year = "";
        if (Array.isArray(result)) {
          result.forEach(async (row) => {
            // 值
            let create_time = moment(row.create_time).format(
              "YYYY-MM-DD HH:mm:ss"
            );
            let time_y = moment(row.create_time).format("YYYY");
            let time_m_d = moment(row.create_time).format("MM月DD日");
            let id = row.id;
            let title = row.title;
            // let name = row.name;
            let introduction = row.introduction;
            // let key_word = row.key_word;
            // let markdown = row.markdown;
            // let content = row.content;

            if (last_y == time_y) {
              html_year = "";
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
        resolve(LIST_HTML);
      });
      connection.end();
    });
  }

  /**
   *  id 未传参默认为所有
   * @returns
   */
  create() {
    const THIS_CLASS = this;
    const LIST = [...arguments];
    let id_sql =
      LIST.length == 1 && LIST[0] ? "AND a.id='" + LIST[0] + "' " : "";
    const sqlString =
      "SELECT a. * , b.name,c.name AS bname FROM zz_article AS a LEFT JOIN zz_user AS b ON a.create_name = b. USER LEFT JOIN zz_book AS c ON a.`group` = c.id WHERE 1=1  " +
      id_sql +
      " ORDER BY a.create_time";
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
        if (Array.isArray(result)) {
          let d_ = [];
          result.forEach(async (row) => {
            let id = row.id;
            let title = row.title;
            let key_word = row.key_word;
            let type = row.type;
            let introduction = row.introduction;
            let content = row.content;
            let markdown = row.markdown;
            let css = row.css;
            let create_name = row.name;
            let create_time = moment(row.create_time).format(
              "YYYY-MM-DD HH:mm:ss"
            );
            let public_ = row.public;
            let top = row.top;
            let group = row.group;
            let create_url = path.join(
              config.NSQ_ARTICLE_DEFAULT_DIR,
              id + ".html"
            );

            if (group != 0 || group != "0") {
              type += "《" + create_name + "》";
            }

            let keywordHtml = "";
            let arr1 = key_word.split(",");
            let arr2 = key_word.split("+");
            let arr = arr1.length > arr2.length ? arr1 : arr2;
            let meta_key_word = "关尔先生";
            arr.forEach((key) => {
              if (key != "" && key != " ") {
                keywordHtml +=
                  '<span class="glyphicon glyphicon-bookmark" aria-hidden="true"></span><a href="/zz_article/?word=' +
                  key +
                  '">' +
                  key +
                  "</a>";
                meta_key_word += "," + key;
              }
            });

            key_word = keywordHtml;
            let uPage = await THIS_CLASS.getU(id);
            let dPage = await THIS_CLASS.getD(id);

            let public_js = "";
            if (public_ == "1" || public_ == 1) {
              public_js = '  <script src="/zz_js/isPublic.js"></script>';
              content =
                "<br><h2>这是一篇未公开的文章</h2><h3>如需查看，请于评论处留言作者</h3>";
            }

            const HTTP_HOST = "www.nanshanqiao.com";
            let HTML = "";

            HTML += "<!DOCTYPE html>";
            HTML += '<html lang="zh-CN">';
            HTML += "<head>";
            HTML += '	<meta charset="utf-8">';
            HTML += '	<meta http-equiv="X-UA-Compatible" content="IE=edge">';
            HTML +=
              '	<meta name="viewport" content="width=device-width, initial-scale=1">';
            HTML += "	<title>" + title + "-文章-关尔先生</title>";
            HTML +=
              '  <meta name="keywords" content="' + meta_key_word + '" />';
            HTML +=
              '  <meta name="description" content="' + introduction + '" />';
            HTML +=
              '	<link rel="stylesheet" href="https://cdn.static.runoob.com/libs/bootstrap/3.3.7/css/bootstrap.min.css">';
            HTML += '	<link rel="stylesheet" href="/zz_css/index.css">';
            HTML += '	<link rel="stylesheet" href="/zz_css/md.css">';
            HTML +=
              '	<script src="https://cdn.static.runoob.com/libs/jquery/2.1.1/jquery.min.js"></script>';
            HTML +=
              '  <script src="https://cdn.static.runoob.com/libs/bootstrap/3.3.7/js/bootstrap.min.js"></script>';
            HTML += '  <script src="/zz_js/index.js"></script>';
            HTML += ' 	<script src="/zz_js/layer.js"></script>';
            HTML += ' 	<script src="/zz_js/marked.min.js"></script>';
            HTML += '	<script src="/zz_js/comment.js"></script>';
            HTML += public_js;
            HTML += "</head>";
            HTML += "<body>";
            HTML +=
              '	<nav class="navbar navbar-fixed-top navbar-default " role="navigation">';
            HTML += '		<div class="container-fluid">';
            HTML += '        <div class="row" style="height: auto">';
            HTML += '			<div class="col-md-1"></div>';
            HTML += '               <div  class="col-md-10">';
            HTML += '			<div class="navbar-header">';
            HTML +=
              '				<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#example-navbar-collapse">';
            HTML +=
              '                      <span class="sr-only">切换导航</span>';
            HTML += '                      <span class="icon-bar"></span>';
            HTML += '                      <span class="icon-bar"></span>';
            HTML += '                      <span class="icon-bar"></span>';
            HTML += "                   </button>";
            HTML += "			</div>";
            HTML +=
              '			<div class="collapse navbar-collapse" id="example-navbar-collapse">';
            HTML += '				<ul class="nav navbar-nav">';
            HTML += "					<li>";
            HTML += '						<a href="/">Home</a>';
            HTML += "					</li>";
            HTML += '					<li class="active">';
            HTML += '						<a href="/zz_article/">Article</a>';
            HTML += "					</li>";
            HTML += "					<li>";
            HTML += '						<a href="/zz_photo/">Photo</a>';
            HTML += "					</li>";
            HTML += "					<li>";
            HTML += '						<a href="/zz_book/">Book</a>';
            HTML += "					</li>";
            HTML += "					<li>";
            HTML += '						<a href="/zz_friend/">Friend</a>';
            HTML += "					</li>";
            HTML += "					<li>";
            HTML += '						<a href="/zz_login/">Login</a>';
            HTML += "					</li>";
            HTML += "				</ul>";
            HTML +=
              '				<form class="navbar-form navbar-right form-inline" role="search" action="/zz_article/">';
            HTML += '					<div class="form-group">';
            HTML +=
              '							<input name="word" type="text" required class="form-control" placeholder="Search">';
            HTML +=
              '							<button type="submit"  class="btn btn-default btn-submit-search">';
            HTML +=
              '                                  <span class="glyphicon glyphicon-search" aria-hidden="true"></span>';
            HTML += "                          </button>";
            HTML += "					</div>";
            HTML += "				</form>";
            HTML += "			</div>";
            HTML += "		    </div>";
            HTML += '			<div class="col-md-1"></div>';
            HTML += "		</div>";
            HTML += "		</div>";
            HTML += "	</nav>";
            HTML += '	<div id="section1" class="container-fluid">';
            HTML += '		<div class="row" class="" style="height: auto">';
            HTML += '			<div class="col-md-1"></div>';
            HTML += '			<div class="col-sm-12 col-md-10 article well">';
            HTML +=
              '              <h1 class="article-title text-center">' + title;
            HTML +=
              '                  <small class="article-type"><span class="glyphicon glyphicon-paperclip" aria-hidden="true"></span>' +
              type +
              "</small>";
            HTML += "              </h1>";
            HTML += "              <blockquote>";
            HTML +=
              '                   <p class="article-introduction">' +
              introduction +
              "</p>";
            HTML +=
              '                   <footer class="article-create_name"><span class="glyphicon glyphicon-user" aria-hidden="true"></span>' +
              create_name +
              '<span class="glyphicon glyphicon-time" aria-hidden="true"></span><cite title="" class=" article-create_time">' +
              create_time +
              "</cite></footer>";
            HTML += "              </blockquote>";
            if (markdown == "1") {
              HTML +=
                '              <div class="article-content is-markdown ' +
                css +
                '">' +
                HtmlSpecialChars.decode(content) +
                "</div>";
            } else {
              HTML +=
                '              <div class="article-content is-html">' +
                HtmlSpecialChars.decode(content) +
                "</div>";
            }
            HTML +=
              '              <h4 class="article-key_word">' +
              key_word +
              "</h4>";
            HTML +=
              '              <p><a href="/zz_article/' +
              uPage["p"] +
              '.html" class="article-up">上一篇：' +
              uPage["t"] +
              "</a></p>";
            HTML +=
              '              <p><a href="/zz_article/' +
              dPage["p"] +
              '.html" class="article-down">下一篇：' +
              dPage["t"] +
              "</a></p>";
            HTML +=
              '              <a  href="/zz_article/' +
              id +
              '.html">本文链接： http://' +
              HTTP_HOST +
              "/zz_article/" +
              id +
              ".html</a>";
            HTML += "          </div>";
            HTML += '			<div class="col-md-1"></div>';
            HTML += "		</div>";

            HTML += '		<div class="row">';
            HTML += '			<div class="col-md-1"></div>';
            HTML += '			<div class="col-sm-12 col-md-10 editor-toolbar">';
            HTML +=
              '				<div class="btn-toolbar" data-role="editor-toolbar" data-target="#editor">';
            HTML += '					<div class="btn-group first-group">';
            HTML +=
              '						<a class="btn" data-edit="bold"><i class="glyphicon glyphicon-bold"></i></a>';
            HTML +=
              '						<a class="btn" data-edit="strikethrough"><i class="glyphicon glyphicon-minus"></i></a>';
            HTML +=
              '						<a class="btn" data-edit="italic"><i class="glyphicon glyphicon-italic"></i></a>';
            HTML +=
              '						<a class="btn" data-edit="underline"><i class="glyphicon glyphicon-text-color"></i></a>';
            HTML += "					</div>";
            HTML += '					<div class="btn-group">';
            HTML +=
              '						<a class="btn dropdown-toggle" data-toggle="dropdown" title="Font"><i class="glyphicon glyphicon-font"></i><b class="caret"></b></a>';
            HTML += '						<ul class="dropdown-menu">';
            HTML += "						</ul>";
            HTML += "					</div>";
            HTML += '					<div class="btn-group">';
            HTML +=
              '						<a class="btn" data-edit="insertunorderedlist"><i class="glyphicon glyphicon-th-list"></i></a>';
            HTML +=
              '						<a class="btn" data-edit="insertorderedlist"><i class="glyphicon glyphicon-list-alt"></i></a>';
            HTML += "					</div>";
            HTML += '					<div class="btn-group">';
            HTML +=
              '						<a class="btn" data-edit="outdent"><i class="glyphicon glyphicon-indent-left"></i></a>';
            HTML +=
              '						<a class="btn" data-edit="indent"><i class="glyphicon glyphicon-indent-right"></i></a>';
            HTML += "					</div>";
            HTML += '					<div class="btn-group">';
            HTML +=
              '						<a class="btn" data-edit="justifyleft"><i class="glyphicon glyphicon-align-left"></i></a>';
            HTML +=
              '						<a class="btn" data-edit="justifycenter"><i class="glyphicon glyphicon-align-center"></i></a>';
            HTML +=
              '						<a class="btn" data-edit="justifyright"><i class="glyphicon glyphicon-align-right"></i></a>';
            HTML +=
              '						<a class="btn" data-edit="justifyfull"><i class="glyphicon glyphicon-align-justify"></i></a>';
            HTML += "					</div>";
            HTML += '					<div class="btn-group">';
            HTML +=
              '						<a class="btn dropdown-toggle" data-toggle="dropdown"><i class="glyphicon glyphicon-text-height"></i>&nbsp;<b class="caret"></b></a>';
            HTML += '						<ul class="dropdown-menu">';
            HTML += "							<li>";
            HTML += '								<a data-edit="fontSize 5">';
            HTML += '									<font size="5">Huge</font>';
            HTML += "								</a>";
            HTML += "							</li>";
            HTML += "							<li>";
            HTML += '								<a data-edit="fontSize 3">';
            HTML += '									<font size="3">Normal</font>';
            HTML += "								</a>";
            HTML += "							</li>";
            HTML += "							<li>";
            HTML += '								<a data-edit="fontSize 1">';
            HTML += '									<font size="1">Small</font>';
            HTML += "								</a>";
            HTML += "							</li>";
            HTML += "						</ul>";
            HTML += "					</div>";
            HTML += '					<div class="btn-group">';
            HTML +=
              '						<a class="btn dropdown-toggle" data-toggle="dropdown"><i class="glyphicon glyphicon-link"></i></a>';
            HTML += '						<div class="dropdown-menu input-append">';
            HTML +=
              '							<input class="span2" placeholder="URL" type="text" data-edit="createLink" />';
            HTML += '							<button class="btn" type="button">Add</button>';
            HTML += "						</div>";
            HTML +=
              '						<a class="btn" data-edit="unlink"><i class="glyphicon glyphicon-scissors"></i></a>';
            HTML += "					</div>";
            HTML += "				</div>";
            HTML += '				<div id="editor">';
            HTML += "				</div>";
            HTML +=
              '				<br><button id="editor_go" type="button" class="btn btn-default">评论一下</button>';
            HTML += "			</div>";
            HTML += '			<div class="col-md-1"></div>';
            HTML += "		</div>";

            HTML += '		<div class="row">';
            HTML += '			<div class="col-md-1"></div>';
            HTML += '			<div id="comment" class="col-sm-12 col-md-10 comment">';
            HTML += "暂无评论";
            HTML += "			</div>";
            HTML += '			<div class="col-md-1"></div>';
            HTML += "		</div>";
            HTML += "	</div>";
            HTML += '	<script src="/zz_js/editor.js"></script>';
            HTML +=
              '	<script>$(document).ready(function(){ if ($(".is-markdown").length > 0) { $(".is-markdown").html(marked($(".is-markdown").html()))}});</script>';
            HTML += "</body>";
            HTML += "</html>";
            fs.writeFile(create_url, HTML, (err) => {
              console.log(create_url);
              d_.push(
                '<br> 生成<a href="' +
                  create_url +
                  '" target="_blank">' +
                  title +
                  "</a>成功"
              );
              if (d_.length == result.length) resolve(d_);
            });
          });
        } else {
          resolve("no result");
        }
      });
      connection.end();
    });
  }
  async articleRelated(id) {
    const THIS_CLASS = this;
    if (id) {
      let uPage = await THIS_CLASS.getU(id);
      let uuPage = await THIS_CLASS.getUU(id);
      let dPage = await THIS_CLASS.getD(id);
      let ddPage = await THIS_CLASS.getDD(id);
      if (uPage.p != "index") this.create(uPage.p);
      if (uuPage.p != "index") this.create(uuPage.p);
      if (dPage.p != "index") this.create(dPage.p);
      if (ddPage.p != "index") this.create(ddPage.p);
    }
    CREATE_CLASS.pageIndex();
    CREATE_CLASS.articleList();
    CREATE_CLASS.bookList();
  }
}

module.exports = ClassName;
