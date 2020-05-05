//variables importing packages
  var express = require('express');
  var hbs = require('express-handlebars');
  var expressValidator = require('express-validator');
  var flash = require('express-flash');
  var session = require('express-session');
  var bcrypt = require('bcrypt');
  var cookieParser = require('cookie-parser');
  var passport = require('passport');
  var LocalStrategy = require('passport-local');
  var mySQLStore = require('express-mysql-session')(session);
  const {check, validationResult} = require('express-validator');

  var path  = require('path');
  
  var bodyParser = require('body-parser');

  //configs the use of the database
  require('dotenv').config();
  //app
  var app = express();

  //View engine
  app.engine('hbs', hbs({extname: '.hbs', defaultLayout: '', layoutsDir: __dirname + '/views/', partialsDir: [__dirname + '/views/partials']}));
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'hbs');
  

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  //app.use(expressValidator());
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/jscript', express.static('jscript'));
  app.use('/css', express.static('css'));
  app.use(flash());
 
  app.use(function(req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
  })
  var options = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  }

  var sessionStore = new mySQLStore(options);

//creates session
  app.use(session({
    //keep secret as a random string of characters
    secret: 'lafjpq fqoffopjgoifhg ppqeofjqoi',
    store: sessionStore,
    resave: false,
    saveUnitialized: false, //make false to make sure no unneeded space is taken.
    //cookie: {secure: true}
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  /*app.use(function(req, res, next) {
    req.app.locals;
  })*/
  //checks to see if user signs in with correct information
  passport.use(new LocalStrategy(
    function(username, password, done) {
        console.log(username);
        console.log(password);
        const db = require('./db');
        db.query('SELECT * FROM users WHERE username = ?', [username], function(err, results, fields) {
          if (err) done(err);

          if(results === 0) done(null, false);

          else{
            console.log(results);
             console.log(results[0].pwd.toString());
            const hash = results[0].pwd.toString();
            bcrypt.compare(password, hash, function(err, response){
            if(response === true){
              console.log("it worked!");
              console.log(results[0]);
              var usrname = results[0].username;
              var email = results[0].email;
              var name = results[0].name;
              
              return done(null, {userID: results[0].userID, role: results[0].role, name: name, email: email, 
              username: usrname});
            }
            else{
              console.log("it didn't work.");
              if (err) console.log(err);
              return done(null, false);
            } 
            })
          }
         
         
        })
       
    }
  ));

  
  //routes; will probably put them into routing file
  //authentication routes
  app.get('/', function(req, res, next){
    res.render('index', {title: 'index'
    });
  });

  //gets the sign up page
  app.get('/signUp', function(req, res, next) {
    res.render('signUp', {title: 'signUp'});
  });

  //gets the sign in page
  app.get('/signIn', function(req, res, next) {
    res.render('signIn', {title: 'Sign In'});
  });

  //logout function
  app.get('/logout', function(req, res, next) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
  })

 
  //gets the account profile of the user; if user is coach, render coach account page and header; else, player
  app.get('/accountC', function(req, res, next) {
    const db  = require('./db');
    var role = req.user.role;
    var usrname = req.user.username;
    var name = req.user.name;
    var email = req.user.email;
    var id = req.user.userID;
    
    //
    if(role === 'c'){
      //NOTE: This part is bugged. Will render page with correct scores, but not correct genres and difficulties.
      //var play = 'p';
      //db.query('SELECT name, score FROM users INNER JOIN score ON score.userID = users.userID WHERE role = ? ORDER BY score', [play], function(err, results, fields){
      //db.query('SELECT score, name, genre, difficulty FROM users INNER JOIN score ON score.userID = user.userID INNER JOIN genre ON genre.genreID = score.genreID INNER JOIN difficulty ON difficulty.diff_ID = score.diff_ID', function(err, results, fields){
          
          db.query('SELECT name, CONCAT(MAX(score), " ", genre, " ", difficulty) AS best, CONCAT(MIN(score), " ", genre, " ", difficulty) AS worst FROM score INNER JOIN users ON users.userID = score.userID INNER JOIN genre ON genre.genreID = score.genreID INNER JOIN difficulty ON difficulty.diff_ID = score.diff_ID GROUP BY name', 
          function(er, result, field){
          //db.query('SELECT name, score, b.score, genreID, diff_ID FROM score INNER JOIN users ON users.userID = a.userID WHERE a.score = (SELECT MAX(score) FROM score AS s WHERE s.userID = score.userID) AND b.score = (SELECT MIN(score) FROM score AS s WHERE s.userID = score.userID) ', 
       /*db.query('SELECT MAX(score) AS best, genreID, diff_ID FROM score GROUP BY userID', function(err, result, field){

          console.log(result);
          db.query('SELECT MIN(score) AS worst, genreID, diff_ID FROM score GROUP BY userID', function(er, resulting, fiel){
            console.log(resulting);*/
          
            /*db.query('SELECT name, users.userID AS userID, MAX(score) as best, genreID, diff_ID FROM score INNER JOIN users ON users.userID = score.userID GROUP BY name ORDER BY userID', function(er, result, field){
              db.query('SELECT userID, score AS worst, genreID, diff_ID FROM score  WHERE score = (SELECT MIN(score) FROM score AS s where s.userID = score.userID)', function(e, resulting, fiel){
                console.log(resulting);*/
                res.render('accountC', {status: 'Coach', role: role, username: usrname, name: name, email: email, scores: result});
              });   
    }
    //renders player's account page plus header leading to other player page(s)
    else{
      db.query('SELECT * FROM score WHERE userID = ?', [id], function(err, results, fields){
        db.query('SELECT score, genre, difficulty FROM score INNER JOIN genre ON genre.genreID = score.genreID INNER JOIN difficulty ON difficulty.diff_ID = score.diff_ID  WHERE userID = ? ORDER BY score DESC', [id],
        function(er, result, field){
          console.log(result);
          res.render('accountP', {status: 'Player', role: role, username: usrname, name: name, email: email, scores: result});
        });
      });
      
    }
    
  });

   //Coach routes
  //coach creates a question
  app.get('/createQuestion', function(req, res, next) {
    const db = require('./db');
    var genre;
    var difficulty;
    db.query('SELECT * FROM genre', function(err, results, fields) {
      genre = results;
      db.query('SELECT * FROM difficulty', function(err, result, fields) {
        difficulty = result;
        console.log(difficulty);
        res.render('createQuestion', {title: 'Create a Question', genre: genre, difficulty: difficulty});
      });
      
    });
      
  });

  //coach "reads" all the questions
  app.get('/questionEdit', function(req, res, next) {
    const db = require('./db');
    db.query('SELECT * FROM question', function(error, results, fields){
      var quest = results;
      console.log(results);
      res.render('questionEdit', {title: 'Edit a question', question: quest});
    });
   
  });

  //player goes to the "quiz"/selection page
  app.get('/selection', function(req, res, next){
    const db = require('./db');
    var genre;
    var difficulty;
    //incase the user tries to get sneaky with the quiz, flush the quiz.
    questions = [];
    answers = [];
    genres = [];
    difficulties = [];
    db.query('SELECT * FROM genre', function(err, results, fields) {
      genre = results;
      db.query('SELECT * FROM difficulty', function(err, result, fields) {
        difficulty = result;
        console.log(difficulty);
      res.render('selection', {genre: genre, difficulty: difficulty});
      });
    });
  });

  app.get('/quiz', function(req, res, next){
    //console.log(req.results);
    //console.log(questions);
    //console.log(answers);
    //questions = [];
    //answers = [];
    res.render('quiz', {question: questions[questionIndex], questNum: questionIndex + 1, quizTotal: quizTotal, genre: genres[genreIndex].genre, difficulty: difficulties[diffIndex].difficulty, answer: answers[answerIndex]});
  });
  
  //variables and arrays to store questions, answers, genres, and difficulties in for the quiz
  var questionIndex;
  var answerIndex;
  var genreIndex;
  var diffIndex;
  var quizTotal;
  var genreFilter;//genre filter
  var diffFilter;//difficulty filter
  let questions = [], answers = [], genres = [], difficulties = [];
  
  //Selects five random questions from question table
  app.get('/quiz5', function(req, res, next){
    const db = require('./db');
    console.log(diffFilter);
    if(genreFilter.length === 0 && diffFilter.length === 0){
      db.query('SELECT question, answer, genre, genre.genreID AS genreID, difficulty, difficulty.diff_ID AS diff_ID FROM question INNER JOIN genre ON genre.genreID = question.genreID INNER JOIN difficulty ON difficulty.diff_ID = question.diff_ID ORDER BY RAND() LIMIT 5', function(e, results, fields){

        for(var i = 0; i < results.length; i++){

          questions.push(results[i].question);
          answers.push(results[i].answer);
          genres.push(results[i]);
          difficulties.push(results[i]);
         
         
         //console.log(difficulties);
        // console.log(questions);
        // console.log(answers);
        } 
        console.log("Testing");
        console.log(genres);
        quizTotal = 5;
        res.redirect('/quiz');
      });
    }
    else if(genreFilter.length === 0 && diffFilter.length !== 0){
      db.query('SELECT question, answer, genre, genre.genreID AS genreID, difficulty, difficulty.diff_ID AS diff_ID FROM question INNER JOIN genre ON genre.genreID = question.genreID INNER JOIN difficulty ON difficulty.diff_ID = question.diff_ID WHERE difficulty = ? ORDER BY RAND() LIMIT 5', [diffFilter], function(e, results, fields){

        for(var i = 0; i < results.length; i++){

          questions.push(results[i].question);
          answers.push(results[i].answer);
          genres.push(results[i]);
          difficulties.push(results[i]);
         
         
         //console.log(difficulties);
        // console.log(questions);
        // console.log(answers);
        } 
        console.log("Testing");
        //console.log(genres);
        quizTotal = 5;
        res.redirect('/quiz');
      }); 
    }
    else if(genreFilter.length !== 0 && diffFilter.length === 0){
      db.query('SELECT question, answer, genre, genre.genreID AS genreID, difficulty, difficulty.diff_ID AS diff_ID FROM question INNER JOIN genre ON genre.genreID = question.genreID INNER JOIN difficulty ON difficulty.diff_ID = question.diff_ID WHERE genre = ? ORDER BY RAND() LIMIT 5', [genreFilter], function(e, results, fields){

        for(var i = 0; i < results.length; i++){

          questions.push(results[i].question);
          answers.push(results[i].answer);
          genres.push(results[i]);
          difficulties.push(results[i]);
         
         
         //console.log(difficulties);
        // console.log(questions);
        // console.log(answers);
        } 
        console.log("Testing");
        console.log(genres);
        quizTotal = 5;
        res.redirect('/quiz');
      }); 
    }
    else{
      db.query('SELECT question, answer, genre, genre.genreID AS genreID, difficulty, difficulty.diff_ID AS diff_ID FROM question INNER JOIN genre ON genre.genreID = question.genreID INNER JOIN difficulty ON difficulty.diff_ID = question.diff_ID WHERE genre = ? AND difficulty = ? ORDER BY RAND() LIMIT 5', [genreFilter, diffFilter], function(e, results, fields){
        console.log("It's here");
        for(var i = 0; i < results.length; i++){

          questions.push(results[i].question);
          answers.push(results[i].answer);
          genres.push(results[i]);
          difficulties.push(results[i]);
         
         
         //console.log(difficulties);
        // console.log(questions);
        // console.log(answers);
        } 
        console.log("Testing");
        console.log(genres);
        quizTotal = 5;
        res.redirect('/quiz');
      }); 
    }
  });
  //coach updates a question
  app.get('/updating', function(req, res, next){
    const db = require('./db');
    
    console.log(questID);
    db.query('SELECT question, answer, genre, difficulty FROM question INNER JOIN genre ON genre.genreID = question.genreID INNER JOIN difficulty ON difficulty.diff_ID = question.diff_ID WHERE questionID = ?', [questID], function(err, results, fields){
      console.log(results);
      var genre = results[0].genre;
      var difficulty = results[0].difficulty;
      var question = results[0].question;
      var answer = results[0].answer;
      db.query('SELECT genre FROM genre', function(er, genreList, field){
        //console.log(genreList);
        db.query('SELECT difficulty FROM difficulty', function(e, difficultyList, fiel){
          //console.log(difficultyList);
           res.render('updating', {question: question, answer: answer, difficulty: difficulty, genre: genre, genreList: genreList, diffList: difficultyList, questID: questID});
        })
      })
      
    });
    
   
  });

  //coach deletes a question
  app.get('/delete', function(req, res, next){
    const db = require('./db');
    db.query('DELETE FROM question WHERE questionID = ?', [questID], function(error, results, fields){
      res.redirect("questionEdit");
    });
  });
  
  //when hitting "next" button
  app.post('/quizNext', function(req, res, next){
    //console.log(req.body.answer);
    var playerAnswer = req.body.answer;
    var ans = answers[answerIndex];
    var genID = genres[genreIndex].genreID;
    var diffID = difficulties[diffIndex].diff_ID;

    //console.log(genID);
    const db = require('./db');
    var id = req.user.userID;
    //console.log(id);
    //console.log("chicken feet");
    //console.log(gen);
    //if player is correct
    if(playerAnswer.toUpperCase() === ans.toUpperCase()){
      db.query("SELECT * FROM score WHERE userID = ? AND genreID = ? AND diff_ID = ?",[id, genID, diffID], 
      function(err, results, fields){
        console.log(results);
        
        if(results.length === 0){
          console.log("Creating score...");
          if(diffID === 1){
             db.query("INSERT INTO score(score, userID, genreID, diff_ID) VALUES(?, ?, ?, ?)", [10, id, genID, diffID]);
          }
          else{
            db.query("INSERT INTO score(score, userID, genreID, diff_ID) VALUES(?, ?, ?, ?)", [15, id, genID, diffID]);
          }
        }
        else{
          var scoreID = results[0].scoreID; 
          console.log("Updating score...");
          console.log(scoreID);
          if(diffID === 1){
              db.query("UPDATE score SET score = score + 10 WHERE scoreID = ?", [scoreID]);
          }
          else{
            db.query("UPDATE score SET score = score + 15 WHERE scoreID = ?", [scoreID]);
          }
        }
      });
      //console.log('You get 10 points');
    }

    //if player is incorrect
    else{
      db.query("SELECT * FROM score WHERE userID = ? AND genreID = ? AND diff_ID = ?",[id, genID, diffID], 
      function(err, results, fields){
        console.log("Checking...");
        console.log(results);
       
        if(results.length === 0){
          //var scoreID = results[0].scoreID; 
          console.log("Creating score...");
          if(diffID === 1){
            console.log("inserting...");
             db.query("INSERT INTO score(score, userID, genreID, diff_ID) VALUES(?, ?, ?, ?)", [-10, id, genID, diffID]);
          }
          else{
            db.query("INSERT INTO score(score, userID, genreID, diff_ID) VALUES(?, ?, ?, ?)", [-15, id, genID, diffID]);
          }
        }
        else{
          var scoreID = results[0].scoreID;
          console.log("Updating sco...");
          console.log(scoreID);
          if(diffID === 1){
              db.query("UPDATE score SET score = score - 10 WHERE scoreID = ?", [scoreID]);
          }
          else{
            db.query("UPDATE score SET score = score - 15 WHERE scoreID = ?", [scoreID]);
          }
        }
      });
    }
    
    //console.log(answerIndex);
    //console.log(answers[answerIndex]);
    //console.log(questionIndex);
    //console.log(questions[questionIndex]);
    questionIndex++;
    answerIndex++;
    genreIndex++;
    diffIndex++;
    if(questionIndex < questions.length){
      res.render('quiz', {question: questions[questionIndex], questNum: questionIndex + 1, quizTotal: quizTotal, genre: genres[genreIndex].genre, difficulty: difficulties[diffIndex].difficulty, answer: answers[answerIndex]});
    }
    else{
      questions = [];
      answers = [];
      genres = [];
      difficulties = [];
      res.redirect('selection');
    }
    
  });

//POST routes
 app.post('/signIn', passport.authenticate('local', {
    successRedirect: '/accountC',
    failureRedirect: '/signIn',
  }));

  //coach creates a question
  app.post('/createQuestion', [
    check('question', 'Must enter a question. Why are you here?').not().isEmpty(),
    check('answer', '...You gonna answer that?').not().isEmpty()
  ], function(req, res, next){
    const errors = validationResult(req);
    if(errors > 0){
      console.log(errors.length);
      res.render('createQuestion');
    }
    else{
      var genre = req.body.genre;
      var diff = req.body.difficulty;
      var question = req.body.question;
      var answer = req.body.answer;
      console.log(genre);

      const db = require('./db');
      db.query('SELECT genreID FROM genre WHERE genre = ?', [genre], function(error, results, fields){
        var genreID = results[0].genreID;
        console.log(genreID);
        db.query('SELECT diff_ID FROM difficulty WHERE difficulty = ?', [diff], function(e, result, field){
          var diffID = result[0].diff_ID;
          console.log(diffID);
          db.query('INSERT INTO question(question, answer, genreID, diff_ID) VALUES(?, ?, ?, ?)', [question, 
          answer, genreID, diffID], function (er, resu, fie){
            if(er) throw er;

            else{
              console.log('Question has been inserted.');
              res.redirect('/createQuestion');
            }
          })
        })
      })
    }
  });

  //Selection page filter genre and difficulty.
  app.post('/selection', function(req, res, next){
      var genre = req.body.genre;
      var diff = req.body.difficulty;
      console.log(genre);

      const db = require('./db');
      db.query('SELECT genreID FROM genre WHERE genre = ?', [genre], function(error, results, fields){
        var genreID = results[0].genreID;
        console.log(genreID);
        db.query('SELECT diff_ID FROM difficulty WHERE difficulty = ?', [diff], function(e, result, field){
          var diffID = result[0].diff_ID;
          console.log(diffID);
            if(e) throw e;
            
            else{
              console.log('Congratulations. It worked.');
              res.redirect('/selection');
            }
          
        });
      });
    
  });

  //On selection page, where player hits a button
  app.post('/quiz', function(req, res, next){
    var num = req.body.number;
    //console.log(num);
    //console.log(num);
    //checks to see how many questions player asked for to be quizzed.
    if(num == 'five'){
     questionIndex = 0;
     answerIndex = 0;
     genreIndex = 0;
     diffIndex = 0;
     genreFilter = req.body.genre;
     diffFilter = req.body.difficulty;
     //console.log(genreFilter.length);
     //console.log(diffFilter.length)
     res.redirect('/quiz5');
        
     
    }
    //unfinished, but will work just like above
    else if(num == 'ten'){
      res.render('quiz', {number: num});
    }
    else{
      //unfinished, but will work just like above
      res.render('quiz', {number: num});
    }
   
  });


  var questID;
  //if update or delete button is pressed, do the respective function
  app.post('/questionEdit', function(req, res, next){
    var stat = req.body.edit;
     questID = req.body.questId;
    //console.log(stat);
    if(stat == "update"){
     
      res.redirect('updating');
    }
    else{

      res.redirect('delete');
    }
  });

  //updating question
  app.post('/updating', function(req, res, next){
    const db = require('./db');
    var theQuestID = req.body.questID;
    var oldQuestion = req.body.question;
    var oldGenre = req.body.genre;
    console.log(oldGenre);
    var oldDiff = req.body.difficulty;
    var oldAnswer = req.body.answer;
    db.query('SELECT genreID FROM genre WHERE genre = ?',[oldGenre], function(error, newGenre, fields){
      console.log(newGenre[0].genreID);
      var newGenreID = newGenre[0].genreID;
      db.query('SELECT diff_ID FROM difficulty WHERE difficulty = ?', [oldDiff], function(err, newDiff, field){
        console.log(newDiff[0].diff_ID);
        var newDiffID = newDiff[0].diff_ID;
        //console.log(theQuestID);
       db.query('UPDATE question SET question = ?, answer = ?, genreID = ?, diff_ID = ? WHERE questionID = ?', [oldQuestion, oldAnswer, newGenreID, newDiffID, theQuestID], function(er, quest, fiel){
        console.log("-----Updated!----");  
        console.log(quest);
        console.log("---------");
          res.redirect('/questionEdit');
        });
      });
    });
  });
    
  app.post('/index', [
    check('username').not().isEmpty(),
    check('email').not().isEmpty(),
    check('name').not().isEmpty(),
    check('password').not().isEmpty(),
    check('role').not().isEmpty(),
    check('confirm', 'Passwords do not match').custom((val, {req}) => (val == req.body.password)),
     
  ], function(req, res, next){

   
    const errors = validationResult(req);

    if(errors > 0) {
      console.log(errors.length);
      res.render('signUp', {title: 'signUp Error'});
    }
    else{
      //console.log(req.body.username);
      var name = req.body.name;
      var username = req.body.username;
      var email = req.body.email;
      var password = req.body.password;
      var role = req.body.role;
      const db = require('./db.js');

      const saltRounds = 10;
      bcrypt.hash(password, saltRounds, function(err, hash) {
         db.query('INSERT INTO users (name, username, email, pwd, role) VALUES (?, ?, ?, ?, ?)', [name, username, 
        email, hash, role], function(error, results, fields){
          if (error) throw error;
        
          //console.log(results);
          db.query('SELECT LAST_INSERT_ID() as userID', function(err, results, fields) {
            if(err) throw err;

            const userID = results[0];
            //console.log(userID);
            db.query('SELECT * FROM users WHERE userID = ?', [userID], function(err, results, fields) {
              //console.log(results);
            });
            req.login(userID, function(error) {
              //console.log(userID[0]);
              //flash('Registration Successful! Please sign in.');
              res.redirect('/signIn');
              //res.redirect('/rolecheck');
            });
          });
          //else res.render('index', {title: 'index'});
        });
      });
     
      }
    
    
  });

//passport authentication serialization
passport.serializeUser(function(userID, done){
  done(null, userID);
});

passport.deserializeUser(function(userID, done){
  done(null, userID);
});
 // module.exports = app;
 
app.listen(3000);
console.log("Server connected to port 3000");
