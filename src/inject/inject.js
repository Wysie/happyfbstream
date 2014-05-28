$(document).ready(function() {
  chrome.storage.sync.get({
    apikey: '',
  }, function(items) {
    apikey = items.apikey;
    processSentiment(apikey);
    startObserver(apikey);
  });
})

function startObserver(apikey) {
  var target = document.querySelector('#contentArea');
  var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
          processSentiment(apikey);
      });    
  });
  var config = { childList: true, subtree: true }
  observer.observe(target, config);  
}

function processSentiment(apikey) {
  $('.userContent').not('.processedSentiment').each(function() {
    var streamText = $(this).text();
    var currDiv = $(this);
    if (streamText !== "") {
      $.ajax({
        url: 'https://access.alchemyapi.com/calls/text/TextGetTextSentiment',
        dataType: 'jsonp',
        jsonp: 'jsonp',
        type: "post",
        data: { apikey: apikey, text: streamText, outputMode: 'json' },
        success: function(res){
          if (res["status"] === "OK") {
            var sentType = res["docSentiment"]["type"];
            var sentScore = res["docSentiment"]["score"];

            if (sentType !== undefined) {
              sentType = sentType.capitalize();
              if (sentScore === undefined)
                currDiv.parent().prepend('<div class="sentiment"><span class="sentimentHeading">Sentiment:</span> <span class="sentimentType">' + sentType + '</span></div>');
              else if (sentScore > 0)
                currDiv.parent().prepend('<div class="sentiment"><span class="sentimentHeading">Sentiment:</span> <span class="positive">' + sentType + '</span><br><span class="sentimentHeading">Score:</span> <span class="positive">' + sentScore + '</span></div>');
              else if (sentScore < 0)
                currDiv.parent().prepend('<div class="sentiment"><span class="sentimentHeading">Sentiment:</span> <span class="negative">' + sentType + '</span><br><span class="sentimentHeading">Score:</span> <span class="negative">' + sentScore + '</span></div>');
            }
          }
          else if (res["status"] === "ERROR") {
            currDiv.parent().prepend('<div class="sentiment"><span class="sentimentHeading">Sentiment:</span> ' + res["statusInfo"]);
          }
        },
        error: function(jqxhr) {
          //console.log(jqxhr);
        }
      });
      currDiv.addClass('processedSentiment');
    }
  });
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}