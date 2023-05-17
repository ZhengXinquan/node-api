var path = require("path");
const nsq_dir = "C:\\project\\nsq";
var config = {
  NSQ_IMG_WEB_URL: "/img.php?",
  NSQ_DIR: nsq_dir,
  NSQ_UPLOAD_IMG_DIR: path.join(nsq_dir, "zz_upload_img"),
  NSQ_BACKUP_DIR: path.join(nsq_dir, "zz_back_up"),
  NSQ_ARTICLE_DEFAULT_DIR: path.join(nsq_dir, "zz_article"),
  NSQ_PHOTO_DEFAULT_DIR: path.join(nsq_dir, "zz_photo"),
  NSQ_BOOK_DEFAULT_DIR: path.join(nsq_dir, "zz_book"),
  NSQ_FRIEND_DEFAULT_DIR: path.join(nsq_dir, "zz_friend"),

  DEFAULT_SALT: "grxs",
};
module.exports = config;
