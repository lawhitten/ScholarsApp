# ScholarsApp
The Scholar's App is an app for Itawamba Agricultural High School's quizbowl team. This ReadME file is mainly for code documentation.

The "db.js" file connects the MYSQL database with a server.

The "package.json" contains all the packages installed in this nodejs Express app. Includes dependencies.

The "css" folder contains the styles.css file, which of course, contains the stylings of the app (though really, it is mainly visibility and
color of some buttons and backgrounds).

the "jscript" folder contains the only normal javascript file and any future javascript files. The textAppear file controls the text and 
button that appears when a player answers a question.

The "views" folder contains all the hbs files, including a subdirectory of partials. These partials are the two different headers for 
player and coach; each one has a different navbar.

The "app.js" file is what controls just about all the server-side logic. It calls all the necessary imports, runs the authentication system
and sessions, and connects to the server. Normally, there would also be a "routes" folder for all the routing and database queries,
but I decided to keep all the routing and all the logic that comes with it on the app.js file. This does make the file long, and I probably will move create a routing 
folder/file later. For now, let me break it down for ya:

get requests are first:
  index page (line 110-113)
  sign Up page (line 116-118)
  sign In page (1ine 121-123)
  logout function (line 126-130)
  getting account profile (line 134-176)
  
  Coach's gets:
    create question (line 180-194)
    read all questions/edit/delete options (line 197-205)
    updating a question (line 337-358)
    deleting a question (line 361-366)
  Player's gets:
    selection (line 208-225)
  Quiz component gets:
    quiz 5 questions (line 248-335)
    get quiz page (line 228-235)
   
 post requests:
  signIn (466-469)
  registering (604-659)
  Coach posts:
    create Question (472-507)
    question editing/deletion choosing (564-576)
    updating question (579-602)
 Quiz posts: 
    When player hits a button to play a quiz and must choose how many questions (535-560)
    When player chooses to move on to next question (369-463)
    
  
  
