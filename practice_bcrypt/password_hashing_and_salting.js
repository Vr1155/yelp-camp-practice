// Bycrpt is a npm library that helps us salt and hash user passwords.

// Note that there are 2 Bycrpt npm packages:
// node.bcrypt.js (only works on server (node) and is faster since it is built on top of c++)
// bcrypt.js (works on server as well as client)

// Although It doesnt matter which one you choose,
// since we are not going to use it in browser and that extra speed is ok for now,
// we will deal with node.bcrypt.js over here.

// npm docs: https://www.npmjs.com/package/bcrypt

// ===================================================================

// Password hashing:

// Incase of a data breach,
// you dont want hackers to have direct access to your client's passwords,
// For that purpose, you hash passwords before storing them in db.
// This hashing can be done on client side or server side.
// Since, it is recommended to not trust the client, we do it on server side.

// ===================================================================

// Password salting:

// Most users use same password for many different accounts.
// A lot of users are lazy and use some very simple and common password,
// See some common passwords: https://en.wikipedia.org/wiki/List_of_the_most_common_passwords

// Therefore, most hackers keep a database of common passwords and their hashed values (with sha-2 or some other family of hash functions),
// If there is any breach of server side database,
// they can simply compare hashes from their db and your breached db and
// and lots of your client's accounts will get compromised.

// To avoid this, we add some salt to client's password before hashing them!
// for eg:
// if client password is : "password", we can add salt: "DOG"
// So final password: "passwordDog"
// Which after sha-256 becomes: "55fd66b3fe47f98459db76e36c7a7429e72e726ec51d698d80059673f0e744e0"
// This can now be stored safely in db.

// But now the problem comes of storing salts.

// bcrypt helps us solve this problem of password salting, hashing and combined storage of password salts and hashes.

// ========================================================

// bcrypt npm package:

// bcrypt is an npm package that helps us salt and hash passwords.
// salt of each password is pretty randomized,
// and salt of each password is contained in final hash itself.

// so you only need to store final hash since it contains salt and password.

// You don't want hashing passwords to be fast since,
// hackers can easily brute force it.

// saltRounds is the hashing difficulty of a password,
// optimal difficulty should be about 250 milliseconds.

// set it to 12 for optimal speed and hashing difficulty to avoid brute force attacks.

// ===============================================================

const bcrypt = require("bcrypt");

const passwordSalter = async () => {
  // we will use the promise based syntax of bcrypt

  // creating salt with optimal saltRounds (hashing difficulty) of 12.
  const salt = await bcrypt.genSalt(12);
  console.log("This a random salt: ", salt);
};

passwordSalter();

const passwordHasherVerbose = async plainTextPassword => {
  //   // we will use the promise based syntax of bcrypt
  //   // creating salt with optimal saltRounds (hashing difficulty) of 12.
  const salt = await bcrypt.genSalt(12);
  console.log("This is the salt for your password: ", salt);

  // hashing password with plaintext and salt
  const hash = await bcrypt.hash(plainTextPassword, salt);
  console.log(
    "This was your password: ",
    plainTextPassword,
    " This is the hash for your password: ",
    hash
  );
};

// Notice that how randomized salt is present in final hash as well.
passwordHasherVerbose("monkey");

// bcrypt has a method called "compare"
// to which we provide another plain text password and a hash,
// then, bcrypt will figure out what the salt was in that hash,
// and hash that new plaintext password with same salt,
// and check if new hash is same as input hash,
// if it is that means our given plaintext password is the original password.
// if it isn't, that means given plaintext is not the original password.

// In this way we can authenticate whether given password is correct or not.

const passwordChecker = async (plainTextPassword, hashedPassword) => {
  const result = await bcrypt.compare(plainTextPassword, hashedPassword);

  if (result) {
    console.log(
      `Your password was correct! Login Successful! You entered ${plainTextPassword} and This was the result: ${result}`
    );
  } else {
    console.log(
      `Your password was incorrect! Access Denied! You entered ${plainTextPassword} and This was the result: ${result}`
    );
  }
};

// login with correct password:
passwordChecker(
  "monkey",
  "$2b$12$MOUTW41YeRESl4a2WhW1DOW6La7HC./lo0bx7Cnxko6KEMpj4kxm6"
);

// login with wrong password:
passwordChecker(
  "password",
  "$2b$12$MOUTW41YeRESl4a2WhW1DOW6La7HC./lo0bx7Cnxko6KEMpj4kxm6"
);

// Notice that the salt is in the hash, it is not a secret,
// it is only there to add some randomness to our hashes
// and make it difficult for hackers to reverse engineer or compare with hacker's own precomputed hashes.

const passwordHasherConcise = async plainTextPassword => {
  // Instead of generating and passing salts separately,
  // you could simply pass saltRounds into hash() and get your final hash directly:

  const hash = await bcrypt.hash(plainTextPassword, 12);

  console.log(
    "This was your password: ",
    plainTextPassword,
    " This is the hash for your password: ",
    hash
  );
};

passwordHasherConcise("password");

// login with correct password:
passwordChecker(
  "password",
  "$2b$12$PSyhkRDooGKg2/mb5ulWEe/yuyTLjoz98jMYvM7RyAw64lcOasa3K"
);

// login with wrong password:
passwordChecker(
  "WrongPasswordLOL",
  "$2b$12$PSyhkRDooGKg2/mb5ulWEe/yuyTLjoz98jMYvM7RyAw64lcOasa3K"
);

// Since we are using async functions along with promises,
// it is possible that some functions finish execution early and some late.
