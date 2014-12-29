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

app.controller('MatrixController', function(MatrixFactory){

  //Default key length 2 X 2
  this.keyLength = 2;

  this.key = [];
  this.isInvertible = false;
  //Populate the key array with noting to initialize it. Size is (keyLength X keyLength)
  this.initializeKeyArray = function(){
	for(var i=0; i < this.keyLength; i++)
	{
	  this.key.push([]);
	  for(var j=0; j < this.keyLength; j++)
		this.key[i].push('');
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

  this.invertible = function(){
  	MatrixFactory.MatrixFactory(this.key);
  	if(MatrixFactory.hasInverse())
  		this.isInvertible = true;
  	else
  		this.isInvertible = false;
  };
});

app.factory('MatrixFactory', function() {

	// The key matrix
	this.key = [];
	this.keyInverse = [];

	//Constructor, with class name
	this.MatrixFactory = function(key){
		this.key = key;
	}
    
    // Return the multiplicative inverse of num modular mod. Zero if it doesn't exists
    function modularMultiplicativeInverse(num, mod){
		if(num == 1)
			return num;
		for(var i = 2; i < mod; i++)
		{
			if ((num*i)%mod == 1)
				return i;
		}
		return 0;
	}

	// Return m mod n. The default js % doesn't work if m < 0
	function mod(m, n) {
        return ((m % n) + n) % n;
	}

	// Return true if key has an inverse. False otherwise
	this.hasInverse = function(){
		// Calculate the key determinant using mathjs library
		var determinant = math.det(this.key);
		console.log("determinant = " + determinant);
		determinant = mod( determinant , 26 );
		console.log("determinant mult = " + modularMultiplicativeInverse( determinant , 26 ));
		// if the multiplicative inverse of determinant modular 26 is equal to zero, then the key matrix is singular(noninvertible)
		if( modularMultiplicativeInverse( determinant , 26 ) != 0 )
			return true;
		return false;
	};

	//Return the inverse of the key if exists. Not implemented yet!
	this.inverse = function(){ return this.keyInverse; };

	return this;
});