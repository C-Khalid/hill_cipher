var app = angular.module('hillCipher',[]);
 
app.controller('TabController', function(){
  this.tab = 1;

  this.setTab = function(tab){
    this.tab = tab;
  };

  this.isSet = function(tab){
    return this.tab === tab;
  };
});

app.controller('MatrixController', function(){

  //Default key length 2 X 2
  this.keyLength = 2;

  this.key = [];

  //Populate the key array with noting to initialize it. Size is (keyLength X keyLength)
  this.initializeKeyArray = function(){
	for(var i=0; i < this.keyLength; i++)
	{
	  this.key.push([]);
	  for(var j=0; j < this.keyLength; j++)
		this.key[i].push(0);
	}
  };
  //Call the key initialization method before loading the page
  this.initializeKeyArray();

  // Increase the key length by one. Maximum length is 6
  this.increaseKeyLength = function(){
  	if(this.keyLength < 6)
  	{
  		this.keyLength++;
  		this.key = [];
  		this.initializeKeyArray();
  	}
  };

  // Decrease the key length by one. Minumum length is 2
  this.decreaseKeyLength = function(){
  	if(this.keyLength  > 2)
  	{
  		this.keyLength--;
  		this.key = [];
  		this.initializeKeyArray();
  	}
  };  

});