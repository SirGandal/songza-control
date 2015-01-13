chrome.tabs.query({
    url: ["*://songza.com/*"]
}, function(tabsArray) {
    
    // tabsArray will contain all the songza tabs
    // for each tab we want to inject a script to do 
    // the stuff that we do already in the content.js script

	tabsArray.forEach(function(tab){
		console.log("Injecting script in tab: " + tab.id);
		chrome.tabs.executeScript(tab.id, { file: "jquery-2.1.3.min.js" }, function() {
			chrome.tabs.executeScript(tab.id, { file: "executableScript.js" });
		});
    });
});

$(document).ready( function() {
	$("#like").click(function(){
		console.log("send likeCurrentSong");
		chrome.extension.sendMessage({
			type: "likeCurrentSong"
		});
	});
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
        case "updateSongInfo":

            var title = request.data.title;
			var artist = request.data.artist;
			var album = request.data.album;
			var thumbnailCoverUrl = request.data.thumbnailCoverUrl;
			
			console.log(title + " " + artist + " " + thumbnailCoverUrl);

			$("#song-name").html(title);
			$("#artist-name").html(artist);
			$("#album-name").html(album);
			$("#album-art").attr("src", thumbnailCoverUrl);

        break;

    }
    return true;
});