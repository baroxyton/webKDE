"use strict";
class DesktopDrag{
    constructor(startPosition, currentPosition){
        this.startPosition = startPosition;
        this.currentPosition = currentPosition;
    }
    render(){
        this.element = this.element;
        if(!this.element){
        this.element = document.createElement("div");
        this.element.classList.add("desktopdrag");
        document.getElementById("desktop").appendChild(this.element)
        }
        if(this.currentPosition.y - this.startPosition.y > 0){
            this.element.style.top = this.startPosition.y + "px";
            this.element.style.height = (this.currentPosition.y - this.startPosition.y) + "px";
        }
        else{
            this.element.style.top =  this.currentPosition.y + "px";
            this.element.style.height =  (this.startPosition.y - this.currentPosition.y) + "px";
        }
        if(this.currentPosition.x - this.startPosition.x > 0){
            this.element.style.left = this.startPosition.x + "px";
            this.element.style.width = (this.currentPosition.x - this.startPosition.x) + "px";   
        }
        else{
            this.element.style.left = this.currentPosition.x + "px";
            this.element.style.width = (this.startPosition.x - this.currentPosition.x) + "px";  
        }
    }
    remove(){
        this.element.outerHTML = "";
    }
    change(position){
        this.currentPosition = position;
        this.render();
    }
}
export {DesktopDrag as default};