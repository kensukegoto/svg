

document.addEventListener("DOMContentLoaded",()=>{

  const treeButtons = document.querySelectorAll("#treeButtons button");
  const outerRect = document.getElementById("outerRect");
  const terrain = document.getElementById("terrain");
  const MAX_WIDTH = +outerRect.getAttributeNS(null,"width");
  const MAX_HEIGHT = +outerRect.getAttributeNS(null,"height");
  const MIN_HEIGHT = +terrain.querySelector("rect").getAttributeNS(null,"y");
  
  const pineElement = document.querySelector("#pine path");
  const oakElement = document.querySelector("#oak");

  const saveButtons = document.querySelectorAll("#save button");
  const modalButtons = document.querySelectorAll("#modal-inside button");
  const downloadPNGButton = document.getElementById("download-png");

  treeGenerator.init({outerRect,terrain,MAX_WIDTH,MAX_HEIGHT,MIN_HEIGHT,pineElement,oakElement});

  for(let prop of treeButtons){
    prop.addEventListener("click",drawTrees);
  }

  for(let prop of saveButtons){
    prop.addEventListener("click",saveImg);
  }
  for(let prop of modalButtons){
    prop.addEventListener("click",popModal);
  }

  downloadPNGButton.addEventListener("click",saveImg);

});

function drawTrees(){
  switch(this.id){
    case "pineButton":
      treeGenerator.createPines();
      break;
    case "oakButton":
      treeGenerator.createOaks();
      break;
    case "removeButton":
      treeGenerator.removeAllTrees();
      break;
    default:
      return;
  }
}

function saveImg(e){
    const {format} =this.dataset;
    if(format === "prepng"){
      popModal();
    }else{
      const name = document.getElementById("fileName").value;
      const svgData = document.getElementById("svg");
      const width = document.getElementById("png-width").value;
      const height = document.getElementById("png-height").value;
      imageSaver.save(name,format,svgData,width,height);
    }

}

function popModal(){
  const modal = document.getElementById("modal");
  const modalOverlay = document.getElementById("modal-overlay");
  modal.classList.toggle("closed");
  modalOverlay.classList.toggle("closed");
}

const treeGenerator = {

  init(config){
    for(prop in config){
      this[prop] = config[prop]
    }
    this.myTrees = [];
  },


  createOaks(){

    for(let i = 0; i < 20; i++){

      const x = this.getRandom(this.MAX_WIDTH,1);
      const y = this.getRandom(this.MAX_HEIGHT,this.MIN_HEIGHT) - 100;
      const newElement = this.oakElement.cloneNode(true);
      newElement.removeAttributeNS(null,"id");
  
      this.setSVGAttributes(newElement,{
        class:"generated-oak",
        "data-yaxis":y + 100,
        x,y
      });
  
      const rect = newElement.getElementsByTagName("rect")[0];
      this.setSVGAttributes(rect,{x,y})
  
      const ellipses = newElement.getElementsByTagName("ellipse");
  
      for(let i = 0; i < ellipses.length; i++){
        this.setSVGAttributes(ellipses[i],{
          "cx":((i + 1)*10) + x - 20,
          "cy": this.getRandom(y - 10,y + 10)
        })
      }
  
      this.myTrees.push(newElement);
    }
    const sortedTrees = this.orderByYAxis(this.myTrees);
    this.appendTreesInOrder(sortedTrees);



  },


  createPines(){

    for(let i = 0;i < 20; i++){
      const pineClone = this.pineElement.cloneNode();
      const x = this.getRandom(this.MAX_WIDTH,1);
      const y = this.getRandom(this.MAX_HEIGHT,this.MIN_HEIGHT)
      const randomWidth = this.getRandom(100,50)
      const sign = Math.random() * 2 > 1 ? 1 : -1;
        
      this.setSVGAttributes(pineClone,{
        d:`M${x} ${y} H${x + (sign * randomWidth)} L${x + (sign * randomWidth)/2} ${y - randomWidth * 2} Z`,
        class:"generated-pine",
        "data-yaxis":y
  
      })
      this.myTrees.push(pineClone);
    }
     const sortedTrees = this.orderByYAxis(this.myTrees);
     this.appendTreesInOrder(sortedTrees);

  },


  removeAllTrees(){
    for(const prop of this.myTrees){
      this.terrain.removeChild(prop);
    }
    this.myTrees.length = 0;
  },


  appendTreesInOrder(trees){
    for(let prop of trees){
      this.terrain.appendChild(prop);
    }
  },


  setSVGAttributes(element,obj){
    for(let prop in obj){
      element.setAttributeNS(null,prop,obj[prop]);
    }
  },


  getRandom(max,min){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },


  orderByYAxis(trees) {
    const sortedTrees = trees.sort((a,b)=>{
      const ay = a.dataset.yaxis;
      const by = b.dataset.yaxis;
      if(ay > by) return 1;
      else if (ay < by) return -1;
      else return 0;
    })
    return sortedTrees;
   
  }
  
}



const imageSaver = {

  save(name,format,svgData,width,height){

    this.name = name;
    this.format = format;
    this.svgData = svgData;
    this.width = width;
    this.height = height;
    this.parseImage();
  },

  setDimentions(){
    if(this.format !== "png"){
      return this.svgData.outerHTML;
    } else {
      const svgCopy = this.svgData.cloneNode(true);
      svgCopy.setAttributeNS(null,"width",this.width);
      svgCopy.setAttributeNS(null,"height",this.height);
      return svgCopy.outerHTML;
    }

  },

  parseImage(){

    if(this.name.length < 1) this.name = "unnamed";

    const sizedSVG = this.setDimentions();
    const svgBlob = new Blob([sizedSVG],{type:"image/svg+xml"});
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
        canvas.width = this.width;
        canvas.height = this.height;
        const context = canvas.getContext("2d");
        context.drawImage(img,0,0);
        const href = canvas.toDataURL("image/png");
        resolve(href);
      })
    });
  }
}


