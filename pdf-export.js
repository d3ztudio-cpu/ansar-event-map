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
})();
