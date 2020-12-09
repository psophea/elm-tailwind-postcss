// code gen stuff

function elmBodyHtml(elmModuleName, classes) {
    return elmHeaderHtml(elmModuleName, classes) +
        elmBody({ type: "Html.Attribute msg", fn: "A.class " }, classes);
}

function elmBodyString(elmModuleName, classes) {
    return elmHeaderString(elmModuleName, classes) +
        elmBody({ type: "String", fn: "" }, classes);
}

function elmBodySvg(elmModuleName, classes) {
    return elmHeaderSvg(elmModuleName, classes) +
        elmBody({ type: "Svg.Attribute msg", fn: "A.class " }, classes);
}

function elmHeaderHtml(elmModuleName, elmFns) {

    return `module ${elmModuleName} exposing (..)

import Html
import Html.Attributes as A
`;
}

function elmHeaderSvg(elmModuleName, elmFns) {

    return `module ${elmModuleName} exposing (..)

import Svg
import Svg.Attributes as A
`;
}

function elmHeaderString(elmModuleName, elmFns) {

    return `module ${elmModuleName} exposing (..)`;
}

function elmBody(config, classes) {
    let body = "";
    for (let [cls, elm] of classes) {
        body = body + elmFunction(config, { cls, elm });
    }
    return body;
}

function elmFunction(config, { cls, elm }) {

    return `


${elm} : ${config.type}
${elm} =
    ${config.fn}"${cls}"`;
}

// parse, clean up stuff
function fixClass(cls) {
    // remove dot backslash
    cls = cls.replace(/\.\\/, "");
    // remove the dot
    cls = cls.replace(/^(\.)/, "");
    // make other dots safe
    cls = cls.replace(/\\\./g, ".");
    // remove > anything
    cls = cls.replace(/\s?>\s?.*/, "");
    // remove pseudo-elements (::)
    cls = cls.replace(/::.*$/, "");
    // remove not pseudo-classes (:not())
    cls = cls.replace(/:not\([^\)]*\)/g, "");
    // remove pseudo-classes (:)
    cls = cls.replace(
        /(:(active|after|before|checked|disabled|focus|focus-within|hover|visited|nth-child\((even|odd)\)|(first|last)-child))+$/,
        ""
    );
    // make / safe for elm
    cls = cls.replace(/\\\//g, "/");
    // make \/ safe for elm
    cls = cls.replace(/\\([/])/g, "$1");
    // make \: safe for elm
    cls = cls.replace(/\\([:])/g, "$1");
    return cls;
}

function toElmName(cls, opts) {
    opts = opts || defaultOpts;
    var elm = cls;

    // start with number. ie: 32xl:container
    elm = elm.replace(/^([0-9])/, "i_$1");

    // handle negative with prefix
    if (opts.prefix) {
        let re_neg_with_prefix = new RegExp(`(${opts.prefix})-([a-z])`);
        elm = elm.replace(re_neg_with_prefix, "$1neg_$2");
    }
    // handle negative at start of string
    elm = elm.replace(/^-([a-z])/, "_neg_$1");
    // handle negative with variant
    elm = elm.replace(/:-([a-z])/, "__neg_$1");
    // replace dashes now we have sorted the negative stuff
    elm = elm.replace(/-/g, "_");
    // replace :
    elm = elm.replace(/:/g, "__");
    // handle fractions
    elm = elm.replace(/\//g, "over");
    // clean up
    elm = elm.replace(/\\__/g, "_");
    elm = elm.replace(/^_/g, "");
    // handle :nth-child(even), etc
    elm = elm.replace(/_nth_child\(.+\)/, "");
    elm = elm.replace(/_(last|first)_child/, "");
    // replace any other dots
    if (opts.nameStyle === "camel") {
        elm = elm.replace(/\./g, "Dot");
    } else {
        elm = elm.replace(/\./g, "_dot_");
    }
    // convert to camel case
    if (opts.nameStyle === "camel") {
        elm = elm.replace(/(_+\w)/g, g => g.replace(/_/g, "").toUpperCase());
    }
    return elm;
}

// options stuff

const defaultOpts = {
    elmFile: "src/TW.elm",
    elmModuleName: "TW",
    prefix: "",
    nameStyle: "snake",
    formats: {
        /*
          string: {
            elmFile: "src/TW/String.elm",
            elmModuleName: "TW.String"
          },
          svg: {
            elmFile: "src/TW/Svg.elm",
            elmModuleName: "TW.Svg",
          }
        */
    }
};

function cleanOpts(opts) {
    opts = { ...defaultOpts, ...opts };
    opts.formats = { ...opts.formats };

    return opts;
}

function formats(opts) {
    return [
        cleanFormat(opts, elmBodyHtml),
        cleanFormat({ ...opts.formats.string }, elmBodyString),
        cleanFormat({ ...opts.formats.svg }, elmBodySvg)
    ].filter(f => f);
}

function cleanFormat({ elmFile, elmModuleName }, elmBodyFn) {
    if (!elmFile) return false;
    if (!elmModuleName) return false;

    return { elmFile, elmModuleName, elmBodyFn };
}

exports.cleanOpts = cleanOpts;
exports.defaultOpts = defaultOpts;
exports.elmBodyHtml = elmBodyHtml;
exports.elmBodyString = elmBodyString;
exports.elmBodySvg = elmBodySvg;
exports.elmFunction = elmFunction;
exports.fixClass = fixClass;
exports.formats = formats;
exports.toElmName = toElmName;