$(document).ready(function(){
    setUpVideo();
});
analyzeCurrent = function(){
    //do button animation
    $("#analyzeButton").animate({
        opacity: 0,
        top: "-100%"
    }, 1000)

    var insertHTML = "";

    var curFrame = captureVideoFrame('videoFeed', 'png');

    var fd = new FormData();
    fd.append('filename', 'toAnalyze.' + curFrame.format);
    fd.append('file', curFrame.blob)
    $.ajax({
      type: 'POST',
      url: '/analyze/' + langabr,
      data: fd,
      processData: false,
      contentType: false,
      success: function(data, status){
          console.log(data);
          data = JSON.parse(data);

          //create word table
          insertHTML += "<center><h1> Translations </h1></center>";
          var words = data['imagelabels'];
          var wordTable = '<table width="100%">' +
              "<tr>" +
              "<th><center>Original (English)</center></th><th><center>Translation ("+ langname +")</center></th>" +
              "</tr>";
          for(var i = 0; i < words.length; i++){
            wordTable += "<tr>" +
                "<td><center>" + words[i][0] + "</center></td>" +
                "<td><center>" + words[i][1] + "</center></td>" +
                "</tr>"
          }
          wordTable += "</table>"
          insertHTML += wordTable;

          //create colors
          var colorIndex = "<h1><center>Colors</center></h1>";
          colorIndex += "<table width='100%'><tr>";
          var imageColors = shuffle(data["imagecolors"]);
          for(i = 0; i < 5; i++){
              colorIndex += "<td class='colorShow' style='background:" + imageColors[i][2] + "'><br><br><br><br><br><br></td>"
          }
          colorIndex += "</tr><tr>"
          for(i = 0; i < 5; i++){
              colorIndex += "<td><center>"+ imageColors[i][0] + "<br>"+ imageColors[i][1] + "</center></td>"
          }
          colorIndex += "</tr></table>"


          insertHTML += colorIndex

          $("#analysisResults").html(insertHTML);

      }
    })
};
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
setUpVideo = function(){
    var videoElement = document.querySelector("#videoFeed");
    var backgroundElement = document.querySelector("#backgroundFeed");

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

    if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true}, handleVideo, videoError);
}

    function handleVideo(stream) {
        videoElement.src = window.URL.createObjectURL(stream);
        backgroundElement.src = window.URL.createObjectURL(stream);
    }

    function videoError(e) {
        // do something
    }
};