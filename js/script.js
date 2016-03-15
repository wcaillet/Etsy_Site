console.log("hey pal!")
console.log($)
console.log(Backbone)

// Routes: 
//   scroll/list view
//   detail/single item view

var accessKey = 'aavnvygu0h5r52qes74x9zvo'

var baseUrl = "https://openapi.etsy.com/v2/listings/" 

//var apiKey = "?api_key=6lzngc5pqpoufi9bvrt6zupg"

//--------------------------------------//
//         Model                        //            
//--------------------------------------//

//Url for image and shop info: https://openapi.etsy.com/v2/listings/active.js?includes=Images,Shop&api_key=aavnvygu0h5r52qes74x9zvo&callback=?


var EtsyModel = Backbone.Model.extend({
	_apiKey: accessKey,
	url: 'https://openapi.etsy.com/v2/listings/active.js?' 
})

var EtsyDetailModel = Backbone.Model.extend({
	_apiKey: accessKey,
	url: 'https://openapi.etsy.com/v2/listings/'
})

// https://openapi.etsy.com/v2/listings/183182778.js?api_key=aavnvygu0h5r52qes74x9zvo&callback=?

//--------------------------------------//
//         Views                        //            
//--------------------------------------//

var EtsyScrollView = Backbone.View.extend({

	el: "#viewsContainer",

	initialize: function(someModel){
		this.model = someModel
		var boundRender = this._render.bind(this)
		this.model.on("sync", boundRender)
	},

	events: {
		"click img": "_triggerDetailView",
		"keydown input": '_searchByKeyword'
	},

	_searchByKeyword: function(keyEvent) {
		var searchTerm = keyEvent.target.value
		if(keyEvent.keyCode === 13){
			location.hash = 'search/' + searchTerm
		}
	},

	_triggerDetailView: function(clickEvent){
		//console.log(clickEvent.target) - this tests
		var imgNode = clickEvent.target
		window.location.hash = "detail/" + imgNode.getAttribute("listingid")
	},

	_render: function(){
		console.log(this.model)
		var dataArray = this.model.get('results')
		var listingUrlString = '<input type="text" placeholder="Search here">'
		//console.log(dataArray[i])
		
		for (var i=0; i<dataArray.length; i++){
			var listingObject = dataArray[i]
			var imageArray = listingObject.Images
				var imageUrl = imageArray[0].url_75x75 //Even though the images are in an array, we just select the one image from the array that we want

			listingUrlString += '<div class="listView">'
			listingUrlString += 	'<img listingid="' + listingObject.listing_id + '"'
			listingUrlString += 	'class="listingScroll" src=" ' + imageUrl + ' ">'
			listingUrlString += 	'<span class="itemTitle">' + listingObject.title + '</span>'
			listingUrlString += 	'<span>Seller: ' + listingObject.Shop.shop_name + '</span>'
			listingUrlString += 	'<span class="itemPrice">Price: ' + listingObject.price 
			listingUrlString +=  	     listingObject.currency_code + '</span>'
			listingUrlString += '</div>'
		}
		this.el.innerHTML = listingUrlString
	}

})

var EtsyDetailView = Backbone.View.extend({
	el: "#viewsContainer",

	initialize: function(someModel){
		this.model = someModel
		var boundRender = this._render.bind(this)
		this.model.on("sync", boundRender)
	},

	_render: function(){
		//console.log(this.model)
		var detailsResult = this.model.get('results')
		
		var detailUrlString = ''
		//console.log(detailsObject[0])

			var detailObject = detailsResult[0]
			console.log(detailObject)
			//var detailObject = detailsObject[i]
			var imageArray = detailObject.Images
				var imageUrl = imageArray[0].url_570xN 

			// var materialsArray = detailObject.materials
			// 	var materials = materialsArray[i] 
				
			detailUrlString += '<div class="detailBox">'
			detailUrlString +=	   '<div class="detailImageBox">'		
			detailUrlString +=		  '<img class="detailImage" src="' + imageUrl + '">'
			detailUrlString +=	   '</div>'
			detailUrlString += 	   '<div class="detailDesc">'
			detailUrlString +=	   	  '<h2>' + detailObject.title + '</h2>'
			detailUrlString +=		  '<p><strong>Seller: </strong>' + detailObject.Shop.shop_name + '</p>'
			detailUrlString +=		  '<p>' + detailObject.price + " " + detailObject.currency_code + '</p>'
			detailUrlString += 		  '<p><strong>Description: </strong>' + detailObject.description + '</h4>' 
			detailUrlString +=		  '<h4> Overview </h4>'
			detailUrlString +=		  '<ul class="detailList">'
			// detailUrlString +=			 '<li> Materials: ' + detailObject.materials + '</li>'
			detailUrlString +=			 '<li>Shipping: ' + detailObject.policy_shipping + '</li>'
			detailUrlString +=			 '<li>Favorited by: ' + detailObject.num_favorers + '</li>'
			detailUrlString +=		  '</ul>'
			detailUrlString +=	   '</div>'
			detailUrlString += '</div>'

		this.el.innerHTML = detailUrlString
	}

})


//--------------------------------------//
//         Router                       //            
//--------------------------------------//

var EtsyRouter = Backbone.Router.extend({

	routes:{
		"scroll/:query" : "handleScrollView",
		"detail/:id" : "handleDetailView",
		"search/:searchTerm": "handleEtsySearchData",
		"*default" : "handleScrollView"
	},

	handleScrollView: function(query){
		var model = new EtsyModel()
		//model._generateUrl(query)
		var newView = new EtsyScrollView(model)
		//model.fetch()

		var promise = model.fetch({
			dataType: "jsonP", //Including this so don't need callback hack
			data: {
				q: query,
				includes: "Images,Shop",
				api_key: model._apiKey
			}
		})
	},

	handleDetailView: function(listingId){
		var detailModel = new EtsyDetailModel()
		var newDetailView = new EtsyDetailView(detailModel)
		detailModel.url += listingId + '.js?' //put detailModel.url b/c url is a property on the  EtsyDetailModel in our model.

		var promise = detailModel.fetch({
			dataType: "jsonP",
			data: {
				//q: query,
				includes: "Images,Shop",
				api_key: detailModel._apiKey
			}
		})
	},

	handleEtsySearchData: function(searchTerm){
		var model = new EtsyModel()
		var newView = new EtsyScrollView(model)
		model.fetch({
			dataType: "jsonP",
			data:{
				includes: "Images,Shop",
				api_key: model._apiKey,
				keywords: searchTerm,
			}
		})

	},

	initialize: function(){
		Backbone.history.start()
	}

})

//--------------------------------------//

var router = new EtsyRouter()

var viewsContainer = document.querySelector('#viewsContainer')
//viewsContainer.addEventListener('click', changeView)













