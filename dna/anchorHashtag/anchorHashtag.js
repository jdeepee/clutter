function genesis(){
  return true;
}

function detectHashtags(postString)
{
  debug("STARING");

  debug("regexp");
  var regexp = /\B\#\w\w+\b/g;
  hashtag = String(postString).match(regexp);
  debug("RETURNING hash tag");
  a=hashtag;
  debug("CHECKING THIS");
  debug(typeof hashtag);
  if (hashtag != null)
  {
    debug("hashtag");
    return hashtag;
  }
  else
  {
    debug("NULL");
    return null;
  }

  return hashtag;
}

function createHashTag(hashtag,post)
{
	var hashtag_hash= commit("hashtag",hashtag);
	var me = getMe();
	var directory = App.DNA.Hash;

	commit("hashtag_links",{Links:[{Base:me,Link:hashtag_hash,Tag:"hashtag"}]});
  commit("hashtagPost_links",{Links:[{Base:hashtag_hash,Link:post,Tag:"post"}]});
	commit("directory_links",{Links:[{Base:directory,Link:hashtag_hash,Tag:"hashtag"}]});

	debug(hashtag+" added with hash : "+hashtag_hash+"======================================");
  return hashtag_hash;
}

function LinkorCreateHT(hashtag,post)
{

	var hash = getHashtag(hashtag);
  var hashtagHash = makeHash(hashtag);
	if(hash == "")
	{
		debug("creating..");
		var createdHT=createHashTag(hashtag,post);
    return createdHT;
	}
	else
	{
		debug("Hashtag Already Exisits !!!!!!!!!!!!!!!!!!!!!!!! Creating link for :"+hashtag);
		commit("hashtagPost_links",{Links:[{Base:hashtagHash,Link:post,Tag:"post"}]});
    gethashtagPosts(hashtagHash);
    return hashtagHash;
  }
}

function gethashtagPosts(hashtagHash)
{
  var me = getMe();

  var HTLink = doGetLinkLoad(me,"hashtag");
  debug("Printing HTLink length : "+HTLink.length);

  for(i=0;i<HTLink.length;i++)
  {
    var ht = HTLink[i];
    debug("Comparing Value with ht hash : "+ht.H+" -> "+hashtagHash);
    if(ht.H == hashtagHash)
    {
      debug("Inside IF....")
      var relatedPosts = doGetLinkLoad(ht.H,"post");
      debug("Related posts of hashtag : "+ht.hashtag+" are : ");
      for(var j=0;j<relatedPosts.length;j++)
      {
        var p = relatedPosts[j];
        debug(p.post);
        //var checkP = get(p.H,{GetMask:HC.GetMask.Entry});
        //debug(property(checkP));
      }
      break;
    }

  }

}
function getMe() {return App.Key.Hash;}

function getDirectory() {return App.DNA.Hash;}

function getHashtag(handle) {
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

function isErr(result) {
    return ((typeof result === 'object') && result.name == "HolochainError");
}

function doGetLinkLoad(base, tag) {
    // get the tag from the base in the DHT
    var links = getLinks(base, tag,{Load:true});
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

// helper function to call getLinks, handle the no links entry error, and build a simpler links array.
function dogetLinks(base,tag) {
    // get the tag from the base in the DHT
    var links = getLinks(base, tag,{Load:true});
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
