const ns = "http://www.w3.org/2000/svg";
const xlinkNS = "http://www.w3.org/1999/xlink";
const outerRect = document.getElementById("outerRect");
const terrain = document.getElementById("terrain");
const MAX_WIDTH = +outerRect.getAttributeNS(null,"width");
const MAX_HEIGHT = +outerRect.getAttributeNS(null,"height");
const MIN_HEIGHT = +terrain.querySelector("rect").getAttributeNS(null,"y");

const pineElement = document.querySelector("#pine path");
const pineButton = document.getElementById("pineButton");

const oak = document.querySelector("#oak");
const oakButton = document.getElementById("oakButton");

const treeButtons = document.getElementById("treeButtons");
treeButtons.addEventListener("click",treeDispacher);

function treeDispacher(e){
  switch(e.target.id){
    case 'pineButton':
      createPines();
      break;
    case 'removeButton':
      removeAllTrees();
      break;
    case 'oakButton':
      createOaks();
      break;
    default:
      break;
  }
}

let myTrees = [];
function setSVGAttributes(element,obj){
  for(let prop in obj){
    element.setAttributeNS(null,prop,obj[prop]);
  }
}


function createOaks() {
  for(let i = 0; i < 20; i++){

    const x = getRandom(MAX_WIDTH,1);
    const y = getRandom(MAX_HEIGHT,MIN_HEIGHT) - 100;
    const newElement = oak.cloneNode(true);
    newElement.removeAttributeNS(null,"id");

    setSVGAttributes(newElement,{
      class:"generated-oak",
      "data-yAxis":y + 100,
      x,y
    });

    const rect = newElement.getElementsByTagName("rect")[0];
    setSVGAttributes(rect,{x,y})

    const ellipses = newElement.getElementsByTagName("ellipse");

    for(let i = 0; i < ellipses.length; i++){
      setSVGAttributes(ellipses[i],{
        "cx":((i + 1)*10) + x - 20,
        "cy": getRandom(y - 10,y + 10)
      })
    }

    myTrees.push(newElement);
  }
  orderByYAxis();
}

function orderByYAxis() {
  const sortedTrees = myTrees.sort((a,b)=>{
    const ay = a.dataset.yAxis;
    const by = b.dataset.yAxis;
    if(ay > by) return 1;
    else if (ay < by) return -1;
    else return 0;
  })
  for(let prop of sortedTrees){
    terrain.appendChild(prop);
  }
  myTrees = [];
}



function createPines() {
  for(let i = 0;i < 20; i++){
    const pineClone = pineElement.cloneNode();
    const x = getRandom(MAX_WIDTH,1);
    const y = getRandom(MAX_HEIGHT,MIN_HEIGHT)
    const randomWidth = getRandom(100,50)
    const sign = Math.random() * 2 > 1 ? 1 : -1;
      
    setSVGAttributes(pineClone,{
      d:`M${x} ${y},H${x + (sign * randomWidth)},L${x + (sign * randomWidth)/2} ${y - randomWidth * 2}`,
      class:"generated-pine",
      "data-yAxis":y

    })
    myTrees.push(pineClone);
  }
  orderByYAxis();
}

function getRandom(max,min){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function removeAllTrees() {
  for(const prop of myTrees){
    terrain.removeChild(prop);
  }

}

document.getElementById("save").addEventListener("click",function(e){
  const {format} = e.target.dataset;
  if(format){
    const name = document.getElementById("fileName").value;
    const svgData = document.getElementById("svg").outerHTML;

    imageSaver.init(name,format,svgData);
  }
  
});

const imageSaver = {

  init(name,format,svgData){

    this.name = name;
    this.format = format;
    this.svgData = svgData;
    this.saveImage();
  },

  saveImage(){

    if(this.name.length < 1) this.name = "unnamed";

    const svgBlob = new Blob([this.svgData],{type:"image/svg+xml;charset=utf-8"});
    const svgUrl = URL.createObjectURL(svgBlob);

    if(this.format === "png"){
      this.convertToPNG(svgUrl)
        .then(href=>{
          this.downloadImg(href)
        })
    } else {
      this.downloadImg(svgUrl);
    }
  },

  downloadImg(href){
    const downloadLink = document.createElement("a");
    downloadLink.href = href;
    downloadLink.download = `${this.name}.${this.format}`;
    downloadLink.onclick = function(e) { // アロー関数だと this がImageSaverになる
      setTimeout(()=>{
        URL.revokeObjectURL(this.href);
      },1500)
    }
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  },

  convertToPNG(svgUrl){
    return new Promise((resolve,reject)=>{
      const img = new Image();
      img.src = svgUrl;
      img.onload = (()=>{
        const canvas = document.createElement("canvas");
        canvas.width = 1366;
        canvas.height = 768;
        const context = canvas.getContext("2d");
        context.drawImage(img,0,0);
        const href = canvas.toDataURL("image/png");
        resolve(href);
      })
    });
  }
}



function downloadImg(name,type,href){



}


function convertToPNG(svgUrl){


  

}