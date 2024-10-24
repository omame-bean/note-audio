const bcrypt = require('bcryptjs');
const password = process.argv[2];

if (!password) {
  console.error('パスワードを引数として指定してください');
  process.exit(1);
}

bcrypt.genSalt(10, function(err, salt) {
  if (err) {
    console.error('ソルト生成エラー:', err);
    process.exit(1);
  }
  bcrypt.hash(password, salt, function(err, hash) {
    if (err) {
      console.error('ハッシュ化エラー:', err);
      process.exit(1);
    }
    console.log('ハッシュ化されたパスワード:', hash);
  });
});
