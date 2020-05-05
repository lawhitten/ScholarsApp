
document.getElementById('answer').addEventListener('click', function(){
    correctAnswer = document.getElementById('ans').value;
    playerAnswer = document.getElementById('playerAnswer').value;
    genre = document.getElementById('gen').value;
    difficulty = document.getElementById('diff').value;
    console.log(playerAnswer);
    console.log(correctAnswer);
    var p = document.createElement('p');
    
   
   
    if(playerAnswer.toUpperCase() === correctAnswer.toUpperCase()){
        console.log('Is this working?');
        const extra = document.querySelector('.extra');
        if(difficulty === "Easy (Level A)"){
            p.textContent = "You are correct! You get 10 points in " + genre + " " + difficulty;
            extra.appendChild(p);
        }
        else{
            p.textContent = "You are correct! You get 15 points in " + genre + " " + difficulty;
            extra.appendChild(p);
        }
       
        document.getElementById('next').style.visibility = 'visible';
        document.getElementById('answer').style.visibility = 'hidden';
        document.getElementById('next').removeAttribute('disabled');
        
    }
    else{
        console.log('Answer is wrong');
        const extra = document.querySelector('.extra');
        if(difficulty === "Easy (Level A)"){
            p.textContent = "You are wrong. The correct answer is " + correctAnswer + ". You lose 10 points in " + genre + " " + difficulty;
            extra.appendChild(p);
        }
        else{
            p.textContent = "You are wrong. The correct answer is " + correctAnswer + ". You lose 15 points in " + genre + " " + difficulty;
            extra.appendChild(p);
        }
        
        document.getElementById('next').style.visibility = 'visible';
        document.getElementById('answer').style.visibility = 'hidden';
        document.getElementById('next').removeAttribute('disabled');
    }
    
    
});



