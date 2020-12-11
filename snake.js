//console.log('Hello World');
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var box = Math.floor(canvas.width/30);
console.log(box);
//var snake = [[box*5, box*5], [box*6, box*5], [box*7, box*5]];
var snake = [];
var foods = [[box*10, box*10]];
//var foodX = box*10;
//var foodY = box*10;
var score = 2;
var direction = 'right';
var enemy = [box*2, box*2];

var ticks = 100;
//var gameOver = false;

//gameLoop();

//document.getElementById("score").innerHTML = score;


var snakeInterval = 0;
var enemyInterval = 0;





gameLoop();

function restartGame() {

    let timer = 5;
    var countDown = setInterval(function() {
        if(timer > 0) {
            document.getElementById("lose").innerHTML = "Restarting in " + timer + "...";
            timer -= 1;
        }
        else {
            clearInterval(countDown);
            //snake = [[box*5, box*5]];
            
            gameLoop();
            
        }

    }, 1000);

    
    //return gameLoop();

}

function gameOver() {
    clearInterval(snakeInterval);
    clearInterval(enemyInterval);
    console.log("you lost");
    document.getElementById("score").innerHTML = "Game Over";

    restartGame();

    return;

}


function gameLoop() {
    snake = [[box*5, box*5]];

    draw();
    drawFood(box*10, box*10);
    drawEnemy(enemy[0], enemy[1]);

    document.getElementById("lose").innerHTML = "";
    document.getElementById("score").innerHTML = "score: " + score;

    //Move Snake every 100ms
    snakeInterval = setInterval(moveSnake, ticks);
    enemyInterval = setInterval(moveEnemy, ticks*1.5);
}

document.addEventListener('keydown', function(event) {

    if(event.keyCode == 37) {
        direction = 'left';
    }  
    else if(event.keyCode == 38) {
        direction = 'up';
    }
    else if(event.keyCode == 39) {
        direction = 'right';
    }
    else if(event.keyCode == 40) {
        direction = 'down';
    }


});

function drawGrid() {

    // Canvas Background
    ctx.fillStyle = '#212121';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    
    // Vertical Gridines
    ctx.strokeStyle = "#0fc795";
    for(let i = box; i < canvas.width; i = i + box) {
        ctx.moveTo(i, 0);
        //ctx.moveTo(0, i);
        ctx.lineTo(i, canvas.height);
    }
    // Horizontal Gridlines
    for(let j = box; j < canvas.height; j = j + box) {
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
    }
    ctx.stroke();
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
}

function draw() {
    clear();

    ctx.fillStyle = "#d24b50";
    ctx.fillRect(snake[0][0]+5, snake[0][1]+5, box-10, box-10);
    

    ctx.fillStyle = "#3c1e50";
    //ctx.fillStyle = "#d24b19";
    let taper = 5;
    for(let i = 1; i < snake.length; i++) {
        if(box-(2*taper)>4) {
            taper+=1;
        }
        switch(i) {
            case 1:
                ctx.fillStyle = '#B94450';
                break;
            case 2:
                ctx.fillStyle = '#A03C50';
                break;
            case 3:
                ctx.fillStyle = '#873550';
                break;
            case 4:
                ctx.fillStyle = '#6E2D50';
                break;
            case 5:
                ctx.fillStyle = '#552650';
                break;
        }
        ctx.fillRect(snake[i][0]+taper, snake[i][1]+taper, box-(2*taper), box-(2*taper));
        //ctx.fillRect(snake[i][0]+taper, snake[i][1]+5+i, box-(2*taper), box-10-(2*i));
        //ctx.fillRect(snake[i][0]+(box/2), snake[i][1]+(box/2), box, box);

        
    }
    drawEnemy(enemy[0], enemy[1]);
}

function drawEnemy(x, y) {
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(x+10, y+10, box-20, box-20);  
}

function drawFood(x, y) {
    ctx.fillStyle = '#cdcd2d';
    ctx.fillRect(x+10, y+10, box-20, box-20);
}

function moveSnake() {
    let moved = false;
    let change = [0, 0];

    if(snake.length<1) {
        gameOver();
        return;
    }
    else if(snake.length == 1) {
        if(direction == 'left' && snake[0][0] >= box) {
            change[0] -= box;
            moved = true;
        } 
        else if(direction == 'up' && snake[0][1] >= box) {
            change[1] -= box;
            moved = true;
        }
        else if(direction == 'right' && snake[0][0] <= canvas.width-(2*box)) {
            change[0] += box;
            moved = true;
        }
        else if(direction == 'down' && snake[0][1] <= canvas.height-(2*box)) {
            change[1] += box;
            moved = true;
        }
    } 
    else {
    
        if(direction == 'left' && snake[0][0] >= box && snake[0][0]-box != snake[1][0]) {
            change[0] -= box;
            moved = true;
        } 
        else if(direction == 'up' && snake[0][1] >= box && snake[0][1]-box != snake[1][1]) {
            change[1] -= box;
            moved = true;
        }
        else if(direction == 'right' && snake[0][0] <= canvas.width-(2*box) && snake[0][0]+box != snake[1][0]) {
            change[0] += box;
            moved = true;
        }
        else if(direction == 'down' && snake[0][1] <= canvas.height-(2*box) && snake[0][1]+box != snake[1][1]) {
            change[1] += box;
            moved = true;
        }
        
    }
    
    if(moved) {
        for (var i = snake.length - 1; i >= 1; i--) {
            snake[i] = snake[i-1];     
        }

        let lastX = snake[0][0];
        let lastY = snake[0][1];
        snake[1] = [lastX, lastY];
        
        snake[0][0] += change[0];
        snake[0][1] += change[1];

        for(let i = 1; i < snake.length; i++) {
            if((snake[0][0] == snake[i][0] && snake[0][1] == snake[i][1]) || snake[i][0] == enemy[0] && snake[i][1] == enemy[1]) {
                score = i;
                document.getElementById("score").innerHTML = "score: " + score;
                snake.length = i;
                break;
            }
        }
        
    }
    
    for(let j = 0; j < foods.length; j++) {
        if(snake[0][0] == foods[j][0] && snake[0][1] == foods[j][1]) {
            score += 1;
            if(score>9 && score%10==0) {
                foods.push([10 * box, 10 * box])
            }

            document.getElementById("score").innerHTML = "score: " + score;
            
            snake.push([snake[snake.length-1][0], snake[snake.length-1][1]]);

            while(true) {
                let x = Math.floor(Math.random() * (canvas.width/box)) * box;
                let y = Math.floor(Math.random() * (canvas.height/box)) * box;
                if(foods[j][0] != x && foods[j][1] != y) {
                    foods[j][0] = x;
                    foods[j][1] = y;
                    console.log(x, y);
                    break;
                }
            }
        }
    }

    draw();
    for(let k = 0; k < foods.length; k++) {
        drawFood(foods[k][0], foods[k][1]);
    }
}

function moveEnemy() {

    if(snake.length == 0) {
        document.getElementById("lose").innerHTML = "Game Over";
        gameOver();
        return;
    }

    // For loop might kill performance later on
    let shortest = Math.abs(enemy[0] - foods[0][0]) + Math.abs(enemy[1] - foods[0][1]);
    let closest = 0;
    for(let i = 1; i < foods.length; i++) {
        //Manhattan Distance = |x2 - x1| + |y2 - y1| 
        let distance = Math.abs(enemy[0] - foods[i][0]) + Math.abs(enemy[1] - foods[i][1]);
        if(distance < shortest) {
            shortest = distance;
            closest = i;
        }
    }
    let distanceToSnake = Math.abs(enemy[0] - snake[snake.length-1][0]) + Math.abs(enemy[1] - snake[snake.length-1][1]);
    if(shortest < distanceToSnake) {
        if(enemy[0] < foods[closest][0]) {
            enemy[0]+=box;
        }
        else if (enemy[0] > foods[closest][0]){
            enemy[0]-=box
        }
        else if(enemy[1] < foods[closest][1]) {
            enemy[1]+=box;
        }
        else if (enemy[1] > foods[closest][1]){
            enemy[1]-=box
        }
        else {
            foods[closest][0] = Math.floor(Math.random() * (canvas.width/box)) * box;
            foods[closest][1] = Math.floor(Math.random() * (canvas.height/box)) * box;
        }
    }
    else {
        
        if(enemy[0] < snake[snake.length-1][0]) {
            enemy[0]+=box;
        }
        else if (enemy[0] > snake[snake.length-1][0]){
            enemy[0]-=box
        }
        else if(enemy[1] < snake[snake.length-1][1]) {
            enemy[1]+=box;
        }
        else if (enemy[1] > snake[snake.length-1][1]){
            enemy[1]-=box
        }
        else {
            snake.length -= 1;
        }
    }
}