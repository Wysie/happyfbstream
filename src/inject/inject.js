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
  $('.userContentWrapper .userContent').not('.processedSentiment').each(function() {
    var streamText = $(this).text();    
    var $appendContainer = $(this).closest("div[role='article']");
    
    if (!$appendContainer.length)
      $appendContainer = $(this).closest('.userContentWrapper');
    
    if (streamText !== "") {
      var request = $.ajax({
        url: 'https://access.alchemyapi.com/calls/text/TextGetTextSentiment',
        dataType: 'jsonp',
        jsonp: 'jsonp',
        type: "post",
        data: { apikey: apikey, text: streamText, outputMode: 'json' }
      });
      
      request.done(function(res) {
        if (res["status"] === "OK") {
          var sentType = res["docSentiment"]["type"];
          var sentScore = res["docSentiment"]["score"];

          if (sentType !== undefined) {
            sentType = sentType.capitalize();
            if (sentScore === undefined)
               $appendContainer.prepend('<div class="statusSentiment"><span class="statusSentimentHeading">Sentiment:</span> <span class="sentimentType">' + sentType + '</span></div>');
            else if (sentScore > 0)
               $appendContainer.prepend('<div class="statusSentiment"><span class="statusSentimentHeading">Sentiment:</span> <span class="positive">' + sentType + '</span><br><span class="statusSentimentHeading">Score:</span> <span class="positive sentimentScore">' + sentScore + '</span></div>');
            else if (sentScore < 0)
               $appendContainer.prepend('<div class="statusSentiment"><span class="statusSentimentHeading">Sentiment:</span> <span class="negative">' + sentType + '</span><br><span class="statusSentimentHeading">Score:</span> <span class="negative sentimentScore">' + sentScore + '</span></div>');
          }
        }
        else if (res["status"] === "ERROR") {
           $appendContainer.prepend('<div class="statusSentiment"><span class="statusSentimentHeading">Sentiment:</span> ' + res["statusInfo"]);
        }
      });
      
      $(this).addClass('processedSentiment');
    }
  });
  
  $('.UFIList').each(function() {
    //var totalScore = 0.0;
    //var commentsCount = 0;
    var $commentsList = $(this);
    
    /* Still buggy, average comment score.
    $('.UFICommentContentBlock .UFICommentBody', this).filter('.processedSentiment').each(function() {
      $scoreContainer = $('.sentimentScore:first', this);
      
      if ($scoreContainer.length) {
        var currentScore = parseFloat($('.sentimentScore:first', this).text());
        totalScore = totalScore + currentScore;
        commentsCount = commentsCount + 1;
      }
    });
    */
  
    $('.UFICommentContentBlock .UFICommentBody', this).not('.processedSentiment').each(function() {
      var streamText = $(this).text();
      var $currDiv = $(this);
      
      if (streamText !== "") {
        var request = $.ajax({
          url: 'https://access.alchemyapi.com/calls/text/TextGetTextSentiment',
          dataType: 'jsonp',
          jsonp: 'jsonp',
          type: "post",
          data: { apikey: apikey, text: streamText, outputMode: 'json' },
        });
        request.done(function(res) {
          if (res["status"] === "OK") {
            var sentType = res["docSentiment"]["type"];
            var sentScore = res["docSentiment"]["score"];             

            if (sentType !== undefined) {
              sentType = sentType.capitalize();
              if (sentScore === undefined)
                $currDiv.closest('.UFICommentContentBlock').append('<div class="commentSentiment"><span class="commentSentimentHeading">Sentiment:</span> <span class="sentimentType">' + sentType + '</span></div>');
              else if (sentScore > 0)
                $currDiv.closest('.UFICommentContentBlock').append('<div class="commentSentiment"><span class="commentSentimentHeading">Sentiment:</span> <span class="positive">' + sentType + '</span> | <span class="commentSentimentHeading">Score:</span> <span class="sentimentScore positive">' + sentScore + '</span></div>');
              else if (sentScore < 0)
                $currDiv.closest('.UFICommentContentBlock').append('<div class="commentSentiment"><span class="commentSentimentHeading">Sentiment:</span> <span class="negative">' + sentType + '</span> | <span class="commentSentimentHeading">Score:</span> <span class="sentimentScore negative">' + sentScore + '</span></div>');
              
              /* Still buggy, average comment score.
              if (sentScore !== undefined) { 
                totalScore = totalScore + parseFloat(sentScore);
                commentsCount = commentsCount + 1;
                var averageCommentScore = (totalScore/commentsCount).toFixed(6);
                var content = "";
                
                if (averageCommentScore > 0)
                  content = '<div class="overallCommentSentiment"><span class="overallCommentSentimentHeading">Average Sentiment Score:</span> <span class="sentimentScore positive">' + averageCommentScore + '</span></div>';
                else if (averageCommentScore < 0)
                  content = '<div class="overallCommentSentiment"><span class="overallCommentSentimentHeading">Average Sentiment Score:</span> <span class="sentimentScore negative">' + averageCommentScore + '</span></div>';
                else
                  content = '<div class="overallCommentSentiment"><span class="overallCommentSentimentHeading">Average Sentiment Score:</span> <span class="sentimentScore">' + averageCommentScore + '</span></div>';
                  
                var $avgScore = $commentsList.find(".overallCommentSentiment");
                  
                if (!$avgScore.length) {
                    $commentsList.prepend(content);
                } else {
                    $avgScore.replaceWith(content);
                }
              }
              */
            }
          }
          else if (res["status"] === "ERROR") {
            $currDiv.closest('.UFICommentContentBlock').append('<div class="commentSentiment"><span class="commentSentimentHeading">Sentiment:</span> ' + res["statusInfo"]);
          }
        });        
        $currDiv.addClass('processedSentiment');
      }
    });
  });
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}