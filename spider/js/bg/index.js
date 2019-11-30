(function(){
	chrome.extension.onConnect.addListener(function(port){	
		port.onMessage.addListener(function(msg,sender){
			if(msg.href){
				var href = msg.href;
				delete msg.href;
				$.ajax({
					url: href,
					data: JSON.stringify(msg),
					type:"POST",
					contentType:"application/json;charset=utf8",
					success:function(resp){
						sender.postMessage(resp);
					}
				});
			}
		});
	});
})();