/* Holochain API */ var _core_remove=remove;remove=function(a,b){return checkForError("remove",_core_remove(a,b))};var _core_makeHash=makeHash;makeHash=function(a,b){return checkForError("makeHash",_core_makeHash(a,b))};var _core_debug=debug;debug=function(a){return checkForError("debug",_core_debug(JSON.stringify(a)))};var _core_call=call;call=function(a,b,c){return __holochain_api_check_for_json(checkForError("call",_core_call(a,b,c)))};var _core_commit=commit;commit=function(a,b){return checkForError("commit",_core_commit(a,b))};var _core_get=get;get=function(a,b){return __holochain_api_check_for_json(checkForError("get",b===undefined?_core_get(a):_core_get(a,b)))};var _core_getLinks=getLinks;getLinks=function(a,b,c){return checkForError("getLinks",_core_getLinks(a,b,c))};var _core_send=send;send=function(a,b,c){return __holochain_api_check_for_json(checkForError("send",c===undefined?_core_send(a,b):_core_send(a,b,c)))};function __holochain_api_check_for_json(rtn){try{rtn=JSON.parse(rtn)}catch(err){}return rtn}function checkForError(func,rtn){if(typeof rtn==="object"&&rtn.name=="HolochainError"){var errsrc=new getErrorSource(4);var message='HOLOCHAIN ERROR! "'+rtn.message.toString()+'" on '+func+(errsrc.line===undefined?"":" in "+errsrc.functionName+" at line "+errsrc.line+", column "+errsrc.column);throw{name:"HolochainError",function:func,message:message,holochainMessage:rtn.message,source:errsrc,toString:function(){return this.message}}}return rtn}function getErrorSource(depth){try{throw new Error}catch(e){var line=e.stack.split("\n")[depth];var reg=/at (.*) \(.*:(.*):(.*)\)/g.exec(line);if(reg){this.functionName=reg[1];this.line=reg[2];this.column=reg[3]}}}
/* Anchors API */ function __anchors_api_postCallProcess(rtn){return rtn}function __anchors_api_isObject(item){return item===Object(item)}function setAnchor(anchor,value,entryType,preserveOldValueEntry,anchorHash,valueHash){if(__anchors_api_isObject(anchor))return __anchors_api_postCallProcess(call("anchors","set",anchors));var parms={anchor:anchor,value:value};if(entryType!==undefined)parms.entryType=entryType;if(preserveOldValueEntry!==undefined)parms.preserveOldValueEntry=preserveOldValueEntry;if(anchorHash!==undefined)parms.anchorHash=anchorHash;if(valueHash!==undefined)parms.valueHash=valueHash;return __anchors_api_postCallProcess(call("anchors","set",parms))}function getAnchor(anchor,anchorHash){if(__anchors_api_isObject(anchor))return __anchors_api_postCallProcess(call("anchors","get",anchors));var parms={anchor:anchor};if(anchorHash!==undefined)parms.anchorHash=anchorHash;return __anchors_api_postCallProcess(call("anchors","get",parms))}function addToListAnchor(anchor,value,entryType,preserveOldValueEntry,anchorHash,valueHash){if(__anchors_api_isObject(anchor))return __anchors_api_postCallProcess(call("anchors","addToList",anchors));var parms={anchor:anchor,value:value};if(entryType!==undefined)parms.entryType=entryType;if(preserveOldValueEntry!==undefined)parms.preserveOldValueEntry=preserveOldValueEntry;if(anchorHash!==undefined)parms.anchorHash=anchorHash;if(valueHash!==undefined)parms.valueHash=valueHash;return __anchors_api_postCallProcess(call("anchors","addToList",parms))}function getFromListAnchor(anchor,anchorHash){if(__anchors_api_isObject(anchor))return __anchors_api_postCallProcess(call("anchors","getFromList",anchors));var parms={anchor:anchor};if(anchorHash!==undefined)parms.anchorHash=anchorHash;return __anchors_api_postCallProcess(call("anchors","getFromList",parms))}function removeFromListAnchor(anchor,value,entryType,preserveOldValueEntry,anchorHash,valueHash){if(__anchors_api_isObject(anchor))return __anchors_api_postCallProcess(call("anchors","removeFromList",anchors));var parms={anchor:anchor};if(value!==undefined)parms.value=value;if(entryType!==undefined)parms.entryType=entryType;if(preserveOldValueEntry!==undefined)parms.preserveOldValueEntry=preserveOldValueEntry;if(anchorHash!==undefined)parms.anchorHash=anchorHash;if(valueHash!==undefined)parms.valueHash=valueHash;return __anchors_api_postCallProcess(call("anchors","removeFromList",parms))}function makeAnchorValueHash(value,entryType){var parms={value:value};if(entryType!==undefined)parms.entryType=entryType;return __anchors_api_postCallProcess(call("anchors","makeAnchorValueHash",parms))}

var AppID = App.DNA.Hash;
var Me = App.Agent.Hash;

// Retrieves a property of the holochain from the DNA (e.g., Name, Language)
function getProperty(name) {
    return property(name);
}

// Expects a userAddress hash of the person you want to follow
function follow(userAddress) {
    addToListAnchor(Me + ":followers", userAddress);
    addToListAnchor(userAddress + ":following", Me);
}

function unfollow(userAddress) {
    removeFromListAnchor(Me + ":followers", userAddress);
    removeFromListAnchor(userAddress + ":following", Me);
}

function getFollowers(parms) {
    return getFromListAnchor(parms.userAddress + ":followers");
}

function getFollowing(parms) {
    return getFromListAnchor(parms.userAddress + ":following");
}

function post(post) {
    var post_hash = addToListAnchor("posts", post, "post", Me).valueHash;

    // hashtags = post.message.match(/\B\#\w\w+\b/g);

    // if (hashtags != null)
    // {
    //     var links = [];
        
    //     for (var x = 0; x < hashtags.length; x++)
    //     {
    //         var hashtag = hastags[x].substr(1);
    //         var hashtag_hash = commit("hashtag_index_base", "hashtag:" + hashtag);

    //         addToListAnchor("hashtags_index", )

    //         var hashtag_index_base = commit("hashtag_index_base", "hashtag:" + hashtag).valueHash;
    //         links.push({ Base: , Link: post_hash });
    //     }
        
    //     commit("hashtag_index_entry", { Links: links });
    // }

    return post_hash; // Returns the hash key of the new post to the calling function
}

function getPostsBy(parms) {
    return getFromListAnchor("posts", parms.userAddress);
}

function searchPost(searchString) {
    var postHashes = call("holodex", "searchContent", searchString);
    var postHashArr = postHashes.split(',');
    var posts = new Array(postHashArr.length);

    for (var i = 0; i < postHashArr.length; i++) {
        posts[i] = get(postHashArr[i], { GetMask: HC.GetMask.Entry });
    }

    return posts;
}

function postMod(params) {
    var hash = params.hash;
    var post = params.post;

    return update("post", post, hash);
}


// set the handle of this node
function setHandle(handle) {

    // get old handle (if any)
    var oldHandle = getAnchor(Me + ":handle");

    // if there was one, remove old handle from directory by index
    if (oldHandle != null)
        removeFromListAnchor("userDirectory", undefined, undefined, oldHandle);

    // set handle
    setAnchor(Me + ":handle", handle);

    // Add the new handle to the directory
    addToListAnchor("userDirectory", Me, undefined, handle);

    return makeAnchorValueHash(handle);

}

// returns all the handles in the directory
function getHandles() {

    var rtn = getFromListAnchor("userDirectory");

    handles = [];

    for (var x = 0; x < rtn.length; x++)
        handles.push({ handle: rtn[x].index, hash: rtn[x].value });

    handles.sort(function (a, b) {
        if (a.handle < b.handle)
            return -1;
        if (a.handle > b.handle)
            return 1;
        return 0;
    });

    return handles;

}

// returns the current handle of this node
function getMyHandle() {
    return getHandle(Me);
}

// returns the handle of an agent 
function getHandle(userHash) {
    return getAnchor(userHash + ":handle");
}

// gets the AgentID (userAddress) based on handle
function getAgent(handle) {
    return getFromListAnchor("userDirectory", handle);
}

// ==============================================================================
// HELPERS: unexposed functions
// ==============================================================================


// helper function to do getLink call, handle the no-link error case, and copy the returned entry values into a nicer array
function doGetLinkLoad(base, tag) {
    // get the tag from the base in the DHT
    var links = getLinks(base, tag, { Load: true });

    if (isErr(links)) {
        links = [];
    } else {
        links = links.Links;
    }

    var links_filled = [];

    for (var i = 0; i < links.length; i++) {
        var link = { H: links[i].H };
        link[tag] = links[i].E;
        links_filled.push(link);
    }

    return links_filled;
}

// helper function to call getLinks, handle the no links entry error, and build a simpler links array.
function dogetLinks(base, tag) {
    // get the tag from the base in the DHT
    var links = getLinks(base, tag, { Load: true });

    if (isErr(links)) {
        links = [];
    }
    else {
        links = links.Links;
    }

    var links_filled = [];
    for (var i = 0; i < links.length; i++) {
        links_filled.push(links[i].H);
    }

    return links_filled;
}

// ==============================================================================
// CALLBACKS: Called by back-end system, instead of front-end app or UI
// ===============================================================================

// GENESIS - Called only when your source chain is generated:'hc gen chain <name>'
// ===============================================================================
function genesis() {                            // 'hc gen chain' calls the genesis function in every zome file for the app
    // use the agent string (usually email) used with 'hc init' to identify myself and create a new handle
    setHandle(App.Agent.String);
    return true;
}

// ===============================================================================
//   VALIDATION functions for *EVERY* change made to DHT entry -
//     Every DHT node uses their own copy of these functions to validate
//     any and all changes requested before accepting. put / mod / del & metas
// ===============================================================================

function validateCommit(entry_type, entry, header, pkg, sources) {
    return validate(entry_type, entry, header, sources);
}

function validatePut(entry_type, entry, header, pkg, sources) {
    return validate(entry_type, entry, header, sources);
}

function validate(entry_type, entry, header, sources) {
    if (entry_type == "post") {
        var l = entry.message.length;
        if (l > 0 && l < 256) { return true; }
        return false;
    }

    if (entry_type == "handle") {
        return true;
    }

    if (entry_type == "follow") {
        return true;
    }

    return true;
}

// Are there types of tags that you need special permission to add links?
// Examples:
//   - Only Bob should be able to make Bob a "follower" of Alice
//   - Only Bob should be able to list Alice in his people he is "following"
function validateLink(linkEntryType, baseHash, links, pkg, sources) {
    if (linkEntryType == "handle_links") {
        var length = links.length;
        // a valid handle is when:

        // there should just be one or two links only
        if (length == 2) {
            // if this is a modify it will have two links the first of which
            // will be the del and the second the new link.
            if (links[0].LinkAction != HC.LinkAction.Del) return false;
            if (links[1].LinkAction != HC.LinkAction.Add) return false;
        } else if (length == 1) {
            // if this is a new handle, there will just be one Add link
            if (links[0].LinkAction != HC.LinkAction.Add) return false;
        } else { return false; }

        for (var i = 0; i < length; i++) {
            var link = links[i];
            // the base must be this base
            if (link.Base != baseHash) return false;
            // the base must be the source
            if (link.Base != sources[0]) return false;
            // The tag name should be "handle"
            if (link.Tag != "handle") return false;
            //TODO check something about the link, i.e. get it and check it's type?
        }
        return true;
    }
    return true;
}
function validateMod(entry_type, entry, header, replaces, pkg, sources) {
    if (entry_type == "handle") {
        // check that the source is the same as the creator
        // TODO we could also check that the previous link in the type-chain is the replaces hash.
        var orig_sources = get(replaces, { GetMask: HC.GetMask.Sources });

        if (isErr(orig_sources) || orig_sources == undefined || orig_sources.length != 1 || orig_sources[0] != sources[0]) {
            return false;
        }

    }
    else if (entry_type == "post") {
        // there must actually be a message
        if (entry.message == "") return false;
        var orig = get(replaces, { GetMask: HC.GetMask.Sources + HC.GetMask.Entry });

        // check that source is same as creator
        if (orig.Sources.length != 1 || orig.Sources[0] != sources[0]) { return false; }

        var orig_message = JSON.parse(orig.Entry.C).message;
        // message must actually be different
        return orig_message != entry.message;
    }

    return true;
}

function validateDel(entry_type, hash, pkg, sources) {
    return true;
}

// ===============================================================================
//   PACKAGING functions for *EVERY* validation call for DHT entry
//     What data needs to be sent for each above validation function?
//     Default: send and sign the chain entry that matches requested HASH
// ===============================================================================

function validatePutPkg(entry_type) { return null; }
function validateModPkg(entry_type) { return null; }
function validateDelPkg(entry_type) { return null; }
function validateLinkPkg(entry_type) { return null; }

