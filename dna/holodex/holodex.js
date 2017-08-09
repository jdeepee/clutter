function bridgeGenesis()
{
  debug("Wroking bridgeGenesis");
  var VolunteerForIndex = "true";
  debug("Holodex genesis executed ");
  var VolunteerNode = commit("VolunteerNode",VolunteerForIndex);
  commit("volunteer_link",{Links:[{Base:App.Key.Hash,Link:VolunteerNode,Tag:"VolunteerNode"}]});
  debug("VolunteerNode :"+ VolunteerNode);
  var addSelfAsAnchor = {Anchor_Type:"IndexNodes",Anchor_Text:App.Key.Hash};

  var anchorMain = {Anchor_Type:"Anchor_Type",Anchor_Text:""};

  var amhash = makeHash(anchorMain);

  var checkexist = get(amhash,{GetMask:HC.GetMask.Suorces});
  debug("Checkexist : "+checkexist.C);
  if(checkexist.C = JSON.stringify(anchorMain)){

    debug("Creating anchor type IndexNodes");
    //var IndexNodeAnchorType = {Anchor_Type:"IndexNodes",Anchor_Text:""};
    call("anchor","anchor_type_create","IndexNodes");

    debug("Adding self to index nodes ... "+App.Key.Hash);
     var lnk = call("anchor","anchor_create",addSelfAsAnchor);

     var ret = JSON.parse(lnk);
     debug(ret[0]);
     return VolunteerNode;
}
}

/*function bridgeGenesis(VolunteerForIndex)                     //Volunteering Ratio to be added
{


  if(VolunteerForIndex == "true")
  {


    var VolunteerNode = commit("VolunteerNode",VolunteerForIndex);
    commit("volunteer_link",{Links:[{Base:App.Key.Hash,Link:VolunteerNode,Tag:"VolunteerNode"}]});
    debug("VolunteerNode :"+ VolunteerNode);
    var addSelfAsAnchor = {Anchor_Type:"IndexNodes",Anchor_Text:App.Key.Hash};

    var anchorMain = {Anchor_Type:"Anchor_Type",Anchor_Text:""};

    var amhash = makeHash(anchorMain);

    var checkexist = get(amhash,{GetMask:HC.GetMask.Suorces});
    debug("Checkexist : "+checkexist.C);
    if(checkexist.C = JSON.stringify(anchorMain)){

      debug("Creating anchor type IndexNodes");
      //var IndexNodeAnchorType = {Anchor_Type:"IndexNodes",Anchor_Text:""};
      call("anchor","anchor_type_create","IndexNodes");

      debug("Adding self to index nodes ... "+App.Key.Hash);
       var lnk = call("anchor","anchor_create",addSelfAsAnchor);

    }
    else {
      debug("Adding self to index nodes ... "+App.Key.Hash);
        var lnk = call("anchor","anchor_create",addSelfAsAnchor);
    }
    var ret = JSON.parse(lnk);
    debug(ret[0]);
    return VolunteerNode;
  }
  else
  {
    var VolunteerNode = commit("VolunteerNode",VolunteerForIndex);
    commit("volunteer_link",{Links:[{Base:App.Key.Hash,Link:VolunteerNode,Tag:"VolunteerNode"}]});
    return VolunteerNode;
  }
}*/

function selectIndexNode()
{

  var VolunteerNodeH = getLink(App.Key.Hash,"VolunteerNode",{Load:true});
  debug(VolunteerNodeH);
  debug("Volunteer node value :"+VolunteerNodeH.Links[0].E)

  if(VolunteerNodeH.Links[0].E == "true")
  {
    var key = App.Key.Hash;
  }
  else
  {
    var indexNodes = call("anchor","anchor_list","IndexNodes");
    var IndexNodesjs = JSON.parse(indexNodes);

    var numberOfIndexNodes = IndexNodesjs.length;
    debug("Number of index nodes : "+numberOfIndexNodes);

    var selectedNumber = Math.floor(Math.random()*numberOfIndexNodes);

    var key = IndexNodesjs[selectedNumber].Anchor_Text;
  }
  return key;
}

function indexObject(object)
{
  var indexNode = selectIndexNode();
  debug("Selected index node : "+indexNode);
  var objHash = makeHash(object);
  debug("Hash of object : "+objHash);
  var App_DNA_Hash = "QmeDNBTdDu2TbyTeZiPjJrBryxDZKvCpL2sFa8TEBX598b";

  var messageObj = {type:"createIndex",content:object.content,hashOfObject:objHash,language:"English"};
  if(indexNode == App.Key.Hash)
  {
    var createIndex = bridge(App_DNA_Hash,"indexcontent","IndexContent",JSON.stringify(messageObj));
  }
  else {
      var createIndex = send(indexNode,messageObj);
  }
  return createIndex;
}


function searchContent(StringOfsearchKeywords)
{
  var indexNode = selectIndexNode();
  debug("Selected index node : "+indexNode);

  var App_DNA_Hash = "QmeDNBTdDu2TbyTeZiPjJrBryxDZKvCpL2sFa8TEBX598b"

  var messageObj = {type:"searchKeywords",searchString:StringOfsearchKeywords};

  if(indexNode == App.Key.Hash)
  {
    var searchResults = bridge(App_DNA_Hash,"searchKeywords","searchKeywords",StringOfsearchKeywords);
  }
  else {
      var searchResults = send(indexNode,messageObj);
  }

  return searchResults;
}

function receive(input, msg)
{
  if(msg.type == "createIndex")
  {
    //var retVal = IndexContent(msg.content,msg.hashOfObject,msg.language);
    var retVal = bridge("QmeDNBTdDu2TbyTeZiPjJrBryxDZKvCpL2sFa8TEBX598b","indexcontent","IndexContent",JSON.stringify(msg));
  }
  else if(msg.type == "searchKeywords")
  {
    debug("Searching for the string :::::: "+msg.searchString);
    //var retVal = searchKeywords(msg.searchString);
    var retVal = bridge("QmeDNBTdDu2TbyTeZiPjJrBryxDZKvCpL2sFa8TEBX598b","indexcontent","searchKeywords",msg.searchString);

  }
  return retVal;
}

function isErr(result) {
    return ((typeof result === 'object') && result.name == "HolochainError");
}
function validatePut(entry_type,entry,header,pkg,sources) {
    return validate(entry_type,entry,header,sources);
}
function validateCommit(entry_type,entry,header,pkg,sources) {
    return validate(entry_type,entry,header,sources);
}
// Local validate an entry before committing ???
function validate(entry_type,entry,header,sources) {
//debug("entry_type::"+entry_type+"entry"+entry+"header"+header+"sources"+sources);
    if (entry_type == "anchor_links"||entry_type == "anchor") {
      return true;
    }
    return true
}

function validateLink(linkingEntryType,baseHash,linkHash,tag,pkg,sources){
    // this can only be "room_message_link" type which is linking from room to message
//debug("LinkingEntry_type:"+linkingEntryType+" baseHash:"+baseHash+" linkHash:"+linkHash+" tag:"+tag+" pkg:"+pkg+" sources:"+sources);
if(linkingEntryType=="anchor_links")
return true;

return true;
}
function validateMod(entry_type,hash,newHash,pkg,sources) {return false;}
function validateDel(entry_type,hash,pkg,sources) {return false;}
function validatePutPkg(entry_type) {return null}
function validateModPkg(entry_type) { return null}
function validateDelPkg(entry_type) { return null}
function validateLinkPkg(entry_type) { return null}
