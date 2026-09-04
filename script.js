const cells=[...document.querySelectorAll('.cell')];
const boardEl=document.getElementById('board'), statusText=document.getElementById('statusText'), statusDot=document.getElementById('statusDot');
const difficultyModal=document.getElementById('difficultyModal'), resultModal=document.getElementById('resultModal');
const userScoreEl=document.getElementById('userScore'), cpuScoreEl=document.getElementById('cpuScore'), drawScoreEl=document.getElementById('drawScore');
const winLine=document.getElementById('winLine');
let board=Array(9).fill(''), difficulty=null, gameOver=true, thinking=false;
let scores=JSON.parse(localStorage.getItem('tttScores')||'{"user":0,"cpu":0,"draw":0}');
let theme=localStorage.getItem('tttTheme');
if(theme==='dark') document.body.classList.add('dark');

function updateScores(){userScoreEl.textContent=scores.user;cpuScoreEl.textContent=scores.cpu;drawScoreEl.textContent=scores.draw;localStorage.setItem('tttScores',JSON.stringify(scores))}
updateScores();

document.getElementById('newGameBtn').onclick=()=>openDifficulty();
document.getElementById('playAgainBtn').onclick=()=>{resultModal.classList.add('hidden');startGame()};
document.getElementById('cancelBtn').onclick=()=>difficultyModal.classList.add('hidden');
document.getElementById('resetScoreBtn').onclick=()=>{scores={user:0,cpu:0,draw:0};updateScores()};

document.getElementById('themeBtn').onclick=()=>{
 document.body.classList.toggle('dark');
 localStorage.setItem('tttTheme',document.body.classList.contains('dark')?'dark':'light');
};

document.querySelectorAll('.difficulty').forEach(b=>b.onclick=()=>{
 difficulty=b.dataset.difficulty; difficultyModal.classList.add('hidden'); startGame();
});

cells.forEach(c=>c.onclick=()=>{
 const i=+c.dataset.index;
 if(gameOver||thinking||board[i])return;
 place(i,'X');
 const result=check(board); if(result){finish(result);return}
 thinking=true; statusText.textContent='Computer is thinking…'; statusDot.classList.remove('live');
 setTimeout(()=>{const move=getComputerMove();place(move,'O');thinking=false;
   const r=check(board); if(r) finish(r); else {statusText.textContent='Your turn';statusDot.classList.add('live')}
 },difficulty==='hard'?260:190);
});

function openDifficulty(){difficultyModal.classList.remove('hidden')}

function startGame(){
 board=Array(9).fill('');gameOver=false;thinking=false;winLine.classList.remove('show');winLine.style.display='none';
 cells.forEach(c=>{c.textContent='';c.className='cell';});
 statusText.textContent=`${capitalize(difficulty)} · Your turn`;statusDot.classList.add('live');
}
function capitalize(s){return s[0].toUpperCase()+s.slice(1)}
function place(i,p){
 board[i]=p;cells[i].textContent=p==='X'?'×':'○';cells[i].classList.add(p==='X'?'x':'o','pop');
}
function check(b){
 const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
 for(const l of lines)if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[1]]===b[l[2]])return {winner:b[l[0]],line:l};
 return b.every(Boolean)?{winner:'draw',line:null}:null;
}
function finish(r){
 gameOver=true;thinking=false;statusDot.classList.remove('live');
 if(r.line) drawWinLine(r.line);
 setTimeout(()=>{
   if(r.winner==='X'){scores.user++;showResult('×','You Win!','Brilliant move.')}
   else if(r.winner==='O'){scores.cpu++;showResult('○','Computer Wins','Good game. Try another round.')}
   else {scores.draw++;showResult('=',"It's a Draw",'Perfectly matched.')}
   updateScores();
 },r.line?420:220);
}
function showResult(icon,title,sub){
 document.getElementById('resultIcon').textContent=icon;
 document.getElementById('resultTitle').textContent=title;
 document.getElementById('resultSubtitle').textContent=sub;
 resultModal.classList.remove('hidden');
}

function drawWinLine(line){
 const a=cells[line[0]].getBoundingClientRect(), b=cells[line[2]].getBoundingClientRect(), br=boardEl.getBoundingClientRect();
 const x1=a.left+a.width/2-br.left,y1=a.top+a.height/2-br.top;
 const x2=b.left+b.width/2-br.left,y2=b.top+b.height/2-br.top;
 const len=Math.hypot(x2-x1,y2-y1),angle=Math.atan2(y2-y1,x2-x1)*180/Math.PI;
 winLine.style.left=x1+'px';winLine.style.top=(y1-2.5)+'px';winLine.style.width=len+'px';winLine.style.setProperty('--angle',angle+'deg');
 winLine.style.color=board[line[0]]==='X'?'#007aff':'#ff3b30';winLine.style.display='block';winLine.classList.add('show');
}

function getComputerMove(){
 const available=board.map((v,i)=>v?null:i).filter(i=>i!==null);
 if(difficulty==='easy'){
   if(Math.random()<.35){const win=findTactical('O');if(win!==null)return win}
   return available[Math.floor(Math.random()*available.length)];
 }
 if(difficulty==='medium'){
   if(Math.random()<.72){const tactical=findTactical('O');if(tactical!==null)return tactical}
   if(Math.random()<.65){const block=findTactical('X');if(block!==null)return block}
   if(board[4]===''&&Math.random()<.75)return 4;
   const corners=[0,2,6,8].filter(i=>!board[i]);if(corners.length)return corners[Math.floor(Math.random()*corners.length)];
   return available[Math.floor(Math.random()*available.length)];
 }
 return minimax(board,'O').index;
}
function findTactical(p){
 for(let i=0;i<9;i++)if(!board[i]){board[i]=p;const r=check(board);board[i]='';if(r&&r.winner===p)return i}return null;
}
function minimax(state,player){
 const r=check(state);if(r)return {score:r.winner==='O'?10:r.winner==='X'?-10:0};
 const moves=[];
 for(let i=0;i<9;i++)if(!state[i]){
   state[i]=player;const result=minimax(state,player==='O'?'X':'O');state[i]='';
   moves.push({index:i,score:result.score});
 }
 if(player==='O')return moves.reduce((a,b)=>b.score>a.score?b:a);
 return moves.reduce((a,b)=>b.score<a.score?b:a);
}
