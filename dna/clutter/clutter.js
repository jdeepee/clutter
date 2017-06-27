// ==============================================================================
// EXPOSED Functions: visible to the UI, can be called via localhost, web browser, or socket
// ===============================================================================

function getProperty(name) {            // The definition of the function you intend to expose
    return property(name);              // Retrieves a property of the holochain from the DNA (e.g., Name, Language
}


function appProperty(name) {            // The definition of the function you intend to expose
    if (name == "App_Agent_Hash") {return App.Agent.Hash;}
    if (name == "App_Agent_String")  {return App.Agent.String;}
    if (name == "App_Key_Hash")   {return   App.Key.Hash;}
    if (name == "App_DNA_Hash")   {return   App.DNA.Hash;}
    return "Error: No App Property with name: " + name;
}

function follow(userAddress) {
  // Expects a userAddress hash of the person you want to follow
    var me = getMe();                  // Looks up my hash address and assign it to 'me'

       // Commits a new follow entry to my source chain
       // On the DHT, puts a link on their hash to my hash as a "follower"
       // On the DHT, puts a link on my hash to their hash as a "following"
    return commit("follow",
                  {Links:[
                      {Base:userAddress,Link:me,Tag:"follower"},
                      {Base:me,Link:userAddress,Tag:"following"}
                  ]});
}

function unfollow(userAddress){
    var me = getMe();
    return commit("unfollow",  // On my source chain, commits the unfollow entry
                  {Links:[
                      {Base:userAddress,Link:me,Tag:"follower",LinkAction:HC.LinkAction.Del},
                      {Base:me,Link:userAddress,Tag:"following",LinkAction:HC.LinkAction.Del}
                  ]});
}

function post(post) {
    var key = commit("post",post);        // Commits the post block to my source chain, assigns resulting hash to 'key'
    var me = getMe();                       // Looks up my hash address and assign it to 'me'
                                            // which DHT nodes will use to request validation info from my source chain
    commit("post_links",{Links:[{Base:me,Link:key,Tag:"post"}]});

    // TODO detect a hash
    debug(post);
    debug(post.message);
    debug("Starting HASHtag search");
  //  var hashtag=[];
    hashTag=detectHashtag(post.message);
//  var a=hashtag[0];

     if (hashTag != null)
    {
      debug(hashTag);
      debug("::Hashtag found::");
      //TODO searchHashTag(hashtag)}
//  debug("HAHSTAG Length"+hashTag.length);
    searchHashTag(hashTag,post);
      debug("HASHTAGE SAVED");
}
 else {
      debug("Hashtag not found");
    }      // On the DHT, puts a link on my hash to the new post


    debug("meta: "+JSON.stringify(getLink(me,"post",{Load:true})));
    debug(key);
    return key;                                  // Returns the hash key of the new post to the calling function
}

function searchHashTag(hashTag,post)
{
 for (var i = 0; i < hashTag.length; i++)
 {
//   debug("SEARCHING :");
data=getHashTag(hashTag[i]);
debug("Data"+data);

  if (data != "") {
    debug("HASHTAG matched IN DHT");
             linkHashTags(hashTag[i],data,post); //follow)() changed
         }
         else {
var a=hashTag[i];
             debug("HASHTAG no match found");
          //   debug(hashTag[i].value);
        //  debug(a);
      //    debug(typeof a);
             //CREted createHashTag();
          addHashTag(a);
           debug("CREATING HASHTAG COMPLETE")
           debug("ADDING NEW Hanstags:");
           data=getHashTag(hashTag[i]);
           debug("Data"+data);

           if (data != "") {
            debug("HASHTAG FOUND IN DHT");
                     linkHashTags(hashTag[i],data,post); //follow)() changed
                 }
                 else {
           var a=hashTag;
                     debug("HASHTAG not found");
                  //   debug(hashTag[i].value);
                  debug(a);
                  debug(typeof a);
                     //CREted createHashTag();
                  addHashTag(a);
                   debug("CREATING Again HASHTAG COMPLETE")
                 }

       }


       getPostsByTag(hashTag[i]); /**THIS METHORD CAN BE USE TO SEARCH THE HASH TAGS
       <USED here to test if we can get the post to the recently entered hashTag>**/

}
}


function linkHashTags(hashtag,hashTag_Address,post)
{
//  getLink(hashTag_Address,"tag_post",{Load:false};
var hashtagHash = makeHash(hashtag);
var Entrys = get(hashtagHash,{GetMask:HC.GetMask.Entry});
var Default=   get(hashtagHash,{GetMask:HC.GetMask.Default});
var EntryType=get(hashtagHash,{GetMask:HC.GetMask.EntryType});
var All= get(hashtagHash,{GetMask:HC.GetMask.All});
//HC.GetMask.Default/Entry/EntryType/Sources/All;
/*debug("HASHTAG source links:: ");
debug("Entrys"+JSON.stringify(Entrys));
debug("Default"+JSON.stringify(Default));
debug("EntryType"+JSON.stringify(EntryType));
debug("All"+JSON.stringify(All));
*/  var key = commit("tag_post",post);
  commit("hashTag_links",{Links:[{Base:hashtagHash,Link:key,Tag:"tag_post"}]});
  debug("hashTag_linked: "+JSON.stringify(getLink(hashtagHash,"tag_post",{Load:true})));

}


function getHashTag(hashtag)       //getAgent  //GIVES you the sources of the hashtag
{
    var directory = getDirectory();
    var hashtagHash = makeHash(hashtag);
    var sources = get(hashtagHash,{GetMask:HC.GetMask.Sources});
debug("SOURCES:: "+ sources);
for(var i=0;i<sources.length;i++)
debug("SOURCES::"+i+"= "+sources[i]);
    if (isErr(sources)) {sources = [];}
    if (sources != undefined) {
        var n = sources.length -1;
        return (n >= 0) ? sources[n] : "";
    }
    return "";
}



//CREATIGN HASH TAGS
function addHashTag(hashTag)
{
  debug(hashTag);
  debug(typeof hashTag);
  var key =commit("hashTag",hashTag);
  var me = getMe();
  var directory = getDirectory();

  debug(hashTag+" is "+key);

  commit("hashTag_links", {Links:[{Base:me,Link:key,Tag:"hashTag"}]});
var x=  commit("directory_links", {Links:[{Base:directory,Link:key,Tag:"hashTag"}]});

  debug("hashTag_links: "+JSON.stringify(getLink(me,"hashTag",{Load:true})));
  debug("directory_links "+JSON.stringify(getLink(directory,"hashTag",{Load:true})));
//return x;
}





function detectHashtag(postString)
{
//  String str="#important thing in #any programming #7 #& ";

  var regexp = /\B\#\w\w+\b/g;
  hashtag = String(postString).match(regexp);

a=hashtag;

//debug(typeof hashtag);
  if (hashtag != null)
  {
  //  debug("hashtag");
    return hashtag;
  }
  else
  {
    //debug("NULL");
    return null;
}

return hashtag;
}


function postMod(params) {
    var hash = params.hash;
    var post = params.post;
    // TODO, update the original link too?
    return update("post",post,hash);
}

// TODO add "last 10" or "since timestamp" when query info is supported
function getPostsBy(userAddresses) {
    // From the DHT, gets all "post" metadata entries linked from this userAddress
    var posts = [];
    for (var i=0;i<userAddresses.length;i++) {
        var author = userAddresses[i];
        var authorPosts = doGetLinkLoad(author,"post");
        // add in the author
        for(var j=0;j<authorPosts.length;j++) {
            var post = authorPosts[j];
            post.author = author;
            posts.push(post);
        }
    }
    return posts;
}
//gets the post linked to the hashTag
function getPostsByTag(author) {
    // From the DHT, gets all "post" metadata entries linked from this userAddress
    var posts = [];

    author=makeHash(author);
      var authorPosts = doGetTagLinkLoad(author,"tag_post");
        // add in the author
        //  debug("authorPosts ::"+posts);
        for(var j=0;j<authorPosts.length;j++) {
            var post = authorPosts[j];
            post.author = author;
            posts.push(post);
        }
        debug("Retrning ::"+posts);

        debug("Retrning posts ::"+JSON.stringify(posts));
    return posts;
}
// get a list of all the people from the DHT a user is following or follows
function getFollow(params) {
    var type = params.type;
    var  base = params.from;
    var result = {};
    if ((type == "follows") || (type == "following")) {
        result["result"] = doGetLink(base,type);
    }
    else {
        result["error"] = "bad type: "+type;
    }
    return result;
}

function newHandle(handle){
    var me = getMe();
    var directory = getDirectory();
    var handles = doGetLink(me,"handle");
    var n = handles.length - 1;
    if (n >= 0) {
        var oldKey = handles[n];
        var key = update("handle",handle,oldKey);

        debug(handle+" is "+key);
        commit("handle_links",
               {Links:[
                   {Base:me,Link:oldKey,Tag:"handle",LinkAction:HC.LinkAction.Del},
                   {Base:me,Link:key,Tag:"handle"}
               ]});
        commit("directory_links",
               {Links:[
                   {Base:directory,Link:oldKey,Tag:"handle",LinkAction:HC.LinkAction.Del},
                   {Base:directory,Link:key,Tag:"handle"}
               ]});
        return key;
    }
    return addHandle(handle);
}

// returns the handle of an agent by looking it up on the user's DHT entry, the last handle will be the current one?
function getHandle(userHash) {
    var handles = doGetLinkLoad(userHash,"handle");
    var n = handles.length -1;
    var h = handles[n];
    return (n >= 0) ? h.handle : "";
}

// returns the agent associated agent by converting the handle to a hash
// and getting that hash's source from the DHT
function getAgent(handle) {
    var directory = getDirectory();
    var handleHash = makeHash(handle);
    var sources = get(handleHash,{GetMask:HC.GetMask.Sources});

    if (isErr(sources)) {sources = [];}
    if (sources != undefined) {
        var n = sources.length -1;
        return (n >= 0) ? sources[n] : "";
    }
    return "";
}

// ==============================================================================
// HELPERS: unexposed functions
// ==============================================================================


// helper function to resolve which has will be used as "me"
function getMe() {return App.Key.Hash;}

// helper function to resolve which hash will be used as the base for the directory
// currently we just use the DNA hash as our entry for linking the directory to
// TODO commit an anchor entry explicitly for this purpose.
function getDirectory() {return App.DNA.Hash;}


// helper function to actually commit a handle and its links on the directory
// this function gets called at genesis time only because all other times handle gets
// updated using newHandle
function addHandle(handle) {
    // TODO confirm no collision
    var key = commit("handle",handle);        // On my source chain, commits a new handle entry
    var me = getMe();
    var directory = getDirectory();

    debug(handle+" is "+key);

    commit("handle_links", {Links:[{Base:me,Link:key,Tag:"handle"}]});
    commit("directory_links", {Links:[{Base:directory,Link:key,Tag:"handle"}]});

    return key;
}

// helper function to determine if value returned from holochain function is an error
function isErr(result) {
    return ((typeof result === 'object') && result.name == "HolochainError");
}

// helper function to do getLink call, handle the no-link error case, and copy the returned entry values into a nicer array
function doGetLinkLoad(base, tag) {
    // get the tag from the base in the DHT
    var links = getLink(base, tag,{Load:true});
    if (isErr(links)) {
        links = [];
    } else {
        links = links.Links;
    }
    var links_filled = [];
    for (var i=0;i <links.length;i++) {
        var link = {H:links[i].H};
        link[tag] = links[i].E;
        links_filled.push(link);
    }
    debug("Links Filled:"+JSON.stringify(links_filled));
    return links_filled;
}
function doGetTagLinkLoad(base, tag) {
    // get the tag from the base in the DHT
    var links = getLink(base, tag,{Load:true});
    if (isErr(links)) {
      debug("isErr");
        links = [];
    } else {

       links = links.Links;
    }
    var links_filled = [];
    for (var i=0;i <links.length;i++) {
        var link = {H:links[i].H};
        link[tag] = links[i].E;
        links_filled.push(link);
    }
    debug("Links Filled:"+JSON.stringify(links_filled));
    return links_filled;
}
// helper function to call getLinks, handle the no links entry error, and build a simpler links array.
function doGetLink(base,tag) {
    // get the tag from the base in the DHT
    var links = getLink(base, tag,{Load:true});
    if (isErr(links)) {
        links = [];
    }
     else {
        links = links.Links;
    }
    debug("Links:"+JSON.stringify(links));
    var links_filled = [];
    for (var i=0;i <links.length;i++) {
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
    addHandle(App.Agent.String);
    //commit("anchor",{type:"sys",value:"directory"});
    return true;
}

// ===============================================================================
//   VALIDATION functions for *EVERY* change made to DHT entry -
//     Every DHT node uses their own copy of these functions to validate
//     any and all changes requested before accepting. put / mod / del & metas
// ===============================================================================

function validateCommit(entry_type,entry,header,pkg,sources) {
    debug("validate commit: "+entry_type);
    return validate(entry_type,entry,header,sources);
}

function validatePut(entry_type,entry,header,pkg,sources) {
    debug("validate put: "+entry_type);
    return validate(entry_type,entry,header,sources);
}

function validate(entry_type,entry,header,sources) {
    if (entry_type=="post") {
        var l = entry.message.length;
        if (l>0 && l<256) {return true;}
        return false;
    }
    if (entry_type=="handle") {
        return true;
    }
    if (entry_type=="follow") {
        return true;
    }
    return true;
}

// Are there types of tags that you need special permission to add links?
// Examples:
//   - Only Bob should be able to make Bob a "follower" of Alice
//   - Only Bob should be able to list Alice in his people he is "following"
function validateLink(linkEntryType,baseHash,links,pkg,sources){
    debug("validate link: "+linkEntryType);
    if (linkEntryType=="handle_links") {
        var length = links.length;
        // a valid handle is when:

        // there should just be one or two links only
        if (length==2) {
            // if this is a modify it will have two links the first of which
            // will be the del and the second the new link.
            if (links[0].LinkAction != HC.LinkAction.Del) return false;
            if (links[1].LinkAction != HC.LinkAction.Add) return false;
        } else if (length==1) {
            // if this is a new handle, there will just be one Add link
            if (links[0].LinkAction != HC.LinkAction.Add) return false;
        } else {return false;}

        for (var i=0;i<length;i++) {
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
function validateMod(entry_type,entry,header,replaces,pkg,sources) {
    debug("validate mod: "+entry_type+" header:"+JSON.stringify(header)+" replaces:"+JSON.stringify(replaces));
    if (entry_type == "handle") {
        // check that the source is the same as the creator
        // TODO we could also check that the previous link in the type-chain is the replaces hash.
        var orig_sources = get(replaces,{GetMask:HC.GetMask.Sources});
        if (isErr(orig_sources) || orig_sources == undefined || orig_sources.length !=1 || orig_sources[0] != sources[0]) {return false;}

    } else if (entry_type == "post") {
        // there must actually be a message
        if (entry.message == "") return false;
        var orig = get(replaces,{GetMask:HC.GetMask.Sources+HC.GetMask.Entry});

        // check that source is same as creator
        if (orig.Sources.length !=1 || orig.Sources[0] != sources[0]) {return false;}

        var orig_message = JSON.parse(orig.Entry.C).message;
        // message must actually be different
        return orig_message != entry.message;
    }
    return true;
}
function validateDel(entry_type,hash,pkg,sources) {
    debug("validate del: "+entry_type);
    return true;
}

// ===============================================================================
//   PACKAGING functions for *EVERY* validation call for DHT entry
//     What data needs to be sent for each above validation function?
//     Default: send and sign the chain entry that matches requested HASH
// ===============================================================================

function validatePutPkg(entry_type) {return null;}
function validateModPkg(entry_type) { return null;}
function validateDelPkg(entry_type) { return null;}
function validateLinkPkg(entry_type) { return null;}
