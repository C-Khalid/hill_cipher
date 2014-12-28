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

  //Populate the key array with noting to initialize it
  this.initializeKeyArray = function(){
	for(var i=0; i < this.keyLength; i++)
	{
	  this.key.push([]);
	  for(var j=0; j < this.keyLength; j++)
		this.key[i].push('');
	}
  };
  this.initializeKeyArray();

});