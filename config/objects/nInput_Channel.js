/**
 * <odoc>
 * <key>nattrmon.nInput_Channel(aMap)</key>
 * Receives a value through exposing a channel (e.g. cvals sent from another nAttrMon) and creates/updates as an attribute. 
 * \
 *    - url (String) The remote channel url\
 *    - idKey (String) The object path to the id key to use (default "name")\
 *    - valueKey (String) The object path to the value to include in attributes\
 *    - attrTemplate (String) Attribute template given id, value and originalValue\
 * \
 * </odoc>
 */
var nInput_Channel = function(aMap) {
    this.ch = aMap.ch;
    this.idKey = (isUnDef(aMap.idKey)) ? "name" : aMap.idKey;
    this.valueKey = (isUnDef(aMap.valueKey)) ? void 0 : aMap.valueKey;
    this.attrTemplate = (isUnDef(aMap.attrTemplate)) ? "{{id}}" : aMap.attrTemplate;

    $ch(this.ch).create(1, "dummy");
    if (isDef(aMap.port)) {
        if (isUnDef(aMap.host)) {
            $ch(this.ch).expose(aMap.port, aMap.path);
        } else {
            $ch(this.ch).expose(ow.server.httpd.start(aMap.port, aMap.host));
        }
    } else {
        var hS = "httpd";
        if (isDef(aMap.httpSession)) hS = aMap.httpSession;
        if (nattrmon.hasSessionData(hS)) {
            $ch(this.ch).expose(nattrmon.getSessionData(hS), aMap.path);
        } else {
            throw "Need a port or a default HTTP (e.g. nOutput_HTTP_JSON, nOutput_HTTP).";
        }
    }
    nInput.call(this, this.input);
};
inherit(nInput_Channel, nInput);

nInput_Channel.prototype.input = function(scope, args) {
    if(isUnDef(args.ch)) throw "nInput_Channels only works when used with chSubscribe";
    if(args.ch != this.ch) throw "nInput_Channels ch should be the same as chSubscribe";

    var res = {};

    var argsk, argsv;
    if (args.op == "set" || args.op == "unset") {
        argsk = [ args.k ];
        argsv = [ args.v ];
    }
    
    if (args.op == "setall") {
        argsk = args.k;
        argsv = args.v;
    }

    for(var i in argsv) {
        var k = ow.obj.getPath(argsv[i], this.idKey);
        if (isUnDef(k)) k = ow.obj.getPath(argsk[i], this.idKey); // Last try
        var aV = {};

        if (isDef(this.valueKey)) {
            aV = ow.obj.getPath(argsv[i], this.valueKey);
        } else {
            aV = argsv[i];
        }

        var tpl = templify(this.attrTemplate, { id: k, value: aV, originalValue: argsv[i] });

        res[tpl] = aV;
    }

    return res;
};