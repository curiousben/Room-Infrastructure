/*eslint-env node*/
/*eslint n -console:["error", { allow: ["info", "error"] }]*/

const shortid = require('shortid');

/*
* TODO
* Description:
*	This function inflates the JSON obetc passed in with each key being sperated by a period.
* Args:
* 	input (Obj): The JSON input that passed in to be inflated.
* Returns:
*	inflatedJSON (Obj): An inflated n-dimsional infalted JSON object. NOTE: This can only handle primative types in JS.
*
*/
function inflate(input) {
    let inflatedJSON = {};
    for (let key in input) {
        let splitKeys = key.split('.'); 
        if (splitKeys.length !== 1 ) {
            let newKey = splitKeys.slice(1).join('.');
            let newObj = {};
            newObj[newKey] = input[key];
            inflatedJSON[splitKeys[0]] = inflate(newObj);
        } else {
           return Object.assign(inflatedJSON, input);
        }
    }
    return inflatedJSON
}

function inflate(keyArray, input) {
    let inflatedJSON = {};
    for (let key in input){
        let splitKeys = key.split('.');
        if (splitKeys[0] in inflatedJSON){
            inflatedJSON[splitKeys[0]] = inflate(splitKeys.slice(1),inflatedJSON[splitKeys[0]]);
        } else {
            let newObj = {};
            //newObj[splitKeys[0]] = 
        }
    }
}

/*
* Description:
*	This function takes any dimension JSON object and takes each key and creates a one deminstional JSON object with the structure being perserved in the key delimited by '.'.	
* Args:
*	passedKey (String): The passed in key that was parsed by the previous iteration of the flatten function.
*	input (Obj): The JSON input that was passed in for further break down.
* Returns:
*	flattenedJSON (Obj): A flattened one-deminsional JSON object. NOTE: This can only handle primative types in JS.
* TODO:
*	[1#]:
*		Need to account for arrays a bug shows up when parsing a array since Object and Arrays are very simliar in JS
*	[2#]:
*		Need to add exception handling.
*/
function flatten(passedKey, input){
    let flattenedJSON = {};
    if (typeof(input) === 'object'){
        let newKey = (passedKey === '') ? passedKey : passedKey+'.';
        for (let key in input) {
            let flatJSON = flatten(newKey+key, input[key]);
            flattenedJSON = Object.assign(flattenedJSON, flatJSON);
        }
    } else {
        flattenedJSON[passedKey] = input;
    }
    return flattenedJSON
}
/*
* Description:
*	This function creates a RedisMQ formated message with the appropriate metadata.
* Args:
*	payload (Obj): A JSON message that contains data that is being sent over RedisMQ.
* Returns:
*	redisMqMSG (Obj): A RedisMQ message that has all metadata and a payload.
*/
function createRedisMQMsg(payload){
    redisMQMsg = {};
    redisMQMsg['address'] = shortid.generate();
    redisMQMsg['body'] = payload;
    return redisMqMSG
}

/*
*
* Description:
*	This function checks to see if the address and body metadata exists and they are the only keys available.
* Args:
*	redisMQMsg (Obj): A Message that was passed from the producer.
* Returns:
*	(Boolean): A true or false statement determined if the metadata is present or not.
*/
function onlyMetadata(redisMQMsg){
    if (('address' in bodyJSON && 'body' in bodyJSON) && Object.keys(anObj).length === 2){
    	return true	
	} else {
		return false
	}
}

module.exports = {
	inflate : inflate,
	flatten : flatten,
	createRedisMQMsg : createRedisMQMsg,
	onlyMetadata : onlyMetadata
}
