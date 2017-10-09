var feed = require("feed-read");


function getFeedDatas(msg){

    switch(msg){
        case "repubblica":
            var titles=[];
            feed("http://www.repubblica.it/rss/cronaca/rss2.0.xml", function(err, articles) {
                articles.forEach(function(article){
                    var format = "<a href='"+article.link+"'>"+article.title+"</a>\n";
                    titles.push(format);
                });
            });
            return titles.toString();
        break;

        default:
            return "Non conosco questo feed.";
        break;

    }

}