$(document).ready( function() {
	chrome.tabs.query({
		url: ["*://songza.com/*"]
	}, function(tabsArray) {
		
		// tabsArray will contain all the songza tabs
		// for each tab we want to inject a script to do 
		// the stuff that we do already in the content.js script

		tabsArray.forEach(function(tab){
			$("#like").click(function(){
				chrome.tabs.executeScript(tab.id, { code: "$('.thumb-up')[0].click();" });
				chrome.extension.sendMessage({
					type: "likeCurrentSong"
					});
			});	
			
			$("#dislike").click(function(){
				chrome.tabs.executeScript(tab.id, { code: "$('.thumb-down')[0].click();" });
			});	
			
			$("#playpause").click(function(){
				chrome.tabs.executeScript(tab.id, { code: "$('.miniplayer-control-play-pause')[0].click();" });
				if($("#playpause").attr("class").indexOf("play") !== -1){
					$("#playpause").removeClass("play").addClass("pause");
				}else{
					$("#playpause").removeClass("pause").addClass("play");
				}
			});	
			
			$("#next").click(function(){
				chrome.tabs.executeScript(tab.id, { code: "$('.miniplayer-control-skip')[0].click();" });
			});
			
			$("#mute").click(function(){
				chrome.tabs.executeScript(tab.id, { code: "$('.miniplayer-volume-icon')[0].click();" });
			});
			
			console.log("Injecting script in tab: " + tab.id);
			chrome.tabs.executeScript(tab.id, { file: "jquery-2.1.3.min.js" }, function() {
				chrome.tabs.executeScript(tab.id, { file: "executableScript.js" });
			});
			
		});
	});
	
	updateSongsList();
});

function updateSongsList(){
	var playedSongs = chrome.extension.getBackgroundPage().songsList;
	
	if(playedSongs){
		var playedSongsListEl = $("#played-songs-list");
		
		playedSongsListEl.empty();
		
		playedSongs.forEach(function(song){
			playedSongsListEl.append(
				'<div class="played-song">' + 
					'<div class="played-song-info">' +
						'<span class="played-song-title">' + song.title + '</span>' +
						' - ' + 
						'<span class="played-song-artist">' + song.artist + '</span>' +
					'</div>' +
					(song.liked ? '<button title="liked" class="song-list-liked"></button>' : '<button title="like" class="song-list-like"></button>') +
				'</div>');
			$(".played-song:last button").click(function(event){
				chrome.extension.sendMessage(
				{
					type: "likeSong",
					data: {
						title: song.title,
						artist: song.artist,
						album: song.album
						}
				}, function(response){
					if(response.success){
						$(event.target).removeClass("song-list-like").addClass("song-list-liked").attr("title", "liked");
					}
				});
			});
		});
	}
}
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
        case "updateSongInfo":

            var title = request.data.title;
			var artist = request.data.artist;
			var album = request.data.album;
			var thumbnailCoverUrl = request.data.thumbnailCoverUrl;
			var isPlaying = request.data.isPlaying;
			
			console.log(title + " " + artist + " " + thumbnailCoverUrl);

			$("#song-name").html(title);
			$("#artist-name").html(artist);
			$("#album-name").html(album);
			$("#album-art").attr("src", thumbnailCoverUrl);
			if(isPlaying){
				$("#playpause").removeClass("play").addClass("pause");
			}else{
				$("#playpause").removeClass("pause").addClass("play");
			}
			
			updateSongsList();

        break;

    }
    return true;
});