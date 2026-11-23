(function(){
  var button=document.getElementById("admin-print-button");
  if(!button)return;
  button.onclick=async function(){
    var state=window.ANSAR_ADMIN_STATE, map=state&&state.map(), venues=state&&state.venues();
    if(!map||!window.html2canvas||!window.jspdf){alert("PDF tools are still loading. Refresh and try again.");return}
    var oldCenter=map.getCenter(),oldZoom=map.getZoom(),oldLayers=[],mode=document.getElementById("pdf-map-mode").value;button.disabled=true;button.textContent="Creating PDF…";
    map.eachLayer(function(l){if(l._url){oldLayers.push(l);map.removeLayer(l)}});
    var tileUrl=mode==="satellite"?"https://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}":"https://tile.openstreetmap.org/{z}/{x}/{y}.png",tileOptions={minZoom:17,maxZoom:21,crossOrigin:true};if(mode==="satellite")tileOptions.subdomains=["mt0","mt1","mt2","mt3"];
    var base=L.tileLayer(tileUrl,tileOptions).addTo(map),bounds=L.latLngBounds([10.6983,76.0869],[10.7015,76.0919]);
    map.fitBounds(bounds,{padding:[30,30],animate:false});map.invalidateSize();await new Promise(function(r){setTimeout(r,1200)});
    try{
      var el=document.getElementById("admin-map"),canvas=await html2canvas(el,{useCORS:true,backgroundColor:"#f4f1e9",scale:2}),pdf=new jspdf.jsPDF({orientation:"landscape",unit:"mm",format:"a4"}),x=10,y=17,w=277,h=178;
      pdf.setFontSize(16);pdf.setTextColor(18,59,53);pdf.text(state.title()+" — "+(mode==="satellite"?"Satellite":"2D Map"),10,9);pdf.addImage(canvas.toDataURL("image/jpeg",.92),"JPEG",x,y,w,h);
      var colors=[[37,99,235],[234,88,12],[16,148,106],[147,51,234],[220,38,127],[14,116,144]],cw=el.clientWidth,ch=el.clientHeight;
      venues.filter(function(v){return v.active!==false}).forEach(function(v,i){var p=map.latLngToContainerPoint([v.lat,v.lng]),mx=x+p.x/cw*w,my=y+p.y/ch*h,left=i%2===0,bx=left?17:208,by=25+Math.floor(i/2)*48,bw=72,bh=31,lane=left?118+i*4:179-i*4,edge=left?bx+bw:bx,c=colors[i%colors.length];pdf.setDrawColor(c[0],c[1],c[2]);pdf.setLineDashPattern([1.5,1.5],0);pdf.setLineWidth(.7);pdf.line(edge,by+bh/2,lane,by+bh/2);pdf.line(lane,by+bh/2,lane,my);pdf.line(lane,my,mx,my);pdf.setFillColor(c[0],c[1],c[2]);pdf.circle(mx,my,2.6,"F");pdf.setFillColor(255,255,255);pdf.setDrawColor(c[0],c[1],c[2]);pdf.roundedRect(bx,by,bw,bh,2,2,"FD");pdf.setTextColor(25,35,55);pdf.setFontSize(9);pdf.text((i+1)+". "+(v.name||v.stageNumber||"Venue"),bx+3,by+8);pdf.setFontSize(7.5);var info=[v.block,v.floor,v.category&&v.category.toUpperCase(),v.stageNumber].filter(Boolean).join(" · ");pdf.text(pdf.splitTextToSize(info,bw-6),bx+3,by+15);if(v.description){pdf.setFontSize(7.5);pdf.text(pdf.splitTextToSize(v.description,bw-6).slice(0,2),bx+3,by+24)}});
      if(window.QRious){var qr=document.createElement("canvas");new QRious({element:qr,value:"https://d3ztudio-cpu.github.io/ansar-event-map/",size:220,level:"H"});pdf.setFillColor(255,255,255);pdf.rect(252,168,35,35,"F");pdf.addImage(qr.toDataURL("image/png"),"PNG",255,171,29,29);pdf.setFontSize(7);pdf.setTextColor(18,59,53);pdf.text("Scan for live map",253,207)}
      pdf.save("ansar-campus-map-v3.pdf");
    }catch(e){alert("PDF generation failed. Please refresh and try again.")}finally{map.removeLayer(base);oldLayers.forEach(function(l){l.addTo(map)});map.setView(oldCenter,oldZoom,{animate:false});button.disabled=false;button.textContent="Download A4 PDF"}
  };
})();
