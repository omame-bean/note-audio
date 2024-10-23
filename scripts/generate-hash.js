const bcrypt = require('bcryptjs');
const password = process.argv[2];

if (!password) {
  console.error('パスワードを引数として指定してください');
  process.exit(1);
}

bcrypt.genSalt(10, function(err, salt) {
  bcrypt.hash(password, salt, function(err, hash) {
    console.log('ハッシュ化されたパスワード:', hash);
  });
});
