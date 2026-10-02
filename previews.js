(function(){
'use strict';

var W=280,H=160;

function setup(canvas){
  canvas.width=W;canvas.height=H;
  var ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  return ctx;
}

function px(ctx,x,y,rows,s,color){
  ctx.fillStyle=color;
  for(var r=0;r<rows.length;r++){
    var row=rows[r];
    for(var c=0;c<row.length;c++){
      var ch=row[c];
      if(ch!=='.'&&ch!==' ')ctx.fillRect(Math.round(x+c*s),Math.round(y+s*r),Math.ceil(s),Math.ceil(s));
    }
  }
}

function pxp(ctx,x,y,rows,s,pal){
  for(var r=0;r<rows.length;r++){
    var row=rows[r];
    for(var c=0;c<row.length;c++){
      var col=pal[row[c]];
      if(col){ctx.fillStyle=col;ctx.fillRect(Math.round(x+c*s),Math.round(y+s*r),Math.ceil(s),Math.ceil(s));}
    }
  }
}

function text(ctx,str,x,y,size,color,align){
  ctx.font=size+'px "Press Start 2P", monospace';
  ctx.textAlign=align||'left';
  ctx.textBaseline='top';
  ctx.fillStyle=color;
  ctx.fillText(str,x,y);
}

var INVADER=[
"01111110",
"11111111",
"11011011",
"11111111",
"00100100",
"01011010",
"10100101"
];

var CANNON=[
"0000110000",
"0001111000",
"0001111000",
"1111111111",
"1111111111",
"1111111111"
];

var DIGGER=[
"...WWWW...",
"..WWWWWW..",
"..WRRRRW..",
"..WWWWWW..",
"...WWWW...",
".RRWWWWRR.",
".RRWWWWRR.",
"...WWWW...",
"..WW..WW..",
"..RR..RR.."
];
var DIGGER_PAL={W:'#ffffff',R:'#e02020'};

var ALIEN_A=[
"00111100",
"01111110",
"11011011",
"11111111",
"00100100",
"01011010",
"10100101"
];

var ALIEN_B=[
"01000010",
"00100100",
"01111110",
"11011011",
"11111111",
"01111110",
"00100100"
];

var ALIEN_C=[
"00011000",
"00111100",
"01111110",
"11011011",
"11111111",
"01011010",
"10000001"
];

var SHIP=[
"0000110000",
"0001111000",
"0001111000",
"1111111111",
"1111111111",
"1111111111"
];

/* ---------------- SPACE INVADERS ---------------- */
function spaceInvaders(){
  var invaders=[],bullets=[],booms=[];
  var dir=1,playerX=140,shootT=0,score=0;
  function reset(){
    invaders=[];
    for(var r=0;r<4;r++)for(var c=0;c<7;c++)
      invaders.push({x:26+c*30,y:26+r*20,type:r%3,alive:true});
    dir=1;bullets=[];booms=[];score=0;
  }
  reset();
  return {
    draw:function(ctx,t,dt){
      var alive=[],i;
      for(i=0;i<invaders.length;i++)if(invaders[i].alive)alive.push(invaders[i]);
      if(alive.length===0)reset();
      var spd=30+(1-alive.length/28)*70;
      var minX=999,maxX=-999;
      for(i=0;i<alive.length;i++){minX=Math.min(minX,alive[i].x);maxX=Math.max(maxX,alive[i].x);}
      if((dir>0&&maxX>W-22)||(dir<0&&minX<8)){dir*=-1;for(i=0;i<alive.length;i++)alive[i].y+=6;}
      else{for(i=0;i<alive.length;i++)alive[i].x+=dir*spd*dt;}
      playerX=140+Math.sin(t*1.2)*105;
      shootT-=dt;
      if(shootT<=0){bullets.push({x:playerX+5,y:130});shootT=0.55;}
      for(i=bullets.length-1;i>=0;i--){
        var b=bullets[i];b.y-=230*dt;
        if(b.y<-10){bullets.splice(i,1);continue;}
        for(var j=0;j<invaders.length;j++){
          var iv=invaders[j];
          if(iv.alive&&b.x>=iv.x&&b.x<=iv.x+16&&b.y>=iv.y&&b.y<=iv.y+12){
            iv.alive=false;booms.push({x:iv.x+8,y:iv.y+6,t:0});bullets.splice(i,1);
            score+=50;break;
          }
        }
      }
      for(i=booms.length-1;i>=0;i--){booms[i].t+=dt;if(booms[i].t>0.35)booms.splice(i,1);}
      ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
      text(ctx,'SCORE '+String(score).padStart(4,'0'),8,6,8,'#0f0');
      var f=Math.floor(t*4)%2;
      for(i=0;i<invaders.length;i++){
        iv=invaders[i];if(!iv.alive)continue;
        px(ctx,iv.x,iv.y+(f?1:0),INVADER,2,iv.type===0?'#ff0':iv.type===1?'#f0f':'#0ff');
      }
      ctx.fillStyle='#fff';
      for(i=0;i<bullets.length;i++)ctx.fillRect(bullets[i].x,bullets[i].y,2,8);
      for(i=0;i<booms.length;i++){
        var bm=booms[i];
        ctx.strokeStyle='#f80';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(bm.x,bm.y,2+bm.t*30,0,Math.PI*2);ctx.stroke();
        ctx.lineWidth=1;
      }
      px(ctx,playerX,132,CANNON,2,'#0f0');
    },
    title:function(ctx,blink){
      ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
      text(ctx,'SPACE',W/2,50,16,'#0ff','center');
      text(ctx,'INVADERS',W/2,74,16,'#f0f','center');
      text(ctx,'TAITO 1978',W/2,102,8,'#555','center');
      px(ctx,W/2-8,114,INVADER,2,'#0ff');
      if(blink)text(ctx,'INSERT COIN',W/2,140,8,'#ff0','center');
    }
  };
}

/* ---------------- DIG DUG ---------------- */
function digDug(){
  var COLS=14,ROWS=8,CELL=20;
  var dug={};
  var speckles=[];
  for(var i=0;i<260;i++)speckles.push({x:Math.random()*W,y:Math.random()*H});
  var parts=[];
  var DIRS=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
  var digger={cx:1,cy:1,x:30,y:30,speed:55};
  var pooka={cx:12,cy:6,x:250,y:130,speed:30};
  dug['1,1']=true;
  function stepEntity(e,dt,carve){
    var tx=e.cx*CELL+10,ty=e.cy*CELL+10;
    var dx=tx-e.x,dy=ty-e.y;
    var dist=Math.sqrt(dx*dx+dy*dy),step=e.speed*dt;
    if(dist<=Math.max(step,0.001)){
      e.x=tx;e.y=ty;
      if(carve)dug[e.cx+','+e.cy]=true;
      var opts=[];
      for(var i=0;i<4;i++){
        var nx=e.cx+DIRS[i].x,ny=e.cy+DIRS[i].y;
        if(nx>=0&&nx<COLS&&ny>=0&&ny<ROWS)opts.push(i);
      }
      var nd=opts[(Math.random()*opts.length)|0];
      e.cx+=DIRS[nd].x;e.cy+=DIRS[nd].y;
      if(carve)for(var j=0;j<3;j++)parts.push({x:e.x+10,y:e.y+10,vx:(Math.random()-0.5)*40,vy:-Math.random()*40,t:0});
    }else{
      e.x+=dx/dist*step;e.y+=dy/dist*step;
    }
  }
  return {
    draw:function(ctx,t,dt){
      stepEntity(digger,dt,true);
      stepEntity(pooka,dt,false);
      var i;
      for(i=parts.length-1;i>=0;i--){
        var p=parts[i];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=120*dt;
        if(p.t>0.5)parts.splice(i,1);
      }
      ctx.fillStyle='#a06a2c';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#7c4f1e';
      for(i=0;i<speckles.length;i++)ctx.fillRect(speckles[i].x,speckles[i].y,2,2);
      ctx.fillStyle='#160b02';
      for(var key in dug){
        var cc=key.split(',');
        ctx.fillRect(+cc[0]*CELL,+cc[1]*CELL,CELL,CELL);
      }
      ctx.fillStyle='#7c4f1e';
      for(i=0;i<parts.length;i++)ctx.fillRect(parts[i].x,parts[i].y,2,2);
      ctx.fillStyle='#e02020';
      ctx.beginPath();ctx.arc(pooka.x,pooka.y,8,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';
      ctx.fillRect(pooka.x-5,pooka.y-3,3,4);
      ctx.fillRect(pooka.x+2,pooka.y-3,3,4);
      ctx.fillStyle='#000';
      ctx.fillRect(pooka.x-4,pooka.y-2,2,2);
      ctx.fillRect(pooka.x+3,pooka.y-2,2,2);
      pxp(ctx,digger.x-10,digger.y-10,DIGGER,2,DIGGER_PAL);
      text(ctx,'SCORE 01250',8,6,8,'#fff');
    },
    title:function(ctx,blink){
      ctx.fillStyle='#1a0d05';ctx.fillRect(0,0,W,H);
      text(ctx,'DIG DUG',W/2,52,16,'#ff8800','center');
      text(ctx,'NAMCO 1982',W/2,80,8,'#888','center');
      pxp(ctx,W/2-10,96,DIGGER,2,DIGGER_PAL);
      if(blink)text(ctx,'INSERT COIN',W/2,130,8,'#ff0','center');
    }
  };
}

/* ---------------- PAC-MAN ---------------- */
var MAZE=[
"##############",
"#............#",
"#.##.###.##..#",
"#............#",
"#.##.###.##..#",
"#............#",
"#.##.###.##..#",
"##############"
];
var PC=20;

function bfsStep(sx,sy,tx,ty){
  if(sx===tx&&sy===ty)return null;
  var prev={},q=[[sx,sy]],head=0;
  prev[sx+','+sy]=null;
  while(head<q.length){
    var cur=q[head++];
    if(cur[0]===tx&&cur[1]===ty){
      var k=tx+','+ty;
      while(prev[k]!==null&&(prev[k][0]!==sx||prev[k][1]!==sy))k=prev[k];
      var parts=k.split(',');
      return {x:+parts[0],y:+parts[1]};
    }
    var dirs=[[1,0],[-1,0],[0,1],[0,-1]];
    for(var i=0;i<4;i++){
      var nx=cur[0]+dirs[i][0],ny=cur[1]+dirs[i][1];
      if(ny>=0&&ny<8&&nx>=0&&nx<14&&MAZE[ny][nx]==='.'&&!(nx+','+ny in prev)){
        prev[nx+','+ny]=cur;
        q.push([nx,ny]);
      }
    }
  }
  return null;
}

function drawGhost(ctx,g){
  var x=g.x,y=g.y;
  ctx.fillStyle=g.color;
  ctx.beginPath();
  ctx.arc(x,y-2,7,Math.PI,0);
  ctx.lineTo(x+7,y+5);
  ctx.lineTo(x+3.5,y+8);
  ctx.lineTo(x,y+5);
  ctx.lineTo(x-3.5,y+8);
  ctx.lineTo(x-7,y+5);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff';
  ctx.fillRect(x-5,y-4,4,5);
  ctx.fillRect(x+1,y-4,4,5);
  ctx.fillStyle='#00f';
  ctx.fillRect(x-4,y-2,2,3);
  ctx.fillRect(x+2,y-2,2,3);
}

function pacman(){
  var dots={},eaten={},eatenCount=0,total=0;
  var pac={cx:1,cy:1,x:30,y:30,dir:{x:1,y:0},speed:2.8};
  var ghosts=[
    {cx:12,cy:1,x:250,y:30,color:'#ff0000',speed:2.3},
    {cx:12,cy:6,x:250,y:130,color:'#ffb8ff',speed:2.1},
    {cx:1,cy:6,x:30,y:130,color:'#00ffff',speed:1.9}
  ];
  var x,y,i;
  for(y=0;y<8;y++)for(x=0;x<14;x++)if(MAZE[y][x]==='.'){dots[x+','+y]=true;total++;}
  function choosePac(){
    var dirs=[[1,0],[-1,0],[0,1],[0,-1]],opts=[];
    for(var i=0;i<4;i++){
      var nx=pac.cx+dirs[i][0],ny=pac.cy+dirs[i][1];
      if(ny>=0&&ny<8&&nx>=0&&nx<14&&MAZE[ny][nx]==='.')opts.push(dirs[i]);
    }
    if(!opts.length)return;
    var straight=null;
    for(i=0;i<opts.length;i++)if(opts[i][0]===pac.dir.x&&opts[i][1]===pac.dir.y)straight=opts[i];
    var d=(straight&&Math.random()<0.7)?straight:opts[(Math.random()*opts.length)|0];
    pac.cx+=d[0];pac.cy+=d[1];pac.dir={x:d[0],y:d[1]};
  }
  function chooseGhost(g){
    var s=bfsStep(g.cx,g.cy,pac.cx,pac.cy);
    if(s){g.cx=s.x;g.cy=s.y;}
  }
  function move(e,dt){
    var tx=e.cx*PC+10,ty=e.cy*PC+10;
    var dx=tx-e.x,dy=ty-e.y;
    var dist=Math.sqrt(dx*dx+dy*dy),step=e.speed*PC*dt;
    if(dist<=Math.max(step,0.001)){e.x=tx;e.y=ty;return true;}
    e.x+=dx/dist*step;e.y+=dy/dist*step;
    return false;
  }
  return {
    draw:function(ctx,t,dt){
      if(move(pac,dt))choosePac();
      var key=pac.cx+','+pac.cy;
      if(dots[key]&&!eaten[key]){eaten[key]=true;eatenCount++;}
      if(eatenCount>=total){eaten={};eatenCount=0;}
      for(var i=0;i<ghosts.length;i++)if(move(ghosts[i],dt))chooseGhost(ghosts[i]);
      ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
      for(y=0;y<8;y++)for(x=0;x<14;x++){
        if(MAZE[y][x]==='#'){ctx.fillStyle='#1e1e9e';ctx.fillRect(x*PC,y*PC,PC,PC);}
      }
      ctx.fillStyle='#ffb8ae';
      for(var k in dots){
        if(eaten[k])continue;
        var pp=k.split(',');
        ctx.fillRect(+pp[0]*PC+9,+pp[1]*PC+9,3,3);
      }
      var ang=Math.atan2(pac.dir.y,pac.dir.x);
      var mouth=(Math.abs(Math.sin(t*9))*0.28+0.04)*Math.PI;
      ctx.fillStyle='#ff0';
      ctx.beginPath();
      ctx.moveTo(pac.x,pac.y);
      ctx.arc(pac.x,pac.y,8,ang+mouth,ang-mouth+Math.PI*2);
      ctx.closePath();ctx.fill();
      for(i=0;i<ghosts.length;i++)drawGhost(ctx,ghosts[i]);
      text(ctx,'SCORE 00350',8,6,8,'#0ff');
    },
    title:function(ctx,blink){
      ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
      text(ctx,'PAC-MAN',W/2,50,16,'#ff0','center');
      text(ctx,'NAMCO 1980',W/2,78,8,'#555','center');
      ctx.fillStyle='#ff0';
      ctx.beginPath();
      ctx.moveTo(W/2,102);
      ctx.arc(W/2,102,8,0.35,Math.PI*2-0.35);
      ctx.closePath();ctx.fill();
      if(blink)text(ctx,'INSERT COIN',W/2,130,8,'#ff0','center');
    }
  };
}

/* ---------------- AGENT 7 ---------------- */
function agent7(){
  var walls=[
    {x:50,y:28,w:90,h:14},
    {x:150,y:28,w:90,h:14},
    {x:50,y:118,w:90,h:14},
    {x:150,y:118,w:90,h:14},
    {x:130,y:72,w:20,h:18}
  ];
  var agent={x:140,y:80,wp:[{x:28,y:18},{x:252,y:18},{x:252,y:142},{x:28,y:142}],i:0,speed:42};
  var guards=[
    {x:100,y:60,wp:[{x:100,y:24},{x:100,y:136}],i:0,speed:26,face:Math.PI/2},
    {x:200,y:100,wp:[{x:200,y:136},{x:200,y:24}],i:0,speed:26,face:-Math.PI/2}
  ];
  function move(e,dt){
    var t=e.wp[e.i];
    var dx=t.x-e.x,dy=t.y-e.y;
    var dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<2){e.i=(e.i+1)%e.wp.length;return;}
    e.x+=dx/dist*e.speed*dt;
    e.y+=dy/dist*e.speed*dt;
    e.face=Math.atan2(dy,dx);
  }
  return {
    draw:function(ctx,t,dt){
      move(agent,dt);
      var i;
      for(i=0;i<guards.length;i++)move(guards[i],dt);
      ctx.fillStyle='#081426';ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='rgba(40,90,150,0.25)';ctx.lineWidth=1;
      for(var gx=0;gx<=W;gx+=20){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();}
      for(var gy=0;gy<=H;gy+=20){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}
      for(i=0;i<walls.length;i++){
        var w=walls[i];
        ctx.fillStyle='#1e3a5f';ctx.fillRect(w.x,w.y,w.w,w.h);
        ctx.strokeStyle='#2e5a8f';ctx.strokeRect(w.x+0.5,w.y+0.5,w.w-1,w.h-1);
      }
      for(i=0;i<guards.length;i++){
        var g=guards[i];
        ctx.fillStyle='rgba(255,240,100,0.10)';
        ctx.beginPath();
        ctx.moveTo(g.x,g.y);
        ctx.arc(g.x,g.y,38,g.face-0.45,g.face+0.45);
        ctx.closePath();ctx.fill();
      }
      var rx=252,ry=24,a=t*2.5;
      ctx.strokeStyle='rgba(0,255,100,0.5)';
      ctx.beginPath();ctx.arc(rx,ry,14,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle='rgba(0,255,100,0.9)';
      ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx+Math.cos(a)*14,ry+Math.sin(a)*14);ctx.stroke();
      ctx.fillStyle='#0f6';
      ctx.beginPath();ctx.arc(rx+Math.cos(a)*14,ry+Math.sin(a)*14,2,0,Math.PI*2);ctx.fill();
      for(i=0;i<guards.length;i++){
        ctx.fillStyle='#e02020';
        ctx.beginPath();ctx.arc(guards[i].x,guards[i].y,4,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle='#fff';
      ctx.beginPath();ctx.arc(agent.x,agent.y,4,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#4af';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(agent.x,agent.y,6,0,Math.PI*2);ctx.stroke();
      ctx.lineWidth=1;
      text(ctx,'SEVERNAYA BUNKER',8,6,8,'#0f6');
      text(ctx,'MISSION: DISABLE UPLINK',8,146,8,'#555');
    },
    title:function(ctx,blink){
      ctx.fillStyle='#081426';ctx.fillRect(0,0,W,H);
      text(ctx,'AGENT 7',W/2,50,16,'#0f6','center');
      text(ctx,'TOP SECRET',W/2,78,8,'#555','center');
      ctx.strokeStyle='rgba(0,255,100,0.6)';
      ctx.beginPath();ctx.arc(W/2,104,12,0,Math.PI*2);ctx.stroke();
      if(blink)text(ctx,'INSERT COIN',W/2,132,8,'#ff0','center');
    }
  };
}

/* ---------------- GALAGA ---------------- */
function galaga(){
  var stars=[];
  for(var i=0;i<45;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:15+Math.random()*45});
  var formation=[],bullets=[],booms=[];
  var dir=1,playerX=140,shootT=0,score=0,diving=null;
  var SPRITES=[ALIEN_C,ALIEN_B,ALIEN_A];
  var COLORS=['#3a5cff','#22dd44','#ff2a2a'];
  function reset(){
    formation=[];
    for(var r=0;r<3;r++)for(var c=0;c<6;c++)
      formation.push({hx:44+c*36,hy:22+r*18,x:44+c*36,y:22+r*18,row:r,alive:true});
    dir=1;bullets=[];booms=[];score=0;diving=null;playerX=140;
  }
  reset();
  return {
    draw:function(ctx,t,dt){
      var i;
      for(i=0;i<stars.length;i++){
        var st=stars[i];st.y+=st.s*dt;
        if(st.y>H){st.y=-2;st.x=Math.random()*W;}
      }
      var alive=[];
      for(i=0;i<formation.length;i++)if(formation[i].alive&&formation[i]!==diving)alive.push(formation[i]);
      if(alive.length===0){reset();alive=formation.slice();}
      var minX=999,maxX=-999;
      for(i=0;i<alive.length;i++){minX=Math.min(minX,alive[i].x);maxX=Math.max(maxX,alive[i].x);}
      if((dir>0&&maxX>W-24)||(dir<0&&minX<8)){dir*=-1;for(i=0;i<alive.length;i++)alive[i].y+=5;}
      else{for(i=0;i<alive.length;i++)alive[i].x+=dir*18*dt;}
      if(!diving&&Math.random()<dt*0.5&&alive.length){
        diving=alive[(Math.random()*alive.length)|0];
      }
      if(diving){
        diving.y+=90*dt;
        diving.x=diving.hx+Math.sin(diving.y*0.06)*45;
        if(diving.y>H+12){diving.y=diving.hy;diving.x=diving.hx;diving=null;}
      }
      playerX=140+Math.sin(t*1.4)*100;
      shootT-=dt;
      if(shootT<=0){bullets.push({x:playerX+5,y:132});shootT=0.5;}
      for(i=bullets.length-1;i>=0;i--){
        var b=bullets[i];b.y-=240*dt;
        if(b.y<-10){bullets.splice(i,1);continue;}
        for(var j=0;j<formation.length;j++){
          var a=formation[j];
          if(a.alive&&b.x>=a.x&&b.x<=a.x+16&&b.y>=a.y&&b.y<=a.y+12){
            a.alive=false;booms.push({x:a.x+8,y:a.y+6,t:0});bullets.splice(i,1);
            score+=100;break;
          }
        }
      }
      for(i=booms.length-1;i>=0;i--){booms[i].t+=dt;if(booms[i].t>0.35)booms.splice(i,1);}
      ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#fff';
      for(i=0;i<stars.length;i++)ctx.fillRect(stars[i].x,stars[i].y,1.5,1.5);
      text(ctx,'SCORE '+String(score).padStart(4,'0'),8,6,8,'#0ff');
      text(ctx,'CREDIT 00',W-8,6,8,'#555','right');
      var f=Math.floor(t*3)%2;
      for(i=0;i<formation.length;i++){
        a=formation[i];if(!a.alive)continue;
        px(ctx,a.x,a.y+(f?1:0),SPRITES[a.row],2,COLORS[a.row]);
      }
      ctx.fillStyle='#fff';
      for(i=0;i<bullets.length;i++)ctx.fillRect(bullets[i].x,bullets[i].y,2,8);
      for(i=0;i<booms.length;i++){
        var bm=booms[i];
        ctx.strokeStyle='#f80';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(bm.x,bm.y,2+bm.t*28,0,Math.PI*2);ctx.stroke();
        ctx.lineWidth=1;
      }
      px(ctx,playerX,134,SHIP,2,'#4af');
    },
    title:function(ctx,blink){
      ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
      text(ctx,'GALAGA',W/2,50,16,'#ff2a2a','center');
      text(ctx,'NAMCO 1981',W/2,78,8,'#888','center');
      px(ctx,W/2-8,94,ALIEN_A,2,'#ff2a2a');
      if(blink)text(ctx,'INSERT COIN',W/2,128,8,'#ff0','center');
    }
  };
}

/* ---------------- WIRING ---------------- */
var factories={
  'space-invaders':spaceInvaders,
  'digdug':digDug,
  'pacman':pacman,
  'agent7':agent7,
  'galaga':galaga
};

var previews={},active=null,rafId=null,lastT=0;

function loop(t){
  if(!active)return;
  var dt=Math.min((t-lastT)/1000,0.05);
  lastT=t;
  active.p.draw(active.ctx,t/1000,dt);
  rafId=requestAnimationFrame(loop);
}

function start(p){
  stop();
  active=p;
  lastT=performance.now();
  rafId=requestAnimationFrame(loop);
}

function stop(){
  if(rafId)cancelAnimationFrame(rafId);
  rafId=null;
  if(active){active.p.title(active.ctx,true);active=null;}
}

function init(){
  var cards=document.querySelectorAll('.game-card');
  var isTouch=('ontouchstart' in window);
  for(var i=0;i<cards.length;i++){
    (function(card){
      var key=card.getAttribute('data-preview');
      var f=factories[key];
      if(!f)return;
      var canvas=card.querySelector('canvas');
      var ctx=setup(canvas);
      var p=f();
      var obj={ctx:ctx,p:p};
      previews[key]=obj;
      p.title(ctx,true);
      card.addEventListener('mouseenter',function(){start(obj);});
      card.addEventListener('mouseleave',stop);
      if(isTouch){
        var tapped=false;
        card.addEventListener('click',function(e){
          if(!tapped){
            e.preventDefault();
            tapped=true;
            start(obj);
            setTimeout(function(){tapped=false;},3000);
          }
        });
      }
    })(cards[i]);
  }
  setInterval(function(){
    var now=Math.floor(performance.now()/500)%2===0;
    for(var k in previews){
      if(!active||active!==previews[k])previews[k].p.title(previews[k].ctx,now);
    }
  },500);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();

})();
