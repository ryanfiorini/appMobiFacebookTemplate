var facebookAPI=function(){
			return{
			
				currentAuthToken:'',
				receivedDataCallback:'',
				debugMode:1,
				me:{},
			
			
				init:function(){

					/************************************
						Make sure we have access to the appMobi library
					************************************/
					try{
						AppMobi.device.appmobiversion;
						return true;
					}catch(er){
						alert('You are missing the appMobi library. Please include the appMobi library to support Push Messages.');
						return false;
					}

				},
				
				login: function (callbackFunction) {
					facebookAPI.debug("about to log into facebook");
					if(callbackFunction!='' && callbackFunction!=undefined && callbackFunction!='undefined' && callbackFunction!=null){
						facebookAPI.receivedDataCallback=callbackFunction;
						document.addEventListener("appMobi.facebook.login", function (e) {
						    debugger;
							facebookAPI.currentAuthToken = e.token;
							try { this.getUser(); } catch(e) {}
						
							//make the callback
							eval(facebookAPI.receivedDataCallback(e));
						},false); 
					}
					AppMobi.facebook.login("email,publish_stream,publish_actions,offline_access");
				},
				
				//name,picture,caption,description,link are all possible parameters
				post: function (params, callbackFunction) {
					try { document.removeEventListener("appMobi.facebook.dialog.complete"); } catch(e) {}
					if(callbackFunction!='' && callbackFunction!=undefined && callbackFunction!='undefined' && callbackFunction!=null){
						facebookAPI.receivedDataCallback=callbackFunction;
						document.addEventListener("appMobi.facebook.dialog.complete",facebookAPI.receivedDataCallback,false); 
					}

					var myData, dataArray, key;
					var dataString = "";
					for (key in params) {
					    if (params.hasOwnProperty(key)) {
					        if (dataString.length > 0) { dataString = dataString + "&"; }
					        dataString += key + "=" + params[key];
					    }
					}
					AppMobi.facebook.showNewsFeedDialog(dataString);
				},
				
				//message, title, filters, exclude_ids, max_recipients, data are all possible parameters
				request:function(params, callbackFunction) {
				
					try { document.removeEventListener("appMobi.facebook.dialog.complete"); } catch(e) {}
					if(callbackFunction!='' && callbackFunction!=undefined && callbackFunction!='undefined' && callbackFunction!=null){
						facebookAPI.receivedDataCallback=callbackFunction;
						document.addEventListener("appMobi.facebook.dialog.complete",facebookAPI.receivedDataCallback,false);
					}
					AppMobi.facebook.showAppRequestDialog(params);	
				},
				
				getUser: function (callbackFunction) {
				    debugger;
					try { document.removeEventListener("appMobi.facebook.request.response"); } catch(e) {}
					if(callbackFunction!='' && callbackFunction!=undefined && callbackFunction!='undefined' && callbackFunction!=null){
						facebookAPI.receivedDataCallback=callbackFunction;
						document.addEventListener("appMobi.facebook.request.response",function(e){
							if (e.success == true) {
								this.me = e.data;
							} 
							
						    try {
						        //remove the event handler
						        document.removeEventListener("appMobi.facebook.request.response");
						    } catch (e) {}
							
							//make the callback
							eval(facebookAPI.receivedDataCallback(this.me));
						
						},false);
					}
					
					AppMobi.facebook.requestWithGraphAPI("/me","GET",{});
				},
				
				

				//a generic Facebook graph API -- requires path parameter
				friends:function(facebookUserID, callbackFunction) {
				    debugger;
					if (facebookUserID == "") { facebookUserID = "me"; }
					
					facebookAPI.debug("about to query the Facebook Graph");
				
					try { document.removeEventListener("appMobi.facebook.request.response"); } catch(e) {}
					if(callbackFunction!='' && callbackFunction!=undefined && callbackFunction!='undefined' && callbackFunction!=null){
						facebookAPI.receivedDataCallback=callbackFunction;
						document.addEventListener("appMobi.facebook.request.response",function(e){
						
							var objFriends = {"success":false};
							if (e.success == true) {
								
								facebookAPI.debug(e);
								facebookAPI.debug(e.data);
								
								objFriends = e.data;
								    try {
								        //remove the event handler
								        document.removeEventListener("appMobi.facebook.request.response");
								    } catch (e) { }
								} else { objFriends = e; }
					
							//make the callback
							eval(facebookAPI.receivedDataCallback(objFriends));
						
						},false);
					}
											
					AppMobi.facebook.requestWithGraphAPI("/me/friends","GET",{});
				},
				
				invite:function(facebookUserID,callbackFunction) {
				
				},
				
				//gets a picture of a Facebook Graph item based on an ID
				picture:function(facebookID) {
					return "http://graph.facebook.com/" + facebookID + "/picture";
				},
				
				debug:function(debugMessage) {
					if (this.debugMode == 1) {
						console.log(debugMessage);
					}
					if (this.debugMode == 2) {
						alert(debugMessage);
					}
				},
				
				logout:function(callbackFunction) {
					try { document.removeEventListener("appMobi.facebook.logout"); } catch(e) {}
					if(callbackFunction!='' && callbackFunction!=undefined && callbackFunction!='undefined' && callbackFunction!=null){
						facebookAPI.receivedDataCallback=callbackFunction;
						document.addEventListener("appMobi.facebook.logout",facebookAPI.receivedDataCallback,false);
					}				
					AppMobi.facebook.logout();
				}
			
			}
		}();