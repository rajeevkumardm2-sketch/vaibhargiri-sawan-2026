"use strict";


document.addEventListener("DOMContentLoaded",()=>{


/* ===========================
ELEMENTS
=========================== */

const loader = document.getElementById("loader");
const intro = document.getElementById("intro");
const startButton = document.getElementById("startButton");
const music = document.getElementById("bgMusic");

const scenes = document.querySelectorAll(".scene");
const videos = document.querySelectorAll(".sceneVideo");

const theEnd = document.getElementById("theEnd");



/* ===========================
LOADER
=========================== */

window.addEventListener("load",()=>{

    setTimeout(()=>{

        loader.style.opacity="0";
        loader.style.transition="2s";

        setTimeout(()=>{

            loader.style.display="none";

        },2000);


    },3000);


});



/* ===========================
START EXPERIENCE
=========================== */


let started=false;


startButton.addEventListener("click",()=>{


if(started) return;


started=true;


/* music */

music.volume=0.7;

music.play().catch(()=>{});



intro.style.transition="2s";

intro.style.opacity="0";


setTimeout(()=>{

intro.style.display="none";


startScenes();


},2000);



});





/* ===========================
SCENE ENGINE
=========================== */


let currentScene=0;



const sceneTime=[

8000,   // scene1

10000,  // scene2

9000,   // scene3

8000,   // scene4

9000,   // scene5

10000,  // scene6

9000,   // scene7

9000,   // scene8

10000   // scene9

];





function startScenes(){

showScene(0);

}




function showScene(index){


if(index>=scenes.length){

endExperience();

return;

}



scenes.forEach(scene=>{

scene.classList.remove("active");

});



let scene=scenes[index];


scene.classList.add("active");



/* video control */

videos.forEach(video=>{

video.pause();

video.currentTime=0;

});



let video=scene.querySelector("video");


if(video){

video.play().catch(()=>{});

}



setTimeout(()=>{


showScene(index+1);



},sceneTime[index]);



}







/* ===========================
END EXPERIENCE
=========================== */


function endExperience(){


scenes.forEach(scene=>{

scene.style.opacity="0";

});



theEnd.style.display="flex";


setTimeout(()=>{


theEnd.style.opacity="1";


},100);



/* blur cinematic ending */


setTimeout(()=>{


document.body.style.filter="blur(3px)";


document.body.style.transition="5s";



},7000);



}








/* ===========================
PARTICLE SYSTEM
=========================== */


const canvas=document.getElementById("particleCanvas");


if(canvas){


const ctx=canvas.getContext("2d");


let particles=[];


function resize(){

canvas.width=window.innerWidth;

canvas.height=window.innerHeight;

}


resize();


window.addEventListener("resize",resize);



class Particle{


constructor(){

this.x=Math.random()*canvas.width;

this.y=Math.random()*canvas.height;

this.size=Math.random()*2+1;

this.speed=Math.random()*0.5+0.2;

this.opacity=Math.random();

}


update(){

this.y-=this.speed;


if(this.y<0){

this.y=canvas.height;

this.x=Math.random()*canvas.width;

}


}



draw(){

ctx.beginPath();

ctx.arc(
this.x,
this.y,
this.size,
0,
Math.PI*2
);


ctx.fillStyle=
`rgba(255,220,120,${this.opacity})`;


ctx.fill();


}



}



for(let i=0;i<120;i++){

particles.push(new Particle());

}




function animate(){

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);



particles.forEach(p=>{

p.update();

p.draw();

});



requestAnimationFrame(animate);


}



animate();



}





});