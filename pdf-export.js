(function(){
  if(!window.jspdf)return;
  var proto=window.jspdf.jsPDF.prototype;
  var original=proto.line;
  var colors=[[37,99,235],[234,88,12],[16,148,106],[147,51,234],[220,38,127],[14,116,144]];
  var index=0;
  proto.line=function(){
    var color=colors[Math.floor(index/3)%colors.length];
    index++;
    this.setDrawColor(color[0],color[1],color[2]);
    this.setLineDashPattern([1.5,1.5],0);
    this.setLineWidth(.7);
    return original.apply(this,arguments);
  };
  var originalSave=proto.save;
  proto.save=function(filename){
    if(window.QRious){
      var qrCanvas=document.createElement("canvas");
      new QRious({element:qrCanvas,value:"https://d3ztudio-cpu.github.io/ansar-event-map/",size:220,level:"H"});
      this.setFillColor(255,255,255);this.rect(252,168,35,35,"F");
      this.addImage(qrCanvas.toDataURL("image/png"),"PNG",255,171,29,29);
      this.setFontSize(6);this.setTextColor(18,59,53);this.text("Scan for live map",253,207);
    }
    return originalSave.call(this,filename);
  };
})();
