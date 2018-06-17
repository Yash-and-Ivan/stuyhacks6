$(document).ready(function(){
    setUpVideo();
});
analyzeCurrent = function(){
    //do button animation
    document.getElementById("videoFeed").pause();
    $("#analyzeButton").animate({
        opacity: 0,
        top: "-100%"
    }, 1000)
    window.setTimeout(function(){
        $("#loadingIcon").css({
            visibility: "visible"
        })
        $("#loadingIcon").animate({
            opacity: 1
        }, 500)
    }, 250)

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
                "<td onclick=\"window.open('https://www.google.com/search?q=" + words[i][0] +"')\"><center>" + words[i][0] + "</center></td>" +
                "<td><center><div class='tooltip'>" + words[i][1] + "<span class='tooltiptext'>"+words[i][2]+"</span></div></center></td>" +
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
              colorIndex += "<td><center>"+ imageColors[i][0] + "<br><div class='tooltip'>"+ imageColors[i][1] + "<span class='tooltiptext'>"+imageColors[i][3]+"</span></div></center></td>"
          }
          colorIndex += "</tr></table>"


          insertHTML += colorIndex;

          //related words
          insertHTML += "<center><h1>Common Phrases</h1></center>"

          var relatedAdjectives = data["relatedwords"]
          console.log(relatedAdjectives)

          insertHTML += "<p>"

          for(var i = 0; i < relatedAdjectives.length; i++){
              var curWords = relatedAdjectives[i][1]

              for(var j = 0; j < curWords.length; j++){
                  insertHTML += "<div class='tooltip'>" + curWords[j][0]+ "<span class='tooltiptext'>" + curWords[j][1] + " / " + curWords[j][2] + "</span></div>"+ ", "

              }
              if(curWords.length != 0){
                  insertHTML += "<br>"
              }
          }

          insertHTML += "</p>"

          insertHTML += "<button id='#doneButton' onclick = 'resetAnalysis()'> I'm Done. Take Me Back.</button>"

          $("#analysisResults").css({
              opacity: 0
          });


          $("#analysisResults").html(insertHTML);

          $("#loadingIcon").animate({
              opacity: 0
          }, 500, function(){
              $("#analysisResults").animate({
                  opacity: 1
              }, 1000, function(){
                  $("#loadingIcon").css({
                      opacity: 0,
                      visibility: "hidden"
                  })
              })
          })

      }
    })
};
function resetAnalysis(){
    $("#analysisResults").animate({
        opacity: 0
    }, 500 , function(){
        document.getElementById("videoFeed").play();
        $("#analysisResults").html("");
        $("#analyzeButton").css({
            top: "150%",
            opacity: 0
        })
        $("#analyzeButton").animate({
            top: "40%",
            opacity: 1
        }, 500)
    })
}
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

    navigator.getUserMedia = (navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia);

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