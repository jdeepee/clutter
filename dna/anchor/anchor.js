/*
    Anchors provide a set of functions that can be thought of as something like global application 
    variables. But unlike global application variables in non-distributed environments, with anchors, 
    the developer must consider and write appropriate validation rules for each anchor since they 
    are actually stored as entries on the chain.

    For details, see: https://github.com/Holochain/mixins/wiki/Anchors
*/

var _anchor_generic_ = "_anchor_generic_";

function genesis() {
    return true;
}

function set(parms) {

    var anchor = parms === undefined ? undefined : parms.anchor;
    var value = parms === undefined ? undefined : parms.value;
    var entryType = parms === undefined ? undefined : parms.entryType == undefined ? _anchor_generic_ : parms.entryType;
    var preserveOldValueEntry = parms === undefined ? undefined : parms.preserveOldValueEntry == undefined ? false : parms.preserveOldValueEntry;
    
    if (anchor == undefined)
        return new errorObject("anchor is a required parameter!");

    if (value == undefined)
        return new errorObject("value is a required parameter!");

    if (preserveOldValueEntry != true && preserveOldValueEntry != false)
        return new errorObject("preserveOldValueEntry must be true or false!");

    // if (parms.entryType === undefined)
    //     if (typeof value !== 'string' && !(value instanceof String))
    //         return new errorObject("If entryType is not specified, value must be a string");

    var anchor_hash = makeHash("anchor_base", anchor);

    // Lookup the base entry
    var links = getLinks(anchor_hash, _anchor_generic_, { Load: false });

    if (isErr(links)) // getLink got an error
    {
        if (links.message == "hash not found") // hash not found, create the base entry, and continue with empty links list
        {
            var anchor_hash = commit("anchor_base", anchor);

            if (isErr(anchor_hash)) // failed
                return anchor_hash;

            links = { Links: [] };
        }
        else if (links.message == "No links for " + _anchor_generic_)
            return new errorObject("\"" + anchor + "\" is not a simple anchor link base!");
        else
            return links; // other error, return it

    }
    else if (links.length != 1) // an existing Key/Value base entry will only always have just 1 link entry, no more, no less
        return new errorObject("\"" + anchor + "\" is not a simple anchor link base!");


    // if this is a generic entryType, always stringify it
    if (parms.entryType === undefined)
        value = JSON.stringify(value);

    // put the value on the chain
    var value_hash = commit(entryType, value);

    if (isErr(value_hash)) // failed
        return value_hash;

    // if this is not a new key, delete the old value and link
    if (links.length == 1) {
        commit("anchor_link", { Links: [{ Base: anchor_hash, Link: links[0].Hash, Tag: _anchor_generic_, LinkAction: HC.LinkAction.Del }] });

        if (!preserveOldValueEntry)
            remove(links[0].Hash);
    }

    // add the new value's link
    var link_hash = commit("anchor_link", { Links: [{ Base: anchor_hash, Link: value_hash, Tag: _anchor_generic_ }] });

    return anchor_hash;

}

// passthrough to core get() function... only needed for testing
var coreGet = get;

var get = function get(parms) {

    var anchor = parms === undefined ? undefined : parms.anchor;
    var anchor_hash = parms === undefined ? undefined : parms.anchorHash;

    if (anchor_hash == undefined) {
        if (anchor == undefined)
            return new errorObject("Must pass either anchor or anchorHash!");

        anchor_hash = makeHash("anchor_base", anchor);
    }
    else if (anchor != undefined)
        return new errorObject("Can't pass both anchor and anchorHash!");

    // The value is stored by link reference with the anchor name as the base. Get it!
    var links = getLinks(anchor_hash, _anchor_generic_, { Load: true });

    if (isErr(links)) // failed
    {
        if (links.message == "hash not found")
            return null;
        else if (links.message == "No links for " + _anchor_generic_)
            return new errorObject("\"" + anchor + "\" is not a simple anchor link base!");

        return links;
    }

    if (links.length == 0) throw "\"" + anchor + "\" is not a simple anchor link base because it has 0 links!";
    if (links.length > 1) throw "\"" + anchor + "\" is not a simple anchor link base because it has more than 1 link!";

    var rtn = links[0].Entry;

    // if the entry was stored with no entryType, we stringify'ed it at store time... parse it back!
    if (links[0].EntryType == _anchor_generic_)
        rtn = JSON.parse(rtn);

    return rtn;

};

function addToList(parms) {

    var anchor = parms === undefined ? undefined : parms.anchor;
    var value = parms === undefined ? undefined : parms.value;
    var entryType = parms === undefined ? undefined : parms.entryType == undefined ? _anchor_generic_ : parms.entryType;
    var index = parms === undefined ? undefined : parms.entryType == undefined ? _anchor_generic_ : parms.index;
    var preserveOldValueEntry = parms === undefined ? undefined : parms.preserveOldValueEntry == undefined ? false : parms.entryType;
    
    if (anchor == undefined)
        return new errorObject("anchor is a required parameter!");

    if (value == undefined)
        return new errorObject("value is a required parameter!");

    var anchor_hash = makeHash("anchor_base", anchor);

    // Lookup the base entry
    var links = getLinks(anchor_hash, index, { Load: false });

    if (isErr(links)) // getLink got an error
    {
        if (links.message == "hash not found") // hash not found, create the base entry, and continue with empty links list
        {
            var anchor_hash = commit("anchor_base", anchor);

            if (isErr(anchor_hash)) // failed
                return anchor_hash;

            links = { Links: [] };
        }
        else
            return links; // other error, return it

    }

    // if this is a generic entryType, always stringify it
    if (parms.entryType === undefined)
        value = JSON.stringify(value);

    // put the value on the chain
    var value_hash = commit(entryType, value);

    if (isErr(value_hash)) // failed
        return value_hash;

    // if index was specified, delete the old value by that index (if there was one)
    if (index != _anchor_generic_ && links.length == 1) {
        commit("anchor_link", { Links: [{ Base: anchor_hash, Link: links[0].Hash, Tag: index, LinkAction: HC.LinkAction.Del }] });

        if (!preserveOldValueEntry)
            remove(links[0].Hash);
    }

    // add the new value's link
    var link_hash = commit("anchor_link", { Links: [{ Base: anchor_hash, Link: value_hash, Tag: index }] });

    return anchor_hash;

}

function getFromList(parms) {

    var anchor = parms === undefined ? undefined : parms.anchor;
    var anchor_hash = parms === undefined ? undefined : parms.anchorHash;
    var index = parms === undefined ? undefined : parms.index;

    if (anchor_hash == undefined) {
        if (anchor == undefined)
            return new errorObject("Must pass either anchor or anchorHash!");

        anchor_hash = makeHash("anchor_base", anchor);
    }
    else if (anchor != undefined)
        return new errorObject("Can't pass both anchor and anchorHash!");

    // The value is stored by link reference with the anchor name as the base. Get it!
    var links = getLinks(anchor_hash, index === undefined ? "" : index, { Load: true });

    if (isErr(links)) // failed
    {
        if (links.message == "hash not found")
            return null;

        return links;
    }

    var rtn;

    if (index === undefined) { // an index was not specified
        rtn = [];

        hasIndexes = false;

        // check if any entries have indexes (tags other than _anchor_generic_)
        for (var x = 0; x < links.length; x++)
            if (links[x].tag != _anchor_generic_)
                hasIndexes = true;

        for (var x = 0; x < links.length; x++) {
            var value = links[x].Entry;
    
            // if the entry was stored with no entryType, we stringify'ed it at store time... parse it back!
            if (links[x].EntryType == _anchor_generic_)
                value = JSON.parse(value);
            
            if (hasIndexes)
                rtn.push({ index: links[x].tag, value: value });
            else
                rtn.push(value);
        }
    }
    else { // an index was specified
        var value = links[0].Entry;

        // if the entry was stored with no entryType, we stringify'ed it at store time... parse it back!
        if (links[0].EntryType == _anchor_generic_)
            value = JSON.parse(value);

            rtn = value;
    }

    return rtn;

}

function removeFromList(parms) {
    
    var anchor = parms === undefined ? undefined : parms.anchor;
    var anchor_hash = parms === undefined ? undefined : parms.anchorHash;
    var value = parms === undefined ? undefined : parms.value;
    var entryType = parms === undefined ? undefined : parms.entryType == undefined ? _anchor_generic_ : parms.entryType;
    var index = parms === undefined ? undefined : parms.entryType == undefined ? _anchor_generic_ : parms.index;
    var preserveOldValueEntry = parms === undefined ? undefined : parms.preserveOldValueEntry == undefined ? false : parms.entryType;
    
    if (anchor_hash == undefined) {
        if (anchor == undefined)
            return new errorObject("Must pass either anchor or anchorHash!");

        anchor_hash = makeHash("anchor_base", anchor);
    }
    else if (anchor != undefined)
        return new errorObject("Can't pass both anchor and anchorHash!");

    if (parms.index === undefined)
    {
        if (parms.value === undefined || parms.value == null || parms.entryType === undefined || parms.entryType == null)
            return new errorObject("Must pass either index or (value and entryType)!");
    }
    else
    {
        if (parms.value !== undefined)
            return new errorObject("Cannot pass both index and value!");
    }

    // The variable value is stored by link reference with the anchor name as the base. Get it!
    var links = getLinks(anchor_hash, index === undefined ? "" : index, { Load: true });
    
    if (isErr(links)) // failed
    {
        if (links.message == "hash not found")
            return new errorObject("Anchor does not exist!");
        else
            return links;
    }

    if (index !== undefined)
    {
        commit("anchor_link", { Links: [{ Base: anchor_hash, Link: links[0].Hash, Tag: index, LinkAction: HC.LinkAction.Del }] });
        
        if (!preserveOldValueEntry)
            remove(links[0].Hash);
    }
    else
    {

    }
            
}

function errorObject(errorText) {
    this.name = "AnchorsError";
    this.message = errorText;
}

// helper function to determine if value returned from holochain function is an error
function isErr(result) {
    return ((typeof result === 'object') && result.name == "HolochainError");
}

/*************
VALIDATION METHODS
**************/
function validatePut(entry_type, entry, header, pkg, sources) {
    return validate(entry_type, entry, header, sources);
}
function validateCommit(entry_type, entry, header, pkg, sources) {
    return validate(entry_type, entry, header, sources);
}
function validate(entry_type, entry, header, sources) {
    if (entry_type == "anchor_links" || entry_type == "anchor") {
        return true;
    }

    return true
}

function validateLink(linkingEntryType, baseHash, linkHash, tag, pkg, sources) {
    if (linkingEntryType == "anchor_links")
        return true;
    return true;
}

function validateMod(entry_type, hash, newHash, pkg, sources) { return false; }
function validateDel(entry_type, hash, pkg, sources) { return false; }
function validatePutPkg(entry_type) { return null }
function validateModPkg(entry_type) { return null }
function validateDelPkg(entry_type) { return null }
function validateLinkPkg(entry_type) { return null }
