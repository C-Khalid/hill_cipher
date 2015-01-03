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

	//Return the inverse of the key if exists.
	MatrixFactory.prototype.inverse = function(){

		var modular13solution = [];
		// Populate the key inverse with values of the Identity matrix
		for(var i=0; i < this.key.length; i++)
		{
			this.keyInverse.push([]);
			for(var j=0; j < this.key.length; j++)
				if( i == j )
					this.keyInverse[i][j] = 1;
				else
					this.keyInverse[i][j] = 0;
			modular13solution.push([]);
			for(var j=0; j < this.key.length; j++)
				modular13solution[i][j] = -1;
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
			else
			{
				// If the number you want to divide by and the number you want to divide 
				// and 26 has a common factor of 2, then the common factor of 2 can be 
				// divide out of all three numbers and a modular equation can be solved modulo 13.(Christensen)
				multiplicativeInverse = modularMultiplicativeInverse(keyCopy[i][i]/2, 13);
				for( var j=0; j<this.key.length; j++)
				{
					this.keyInverse[i][j] = mod  ( (this.keyInverse[i][j]/2 * multiplicativeInverse) , 13 );
					if(this.keyInverse[i][j] < 26)
						modular13solution[i][j] = this.keyInverse[i][j] + 13;
				}
			}

			for(var numberOfMat = 0 ; numberOfMat < Math.pow(2,this.key.length) ; numberOfMat++)
			{
				var temp = numberOfMat.toString(2);
				var extra = temp.length;
				var send = [];
				for(var j = 0; j < this.key.length-extra;j++)
					temp="0"+temp;
				for(var j = 0; j < this.key.length; j++)
				{
					if(temp.charAt(j) == 0)
						send.push(this.keyInverse[i][j]);
					else
						send.push(modular13solution[i][j]);
				}
				if(isItAsolution(send,i, this.key))
					for(var j = 0; j < this.key.length; j++)
						this.keyInverse[i][j] = send[j];
			}
		}
		return this.keyInverse;
	};

	// Multiply the row by every column in the key,
	// If the result is the correct row in I , return true
	function isItAsolution(mat2, one, key)
	{
		for(var i=0; i < mat2.length; i++)
		{
			var total = 0;
			for(var j = 0; j < mat2.length; j++)
				total+=(mat2[j]*key[j][i]);
			total = mod(total,26);
			if( i == one )
			{
				if( total != 1 )
					return false;
			}
			else
			{
				if( total != 0)
					return false;
			}
		}
		return true;
	}

	return MatrixFactory;
});

app.controller('TextController', function(MatrixFactory){

	this.plaintext;
	this.ciphertext;
	var letter = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

	this.encrypt = function(key){

		var mf = new MatrixFactory(angular.copy(key));
		if(! mf.hasInverse())
		{
			alert("No inverse exists!");
			return;
		}
		keyFlipped = [];// The matrix multiplication function in mathjs is expecting each matrix row to be a column
		for(var i = 0; i < key.length; i++)
		{
			keyFlipped.push([]);
			for(var j = 0; j < key.length; j++)
				keyFlipped[i][j] = key[j][i];
		}
		plaintext = this.plaintext.replace(/[^a-z]/gi,'');
		// The plain text must be divisible by the key. pad with X if not.
		if(plaintext.length%key.length!=0)
			plaintext+=Array(plaintext.length%key.length+1).join("X");
		var cipherTextDigit = [];// Hold the cipher text as number, e.g. A = 1, B = 2
		var A = 1;// The decimial value of A. Some papers use 0 for A
		for(var i = 0 ; i < plaintext.length; i+=key.length )
		{
			var temp = [];
			for( var j = 0; j < key.length; j++)
				temp.push(letter.indexOf(plaintext.charAt(i+j).toLocaleUpperCase())+A);
			cipherTextDigit.push( math.multiply(temp,keyFlipped) );
		}
		// Turn the cipher text from numbers to text
		this.ciphertext = "";
		for(var i = 0; i < cipherTextDigit.length; i++)
			for(var j = 0; j < cipherTextDigit[i].length; j++)
				this.ciphertext+=letter[((cipherTextDigit[i][j]-A %26 )+26)%26];
	};

	// The Decrypt is the same as the encrypt function but it needs the inverse of the key instead of the key itself.
	this.decrypt = function(key){

		var mf = new MatrixFactory(angular.copy(key));
		if(! mf.hasInverse())
		{
			alert("No inverse exists!");
			return;
		}
		else
		{
			key = mf.inverse();
			this.encrypt(key);
		}
  		
	};
});