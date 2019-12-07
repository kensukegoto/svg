
const treeButtons = document.getElementById("treeButtons");

document.addEventListener("DOMContentLoaded",()=>{

  const outerRect = document.getElementById("outerRect");
  const terrain = document.getElementById("terrain");
  const MAX_WIDTH = +outerRect.getAttributeNS(null,"width");
  const MAX_HEIGHT = +outerRect.getAttributeNS(null,"height");
  const MIN_HEIGHT = +terrain.querySelector("rect").getAttributeNS(null,"y");
  
  const pineElement = document.querySelector("#pine path");
  const oakElement = document.querySelector("#oak");

  treeGenerator.init({outerRect,terrain,MAX_WIDTH,MAX_HEIGHT,MIN_HEIGHT,pineElement,oakElement});

});

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
        "data-yAxis":y + 100,
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
        d:`M${x} ${y},H${x + (sign * randomWidth)},L${x + (sign * randomWidth)/2} ${y - randomWidth * 2}`,
        class:"generated-pine",
        "data-yAxis":y
  
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
      const ay = a.dataset.yAxis;
      const by = b.dataset.yAxis;
      if(ay > by) return 1;
      else if (ay < by) return -1;
      else return 0;
    })
    return sortedTrees;
   
  }
  
}

treeButtons.addEventListener("click",(e)=>{
  switch(e.target.id){
    case 'pineButton':
      treeGenerator.createPines();
      break;
    case 'oakButton':
      treeGenerator.createOaks();
      break;
    case 'removeButton':
      treeGenerator.removeAllTrees();
      break;

    default:
      break;
  }
});










document.getElementById("save").addEventListener("click",function(e){
  const {format} = e.target.dataset;
  if(format){
    const name = document.getElementById("fileName").value;
    const svgData = document.getElementById("svg").outerHTML;

    imageSaver.save(name,format,svgData);
  }
  
});

const imageSaver = {

  save(name,format,svgData){

    this.name = name;
    this.format = format;
    this.svgData = svgData;
    this.parseImage();
  },

  parseImage(){

    if(this.name.length < 1) this.name = "unnamed";

    const svgBlob = new Blob([this.svgData],{type:"image/svg+xml"});
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


