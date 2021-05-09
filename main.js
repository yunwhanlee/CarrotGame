/*UI*/
const startBtn = document.querySelector(".ui_startBtn");
const timerTxt = document.querySelector(".ui_timer");
const counterTxt = document.querySelector(".ui_counter");
const field = document.querySelector(".field");
const resultPanel = document.querySelector(".ui_reSultPanel");
const stageCntTxt = document.querySelector(".stageNumberTxt");
const bestStageNTxt = document.querySelector(".bestStageNTxt");

//サウンド
const audio_Bg = new Audio("sound/bg.mp3");
audio_Bg.loop = true;
const audio_Alert = new Audio("sound/alert.wav");
const audio_CarrotPull = new Audio("sound/carrot_pull.mp3");
const audio_GameWin = new Audio("sound/game_win.mp3");
const audio_Bug = new Audio("sound/bug_pull.mp3");
const audio_Timer = new Audio("sound/TimerClock.mp3");

//初期化　変数
const CARROT_SIZE = 80;
let stageCnt = 1;
let bestStage = 1;
let span = 10;
const bugCreateSpan = 3;
let itemIdxCnt = 5;
let gameStart_Active = false;
let onceClick_Active = false;
let cnt = 0;
let counterFunc = null;
let carrotCnt = 0;
resultPanel.style.visibility = "hidden";

function Initialize(){
    //難易度調整用　変数
    stageCnt = 1;
    span = 10;
    itemIdxCnt = 5;

    gameStart_Active = false;
    onceClick_Active = false;
    cnt = 0;
    carrotCnt = 0;
    resultPanel.style.visibility = "hidden";
}

//#1.StartBtn ClickEvnet
startBtn.addEventListener("click",(e)=>{
    gameStart_Active = !gameStart_Active;
    //StartGame
    if(gameStart_Active){
        StartGame();
    }
    else{
        FinishGame();
    }
        
});

function StartGame(){
    audio_Bg.play();
    audio_Alert.play();
    resultPanel.style.visibility = "hidden";
    startBtn.children[0].className = "fas fa-stop";//イメージ変更
    cnt = span;
    CreateItems();
    timerTxt.style.color = "black";
    timerTxt.innerHTML = `00:${leadingSpaces(cnt, 10)}`;
    if(cnt > 0){
        counterFunc = setInterval(Update_Timer, 1000);
        carrotCntFunc = setInterval(Update_UIandAudio, 30);
    }
    if(bestStage < stageCnt){
        bestStage = stageCnt;
        bestStageNTxt.textContent = `BestStage : ${bestStage}`;
    }
}

//#2.Update
function Update_Timer(){
    if(cnt > 0){
        cnt--;
    }
    else{
        FinishGame();
    }
    if( 0 < cnt && cnt <= 5){
        timerTxt.style.color = "red";
        audio_Timer.play();
    }
    timerTxt.innerHTML = `00:${leadingSpaces(cnt, 10)}`;
}

function Update_UIandAudio(){
    counterTxt.textContent = `${carrotCnt}`;
    stageCntTxt.textContent = `STAGE : ${stageCnt}`;
    if(cnt < 0){
        timerTxt.style.color = "black";
        audio_Timer.currentTime = 2;
        audio_Timer.pause();
    }
    if(carrotCnt === 0) 
        FinishGame();
}

function FinishGame(){
    timerTxt.style.color = "black";
    timerTxt.innerHTML = "00:00";
    cnt = 0;
    startBtn.children[0].className = "fas fa-play";
    ResetItems();
    //Update終了
    clearInterval(counterFunc);
    clearInterval(carrotCntFunc);
    //🥕個数をカウントして、ゲーム結果を出す。
    resultPanel.style.visibility = "visible";
    const resUItxt = resultPanel.querySelector(".ui_resultTxt");
    const resUIimg = resultPanel.querySelector(".reStartBtn").children[0];
    
    if(carrotCnt > 0){//GAME OVER
        audio_Bug.play();
        resUItxt.textContent = "GAME OVER💩";
        resUIimg.className = "fas fa-undo";
        bestStage < stageCnt ? bestStage = stageCnt : bestStage;
    }
    else{//NEXT STAGE
        audio_GameWin.play(); 
        audio_GameWin.volume = 0.35;
        resUItxt.textContent = "💛NEXT STAGE🥕";
        resUIimg.className = "far fa-hand-point-right";
    }
    
    //🥕の個数を0に初期化
    counterTxt.textContent = `${carrotCnt = 0}`;
}

function leadingSpaces(n, digits) {
    var space = '0';
    if (n < digits) {
        return space + n;
    }
    return n;
}

//#3.Create Item
function CreateItems(){
    //fieldRect Pos Info
    const fX = 0;//field.getBoundingClientRect().left;
    const fY = 0;//field.getBoundingClientRect().top;
    const fW = field.getBoundingClientRect().width - CARROT_SIZE;//right;
    const fH = field.getBoundingClientRect().height - CARROT_SIZE;//bottom;
    //console.log(`Field : x(${parseInt(fX)} ~ ${parseInt(fW)}) , y(${parseInt(fY)} ~ ${parseInt(fH)})`)
    //create
    for(let i=0; i<itemIdxCnt;i++){
        const item = document.createElement("img");
        item.draggable = false;
        
        if(i % bugCreateSpan == 0){
            item.className = "item bug";
            item.src = "img/bug.png";
        }
        else{
            item.className = "item carrot";
            item.src = "img/carrot.png";
            carrotCnt++;
        }
        rX = randN(fX,fW);// - item.width /2;
        rY = randN(fY,fH);// - item.height /2;

        //item.style.transform = `translate(${rX}px,${rY}px)`;　//Cssで：hoverアニメができないので、left,topにしました。
        item.style.left = `${rX}px`;//rX + "px";
        item.style.top = `${rY}px`;//rY + "px";//★★"PX"★★!!!
        
        field.appendChild(item);
    }
}

function ResetItems(){
    field.innerHTML = "";
}

function randN(_min, _max){
    let result = Math.floor(Math.random() * (_max - _min)); //壁に重ならないように
    return result;
}

//#4.アイテムクリック イベント
document.addEventListener("click",(e)=>{
    //クリック1回当たり、1個アイテムを習得
    if(!onceClick_Active){
        //アイテム判別
        if(e.target && e.target.className === "item bug"){
            onceClick_Active = true;
            FinishGame();
        }
        else if(e.target && e.target.className === "item carrot"){
            audio_CarrotPull.currentTime = 0;
            audio_CarrotPull.play();
            onceClick_Active = true;
            carrotCnt--;
            e.target.remove();
        }
        onceClick_Active = false;
    }
});

//#5.結果を出すパンネル
resultPanel.addEventListener("click",(e)=>{
    //Next Stage
    if(e.target.className === "reStartBtn" || e.target.className === "far fa-hand-point-right"){
        gameStart_Active = true;//Restartボタンして、上段の再生ボタンクリックで重複スタートする問題 防止
        resultPanel.style.visibility = "hidden";
        StageLeveling();
        StartGame();
    }
    //Game Over
    else if(e.target.className === "reStartBtn" || e.target.className === "fas fa-undo"){
        resultPanel.style.visibility = "hidden";
        gameStart_Active = true;
        Initialize();
        StartGame();
    }
});

//#6.レベルリング
function StageLeveling(){
    stageCnt++;
    
    //Item個数
    stageCnt % 3 === 0? itemIdxCnt += 2 : itemIdxCnt ++;

    //制限時間
    if(stageCnt< 5)
        span = 10;
    else if(stageCnt< 10)
        span = 9;
    else if(stageCnt< 15)
        span = 8;
    else if(stageCnt< 20)
        span = 7;
    else if(stageCnt< 25)
        span = 6;
}

