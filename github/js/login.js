/**
*@fileOverview Login Page
* @module Login
*
*/

/**
*@classDesc This class deal with all action of users' `login`
*@exports Login
*@constructor
*/
var App={
	elements:{
		"loginEl" : $(".login"),
		"inputs" : $(".login input"),
	},

	/**
	*This method is responsible for call all listeners, in our case, call submit listener
	* @memberOf Login#
	* @name events
	*/
	events:function(){
		this.elements.loginEl.find("form").bind("submit",this.submit);
	},

	/**
	*Initial method, responsible for call events method and verify if user is logged or not.
	* @memberOf Login#
	* @name init
	*/
	init:function(){
		this.usr = null;
		this.events();
		this.usr = $.cookie("portal"); 
		this.elements.inputs.attr("autocomplete", "off");
		if(this.usr && this.usr.VendaPersonalizada)
            window.location.href = './index.html';
	},

	/**
	*Submit method
	* @param {event} a - Submit event itself
	* @memberOf Login#
	*/
	submit:function(a){
		a.preventDefault();
		var complet, val=[], contex=App;
		contex.elements.inputs.removeClass("error");

		//Pass into all inputs
		$.each(contex.elements.inputs, function(index, obj) {
		  complet = !1;
	      //if(!obj.value) {
	      //	//If if empty and is required
	      //  return $(this).addClass('error'), !1;
	      //}
	      val.push(obj.value);
	      complet = !0;
	    });
	    if(complet){
	    	val = val.join("/");
	    	console.log("http://189.126.197.169/node/express/setuser?query=" + val + "?callback=?");
	    	$.getJSON("http://189.126.197.169/node/express/setuser?query=" + val + "?callback=?", function(a) { 
			    if((a.TIPO && null !== a.TIPO) && a.VendaPersonalizada ) {
			    	var page="";
			    	$.cookie.json = !0, $.cookie("portal", a, {expires:7, path:"/"});
					window.location.href = "./index.html"
			    } else {
			    	if(!a.VendaPersonalizada){
			    		alert('Você não possui acesso ao sistema!');
			    	}
			    	else{
			    		alert('Erro!');
			    	}
			    }
		  	})
	    }
	}
	
};
App.init();