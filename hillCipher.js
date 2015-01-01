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
  	// Create a new instance
  	var mf = new MatrixFactory(angular.copy(this.key));
  	if(mf.hasInverse())
      this.isInvertible = true;
  	else
      this.isInvertible = false;
  };
});

app.factory('MatrixFactory', function() {

	//Constructor, with class name
    var MatrixFactory = function(key){
    	this.key = key;
		this.keyInverse = [];
    };

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
	// Public method, assigned to prototype
	MatrixFactory.prototype.hasInverse = function(){
		// Calculate the key determinant using mathjs library
		var determinant = math.det(this.key);
		determinant = mod( determinant , 26 );
		// if the multiplicative inverse of determinant modular 26 is equal to zero, then the key matrix is singular(noninvertible)
		if( modularMultiplicativeInverse( determinant , 26 ) != 0 )
			return true;
		return false;
	};

	//Return the inverse of the key if exists. Not implemented yet!
	MatrixFactory.prototype.inverse = function(){

		// Populate the key inverse with values of the Identity matrix
		for(var i=0; i < this.key.length; i++)
		{
			this.keyInverse.push([]);
			for(var j=0; j < this.key.length; j++)
				if( i == j )
					this.keyInverse[i][j] = 1;
				else
					this.keyInverse[i][j] = 0;
		}

		// Find the key inverse:
		// First step, Apply row operations to this matrix
		// until the left side is reduced to I except for the leading one.
		// The leading one is at [i][j] when i == j
		var keyCopy = angular.copy(this.key); // A copy of the key which will be reduced to I
		for(var i = 0; i < this.key.length; i++) // Up tp down in the matrix
			for(var j = 0; j < this.key.length; j++)// Left to right in the matrix
				if( i != j)
				{
					R11 = keyCopy[i][i]; // The leading one
					R21 = keyCopy[j][i]; // I want this to be zero
					temp1 = [];
					temp2 = [];
					for(var k=0; k < this.key.length; k++)//Left to right
					{
						temp1.push ( mod(  (keyCopy[i][k]*R21) , 26 ) );
						temp2.push ( mod(  (this.keyInverse[i][k]*R21) , 26 ) );
						keyCopy[j][k] =  mod(  (keyCopy[j][k]*R11) , 26 );
						this.keyInverse[j][k] = mod(  (this.keyInverse[j][k]*R11) , 26 );
					}
					for(var k=0; k < this.key.length; k++)//Left to right
					{
						keyCopy[j][k] = mod(  keyCopy[j][k] - temp1[k] , 26 );
						this.keyInverse[j][k] = mod(  this.keyInverse[j][k] - temp2[k] , 26 );
					}
				}

		// Multiply each row by the multiplicative inverse of its leading element
		for( var i=0; i<this.key.length; i++)
		{
			multiplicativeInverse = modularMultiplicativeInverse(keyCopy[i][i], 26);
			if( multiplicativeInverse != 0)
				for( var j=0; j<this.key.length; j++)
					this.keyInverse[i][j] = mod  ( (this.keyInverse[i][j] * multiplicativeInverse) , 26 );
		}
		return this.keyInverse;
	};
	return MatrixFactory;
});