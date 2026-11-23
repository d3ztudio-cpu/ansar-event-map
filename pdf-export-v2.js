(function(){
  if(!window.jspdf)return;
  var proto=window.jspdf.jsPDF.prototype,oldLine=proto.line,oldSave=proto.save;
  var colors=[[37,99,235],[234,88,12],[16,148,106],[147,51,234],[220,38,127],[14,116,144]],n=0;
  proto.line=function(){var c=colors[Math.floor(n/3)%colors.length];n++;this.setDrawColor(c[0],c[1],c[2]);this.setLineDashPattern([1.5,1.5],0);this.setLineWidth(.7);return oldLine.apply(this,arguments)};
  var oldFontSize=proto.setFontSize;
  proto.setFontSize=function(size){return oldFontSize.call(this,size<12?size*1.45:size)};
  proto.save=function(){if(window.QRious){var c=document.createElement("canvas");new QRious({element:c,value:"https://d3ztudio-cpu.github.io/ansar-event-map/",size:220,level:"H"});this.setFillColor(255,255,255);this.rect(252,168,35,35,"F");this.addImage(c.toDataURL("image/png"),"PNG",255,171,29,29);this.setFontSize(6);this.setTextColor(18,59,53);this.text("Scan for live map",253,207)}return oldSave.call(this,"ansar-campus-map-v2.pdf")};
})();
