function genesis() {
  return true;
}

//Bridge genesis function initializes the volunteer node value. Currently not using argument , hence initializing to default volunteerNode = true
function bridgeGenesis() {
  var VolunteerForIndex = "true";

  if (VolunteerForIndex == "true") {

    var VolunteerNode = commit("VolunteerNode", App.Agent.Hash);

    commit("volunteer_link", { Links: [{ Base: App.Key.Hash, Link: VolunteerNode, Tag: "VolunteerNode" }] });

    var addSelfAsAnchor = { Anchor_Type: "IndexNodes", Anchor_Text: App.Key.Hash };
    var anchorMain = { Anchor_Type: "Anchor_Type", Anchor_Text: "" };
    var amhash = makeHash(anchorMain);
    var checkexist = get(amhash, { GetMask: HC.GetMask.Sources });

    if (checkexist == JSON.stringify(anchorMain)) {
      var IndexNodesAnchor = { Anchor_Type: "IndexNodes", Anchor_Text: "" };
      var inhash = makeHash(JSON.stringify(IndexNodesAnchor));
      checkexist = get(inhash, { GetMask: HC.GetMask.Sources });

      if (checkexist == JSON.stringify(IndexNodesAnchor))
        var lnk = call("anchor", "create", addSelfAsAnchor);
      else {
        call("anchor", "createType", "IndexNodes");
        call("anchor", "create", addSelfAsAnchor);
      }

    }
    else {
      call("anchor", "createType", "IndexNodes");
      call("anchor", "create", addSelfAsAnchor);
    }

    return true;
  }
  else {
    var VolunteerNode = commit("VolunteerNode", VolunteerForIndex);
    commit("volunteer_link", { Links: [{ Base: App.Key.Hash, Link: VolunteerNode, Tag: "VolunteerNode" }] });
    return true;
  }
}

function selectIndexNode() {

  var VolunteerNodeH = getLinks(App.Key.Hash, "VolunteerNode", { Load: true });

  if (VolunteerNodeH.Links[0].E == "true")
    var key = App.Key.Hash;
  else {
    var indexNodes = call("anchor", "anchor_list", "IndexNodes");
    var IndexNodesjs = JSON.parse(indexNodes);
    var numberOfIndexNodes = IndexNodesjs.length;
    var selectedNumber = Math.floor(Math.random() * numberOfIndexNodes);
    var key = IndexNodesjs[selectedNumber].Anchor_Text;
  }

  return key;
}

function indexObject(object) {
  var indexNode = selectIndexNode();
  var objHash = object.objHash;
  var messageObj = { type: "createIndex", content: object.content, hashOfObject: objHash, language: "English" };

  if (indexNode == App.Key.Hash)
    var createIndex = bridge(getBridgedAppDNA(), "indexcontent", "IndexContent", messageObj);
  else
    var createIndex = send(indexNode, messageObj);

  return createIndex;
}

function indexObjectForTest(object) //This function was created as make hash cannot be done in test
{
  var indexNode = selectIndexNode();
  var objHash = makeHash(object);
  var messageObj = { type: "createIndex", content: object.content, hashOfObject: objHash, language: "English" };

  if (indexNode == App.Key.Hash)
    var createIndex = bridge(getBridgedAppDNA(), "indexcontent", "IndexContent", messageObj);
  else
    var createIndex = send(indexNode, messageObj);

  return createIndex;
}

function searchContent(StringOfsearchKeywords) {
  var indexNode = selectIndexNode();
  var messageObj = { type: "searchKeywords", searchString: StringOfsearchKeywords };

  if (indexNode == App.Key.Hash)
    var searchResults = bridge(getBridgedAppDNA(), "indexcontent", "searchKeywords", StringOfsearchKeywords);
  else
    var searchResults = send(indexNode, messageObj);

  return searchResults;
}

function receive(input, msg) {
  if (msg.type == "createIndex")
    var retVal = bridge(getBridgedAppDNA(), "indexcontent", "IndexContent", msg);
  else if (msg.type == "searchKeywords")
    var retVal = bridge(getBridgedAppDNA(), "indexcontent", "searchKeywords", msg.searchString);

  return retVal;
}

function getBridgedAppDNA() {
  return getBridges()[0].ToApp;
}

function isErr(result) {
  return ((typeof result === 'object') && result.name == "HolochainError");
}

function validatePut(entry_type, entry, header, pkg, sources) {
  return validate(entry_type, entry, header, sources);
}

function validateCommit(entry_type, entry, header, pkg, sources) {
  return validate(entry_type, entry, header, sources);
}

function validate(entry_type, entry, header, sources) {
  if (entry_type == "anchor_links" || entry_type == "anchor") {
    // TODO: validate!
    return true;
  }
  else
    return true;
}

function validateLink(linkingEntryType, baseHash, linkHash, tag, pkg, sources) {
  if (linkingEntryType == "anchor_links")
    return true;
}

function validateMod(entry_type, hash, newHash, pkg, sources) { return false; }
function validateDel(entry_type, hash, pkg, sources) { return false; }
function validatePutPkg(entry_type) { return null; }
function validateModPkg(entry_type) { return null; }
function validateDelPkg(entry_type) { return null; }
function validateLinkPkg(entry_type) { return null; }
