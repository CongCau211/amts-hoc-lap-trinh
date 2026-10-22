/*! @license DOMPurify 3.1.7 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.1.7/LICENSE */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).DOMPurify=t()}(this,(function(){"use strict";const{entries:e,setPrototypeOf:t,isFrozen:n,getPrototypeOf:o,getOwnPropertyDescriptor:r}=Object;let{freeze:i,seal:a,create:l}=Object,{apply:c,construct:s}="undefined"!=typeof Reflect&&Reflect;i||(i=function(e){return e}),a||(a=function(e){return e}),c||(c=function(e,t,n){return e.apply(t,n)}),s||(s=function(e,t){return new e(...t)});const u=b(Array.prototype.forEach),m=b(Array.prototype.pop),p=b(Array.prototype.push),f=b(String.prototype.toLowerCase),d=b(String.prototype.toString),h=b(String.prototype.match),g=b(String.prototype.replace),T=b(String.prototype.indexOf),y=b(String.prototype.trim),E=b(Object.prototype.hasOwnProperty),_=b(RegExp.prototype.test),A=(N=TypeError,function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return s(N,t)});var N;function b(e){return function(t){for(var n=arguments.length,o=new Array(n>1?n-1:0),r=1;r<n;r++)o[r-1]=arguments[r];return c(e,t,o)}}function S(e,o){let r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:f;t&&t(e,null);let i=o.length;for(;i--;){let t=o[i];if("string"==typeof t){const e=r(t);e!==t&&(n(o)||(o[i]=e),t=e)}e[t]=!0}return e}function R(e){for(let t=0;t<e.length;t++){E(e,t)||(e[t]=null)}return e}function w(t){const n=l(null);for(const[o,r]of e(t)){E(t,o)&&(Array.isArray(r)?n[o]=R(r):r&&"object"==typeof r&&r.constructor===Object?n[o]=w(r):n[o]=r)}return n}function C(e,t){for(;null!==e;){const n=r(e,t);if(n){if(n.get)return b(n.get);if("function"==typeof n.value)return b(n.value)}e=o(e)}return function(){return null}}const L=i(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","section","select","shadow","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),v=i(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","filter","font","g","glyph","glyphref","hkern","image","line","lineargradient","marker","mask","metadata","mpath","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),D=i(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),O=i(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),x=i(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),k=i(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),M=i(["#text"]),I=i(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","face","for","headers","height","hidden","high","href","hreflang","id","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns","slot"]),U=i(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),P=i(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),F=i(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),H=a(/\{\{[\w\W]*|[\w\W]*\}\}/gm),z=a(/<%[\w\W]*|[\w\W]*%>/gm),B=a(/\${[\w\W]*}/gm),W=a(/^data-[\-\w.\u00B7-\uFFFF]/),G=a(/^aria-[\-\w]+$/),Y=a(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),j=a(/^(?:\w+script|data):/i),X=a(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),q=a(/^html$/i),$=a(/^[a-z][.\w]*(-[.\w]+)+$/i);var K=Object.freeze({__proto__:null,MUSTACHE_EXPR:H,ERB_EXPR:z,TMPLIT_EXPR:B,DATA_ATTR:W,ARIA_ATTR:G,IS_ALLOWED_URI:Y,IS_SCRIPT_OR_DATA:j,ATTR_WHITESPACE:X,DOCTYPE_NAME:q,CUSTOM_ELEMENT:$});const V=1,Z=3,J=7,Q=8,ee=9,te=function(){return"undefined"==typeof window?null:window};var ne=function t(){let n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:te();const o=e=>t(e);if(o.version="3.1.7",o.removed=[],!n||!n.document||n.document.nodeType!==ee)return o.isSupported=!1,o;let{document:r}=n;const a=r,c=a.currentScript,{DocumentFragment:s,HTMLTemplateElement:N,Node:b,Element:R,NodeFilter:H,NamedNodeMap:z=n.NamedNodeMap||n.MozNamedAttrMap,HTMLFormElement:B,DOMParser:W,trustedTypes:G}=n,j=R.prototype,X=C(j,"cloneNode"),$=C(j,"remove"),ne=C(j,"nextSibling"),oe=C(j,"childNodes"),re=C(j,"parentNode");if("function"==typeof N){const e=r.createElement("template");e.content&&e.content.ownerDocument&&(r=e.content.ownerDocument)}let ie,ae="";const{implementation:le,createNodeIterator:ce,createDocumentFragment:se,getElementsByTagName:ue}=r,{importNode:me}=a;let pe={};o.isSupported="function"==typeof e&&"function"==typeof re&&le&&void 0!==le.createHTMLDocument;const{MUSTACHE_EXPR:fe,ERB_EXPR:de,TMPLIT_EXPR:he,DATA_ATTR:ge,ARIA_ATTR:Te,IS_SCRIPT_OR_DATA:ye,ATTR_WHITESPACE:Ee,CUSTOM_ELEMENT:_e}=K;let{IS_ALLOWED_URI:Ae}=K,Ne=null;const be=S({},[...L,...v,...D,...x,...M]);let Se=null;const Re=S({},[...I,...U,...P,...F]);let we=Object.seal(l(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Ce=null,Le=null,ve=!0,De=!0,Oe=!1,xe=!0,ke=!1,Me=!0,Ie=!1,Ue=!1,Pe=!1,Fe=!1,He=!1,ze=!1,Be=!0,We=!1,Ge=!0,Ye=!1,je={},Xe=null;const qe=S({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]);let $e=null;const Ke=S({},["audio","video","img","source","image","track"]);let Ve=null;const Ze=S({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),Je="http://www.w3.org/1998/Math/MathML",Qe="http://www.w3.org/2000/svg",et="http://www.w3.org/1999/xhtml";let tt=et,nt=!1,ot=null;const rt=S({},[Je,Qe,et],d);let it=null;const at=["application/xhtml+xml","text/html"];let lt=null,ct=null;const st=r.createElement("form"),ut=function(e){return e instanceof RegExp||e instanceof Function},mt=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(!ct||ct!==e){if(e&&"object"==typeof e||(e={}),e=w(e),it=-1===at.indexOf(e.PARSER_MEDIA_TYPE)?"text/html":e.PARSER_MEDIA_TYPE,lt="application/xhtml+xml"===it?d:f,Ne=E(e,"ALLOWED_TAGS")?S({},e.ALLOWED_TAGS,lt):be,Se=E(e,"ALLOWED_ATTR")?S({},e.ALLOWED_ATTR,lt):Re,ot=E(e,"ALLOWED_NAMESPACES")?S({},e.ALLOWED_NAMESPACES,d):rt,Ve=E(e,"ADD_URI_SAFE_ATTR")?S(w(Ze),e.ADD_URI_SAFE_ATTR,lt):Ze,$e=E(e,"ADD_DATA_URI_TAGS")?S(w(Ke),e.ADD_DATA_URI_TAGS,lt):Ke,Xe=E(e,"FORBID_CONTENTS")?S({},e.FORBID_CONTENTS,lt):qe,Ce=E(e,"FORBID_TAGS")?S({},e.FORBID_TAGS,lt):{},Le=E(e,"FORBID_ATTR")?S({},e.FORBID_ATTR,lt):{},je=!!E(e,"USE_PROFILES")&&e.USE_PROFILES,ve=!1!==e.ALLOW_ARIA_ATTR,De=!1!==e.ALLOW_DATA_ATTR,Oe=e.ALLOW_UNKNOWN_PROTOCOLS||!1,xe=!1!==e.ALLOW_SELF_CLOSE_IN_ATTR,ke=e.SAFE_FOR_TEMPLATES||!1,Me=!1!==e.SAFE_FOR_XML,Ie=e.WHOLE_DOCUMENT||!1,Fe=e.RETURN_DOM||!1,He=e.RETURN_DOM_FRAGMENT||!1,ze=e.RETURN_TRUSTED_TYPE||!1,Pe=e.FORCE_BODY||!1,Be=!1!==e.SANITIZE_DOM,We=e.SANITIZE_NAMED_PROPS||!1,Ge=!1!==e.KEEP_CONTENT,Ye=e.IN_PLACE||!1,Ae=e.ALLOWED_URI_REGEXP||Y,tt=e.NAMESPACE||et,we=e.CUSTOM_ELEMENT_HANDLING||{},e.CUSTOM_ELEMENT_HANDLING&&ut(e.CUSTOM_ELEMENT_HANDLING.tagNameCheck)&&(we.tagNameCheck=e.CUSTOM_ELEMENT_HANDLING.tagNameCheck),e.CUSTOM_ELEMENT_HANDLING&&ut(e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)&&(we.attributeNameCheck=e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),e.CUSTOM_ELEMENT_HANDLING&&"boolean"==typeof e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements&&(we.allowCustomizedBuiltInElements=e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),ke&&(De=!1),He&&(Fe=!0),je&&(Ne=S({},M),Se=[],!0===je.html&&(S(Ne,L),S(Se,I)),!0===je.svg&&(S(Ne,v),S(Se,U),S(Se,F)),!0===je.svgFilters&&(S(Ne,D),S(Se,U),S(Se,F)),!0===je.mathMl&&(S(Ne,x),S(Se,P),S(Se,F))),e.ADD_TAGS&&(Ne===be&&(Ne=w(Ne)),S(Ne,e.ADD_TAGS,lt)),e.ADD_ATTR&&(Se===Re&&(Se=w(Se)),S(Se,e.ADD_ATTR,lt)),e.ADD_URI_SAFE_ATTR&&S(Ve,e.ADD_URI_SAFE_ATTR,lt),e.FORBID_CONTENTS&&(Xe===qe&&(Xe=w(Xe)),S(Xe,e.FORBID_CONTENTS,lt)),Ge&&(Ne["#text"]=!0),Ie&&S(Ne,["html","head","body"]),Ne.table&&(S(Ne,["tbody"]),delete Ce.tbody),e.TRUSTED_TYPES_POLICY){if("function"!=typeof e.TRUSTED_TYPES_POLICY.createHTML)throw A('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if("function"!=typeof e.TRUSTED_TYPES_POLICY.createScriptURL)throw A('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');ie=e.TRUSTED_TYPES_POLICY,ae=ie.createHTML("")}else void 0===ie&&(ie=function(e,t){if("object"!=typeof e||"function"!=typeof e.createPolicy)return null;let n=null;const o="data-tt-policy-suffix";t&&t.hasAttribute(o)&&(n=t.getAttribute(o));const r="dompurify"+(n?"#"+n:"");try{return e.createPolicy(r,{createHTML:e=>e,createScriptURL:e=>e})}catch(e){return console.warn("TrustedTypes policy "+r+" could not be created."),null}}(G,c)),null!==ie&&"string"==typeof ae&&(ae=ie.createHTML(""));i&&i(e),ct=e}},pt=S({},["mi","mo","mn","ms","mtext"]),ft=S({},["annotation-xml"]),dt=S({},["title","style","font","a","script"]),ht=S({},[...v,...D,...O]),gt=S({},[...x,...k]),Tt=function(e){p(o.removed,{element:e});try{re(e).removeChild(e)}catch(t){$(e)}},yt=function(e,t){try{p(o.removed,{attribute:t.getAttributeNode(e),from:t})}catch(e){p(o.removed,{attribute:null,from:t})}if(t.removeAttribute(e),"is"===e&&!Se[e])if(Fe||He)try{Tt(t)}catch(e){}else try{t.setAttribute(e,"")}catch(e){}},Et=function(e){let t=null,n=null;if(Pe)e="<remove></remove>"+e;else{const t=h(e,/^[\r\n\t ]+/);n=t&&t[0]}"application/xhtml+xml"===it&&tt===et&&(e='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+e+"</body></html>");const o=ie?ie.createHTML(e):e;if(tt===et)try{t=(new W).parseFromString(o,it)}catch(e){}if(!t||!t.documentElement){t=le.createDocument(tt,"template",null);try{t.documentElement.innerHTML=nt?ae:o}catch(e){}}const i=t.body||t.documentElement;return e&&n&&i.insertBefore(r.createTextNode(n),i.childNodes[0]||null),tt===et?ue.call(t,Ie?"html":"body")[0]:Ie?t.documentElement:i},_t=function(e){return ce.call(e.ownerDocument||e,e,H.SHOW_ELEMENT|H.SHOW_COMMENT|H.SHOW_TEXT|H.SHOW_PROCESSING_INSTRUCTION|H.SHOW_CDATA_SECTION,null)},At=function(e){return e instanceof B&&("string"!=typeof e.nodeName||"string"!=typeof e.textContent||"function"!=typeof e.removeChild||!(e.attributes instanceof z)||"function"!=typeof e.removeAttribute||"function"!=typeof e.setAttribute||"string"!=typeof e.namespaceURI||"function"!=typeof e.insertBefore||"function"!=typeof e.hasChildNodes)},Nt=function(e){return"function"==typeof b&&e instanceof b},bt=function(e,t,n){pe[e]&&u(pe[e],(e=>{e.call(o,t,n,ct)}))},St=function(e){let t=null;if(bt("beforeSanitizeElements",e,null),At(e))return Tt(e),!0;const n=lt(e.nodeName);if(bt("uponSanitizeElement",e,{tagName:n,allowedTags:Ne}),e.hasChildNodes()&&!Nt(e.firstElementChild)&&_(/<[/\w]/g,e.innerHTML)&&_(/<[/\w]/g,e.textContent))return Tt(e),!0;if(e.nodeType===J)return Tt(e),!0;if(Me&&e.nodeType===Q&&_(/<[/\w]/g,e.data))return Tt(e),!0;if(!Ne[n]||Ce[n]){if(!Ce[n]&&wt(n)){if(we.tagNameCheck instanceof RegExp&&_(we.tagNameCheck,n))return!1;if(we.tagNameCheck instanceof Function&&we.tagNameCheck(n))return!1}if(Ge&&!Xe[n]){const t=re(e)||e.parentNode,n=oe(e)||e.childNodes;if(n&&t){for(let o=n.length-1;o>=0;--o){const r=X(n[o],!0);r.__removalCount=(e.__removalCount||0)+1,t.insertBefore(r,ne(e))}}}return Tt(e),!0}return e instanceof R&&!function(e){let t=re(e);t&&t.tagName||(t={namespaceURI:tt,tagName:"template"});const n=f(e.tagName),o=f(t.tagName);return!!ot[e.namespaceURI]&&(e.namespaceURI===Qe?t.namespaceURI===et?"svg"===n:t.namespaceURI===Je?"svg"===n&&("annotation-xml"===o||pt[o]):Boolean(ht[n]):e.namespaceURI===Je?t.namespaceURI===et?"math"===n:t.namespaceURI===Qe?"math"===n&&ft[o]:Boolean(gt[n]):e.namespaceURI===et?!(t.namespaceURI===Qe&&!ft[o])&&!(t.namespaceURI===Je&&!pt[o])&&!gt[n]&&(dt[n]||!ht[n]):!("application/xhtml+xml"!==it||!ot[e.namespaceURI]))}(e)?(Tt(e),!0):"noscript"!==n&&"noembed"!==n&&"noframes"!==n||!_(/<\/no(script|embed|frames)/i,e.innerHTML)?(ke&&e.nodeType===Z&&(t=e.textContent,u([fe,de,he],(e=>{t=g(t,e," ")})),e.textContent!==t&&(p(o.removed,{element:e.cloneNode()}),e.textContent=t)),bt("afterSanitizeElements",e,null),!1):(Tt(e),!0)},Rt=function(e,t,n){if(Be&&("id"===t||"name"===t)&&(n in r||n in st))return!1;if(De&&!Le[t]&&_(ge,t));else if(ve&&_(Te,t));else if(!Se[t]||Le[t]){if(!(wt(e)&&(we.tagNameCheck instanceof RegExp&&_(we.tagNameCheck,e)||we.tagNameCheck instanceof Function&&we.tagNameCheck(e))&&(we.attributeNameCheck instanceof RegExp&&_(we.attributeNameCheck,t)||we.attributeNameCheck instanceof Function&&we.attributeNameCheck(t))||"is"===t&&we.allowCustomizedBuiltInElements&&(we.tagNameCheck instanceof RegExp&&_(we.tagNameCheck,n)||we.tagNameCheck instanceof Function&&we.tagNameCheck(n))))return!1}else if(Ve[t]);else if(_(Ae,g(n,Ee,"")));else if("src"!==t&&"xlink:href"!==t&&"href"!==t||"script"===e||0!==T(n,"data:")||!$e[e]){if(Oe&&!_(ye,g(n,Ee,"")));else if(n)return!1}else;return!0},wt=function(e){return"annotation-xml"!==e&&h(e,_e)},Ct=function(e){bt("beforeSanitizeAttributes",e,null);const{attributes:t}=e;if(!t)return;const n={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:Se};let r=t.length;for(;r--;){const i=t[r],{name:a,namespaceURI:l,value:c}=i,s=lt(a);let p="value"===a?c:y(c);if(n.attrName=s,n.attrValue=p,n.keepAttr=!0,n.forceKeepAttr=void 0,bt("uponSanitizeAttribute",e,n),p=n.attrValue,n.forceKeepAttr)continue;if(yt(a,e),!n.keepAttr)continue;if(!xe&&_(/\/>/i,p)){yt(a,e);continue}ke&&u([fe,de,he],(e=>{p=g(p,e," ")}));const f=lt(e.nodeName);if(Rt(f,s,p))if(!We||"id"!==s&&"name"!==s||(yt(a,e),p="user-content-"+p),Me&&_(/((--!?|])>)|<\/(style|title)/i,p))yt(a,e);else{if(ie&&"object"==typeof G&&"function"==typeof G.getAttributeType)if(l);else switch(G.getAttributeType(f,s)){case"TrustedHTML":p=ie.createHTML(p);break;case"TrustedScriptURL":p=ie.createScriptURL(p)}try{l?e.setAttributeNS(l,a,p):e.setAttribute(a,p),At(e)?Tt(e):m(o.removed)}catch(e){}}}bt("afterSanitizeAttributes",e,null)},Lt=function e(t){let n=null;const o=_t(t);for(bt("beforeSanitizeShadowDOM",t,null);n=o.nextNode();)bt("uponSanitizeShadowNode",n,null),St(n)||(n.content instanceof s&&e(n.content),Ct(n));bt("afterSanitizeShadowDOM",t,null)};return o.sanitize=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=null,r=null,i=null,l=null;if(nt=!e,nt&&(e="\x3c!--\x3e"),"string"!=typeof e&&!Nt(e)){if("function"!=typeof e.toString)throw A("toString is not a function");if("string"!=typeof(e=e.toString()))throw A("dirty is not a string, aborting")}if(!o.isSupported)return e;if(Ue||mt(t),o.removed=[],"string"==typeof e&&(Ye=!1),Ye){if(e.nodeName){const t=lt(e.nodeName);if(!Ne[t]||Ce[t])throw A("root node is forbidden and cannot be sanitized in-place")}}else if(e instanceof b)n=Et("\x3c!----\x3e"),r=n.ownerDocument.importNode(e,!0),r.nodeType===V&&"BODY"===r.nodeName||"HTML"===r.nodeName?n=r:n.appendChild(r);else{if(!Fe&&!ke&&!Ie&&-1===e.indexOf("<"))return ie&&ze?ie.createHTML(e):e;if(n=Et(e),!n)return Fe?null:ze?ae:""}n&&Pe&&Tt(n.firstChild);const c=_t(Ye?e:n);for(;i=c.nextNode();)St(i)||(i.content instanceof s&&Lt(i.content),Ct(i));if(Ye)return e;if(Fe){if(He)for(l=se.call(n.ownerDocument);n.firstChild;)l.appendChild(n.firstChild);else l=n;return(Se.shadowroot||Se.shadowrootmode)&&(l=me.call(a,l,!0)),l}let m=Ie?n.outerHTML:n.innerHTML;return Ie&&Ne["!doctype"]&&n.ownerDocument&&n.ownerDocument.doctype&&n.ownerDocument.doctype.name&&_(q,n.ownerDocument.doctype.name)&&(m="<!DOCTYPE "+n.ownerDocument.doctype.name+">\n"+m),ke&&u([fe,de,he],(e=>{m=g(m,e," ")})),ie&&ze?ie.createHTML(m):m},o.setConfig=function(){mt(arguments.length>0&&void 0!==arguments[0]?arguments[0]:{}),Ue=!0},o.clearConfig=function(){ct=null,Ue=!1},o.isValidAttribute=function(e,t,n){ct||mt({});const o=lt(e),r=lt(t);return Rt(o,r,n)},o.addHook=function(e,t){"function"==typeof t&&(pe[e]=pe[e]||[],p(pe[e],t))},o.removeHook=function(e){if(pe[e])return m(pe[e])},o.removeHooks=function(e){pe[e]&&(pe[e]=[])},o.removeAllHooks=function(){pe={}},o}();return ne}));
//# sourceMappingURL=purify.min.js.map
/* khóa học của trang này (build điền vào): mọi chỗ đọc/ghi dữ liệu dùng CID */
/* CID, COURSE, LESSON_MAP, VIEWS, LESSON_EN, LESSON_EMBED, GLOSSARY… do build sinh trong phần dữ liệu khóa (chạy trước file này) */
const CMETA=courseById(CID),VKEY=CID+"-view";
/* ---------- Việc chạy sau khi trang và tiến độ đã sẵn sàng (bài học đăng ký bằng onReady) ---------- */
const READY=[];let READY_RAN=false;function onReady(f){if(READY_RAN)setTimeout(()=>{try{f()}catch(e){console.error(e)}});else READY.push(f)}
/* ---------- Mã tương tác của từng bài: bản site là file riêng (LESSON_CHUNKS), tải khi mở bài; bản xem trước có sẵn ---------- */
const CODE_LOADING={};
function lessonCode(l){const u=LESSON_CHUNKS&&LESSON_CHUNKS[l];if(!u)return Promise.resolve();
  // chạy sau phần bài học chung (SNIP, fillSnips…); file đã được tải sớm nên thường không phải chờ mạng
  return CODE_LOADING[u]||(CODE_LOADING[u]=BOOTED.then(()=>new Promise((ok,no)=>{const s=document.createElement("script");s.src=u;s.async=false;s.onload=ok;
    s.onerror=()=>{delete CODE_LOADING[u];s.remove();no(new Error("Không tải được "+u))};document.head.appendChild(s)})))}
function allLessonCode(){return Promise.all(VIEWS.filter(v=>/^l\d/.test(v)).map(lessonCode))}
/* BOOTED: xong khi mọi phần của trang đã chạy (bản site tải phần bài học là file riêng, xem BOOT_JS trong build.py) */
let BOOT_DONE;const BOOTED=new Promise(r=>BOOT_DONE=r);
/* ---------- Ẩn / hiện thanh bên (nhớ lựa chọn trên trình duyệt) ---------- */
(function(){
  const app=document.querySelector(".app"),hide=document.getElementById("sb-hide"),showB=document.getElementById("sb-show");
  function set(c,focus){app.classList.toggle("sb-collapsed",c);
    hide.setAttribute("aria-expanded",String(!c));showB.setAttribute("aria-expanded",String(!c));
    hide.setAttribute("aria-label",c?"Hiện thanh bên":"Ẩn thanh bên");hide.title=c?"Hiện thanh bên":"Ẩn thanh bên";
    try{localStorage.setItem("amts-sidebar",c?"hidden":"shown")}catch(e){}
    if(focus)(c&&getComputedStyle(showB.parentNode).display!=="none"?showB:hide).focus({preventScroll:true})}
  const mq=matchMedia("(max-width:900px)"),openB=document.getElementById("m-open"),scrim=document.getElementById("scrim");
  function drawer(o){app.classList.toggle("drawer",o);openB.setAttribute("aria-expanded",String(o));document.documentElement.style.overflow=o?"hidden":"";
    if(o)hide.focus({preventScroll:true});else if(mq.matches)openB.focus({preventScroll:true})}
  /* giữ focus trong ngăn kéo khi đang mở (Tab vòng lại) */
  document.getElementById("side").addEventListener("keydown",e=>{if(e.key!=="Tab"||!app.classList.contains("drawer"))return;
    const f=[...document.querySelectorAll("#side a[href],#side button:not([disabled]),#side input,#side summary")].filter(x=>x.offsetParent!==null);if(!f.length)return;
    if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&document.activeElement===f[f.length-1]){e.preventDefault();f[0].focus()}});
  window.closeDrawer=()=>{if(app.classList.contains("drawer")){app.classList.remove("drawer");openB.setAttribute("aria-expanded","false");document.documentElement.style.overflow=""}};
  openB.onclick=()=>drawer(true);scrim.onclick=()=>drawer(false);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&app.classList.contains("drawer"))drawer(false)});
  const onMq=()=>{if(!mq.matches)window.closeDrawer()};if(mq.addEventListener)mq.addEventListener("change",onMq);else if(mq.addListener)mq.addListener(onMq);
  hide.onclick=()=>{if(mq.matches){drawer(false);return}set(!app.classList.contains("sb-collapsed"),true)};
  showB.onclick=()=>set(false,true);
  let c=false;try{c=localStorage.getItem("amts-sidebar")==="hidden"}catch(e){}
  if(c){app.style.transition="none";set(true);requestAnimationFrame(()=>app.style.transition="")}
})();
/* ================= COURSE DATA ================= */
function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
/* ================= NỘI DUNG BÀI HỌC: tải theo quyền truy cập =================
   Phần chữ của mỗi bài nằm trên Firestore (content/{khóa}-lN). Trang chỉ giữ phần tương tác
   (trình mô phỏng, bài tập, trắc nghiệm) trong vùng .park, rồi ghép vào đúng chỗ khi bài được tải. */
/* ---------- Khởi tạo công cụ minh họa khi bài được mở (không dựng sẵn cả 19 bài) ---------- */
const LAZY=new Map();
function deferInit(el,fn){const art=el&&el.closest&&el.closest("article[id^='view-']");
  if(window.__NOLAZY||!art||!art.hidden){fn();return}
  if(!LAZY.has(art.id))LAZY.set(art.id,[]);LAZY.get(art.id).push(fn)}
function runLazy(v){const q=LAZY.get("view-"+v);if(!q)return;LAZY.delete("view-"+v);q.forEach(f=>{try{f()}catch(e){console.error(e)}})}
/* công cụ minh họa make…(): dựng khi bài được mở; build gọi lazyWidgets() ở đầu phần bài học (sau khi mọi hàm make… đã có) */
function lazyWidgets(){LAZY_WIDGETS.forEach(n=>{const f=window[n];if(typeof f!=="function"||f.__lazy)return;const w=function(el,...a){deferInit(el,()=>f(el,...a))};w.__lazy=1;window[n]=w})}
{const real=makeSim2;window.makeSim2=function(root,cfg){let s=null;const ensure=()=>s||(s=real(root,cfg));deferInit(root,ensure);
  return{get:()=>ensure().get(),set:c=>ensure().set(c),setInput:v=>ensure().setInput(v),el:root,run:()=>ensure().run(),step:()=>ensure().step(),forceLang:l=>ensure().forceLang(l),get lang(){return ensure().lang}}}}
/* ---------- Thuật ngữ tiếng Anh ---------- */
function flashTerm(el){if(!el)return;el.scrollIntoView({behavior:"smooth",block:"center"});el.classList.add("flash");setTimeout(()=>el.classList.remove("flash"),1600)}
function addGloss(l){
  const art=document.getElementById("view-"+l);if(!art||art.querySelector(":scope > .gloss"))return;
  const seen=new Map();art.querySelectorAll("span.en").forEach(x=>{const k=x.textContent;if(!seen.has(k))seen.set(k,x)});
  if(!seen.size)return;
  const box=document.createElement("details");box.className="gloss";
  box.innerHTML=`<summary><b>Thuật ngữ trong bài</b><small>Glossary · ${seen.size} thuật ngữ</small></summary><table class="gl-t"><thead><tr><th scope="col">Tiếng Việt</th><th scope="col" lang="en">English</th><th scope="col"><span class="vh">Vị trí trong bài</span></th></tr></thead><tbody></tbody></table>`;
  const list=box.querySelector("tbody");
  seen.forEach((el,en)=>{const tr=document.createElement("tr");
    tr.innerHTML=`<td class="gl-vi">${esc(el.dataset.vi||"")}</td><td class="gl-en" lang="en">${esc(en)}</td><td class="gl-at"><button type="button" class="gl-go">Xem trong bài</button></td>`;
    tr.querySelector("button").onclick=()=>flashTerm(el);list.appendChild(tr)});
  const nx=art.querySelector(":scope > div.next");art.insertBefore(box,nx||null);
}
function renderGlossAll(){
  const box=document.getElementById("gl-all");if(!box)return;const q=(document.getElementById("gl-q").value||"").trim().toLowerCase();
  const norm=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");const nq=norm(q);
  const rows=GLOSSARY.filter(([en,vi])=>!q||en.toLowerCase().includes(q)||vi.toLowerCase().includes(q)||norm(vi.toLowerCase()).includes(nq))
    .sort((a,b)=>a[0].localeCompare(b[0],"en",{sensitivity:"base"}));
  document.getElementById("gl-n").textContent=`${rows.length} / ${GLOSSARY.length} thuật ngữ`;
  box.innerHTML=rows.length?`<table class="gl-t"><thead><tr><th scope="col" lang="en">English</th><th scope="col">Tiếng Việt</th><th scope="col">Bài học</th></tr></thead><tbody>${rows.map(([en,vi,n])=>`<tr><td class="gl-en" lang="en">${esc(en)}</td><td class="gl-vi">${esc(vi)}</td><td class="gl-at"><button type="button" class="gl-go" data-l="l${n}" data-en="${esc(en)}" aria-label="${esc(en)}: xem trong Bài ${n}">Bài ${n}</button></td></tr>`).join("")}</tbody></table>`:"";
  if(!rows.length)box.innerHTML=`<p class="gl-empty">Không có thuật ngữ khớp “${esc(q)}”.</p>`;
  box.querySelectorAll("button[data-l]").forEach(b=>b.onclick=()=>{const l=b.dataset.l,en=b.dataset.en;go(l);
    let k=0;const t=setInterval(()=>{const el=[...document.querySelectorAll(`#view-${l} span.en`)].find(x=>x.textContent===en);
      if(el||++k>40){clearInterval(t);if(el)flashTerm(el)}},150)})}
function setEN(on){document.documentElement.classList.toggle("no-en",!on);const sw=document.getElementById("en-sw");if(sw)sw.setAttribute("aria-checked",on);
  try{localStorage.setItem("amts-en",on?"1":"0")}catch(e){}}
const LOADED=new Set();
let curView=null;
function lessonMeta(l){
  const key=Object.keys(LESSON_MAP).find(k=>LESSON_MAP[k]===l)||"0-0";const [ch,i]=key.split("-").map(Number);
  let n=0,chap=null;COURSE.forEach(t=>t.chapters.forEach(c=>{n++;if(n===ch)chap=c}));
  return{no:+l.slice(1),ch,chName:chap?chap.t:"",name:chap?chap.l[i]:""}}
/* chỉ giữ HTML trình bày: bỏ script, iframe, form, thuộc tính on…, đường dẫn javascript: */
/* Lọc HTML bài học trước khi hiển thị: DOMPurify (thư viện lọc đã được kiểm thử rộng rãi) với danh sách thẻ/thuộc tính được phép.
   Chỉ giảng viên ghi được content trên Firestore; lớp lọc này là lớp bảo vệ thứ hai. */
const SANITIZE={
  ALLOWED_TAGS:["section","header","footer","div","p","span","b","strong","i","em","u","s","small","sup","sub","br","hr","code","pre","kbd","samp","var","mark","blockquote",
    "h1","h2","h3","h4","h5","h6","ul","ol","li","dl","dt","dd","table","caption","colgroup","col","thead","tbody","tfoot","tr","th","td",
    "figure","figcaption","a","img","details","summary","abbr","time",
    "svg","g","path","rect","circle","ellipse","line","polyline","polygon","text","tspan","defs","marker","title","desc","use"],
  ALLOWED_ATTR:["class","id","lang","title","role","style","href","target","rel","src","alt","width","height","colspan","rowspan","scope","start","datetime",
    "aria-label","aria-hidden","aria-describedby","loading","decoding","data-mount","data-vi","data-snip",
    "viewbox","xmlns","d","x","y","x1","y1","x2","y2","cx","cy","r","rx","ry","dx","dy","points","fill","stroke","stroke-width","stroke-dasharray","stroke-linecap","stroke-linejoin",
    "opacity","fill-opacity","transform","font-family","font-size","font-weight","text-anchor","dominant-baseline","marker-end","marker-start","refx","refy","markerwidth","markerheight","orient","preserveaspectratio"],
  ALLOW_DATA_ATTR:false,ALLOW_UNKNOWN_PROTOCOLS:false,RETURN_DOM_FRAGMENT:true};
if(window.DOMPurify&&DOMPurify.addHook)DOMPurify.addHook("afterSanitizeAttributes",n=>{if(n.tagName==="A"&&n.getAttribute("target")==="_blank")n.setAttribute("rel","noopener noreferrer")});
function cleanHTML(html){
  if(window.DOMPurify&&DOMPurify.isSupported)return DOMPurify.sanitize(String(html||""),SANITIZE);
  const t=document.createElement("template");t.textContent="";const p=document.createElement("p");p.textContent="Trình duyệt không hỗ trợ hiển thị an toàn nội dung bài học.";t.content.appendChild(p);return t.content}
function mountLesson(l,html){
  const art=document.getElementById("view-"+l);if(!art||LOADED.has(l))return;
  const park=art.querySelector(":scope > .park"),gate=art.querySelector(":scope > .lgate");
  const tmp=document.createElement("div");tmp.appendChild(cleanHTML(html));
  tmp.querySelectorAll("[data-mount]").forEach(ph=>{
    const el=park&&park.querySelector(`:scope > [data-m="${ph.dataset.mount}"]`);if(!el){ph.remove();return}
    const extra=[];let n=el.nextElementSibling;while(n&&!n.hasAttribute("data-m")){extra.push(n);n=n.nextElementSibling}
    ph.replaceWith(el,...extra)});
  while(tmp.firstChild)art.insertBefore(tmp.firstChild,park||null);
  if(park&&!park.children.length)park.remove();
  if(gate){gate.hidden=true;gate.innerHTML=""}
  LOADED.add(l);
  if(typeof fillSnips==='function')fillSnips(art);
  addGloss(l);addToc(l);
}
/* mục lục trong bài: một nút "Trong bài này" (48px) mở ra danh sách mục; tự đánh dấu mục đang đọc */
function addToc(l){
  const art=document.getElementById("view-"+l);if(!art||art.querySelector(":scope > .ltoc"))return;
  const heads=[...art.querySelectorAll(":scope > section.part .part-head")];if(heads.length<3)return;
  const box=document.createElement("details");box.className="ltoc";
  const items=heads.map(h=>{const num=(h.querySelector(".num")||{}).textContent||"",h2=h.querySelector("h2");
    const t=h2?[...h2.childNodes].filter(n=>!(n.classList&&n.classList.contains("h-en"))).map(n=>n.textContent).join("").trim():"";return{el:h,num,t}});
  const gl=art.querySelector(":scope > .gloss");if(gl)items.push({el:gl,num:"",t:"Thuật ngữ trong bài",gl:true});
  box.innerHTML=`<summary><b>Trong bài này</b><span class="ltoc-cur" aria-live="off"></span></summary><nav aria-label="Mục lục trong bài"><ol>${items.map((x,i)=>`<li><a href="#" data-i="${i}"${x.gl?' class="gl"':""}>${x.num?`<span>${esc(x.num)}</span>`:""}${esc(x.t)}</a></li>`).join("")}</ol></nav>`;
  box.querySelectorAll("a").forEach(a=>a.onclick=e=>{e.preventDefault();const x=items[+a.dataset.i];if(x.gl)x.el.open=true;box.open=false;x.el.scrollIntoView({behavior:"smooth",block:"start"})});
  box._items=items;box._k=-2;
  const after=art.querySelector(":scope > .goals")||art.querySelector(":scope > header.hero");if(after)after.after(box);
  trackToc();
}
function trackToc(){const art=curView&&document.getElementById("view-"+curView),box=art&&art.querySelector(":scope > .ltoc");if(!box||!box._items)return;
  const y=Math.min(220,innerHeight*.35);let k=-1;box._items.forEach((x,i)=>{if(x.el.getBoundingClientRect().top<y)k=i});
  if(k===box._k)return;box._k=k;
  box.querySelectorAll("a").forEach((a,i)=>{if(i===k)a.setAttribute("aria-current","location");else a.removeAttribute("aria-current")});
  box.querySelector(".ltoc-cur").textContent=k>=0?(box._items[k].num?box._items[k].num+" ":"")+box._items[k].t:`${box._items.length} mục`}
{let raf=0;addEventListener("scroll",()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;trackToc()})},{passive:true});
 document.addEventListener("click",e=>{document.querySelectorAll(".ltoc[open]").forEach(d=>{if(!d.contains(e.target))d.open=false})});
 document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;const d=document.querySelector(".ltoc[open]");if(d){d.open=false;d.querySelector("summary").focus()}})}
const LOCK_SVG='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>';
function accessOf(l,cfg){const no=+l.slice(1);if(cfg.paidMode&&cfg.paid&&cfg.paid[l])return "paid";return no>=(+cfg.loginFrom||9999)?"login":"public"}
function gateShow(l,kind,cfg,extra){
  const art=document.getElementById("view-"+l);if(!art||LOADED.has(l))return;const gate=art.querySelector(":scope > .lgate");if(!gate)return;
  const m=lessonMeta(l),S=AMTS.S;cfg=cfg||{};
  const head=`<header class="hero"><div class="crumb">Chương ${m.ch} · ${esc(m.chName)} / Bài ${m.no}</div><h1>${esc(m.name)}</h1></header>`;
  const gbtn=`<button class="gbtn lg-in"><span class="g">G</span>Đăng nhập bằng Google</button>`;
  const back=`<button class="btn" data-go="road">Về lộ trình</button>`;
  const from=+cfg.loginFrom||m.no;
  const email=(S.user&&S.user.email||"").toLowerCase();
  const cp=(v,lb)=>`<button type="button" class="btn sm lg-cp" data-cp="${escH(v)}" aria-label="Sao chép ${lb}">Sao chép</button>`;
  let body="";
  if(kind==="loading")body=`<div class="lg-card lg-skel" aria-busy="true"><p class="lg-load" role="status">Đang kiểm tra quyền học…</p><span class="sk w60"></span><span class="sk"></span><span class="sk w80"></span><span class="sk w40"></span></div>`;
  else if(kind==="login")body=`<div class="lg-card">${LOCK_SVG}<h2>Đăng nhập để học từ Bài ${from}.</h2><p>Đăng nhập bằng tài khoản Google là miễn phí, giúp lưu tiến độ và học tiếp trên mọi thiết bị.</p><div class="lg-btns">${gbtn}${back}</div><p class="lg-msg bad-t" aria-live="polite"></p></div>`;
  else if(kind==="paid-login")body=`<div class="lg-card paid">${LOCK_SVG}<h2>Bài học có phí</h2><p>Bài này thuộc phần có phí của khóa học. Hãy đăng nhập bằng Google trước; sau khi chuyển khoản và được giảng viên kích hoạt, bạn học được toàn bộ các bài có phí.</p>${cfg.price?`<p class="lg-price">Học phí: <b>${escH(cfg.price)}</b></p>`:""}<div class="lg-btns">${gbtn}${back}</div><p class="lg-msg bad-t" aria-live="polite"></p></div>`;
  else if(kind==="paid"){const pend=extra&&extra.pending;
    const rows=[cfg.price&&["Học phí",`<b>${escH(cfg.price)}</b>`],cfg.bankName&&["Ngân hàng",escH(cfg.bankName)],cfg.accName&&["Người nhận",escH(cfg.accName)],
      cfg.accNo&&["Số tài khoản",`<code>${escH(cfg.accNo)}</code>${cp(cfg.accNo,"số tài khoản")}`],["Nội dung chuyển khoản",`<code>${escH(email)}</code>${cp(email,"nội dung chuyển khoản")}`]].filter(Boolean);
    const hasPay=cfg.bankName||cfg.accNo||cfg.payInfo;
    body=`<div class="lg-card paid">${LOCK_SVG}<h2>Bài học có phí</h2><p>Tài khoản <b>${escH(email)}</b> chưa được kích hoạt phần có phí của khóa học.</p>
      ${hasPay?`<dl class="lg-dl">${rows.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>${cfg.payInfo?`<div class="lg-pay">${escH(cfg.payInfo)}</div>`:""}`
        :`<p class="lg-warn">Giảng viên chưa cập nhật thông tin chuyển khoản.${cfg.payContact?"":" Vui lòng liên hệ giảng viên để đăng ký."}</p>`}
      ${cfg.payContact?`<p class="lg-contact">Liên hệ: ${escH(cfg.payContact)}</p>`:""}
      ${pend?`<p class="lg-pend" role="status"><b>Đang chờ xác nhận.</b> Bạn đã báo chuyển khoản${pend.at?" lúc "+escH(pend.at):""}. Giảng viên sẽ kiểm tra và kích hoạt; sau đó bấm <b>Kiểm tra lại</b>.</p>`:""}
      <div class="lg-btns">${pend||!hasPay?"":`<button class="btn pri lg-paid">Tôi đã chuyển khoản</button>`}<button class="btn${pend?" pri":""} lg-re">Kiểm tra lại</button></div><p class="lg-msg" aria-live="polite"></p></div>`}
  else if(kind==="missing")body=`<div class="lg-card"><h2>Bài học đang được cập nhật</h2><p>Nội dung bài này chưa có trên máy chủ. Vui lòng quay lại sau.</p>${AMTS.isTeacher()?`<p class="bad-t">Giảng viên: hãy tải file <code>noi-dung-${CID}.json</code> lên ở mục “Nội dung bài học” trong Trang giảng viên.</p>`:""}<div class="lg-btns">${back}</div></div>`;
  else body=`<div class="lg-card"><h2>Chưa tải được bài học</h2><p>${kind==="offline"?"Không kết nối được máy chủ nên chưa kiểm tra được quyền học. Kiểm tra Internet rồi thử lại.":escH(extra||"Đã có lỗi khi tải bài học.")}</p><div class="lg-btns"><button class="btn pri lg-re">Thử lại</button>${back}</div></div>`;
  gate.hidden=false;gate.innerHTML=head+body;
  const msg=gate.querySelector(".lg-msg");
  const bi=gate.querySelector(".lg-in");if(bi)bi.onclick=async()=>{const r=await AMTS.signIn();if(msg)msg.textContent=r};
  const br=gate.querySelector(".lg-re");if(br)br.onclick=()=>{AMTS.clearEnroll();if(kind==="offline")location.reload();else openLesson(l,true)};
  gate.querySelectorAll(".lg-cp").forEach(b=>b.onclick=()=>{const t=b.textContent;(typeof copyText==="function"?copyText(b.dataset.cp):Promise.reject()).then(()=>{b.textContent="Đã sao chép"},()=>{b.textContent="Chưa sao chép được"}).finally(()=>setTimeout(()=>b.textContent=t,1800))});
  const bp=gate.querySelector(".lg-paid");if(bp)bp.onclick=async()=>{bp.disabled=true;bp.textContent="Đang gửi…";
    try{await AMTS.requestPay(CID);gateShow(l,"paid",cfg,{pending:{at:new Date().toLocaleString("vi-VN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"})}});const f=document.querySelector(`#view-${l} .lg-pend`);if(f){f.setAttribute("tabindex","-1");f.focus()}}
    catch(e){bp.disabled=false;bp.textContent="Tôi đã chuyển khoản";if(msg){msg.className="lg-msg bad-t";msg.textContent="Chưa gửi được: "+(e.message||e.code)+". Thử lại sau."}}};
}
async function payState(){const r=await AMTS.payReqOf(CID);if(!r)return null;
  const d=r.toDate?r.toDate():null;return{pending:{at:d?d.toLocaleString("vi-VN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"}):""}}}
/* ---------- Nhớ nội dung bài đã mở trên máy (theo tài khoản và phiên bản nội dung) ----------
   Mở lại bài: hiện ngay bản đã nhớ, đồng thời vẫn hỏi máy chủ quyền và nội dung như bình thường.
   Máy chủ báo không còn quyền thì xóa bản nhớ và tải lại trang (khi đó bài hiện màn hình khóa).
   Đăng xuất xóa toàn bộ bản nhớ (AMTS.clearLocal). */
const LC=(()=>{const IDX="amts-c-idx",UK="amts-c-uid",MAX=40;
  const uidNow=()=>{const S=AMTS.S;if(S.authKnown)return S.user?S.user.uid:"khach";try{return localStorage.getItem(UK)||"khach"}catch(e){return "khach"}};
  const key=(uid,l)=>`amts-c:${uid}:${CID}@${typeof CMETA!=="undefined"&&CMETA.contentVer||""}-${l}`;
  const idx=()=>{try{const a=JSON.parse(localStorage.getItem(IDX)||"[]");return Array.isArray(a)?a:[]}catch(e){return []}};
  const setIdx=a=>{try{localStorage.setItem(IDX,JSON.stringify(a))}catch(e){}};
  const rm=k=>{try{localStorage.removeItem(k)}catch(e){}};
  return{
    get(l){try{const k=key(uidNow(),l),s=localStorage.getItem(k);if(!s)return null;const d=JSON.parse(s);setIdx(idx().filter(x=>x!==k).concat(k));return d&&typeof d.html==="string"?d:null}catch(e){return null}},
    has(l){try{return !!localStorage.getItem(key(uidNow(),l))}catch(e){return false}},
    put(l,d){if(LESSON_EMBED||!d||typeof d.html!=="string")return;const k=key(uidNow(),l);const v=JSON.stringify({html:d.html,sol:d.sol||[],sols:d.sols||{},ver:d.ver||"",at:Date.now()});
      const a=idx().filter(x=>x!==k);while(a.length>=MAX)rm(a.shift());
      for(let t=0;t<4;t++){try{localStorage.setItem(k,v);setIdx(a.concat(k));return}catch(e){if(!a.length)return;a.splice(0,Math.max(1,a.length>>1)).forEach(rm)}}},
    drop(l){const k=key(uidNow(),l);rm(k);setIdx(idx().filter(x=>x!==k))},
    seen(S){if(S.authKnown)try{localStorage.setItem(UK,S.user?S.user.uid:"khach")}catch(e){}}}})();
AMTS.on(S=>LC.seen(S));
const LOADING=new Set();
async function openLesson(l,fresh){
  if(LESSON_EMBED||LOADED.has(l)||!document.getElementById("view-"+l))return;
  if(LOADING.has(l)&&!fresh)return;LOADING.add(l);
  try{await openLesson_(l,fresh)}finally{LOADING.delete(l)}
}
async function openLesson_(l,fresh){
  // 1. Bài đã nhớ trên máy: hiện ngay, kiểm tra quyền ở phía sau.
  //    Bản nhớ mới (dưới 30 phút, đúng phiên bản) thì không đọc lại nội dung, chỉ kiểm tra quyền (cấu hình, kích hoạt).
  const cached=fresh?null:LC.get(l),recent=!!(cached&&cached.at&&Date.now()-cached.at<CACHE_FRESH_MS);
  if(cached){   // đợi mọi script của trang chạy xong rồi mới ghép bài (công cụ trong bài cần chúng)
    await BOOTED;
    if(!LOADED.has(l)){mountLesson(l,cached.html);if(curView===l&&window.TRACK)TRACK.visit(l)}}
  else gateShow(l,"loading");
  const revoke=()=>{LC.drop(l);location.reload()};   // đã hiện bản nhớ nhưng máy chủ không cho xem nữa
  const S=await AMTS.ready();
  if(LOADED.has(l)&&!cached)return;
  if(S.mode!=="ready"){if(!cached)gateShow(l,"offline");return}
  // 2. Cấu hình, quyền và nội dung đọc cùng lúc. Firestore vẫn quyết định quyền: đọc sớm không làm lộ bài có phí.
  const cv=CMETA.contentVer;
  const pCfg=AMTS.getConfig(CID,fresh).catch(()=>AMTS.defaultConfig());
  const pEnr=S.user?AMTS.isEnrolled(CID).catch(()=>false):Promise.resolve(false);
  const pLes=recent?null:AMTS.getLesson(CID,l,cv,null,"exact").then(d=>({d}),e=>({e}));   // chỉ thử đúng phiên bản (activeVer chưa biết)
  const cfg=await pCfg;
  renderLocks(cfg);
  const need=accessOf(l,cfg),teacher=AMTS.isTeacher();
  if(!teacher){
    if(need!=="public"&&!S.user){if(cached)return revoke();gateShow(l,need==="paid"?"paid-login":"login",cfg);return}
    if(need==="paid"&&!(await pEnr)){if(cached)return revoke();gateShow(l,"paid",cfg,await payState());return}
  }
  if(recent){prefetchNext(l,cfg,S,pEnr);return}
  try{const r=await pLes;let d=r.d,err=r.e;
    if(err&&err.code!=="permission-denied")throw err;
    if(!d||!d.html){   // không có đúng phiên bản (tài liệu chưa có cũng bị quy tắc báo từ chối): thử activeVer rồi bản cũ
      let d2=null;try{d2=await AMTS.getLesson(CID,l,cv,cfg,"rest")}catch(e2){if(e2.code!=="permission-denied")throw e2;err=err||e2}
      d=d2;if((!d||!d.html)&&err)throw err}   // hiếm: máy chủ chưa có phiên bản trang cần
    if(!d||!d.html){if(cached)return;gateShow(l,"missing",cfg);return}
    if(d._from==="exact")LC.put(l,d);
    prefetchNext(l,cfg,S,pEnr);
    if(cached)return;
    mountLesson(l,d.html);
    if(curView===l&&window.TRACK)TRACK.visit(l);
    if(teacher&&d._from!=="exact"){const art=document.getElementById("view-"+l);art.insertAdjacentHTML("afterbegin",`<div class="note lg-stale"><b>Giảng viên:</b> máy chủ chưa có nội dung phiên bản <code>${escH(cv)}</code> mà trang này cần, nên đang hiện bản <code>${escH(d._ver||d.ver||"cũ")}</code> (một số công cụ có thể nằm sai chỗ). Hãy tải file <code>noi-dung-${CID}.json</code> đi kèm bản trang này lên ở mục “Nội dung bài học” trong Trang giảng viên.</div>`)}
  }catch(e){
    if(e.code==="permission-denied"){
      if(cached)return revoke();
      if(need==="public"||(need==="login"&&S.user))gateShow(l,"missing",cfg);
      else if(need==="paid"){if(!S.user)gateShow(l,"paid-login",cfg);else if(await pEnr)gateShow(l,"missing",cfg);else gateShow(l,"paid",cfg,await payState())}
      else gateShow(l,"login",cfg);return}
    if(cached)return;   // lỗi mạng: giữ bản đã nhớ
    gateShow(l,"error",cfg,e.message||e.code)}
}
/* Tải trước bài kế tiếp vào bộ nhớ trên máy khi trình duyệt rảnh (chỉ khi học viên có quyền xem bài đó),
   để bấm “Bài tiếp” là bài hiện ngay. Bỏ qua khi mạng tiết kiệm dữ liệu. */
const CACHE_FRESH_MS=30*60*1000;
function prefetchNext(l,cfg,S,pEnr){
  if(LESSON_EMBED)return;const i=VIEWS.indexOf(l),n=i>=0?VIEWS[i+1]:null;
  if(!n||!/^l\d+$/.test(n)||LOADED.has(n)||LC.has(n))return;
  const c=navigator.connection;if(c&&(c.saveData||/2g/.test(c.effectiveType||"")))return;
  Promise.resolve(pEnr).then(enr=>{const need=accessOf(n,cfg);
    if(!(AMTS.isTeacher()||need==="public"||(need==="login"&&S.user)||(need==="paid"&&S.user&&enr)))return;
    (window.requestIdleCallback||(f=>setTimeout(f,1500)))(()=>{if(LC.has(n))return;
      AMTS.getLesson(CID,n,CMETA.contentVer,null,"exact").then(d=>{if(d&&d._from==="exact")LC.put(n,d)},()=>{})})})}
/* biểu tượng ổ khóa trong mục lục */
function renderLocks(cfg){
  if(LESSON_EMBED||!cfg)return;const S=AMTS.S,teacher=AMTS.isTeacher();
  document.querySelectorAll("#outline li[data-l]").forEach(li=>{const l=li.dataset.l,need=accessOf(l,cfg);
    const LK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>';
    let tag="";if(!teacher){if(need==="paid")tag=`<span class="lk paid" title="Bài có phí">${LK}Có phí</span>`;else if(need==="login"&&!S.user)tag=`<span class="lk" title="Cần đăng nhập">${LK}Đăng nhập</span>`}
    else if(need==="paid")tag=`<span class="lk paid" title="Bài có phí">${LK}Có phí</span>`;
    let x=li.querySelector(".lk");if(x)x.remove();if(tag)li.insertAdjacentHTML("beforeend",tag)});
}
AMTS.on(S=>{
  if(LESSON_EMBED)return;
  if(S.mode==="ready"&&S.authKnown){AMTS.getConfig(CID).then(renderLocks).catch(()=>{});
    if(curView&&/^l\d/.test(curView)&&!LOADED.has(curView))openLesson(curView)}
});
(function(){
  let n=0,h="";
  COURSE.forEach(t=>{
    h+=`<div class="lvl">${t.tier}</div>`;
    t.chapters.forEach(c=>{n++;
      h+=`<details class="ch" ${n===1?"open":""}><summary><span class="ch-no">${String(n).padStart(2,"0")}</span><span class="ch-t">${c.t}</span></summary><ul>`;
      c.l.forEach((l,i)=>{
        const L=LESSON_MAP[`${n}-${i}`];
        if(L) h+=`<li class="on" data-l="${L}"><a href="#bai-${L.slice(1)}" data-go="${L}"><span class="st" aria-hidden="true"></span><span class="lt">Bài ${L.slice(1)} · ${esc(l)}</span><span class="vh st-t"></span></a></li>`;
        else h+=`<li class="soon-l"><span class="st" aria-hidden="true"></span><span class="lt">${esc(l)}</span><span class="soon">Sắp có</span></li>`;
      });
      h+=`</ul></details>`;
    });
  });
  document.getElementById("outline").innerHTML=h;
  let road="",k=0;
  COURSE.forEach(t=>{
    road+=`<section class="tier"><div class="tier-h"><h2>${t.tier}</h2><span>${t.note}</span></div><div class="rrows">`;
    t.chapters.forEach(c=>{k++;const n=k;
      const ls=c.l.map((x,i)=>[LESSON_MAP[`${n}-${i}`],x]),open=ls.filter(x=>x[0]).length;
      const st=open===c.l.length?`<span class="r-st on">Đang mở</span>`:open?`<span class="r-st on">Đang mở ${open}/${c.l.length} bài</span>`:`<span class="r-st">Sắp mở</span>`;
      road+=`<details class="rrow${open?" live":""}" data-ch="${n}"><summary><span class="r-no">${String(n).padStart(2,"0")}</span><span class="r-t"><b>${c.t}</b><span class="h-en" lang="en">${c.en||""}</span></span><span class="r-p" data-rp="${n}"></span>${st}</summary>
        <div class="r-body"><ul>${ls.map(([L,x])=>L?`<li data-l="${L}"><a href="#bai-${L.slice(1)}" data-go="${L}"><span class="st" aria-hidden="true"></span>Bài ${L.slice(1)} · ${esc(x)}<span class="vh st-t"></span></a></li>`:`<li class="soon-l"><span class="st" aria-hidden="true"></span>${esc(x)}<span class="soon">Sắp có</span></li>`).join("")}</ul>
        <p class="simtag"><b>Mô phỏng</b>${c.sim}</p></div></details>`;
    });
    road+=`</div></section>`;
  });
  document.getElementById("road").innerHTML=road;
  document.getElementById("road-gl").onclick=()=>{const g=document.getElementById("gloss-all");g.open=true;g.scrollIntoView({behavior:"smooth"});setTimeout(()=>document.getElementById("gl-q").focus({preventScroll:true}),400)};
  renderGlossAll();document.getElementById("gl-q").addEventListener("input",renderGlossAll);
  /* tìm bài trong sidebar (không phân biệt dấu) */
  const fold=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");
  const qi=document.getElementById("ol-q"),qx=document.getElementById("ol-x"),emp=document.getElementById("ol-empty");
  function filterOutline(){const raw=qi.value.trim(),q=fold(raw);qx.hidden=!raw;let hits=0;
    document.querySelectorAll("#outline details.ch").forEach(d=>{
      const chHit=!!q&&fold(d.querySelector(".ch-t").textContent).includes(q);let any=false;
      d.querySelectorAll("li").forEach(li=>{const m=!q||chHit||fold(li.querySelector(".lt").textContent).includes(q);li.hidden=!m;if(m){any=true;if(q)hits++}});
      d.hidden=!!q&&!any;
      if(q){if(d.dataset.o===undefined)d.dataset.o=d.open?"1":"";if(any)d.open=true}
      else if(d.dataset.o!==undefined){d.open=d.dataset.o==="1"||d.classList.contains("has-cur");delete d.dataset.o}});
    document.querySelectorAll("#outline .lvl").forEach(t=>{let n=t.nextElementSibling,vis=false;while(n&&!n.classList.contains("lvl")){if(!n.hidden)vis=true;n=n.nextElementSibling}t.hidden=!vis});
    emp.hidden=!q||hits>0;emp.textContent=q&&!hits?`Không có bài nào khớp “${raw}”.`:(q?"":"")}
  qi.addEventListener("input",filterOutline);
  qx.onclick=()=>{qi.value="";filterOutline();qi.focus()};
  qi.addEventListener("keydown",e=>{if(e.key==="Escape"&&qi.value){e.stopPropagation();qi.value="";filterOutline()}});
  {let on=true;try{on=localStorage.getItem("amts-en")!=="0"}catch(e){}setEN(on);
   document.getElementById("en-sw").onclick=e=>setEN(e.currentTarget.getAttribute("aria-checked")!=="true")}
})();
let lastLesson="l1";
function show(v){
  curView=v;
  VIEWS.forEach(x=>{document.getElementById("view-"+x).hidden=x!==v});
  runLazy(v);
  if(/^l\d/.test(v)){lessonCode(v).catch(e=>console.error(e));openLesson(v)}
  if(/^l\d/.test(v))lastLesson=v;
  if(/^l\d/.test(v)&&window.TRACK&&(LESSON_EMBED||LOADED.has(v)))TRACK.visit(v);
  document.getElementById("nav-road").setAttribute("aria-pressed",v==="road");
  document.getElementById("nav-lesson").setAttribute("aria-pressed",/^l\d/.test(v));
  document.getElementById("nav-prac").setAttribute("aria-pressed",v==="practice");
  document.querySelectorAll("#outline li[data-l]").forEach(li=>{const on=li.dataset.l===v;li.classList.toggle("cur",on);const a=li.querySelector("a");if(on)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  document.querySelectorAll("#outline details.ch").forEach(d=>d.classList.remove("has-cur"));
  const cur=document.querySelector(`#outline li[data-l="${v}"]`);if(cur){const d=cur.closest("details");d.open=true;d.classList.add("has-cur")}
  /* đưa bài đang học vào vùng nhìn thấy của thanh bên (không cuộn trang) */
  if(cur)requestAnimationFrame(()=>{const sd=document.getElementById("side"),r=cur.getBoundingClientRect(),b=sd.getBoundingClientRect();
    if(sd.clientHeight&&(r.top<b.top+40||r.bottom>b.bottom-70))sd.scrollTop+=r.top-b.top-sd.clientHeight/3});
  if(window.TOPNAV)TOPNAV.setActive(v==="road"?"road":v==="practice"?"practice":"courses");
  if(v==="practice")allLessonCode().then(()=>{if(curView==="practice")try{PRACTICE.open()}catch(e){/* trang Thực hành chưa nạp xong: tự mở ở cuối script */}},e=>console.error(e));
  try{localStorage.setItem(VKEY,v)}catch(e){}
  if(window.closeDrawer)closeDrawer();
  const lm=/^l\d/.test(v)?lessonMeta(v):null;
  document.title=(AMTS.ENV&&AMTS.ENV.label?`[${AMTS.ENV.label}] `:"")+(v==="road"?`Lộ trình · ${CMETA.name} · AMTS`:v==="practice"?`Thực hành · ${CMETA.name} · AMTS`:`Bài ${lm.no}: ${lm.name} · ${CMETA.name} · AMTS`);
  window.scrollTo(0,0);
}
/* điều hướng: mỗi bài có địa chỉ riêng (#bai-N), nút Back / Forward của trình duyệt đi qua các bài đã xem */
const hashOf=v=>v==="road"?"#lo-trinh":v==="practice"?"#thuc-hanh":"#bai-"+v.slice(1);
function viewOfHash(h){const m=/^#bai-(\d+)$/.exec(h||"");if(m&&VIEWS.includes("l"+m[1]))return "l"+m[1];
  if(/^#thuc-hanh(-l\d+-\d+)?$/.test(h||"")){const x=/-(l\d+-\d+)$/.exec(h);if(x)window.PRACTICE_WANT=x[1];return "practice"}
  return h==="#lo-trinh"?"road":null}
function go(v){if(!VIEWS.includes(v))return;if(location.hash!==hashOf(v)){try{history.pushState(null,"",hashOf(v))}catch(e){curView=v;try{location.hash=hashOf(v)}catch(e2){}}}show(v)}
document.getElementById("nav-road").onclick=()=>go("road");
document.getElementById("nav-lesson").onclick=()=>go(lastLesson);
document.getElementById("nav-prac").onclick=()=>go("practice");
document.addEventListener("click",e=>{const a=e.target.closest("[data-go]");if(a){e.preventDefault();go(a.dataset.go)}});
{const wantGloss=location.hash==="#tu-dien";let v=wantGloss?"road":viewOfHash(location.hash);
 if(!v){try{const s=localStorage.getItem(VKEY);if(VIEWS.includes(s))v=s}catch(e){}}
 if(!v)v="road";
 if(location.hash!==hashOf(v)){try{history.replaceState(null,"",hashOf(v))}catch(e){}}
 show(v);
 if(wantGloss)setTimeout(()=>{const g=document.getElementById("gloss-all");if(g){g.open=true;g.scrollIntoView()}},50);
 const onNav=()=>{const x=viewOfHash(location.hash)||"road";if(x!==curView)show(x)};
 window.addEventListener("popstate",onNav);window.addEventListener("hashchange",onNav);}/* ================= THANH ĐIỀU HƯỚNG CHUNG (trang chủ + trang khóa học) =================
   Khung HTML: platform/partials/topnav.html · CSS: platform/css/07-topnav.css */
const IC={doc:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  book:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>',
  bell:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  check:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  arrow:'<span aria-hidden="true">→</span>',chev:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="width:16px;height:16px"><path d="m6 9 6 6 6-6"/></svg>'};
const TOPNAV=(()=>{
  const top=document.getElementById("top"),ROOT=(top&&top.dataset.root)||"";
  const opts={signOut:null};
  const seen=()=>{try{return JSON.parse(localStorage.getItem("amts-notif-seen")||"{}")}catch(e){return{}}};
  function wireMenu(bid,mid,onOpen){const b=document.getElementById(bid),m=document.getElementById(mid);if(!b||!m)return;
    b.onclick=e=>{e.stopPropagation();const o=m.hidden;closeMenus();if(o){m.hidden=false;b.setAttribute("aria-expanded","true");onOpen&&onOpen();const f=m.querySelector("a,button");if(f&&e.detail===0)f.focus()}}}
  function closeMenus(except){document.querySelectorAll(".menu").forEach(m=>{if(m!==except)m.hidden=true});
    document.querySelectorAll("[aria-haspopup]").forEach(b=>{if(!except||b.getAttribute("aria-controls")!==except.id)b.setAttribute("aria-expanded","false")})}
  document.addEventListener("click",e=>{if(!e.target.closest(".menu"))closeMenus();if(top&&!e.target.closest("#top"))setOpen(false)});
  document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;const open=document.querySelector(".menu:not([hidden])");
    if(open){const b=document.querySelector(`[aria-controls="${open.id}"]`);closeMenus();if(b)b.focus()}else if(top&&top.classList.contains("open")){setOpen(false);document.getElementById("nav-menu").focus()}});
  function setOpen(o){if(!top)return;top.classList.toggle("open",o);const b=document.getElementById("nav-menu");if(b)b.setAttribute("aria-expanded",String(o))}
  const mb=document.getElementById("nav-menu");if(mb)mb.onclick=e=>{e.stopPropagation();setOpen(!top.classList.contains("open"))};
  wireMenu("nav-docs","m-docs");
  {const nv=document.getElementById("mainnav");if(nv)nv.addEventListener("click",e=>{if(e.target.closest("a")){setOpen(false);closeMenus()}})}
  function setActive(k){document.querySelectorAll("#mainnav [data-nav]").forEach(a=>{if(a.dataset.nav===k)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")})}
  /* Thực hành: trang Thực hành của khóa đang mở */
  function practiceHref(){const c=(typeof CID!=="undefined"&&courseById(CID))||COURSES.find(x=>x.status==="open");if(!c)return ROOT+"index.html";return ROOT+c.url+"#thuc-hanh"}
  function render(){
    const el=document.getElementById("topacct");if(!el)return;const S=AMTS.S;
    const subs=COURSES.filter(c=>AMTS.notifyOf(c.id)),sn=seen(),fresh=subs.filter(c=>c.status==="open"&&!sn[c.id]);
    const notif=`<div class="navdd"><button class="iconbtn" id="b-bell" aria-haspopup="true" aria-expanded="false" aria-controls="m-bell" aria-label="Thông báo${fresh.length?` (${fresh.length} mới)`:""}">${IC.bell}${fresh.length?'<span class="dot" aria-hidden="true"></span>':""}</button>
      <div class="menu right notif" id="m-bell" hidden><b class="m-h">Thông báo</b>${subs.length?subs.map(c=>c.status==="open"?`<p class="new">${escH(c.name)} đã mở! <a href="${escH(ROOT+c.url)}">Vào học →</a></p>`:`<p>Bạn sẽ được báo khi <b>${escH(c.name)}</b> mở.</p>`).join("")
        :`<p>Bạn chưa có thông báo mới.</p><p class="note">Bấm “Nhận thông báo” ở một khóa sắp ra mắt để được báo khi khóa mở.</p>`}</div></div>`;
    let h="";
    if(S.mode==="unavailable")h="";
    else if(S.mode==="loading"||S.mode==="off")h=`<span class="note">Đang kết nối…</span>`;
    else if(S.mode==="error")h=`<span class="note bad-t">${escH(S.err)}</span>`;
    else if(!S.user)h=notif+`<button class="gbtn" id="btn-in"><span class="g">G</span>Đăng nhập</button>`;
    else{const u=S.user;
      h=notif+`<div class="navdd"><button class="avabtn" id="b-me" aria-haspopup="true" aria-expanded="false" aria-controls="m-me" aria-label="Tài khoản: ${escH(u.displayName||u.email||"")}">${avatarHTML(u)}${IC.chev}</button>
        <div class="menu right" id="m-me" hidden><div class="who">${avatarHTML(u)}<div><b>${escH(u.displayName||"Học viên")}</b><small>${escH(u.email||"")}</small></div></div>
          ${AMTS.isTeacher()?`<a href="${ROOT}index.html#giang-vien">Trang giảng viên<small>Tiến độ học viên, học phí, nội dung</small></a>`:""}
          ${S.saveErr?`<p class="note bad-t" style="padding:6px 12px">${escH(S.saveErr)}</p>`:""}
          <button type="button" id="btn-out">Đăng xuất</button></div></div>`}
    el.innerHTML=h+`<span class="note bad-t" id="acct-msg" aria-live="polite"></span>`;
    const bi=document.getElementById("btn-in");if(bi)bi.onclick=async()=>{const m=await AMTS.signIn();document.getElementById("acct-msg").textContent=m};
    const bo=document.getElementById("btn-out");if(bo)bo.onclick=async()=>{if(opts.signOut)return opts.signOut();await AMTS.signOut();if(window.renderAll)renderAll();else render()};
    wireMenu("b-bell","m-bell",()=>{const s=seen();subs.forEach(c=>{if(c.status==="open")s[c.id]=1});try{localStorage.setItem("amts-notif-seen",JSON.stringify(s))}catch(e){}});
    wireMenu("b-me","m-me");
    const pr=document.getElementById("nav-practice");if(pr)pr.href=practiceHref();
  }
  return{render,setActive,closeMenus,wireMenu,opts,practiceHref,ROOT};
})();
const closeMenus=TOPNAV.closeMenus,wireMenu=TOPNAV.wireMenu;
/* ================= HIGHLIGHTER ================= */
const KW=new Set("int return void using namespace include char double float bool if else for while do switch case default break continue const constexpr auto class struct true false long short unsigned signed sizeof static_cast".split(" "));
const KW_PY=new Set("False None True and as assert break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield print input len range int str float list dict set tuple".split(" "));
const KW_CS=new Set("int long double float bool char string var void return if else for foreach in while do switch case default break continue const static public private class new true false null using namespace struct List Dictionary HashSet Stack Queue PriorityQueue Console Math Array".split(" "));
function lexPy(src){const out=[];let i=0;const n=src.length;
  while(i<n){const c=src[i],r=src.slice(i);let m;
    if(c==="#"){let j=src.indexOf("\n",i);if(j<0)j=n;out.push(["com",src.slice(i,j)]);i=j;continue}
    if((m=/^[rRfFbBuU]{0,2}("""|'''|"|')/.exec(r))&&(m[0].length===m[1].length||/^[rRfFbBuU]{1,2}$/.test(m[0].slice(0,-m[1].length)))){const q=m[1];let j=i+m[0].length;while(j<n&&!src.startsWith(q,j)&&!(q.length===1&&src[j]==="\n")){if(src[j]==="\\")j++;j++}if(src.startsWith(q,j))j+=q.length;out.push(["str",src.slice(i,j)]);i=j;continue}
    if((m=/^0[xXbBoO][0-9a-fA-F_]+|^\d[\d_]*(\.\d*)?([eE][+-]?\d+)?/.exec(r))){out.push(["num",m[0]]);i+=m[0].length;continue}
    if((m=/^[A-Za-z_\u00C0-\u1EF9][\w\u00C0-\u1EF9]*/.exec(r))){out.push([KW_PY.has(m[0])?"kw":"id",m[0]]);i+=m[0].length;continue}
    if((m=/^(\*\*|\/\/|[{}()\[\];:<>+\-*/%=])/.exec(r))){out.push(["op",m[0]]);i+=m[0].length;continue}
    out.push(["tx",c]);i++}
  return out}
function lex(src,lang){
  if(lang==="py")return lexPy(src);
  const KWX=lang==="cs"?KW_CS:KW;
  const out=[];let i=0;const n=src.length;
  while(i<n){
    const c=src[i],r=src.slice(i);let m;
    if(c==="/"&&src[i+1]==="/"){let j=src.indexOf("\n",i);if(j<0)j=n;out.push(["com",src.slice(i,j)]);i=j;continue}
    if(c==="/"&&src[i+1]==="*"){let j=src.indexOf("*/",i+2);j=j<0?n:j+2;out.push(["com",src.slice(i,j)]);i=j;continue}
    if(c==="#"&&(i===0||/\n\s*$/.test(src.slice(Math.max(0,i-40),i)))){let j=src.indexOf("\n",i);if(j<0)j=n;out.push(["pre",src.slice(i,j)]);i=j;continue}
    if(c==='"'||c==="'"){let j=i+1;while(j<n&&src[j]!==c&&src[j]!=="\n"){if(src[j]==="\\")j++;j++}if(j<n&&src[j]===c)j++;out.push(["str",src.slice(i,j)]);i=j;continue}
    if((m=/^0[xXbB][0-9a-fA-F]+|^\d+(\.\d+)?/.exec(r))){out.push(["num",m[0]]);i+=m[0].length;continue}
    if((m=/^[A-Za-z_]\w*/.exec(r))){out.push([KWX.has(m[0])?"kw":"id",m[0]]);i+=m[0].length;continue}
    if((m=/^(<<|::|[{}();<>+\-*/%=])/.exec(r))){out.push(["op",m[0]]);i+=m[0].length;continue}
    out.push(["tx",c]);i++;
  }
  return out;
}
function highlightLines(src,lang){
  const lines=[""];
  lex(src,lang).forEach(([t,s])=>{
    s.split("\n").forEach((part,k)=>{
      if(k>0)lines.push("");
      if(part)lines[lines.length-1]+=(t==="tx"||t==="id")?esc(part):`<span class="t-${t}">${esc(part)}</span>`;
    });
  });
  return lines;
}/* Trắc nghiệm cuối bài: radio thật, chấm khi bấm "Kiểm tra đáp án"; chưa chấm thì không hiện điểm */
function makeQuiz(boxId,scoreId,QZ){
  /* câu hỏi riêng cho một ngôn ngữ có trường lang ("py" hoặc ["py","cs"]); đổi ngôn ngữ thì làm lại từ đầu */
  const ALLQ=QZ,qOf=()=>ALLQ.filter(q=>!q.lang||[].concat(q.lang).includes(typeof LANG_CUR==="undefined"?"cpp":LANG_CUR));QZ=qOf();
  let qAns=QZ.map(()=>-1);
  document.addEventListener("amts-lang",()=>{QZ=qOf();qAns=QZ.map(()=>-1);graded=false;render()});
  const box=document.getElementById(boxId),score=document.getElementById(scoreId);var graded=false;
  const OK='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
        NO='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  if(score){score.setAttribute("role","status");score.setAttribute("aria-live","polite")}
  function render(){
    box.innerHTML=QZ.map((q,i)=>{const nm=`${boxId}-q${i}`,ok=graded&&qAns[i]===q.a;
      return `<fieldset class="q${graded?(ok?" q-ok":" q-bad"):""}"><legend class="qt">${i+1}. ${q.q}</legend><div class="opts">${q.o.map((o,j)=>{
        let c="",tag="";if(graded){if(j===q.a){c=" right";tag=`<span class="o-tag">${OK}Đáp án đúng</span>`}else if(j===qAns[i]){c=" wrong";tag=`<span class="o-tag">${NO}Bạn chọn</span>`}}
        return `<label class="opt${c}"><input type="radio" name="${nm}" value="${j}"${qAns[i]===j?" checked":""}${graded?" disabled":""}><span class="o-t">${o}</span>${tag}</label>`}).join("")}</div>${graded?`<p class="fb"><b class="${ok?"ok-t":"bad-t"}">${ok?OK+" Chính xác.":NO+" Chưa đúng."}</b> ${q.e}</p>`:""}</fieldset>`}).join("");
    box.querySelectorAll("input[type=radio]").forEach(r=>r.onchange=()=>{const i=+r.name.split("-q").pop();qAns[i]=+r.value;paint()});
    paint();
  }
  function paint(){
    const done=qAns.filter(a=>a>=0).length,sc=qAns.filter((a,i)=>a===QZ[i].a).length;
    if(!score)return;
    if(!graded){
      score.innerHTML=`<span class="qz-st">Đã trả lời ${done}/${QZ.length} câu · Chưa chấm điểm</span><button type="button" class="btn pri qz-check"${done<QZ.length?" disabled":""}>Kiểm tra đáp án</button>${done<QZ.length?`<small class="qz-hint">Trả lời đủ ${QZ.length} câu để chấm.</small>`:""}`;
      const b=score.querySelector(".qz-check");b.onclick=()=>{graded=true;if(window.TRACK)TRACK.quiz(boxId,sc,QZ.length);render();score.querySelector(".qz-again").focus()};
    }else{
      score.innerHTML=`<span class="qz-st"><b>Kết quả: đúng ${sc}/${QZ.length} câu</b>${sc===QZ.length?" · Rất tốt!":""}</span><button type="button" class="btn qz-again">Làm lại</button>`;
      score.querySelector(".qz-again").onclick=()=>{graded=false;qAns.fill(-1);render();const f=box.querySelector("input");if(f)f.focus()};
    }
  }
  render();
}
/* tên phần chương trình chính theo ngôn ngữ (cây lời gọi, thông báo độ sâu) */
function MAIN_NAME(){const l=typeof LANG_CUR!=="undefined"?LANG_CUR:"cpp";return l==="cs"?"Main":l==="py"?"chương trình chính":"main"}
/* ================= ENGINE 2: mini C++ cho Bài 3 trở đi ================= */
const SIZES={char:1,bool:1,short:2,int:4,unsigned:4,float:4,"long long":8,size_t:8,double:8,string:32};
const INTG=new Set(["char","bool","short","int","unsigned","long long","size_t"]);
const isU=t=>t==="unsigned"||t==="size_t";
const isNumT=t=>INTG.has(t)||t==="double"||t==="float";
const isFlT=t=>t==="double"||t==="float";
const TNAME={string:"std::string",cstr:"const char*",ostream:"std::ostream",istream:"std::istream",unsigned:"unsigned int",manip:"manipulator",size_t:"long unsigned int"};
/* ---------- kiểu phức hợp (Chương 6 trở đi) ----------
   mảng "int[5]", "int[3][4]" (chiều ngoài trước), "int[]" (kích thước chưa biết lúc biên dịch: tham số mảng, mảng VLA)
   vector "vector<int>", "vector<vector<int>>"; iterator "iter<int>" (v.begin(), a + n); size_t = số không dấu 64 bit (BigInt) */
const CONT_T=["vector"];
const isVec=t=>typeof t==="string"&&t.startsWith("vector<");
const isArr=t=>typeof t==="string"&&t.endsWith("]");
const isIter=t=>typeof t==="string"&&t.startsWith("iter<");
const isSeq=t=>isVec(t)||isArr(t);
/* con trỏ (Chương 7): kiểu "int*", "double*", "int**"; giá trị lúc chạy {h: ô chứa (mảng, khối heap, hoặc vỏ bọc một biến), k: chỉ số}
   con trỏ null {h:null,k:0}; con trỏ rác (chưa khởi tạo) {h:null,k:0,a:địa_chỉ_rác,bad:true} */
const isPtr=t=>typeof t==="string"&&t.endsWith("*");
/* struct / class: kiểu là "Ten@n" (n phân biệt từng lần biên dịch); định nghĩa nằm trong CLS */
const CLS=new Map();let CLS_UID=0;
const isCls=t=>typeof t==="string"&&/^[A-Za-z_]\w*@\d+$/.test(t);
const clsName=t=>t.slice(0,t.indexOf("@"));
const basesOf=id=>CLS.get(id).bases||[];
/* chính lớp id rồi mọi lớp tổ tiên, duyệt sâu từ trái sang phải, mỗi lớp một lần */
const clsChain=id=>{const L=[],seen=new Set();const go=x=>{if(seen.has(x))return;seen.add(x);L.push(x);for(const b of basesOf(x))go(b.id)};go(id);return L};
/* các lớp cơ sở ảo (kế thừa virtual) của id, theo thứ tự được dựng */
function vbasesOf(id){const R=[];const go=x=>{for(const b of basesOf(x)){go(b.id);if(b.virt&&!R.includes(b.id))R.push(b.id)}};go(id);return R}
/* các phần (subobject) của một đối tượng hoàn chỉnh kiểu id: [{cls, off}], chính nó đứng đầu; lớp cơ sở ảo chỉ có một phần */
function layoutOf(id){const D=CLS.get(id);if(D.lay)return D.lay;const out=[];
  const nv=(x,o)=>{out.push({cls:x,off:o});for(const e of CLS.get(x).nvB||[])nv(e.id,o+e.off)};
  nv(id,0);for(const [v,o] of D.vbOff||[])nv(v,o);
  return D.lay=out}
/* độ lệch của phần lớp cha b bên trong đối tượng kiểu d (con trỏ d* đổi sang b* cộng thêm độ lệch này) */
const baseOff=(d,b)=>{const e=layoutOf(d).find(x=>x.cls===b);return e?e.off:0};
/* đường đi từ lớp d lên lớp cha b: [{from, acc, virt}] */
function basePath(d,b){if(d===b)return[];for(const e of basesOf(d)){const r=basePath(e.id,b);if(r)return[{from:d,acc:e.acc,virt:e.virt}].concat(r)}return null}
/* hàm được gọi khi gọi hàm ảo E trên đối tượng kiểu id (bản ghi đè cuối cùng) */
function finalOver(id,E){const D=CLS.get(id);
  if(E.kind==="dtor")return D.dtorE||{kind:"dtor",name:"~"+D.name,cls:id,virt:true,implicit:true};
  for(const x of clsChain(id)){if(x!==E.cls&&!clsChain(x).includes(E.cls))continue;const L=CLS.get(x).mt&&CLS.get(x).mt.get(E.name);const o=L&&L.find(y=>y.key===E.key&&y.cnst===E.cnst);if(o)return o}return E}
/* bảng hàm ảo (vtable) của lớp id: mỗi ô là một hàm ảo, theo thứ tự khai báo từ lớp gốc; impl là bản được gọi với đối tượng kiểu id.
   fam: với đa kế thừa, phần lớp cha thứ hai trở đi (không phải lớp cha chính) có bảng phụ riêng: các ô của fam, hàm chọn theo id */
function vtableOf(id,fam){
  if(fam&&fam!==id)return vtableOf(fam).map(z=>({k:z.k,impl:finalOver(id,z.impl)}));
  const chain=[];for(let x=id;x;x=CLS.get(x).prim)chain.unshift(x);
  const S=[];for(const x of chain){const X=CLS.get(x);if(!X.mt)continue;
    const L=[...X.mt.values()].flat().concat(X.dtorE?[X.dtorE]:[]).filter(E=>E.virt).sort((a,b)=>a.p-b.p);
    for(const E of L){const k=E.kind==="dtor"?"~":E.name+"("+E.key+")"+(E.cnst?"c":"");const o=S.find(z=>z.k===k);if(o)o.impl=E;else S.push({k,impl:E})}
    const d=!X.dtorE&&S.find(z=>z.k==="~");if(d)d.impl={kind:"dtor",name:"~"+X.name,cls:x,virt:true,implicit:true}}   // hàm hủy tự sinh cũng ghi đè
  return S}
const isBaseOf0=(b,d)=>isCls(b)&&isCls(d)&&clsChain(d).includes(b);
/* đối tượng dạng chữ ngắn: {x = 3, y = 4} */
function objTxt(v,depth){if(depth>2)return "{…}";const one=c=>{if(c.v&&c.v.f)return objTxt(c.v,depth+1);if(!c.init)return "?";const t=c.t;
    if(isPtr(t))return c.v&&(c.v.h||c.v.ad)?"0x…":"nullptr";if(t==="string")return JSON.stringify(c.v);if(t==="char"){const x=((c.v%256)+256)%256;return x>=32&&x<127?`'${String.fromCharCode(x)}'`:String(c.v)}
    if(t==="bool")return c.v?"true":"false";if(isFlT(t))return gfmt(c.v,6);if(c.v&&c.v.a)return `[${c.v.a.length}]`;return llStr(c.v)};
  const parts=[];for(const k in v.f){const c=v.f[k];parts.push(`${c.fname} = ${one(c)}`)}return `{${parts.join(", ")}}`}
const isCont=t=>isSeq(t);
const elemT=t=>isVec(t)?t.slice(7,-1):isArr(t)?t.replace(/\[\d*\]/,""):isIter(t)?t.slice(5,-1):isPtr(t)?t.slice(0,-1):t==="string"?"char":null;
const arrN=t=>{const m=/\[(\d*)\]/.exec(t);return m&&m[1]!==""?+m[1]:null};
const sizeOfT=t=>isArr(t)?(arrN(t)||0)*sizeOfT(elemT(t)):isVec(t)?24:isIter(t)||isPtr(t)?8:isCls(t)?(CLS.get(t).size||1):SIZES[t]||8;
const alignOfT=t=>isArr(t)?alignOfT(elemT(t)):isCls(t)?(CLS.get(t).align||1):Math.min(sizeOfT(t),8);
const tnIn=t=>t==="long long"?"long long int":t==="unsigned"?"unsigned int":tn(t);
function tn(t){if(TNAME[t])return TNAME[t];if(isCls(t))return clsName(t);
  if(isPtr(t))return tnIn(elemT(t))+"*";
  if(t==="nullptr_t")return "std::nullptr_t";
  if(isVec(t)){const x=tnIn(elemT(t));return `std::vector<${x}${x.endsWith(">")?" ":""}>`}
  if(isArr(t)){const m=/^(.*?)((?:\[\d*\])+)$/.exec(t);return `${tnIn(m[1])} ${m[2]}`}
  if(isIter(t))return `__gnu_cxx::__normal_iterator<${tnIn(elemT(t))}*>`;
  return t}
const RANGE={size_t:[0,18446744073709551615],char:[-128,127],short:[-32768,32767],int:[-2147483648,2147483647],unsigned:[0,4294967295],"long long":[-9223372036854775808,9223372036854775807],bool:[0,1]};
const HDRS=["iostream","iomanip","string","cmath","climits","limits","cstdio","vector","algorithm","numeric","utility","cstdlib","functional","cctype","bits/stdc++.h"];
const UNSUP_H=["array","map","set","unordered_map","unordered_set","cstring","ctime","fstream","sstream","stack","queue","deque","list","numeric","memory","bits/stdc++.h","random","chrono","thread","mutex","cassert","iterator","functional","tuple","optional","variant","bitset"];
const STD_UNSUP=new Set(["array","map","set","pair","stol","stod","make_pair","rand","srand","time","exit","getchar","strlen","strcpy","unique_ptr","shared_ptr","thread"]);
class E2 extends Error{constructor(p,msg,vi,kind){super(msg);this.p=p;this.vi=vi;this.kind=kind||"compile"}}
class NeedIn{}
class RunErr{constructor(msg,vi,code){this.msg=msg;this.vi=vi;this.code=code}}
const u8=s=>new TextEncoder().encode(s);

/* long long luôn được lưu bằng BigInt để đúng tuyệt đối 64 bit (Number chỉ chính xác tới 2^53) */
const I64MAX=9223372036854775807n,I64MIN=-9223372036854775808n;
const toBig=v=>typeof v==="bigint"?v:BigInt(Math.trunc(v));
const toNum=v=>typeof v==="bigint"?Number(v):v;
function wrapTo(t,v){
  if(t==="size_t"){if(typeof v!=="bigint"){if(!isFinite(v))return 0n;v=BigInt(Math.trunc(v))}return BigInt.asUintN(64,v)}
  if(typeof v==="bigint"){
    if(t==="long long")return BigInt.asIntN(64,v);
    if(t==="bool")return v!==0n?1:0;
    if(t==="double")return Number(v);
    if(t==="float")return Math.fround(Number(v));
    if(t==="unsigned")return Number(BigInt.asUintN(32,v));
    if(t==="int")return Number(BigInt.asIntN(32,v));
    if(t==="short")return Number(BigInt.asIntN(16,v));
    if(t==="char")return Number(BigInt.asIntN(8,v));
    return Number(v)}
  if(t==="bool")return v?1:0;
  if(t==="double")return +v;
  if(t==="float")return Math.fround(v);
  if(t==="string")return v;
  if(!isFinite(v))return t==="long long"?I64MIN:t==="unsigned"?0:(RANGE[t]?RANGE[t][0]:0);
  v=Math.trunc(v);
  const m=(x,mod)=>((x%mod)+mod)%mod;
  if(t==="char"){const r=m(v,256);return r>=128?r-256:r}
  if(t==="short"){const r=m(v,65536);return r>=32768?r-65536:r}
  if(t==="int"){const r=m(v,4294967296);return r>=2147483648?r-4294967296:r}
  if(t==="unsigned")return m(v,4294967296);
  if(t==="long long")return BigInt.asIntN(64,BigInt(v));
  return v;
}
function promo(a,b){
  if(a==="double"||b==="double")return "double";
  if(a==="float"||b==="float")return "float";
  if(a==="size_t"||b==="size_t")return "size_t";
  if(a==="long long"||b==="long long")return "long long";
  if(a==="unsigned"||b==="unsigned")return "unsigned";
  return "int";
}
function llStr(v){if(typeof v==="bigint")return v.toString();if(v>=9223372036854775000)return "9223372036854775807";if(v<=-9223372036854775000)return "-9223372036854775808";if(Math.abs(v)>Number.MAX_SAFE_INTEGER)return BigInt(v).toString();return String(v)}
function gfmt(v,p){
  if(Number.isNaN(v))return "nan";
  if(!isFinite(v))return v<0?"-inf":"inf";
  if(p<=0)p=1;
  if(v===0)return Object.is(v,-0)?"-0":"0";
  const ex=v.toExponential(Math.min(p-1,100));const e=parseInt(ex.split("e")[1],10);
  if(e<-4||e>=p){let [m,x]=ex.split("e");if(m.includes("."))m=m.replace(/0+$/,"").replace(/\.$/,"");const s=x[0]==="-"?"-":"+";x=x.replace(/^[+-]/,"");return m+"e"+s+x.padStart(2,"0")}
  let f=v.toFixed(Math.min(100,Math.max(0,p-1-e)));
  if(f.includes("."))f=f.replace(/0+$/,"").replace(/\.$/,"");
  return f;
}
function ffmt(v,p){if(Number.isNaN(v))return "nan";if(!isFinite(v))return v<0?"-inf":"inf";return v.toFixed(Math.min(100,Math.max(0,p)))}

/* ---------- lexer ---------- */
const OPS=["<<=",">>=","<<",">>","<=",">=","==","!=","&&","||","++","--","+=","-=","*=","/=","%=","&=","|=","^=","::","->","+","-","*","/","%","<",">","=","!","(",")","{","}","[","]",";",",",".","?",":","&","|","^","~"];
const KWS=new Set("int double float char bool long short unsigned signed void auto const constexpr return if else while for do switch case break continue true false sizeof static_cast using namespace class struct new delete default goto nullptr this public private protected virtual operator friend".split(" "));
const OPN=["+","-","*","/","%","==","!=","<",">","<=",">=","<<",">>","+=","-=","*=","/=","%=","=","!","++","--","[","("];
function lex2(src){
  const toks=[],inc=new Set();let i=0;const n=src.length;
  const escs=(c,p)=>{const M={n:"\n",t:"\t",'"':'"',"'":"'","\\":"\\","0":"\0",r:"\r",a:"\x07"};if(c in M)return M[c];
    throw new E2(p,`unknown escape sequence: '\\${c}'`,`\\${c} không phải ký tự thoát hợp lệ. Dùng \\n, \\t, \\", \\' hoặc \\\\.`)};
  while(i<n){const c=src[i];
    if(/\s/.test(c)){i++;continue}
    if(c==="/"&&src[i+1]==="/"){while(i<n&&src[i]!=="\n")i++;continue}
    if(c==="/"&&src[i+1]==="*"){const j=src.indexOf("*/",i+2);if(j<0)throw new E2(i,"unterminated comment","Chú thích /* chưa có */ để đóng.");i=j+2;continue}
    if(c==="#"){let j=src.indexOf("\n",i);if(j<0)j=n;const d=src.slice(i,j).trim(),m=/^#\s*include\s*<\s*([\w./+]+)\s*>$/.exec(d);
      if(!m)throw new E2(i,/^#\s*include/.test(d)?"#include expects \"FILENAME\" or <FILENAME>":`invalid preprocessing directive ${d.split(/\s/)[0]}`,"Cú pháp đúng: #include <tên_thư_viện>");
      if(!HDRS.includes(m[1])){if(UNSUP_H.includes(m[1]))throw new E2(i,`thư viện <${m[1]}> chưa có trong trình mô phỏng`,`<${m[1]}> là thư viện chuẩn hợp lệ của C++, nhưng trình mô phỏng chưa hỗ trợ. Các thư viện dùng được: ${HDRS.map(x=>"<"+x+">").join(", ")}.`,"unsup");
        throw new E2(i,`${m[1]}: No such file or directory`,`Không tìm thấy thư viện <${m[1]}>. Kiểm tra lại chính tả.`)}
      inc.add(m[1]);i=j;continue}
    if(c==='"'){let j=i+1,s="";while(j<n&&src[j]!=='"'&&src[j]!=="\n"){if(src[j]==="\\"){s+=escs(src[j+1],j);j+=2}else s+=src[j++]}
      if(src[j]!=='"')throw new E2(i,'missing terminating " character',"Chuỗi chưa được đóng. Thêm dấu \" ở cuối, trên cùng một dòng.");
      toks.push({t:"str",v:s,p:i,e:j+1});i=j+1;continue}
    if(c==="'"){let j=i+1,s="";while(j<n&&src[j]!=="'"&&src[j]!=="\n"){if(src[j]==="\\"){s+=escs(src[j+1],j);j+=2}else s+=src[j++]}
      if(src[j]!=="'")throw new E2(i,"missing terminating ' character","Ký tự chưa được đóng bằng dấu nháy đơn '.");
      if(!s.length)throw new E2(i,"empty character constant","Giữa hai dấu ' phải có đúng một ký tự.");
      if([...s].length>1&&u8(s).length===[...s].length&&s.length<=4){let v=0;for(const ch of u8(s))v=v*256+ch;v=wrapTo("int",v);
        toks.push({t:"num",nt:"int",v,p:i,e:j+1,raw:src.slice(i,j+1),mc:true});i=j+1;continue}
      if([...s].length>1)throw new E2(i,"multi-character character constant [-Wmultichar]","Kiểu char chỉ chứa 1 ký tự trong nháy đơn. Văn bản nhiều ký tự dùng nháy kép \"...\" và kiểu std::string.");
      const b=u8(s);if(b.length>1)throw new E2(i,"character too large for enclosing character literal type","Chữ có dấu tiếng Việt chiếm 2–3 byte (UTF-8), không vừa 1 char. Hãy dùng std::string.");
      toks.push({t:"chr",v:wrapTo("char",b[0]),p:i,e:j+1});i=j+1;continue}
    const r=src.slice(i,i+60);let m;
    if((m=/^0([xX][0-9a-fA-F]+|[bB][01]+)(?![\w.])/.exec(r))){let v=BigInt("0"+m[1].toLowerCase());
      if(v>I64MAX)throw new E2(i,"integer constant is too large for its type","Số này vượt quá phạm vi lớn nhất của long long (9 223 372 036 854 775 807).");
      const nt=v>2147483647n?"long long":"int";if(nt==="int")v=Number(v);
      toks.push({t:"num",nt,v,p:i,e:i+m[0].length,raw:m[0]});i+=m[0].length;continue}
    if((m=/^(\d+\.\d*|\.\d+|\d+)([eE][+-]?\d+)?([A-Za-z_]\w*)?/.exec(r))&&/^\.?\d/.test(r)){
      const body=m[1],ex=m[2]||"",suf=(m[3]||"");
      const fl=body.includes(".")||ex;
      if(suf&&!/^(f|F|l|L|u|U|ll|LL|ul|UL|ull|ULL|lu|LU)$/.test(suf))throw new E2(i,`invalid suffix "${suf}" on ${fl?"floating":"integer"} constant`,/^\d/.test(r)&&!fl?"Tên biến không được bắt đầu bằng chữ số.":"Hậu tố số không hợp lệ.");
      let t,v;
      if(fl){v=parseFloat(body+ex);t=/f/i.test(suf)?"float":"double";if(t==="float")v=Math.fround(v)}
      else{
        if(body.length>1&&body[0]==="0"){if(/[89]/.test(body))throw new E2(i,`invalid digit "${body.match(/[89]/)[0]}" in octal constant`,"Số bắt đầu bằng 0 được hiểu là hệ bát phân (cơ số 8), chỉ gồm chữ số 0–7. Bỏ số 0 ở đầu.");v=BigInt("0o"+body.slice(1))}
        else v=BigInt(body);
        if(v>I64MAX)throw new E2(i,"integer constant is too large for its type","Số này vượt quá phạm vi lớn nhất của long long (9 223 372 036 854 775 807).");
        t=/u/i.test(suf)?"unsigned":(/l/i.test(suf)||v>2147483647n)?"long long":"int";
        if(t!=="long long")v=Number(v)}
      toks.push({t:"num",nt:t,v,p:i,e:i+m[0].length,raw:m[0]});i+=m[0].length;continue}
    if((m=/^[A-Za-z_]\w*/.exec(r))){
      const nx=src[i+m[0].length];
      if(nx&&/[^\x00-\x7F]/.test(nx)&&/[\p{L}]/u.test(nx))throw new E2(i+m[0].length,`stray '\\${(u8(nx)[0]).toString(8)}' in program`,"Tên biến không được dùng chữ có dấu tiếng Việt. Viết không dấu, ví dụ diem thay cho điểm.");
      toks.push({t:"id",v:m[0],p:i,e:i+m[0].length});i+=m[0].length;continue}
    const op=OPS.find(o=>src.startsWith(o,i));
    if(op){toks.push({t:"op",v:op,p:i,e:i+op.length});i+=op.length;continue}
    if("“”‘’".includes(c))throw new E2(i,`stray '\\${(u8(c)[0]).toString(8)}' in program`,"Dấu nháy cong (thường do sao chép từ Word hoặc trang web). Hãy gõ lại bằng dấu nháy thẳng \" hoặc '.");
    if(/[\p{L}]/u.test(c))throw new E2(i,`stray '\\${(u8(c)[0]).toString(8)}' in program`,"Tên biến không được dùng chữ có dấu tiếng Việt. Viết không dấu, ví dụ diem thay cho điểm.");
    throw new E2(i,`stray '${c}' in program`,"Ký tự không hợp lệ trong code C++.");
  }
  toks.push({t:"eof",v:"",p:n,e:n});
  return {toks,inc};
}

/* ---------- parser ---------- */
const PREC={"||":10,"&&":20,"|":30,"^":33,"&":36,"==":40,"!=":40,"<":50,"<=":50,">":50,">=":50,"<<":60,">>":60,"+":70,"-":70,"*":80,"/":80,"%":80};
const BASETYPES=["short","int","char","bool","double","float","auto","void","size_t"];
class P2{
  constructor(toks,src){this.t=toks;this.i=0;this.src=src;this.cls=new Map();this.uid=++CLS_UID}
  pk(o=0){return this.t[Math.min(this.i+o,this.t.length-1)]}
  nx(){return this.t[this.i++]}
  is(v,o=0){const k=this.pk(o);return (k.t==="op"||k.t==="id")&&k.v===v}
  desc(k){if(k.t==="eof")return "end of input";if(k.t==="str")return "string constant";if(k.t==="num")return "numeric constant";if(k.t==="chr")return "character constant";return `'${k.v}'${k.t==="op"?" token":""}`}
  prevEnd(){const p=this.t[this.i-1];return p?p.e:0}
  expect(v,vi){if(this.is(v))return this.nx();const k=this.pk();
    if(v===";")throw new E2(this.prevEnd(),`expected ';' before ${this.desc(k)}`,vi||"Thiếu dấu chấm phẩy ; ở cuối câu lệnh (thường là cuối dòng phía trên).");
    throw new E2(k.p,`expected '${v}' before ${this.desc(k)}`,vi||`Thiếu '${v}' ở đây.`)}
  program(){
    const r={using:false,main:null,mainFn:null,items:[],globals:[]};
    try{
    while(this.pk().t!=="eof"){
      if(this.is("using")){this.nx();this.expect("namespace");const s=this.nx();if(s.v!=="std")throw new E2(s.p,`'${s.v}' is not a namespace-name`,"Ở khóa học này chỉ dùng using namespace std;");this.expect(";");r.using=true;continue}
      if(this.is(";")){this.nx();continue}
      if((this.is("struct")||this.is("class"))&&!(this.cls.has(this.pk(1).v)&&!this.is("{",2)&&!this.is(":",2)&&!this.is(";",2))){this.classDef(r);continue}
      if(this.is("template")||this.is("namespace"))throw new E2(this.pk().p,`'${this.pk().v}' chưa có trong trình mô phỏng`,"template và namespace học ở các chương sau. Trình mô phỏng sẽ hỗ trợ khi tới chương đó.","unsup");
      if(this.pk().t==="id"&&this.cls.has(this.pk().v)&&this.is("::",1)){this.outDef(r,null);continue}
      if(this.typeStart()){
        const st=this.pk();const ty=this.type(true);const ps=this.stars();let rr=false;
        if(this.is("&")&&this.pk(1).t==="id"&&(this.is("(",2)||this.pk(1).v==="operator"||(this.cls.has(this.pk(1).v)&&this.is("::",2)))){this.nx();rr=true}
        if(this.pk().t==="id"&&this.cls.has(this.pk().v)&&this.is("::",1)){if(ps.n){ty.t+="*".repeat(ps.n);ty.pc=ty.c;ty.c=false}this.outDef(r,{ty,rr});continue}
        const nm=this.pk();
        if(ps.n&&ty.t==="void")throw new E2(ty.p,"con trỏ void* chưa hỗ trợ","Trình mô phỏng hỗ trợ con trỏ tới số, ký tự, chuỗi và con trỏ khác (int*, double*, int**…).","unsup");
        if(nm.v==="operator"||(nm.t==="id"&&!KWS.has(nm.v)&&this.is("(",1)&&!(isVec(ty.t)&&!this.is(")",2)&&!this.typeStart(2)))){
          if(ps.n){ty.t+="*".repeat(ps.n);ty.pc=ty.c;ty.c=false}
          if(nm.v==="operator"){nm.v=this.fnName();this.expect("(")}else{this.nx();this.nx()}
          if(nm.v==="main"){
            if(ty.t!=="int"||rr)throw new E2(nm.p,"'::main' must return 'int'","Hàm main phải có kiểu trả về int.");
            if(this.is("void"))this.nx();this.expect(")");this.expect("{","Thân hàm phải nằm trong cặp ngoặc nhọn { }.");
            let body;try{body=this.block()}catch(x){if(x instanceof E2&&x.fn===undefined)x.fn="int main()";throw x}
            const Fn={k:"fn",name:"main",ret:"int",params:[],body,p:nm.p,e:this.t[this.i-1].p,main:true};
            r.main=body;r.mainFn=Fn;r.items.push(Fn);continue}
          const params=this.params();
          const sig=`${tn(ty.t)} ${nm.v}(${params.map(P=>(P.c&&P.ref?"const ":"")+tn(P.t)+(P.ref?"&":"")).join(", ")})`;
          if(this.is(";")){this.nx();r.items.push({k:"fn",name:nm.v,ret:ty.t,rty:ty,params,p:nm.p,proto:true,rref:rr});continue}
          if(!this.is("{")){const k=this.pk();throw new E2(this.prevEnd(),`expected ';' or '{' before ${this.desc(k)}`,"Sau danh sách tham số: viết dấu ; nếu chỉ khai báo nguyên mẫu, hoặc { ... } để viết thân hàm.")}
          this.nx();let body;try{body=this.block()}catch(x){if(x instanceof E2&&x.fn===undefined)x.fn=sig;throw x}
          r.items.push({k:"fn",name:nm.v,ret:ty.t,rty:ty,params,body,p:nm.p,e:this.t[this.i-1].p,rref:rr});continue}
        if(ty.t==="void")throw new E2(ty.p,"variable or field declared void","void chỉ dùng làm kiểu trả về của hàm (hàm không trả về gì), không dùng để khai báo biến.");
        if(this.is("&"))throw new E2(this.pk().p,"biến tham chiếu toàn cục chưa hỗ trợ","Trình mô phỏng hỗ trợ tham chiếu ở tham số hàm.");
        const s=this.declRest(ty,st,ps);s.g=true;r.items.push({k:"gdecl",s});r.globals.push(s);continue}
      const k=this.pk();
      throw new E2(k.p,k.t==="id"&&!KWS.has(k.v)?`'${k.v}' does not name a type`:`expected unqualified-id before ${this.desc(k)}`,"Câu lệnh phải nằm bên trong thân một hàm (ví dụ trong main). Bên ngoài hàm chỉ được khai báo biến, hằng hoặc hàm.");
    }
    }catch(x){if(x instanceof E2&&x.fn===undefined)x.fn="";throw x}
    if(!r.main){const mm=r.items.find(f=>f.k==="fn"&&/^main$/i.test(f.name));
      throw new E2(-1,"undefined reference to `main'",mm?`Không tìm thấy hàm main. Bạn viết “${mm.name}”, nhưng C++ phân biệt chữ hoa và chữ thường.`:"Không tìm thấy hàm main. Mọi chương trình cần có int main() { ... }.","link")}
    return r;
  }
  /* dấu * sau kiểu: int* p, int **pp, int* const p (con trỏ hằng) */
  stars(){let n=0,c=false;while(this.is("*")){this.nx();n++;if(this.is("const")){this.nx();c=true}}
    return{n,c}}
  /* tên hàm: tên thường hoặc operator+ , operator<< , operator[] ... */
  fnName(){const k=this.nx();if(k.v!=="operator")return k.v;const o=this.nx();
    if(o.t!=="op"||!OPN.includes(o.v))throw new E2(o.p,`expected type-specifier before ${this.desc(o)}`,"Sau operator phải là một toán tử, ví dụ operator+ hoặc operator<<.");
    if(o.v==="["){this.expect("]");return "operator[]"}if(o.v==="("){this.expect(")");return "operator()"}return "operator"+o.v}
  /* phần sau danh sách tham số: thân { }, dấu ; (nguyên mẫu) hoặc = default; */
  fnTail(F){if(this.is("{")){this.nx();try{F.body=this.block()}catch(x){if(x instanceof E2&&x.fn===undefined)x.fn=(F.cls||F.ocls?clsName(F.cls||F.ocls)+"::":"")+F.name+"(...)";throw x}F.e=this.t[this.i-1].p;return}
    if(this.is("=")&&this.pk(1).v==="default"){this.nx();this.nx();this.expect(";");F.body=[];F.dflt=true;F.e=this.prevEnd();return}
    if(this.is(";")){this.nx();F.body=null;return}
    const k=this.pk();throw new E2(this.prevEnd(),`expected ';' or '{' before ${this.desc(k)}`,"Sau danh sách tham số: viết dấu ; nếu chỉ khai báo, hoặc { ... } để viết thân hàm.")}
  /* danh sách khởi tạo thành viên của hàm tạo:  : x(a), y{b}, Base(c) */
  memInits(){this.nx();const L=[];for(;;){const k=this.nx();if(k.t!=="id")throw new E2(k.p,`expected identifier before ${this.desc(k)}`,"Sau dấu : của hàm tạo là danh sách thành_viên(giá_trị), cách nhau bằng dấu phẩy.");
      let args=[],br=false;if(this.is("(")){this.nx();args=this.is(")")?[]:this.args0();this.expect(")")}else if(this.is("{")){br=true;args=this.ilist().items}else throw new E2(this.pk().p,`expected '(' before ${this.desc(this.pk())}`,`Khởi tạo thành viên viết ${k.v}(giá_trị).`);
      L.push({name:k.v,p:k.p,args,br});if(this.is(",")){this.nx();continue}break}return L}
  /* struct Ten { ... };  class Ten : public Cha { ... }; */
  classDef(r){const kw=this.nx(),nm=this.nx();
    if(nm.t!=="id"||KWS.has(nm.v))throw new E2(nm.p,`expected identifier before ${this.desc(nm)}`,`Sau ${kw.v} phải là tên kiểu, ví dụ ${kw.v} Diem { ... };`);
    if(this.is(";")){this.nx();if(!this.cls.has(nm.v))this.cls.set(nm.v,nm.v+"@"+this.uid);return}
    const old=this.cls.get(nm.v);if(old&&CLS.has(old)&&CLS.get(old).done)throw new E2(nm.p,`redefinition of '${kw.v} ${nm.v}'`,`Kiểu ${nm.v} đã được định nghĩa ở trên. Mỗi kiểu chỉ định nghĩa một lần.`);
    const id=old||nm.v+"@"+this.uid;this.cls.set(nm.v,id);
    const D={id,name:nm.v,kind:kw.v,base:null,bacc:null,bases:[],decls:[],methods:[],ctors:[],dtor:null,friends:new Set(),p:nm.p};CLS.set(id,D);
    if(this.is(":")){this.nx();
      for(;;){let acc=kw.v==="class"?"private":"public",virt=false;
        for(;;){if(["public","private","protected"].includes(this.pk().v)){acc=this.nx().v;continue}if(this.is("virtual")){this.nx();virt=true;continue}break}
        const b=this.nx();if(!this.cls.has(b.v))throw new E2(b.p,`expected class-name before ${this.desc(b)}`,`${b.v} chưa phải là một kiểu đã định nghĩa. Lớp cha phải được định nghĩa phía trên lớp con.`);
        const bid=this.cls.get(b.v);if(D.bases.some(x=>x.id===bid))throw new E2(b.p,`duplicate base type '${b.v}' invalid`,`${b.v} đã có trong danh sách lớp cha. Mỗi lớp cha chỉ ghi một lần.`);
        D.bases.push({id:bid,acc,virt,p:b.p});if(this.is(",")){this.nx();continue}break}
      D.base=D.bases[0].id;D.bacc=D.bases[0].acc;D.bp=D.bases[0].p}
    if(!this.is("{")){const k=this.pk();throw new E2(k.p,`expected '{' before ${this.desc(k)}`,`Định nghĩa ${kw.v} viết: ${kw.v} ${nm.v} { các thành viên };`)}
    this.nx();let acc=kw.v==="class"?"private":"public";
    while(!this.is("}")){const k=this.pk();
      if(k.t==="eof")throw new E2(this.src.length,"expected '}' at end of input",`Thiếu dấu } đóng định nghĩa ${kw.v} ${nm.v}.`);
      if(["public","private","protected"].includes(k.v)){this.nx();this.expect(":",`Sau ${k.v} phải có dấu hai chấm: ${k.v}:`);acc=k.v;continue}
      if(this.is(";")){this.nx();continue}
      if(this.is("static"))throw new E2(k.p,"thành viên static chưa hỗ trợ","Trình mô phỏng chưa hỗ trợ thành viên static của lớp. Có thể dùng biến toàn cục thay thế.","unsup");
      if(["using","typedef","enum","struct","class","template"].includes(k.v))throw new E2(k.p,`'${k.v}' bên trong ${kw.v} chưa hỗ trợ`,"Trình mô phỏng hỗ trợ thành viên dữ liệu, hàm thành viên, hàm tạo, hàm hủy và toán tử.","unsup");
      let virt=false,friend=false;
      if(this.is("friend")){this.nx();friend=true;if(this.is("class")||this.is("struct"))throw new E2(k.p,"friend class chưa hỗ trợ","Trình mô phỏng hỗ trợ hàm friend (ví dụ operator<<).","unsup")}
      if(this.is("virtual")){this.nx();virt=true}
      if(this.is("~")){const tp=this.nx().p,d=this.nx();if(d.v!==nm.v)throw new E2(d.p,`declaration of '~${d.v}' as member of '${nm.v}'`,`Hàm hủy phải trùng tên lớp: ~${nm.v}().`);
        this.expect("(");this.expect(")","Hàm hủy không có tham số: ~"+nm.v+"()");
        if(D.dtor)throw new E2(tp,`'${nm.v}::~${nm.v}()' cannot be overloaded`,"Mỗi lớp chỉ có một hàm hủy.");
        const F={k:"fn",kind:"dtor",name:"~"+nm.v,ret:"void",params:[],cls:id,acc,virt,p:tp};this.fnTail(F);D.dtor=F;continue}
      if(k.v===nm.v&&this.is("(",1)){this.nx();this.nx();const params=this.params();
        const F={k:"fn",kind:"ctor",name:nm.v,ret:"void",params,cls:id,acc,p:k.p,inits:[]};if(this.is(":"))F.inits=this.memInits();this.fnTail(F);D.ctors.push(F);continue}
      if(!this.typeStart())throw new E2(k.p,k.t==="id"&&!KWS.has(k.v)?`'${k.v}' does not name a type`:`expected unqualified-id before ${this.desc(k)}`,`Trong ${kw.v} chỉ khai báo thành viên: kiểu + tên (dữ liệu), hàm thành viên, hàm tạo ${nm.v}(...), hàm hủy ~${nm.v}().`);
      const st=this.pk(),ty=this.type(true),ps=this.stars();let rr=false;if(this.is("&")){this.nx();rr=true}
      const n1=this.pk();
      if(n1.v==="operator"||(n1.t==="id"&&this.is("(",1))){const name=this.fnName();this.expect("(");const params=this.params();
        const F={k:"fn",kind:"method",name,ret:ty.t+"*".repeat(ps.n),rty:ty,rref:rr,params,cls:id,acc,virt,p:n1.p,cnst:false};
        if(ps.n){F.rty=Object.assign({},ty,{t:F.ret,pc:ty.c,c:false})}
        if(this.is("const")){this.nx();F.cnst=true}
        if(this.is("override")){this.nx();F.ovr=true}
        if(friend){delete F.cls;delete F.acc;F.kind="fn";F.friendOf=id;D.friends.add(name);this.fnTail(F);if(!F.body)F.proto=true;r.items.push(F);continue}
        if(this.is("=")&&this.pk(1).t==="num"&&Number(this.pk(1).v)===0){this.nx();this.nx();this.expect(";");F.pure=true;F.body=null;F.virt=true;D.methods.push(F);continue}
        this.fnTail(F);D.methods.push(F);continue}
      if(friend)throw new E2(n1.p,"friend chỉ dùng với hàm","friend đặt trước khai báo hàm, ví dụ friend ostream& operator<<(ostream& os, const Diem& d);");
      if(rr)throw new E2(n1.p,"thành viên kiểu tham chiếu chưa hỗ trợ","Hãy dùng thành viên kiểu giá trị hoặc con trỏ.","unsup");
      if(virt)throw new E2(n1.p,"'virtual' chỉ dùng với hàm thành viên","virtual đặt trước khai báo hàm thành viên.");
      const d=this.declRest(ty,st,ps);D.decls.push({d,acc})}
    D.e=this.nx().p;
    if(!this.is(";")){const k=this.pk();throw new E2(this.prevEnd(),`expected ';' after ${kw.v} definition`,`Định nghĩa ${kw.v} phải kết thúc bằng dấu chấm phẩy sau dấu }: ${kw.v} ${nm.v} { ... };`)}
    this.nx();D.done=true;r.items.push({k:"class",D,p:nm.p})}
  /* định nghĩa ngoài lớp: Ten::Ten(...) : ... { }   Ten::~Ten() { }   kieu Ten::ham(...) const { } */
  outDef(r,pre){const cn=this.nx();this.nx();const id=this.cls.get(cn.v);
    if(!pre){
      if(this.is("~")){const tp=this.nx().p,d=this.nx();if(d.v!==cn.v)throw new E2(d.p,`declaration of '~${d.v}' as member of '${cn.v}'`,`Hàm hủy phải trùng tên lớp: ~${cn.v}().`);this.expect("(");this.expect(")");
        const F={k:"fn",kind:"dtor",name:"~"+cn.v,ret:"void",params:[],ocls:id,p:tp};this.fnTail(F);r.items.push(F);return}
      const k=this.pk();if(k.v!==cn.v||!this.is("(",1))throw new E2(k.p,`'${k.v}' does not name a type`,`Định nghĩa hàm thành viên ngoài lớp phải ghi kiểu trả về: kieu ${cn.v}::${k.v}(...).`);
      this.nx();this.nx();const params=this.params();const F={k:"fn",kind:"ctor",name:cn.v,ret:"void",params,ocls:id,p:k.p,inits:[]};if(this.is(":"))F.inits=this.memInits();this.fnTail(F);r.items.push(F);return}
    const n1=this.pk();const name=this.fnName();this.expect("(");const params=this.params();
    const F={k:"fn",kind:"method",name,ret:pre.ty.t,rty:pre.ty,rref:pre.rr,params,ocls:id,p:n1.p,cnst:false};
    if(this.is("const")){this.nx();F.cnst=true}
    this.fnTail(F);r.items.push(F)}
  params(){const ps=[];if(this.is(")")){this.nx();return ps}
    if(this.is("void")&&this.is(")",1)){this.nx();this.nx();return ps}
    for(;;){const st=this.pk();
      if(!this.typeStart())throw new E2(st.p,st.t==="id"&&!KWS.has(st.v)?`'${st.v}' has not been declared`:`expected type-specifier before ${this.desc(st)}`,"Mỗi tham số phải ghi kiểu dữ liệu ngay trước tên, ví dụ (int a, int b). Không viết gộp (int a, b) như khi khai báo biến.");
      const ty=this.type();const pst=this.stars();let ref=false;
      if(pst.n){if(ty.t==="void")throw new E2(ty.p,"con trỏ void* chưa hỗ trợ","Trình mô phỏng hỗ trợ con trỏ tới số, ký tự và con trỏ khác.","unsup");ty.t+="*".repeat(pst.n);ty.pc=ty.c;ty.c=pst.c}
      if(this.is("&")){this.nx();ref=true}
      else if(this.is("&&"))throw new E2(this.pk().p,"tham chiếu && chưa hỗ trợ","Khóa học dùng tham chiếu & thường. Tham chiếu && (rvalue) học ở chương C++ hiện đại.");
      let name=null;const np=this.pk().p;
      if(this.pk().t==="id"&&!KWS.has(this.pk().v))name=this.nx().v;
      let adims=null;if(this.is("[")){adims=[];while(this.is("[")){const bp=this.nx().p;adims.push(this.is("]")?null:this.assign());this.expect("]")}}
      let def=null;if(this.is("=")){this.nx();def=this.assign()}
      ps.push({t:ty.t,c:ty.c,pc:!!ty.pc,ref,name,p:name?np:ty.p,def,ty,adims});
      if(this.is(",")){this.nx();continue}
      this.expect(")","Thiếu dấu ) đóng danh sách tham số, hoặc thiếu dấu phẩy giữa hai tham số.");break}
    return ps}
  block(){const st=[];while(!this.is("}")){if(this.pk().t==="eof")throw new E2(this.src.length,"expected '}' at end of input","Thiếu dấu } đóng thân hàm (hoặc một khối { } bên trong chưa được đóng). Mỗi { phải có một } tương ứng.");const s=this.stmt();if(s)st.push(s)}this.nx();return st}
  typeStart(o=0){const k=this.pk(o);if(k.t!=="id")return false;
    if(["const","constexpr","unsigned","signed","long",...BASETYPES].includes(k.v))return true;
    if(this.cls.has(k.v))return !this.is("(",o+1)&&!this.is("::",o+1)&&!this.is("{",o+1);
    if((k.v==="struct"||k.v==="class")&&this.cls.has(this.pk(o+1).v))return true;
    if(k.v==="ostream"||k.v==="istream")return true;
    if(k.v==="std"&&this.is("::",o+1)&&["ostream","istream"].includes(this.pk(o+2).v))return true;
    if(k.v==="string")return this.pk(o+1).t==="id";
    if(k.v==="std"&&this.is("::",o+1)&&this.pk(o+2).v==="string")return true;
    if(CONT_T.includes(k.v)&&this.is("<",o+1))return true;
    if(k.v==="std"&&this.is("::",o+1)&&CONT_T.includes(this.pk(o+2).v)&&this.is("<",o+3))return true;
    return false}
  /* đóng danh sách tham số mẫu: ">" hoặc nửa đầu của ">>" (vector<vector<int>>) */
  closeAngle(){const k=this.pk();if(this.is(">")){this.nx();return}
    if(k.t==="op"&&(k.v===">>"||k.v===">="||k.v===">>=")){k.v=k.v.slice(1);k.p+=1;return}
    throw new E2(k.p,`expected '>' before ${this.desc(k)}`,"Thiếu dấu > đóng kiểu mẫu, ví dụ vector<int>.")}
  tmpl(nm){this.expect("<",`Sau ${nm} phải có kiểu phần tử trong ngoặc nhọn, ví dụ ${nm}<int>.`);const args=[];
    for(;;){if(!this.typeStart()&&!this.is("string")&&!(this.is("std")&&this.pk(2).v==="string")){const k=this.pk();throw new E2(k.p,`template argument 1 is invalid`,`Trong ${nm}<...> phải là một kiểu dữ liệu, ví dụ ${nm}<int>.`)}
      const a=this.type();if(a.c)throw new E2(a.p,`'const' trong ${nm}<...> chưa hỗ trợ`,"Bỏ const ở kiểu phần tử.","unsup");while(this.is("*")){this.nx();a.t+="*"}args.push(a.t);
      if(this.is(",")){this.nx();continue}break}
    this.closeAngle();
    if(nm==="vector"&&args.length!==1)throw new E2(this.pk().p,"wrong number of template arguments","vector chỉ nhận một kiểu phần tử: vector<int>.");
    return `${nm}<${args.join(",")}>`}
  type(allowVoid){const p=this.pk().p;let c=false,ce=false,u=null,lg=0,base=null,needStd=false;
    for(;;){const k=this.pk();if(k.t!=="id")break;
      if(k.v==="const"){c=true;this.nx();continue}
      if(k.v==="constexpr"){c=true;ce=true;this.nx();continue}
      if(k.v==="unsigned"||k.v==="signed"){u=k.v;this.nx();continue}
      if(k.v==="long"){lg++;this.nx();continue}
      if((k.v==="struct"||k.v==="class")&&!base&&this.cls.has(this.pk(1).v)){this.nx();continue}
      if(this.cls.has(k.v)&&!base){base=this.cls.get(k.v);this.nx();continue}
      if((k.v==="ostream"||k.v==="istream")&&!base){base=k.v;needStd=k.v;this.nx();continue}
      if(k.v==="std"&&this.is("::",1)&&["ostream","istream"].includes(this.pk(2).v)&&!base){this.nx();this.nx();base=this.nx().v;continue}
      if(BASETYPES.includes(k.v)&&!base){base=k.v;this.nx();continue}
      if(k.v==="std"&&this.is("::",1)&&["string","streamsize"].includes(this.pk(2).v)&&!base){this.nx();this.nx();base=this.nx().v;continue}
      if((k.v==="string"||k.v==="streamsize")&&!base){base=k.v;needStd=k.v;this.nx();continue}
      if(CONT_T.includes(k.v)&&!base&&this.is("<",1)){this.nx();base=this.tmpl(k.v);needStd=k.v;continue}
      if(k.v==="std"&&this.is("::",1)&&CONT_T.includes(this.pk(2).v)&&!base){this.nx();this.nx();const nm=this.nx().v;base=this.tmpl(nm);continue}
      break}
    if(!base&&!u&&!lg){const k=this.pk();throw new E2(k.p,`expected type-specifier before ${this.desc(k)}`,"Ở đây cần một kiểu dữ liệu như int, double...")}
    if(!base)base="int";
    let t=base;
    if(base==="streamsize")t="long long";
    if(lg&&base==="int")t="long long";
    if(base==="void"&&!allowVoid)throw new E2(p,"variable or field declared void","void nghĩa là “không có kiểu”, chỉ dùng làm kiểu trả về của hàm, không dùng để khai báo biến.");
    if(u==="unsigned"){if(base==="int")t="unsigned";else throw new E2(p,`unsigned ${base} chưa hỗ trợ`,"Trình mô phỏng hỗ trợ unsigned int.")}
    return{t,c,ce,p,needStd};
  }
  stmt(){
    const k=this.pk();
    if(this.is("{")){this.nx();const body=[];while(!this.is("}")){if(this.pk().t==="eof")throw new E2(this.src.length,"expected '}' at end of input","Thiếu dấu } đóng khối lệnh. Mỗi { phải có một } tương ứng.");body.push(this.stmt())}const e=this.nx();return{k:"block",body,p:k.p,e:e.p}}
    if(this.is(";")){this.nx();return{k:"empty",p:k.p}}
    const paren=(kw)=>{if(!this.is("("))throw new E2(this.pk().p,`expected '(' before ${this.desc(this.pk())}`,`Điều kiện của ${kw} phải đặt trong ngoặc tròn: ${kw} (điều_kiện)`);this.nx();const c=this.expr();this.expect(")",`Thiếu dấu ) đóng điều kiện của ${kw}.`);return c};
    if(this.is("if")){this.nx();const c=paren("if");const th=this.stmt();let el=null,ep=null;if(this.is("else")){ep=this.nx().p;el=this.stmt()}return{k:"if",c,th,el,ep,p:k.p}}
    if(this.is("else"))throw new E2(k.p,"'else' without a previous 'if'","else phải đứng ngay sau thân của một if. Kiểm tra: có dấu ; thừa sau if (...) không, hoặc thân if nhiều lệnh mà thiếu { }?");
    if(this.is("while")){this.nx();const c=paren("while");const body=this.stmt();return{k:"while",c,body,p:k.p}}
    if(this.is("do")){this.nx();const body=this.stmt();if(!this.is("while"))throw new E2(this.pk().p,`expected 'while' before ${this.desc(this.pk())}`,"Vòng lặp do phải kết thúc bằng: while (điều_kiện);");const wp=this.nx().p;const c=paren("while");this.expect(";","Sau while (...) của vòng do-while phải có dấu chấm phẩy ;");return{k:"do",c,body,p:k.p,cp:wp}}
    if(this.is("for")){this.nx();this.expect("(","Cú pháp: for (khởi_tạo; điều_kiện; bước_nhảy)");
      if(this.typeStart()){const save=this.i;let ty=this.type();let ref=false;if(this.is("*")){ty=Object.assign({},ty);while(this.is("*")){this.nx();ty.t+="*"}}if(this.is("&")){this.nx();ref=true}
        const nm=this.pk();if(nm.t==="id"&&!KWS.has(nm.v)&&this.is(":",1)){this.nx();this.nx();const e=this.expr();this.expect(")");const body=this.stmt();
          return{k:"rfor",ty,ref,name:nm.v,np:nm.p,e,body,p:k.p}}
        this.i=save}
      let init=null;if(this.is(";"))this.nx();else if(this.typeStart())init=this.stmt();else{const ip=this.pk().p;const e=this.expr();this.expect(";","Trong for (...), các phần cách nhau bằng dấu chấm phẩy ;");init={k:"expr",e,p:ip}}
      let c=null;if(!this.is(";"))c=this.expr();this.expect(";","Trong for (...), các phần cách nhau bằng dấu chấm phẩy ; (không phải dấu phẩy).");
      let step=null,sp=this.pk().p;if(!this.is(")"))step=this.expr();this.expect(")");const body=this.stmt();return{k:"for",init,c,step,sp,body,p:k.p}}
    if(this.is("switch")){this.nx();const e=paren("switch");this.expect("{","Thân switch phải nằm trong { }.");const items=[];
      while(!this.is("}")){if(this.pk().t==="eof")throw new E2(this.src.length,"expected '}' at end of input","Thiếu dấu } đóng switch.");
        if(this.is("case")){const cp=this.nx().p;const v=this.bin(1);if(!this.is(":"))throw new E2(this.prevEnd(),`expected ':' before ${this.desc(this.pk())}`,"Sau giá trị case phải có dấu hai chấm : (ví dụ case 1:).");this.nx();items.push({k:"case",v,p:cp});continue}
        if(this.is("default")){const dp=this.nx().p;this.expect(":","Sau default phải có dấu hai chấm :");items.push({k:"default",p:dp});continue}
        items.push({k:"stmt",s:this.stmt()})}
      this.nx();return{k:"switch",e,items,p:k.p}}
    if(this.is("case")||this.is("default"))throw new E2(k.p,`case label not within a switch statement`,`${k.v} chỉ dùng bên trong switch (...) { }.`);
    if(this.is("break")){this.nx();this.expect(";");return{k:"break",p:k.p}}
    if(this.is("continue")){this.nx();this.expect(";");return{k:"continue",p:k.p}}
    if(this.is("return")){this.nx();const e=this.is(";")?null:this.expr();this.expect(";");return{k:"ret",e,p:k.p}}
    if(this.is("void")&&this.pk(1).t==="id"&&this.is("(",2))throw new E2(this.pk(1).p,"a function-definition is not allowed here before '{' token","Không được viết hàm bên trong một hàm khác (kể cả bên trong main). Hãy chuyển cả hàm ra ngoài, đặt phía trên main.");
    if(this.is("static")){const sk=this.nx();if(!this.typeStart())throw new E2(sk.p,"static chỉ dùng trước một khai báo biến","Biến static cục bộ: static int dem = 0; (khởi tạo một lần, sống suốt chương trình).");
      const ty=this.type();if(this.is("&")||this.is("*"))throw new E2(this.pk().p,"static với con trỏ hoặc tham chiếu chưa hỗ trợ","Trình mô phỏng hỗ trợ static cho biến số, ký tự, chuỗi và mảng.","unsup");
      const d=this.declRest(ty,k);d.st=true;return d}
    if(this.typeStart()){const ty=this.type();
      if(this.is("&")){this.nx();const d=this.declRest(ty,k);d.ref=true;return d}
      if(this.is("*")){let j=0;while(this.is("*",j)||this.is("const",j))j++;
        if(this.is("&",j)){const ps=this.stars();this.nx();const d=this.declRest(ty,k,ps);d.ref=true;return d}}
      return this.declRest(ty,k)}
    const e=this.expr();this.expect(";");return{k:"expr",e,p:k.p}
  }
  declRest(ty,k,first){const items=[];
      for(;;){const ps=first&&!items.length?first:this.stars();
        if(ps.n&&ty.t==="void")throw new E2(ty.p,"con trỏ void* chưa hỗ trợ","Trình mô phỏng hỗ trợ con trỏ tới số, ký tự và con trỏ khác.","unsup");
        const nm=this.pk();
        if(nm.t!=="id"||KWS.has(nm.v))throw new E2(nm.p,`expected unqualified-id before ${this.desc(nm)}`,nm.t==="num"?"Tên biến không được bắt đầu bằng chữ số.":KWS.has(nm.v)?`“${nm.v}” là từ khóa của C++, không dùng làm tên biến được.`:"Sau kiểu dữ liệu phải là tên biến.");
        this.nx();
        let dims=null;if(this.is("[")){dims=[];while(this.is("[")){const bp=this.nx().p;dims.push(this.is("]")?null:this.assign());this.expect("]","Thiếu dấu ] đóng kích thước mảng.")}}
        if(this.is("(")&&(this.typeStart(1)||(this.is(")",1)&&this.is("{",2))))throw new E2(nm.p,"a function-definition is not allowed here before '{' token","Không được viết hàm bên trong một hàm khác (kể cả bên trong main). Hãy chuyển cả hàm ra ngoài, đặt phía trên main.");
        const many=dims||isCont(ty.t)||(isCls(ty.t)&&!ps.n);let init=null;
        if(this.is("=")){this.nx();if(this.is("{")){const L=this.ilist();init=many?{s:"={}",list:L}:{s:"=",e:L}}else init={s:"=",e:this.assign()}}
        else if(this.is("{")){const L=this.ilist();
          if(many)init={s:"{}",list:L};
          else{if(L.items.length>1)throw new E2(L.items[1].p,`scalar object '${nm.v}' requires one element in initializer`,"Biến đơn chỉ nhận một giá trị trong { }.");if(L.items.length&&L.items[0].k==="ilist")throw new E2(L.p,"braces around scalar initializer","Biến đơn không dùng { } lồng nhau.");init={s:"{}",e:L.items.length?L.items[0]:null}}}
        else if(this.is("(")){const op=this.nx();const a=this.is(")")?[]:this.args0();this.expect(")");
          if(many||ty.t==="string")init={s:"()",args:a,p:op.p};else{if(a.length!==1)throw new E2(op.p,`expression list treated as compound expression in initializer [-fpermissive]`,"Biến đơn chỉ nhận một giá trị trong ( ).");init={s:"()",e:a[0]}}}
        items.push({name:nm.v,p:nm.p,init,dims,ptr:ps.n,pconst:ps.c});
        if(this.is(",")){this.nx();continue}
        break}
      if(!this.is(";")){const nk=this.pk();
        const newLine=this.src.slice(this.prevEnd(),nk.p).includes("\n");
        if(newLine||nk.t==="eof"||(nk.t==="id"&&KWS.has(nk.v)))throw new E2(this.prevEnd(),`expected ',' or ';' before ${this.desc(nk)}`,"Thiếu dấu chấm phẩy ; ở cuối dòng khai báo.");
        if(nk.t==="id")throw new E2(nk.p,`expected initializer before '${nk.v}'`,"Tên biến không được chứa dấu cách. Viết liền kiểu soLuong hoặc dùng gạch dưới so_luong.");
        if(nk.t==="op"&&nk.v==="-")throw new E2(nk.p,"expected initializer before '-' token","Tên biến không được chứa dấu gạch ngang -. Dùng gạch dưới _ thay thế.");
        if(nk.t==="op"&&!items[items.length-1].init&&!["(","{","=",";",","].includes(nk.v))throw new E2(nk.p,`expected initializer before '${nk.v}' token`,"Sau tên biến chỉ được là dấu =, { }, dấu phẩy hoặc dấu chấm phẩy. Nếu đây là vòng for, ba phần trong ngoặc phải cách nhau bằng dấu chấm phẩy ;, không phải dấu phẩy.");
        this.expect(";")}
      this.nx();return{k:"decl",ty,items,p:k.p}}
  expr(){return this.assign()}
  args0(){const a=[];for(;;){a.push(this.is("{")?this.ilist():this.assign());if(this.is(",")){this.nx();continue}break}return a}
  /* danh sách khởi tạo { 1, 2, {3, 4} } */
  ilist(){const op=this.expect("{");const items=[];
    while(!this.is("}")){items.push(this.is("{")?this.ilist():this.assign());if(this.is(",")){this.nx();continue}
      if(!this.is("}")){const k=this.pk();throw new E2(this.prevEnd(),`expected '}' before ${this.desc(k)}`,"Các giá trị trong { } cách nhau bằng dấu phẩy, đóng bằng }.")}}
    this.nx();return{k:"ilist",items,p:op.p}}
  assign(){const L=this.cond();const k=this.pk();
    if(k.t==="op"&&["=","+=","-=","*=","/=","%=","&=","|=","^=","<<=",">>="].includes(k.v)){this.nx();return{k:"as",op:k.v,a:L,b:this.assign(),p:k.p}}
    return L}
  bin(min){let L=this.un();
    for(;;){const k=this.pk();const pr=k.t==="op"?PREC[k.v]:0;if(!pr||pr<min)break;this.nx();const R=this.bin(pr+1);L={k:"bin",op:k.v,a:L,b:R,p:k.p}}
    return L}
  isCastAt(o){const k=this.pk(o);return k.t==="id"&&["int","double","float","char","bool","long","short","unsigned","signed"].includes(k.v)}
  cond(){const c=this.bin(1);if(!this.is("?"))return c;const q=this.nx();const a=this.assign();
    if(!this.is(":")){const k=this.pk();throw new E2(k.p,`expected ':' before ${this.desc(k)}`,"Toán tử điều kiện cần đủ ba phần: điều_kiện ? giá_trị_khi_đúng : giá_trị_khi_sai")}
    this.nx();const b=this.assign();return{k:"cond",c,a,b,p:q.p}}
  un(){const k=this.pk();
    if(k.t==="op"&&["-","+","!","~"].includes(k.v)){this.nx();return{k:"un",op:k.v,a:this.un(),p:k.p}}
    if(k.t==="op"&&(k.v==="++"||k.v==="--")){this.nx();return{k:"pre",op:k.v,a:this.un(),p:k.p}}
    if(k.t==="op"&&k.v==="*"){this.nx();return{k:"deref",a:this.un(),p:k.p}}
    if(k.t==="op"&&k.v==="&"){this.nx();return{k:"addr",a:this.un(),p:k.p}}
    if(k.t==="op"&&k.v==="&&")throw new E2(k.p,"&& đứng trước một giá trị chưa hỗ trợ","Muốn lấy địa chỉ của địa chỉ, hãy tách thành hai bước qua một biến con trỏ.","unsup");
    if(this.is("delete")){this.nx();let arr=false;if(this.is("[")){this.nx();this.expect("]","delete[] viết liền cặp ngoặc vuông rỗng: delete[] p;");arr=true}return{k:"del",arr,a:this.un(),p:k.p}}
    if(this.is("new"))return this.newE();
    if(this.is("(")&&this.isCastAt(1)){this.nx();const ty=this.type();this.expect(")");return{k:"cast",ty,a:this.un(),p:k.p}}
    if(this.is("sizeof")){this.nx();this.expect("(");let r;if(this.typeStart())r={k:"sizeof",ty:this.type(),p:k.p};else r={k:"sizeof",a:this.expr(),p:k.p};this.expect(")");return r}
    return this.post()}
  /* new int, new int(5), new int{5}, new int[n], new int[n](), new int[3]{1, 2, 3} */
  newE(){const k=this.nx();if(!this.typeStart()&&!this.cls.has(this.pk().v))throw new E2(this.pk().p,`expected type-specifier before ${this.desc(this.pk())}`,"Sau new phải là một kiểu dữ liệu, ví dụ new int hoặc new int[n].");
    const ty=this.type();const ps=this.stars();let t=ty.t+"*".repeat(ps.n),n=null,init=null;
    if(isVec(t)||t==="string")throw new E2(ty.p,`new ${tn(t)} chưa hỗ trợ`,"Trình mô phỏng hỗ trợ new với kiểu số, ký tự và con trỏ. vector, string tự quản lý bộ nhớ nên hiếm khi cần new.","unsup");
    if(this.is("[")){this.nx();n=this.expr();this.expect("]","Thiếu dấu ] sau số phần tử của new.");if(this.is("["))throw new E2(this.pk().p,"new mảng nhiều chiều chưa hỗ trợ","Mảng hai chiều cấp động: dùng vector<vector<int>>, hoặc một mảng một chiều n*m phần tử.","unsup")}
    if(isCls(t)&&!n){if(this.is("(")){this.nx();init={s:"()",args:this.is(")")?(this.nx(),[]):(()=>{const a=this.args0();this.expect(")");return a})()}}else if(this.is("{"))init={s:"{}",args:this.ilist().items};else init={s:"",args:[]}}
    else if(this.is("(")){const op=this.nx();const a=this.is(")")?[]:this.args0();this.expect(")");if(a.length>1)throw new E2(op.p,"expression list treated as compound expression in initializer [-fpermissive]","Giá trị khởi tạo trong ( ) chỉ có một giá trị.");init={s:"()",e:a[0]||null}}
    else if(this.is("{")){const L=this.ilist();init={s:"{}",list:L}}
    return{k:"new",t,n,init,p:k.p}}
  post(){let e=this.prim();
    for(;;){const k=this.pk();
      if(this.is("[")){this.nx();const i=this.expr();this.expect("]","Thiếu dấu ] đóng chỉ số.");e={k:"idx",a:e,i,p:k.p};continue}
      if(k.t==="op"&&(k.v==="++"||k.v==="--")){this.nx();e={k:"post",op:k.v,a:e,p:k.p};continue}
      if(this.is(".")||this.is("->")){const arrow=this.nx().v==="->";let m=this.nx();
        if(m.t!=="id"&&!(m.v==="operator"))throw new E2(m.p,`expected unqualified-id before ${this.desc(m)}`,`Sau dấu ${arrow?"->":"."} phải là tên thành viên.`);
        let qual=null,mn;
        if(m.t==="id"&&this.cls.has(m.v)&&this.is("::")){qual=this.cls.get(m.v);this.nx();const q=this.pk();mn=this.fnName();m=q}
        else if(m.v==="operator"){this.i--;mn=this.fnName()}
        else mn=m.v;
        if(this.is("(")){this.nx();e={k:"mc",o:e,m:mn,arrow,qual,args:this.is(")")?(this.nx(),[]):(()=>{const a=this.args0();this.expect(")");return a})(),p:m.p};continue}
        if(qual)throw new E2(m.p,`'${mn}' cần gọi bằng ( )`,"Gọi hàm của lớp cha: obj.Cha::ham().");
        e={k:"mem",o:e,m:mn,arrow,p:m.p};continue}
      break}
    return e}
  args(){const a=[];if(this.is(")")){this.nx();return a}for(;;){a.push(this.is("{")?this.ilist():this.assign());if(this.is(",")){this.nx();continue}break}this.expect(")");return a}
  prim(){const k=this.pk();
    if(k.t==="num"){this.nx();return{k:"num",t:k.nt,v:k.v,p:k.p,raw:k.raw,mc:k.mc}}
    if(k.t==="str"){this.nx();let v=k.v;while(this.pk().t==="str")v+=this.nx().v;return{k:"str",v,p:k.p}}
    if(k.t==="chr"){this.nx();return{k:"chr",v:k.v,p:k.p}}
    if(this.is("(")){this.nx();const e=this.expr();this.expect(")");e.paren=true;return e}
    if(this.is("{"))return this.ilist();
    if(k.t==="id"&&k.v==="string"&&this.is("::",1)&&this.pk(2).v==="npos"){this.nx();this.nx();this.nx();return{k:"npos",p:k.p}}
    if(k.t==="id"&&(CONT_T.includes(k.v)&&this.is("<",1)||k.v==="std"&&this.is("::",1)&&CONT_T.includes(this.pk(2).v)&&this.is("<",3))){
      const q=k.v==="std";if(q){this.nx();this.nx()}const nm=this.nx().v;const t=this.tmpl(nm);
      if(this.is("(")){this.nx();const a=this.is(")")?[]:this.args0();this.expect(")");return{k:"ctor",t,args:a,q,p:k.p}}
      if(this.is("{")){const L=this.ilist();return{k:"ctor",t,list:L,args:[],q,p:k.p}}
      throw new E2(this.pk().p,`expected primary-expression before ${this.desc(this.pk())}`,`${t} là một kiểu. Muốn tạo vector tạm, viết ${t}(n, giá_trị).`)}
    if(k.t==="id"&&(k.v==="greater"||k.v==="less")&&this.is("<",1)){const nm=this.nx().v;this.nx();const a=this.type();this.closeAngle();this.expect("(");this.expect(")");return{k:"functor",f:nm,t:a.t,p:k.p}}
    if(k.t==="id"&&k.v==="std"&&this.is("::",1)&&["greater","less"].includes(this.pk(2).v)&&this.is("<",3)){this.nx();this.nx();const nm=this.nx().v;this.nx();const a=this.type();this.closeAngle();this.expect("(");this.expect(")");return{k:"functor",f:nm,t:a.t,q:true,p:k.p}}
    if(k.t==="id"){
      if(k.v==="true"||k.v==="false"){this.nx();return{k:"bool",v:k.v==="true"?1:0,p:k.p}}
      if(k.v==="nullptr"){this.nx();return{k:"nullptr",p:k.p}}
      if(k.v==="this"){this.nx();return{k:"this",p:k.p}}
      if(this.cls.has(k.v)&&this.is("::",1)){const id=this.cls.get(k.v);this.nx();this.nx();const m=this.pk();const nm=this.fnName();
        if(!this.is("("))throw new E2(m.p,`'${nm}' cần gọi bằng ( )`,"Gọi hàm của lớp cha: Cha::ham(...).");this.nx();return{k:"call",f:nm,qual:id,args:this.args(),p:k.p}}
      if(this.cls.has(k.v)&&(this.is("(",1)||this.is("{",1))){const id=this.cls.get(k.v);this.nx();
        if(this.is("(")){this.nx();const a=this.args();return{k:"octor",t:id,args:a,p:k.p}}
        const L=this.ilist();return{k:"octor",t:id,args:L.items,br:true,p:k.p}}
      if(k.v==="static_cast"){this.nx();this.expect("<");const ty=this.type();this.expect(">");this.expect("(");const a=this.expr();this.expect(")");return{k:"cast",ty,a,p:k.p}}
      let q=false;const p=k.p;
      if(k.v==="std"&&this.is("::",1)){this.nx();this.nx();q=true}
      const nm=this.nx();
      if(nm.t!=="id")throw new E2(nm.p,`expected unqualified-id before ${this.desc(nm)}`,"Sau std:: phải là một tên.");
      if(nm.v==="numeric_limits"){this.expect("<");const ty=this.type();this.expect(">");this.expect("::");const w=this.nx();this.expect("(");this.expect(")");return{k:"lim",ty,w:w.v,q,p}}
      if(KWS.has(nm.v))throw new E2(nm.p,`expected primary-expression before '${nm.v}'`,`“${nm.v}” là từ khóa, không đặt ở vị trí này được.`);
      if(this.is("(")){this.nx();return{k:"call",f:nm.v,q,args:this.args(),p}}
      return{k:"name",n:nm.v,q,p}}
    throw new E2(k.t==="eof"?this.prevEnd():k.p,`expected primary-expression before ${this.desc(k)}`,"Biểu thức chưa hoàn chỉnh: thiếu một giá trị hoặc tên biến ở đây.")}
}

/* ---------- kiểm tra ngữ nghĩa ---------- */
const STDN={cout:{t:"ostream",h:"iostream"},cin:{t:"istream",h:"iostream"},cerr:{t:"ostream",h:"iostream"},endl:{t:"manip",h:"iostream"},fixed:{t:"manip",h:"iostream"},scientific:{t:"manip",h:"iostream"},boolalpha:{t:"manip",h:"iostream"},noboolalpha:{t:"manip",h:"iostream"},left:{t:"manip",h:"iostream"},right:{t:"manip",h:"iostream"}};
const MACRO={INT_MAX:[2147483647,"int"],INT_MIN:[-2147483648,"int"],CHAR_MAX:[127,"int"],CHAR_MIN:[-128,"int"],SHRT_MAX:[32767,"int"],SHRT_MIN:[-32768,"int"],UINT_MAX:[4294967295,"unsigned"],LLONG_MAX:[9223372036854775807n,"long long"],LLONG_MIN:[-9223372036854775808n,"long long"]};
const CMP=["==","!=","<","<=",">",">="];
const CMATH={sqrt:1,pow:2,abs:1,round:1,floor:1,ceil:1,trunc:1,fmod:2};
function check2(prog,src,inc){
  const sc=new Map(),warns=[],allDecl=new Map(),warned=new Set(),gone=new Map();
  const frames=[{names:new Set(),prev:[]}];
  const enter=()=>frames.push({names:new Set(),prev:[]});
  const leave=()=>{const d=frames.length-1,f=frames.pop();
    sc.forEach(V=>{if(V.dang&&V.dang.dep>=d)V.dang.out=true});   // con trỏ trỏ vào biến của khối vừa đóng: thành con trỏ treo
    for(const n of f.names){const V=sc.get(n);if(V&&V.local&&!V.ref&&V.t!=="string"&&!isVec(V.t)&&!(V.cls&&!V.triv)&&!(V.isRef&&V.set))warns.push(V.set?{p:V.p,msg:`variable '${n}' set but not used [-Wunused-but-set-variable]`,vi:`Biến ${n} được gán giá trị nhưng giá trị đó không bao giờ được đọc. Có thể bạn quên dùng nó, hoặc biến này thừa.`}:{p:V.p,msg:`unused variable '${n}' [-Wunused-variable]`,vi:`Biến ${n} được khai báo nhưng không dùng tới. Xóa nó đi cho gọn, hoặc kiểm tra xem có dùng nhầm tên biến khác không.`})}
    for(const n of f.names)gone.set(n,sc.get(n).p);for(const [n,old] of f.prev.reverse()){if(old)sc.set(n,old);else sc.delete(n)}};
  const declare=(n,info)=>{const f=frames[frames.length-1];if(info&&info.dep==null){info.dep=frames.length-1;info.ld=loopD}f.names.add(n);f.prev.push([n,sc.get(n)]);sc.set(n,info)};
  const lineOf=p=>src.slice(0,p).split("\n").length;
  const funcs=new Map();let curFn=null;
  const sigOf=F=>`${tn(F.ret)} ${F.name}(${F.params.map(P=>(P.c&&P.ref?"const ":"")+tn(P.t)+(P.ref?"&":"")).join(", ")})`;
  const protoTxt=F=>`${tn(F.ret)} ${F.name}(${F.params.map(P=>(P.c?"const ":"")+tn(P.t)+(P.ref?"&":"")+(P.name?" "+P.name:"")).join(", ")})`;
  const argList=ts=>ts.map(tn).join(", ");
  const rank=(A,T)=>{if((A==="ostream"||A==="istream")&&A===T)return 3;if(["void","ostream","istream","manip"].includes(A))return -1;
    if(isCls(T)||isCls(A))return A===T?3:isCls(A)&&isCls(T)&&isBaseOf(T,A)?2:-1;
    if(isPtr(T)&&isPtr(A)&&isCls(elemT(T))&&isCls(elemT(A))&&isBaseOf(elemT(T),elemT(A))&&A!==T)return 2;
    if(A==="ilist")return isVec(T)?1:-1;
    if(isPtr(T)){if(A===T)return 3;if(A==="nullptr_t")return 2;if(isArr(A)&&elemT(A)===elemT(T))return 2;return -1}
    if(isPtr(A)||A==="nullptr_t")return isArr(T)&&isPtr(A)&&elemT(T)===elemT(A)?3:-1;
    if(isArr(T))return isArr(A)&&elemT(A)===elemT(T)?3:-1;
    if(isVec(T)||isVec(A)||isArr(A)||isIter(A)||isIter(T))return A===T?3:-1;
    if(T==="string")return A==="string"?3:A==="cstr"?0.5:-1;
    if(!isNumT(T)||!isNumT(A))return -1;
    if(A===T)return 3;if(T==="int"&&["char","bool","short"].includes(A))return 2;if(T==="double"&&A==="float")return 2;return 1};
  const has=h=>inc.has(h)||inc.has("bits/stdc++.h")||(h==="string"&&inc.has("iostream"));
  /* biểu thức gán được (lvalue): biến, phần tử a[i], *it, v.back()/front()/at(i) */
  const isLvE=a=>!!a&&(a.k==="name"||a.k==="idx"||a.k==="deref"||a.k==="mem"||(a.k==="mc"&&a.fn&&a.fn.rref)||(a.k==="mc"&&["back","front","at"].includes(a.m))||(a.k==="call"&&!a.q&&(funcs.get(a.f)||[]).some(F=>F.rref)));
  const lvBase=a=>{let x=a;while(x&&(x.k==="idx"||x.k==="mc"||(x.k==="mem"&&!x.arrow)))x=x.k==="idx"?x.a:x.o;return x&&x.k==="name"&&!x.q&&sc.has(x.n)?sc.get(x.n):null};
  const etxt=a=>a.k==="addr"?"&"+etxt(a.a):a.k==="name"?a.n:a.k==="idx"?`${etxt(a.a)}[${etxt(a.i)}]`:a.k==="num"?String(a.raw||a.v):a.k==="mc"?`${etxt(a.o)}.${a.m}(${a.args.map(etxt).join(", ")})`:a.k==="deref"?"*"+etxt(a.a):a.k==="bin"?`${etxt(a.a)} ${a.op} ${etxt(a.b)}`:"...";
  /* khởi tạo / gán giá trị e vào kiểu T (dùng cho mảng, vector, danh sách { }) */
  const canTo=(T,e,list)=>{
    if(isCls(T)){if(e.k==="ilist"){e.cE=ctorCheck(T,e.items,e.p,true);e.cT=T;return}
      const R=tc(e);if(R===T||isBaseOf(T,R))return;if(convCtor(T,R)){e.cE=ctorCheck(T,[e],e.p,false);e.cT=T;e.cv=true;return}
      throw new E2(e.p,`conversion from '${tn(R)}' to non-scalar type '${tn(T)}' requested`,`Cần một ${tn(T)}, nhưng giá trị này có kiểu ${tn(R)}.`)}
    if(e.k==="ilist"){
      if(isVec(T)){e.items.forEach(x=>canTo(elemT(T),x,true));return}
      if(isArr(T)){const N=arrN(T);if(N!=null&&e.items.length>N)throw new E2(e.items[N].p,`too many initializers for '${tn(T)}'`,`Mảng có ${N} phần tử nhưng danh sách khởi tạo có ${e.items.length} giá trị.`);e.items.forEach(x=>canTo(elemT(T),x,true));return}
      if(e.items.length>1)throw new E2(e.items[1].p,`scalar object requires one element in initializer`,"Một giá trị đơn chỉ nhận một phần tử trong { }.");
      if(e.items.length)canTo(T,e.items[0],true);return}
    const R=tc(e);
    if(R==="void")throw new E2(e.p,"void value not ignored as it ought to be","Hàm kiểu void không trả về giá trị nào để dùng ở đây.");
    if(isVec(T)){if(R!==T)throw new E2(e.p,`conversion from '${tn(R)}' to non-scalar type '${tn(T)}' requested`,`Cần một ${tn(T)}, nhưng giá trị này có kiểu ${tn(R)}.`);return}
    if(isArr(T))throw new E2(e.p,"array must be initialized with a brace-enclosed initializer","Khởi tạo mảng bằng danh sách trong ngoặc nhọn, ví dụ int a[3] = {1, 2, 3};");
    if(T==="string"){if(!(R==="string"||R==="cstr"))throw new E2(e.p,`conversion from '${tn(R)}' to non-scalar type 'std::string' requested`,"Chuỗi phải khởi tạo bằng chuỗi trong nháy kép \"...\".");return}
    if(isPtr(T)){ptrInit(T,e,R,"initialization",false);return}
    if(isPtr(R)||R==="nullptr_t")throw new E2(e.p,`invalid conversion from '${tn(R)}' to '${tn(T)}' [-fpermissive]`,"Phần tử này kiểu số, không chứa địa chỉ được.");
    if(!isNumT(R))throw new E2(e.p,`cannot convert '${tn(R)}' to '${tn(T)}' in initialization`,`Không dùng ${R==="cstr"?"chuỗi \"...\"":"giá trị kiểu "+tn(R)} cho phần tử kiểu ${tn(T)} được.`);
    if(list&&INTG.has(T)&&isFlT(R))throw new E2(e.p,`narrowing conversion of '${etxt(e)}' from '${tn(R)}' to '${tn(T)}' [-Wnarrowing]`,"Danh sách { } không cho phép làm mất dữ liệu (số thực → số nguyên).")};
  const need=(h,p,what)=>{if(!has(h))throw new E2(p,`'${what}' was not declared in this scope; note: '#include <${h}>' is missing`,`Thiếu #include <${h}> ở đầu file nên trình biên dịch không biết ${what} là gì.`)};
  const stdq=(n,q,p)=>{if(!q&&!prog.using)throw new E2(p,`'${n}' was not declared in this scope; did you mean 'std::${n}'?`,`${n} nằm trong không gian tên std. Thêm dòng using namespace std; ngay dưới các #include (hoặc viết đầy đủ std::${n}).`)};
  const nameT=e=>{
    if(!e.q&&sc.has(e.n)){const V=sc.get(e.n);e.r=V.g?"gvar":"var";V.used=true;if(e.asgT)V.set=true;else V.ref=true;
      if(V.dang&&V.dang.out&&!V.dang.w&&!e.asgT&&!e.lhs){V.dang.w=true;warns.push({p:e.p,msg:V.dang.may?`dangling pointer '${e.n}' to '${V.dang.x}' may be used [-Wdangling-pointer=]`:`using dangling pointer '${e.n}' to '${V.dang.x}' [-Wdangling-pointer=]`,vi:`${e.n} đang giữ địa chỉ của ${V.dang.x}, nhưng ${V.dang.x} được khai báo trong một khối { } đã kết thúc nên đã bị hủy. Dùng ${e.n} lúc này là dùng con trỏ treo. Hãy khai báo ${V.dang.x} ở cùng phạm vi với ${e.n} (hoặc rộng hơn).`})}
      if(!V.init&&!e.lhs&&!warned.has(e.n)){warned.add(e.n);warns.push({p:e.p,msg:`'${e.n}' is used uninitialized [-Wuninitialized]`,vi:`Biến ${e.n} được đọc khi chưa có giá trị, nên chứa “giá trị rác” còn sót trong bộ nhớ.`})}
      return V.t}
    const S=STDN[e.n];
    if(S){stdq(e.n,e.q,e.p);need(S.h,e.p,"std::"+e.n);e.r="std";return S.t}
    if(STD_UNSUP.has(e.n)&&(e.q||prog.using))throw new E2(e.p,`std::${e.n} chưa có trong trình mô phỏng`,`std::${e.n} là thành phần hợp lệ của thư viện chuẩn nhưng trình mô phỏng chưa hỗ trợ.`,"unsup");
    if(e.q)throw new E2(e.p,`'${e.n}' is not a member of 'std'`,`std không có thành phần nào tên ${e.n}.`);
    if(!e.q&&curFn&&curFn.cls&&fieldOf(curFn.cls,e.n,e.p)){Object.assign(e,{k:"mem",o:{k:"this",p:e.p,impl:true},m:e.n,arrow:true,impl:true});return memT(e)}
    if(funcs.has(e.n))throw new E2(e.p,`invalid use of function name '${e.n}'`,`${e.n} là tên hàm. Muốn gọi hàm phải có cặp ngoặc tròn: ${e.n}(...)`);
    if(MACRO[e.n]){need("climits",e.p,e.n);e.r="macro";return MACRO[e.n][1]}
    if(gone.has(e.n))throw new E2(e.p,`'${e.n}' was not declared in this scope`,`Biến ${e.n} được khai báo bên trong một khối { } (dòng ${lineOf(gone.get(e.n))}) nên chỉ tồn tại trong khối đó. Muốn dùng sau khối, hãy khai báo nó ở bên ngoài, trước khối.`);
    if(allDecl.has(e.n)&&allDecl.get(e.n)>e.p)throw new E2(e.p,`'${e.n}' was not declared in this scope`,`Biến ${e.n} được dùng trước dòng khai báo (dòng ${lineOf(allDecl.get(e.n))}). Phải khai báo trước rồi mới dùng.`);
    const ci=[...sc.keys()].find(k=>k.toLowerCase()===e.n.toLowerCase());
    if(ci)throw new E2(e.p,`'${e.n}' was not declared in this scope; did you mean '${ci}'?`,`C++ phân biệt chữ hoa và chữ thường: bạn đã khai báo ${ci}, không phải ${e.n}.`);
    throw new E2(e.p,`'${e.n}' was not declared in this scope`,`Trình biên dịch không biết “${e.n}”. Kiểm tra chính tả hoặc khai báo biến trước khi dùng. Nếu muốn in chữ, đặt trong dấu nháy kép.`)};
  const lv=(a,op,reads)=>{implField(a);
    if(a.k==="mem"){a.lhsM=true;const t=tc(a);
      const act=op==="++"?"increment":op==="--"?"decrement":"assignment";
      if(a.cst)throw new E2(a.p,a.fld&&a.fld.c?`${act} of read-only member '${clsName(a.fld.owner)}::${a.m}'`:`${act} of member '${a.fld?clsName(a.fld.owner)+"::":""}${a.m}' in read-only object`,a.fld&&a.fld.c?`${a.m} là thành viên const: chỉ được gán giá trị một lần, trong danh sách khởi tạo của hàm tạo.`:a.o.k==="this"?"Đây là hàm thành viên const: nó hứa không sửa đối tượng, nên không gán vào thành viên được. Bỏ const ở cuối khai báo hàm nếu hàm cần sửa.":`${etxt(a.o)} là hằng (const) nên không sửa thành viên của nó được.`);
      if(isArr(t))throw new E2(a.p,"invalid array assignment","Không gán cả một mảng được; hãy gán từng phần tử.");
      return{t,c:false,init:true,elem:true}}
    if(a.k==="mc"&&a.fn&&a.fn.rref){const t=tc(a);return{t,c:false,init:true,elem:true}}
    if(a.k==="idx"||a.k==="deref"||(a.k==="mc"&&["back","front","at"].includes(a.m))){const t=tc(a);
      if(a.ovl){if(!a.fn.rref)throw new E2(a.p,op==="="?"lvalue required as left operand of assignment":"lvalue required as increment operand",`operator[] của ${tn(a.at)} trả về một bản sao (giá trị), không phải tham chiếu, nên không gán vào được. Hãy cho nó trả về tham chiếu: int& operator[](int i).`);
        if(a.fn.cret)throw new E2(a.p,`assignment of read-only location '${etxt(a)}'`,"operator[] này trả về tham chiếu const (chỉ đọc).");return{t,c:false,init:true,elem:true}}
      if(a.k==="idx"&&a.at==="cstr")throw new E2(a.p,"assignment of read-only location","Chuỗi hằng \"...\" không sửa được.");
      if(ptrPc(a))throw new E2(a.p,`assignment of read-only location '${etxt(a)}'`,`Con trỏ được khai báo trỏ tới hằng (const ${tn(t)}*) nên chỉ đọc được qua nó, không sửa được. Bỏ const nếu cần sửa.`);
      const B=lvBase(a);if(B&&B.c)throw new E2(a.p,`assignment of read-only location '${etxt(a)}'`,`${etxt(a)} là phần tử của ${lvBase(a)===B?"một biến/tham số const":"hằng"} nên không sửa được. Nếu hàm cần sửa, bỏ const ở tham số.`);
      if(B){B.init=true;B.ref=true;B.used=true}
      if(isArr(t))throw new E2(a.p,"invalid array assignment","Không gán cả một mảng được; hãy gán từng phần tử.");
      return{t,c:false,init:true,elem:true}}
    if(a.k==="call"&&isLvE(a)){if(!/=$/.test(op))throw new E2(a.p,"chưa hỗ trợ ++/-- trên kết quả hàm","Trình mô phỏng cho gán vào hàm trả về tham chiếu (f(...) = giá_trị), chưa hỗ trợ f(...)++. Hãy viết f(...) += 1;","unsup");const t=tc(a);return{t,c:false,init:true,elem:true}}
    if(a.k!=="name")throw new E2(a.p,op==="="?"lvalue required as left operand of assignment":"lvalue required as operand","Bên trái phép gán (hoặc ++, --) phải là một biến. Phép gán chép giá trị từ phải sang trái: bien = gia_tri;");
    if(!reads){a.lhs=true;if(op==="=")a.asgT=true}tc(a);
    if(a.r!=="var"&&a.r!=="gvar")throw new E2(a.p,`assignment of read-only location '${a.n}'`,"Không thể gán giá trị cho tên này.");
    const V=sc.get(a.n);if(isArr(V.t)&&op==="=")throw new E2(a.p,"invalid array assignment","Không gán cả một mảng cho mảng khác được. Hãy chép từng phần tử bằng vòng lặp, hoặc dùng vector (vector gán được: b = a;).");
    if(V.c)throw new E2(a.p,V.ref?`assignment of read-only reference '${a.n}'`:`assignment of read-only ${V.param?"parameter":"variable"} '${a.n}'`,V.ref?`${a.n} là tham chiếu const: hàm chỉ được đọc đối số gốc, không được sửa nó.`:`${a.n} được khai báo const (hằng) nên không đổi được giá trị.`);
    return V};
  /* con trỏ: e (deref hoặc a[i] với a là con trỏ) có đi qua con trỏ tới hằng (const int* p) không */
  function ptrPc(a){const P=a.k==="deref"?a.a:a.k==="idx"?a.a:null;if(!P)return false;
    if(a.k==="idx"&&!isPtr(P.tt||""))return false;return srcPc(P)}
  function srcPc(e){if(!e)return false;if(e.k==="name"){const V=sc.get(e.n);return !!(V&&(V.pc||(isArr(V.t)&&V.c)))}
    if(e.k==="addr")return !!e.pc;if(e.k==="bin")return srcPc(isPtr(e.a.tt||"")||isArr(e.a.tt||"")?e.a:e.b);if(e.k==="pre"||e.k==="post")return srcPc(e.a);return false}
  /* khởi tạo / gán con trỏ kiểu T từ biểu thức e (kiểu R) */
  function ptrInit(T,e,R,ctx,pc){
    if(isPtr(R)&&isCls(elemT(R))&&isCls(elemT(T))&&isBaseOf(elemT(T),elemT(R))&&R!==T){upChk(elemT(T),elemT(R),e.p);e.up=true;return}
    if(R===T||(isArr(R)&&elemT(R)===elemT(T))){if(srcPc(e)&&!pc)throw new E2(e.p,`invalid conversion from 'const ${tn(T)}' to '${tn(T)}' [-fpermissive]`,`Giá trị bên phải là địa chỉ của hằng (chỉ được đọc). Con trỏ nhận nó cũng phải khai báo trỏ tới hằng: const ${tn(elemT(T))}* p.`);return}
    if(R==="nullptr_t")return;
    if(e.k==="num"&&Number(e.v)===0&&INTG.has(R))return;
    if(isNumT(R))throw new E2(e.p,`invalid conversion from '${tn(R)}' to '${tn(T)}' [-fpermissive]`,`Con trỏ chỉ chứa địa chỉ. Muốn trỏ tới biến x, viết &x (lấy địa chỉ của x). Con trỏ chưa trỏ đâu thì gán nullptr.`);
    if(isIter(R))throw new E2(e.p,`cannot convert '${tn(R)}' to '${tn(T)}' in ${ctx}`,"Vị trí trong vector (iterator) không phải con trỏ. Lấy địa chỉ phần tử bằng &v[i], hoặc dùng auto it = ... để giữ iterator.");
    if(isPtr(R))throw new E2(e.p,`cannot convert '${tn(R)}' to '${tn(T)}' in ${ctx}`,`Con trỏ ${tn(R)} không gán được cho con trỏ ${tn(T)}: kiểu con trỏ phải khớp với kiểu dữ liệu nó trỏ tới.`);
    throw new E2(e.p,`cannot convert '${tn(R)}' to '${tn(T)}' in ${ctx}`,`Không gán giá trị kiểu ${tn(R)} cho con trỏ ${tn(T)} được.`)}
  /* theo dõi đơn giản con trỏ đang trỏ tới đâu (để cảnh báo như g++ khi delete sai) */
  const ptrSrc=(V,e)=>{if(!V)return;V.dang=null;
    if(e&&e.k==="addr"&&e.a.k==="name"){const X=sc.get(e.a.n);if(X&&X.local&&!X.st&&X.dep>V.dep)V.dang={x:e.a.n,dep:X.dep,may:loopD>V.ld}}V.src=e&&e.k==="addr"&&e.a.k==="name"?{k:"addr",n:e.a.n}:e&&e.k==="new"?{k:"new",arr:!!e.n}:null};
  /* ================= struct / class: kiểm tra kiểu ================= */
  /* trong hàm thành viên, tên thành viên dữ liệu x (không bị biến cục bộ che) chính là this->x */
  function implField(a){if(a&&a.k==="name"&&!a.q&&!sc.has(a.n)&&curFn&&curFn.cls&&fieldOf(curFn.cls,a.n))Object.assign(a,{k:"mem",o:{k:"this",p:a.p,impl:true},m:a.n,arrow:true,impl:true})}
  const MEMS=[];
  const chainOf=clsChain;
  const isBaseOf=(b,d)=>isCls(b)&&isCls(d)&&chainOf(d).includes(b);
  const kindW=D=>D.kind==="class"?"class":"struct";
  /* tìm tên trong lớp id rồi các lớp cha: lớp con che lớp cha; một lớp cơ sở ảo dùng chung chỉ tính một lần.
     Hai lớp cha khác nhau cùng có tên đó (hoặc một lớp cha bị lặp không ảo) thì mơ hồ. */
  function findIn(id,get){const D=CLS.get(id);const r=get(D);if(r)return[{r,D}];const R=[];
    for(const b of basesOf(id))for(const x of findIn(b.id,get))R.push(x);
    const dup=dupOf(id),U=[];for(const x of R)if(!U.some(y=>y.D===x.D&&!dup.has(x.D.id)))U.push(x);
    return U.filter(x=>dup.has(x.D.id)||!U.some(y=>y.D!==x.D&&isBaseOf(x.D.id,y.D.id)))}
  function dupOf(id){const D=CLS.get(id);if(!D.nvB&&D.bases.length)return new Set();const n=new Map();for(const e of layoutOf(id))n.set(e.cls,(n.get(e.cls)||0)+1);return new Set([...n].filter(([k,v])=>v>1).map(([k])=>k))}
  function ambErr(p,m,R,kind){throw new E2(p,`request for member '${m}' is ambiguous`,`${R.map(x=>x.D.name).join(" và ")} đều có ${kind} ${m}, và lớp này kế thừa cả hai. Ghi rõ muốn dùng bản nào, ví dụ ${R[0].D.name}::${m}${kind==="hàm"?"()":""}, hoặc viết lại ${m} trong lớp con.`)}
  const fieldOf=(id,m,p)=>{const R=findIn(id,D=>(D.fields||[]).find(f=>f.name===m));if(!R.length)return null;if(R.length>1&&p)ambErr(p,m,R,"thành viên");return{f:R[0].r,D:R[0].D}};
  const methodsOf=(id,m,p)=>{const R=findIn(id,D=>{const L=D.mt&&D.mt.get(m);return L&&L.length?L:null});if(!R.length)return null;if(R.length>1&&p)ambErr(p,m,R,"hàm");return{L:R[0].r,D:R[0].D}};
  /* đổi con trỏ / tham chiếu lớp con sang lớp cha b: lớp cha phải duy nhất và kế thừa public */
  function upChk(b,d,p){if(!isCls(b)||!isCls(d)||b===d)return;if(dupOf(d).has(b))throw new E2(p,`'${clsName(b)}' is an ambiguous base of '${clsName(d)}'`,`${clsName(d)} chứa HAI phần ${clsName(b)} (kế thừa hình kim cương không dùng virtual), nên không biết trỏ vào phần nào. Dùng kế thừa ảo: class X : virtual public ${clsName(b)}.`);
    const path=basePath(d,b);if(path&&path.some(e=>e.acc!=="public")&&!(curFn&&curFn.cls&&chainOf(curFn.cls).includes(path.find(e=>e.acc!=="public").from)))throw new E2(p,`'${clsName(b)}' is an inaccessible base of '${clsName(d)}'`,`${clsName(d)} kế thừa ${clsName(b)} kiểu private/protected, nên bên ngoài không đổi được sang ${clsName(b)}. Viết public trước tên lớp cha.`)}
  const sigM=E=>!E.cls?`${tn(E.ret)}${E.rref?"&":""} ${E.name}(${E.params.map(P=>(P.c&&P.ref?"const ":"")+tn(P.t)+(P.ref?"&":"")).join(", ")})`:`${E.kind==="ctor"||E.kind==="dtor"?"":tn(E.ret)+(E.rref?"&":"")+" "}${clsName(E.cls)}::${E.name}(${E.params.map(P=>(P.c&&P.ref?"const ":"")+tn(P.t)+(P.ref?"&":"")).join(", ")})${E.cnst?" const":""}`;
  /* quyền truy cập: public / protected (lớp và lớp con) / private (chính lớp đó và hàm friend) */
  function canAcc(D,acc,via){const F=curFn;
    if(via&&via!==D.id){for(const e of basePath(via,D.id)||[])if(e.acc!=="public"&&!(F&&F.cls&&chainOf(F.cls).includes(e.from)))return false}
    if(acc==="public")return true;if(!F)return false;
    if(F.cls===D.id)return true;
    if(F.cls&&acc==="protected"&&isBaseOf(D.id,F.cls))return true;
    if(!F.cls&&D.friends.has(F.name))return true;
    return false}
  function accErr(p,D,acc,what,inh){
    if(inh)throw new E2(p,`'${what}' is inaccessible within this context`,`Lớp con kế thừa ${D.name} theo kiểu private/protected (với class, mặc định là private), nên từ bên ngoài không dùng được thành viên của ${D.name}. Thường cần viết: class Con : public ${D.name} { ... };`);
    if(acc==="private"&&curFn&&curFn.cls&&curFn.cls!==D.id&&isBaseOf(D.id,curFn.cls))throw new E2(p,`'${what}' is private within this context`,`Thành viên private của ${D.name} chỉ dùng được trong chính ${D.name}; lớp con ${clsName(curFn.cls)} cũng không truy cập trực tiếp được. Nếu lớp con cần dùng, khai báo nó là protected trong ${D.name}, hoặc dùng hàm public/protected mà ${D.name} cung cấp.`);
    throw new E2(p,`'${what}' is ${acc} within this context`,acc==="private"?`Thành viên này là private của ${D.name}: chỉ các hàm thành viên của ${D.name} (và hàm friend) mới dùng được. Từ bên ngoài, hãy dùng các hàm public mà lớp cung cấp.`:`Thành viên này là protected của ${D.name}: chỉ ${D.name} và các lớp con của nó dùng được, bên ngoài thì không.`)}
  /* đối tượng có phải hằng không (const tham chiếu, this trong hàm const, con trỏ tới hằng) */
  function objConst(o){if(!o)return false;switch(o.k){
    case "this":return !!(curFn&&curFn.cnst);
    case "name":{const V=sc.get(o.n);return !!(V&&V.c)}
    case "mem":return o.arrow?ptrConst(o.o)||!!(o.fld&&o.fld.c):objConst(o.o)||!!(o.fld&&o.fld.c);
    case "idx":{const B=lvBase(o);return !!(B&&B.c)||ptrPc(o)}
    case "deref":return ptrConst(o.a);
    case "mc":case "call":return !!(o.fn&&o.fn.cret);
    default:return false}}
  function ptrConst(o){if(!o)return false;if(o.k==="this")return !!(curFn&&curFn.cnst);if(o.k==="name"){const V=sc.get(o.n);return !!(V&&V.pc)}return srcPc(o)}
  function objOf(e,O){
    if(e.arrow){if(!isPtr(O)||!isCls(elemT(O))){if(isCls(O))throw new E2(e.p,`base operand of '->' has non-pointer type '${tn(O)}'`,`${etxt(e.o)} là đối tượng, không phải con trỏ: dùng dấu chấm, ${etxt(e.o)}.${e.m}.`);
        throw new E2(e.p,`base operand of '->' is not a pointer`,"Dấu -> chỉ dùng với con trỏ tới đối tượng (struct/class).")}
      return{id:elemT(O),cst:ptrConst(e.o)}}
    if(isPtr(O)&&isCls(elemT(O)))throw new E2(e.p,`request for member '${e.m}' in '${etxt(e.o)}', which is of pointer type '${tn(O)}' (maybe you meant to use '->' ?)`,`${etxt(e.o)} là con trỏ: dùng ${etxt(e.o)}->${e.m} (hoặc (*${etxt(e.o)}).${e.m}).`);
    if(!isCls(O))throw new E2(e.p,`request for member '${e.m}' in '${etxt(e.o)}', which is of non-class type '${tn(O)}'`,`${etxt(e.o)} có kiểu ${tn(O)}, không phải struct/class nên không có thành viên ${e.m}.`);
    return{id:O,cst:objConst(e.o)}}
  function useRoot(o,set){let x=o;while(x&&((x.k==="mem"&&!x.arrow)||x.k==="idx"))x=x.k==="idx"?x.a:x.o;if(x&&x.k==="name"&&sc.has(x.n)){const V=sc.get(x.n);V.used=true;if(set&&V.cls)V.set=true;else V.ref=true}}
  function memT(e){if(e.lhsM&&!e.arrow){let x=e.o;while(x&&x.k==="mem"&&!x.arrow){x.lhsM=true;x=x.o}if(x&&x.k==="name")x.asgT=true}const O=tc(e.o);const {id,cst}=objOf(e,O);const D=CLS.get(id);const r=fieldOf(id,e.m,e.p);
    if(!r){if(methodsOf(id,e.m))throw new E2(e.p,`invalid use of non-static member function '${sigM(methodsOf(id,e.m).L[0])}'`,`${e.m} là hàm thành viên: phải gọi bằng ( ), ví dụ ${etxt(e.o)}${e.arrow?"->":"."}${e.m}().`);
      throw new E2(e.p,`'${kindW(D)} ${D.name}' has no member named '${e.m}'`,`${D.name} không có thành viên tên ${e.m}. Kiểm tra chính tả (phân biệt chữ hoa, chữ thường) hoặc khai báo thêm thành viên trong ${kindW(D)} ${D.name}.`)}
    const inh=!canAcc(r.D,"public",id);
    if(!canAcc(r.D,r.f.acc,id))accErr(e.p,r.D,r.f.acc,`${tnIn(r.f.t)} ${r.D.name}::${r.f.name}`,inh&&r.f.acc==="public");
    e.fld=r.f;e.cst=cst||r.f.c;useRoot(e.o,!!e.lhsM);return r.f.t}
  /* chọn phiên bản hàm thành viên / hàm tạo / toán tử phù hợp với đối số */
  function pickOv(list,args,p,label,AT0){
    const AT=AT0||args.map(a=>{if(a.k==="ilist")return "ilist";if(a.k==="name")a.lhs=true;const t=tc(a);if(t==="void")throw new E2(a.p,"invalid use of void expression","Hàm void không trả về giá trị nên không dùng làm đối số được.");return t});
    const lvOf=(a,k)=>!a?{t:AT[k],c:false}:a.k==="name"&&(a.r==="var"||a.r==="gvar")?sc.get(a.n):isLvE(a)&&a.k!=="name"?{t:AT[k],c:a.k==="mem"?!!a.cst:!!(lvBase(a)||{}).c,init:true,elem:true}:null;
    const score=E=>{const n=AT.length,P=E.params,need=P.filter(q=>!q.def).length;
      if(n>P.length)return{bad:"many"};if(n<need)return{bad:"few"};
      const r=[];for(let k=0;k<n;k++){const q=P[k],a=args[k];
        if(q.t==="ostream"||q.t==="istream"){if(AT[k]!==q.t)return{bad:"conv",k};r.push(3);continue}
        if(AT[k]==="ilist"){if(isCls(q.t)){try{ctorCheck(q.t,a.items,a.p,true)}catch(x){return{bad:"conv",k}}r.push(1);continue}return{bad:"conv",k}}
        if(q.ref&&!q.c){const V=lvOf(a,k);if(!V||!(V.t===q.t||isBaseOf(q.t,V.t)))return{bad:"ref",k,why:V?"ty":"rv"};if(V.c)return{bad:"cref",k};r.push(3);continue}
        let s=rank(AT[k],q.t);
        if(s<0&&isCls(q.t)&&!isCls(AT[k])&&convCtor(q.t,AT[k]))s=0.4;
        if(s<0)return{bad:"conv",k};r.push(s)}
      return{r}};
    const cand=list.map(E=>Object.assign({E},score(E))),ok=cand.filter(c=>c.r);
    if(!ok.length){const c=cand[0];
      if(list.length===1&&(c.bad==="ref"||c.bad==="cref")){const q=list[0].params[c.k],a=args[c.k];
        if(c.bad==="ref")throw new E2(a?a.p:p,`cannot bind non-const lvalue reference of type '${tn(q.t)}&' to an rvalue of type '${tn(AT[c.k])}'`,`Tham số ${q.name||""} là tham chiếu ${tn(q.t)}&: phải truyền một biến có sẵn. Nếu hàm chỉ đọc, đổi thành const ${tn(q.t)}&.`);
        throw new E2(a?a.p:p,`binding reference of type '${tn(q.t)}&' to 'const ${tn(q.t)}' discards qualifiers`,`Đối số là hằng nên không truyền vào tham chiếu thường được. Đổi tham số thành const ${tn(q.t)}&.`)}
      throw new E2(p,`no matching function for call to '${label}(${AT.map(t=>t==="ilist"?"<brace-enclosed initializer list>":tn(t)).join(", ")})'`,list.length?`Không có phiên bản nào của ${label} nhận được đối số (${AT.map(t=>t==="ilist"?"{...}":tn(t)).join(", ")}). Các phiên bản hiện có: ${list.map(E=>E.implicit?`${label}(const ${clsName(E.cls)}&) (chép)`:sigM(E)).join("; ")}.`:`${label} không có phiên bản nào.`)}
    const better=(x,y)=>{let gt=false;for(let k=0;k<x.r.length;k++){if(x.r[k]<y.r[k])return false;if(x.r[k]>y.r[k])gt=true}return gt};
    let best=ok.filter(x=>ok.every(y=>y===x||better(x,y)));
    if(best.length!==1)throw new E2(p,`call of overloaded '${label}(${AT.map(tn).join(", ")})' is ambiguous`,`Có nhiều phiên bản ${label} phù hợp ngang nhau: ${ok.map(c=>sigM(c.E)).join("; ")}.`);
    const E=best[0].E;if(E.called==null)E.called=p;
    args.forEach((a,k)=>{const q=E.params[k];if(!a||!q)return;if(q.ref&&!q.c){const V=lvOf(a,k);if(V){V.init=true;V.ref=true}}else if(a.k==="name"&&sc.has(a.n)){const V=sc.get(a.n);V.ref=true}});
    return E}
  /* hàm tạo một tham số dùng để đổi kiểu ngầm (ví dụ PhanSo p = 3;) */
  function convCtor(T,R){const D=CLS.get(T);if(!D||!D.ctorE)return null;return D.ctorE.find(E=>E.params.length>=1&&E.params.slice(1).every(q=>q.def)&&!E.expl&&rank(R,E.params[0].t)>=0)||null}
  /* tạo đối tượng kiểu id từ danh sách đối số; trả về hàm tạo được chọn (null: không gọi hàm tạo nào) */
  function ctorCheck(id,args,p,br){const D=CLS.get(id);if(D.dup&&!prog.dupUse)prog.dupUse={p,b:D.dup};
    if(!D.ctorE.length){
      if(D.aggr&&br){if(args.length>D.fields.length)throw new E2(args[D.fields.length].p,`too many initializers for '${D.name}'`,`${D.name} có ${D.fields.length} thành viên nhưng danh sách { } có ${args.length} giá trị.`);
        args.forEach((a,k)=>canTo(D.fields[k].t,a,true));return null}
      if(!args.length)return null;
      if(args.length===1&&args[0].k!=="ilist"){const R=tc(args[0]);if(R===id||isBaseOf(id,R))return null}
      const AT=args.map(a=>a.k==="ilist"?"<brace-enclosed initializer list>":tn(tc(a)));
      throw new E2(p,`no matching function for call to '${D.name}::${D.name}(${AT.join(", ")})'`,D.aggr?`${D.name} chưa có hàm tạo. Khởi tạo các thành viên bằng ngoặc nhọn theo đúng thứ tự khai báo: ${D.name} x{${D.fields.map(f=>f.name).join(", ")}};`:`${D.name} chưa có hàm tạo nhận (${AT.join(", ")}). Hãy viết hàm tạo ${D.name}(...) trong ${kindW(D)}.`)}
    const list=D.ctorE.slice();
    if(!list.some(E=>E.params.length===1&&E.params[0].t===id&&E.params[0].ref))list.push({implicit:true,cls:id,kind:"ctor",name:D.name,params:[{t:id,c:true,ref:true,name:"other"}],acc:"public",key:"copy"});
    const E=pickOv(list,args,p,`${D.name}::${D.name}`);
    if(!E.implicit&&!canAcc(D,E.acc))accErr(p,D,E.acc,sigM(E));
    return E.implicit?null:E}
  const deflt=id=>{const D=CLS.get(id);return !D.ctorE.length||D.ctorE.some(E=>E.params.every(q=>q.def))};
  function normParams(F){
    F.params.forEach(P=>{if(P.adims){let t=P.t+"[]";P.adims.slice(1).forEach(d=>{const cv=constVal(d);if(cv===undefined)throw new E2(d.p,"array bound is not an integer constant before ']' token","Kích thước các chiều sau của tham số mảng phải là hằng số.");t+=`[${cv}]`});P.t=t;P.adims=null}
      if(P.t==="auto")throw new E2(P.p,"'auto' parameter not permitted in this context","Tham số phải ghi rõ kiểu, không dùng auto.");
      if(P.ty&&P.ty.needStd&&!prog.using)throw new E2(P.ty.p,`'${P.ty.needStd===true?"string":P.ty.needStd}' was not declared in this scope; did you mean 'std::${P.ty.needStd===true?"string":P.ty.needStd}'?`,"Thêm using namespace std; ngay dưới các #include.");
      if((P.t==="ostream"||P.t==="istream")&&!P.ref)throw new E2(P.p,`use of deleted function 'std::basic_${P.t}<char>::basic_${P.t}(const std::basic_${P.t}<char>&)'`,`Luồng ${P.t} không chép được: tham số phải là tham chiếu ${P.t}&.`)});
    let seen=false;F.params.forEach((P,k)=>{if(P.def)seen=true;else if(seen)throw new E2(P.p,`default argument missing for parameter ${k+1}`,"Tham số có giá trị mặc định phải nằm ở CUỐI danh sách.")});
    return F.params.map(P=>P.ref?(P.c?"const ":"")+P.t+"&":P.t).join(",")}
  function regMember(D,F,kind){const key=normParams(F);
    if(F.rty&&F.rty.needStd&&!prog.using)throw new E2(F.rty.p,"'string' does not name a type; did you mean 'std::string'?","Thêm using namespace std; ngay dưới các #include.");
    const E={name:F.name,ret:F.ret,rref:!!F.rref,cret:!!(F.rref&&F.rty&&F.rty.c),params:F.params,key,p:F.p,body:F.body||null,bp:F.body?F.p:null,e:F.e,node:F,called:null,cls:D.id,cnst:!!F.cnst,acc:F.acc,virt:!!F.virt,pure:!!F.pure,kind,inits:F.inits||[],dflt:!!F.dflt};
    F.cls=D.id;
    if(kind==="ctor"){const o=D.ctorE.find(x=>x.key===key);if(o)throw new E2(F.p,`'${sigM(E)}' cannot be overloaded with '${sigM(o)}'`,`Hàm tạo với danh sách tham số này đã có ở dòng ${lineOf(o.p)}.`);D.ctorE.push(E)}
    else if(kind==="method"){const L=D.mt.get(F.name)||[];const o=L.find(x=>x.key===key&&x.cnst===E.cnst);
      if(o)throw new E2(F.p,`'${sigM(E)}' cannot be overloaded with '${sigM(o)}'`,`Hàm ${F.name} với cùng danh sách tham số đã có ở dòng ${lineOf(o.p)}.`);
      if(D.fields.some(f=>f.name===F.name))throw new E2(F.p,`declaration of '${sigM(E)}' conflicts with a previous declaration`,`${F.name} đã là tên một thành viên dữ liệu. Đặt tên hàm khác.`);
      L.push(E);D.mt.set(F.name,L)}
    MEMS.push(E);return E}
  function classDecl(D){const B=D.base?CLS.get(D.base):null;
    D.fields=[];D.mt=new Map();D.ctorE=[];D.dtorE=null;
    for(const {d,acc} of D.decls){const ty=d.ty;
      if(ty.needStd&&!prog.using){const N=ty.needStd===true?"string":ty.needStd;throw new E2(ty.p,`'${N}' does not name a type; did you mean 'std::${N}'?`,`${N} nằm trong không gian tên std. Thêm using namespace std; ngay dưới các #include.`)}
      if(isCont(ty.t)&&!has("vector"))throw new E2(ty.p,`'vector' does not name a type`,"Thiếu #include <vector> ở đầu file.");
      if(ty.t==="auto")throw new E2(ty.p,"non-static data member declared with placeholder 'auto'","Thành viên dữ liệu phải ghi rõ kiểu.");
      for(const it of d.items){let t=ty.t+"*".repeat(it.ptr||0);
        if(it.dims)for(const dd of it.dims){if(!dd)throw new E2(it.p,"mảng thành viên không ghi kích thước chưa hỗ trợ","Ghi rõ kích thước, ví dụ int a[10];","unsup");const cv=constVal(dd);if(cv===undefined||cv<=0)throw new E2(dd.p,"array bound is not an integer constant before ']' token","Mảng thành viên phải có kích thước là hằng số dương.");t+=`[${cv}]`}
        const base=isArr(t)?t.replace(/\[.*$/,""):t;
        if(base===D.id||(isCls(base)&&!CLS.get(base).fields))throw new E2(it.p,`field '${it.name}' has incomplete type '${tn(base)}'`,base===D.id?`Một ${kindW(D)} không chứa được chính nó (sẽ to vô hạn). Muốn trỏ tới phần tử cùng kiểu, dùng con trỏ: ${D.name}* ${it.name};`:`${tn(base)} phải được định nghĩa đầy đủ trước khi dùng làm thành viên.`);
        if(D.fields.some(f=>f.name===it.name))throw new E2(it.p,`redeclaration of '${tnIn(t)} ${D.name}::${it.name}'`,`Thành viên ${it.name} đã khai báo ở trên.`);
        const f={name:it.name,t,acc,init:it.init,p:it.p,c:!it.ptr&&!!ty.c,pc:it.ptr?!!ty.c:false,owner:D.id};
        if(it.init){const sv=curFn;curFn={cls:D.id,name:"",params:[]};try{const I=it.init;
            if(I.s==="()")throw new E2(I.p||it.p,"expected identifier before numeric constant",`Giá trị mặc định của thành viên viết bằng = hoặc { }: ${it.name} = ...; hoặc ${it.name}{...};`);
            if(isCls(t)){if(I.list)ctorCheck(t,I.list.items,I.list.p,true);else if(I.e&&I.e.k!=="ilist"){const R=tc(I.e);if(R!==t&&!convCtor(t,R))canTo(t,I.e)}}
            else if(I.list||isArr(t))canTo(t,I.list||I.e);else if(I.e)canTo(t,I.e,I.s!=="=")}finally{curFn=sv}}
        else if(f.c&&!isCls(t))f.needInit=true;
        D.fields.push(f)}}
    const BS=D.bases.map(b=>CLS.get(b.id));
    D.poly=!!(BS.some(X=>X.poly)||D.methods.some(F=>F.virt)||(D.dtor&&D.dtor.virt));
    D.dyn=D.poly||vbasesOf(D.id).length>0;   // đối tượng cần vptr (có hàm ảo hoặc có lớp cơ sở ảo)
    const empty=X=>!X.fields.length&&!X.dyn&&X.bases.every(b=>empty(CLS.get(b.id)));
    /* bố cục như g++ (Itanium ABI): lớp cha chính (lớp cha không ảo đầu tiên có vptr) nằm ở đầu, dùng chung vptr;
       các lớp cha không ảo khác xếp tiếp theo thứ tự khai báo, rồi tới thành viên; lớp cơ sở ảo nằm ở cuối đối tượng hoàn chỉnh.
       Lớp cha không phải POD thì phần sau dùng lại phần đệm cuối của nó (bắt đầu từ dsize, không phải sizeof) */
    const nvb=D.bases.filter(b=>!b.virt),pr=nvb.find(b=>CLS.get(b.id).dyn);D.prim=pr?pr.id:null;
    let off=0,al=1;D.nvB=[];
    if(pr){const P=CLS.get(pr.id);D.nvB.push({id:pr.id,off:0});off=P.dsize;al=P.nvalign}else if(D.dyn){off=8;al=8}
    for(const b of nvb){if(b===pr)continue;const X=CLS.get(b.id);if(empty(X)){D.nvB.push({id:b.id,off:0});continue}
      const o=Math.ceil(off/X.nvalign)*X.nvalign;D.nvB.push({id:b.id,off:o});off=o+(X.pod?X.size:X.dsize);al=Math.max(al,X.nvalign)}
    for(const f of D.fields){const a=alignOfT(f.t);off=Math.ceil(off/a)*a;f.off=off;off+=sizeOfT(f.t);al=Math.max(al,a)}
    D.dsize=off;D.nvalign=al;
    D.vbOff=new Map();for(const v of vbasesOf(D.id)){const X=CLS.get(v);if(empty(X)){D.vbOff.set(v,0);continue}const o=Math.ceil(off/X.nvalign)*X.nvalign;D.vbOff.set(v,o);off=o+X.dsize;al=Math.max(al,X.nvalign)}
    D.size=Math.max(1,Math.ceil(off/al)*al);D.align=al;D.lay=null;
    const podT=t=>{const b=isArr(t)?t.replace(/\[.*$/,""):t;return isCls(b)?CLS.get(b).pod:!(b==="string"||isVec(b))};
    D.pod=!D.bases.length&&!D.dyn&&!D.ctors.length&&!D.dtor&&D.fields.every(f=>f.acc==="public"&&!f.init&&podT(f.t));
    const ftriv=t=>{const b=isArr(t)?t.replace(/\[.*$/,""):t;return isCls(b)?!CLS.get(b).nontriv:!(b==="string"||isVec(b))};
    D.nontriv=!!(D.ctors.length||D.dtor||D.dyn||BS.some(X=>X.nontriv)||D.fields.some(f=>f.init||!ftriv(f.t)));
    const fdt=t=>{const b=isArr(t)?t.replace(/\[.*$/,""):t;return isCls(b)&&CLS.get(b).hasDtor};
    D.hasDtor=!!(D.dtor||BS.some(X=>X.hasDtor)||D.fields.some(f=>fdt(f.t)));
    D.aggr=!D.ctors.length&&!D.bases.length&&!D.poly&&D.fields.every(f=>f.acc==="public");
    if(dupOf(D.id).size)D.dup=[...dupOf(D.id)][0];
    for(const F of D.ctors)regMember(D,F,"ctor");
    if(D.dtor)D.dtorE=regMember(D,D.dtor,"dtor");
    for(const F of D.methods)regMember(D,F,"method");
    for(const [n,L] of D.mt)for(const E of L){let o=null;for(const b of D.bases){const bm=methodsOf(b.id,n);const x=bm&&bm.L.find(y=>y.key===E.key&&y.cnst===E.cnst);if(x&&x.virt){o=x;break}}
      if(o){E.virt=true;E.over=o}
      if(E.node.ovr&&!E.over)throw new E2(E.p,`'${sigM(E)}' marked 'override', but does not override`,`Lớp cha không có hàm ảo (virtual) nào trùng tên và tham số với ${n}, nên override là sai. Kiểm tra lại tên, kiểu tham số và const.`)}
    if(D.dtorE&&chainOf(D.id).some(x=>x!==D.id&&CLS.get(x).dtorE&&CLS.get(x).dtorE.virt))D.dtorE.virt=true;
    D.abstract=[...chainOf(D.id)].some(x=>[...CLS.get(x).mt.values()].flat().some(E=>E.pure&&!finalOv(D.id,E)));
    const all=[...D.ctorE,...(D.dtorE?[D.dtorE]:[]),...[...D.mt.values()].flat()];
    for(const E of all)if(E.node.body)checkFn(E.node,E)}
  /* hàm ghi đè cuối cùng của E trong lớp id (để biết lớp còn trừu tượng không) */
  function finalOv(id,E){for(const x of chainOf(id)){if(x!==E.cls&&!isBaseOf(E.cls,x))continue;const L=CLS.get(x).mt.get(E.name);const o=L&&L.find(y=>y.key===E.key&&y.cnst===E.cnst);if(o)return o.pure?null:o}return null}
  /* hàm tạo: kiểm tra danh sách khởi tạo thành viên */
  function ctorInits(F,E){const D=CLS.get(E.cls);const seen=new Set();let prevI=null,prevIdx=-1;
    /* thứ tự dựng thật: lớp cơ sở ảo → lớp cha trực tiếp (theo thứ tự khai báo) → thành viên (theo thứ tự khai báo) */
    const VB=vbasesOf(D.id),NB=D.bases.filter(b=>!b.virt).map(b=>b.id),ORD=[...VB,...NB];
    const bName=id=>CLS.get(id).name,cands=[...new Set([...D.bases.map(b=>b.id),...VB])];
    const label=x=>x.base?`base '${bName(x.base)}'`:`'${D.name}::${x.fld.name}'`,label2=x=>x.base?`  base '${bName(x.base)}'`:`  '${tnIn(x.fld.t)} ${D.name}::${x.fld.name}'`;
    for(const I of E.inits){
      const bid=cands.find(b=>bName(b)===I.name);
      if(bid){if(seen.has("^"+bid))throw new E2(I.p,`multiple initializations given for base '${bName(bid)}'`,"Lớp cha chỉ khởi tạo một lần.");seen.add("^"+bid);I.base=bid;I.ctorE=ctorCheck(bid,I.args,I.p,I.br)}
      else{const f=D.fields.find(x=>x.name===I.name);
        if(!f){const bn=D.bases.map(b=>bName(b.id));if(fieldOf(D.id,I.name))throw new E2(I.p,`class '${D.name}' does not have any field named '${I.name}'`,`${I.name} là thành viên của lớp cha. Thành viên của lớp cha được khởi tạo bằng hàm tạo của lớp cha: ${D.name}(...) : ${bn[0]||"Cha"}(...) { }.`);
          throw new E2(I.p,`class '${D.name}' does not have any field named '${I.name}'`,`${D.name} không có thành viên ${I.name}. Danh sách sau dấu : chỉ ghi thành viên dữ liệu của lớp${bn.length?` hoặc tên lớp cha ${bn.join(", ")}`:""}.`)}
        if(seen.has(I.name))throw new E2(I.p,`multiple initializations given for '${D.name}::${I.name}'`,`${I.name} đã được khởi tạo ở trên trong cùng danh sách.`);seen.add(I.name);
        I.fld=f;
        if(isCls(f.t))I.ctorE=ctorCheck(f.t,I.args,I.p,I.br);
        else if(isArr(f.t)){if(I.args.length)throw new E2(I.p,"array used as initializer","Mảng thành viên khởi tạo bằng {} rỗng hoặc gán từng phần tử trong thân hàm tạo.")}
        else{if(I.args.length>1)throw new E2(I.p,`expression list treated as compound expression in mem-initializer for '${D.name}::${I.name}' [-fpermissive]`,"Thành viên đơn chỉ nhận một giá trị.");if(I.args.length)canTo(f.t,I.args[0],I.br)}}
      /* -Wreorder: mỗi cặp liền nhau trong danh sách viết ngược thứ tự dựng thật thì g++ cảnh báo một lần */
      const idx=I.base?ORD.indexOf(I.base):ORD.length+D.fields.indexOf(I.fld);
      if(prevI&&idx<prevIdx){const vi=`Lớp cha và thành viên luôn được khởi tạo theo THỨ TỰ CỐ ĐỊNH: ${[...ORD.map(bName),...D.fields.map(x=>x.name)].join(", ")} (lớp cha trước, theo thứ tự khai báo; rồi thành viên theo thứ tự khai báo), không theo thứ tự viết sau dấu :. Hãy viết danh sách theo đúng thứ tự đó.`;
        warns.push({p:prevI.p,msg:`${label(prevI)} will be initialized after [-Wreorder]`,vi},{p:I.base?I.p:I.fld.p,msg:`${label2(I)} [-Wreorder]`,vi,sub:true},{p:E.p,msg:"  when initialized here [-Wreorder]",vi,sub:true})}
      prevI=I;prevIdx=idx}
    for(const b of [...VB,...NB])if(!seen.has("^"+b)&&!deflt(b))throw new E2(E.p,`no matching function for call to '${bName(b)}::${bName(b)}()'`,`${bName(b)} không có hàm tạo mặc định (không tham số), nên hàm tạo của ${D.name} phải gọi hàm tạo của ${VB.includes(b)&&!D.bases.some(x=>x.id===b)?"lớp cơ sở ảo":"lớp cha"} trong danh sách khởi tạo: ${D.name}(...) : ${bName(b)}(...) { }.${VB.includes(b)?` Với kế thừa ảo, lớp con cuối cùng (${D.name}) trực tiếp dựng ${bName(b)}, các lớp ở giữa không dựng nó.`:""}`);
    for(const f of D.fields){if(seen.has(f.name)||f.init)continue;
      if(isCls(f.t)&&!deflt(f.t))throw new E2(E.p,`no matching function for call to '${tn(f.t)}::${tn(f.t)}()'`,`Thành viên ${f.name} kiểu ${tn(f.t)} không có hàm tạo mặc định: phải khởi tạo nó trong danh sách sau dấu :, ví dụ ${f.name}(...).`);
      if(f.needInit)throw new E2(E.p,`uninitialized const member in 'const ${tnIn(f.t)}'`,`Thành viên hằng ${f.name} phải được khởi tạo trong danh sách sau dấu : của hàm tạo, ví dụ ${f.name}(giá_trị).`)}}
  /* khai báo biến kiểu lớp */
  function clsDecl(s,it,t){const I=it.init,D=CLS.get(t);let E=null;
    if(D.abstract)throw new E2(it.p,`cannot declare variable '${it.name}' to be of abstract type '${D.name}'`,`${D.name} còn hàm ảo thuần túy (= 0) chưa được viết, nên không tạo đối tượng ${D.name} được. Hãy tạo đối tượng của lớp con đã viết đủ các hàm đó.`);
    if(!I){E=ctorCheck(t,[],it.p,false);it.cf="def"}
    else if(I.s==="="&&I.e&&I.e.k!=="ilist"){const R=tc(I.e);
      if(R===t&&(I.e.k==="octor"||(I.e.fn&&!I.e.fn.rref))){E=null;it.cf="copy";it.cargs=[I.e]}
      else if(R===t||isBaseOf(t,R)){E=ctorCheck(t,[I.e],I.e.p,false);it.cf=E?"args":"copy";it.cargs=[I.e]}
      else{const C=convCtor(t,R);if(!C)throw new E2(I.e.p,`conversion from '${tn(R)}' to non-scalar type '${D.name}' requested`,`Không tạo được ${D.name} từ giá trị kiểu ${tn(R)}.${D.ctorE.length?"":" Lớp chưa có hàm tạo nào nhận giá trị này."}`);E=ctorCheck(t,[I.e],I.e.p,false);it.cf="args";it.cargs=[I.e]}}
    else if(I.list||(I.e&&I.e.k==="ilist")){const L=I.list||I.e;E=ctorCheck(t,L.items,L.p,true);it.cf=E?"args":"brace";it.cargs=L.items}
    else if(I.args){E=ctorCheck(t,I.args,I.p||it.p,false);it.cf=E?"args":I.args.length?"copy":"value";it.cargs=I.args}
    if(s.g&&(E||D.nontriv&&D.ctorE.length))throw new E2(it.p,"biến toàn cục kiểu lớp có hàm tạo chưa hỗ trợ","Hãy khai báo đối tượng bên trong main (hoặc trong hàm).","unsup");
    it.ctorE=E;it.t=t;it.ccx=true;
    declare(it.name,{t,c:!!s.ty.c,init:true,p:it.p,g:!!s.g,local:!s.g,cls:true,triv:!D.nontriv})}
  /* toán tử nạp chồng: a op b (thành viên a.operator op(b) hoặc hàm ngoài operator op(a, b)) */
  function opCall(e,op,L,R,un){const nm="operator"+op;const cs=[];const rhs=e.k==="idx"?e.i:e.b;
    if(isCls(L)){const r=methodsOf(L,nm);if(r)for(const E of r.L)cs.push({E,mem:true,D:r.D})}
    if(funcs.has(nm))for(const E of funcs.get(nm))cs.push({E,mem:false});
    const desc=un?`no match for 'operator${op}' (operand type is '${tn(L)}')`:`no match for 'operator${op}' (operand types are '${tn(L)}' and '${tn(R)}')`;
    const hint=()=>{const C=isCls(L)?clsName(L):isCls(R)?clsName(R):"";return op==="<<"&&L==="ostream"?`cout chưa biết cách in một ${C}. Hãy viết hàm ostream& operator<<(ostream& os, const ${C}& x) { os << ...; return os; }, hoặc in từng thành viên.`:`${C} chưa định nghĩa toán tử ${op}. Hãy viết hàm thành viên ${un?`${C} operator${op}() const`:`... operator${op}(const ${tn(R)}& khac) const`} trong lớp, hoặc hàm ngoài lớp operator${op}(...).`};
    if(!cs.length)throw new E2(e.p,desc,hint());
    const mArgs=un?[]:[rhs],fArgs=un?[e.a]:[e.a,rhs],mAT=un?[]:[R],fAT=un?[L]:[L,R];
    const ok=[];for(const c of cs){try{const E=pickOv([c.E],c.mem?mArgs:fArgs,e.p,nm,c.mem?mAT:fAT);ok.push(c)}catch(x){if(!(x instanceof E2))throw x}}
    if(!ok.length)throw new E2(e.p,desc,cs.length?`Có toán tử ${op} nhưng không phiên bản nào nhận (${un?tn(L):tn(L)+", "+tn(R)}): ${cs.map(c=>c.mem?sigM(c.E):sigOf(c.E)).join("; ")}.`:hint());
    if(ok.length>1)ok.sort((a,b)=>(b.mem?1:0)-(a.mem?1:0));
    const c=ok[0],E=c.E;
    if(c.mem){if(!canAcc(c.D,E.acc,L))accErr(e.p,c.D,E.acc,sigM(E));if(objConst(e.a)&&!E.cnst)throw new E2(e.p,`passing 'const ${tn(L)}' as 'this' argument discards qualifiers [-fpermissive]`,`Vế trái là hằng nên chỉ dùng được toán tử const. Khai báo: ... operator${op}(...) const { ... }.`);useRoot(e.a)}
    e.fn=E;e.ovl={mem:c.mem,op};if(E.called==null)E.called=e.p;
    return E.ret}
  /* gọi hàm thành viên obj.f(...) / p->f(...) / f(...) trong lớp */
  function methodT(e,O){const {id,cst}=objOf(e,O);const D=CLS.get(id);let r;
    if(e.qual){if(!chainOf(id).includes(e.qual))throw new E2(e.p,`'${clsName(e.qual)}' is not a base of '${D.name}'`,`${clsName(e.qual)} không phải lớp cha của ${D.name}.`);r=methodsOf(e.qual,e.m,e.p)}
    else r=methodsOf(id,e.m,e.p);
    if(!r){if(fieldOf(id,e.m))throw new E2(e.p,`expression cannot be used as a function`,`${e.m} là thành viên dữ liệu, không phải hàm: bỏ cặp ngoặc ( ).`);
      throw new E2(e.p,`'${kindW(D)} ${D.name}' has no member named '${e.m}'`,`${D.name} không có hàm thành viên ${e.m}. Kiểm tra chính tả hoặc khai báo thêm hàm trong ${kindW(D)} ${D.name}.`)}
    const E=pickOv(r.L,e.args,e.p,`${r.D.name}::${e.m}`);
    const inh=!canAcc(r.D,"public",id);
    if(!canAcc(r.D,E.acc,id))accErr(e.p,r.D,E.acc,sigM(E),inh&&E.acc==="public");
    if(cst&&!E.cnst)throw new E2(e.p,`passing 'const ${D.name}' as 'this' argument discards qualifiers [-fpermissive]`,`${e.o.k==="this"?"Trong hàm thành viên const, đối tượng là hằng":etxt(e.o)+" là hằng (const)"} nên chỉ gọi được hàm thành viên const. Nếu ${e.m} không sửa đối tượng, khai báo nó là const: ... ${e.m}(...) const { ... }.`);
    if(E.pure&&e.qual)throw new E2(e.p,`undefined reference to '${sigM(E)}'`,"Hàm ảo thuần túy không có thân nên không gọi trực tiếp được.","link");
    e.fn=E;e.cls=id;e.vcall=E.virt&&!e.qual;useRoot(e.o);return E.ret}
  function tc(e){const t0=tc0(e);e.tt=t0;return t0}
  function tc0(e){switch(e.k){
    case "nullptr":return "nullptr_t";
    case "this":if(!curFn||!curFn.cls)throw new E2(e.p,"invalid use of 'this' in non-member function","this chỉ dùng bên trong hàm thành viên của lớp: nó là con trỏ tới chính đối tượng đang gọi hàm.");e.cnst=!!curFn.cnst;return curFn.cls+"*";
    case "mem":return memT(e);
    case "octor":{const D=CLS.get(e.t);if(D.abstract)throw new E2(e.p,`cannot allocate an object of abstract type '${D.name}'`,`${D.name} còn hàm ảo thuần túy (= 0) nên không tạo đối tượng được.`);e.ctorE=ctorCheck(e.t,e.args,e.p,!!e.br);return e.t}
    case "addr":{const a=e.a;implField(a);
      if(a.k==="name"){a.lhs=true;const t=tc(a);if(a.r!=="var"&&a.r!=="gvar")throw new E2(e.p,"lvalue required as unary '&' operand","Chỉ lấy được địa chỉ của một biến (hoặc phần tử mảng), không lấy địa chỉ của hằng số, biểu thức hay hàm.");
        const V=sc.get(a.n);V.init=true;V.used=true;V.ref=true;
        if(isArr(t))throw new E2(e.p,"lấy địa chỉ cả mảng (&a) chưa hỗ trợ","Tên mảng tự đổi thành địa chỉ phần tử đầu: viết int* p = a; hoặc &a[0]. Còn &a có kiểu khác (con trỏ tới cả mảng, int (*)[n]) nên trình mô phỏng chưa hỗ trợ.","unsup");
        if(isVec(t)||t==="string")throw new E2(e.p,`con trỏ tới ${tn(t)} chưa hỗ trợ`,"Trình mô phỏng hỗ trợ con trỏ tới số, ký tự và con trỏ. Với vector, string hãy dùng tham chiếu (&) như Bài 17, 24.","unsup");
        e.pc=!!(V.c);e.t=t+"*";return e.t}
      if(a.k==="idx"||a.k==="deref"){const t=lv(a,"&",true).t;
        if(isArr(t))throw new E2(e.p,"lấy địa chỉ cả một hàng của mảng chưa hỗ trợ","Hãy lấy địa chỉ một phần tử: &a[i][j].","unsup");
        if(a.k==="idx"&&(a.at==="string"||a.at==="cstr"))throw new E2(e.p,"con trỏ char* tới chuỗi chưa hỗ trợ","Trình mô phỏng chưa hỗ trợ con trỏ char* (chuỗi kiểu C). Hãy dùng std::string và chỉ số s[i].","unsup");
        if(isVec(t)||t==="string")throw new E2(e.p,`con trỏ tới ${tn(t)} chưa hỗ trợ`,"Trình mô phỏng hỗ trợ con trỏ tới số, ký tự và con trỏ.","unsup");
        const B=lvBase(a);e.pc=!!((B&&B.c)||ptrPc(a));e.t=t+"*";return e.t}
      tc(a);throw new E2(e.p,"lvalue required as unary '&' operand","Chỉ lấy được địa chỉ của một biến hoặc phần tử mảng. Số, phép tính hay kết quả hàm không có địa chỉ cố định.")}
    case "new":{const T=e.t;
      if(isCls(T)){const D=CLS.get(T);if(D.abstract)throw new E2(e.p,`invalid new-expression of abstract class type '${D.name}'`,`${D.name} còn hàm ảo thuần túy (= 0) nên không tạo đối tượng được. Hãy new một lớp con.`);
        if(e.n){const nt=tc(e.n);if(!INTG.has(nt))throw new E2(e.n.p,`size in array new must have integral type`,"Số phần tử trong new T[n] phải là số nguyên.");if(e.init)throw new E2(e.p,"khởi tạo mảng đối tượng bằng new chưa hỗ trợ","Mỗi phần tử được tạo bằng hàm tạo mặc định; gán giá trị sau.","unsup");e.ctorE=ctorCheck(T,[],e.p,false)}
        else e.ctorE=ctorCheck(T,e.init.args,e.p,e.init.s==="{}");
        return T+"*"}
      if(!(isNumT(T)||isPtr(T)))throw new E2(e.p,`new ${tn(T)} chưa hỗ trợ`,"Trình mô phỏng hỗ trợ new với kiểu số, ký tự và con trỏ.","unsup");
      if(e.n){const nt=tc(e.n);if(!INTG.has(nt))throw new E2(e.n.p,`size in array new must have integral type`,"Số phần tử trong new T[n] phải là số nguyên.");const cv=constVal(e.n);if(cv!==undefined&&cv<0)throw new E2(e.n.p,"size of array is negative","Số phần tử phải lớn hơn hoặc bằng 0.");
        if(e.init&&e.init.s==="()"&&e.init.e)throw new E2(e.init.e.p,"parenthesized initializer in array new [-fpermissive]","Mảng cấp bằng new chỉ khởi tạo bằng () (toàn 0) hoặc { ... } (liệt kê).");
        if(e.init&&e.init.list){if(cv!==undefined&&e.init.list.items.length>cv)throw new E2(e.init.list.p,`too many initializers for '${tnIn(T)} [${cv}]'`,`Xin ${cv} phần tử nhưng liệt kê ${e.init.list.items.length} giá trị.`);e.init.list.items.forEach(x=>canTo(T,x,true))}}
      else if(e.init){const x=e.init.e||(e.init.list&&e.init.list.items[0]);if(e.init.list&&e.init.list.items.length>1)throw new E2(e.init.list.items[1].p,"too many initializers","new một phần tử chỉ nhận một giá trị khởi tạo.");
        if(x){const R=tc(x);if(isPtr(T))ptrInit(T,x,R,"initialization",false);else if(!isNumT(R))throw new E2(x.p,`invalid conversion from '${tn(R)}' to '${tn(T)}'`,`Giá trị khởi tạo phải là số kiểu ${tn(T)}.`)}}
      return T+"*"}
    case "del":{const t=tc(e.a);
      if(isPtr(t)&&isCls(elemT(t))){const id=elemT(t),D=CLS.get(id);if(D.poly&&!chainOf(id).some(x=>CLS.get(x).dtorE&&CLS.get(x).dtorE.virt))warns.push({p:e.p,msg:`deleting object of polymorphic class type '${D.name}' which has non-virtual destructor might cause undefined behavior [-Wdelete-non-virtual-dtor]`,vi:`${D.name} có hàm ảo nhưng hàm hủy không ảo. Nếu con trỏ ${D.name}* đang trỏ tới đối tượng lớp con, delete chỉ gọi hàm hủy của ${D.name}, phần của lớp con không được dọn. Hãy khai báo virtual ~${D.name}() {} trong lớp cha.`})}
      if(!isPtr(t))throw new E2(e.p,`type '${tn(t)}' argument given to '${e.arr?"delete[]":"delete"}', expected pointer`,"delete chỉ dùng với con trỏ (giữ địa chỉ do new trả về), không dùng với biến thường hay mảng khai báo sẵn.");
      if(e.a.k==="name"){const V=sc.get(e.a.n);const sr=V&&V.src;const fn=e.arr?"void operator delete [](void*)":"void operator delete(void*, std::size_t)";
        if(sr&&sr.k==="addr")warns.push({p:e.p,msg:`'${fn}' called on unallocated object '${sr.n}' [-Wfree-nonheap-object]`,vi:`${e.a.n} đang trỏ tới biến ${sr.n} (trên stack), không phải vùng nhớ cấp bằng new. Biến thường tự được giải phóng khi hết phạm vi; delete nó là lỗi và thường làm chương trình dừng.`});
        else if(sr&&sr.k==="new"&&sr.arr!==e.arr)warns.push({p:e.p,msg:`'${fn}' called on pointer returned from a mismatched allocation function [-Wmismatched-new-delete]`,vi:sr.arr?"Vùng nhớ cấp bằng new T[n] (mảng) phải trả lại bằng delete[] (có ngoặc vuông).":"Vùng nhớ cấp bằng new T (một phần tử) phải trả lại bằng delete (không có ngoặc vuông)."});}
      return "void"}
    case "num":if(e.mc&&!e.mcw){e.mcw=1;warns.push({p:e.p,msg:"multi-character character constant [-Wmultichar]",vi:`${e.raw} chứa nhiều ký tự trong nháy đơn nên không phải một char: g++ ghép các mã ký tự thành một số int (${e.v}). Ký tự đơn dùng nháy đơn 'A'; văn bản nhiều ký tự dùng nháy kép "..." và std::string.`})}return e.t;case "str":return "cstr";case "chr":return "char";case "bool":return "bool";
    case "name":if(e.n==="NULL"&&!e.q&&!sc.has("NULL")){e.r="null";return "nullptr_t"}return nameT(e);
    case "idx":{const B=tc(e.a);e.at=B;const I=tc(e.i);
      if(isCls(B))return opCall(e,"[]",B,I);
      if(e.a.k==="name"&&sc.has(e.a.n)){const V=sc.get(e.a.n);V.ref=true;V.used=true}
      if(isPtr(B)){if(!INTG.has(I))throw new E2(e.i.p,`invalid types '${tn(B)}[${tn(I)}]' for array subscript`,"Chỉ số phải là số nguyên.");return elemT(B)}
      if(isSeq(B)||B==="string"||B==="cstr"){
        if(!isNumT(I)||(isArr(B)&&!INTG.has(I)))throw new E2(e.i.p,`invalid types '${tn(B)}[${tn(I)}]' for array subscript`,"Chỉ số phải là số nguyên.");
        return B==="cstr"||B==="string"?"char":elemT(B)}
      throw new E2(e.p,`invalid types '${tn(B)}[${tn(I)}]' for array subscript`,`${etxt(e.a)} có kiểu ${tn(B)}, không phải mảng, vector hay chuỗi, nên không dùng [ ] được.`)}
    case "deref":{const t=tc(e.a);if(isIter(t)||isPtr(t))return elemT(t);
      throw new E2(e.p,`invalid type argument of unary '*' (have '${tn(t)}')`,`Toán tử * chỉ dùng với con trỏ (hoặc iterator): *p là “giá trị tại địa chỉ p đang giữ”. ${etxt(e.a)} có kiểu ${tn(t)}, không phải con trỏ.`)}
    case "ilist":e.items.forEach(x=>tc(x));return "ilist";
    case "npos":need("string",e.p,"std::string::npos");return "size_t";
    case "functor":stdq(e.f,e.q,e.p);return `${e.f}<${e.t}>`;
    case "ctor":{stdq("vector",e.q,e.p);need("vector",e.p,"std::vector");vecInit(e.t,e.list?{list:e.list}:{args:e.args},e.p);return e.t}
    case "bin":{const op=e.op;
      if(op==="<<"||op===">>"){const L=tc(e.a);
        if(L==="ostream"){if(op===">>")throw new E2(e.p,"no match for 'operator>>' (operand types are 'std::ostream' ...)","cout đi với <<, cin đi với >>. Mũi tên chỉ hướng dữ liệu chảy.");
          e.io="out";const R=tc(e.b);if(isCls(R)){e.io=null;return opCall(e,op,L,R)}if(R==="void")throw new E2(e.b.p,"no match for 'operator<<' (operand types are 'std::ostream' and 'void')","Hàm kiểu void không trả về giá trị nào nên không có gì để in. Gọi hàm thành một câu lệnh riêng (ví dụ f();), hoặc đổi hàm sang kiểu trả về giá trị và dùng return.");if(["istream","ostream","void"].includes(R))throw new E2(e.b.p,`no match for 'operator<<' (operand types are 'std::ostream' and '${tn(R)}')`,"Giá trị này không in ra được.");
          if(isPtr(R)&&elemT(R)==="char")throw new E2(e.b.p,"in con trỏ char* chưa hỗ trợ","cout << p với p kiểu char* in ra cả chuỗi bắt đầu từ địa chỉ đó (chuỗi kiểu C), không in địa chỉ. Trình mô phỏng chưa hỗ trợ trường hợp này.","unsup");
          if(R==="nullptr_t")throw new E2(e.b.p,"in nullptr chưa hỗ trợ","Hãy in một con trỏ cụ thể, hoặc so sánh p == nullptr.","unsup");
          if(isVec(R)||isIter(R))throw new E2(e.p,`no match for 'operator<<' (operand types are 'std::ostream' and '${tn(R)}')`,isVec(R)?"cout không in được cả vector. Dùng vòng lặp in từng phần tử, ví dụ: for (int x : v) cout << x << ' ';":"Iterator không in trực tiếp được. Muốn in phần tử mà nó trỏ tới, viết *it; muốn in vị trí, viết it - v.begin().");
          if(isArr(R)&&elemT(R)==="char")throw new E2(e.p,"in mảng char bằng cout chưa hỗ trợ","cout << a với mảng char in ra chuỗi kiểu C (tới ký tự '\\0'). Trình mô phỏng chưa hỗ trợ; hãy dùng std::string.","unsup");
          if(R==="ilist")throw new E2(e.b.p,"expected primary-expression before '{' token","Không in trực tiếp một danh sách { } được.");
          return "ostream"}
        if(L==="istream"){implField(e.b);if(op==="<<")throw new E2(e.p,"no match for 'operator<<' (operand types are 'std::istream' ...)","cin đi với >>, cout đi với <<. Mũi tên chỉ hướng dữ liệu: từ cin chảy vào biến.");
          e.io="in";
          if(e.b.k!=="name"&&!isLvE(e.b)){const R=tc(e.b);throw new E2(e.b.p,`no match for 'operator>>' (operand types are 'std::istream' and '${tn(R)}')`,"Sau cin >> phải là một biến để chứa dữ liệu, không phải một giá trị hay biểu thức.")}
          if(e.b.k!=="name"){const V=lv(e.b,">>",false);if(!(isNumT(V.t)||V.t==="string"))throw new E2(e.b.p,`no match for 'operator>>' (operand types are 'std::istream' and '${tn(V.t)}')`,isCont(V.t)?"cin không đọc được cả mảng/vector một lần. Đọc từng phần tử bằng vòng lặp: for (int i = 0; i < n; i++) cin >> a[i];":"Không đọc được vào kiểu này.");return "istream"}
          {const V0=sc.get(e.b.n);if(V0&&isPtr(V0.t))throw new E2(e.b.p,`no match for 'operator>>' (operand types are 'std::istream' and '${tn(V0.t)}')`,`${e.b.n} là con trỏ (chứa địa chỉ), không nhập số vào nó được. Muốn nhập vào biến mà nó trỏ tới, viết cin >> *${e.b.n};`);if(V0&&isCont(V0.t))throw new E2(e.b.p,`no match for 'operator>>' (operand types are 'std::istream' and '${tn(V0.t)}')`,"cin không đọc được cả mảng/vector một lần. Đọc từng phần tử bằng vòng lặp: for (int i = 0; i < n; i++) cin >> a[i];")}
          e.b.lhs=true;const R=tc(e.b);if(isCls(R)){e.io=null;return opCall(e,op,L,R)}
          if(e.b.r!=="var"&&e.b.r!=="gvar")throw new E2(e.b.p,`no match for 'operator>>' (operand types are 'std::istream' and '${tn(R)}')`,"Sau cin >> phải là một biến.");
          const V=sc.get(e.b.n);if(V.c)throw new E2(e.b.p,`no match for 'operator>>' (operand types are 'std::istream' and 'const ${tn(V.t)}')`,`${e.b.n} là hằng const, không nhập giá trị vào được.`);
          V.init=true;V.ref=true;return "istream"}
        const R=tc(e.b);if(isCls(L)||isCls(R))return opCall(e,op,L,R);
        if(INTG.has(L)&&INTG.has(R)){const W=promo(L,L)==="long long"?64:32;
          if(e.b.k==="num"&&e.b.v>=W)warns.push({p:e.p,msg:`${op==="<<"?"left":"right"} shift count >= width of type [-Wshift-count-overflow]`,vi:`Dịch ${e.b.v} bit trong khi kiểu chỉ có ${W} bit: hành vi không xác định.`});
          if(e.b.k==="un"&&e.b.op==="-"&&e.b.a.k==="num")warns.push({p:e.p,msg:`${op==="<<"?"left":"right"} shift count is negative [-Wshift-count-negative]`,vi:"Số bit dịch không được âm: hành vi không xác định."});
          return promo(L,L)}
        throw new E2(e.p,`invalid operands of types '${tn(L)}' and '${tn(R)}' to binary 'operator${op}'`,"Toán tử dịch bit chỉ dùng cho số nguyên.")}
      const L=tc(e.a),R=tc(e.b);
      if(isCls(L)||isCls(R))return opCall(e,op,L,R);
      if(op!=="&&"&&op!=="||"&&(isIter(L)||isIter(R)||isArr(L)||isArr(R)||isPtr(L)||isPtr(R)||L==="nullptr_t"||R==="nullptr_t")){const P=x=>isIter(x)||isArr(x)||isPtr(x);
        const PT=x=>isIter(x)?x:elemT(x)+"*",z=x=>x.k==="num"&&Number(x.v)===0;
        if((op==="+"||op==="-")&&P(L)&&INTG.has(R))return PT(L);
        if(op==="+"&&INTG.has(L)&&P(R))return PT(R);
        if(op==="-"&&P(L)&&P(R)&&elemT(L)===elemT(R)&&isIter(L)===isIter(R))return "long long";
        if(CMP.includes(op)&&P(L)&&P(R)&&elemT(L)===elemT(R)&&isIter(L)===isIter(R))return "bool";
        if((op==="=="||op==="!=")&&((isPtr(L)&&(R==="nullptr_t"||z(e.b)))||(isPtr(R)&&(L==="nullptr_t"||z(e.a)))||(L==="nullptr_t"&&R==="nullptr_t")))return "bool";
        throw new E2(e.p,`invalid operands of types '${tn(L)}' and '${tn(R)}' to binary 'operator${op}'`,isPtr(L)||isPtr(R)?"Với con trỏ chỉ được: cộng/trừ một số nguyên (dịch đi bao nhiêu phần tử), trừ hai con trỏ cùng mảng, so sánh hai con trỏ, so sánh với nullptr. Muốn tính với giá trị nó trỏ tới, dùng *p.":isArr(L)||isArr(R)?"Không dùng phép toán này với cả mảng. Hãy làm việc với từng phần tử a[i].":"Phép toán này không áp dụng cho iterator.")}
      if(isVec(L)||isVec(R)||L==="ilist"||R==="ilist"){if(CMP.includes(op)&&L===R)return "bool";
        throw new E2(e.p,`no match for 'operator${op}' (operand types are '${tn(L)}' and '${tn(R)}')`,"Không dùng phép toán này với cả vector. Hãy xử lý từng phần tử v[i].")}
      if(L==="void"||R==="void")throw new E2(e.p,`invalid operands of types '${tn(L)}' and '${tn(R)}' to binary 'operator${op}'`,"Hàm kiểu void không trả về giá trị nên không dùng trong phép tính được.");
      if(!((op==="&&"||op==="||")&&!["manip","void"].includes(L)&&!["manip","void"].includes(R))&&(["ostream","istream","manip","void"].includes(L)||["ostream","istream","manip","void"].includes(R)))
        throw new E2(e.p,`no match for 'operator${op}' (operand types are '${tn(L)}' and '${tn(R)}')`,`Toán tử ${op} được tính sau <<. Đặt biểu thức trong ngoặc: cout << (a ${op} b);`);
      const np=x=>x.k==="bin"&&!x.paren;
      if(op==="||"&&[e.a,e.b].some(x=>np(x)&&x.op==="&&"))warns.push({p:e.p,msg:"suggest parentheses around '&&' within '||' [-Wparentheses]",vi:"&& được tính trước ||. Thêm ngoặc để người đọc thấy rõ ý định, ví dụ a || (b && c)."});
      if(op==="&&"||op==="||")return "bool";
      if(["<","<=",">",">="].includes(op)&&np(e.a)&&["<","<=",">",">="].includes(e.a.op))warns.push({p:e.p,msg:"comparisons like 'X<=Y<=Z' do not have their mathematical meaning [-Wparentheses]",vi:"C++ tính từ trái sang phải: (a < x) cho true/false (1/0), rồi mới so sánh 1/0 với số còn lại. Hãy viết a < x && x < b."});
      if(["&","|","^"].includes(op)&&[e.a,e.b].some(x=>np(x)&&CMP.includes(x.op)))warns.push({p:e.p,msg:`suggest parentheses around comparison in operand of '${op}' [-Wparentheses]`,vi:`Phép so sánh được tính TRƯỚC toán tử bit ${op}. Ví dụ n & 1 == 0 nghĩa là n & (1 == 0). Hãy viết (n & 1) == 0.`});
      const isBoolE=x=>!x.paren?((x.k==="bin"&&(CMP.includes(x.op)||x.op==="&&"||x.op==="||"))||(x.k==="un"&&x.op==="!")||x.k==="bool"):((x.k==="bin"&&(CMP.includes(x.op)||x.op==="&&"||x.op==="||"))||(x.k==="un"&&x.op==="!"));
      if(CMP.includes(op)){const [be,ce,flip]=isBoolE(e.a)&&e.b.k==="num"?[e.a,e.b,false]:isBoolE(e.b)&&e.a.k==="num"?[e.b,e.a,true]:[null];
        if(be&&Number(ce.v)!==0&&Number(ce.v)!==1&&INTG.has(ce.t)){const cv=Number(ce.v),f=(x)=>{const a=flip?cv:x,b=flip?x:cv;return({"==":a===b,"!=":a!==b,"<":a<b,"<=":a<=b,">":a>b,">=":a>=b})[op]};
          if(f(0)===f(1))warns.push({p:e.p,msg:`comparison of constant '${ce.raw||cv}' with boolean expression is always ${f(0)?"true":"false"} [-Wbool-compare]`,vi:`Vế ${flip?"phải":"trái"} là kết quả đúng/sai (chỉ có thể là 0 hoặc 1), nên so sánh với ${ce.raw||cv} luôn ${f(0)?"đúng":"sai"}. Kiểm tra lại cách viết điều kiện.`})}}
      if(["==","!="].includes(op)&&[e.a,e.b].some(x=>np(x)&&["<","<=",">",">="].includes(x.op)))warns.push({p:e.p,msg:`suggest parentheses around comparison in operand of '${op}' [-Wparentheses]`,vi:`Phép so sánh <, > được tính trước ${op}. Thêm ngoặc để thể hiện rõ ý định, ví dụ (a < b) ${op} (b < c).`});
      if(op==="^"&&e.a.k==="num"&&e.b.k==="num"&&!e.a.paren&&/^\d+$/.test(e.a.raw||"")&&/^\d+$/.test(e.b.raw||"")&&(e.a.v===2||e.a.v===10)){const n=Number(e.b.v),r=Number(e.a.v)^n;
        warns.push({p:e.p,msg:e.a.v===2?`result of '2^${n}' is ${r}; did you mean '1 << ${n}' (${2**n})? [-Wxor-used-as-pow]`:`result of '10^${n}' is ${r}; did you mean '1e${n}'? [-Wxor-used-as-pow]`,vi:`^ là phép XOR bit, không phải lũy thừa: ${e.a.v}^${n} = ${r}. Lũy thừa dùng std::pow (trong <cmath>)${e.a.v===2?` hoặc dịch bit 1 << ${n}`:""}.`})}
      if(["==","!="].includes(op)&&e.a.k==="un"&&e.a.op==="!"&&!e.a.paren&&!(e.b.k==="num"&&Number(e.b.v)===0))warns.push({p:e.p,msg:"logical not is only applied to the left hand side of comparison [-Wlogical-not-parentheses]",vi:"! chỉ áp dụng cho vế trái: !a == b nghĩa là (!a) == b. Muốn phủ định cả phép so sánh, viết !(a == b) hoặc a != b."});
      if(CMP.includes(op)&&INTG.has(L)&&INTG.has(R)&&L!=="bool"&&R!=="bool"&&(isU(L)!==isU(R))){const sgn=isU(L)?e.b:e.a,sT=promo(isU(L)?R:L,isU(L)?R:L),uT=isU(L)?L:R;if(!(sgn.k==="num"&&sgn.v>=0)&&!(sT==="long long"&&uT==="unsigned")){const sz=[e.a,e.b].some(x=>x.k==="mc"&&(x.m==="size"||x.m==="length"));warns.push({p:e.p,msg:`comparison of integer expressions of different signedness: '${tn(isU(L)?L:promo(L,L))}' and '${tn(isU(R)?R:promo(R,R))}' [-Wsign-compare]`,vi:sz?"size() trả về số không dấu (size_t), còn biến đếm là int có dấu. g++ cảnh báo vì nếu so sánh với số âm, số âm bị đổi thành số dương rất lớn. Cách quen dùng: ép kiểu (int)v.size(), hoặc khai báo biến đếm kiểu size_t.":"So sánh số có dấu với số không dấu: số âm bị đổi thành số dương rất lớn nên kết quả có thể sai. Ép về cùng kiểu trước khi so sánh."})}}
      const sL=L==="string"||L==="cstr",sR=R==="string"||R==="cstr";
      if(sL||sR){
        if(op==="+"&&((L==="string"&&(sR||R==="char"))||(R==="string"&&(sL||L==="char"))))return "string";
        if(CMP.includes(op)&&sL&&sR&&(L==="string"||R==="string"))return "bool";
        if(op==="+"&&L==="cstr"&&R==="cstr")throw new E2(e.p,"invalid operands of types 'const char*' and 'const char*' to binary 'operator+'","Không cộng được hai chuỗi hằng \"...\" + \"...\". Hãy dùng std::string, hoặc in bằng nhiều <<.");
        throw new E2(e.p,`invalid operands of types '${tn(L)}' and '${tn(R)}' to binary 'operator${op}'`,"Không dùng phép toán này giữa chuỗi và số được. Muốn in số kèm chữ, dùng nhiều << .")}
      if(["&","|","^"].includes(op)){if(INTG.has(L)&&INTG.has(R))return promo(L,R);throw new E2(e.p,`invalid operands of types '${tn(L)}' and '${tn(R)}' to binary 'operator${op}'`,`Toán tử bit ${op} chỉ dùng cho số nguyên.${op==="^"?" Lưu ý: ^ là phép XOR bit, không phải lũy thừa. Lũy thừa dùng std::pow(a, b) trong <cmath>.":""}`)}
      {const cv=x=>x.k==="num"&&x.t==="int"?x.v:x.k==="name"&&x.r==="macro"&&MACRO[x.n][1]==="int"?MACRO[x.n][0]:x.k==="un"&&x.op==="-"&&x.a.k==="num"&&x.a.t==="int"?-x.a.v:undefined;const A=cv(e.a),B=cv(e.b);
        if(A!==undefined&&B!==undefined&&["+","-","*"].includes(op)){const ex=op==="+"?A+B:op==="-"?A-B:A*B;if(ex>2147483647||ex<-2147483648)warns.push({p:e.p,msg:`integer overflow in expression of type 'int' results in '${wrapTo("int",ex)}' [-Woverflow]`,vi:`Kết quả đúng là ${ex} nhưng vượt phạm vi int nên bị tràn.`})}}
      if(op==="%"&&(isFlT(L)||isFlT(R)))throw new E2(e.p,`invalid operands of types '${tn(L)}' and '${tn(R)}' to binary 'operator%'`,"Toán tử % (chia lấy dư) chỉ dùng cho số nguyên. Với số thực dùng fmod trong <cmath>.");
      if(CMP.includes(op))return "bool";
      return promo(L,R)}
    case "un":{const t=tc(e.a);if(isCls(t))return opCall(e,e.op,t,null,true);if(e.op==="!"&&(isPtr(t)||t==="nullptr_t"))return "bool";if(!isNumT(t))throw new E2(e.p,`no match for 'operator${e.op}' (operand type is '${tn(t)}')`,"Toán tử này chỉ dùng với số.");
      if(e.op==="~"&&!INTG.has(t))throw new E2(e.p,`wrong type argument to bit-complement`,"Toán tử ~ (đảo bit) chỉ dùng cho số nguyên.");
      return e.op==="!"?"bool":promo(t,t)}
    case "cond":{const c=tc(e.c);if(!isNumT(c)&&c!=="ostream")throw new E2(e.c.p,`could not convert '${tn(c)}' to 'bool'`,"Phần điều kiện (trước dấu ?) phải là giá trị đúng/sai hoặc số.");
      const A=tc(e.a),B=tc(e.b);const sA=A==="string"||A==="cstr",sB=B==="string"||B==="cstr";
      if(isNumT(A)&&isNumT(B))return e.rt=(A===B?A:promo(A,B));
      if(isPtr(A)&&(A===B||B==="nullptr_t"))return e.rt=A;if(isCls(A)&&A===B)return e.rt=A;if(isPtr(B)&&A==="nullptr_t")return e.rt=B;
      if(sA&&sB)return e.rt=(A==="string"||B==="string"?"string":"cstr");
      throw new E2(e.p,`operands to '?:' have different types '${tn(A)}' and '${tn(B)}'`,"Hai nhánh của ?: phải cùng loại: cùng là số, hoặc cùng là chuỗi.")}
    case "pre":case "post":{const V=lv(e.a,e.op,true);if(!isNumT(V.t)&&!isPtr(V.t))throw new E2(e.p,`no match for 'operator${e.op}' (operand type is '${tn(V.t)}')`,"++ và -- chỉ dùng với biến số.");V.init=true;return V.t}
    case "as":{const V=lv(e.a,e.op,e.op!=="=");const L=V.t;
      if(isVec(L)||e.b.k==="ilist"){if(e.op!=="=")throw new E2(e.p,`no match for 'operator${e.op}' (operand types are '${tn(L)}' and '${tn(tc(e.b))}')`,"Phép toán này không dùng cho cả vector.");canTo(L,e.b);V.init=true;return L}
      const R=tc(e.b);
      if(R==="void")throw new E2(e.b.p,"void value not ignored as it ought to be","Hàm kiểu void không trả về giá trị nên không gán được.");
      if(isCls(L)||isCls(R)){
        if(e.op==="="&&isCls(L)&&!methodsOf(L,"operator=")){if(R===L||isBaseOf(L,R)){V.init=true;return L}
          if(convCtor(L,R)){e.cE=ctorCheck(L,[e.b],e.b.p,false);e.cT=L;V.init=true;return L}}
        const r=opCall(e,e.op,L,R);V.init=true;return r}
      if(isPtr(L)){if(e.op==="+="||e.op==="-="){if(!INTG.has(R))throw new E2(e.p,`invalid operands of types '${tn(L)}' and '${tn(R)}' to binary 'operator${e.op.slice(0,-1)}'`,"Con trỏ chỉ cộng/trừ được với số nguyên.");V.init=true;return L}
        if(e.op!=="=")throw new E2(e.p,`invalid operands of types '${tn(L)}' and '${tn(R)}' to binary 'operator${e.op.slice(0,-1)}'`,"Phép toán này không dùng với con trỏ.");
        ptrInit(L,e.b,R,"assignment",!!V.pc);if(e.a.k==="name")ptrSrc(V,e.b);V.init=true;return L}
      if(isPtr(R)||R==="nullptr_t")throw new E2(e.b.p,`invalid conversion from '${tn(R)}' to '${tn(L)}' [-fpermissive]`,`${etxt(e.b)} là địa chỉ (con trỏ), không gán vào biến kiểu ${tn(L)} được. Muốn lấy giá trị tại địa chỉ đó, viết *${etxt(e.b)}.`);
      if(L==="string"){if(!(["string","cstr","char"].includes(R)||(e.op==="="&&INTG.has(R)))||!["=","+="].includes(e.op))throw new E2(e.p,`no match for 'operator${e.op}' (operand types are 'std::string' and '${tn(R)}')`,"Phép toán này không áp dụng cho chuỗi.")}
      else{if(!isNumT(R))throw new E2(e.b.p,`cannot convert '${tn(R)}' to '${tn(L)}' in assignment`,`Không gán ${R==="cstr"?"chuỗi \"...\"":"giá trị kiểu "+tn(R)} cho biến kiểu ${tn(L)} được.${L==="char"&&R==="cstr"?" Ký tự đơn phải dùng nháy đơn: 'A'.":""}`);
        if(e.op==="%="&&(isFlT(L)||isFlT(R)))throw new E2(e.p,`invalid operands to binary 'operator%'`,"% chỉ dùng cho số nguyên.");
        if(["&=","|=","^=","<<=",">>="].includes(e.op)&&!(INTG.has(L)&&INTG.has(R)))throw new E2(e.p,`invalid operands to binary 'operator${e.op.slice(0,-1)}'`,"Toán tử bit chỉ dùng cho số nguyên.")}
      V.init=true;return L}
    case "cast":{const t=tc(e.a);if(isPtr(t))throw new E2(e.p,`invalid cast from type '${tn(t)}' to type '${tn(e.ty.t)}'`,"Ép con trỏ thành số (hoặc ngược lại) chưa hỗ trợ trong trình mô phỏng; khóa học không cần thao tác này.","unsup");if(!isNumT(t)||!isNumT(e.ty.t))throw new E2(e.p,`invalid cast from type '${tn(t)}' to type '${tn(e.ty.t)}'`,"Không ép kiểu giữa chuỗi và số được. (Chuyển chuỗi thành số dùng std::stoi ở bài sau.)");return e.ty.t}
    case "sizeof":{if(e.a){if(e.a.k==="name")e.a.lhs=true;e.st=tc(e.a);if(e.st==="cstr")e.slen=e.a.v.length;if(e.a.k==="name"&&sc.has(e.a.n)&&sc.get(e.a.n).param&&isArr(e.st)&&(e.par=true))warns.push({p:e.p,msg:`'sizeof' on array function parameter '${etxt(e.a)}' will return size of 'int*' [-Wsizeof-array-argument]`,vi:"Trong hàm, tham số int a[] thực chất là con trỏ: sizeof(a) cho kích thước con trỏ (8 byte), không phải cả mảng. Hãy truyền thêm số phần tử n."})}else if(e.ty.needStd&&!prog.using)stdq("string",false,e.ty.p);return "size_t"}
    case "lim":{stdq("numeric_limits",e.q,e.p);need("limits",e.p,"std::numeric_limits");if(!["max","min","lowest"].includes(e.w))throw new E2(e.p,`'${e.w}' is not a member of 'std::numeric_limits'`,"Dùng max(), min() hoặc lowest().");return e.ty.t}
    case "call":{
      if(e.qual){if(!curFn||!curFn.cls||!chainOf(curFn.cls).includes(e.qual))throw new E2(e.p,`cannot call member function '${clsName(e.qual)}::${e.f}' without object`,`Cú pháp ${clsName(e.qual)}::${e.f}(...) chỉ dùng bên trong hàm thành viên của ${clsName(e.qual)} hoặc lớp con của nó.`);
        Object.assign(e,{k:"mc",o:{k:"this",p:e.p,impl:true},m:e.f,arrow:true});return tc0(e)}
      if(!e.q&&curFn&&curFn.cls&&methodsOf(curFn.cls,e.f,e.p)){Object.assign(e,{k:"mc",o:{k:"this",p:e.p,impl:true},m:e.f,arrow:true,impl:true});return tc0(e)}
      if(!e.q&&funcs.has(e.f))return callUser(e);
      if(LIBF[e.f]){if(e.f!=="__gcd"&&!CTYPE.includes(e.f))stdq(e.f,e.q,e.p);return libT(e)}
      const A=()=>e.args.map(a=>tc(a));
      if(e.f==="getline"){stdq("getline",e.q,e.p);need("string",e.p,"std::getline");
        if(e.args.length!==2)throw new E2(e.p,"no matching function for call to 'getline'","Cú pháp: getline(cin, bien_chuoi);");
        const t0=tc(e.args[0]);const b=e.args[1];if(b.k==="name")b.lhs=true;const t1=tc(b);
        if(t0!=="istream"||b.k!=="name"||t1!=="string")throw new E2(e.p,`no matching function for call to 'getline(${tn(t0)}&, ${tn(t1)}&)'`,"getline(cin, s) chỉ đọc vào biến kiểu std::string.");
        sc.get(b.n).init=true;sc.get(b.n).ref=true;return "istream"}
      if(e.f==="setprecision"||e.f==="setw"){stdq(e.f,e.q,e.p);need("iomanip",e.p,"std::"+e.f);const t=A();if(t.length!==1||!INTG.has(t[0]))throw new E2(e.p,`no matching function for call to '${e.f}'`,`${e.f}(n) cần đúng một số nguyên.`);return "manip"}
      if(CMATH[e.f]){need("cmath",e.p,e.f);const t=A();if(t.length!==CMATH[e.f]||!t.every(isNumT))throw new E2(e.p,`no matching function for call to '${e.f}'`,`Sai số lượng hoặc kiểu tham số của ${e.f}.`);return e.f==="abs"&&INTG.has(t[0])?promo(t[0],t[0]):"double"}
      if(e.f==="printf"||e.f==="scanf")throw new E2(e.p,`'${e.f}' chưa có trong trình mô phỏng`,`${e.f} là hàm của C. Khóa học dùng std::cout và std::cin.`,"unsup");
      if(STD_UNSUP.has(e.f)&&(e.q||prog.using||["max","min","swap","exit","rand","srand","time","getchar","strlen","isdigit","isalpha","toupper","tolower"].includes(e.f)))throw new E2(e.p,`${e.q?"std::":""}${e.f}() chưa có trong trình mô phỏng`,`${e.f} là hàm hợp lệ của thư viện chuẩn nhưng trình mô phỏng chưa hỗ trợ. Hãy tự viết hàm này (một bài luyện tập tốt!) hoặc chạy bằng g++ trên máy thật.`,"unsup");
      {const later=prog.items.find(x=>x.k==="fn"&&x.name===e.f);
       if(later)throw new E2(e.p,`'${e.f}' was not declared in this scope`,`Hàm ${e.f} được viết ở dòng ${lineOf(later.p)}, SAU chỗ gọi. Trình biên dịch đọc từ trên xuống nên lúc này chưa biết hàm đó. Chuyển hàm lên phía trên, hoặc thêm nguyên mẫu (prototype) phía trên main: ${protoTxt(later)};`);
       const ci=[...funcs.keys()].find(k=>k.toLowerCase()===e.f.toLowerCase());
       if(ci)throw new E2(e.p,`'${e.f}' was not declared in this scope; did you mean '${ci}'?`,`C++ phân biệt chữ hoa và chữ thường: hàm của bạn tên là ${ci}.`);
       if(sc.has(e.f))throw new E2(e.p,`'${e.f}' cannot be used as a function`,`${e.f} là một biến, không phải hàm.`);
       throw new E2(e.p,`'${e.f}' was not declared in this scope`,"Trình biên dịch không biết hàm này. Kiểm tra chính tả, hoặc viết hàm (hay nguyên mẫu của nó) ở phía trên chỗ gọi.")}}
    case "mc":{const t=tc(e.o);
      if(isCls(t)||(e.arrow&&isPtr(t)&&isCls(elemT(t))))return methodT(e,t);
      if(e.arrow)throw new E2(e.p,`base operand of '->' has non-pointer type '${tn(t)}'`,`Dấu -> chỉ dùng với con trỏ tới đối tượng. ${etxt(e.o)} có kiểu ${tn(t)}: dùng dấu chấm.`);
      if(t==="istream"){e.args.forEach(a=>tc(a));if(e.m==="ignore")return "istream";if(["fail","good","eof"].includes(e.m))return "bool";if(e.m==="clear")return "void"}
      {const r=memberT(e,t);if(r)return r}
      throw new E2(e.p,`'${tn(t)}' has no member named '${e.m}'`,`Kiểu ${tn(t)} không có hàm ${e.m}().`)}
  }}
  function ceBad(e){switch(e.k){
    case "num":case "str":case "chr":case "bool":case "sizeof":case "lim":return null;
    case "name":return e.r==="macro"||((e.r==="var"||e.r==="gvar")&&sc.get(e.n).ce)?null:e;
    case "bin":return ceBad(e.a)||ceBad(e.b);
    case "un":case "cast":return ceBad(e.a);
    case "cond":return ceBad(e.c)||ceBad(e.a)||ceBad(e.b);
    default:return e}}
  /* -Wsequence-point: cùng một biến vừa bị sửa vừa được dùng trong một biểu thức */
  function seqCheck(root){
    const go=(e,top)=>{const mods=[],reads=[];
      (function walk(x,isTarget){if(!x||typeof x!=="object")return;
        if(x.k==="bin"&&x.io){go(x.a);go(x.b);return}
        if(x.k==="pre"||x.k==="post"){if(x.a.k==="name"){mods.push({n:x.a.n,p:x.p,inc:true})}return}
        if(x.k==="as"){if(x.a.k==="name"&&!(x===e&&top))mods.push({n:x.a.n,p:x.p,inc:false});walk(x.b);return}
        if(x.k==="name"){reads.push(x.n);return}
        for(const k of ["a","b","c","o"])if(x[k])walk(x[k]);if(x.args)x.args.forEach(a=>walk(a))})(e);
      const done=new Set();
      for(const m of mods){if(done.has(m.n))continue;
        const nm=mods.filter(x=>x.n===m.n).length,nr=reads.filter(r=>r===m.n).length;
        if(nm>=2||(m.inc&&nr>=1)){done.add(m.n);warns.push({p:m.p,msg:`operation on '${m.n}' may be undefined [-Wsequence-point]`,vi:`Biến ${m.n} vừa bị thay đổi (++, --, gán) vừa được dùng ở chỗ khác trong cùng một biểu thức. C++ không quy định thứ tự tính nên kết quả tùy trình biên dịch. Hãy tách thành nhiều câu lệnh.`})}}};
    go(root,true)}
  let loopD=0,swD=0;
  const constVal=e=>{switch(e.k){case "num":return INTG.has(e.t)?Number(e.v):undefined;case "chr":case "bool":return e.v;
    case "name":{const V=sc.get(e.n);return V&&V.cv!==undefined?V.cv:undefined}
    case "un":{const a=constVal(e.a);if(a===undefined)return;return e.op==="-"?-a:e.op==="~"?~a:e.op==="!"?(a?0:1):a}
    case "bin":{const a=constVal(e.a),b=constVal(e.b);if(a===undefined||b===undefined)return;
      const M={"+":a+b,"-":a-b,"*":a*b,"/":b?Math.trunc(a/b):undefined,"%":b?a%b:undefined,"<<":a<<b,">>":a>>b,"&":a&b,"|":a|b,"^":a^b};return M[e.op]}
    default:return}};
  const condCheck=(e,kw)=>{const t=tc(e);
    if(!isNumT(t)&&!isPtr(t)&&t!=="istream"&&t!=="ostream")throw new E2(e.p,`could not convert '${tn(t)}' to 'bool'`,`Điều kiện của ${kw} phải cho kết quả đúng/sai (hoặc một số). Ví dụ: ${kw} (s == "abc").`);
    if(e.k==="as"&&e.op==="="&&!e.paren)warns.push({p:e.p,msg:"suggest parentheses around assignment used as truth value [-Wparentheses]",vi:"Bạn đang GÁN (=) chứ không phải SO SÁNH (==). Biểu thức gán có giá trị là số vừa gán, nên điều kiện gần như luôn đúng và biến bị đổi giá trị. Hãy viết ==."});
    seqCheck(e)};
  const isEmpty=s=>s&&s.k==="empty";
  const sub=s=>{if(s.k==="decl"){enter();chk(s);leave()}else chk(s)};
  const colOf=p=>p-src.lastIndexOf("\n",p-1);
  function misInd(list){
    for(let k=0;k<list.length-1;k++){const s=list[k],N=list[k+1];
      const chkG=(gp,B,kw)=>{if(!B||B.k==="block")return;
        const sameLine=lineOf(B.p)===lineOf(gp);if(lineOf(N.p)<=lineOf(B.p))return;
        const bad=sameLine?(B.k==="empty"&&(N.k==="block"||colOf(N.p)>colOf(gp))):colOf(N.p)===colOf(B.p);
        if(bad)warns.push({p:gp,msg:`this '${kw}' clause does not guard... [-Wmisleading-indentation]`,vi:`Thân của ${kw} chỉ gồm một câu lệnh${B.k==="empty"?" (ở đây là dấu ; rỗng)":""}, nhưng dòng ${lineOf(N.p)} thụt lề như thể nằm trong ${kw}. Dòng đó luôn chạy. Hãy dùng { } để gom các lệnh của ${kw}.`})};
      if(s.k==="if"){if(s.el)chkG(s.ep,s.el,"else");else chkG(s.p,s.th,"if")}
      else if(s.k==="while"||s.k==="for")chkG(s.p,s.body,s.k)}}
  function selfCall(e,F){if(!e||typeof e!=="object")return false;
    if(e.k==="call"&&e.fn===F)return true;
    if(e.k==="cond")return selfCall(e.c,F)||(selfCall(e.a,F)&&selfCall(e.b,F));
    if(e.k==="bin"&&(e.op==="&&"||e.op==="||"))return selfCall(e.a,F);
    for(const k of ["a","b","o"])if(e[k]&&selfCall(e[k],F))return true;
    if(e.args)for(const a of e.args)if(selfCall(a,F))return true;return false}
  function anyRet(s,F){if(!s||typeof s!=="object")return false;if(Array.isArray(s))return s.some(x=>anyRet(x,F));
    if(s.k==="ret")return !(s.e&&selfCall(s.e,F));
    return ["th","el","body"].some(k=>anyRet(s[k],F))||(s.items?s.items.some(i=>i.k==="stmt"&&anyRet(i.s,F)):false)}
  function stmtRec(s,F){switch(s.k){
    case "expr":return selfCall(s.e,F);case "ret":return !!s.e&&selfCall(s.e,F);
    case "decl":return s.items.some(it=>it.init&&it.init.e&&selfCall(it.init.e,F));
    case "block":return pathRec(s.body,F);
    case "if":return selfCall(s.c,F)||(!!s.el&&pathRec([s.th],F)&&pathRec([s.el],F));
    case "while":return selfCall(s.c,F);case "do":return pathRec([s.body],F)||selfCall(s.c,F);
    case "for":return (!!s.init&&stmtRec(s.init,F))||selfCall(s.c,F);case "switch":return selfCall(s.e,F);
    default:return false}}
  function pathRec(list,F){for(const s of list){if(stmtRec(s,F))return true;if(anyRet(s,F))return false}return false}
  /* khai báo mảng, vector, tham chiếu */
  function vecInit(T,I,p){if(!I)return;const E=elemT(T);
    if(I.list)return canTo(T,I.list);
    if(I.e)return canTo(T,I.e);
    if(I.args){const A=I.args;if(!A.length)return;
      const bad=()=>{throw new E2(p,`no matching function for call to '${tn(T)}(${A.map(a=>a.k==="ilist"?"{...}":tn(tc(a))).join(", ")})'`,"vector khởi tạo bằng (n) để có n phần tử 0, (n, x) để có n phần tử bằng x, { ... } để liệt kê, hoặc chép từ vector khác cùng kiểu.")};
      if(A.length===1&&A[0].k==="ilist")return canTo(T,A[0]);
      const X=tc(A[0]);if(A.length===1&&X===T)return;if(!isNumT(X))bad();
      if(A.length===2)return canTo(E,A[1]);if(A.length>2)bad()}}
  function declCompound(s,it,t,preR){const I=it.init;
    if(s.ref){
      if(!I||!I.e)throw new E2(it.p,`'${it.name}' declared as reference but not initialized`,"Biến tham chiếu phải gắn vào một biến ngay khi khai báo, ví dụ int& r = x;");
      if(it.dims)throw new E2(it.p,`declaration of '${it.name}' as array of references`,"Không có mảng tham chiếu.");
      const e=I.e;let R;
      if(isLvE(e)){if(e.k==="name"){e.lhs=true;R=tc(e)}else R=lv(e,"=",true).t;
        const B=e.k==="name"?sc.get(e.n):lvBase(e);
        if(B&&B.c&&!s.ty.c)throw new E2(e.p,`binding reference of type '${tn(t==="auto"?R:t)}&' to 'const ${tn(R)}' discards qualifiers`,`${etxt(e)} là const nên chỉ gắn được vào const ${tn(R)}&.`);
        if(B){B.ref=true;B.used=true}}
      else{R=tc(e);if(!s.ty.c)throw new E2(e.p,`cannot bind non-const lvalue reference of type '${tn(t==="auto"?R:t)}&' to an rvalue of type '${tn(R)}'`,"Tham chiếu thường phải gắn vào một biến có sẵn, không gắn vào giá trị tạm như số hay kết quả phép tính.");it.tmp=true}
      if(t==="auto")t=R;
      else if(t!==R&&!isBaseOf(t,R)&&!(it.tmp&&isNumT(t)&&isNumT(R)))throw new E2(e.p,`invalid initialization of reference of type '${tn(t)}&' from expression of type '${tn(R)}'`,`Tham chiếu ${tn(t)}& chỉ gắn được vào biến kiểu ${tn(t)}.`);
      it.t=t;declare(it.name,{t,c:s.ty.c,init:true,p:it.p,local:!s.g,isRef:true});return}
    if(t==="auto"){
      if(it.dims)throw new E2(it.p,`'${it.name}' declared as array of 'auto'`,"Mảng phải ghi rõ kiểu phần tử.");
      if(!I||!I.e||I.e.k==="ilist")throw new E2(it.p,`unable to deduce 'auto' for '${it.name}'`,"auto cần một giá trị khởi tạo rõ kiểu (không phải danh sách { }).");
      t=preR??tc(I.e);I.copy=true}
    if(it.dims){const base=t;let dims="";
      if(isCont(base)&&false){}
      it.dims.forEach((d,k)=>{
        if(d===null){if(k>0)throw new E2(it.p,`declaration of '${it.name}' as multidimensional array must have bounds for all dimensions except the first`,"Mảng nhiều chiều phải ghi kích thước mọi chiều; chỉ chiều đầu được bỏ trống khi có danh sách khởi tạo.");dims+="[]";return}
        const dt=tc(d);if(!INTG.has(dt))throw new E2(d.p,`size of array '${it.name}' has non-integral type '${tn(dt)}'`,"Kích thước mảng phải là số nguyên.");
        const cv=constVal(d);
        if(cv===undefined){
          if(s.g)throw new E2(d.p,"array bound is not an integer constant before ']' token","Mảng toàn cục phải có kích thước là hằng số (ví dụ const int MAXN = 1000;).");
          if(k>0)throw new E2(d.p,"kích thước chiều sau của mảng phải là hằng","Mảng hai chiều có kích thước thay đổi: hãy dùng vector<vector<int>> a(n, vector<int>(m)).","unsup");
          it.vla=d;dims+="[]";return}
        if(cv<0)throw new E2(d.p,`size of array '${it.name}' is negative`,"Kích thước mảng phải lớn hơn 0.");
        if(cv>20000000)throw new E2(d.p,"mảng quá lớn cho trình mô phỏng","Trình mô phỏng giới hạn mảng tối đa 20 000 000 phần tử.","unsup");
        dims+=`[${cv}]`});
      t=base+dims;
      if(it.dims[0]===null){const L=I&&(I.list||(I.e&&I.e.k==="ilist"?I.e:null));if(!L)throw new E2(it.p,`storage size of '${it.name}' isn't known`,"Mảng không ghi kích thước thì phải có danh sách khởi tạo, ví dụ int a[] = {1, 2, 3};");
        t=base+`[${L.items.length}]`+dims.slice(2)}
      if(it.vla&&I)throw new E2(it.p,`variable-sized object '${it.name}' may not be initialized`,"Mảng có kích thước là biến (đọc lúc chạy) không khởi tạo bằng { } được. Hãy gán từng phần tử sau khi khai báo, hoặc dùng vector<int> a(n, 0).");
      if(I){if(I.args)throw new E2(it.p,"array must be initialized with a brace-enclosed initializer","Khởi tạo mảng bằng { ... }.");canTo(t,I.list||I.e)}}
    else if(isVec(t)){if(!has("vector"))throw new E2(it.p,"'vector' was not declared in this scope","Thiếu #include <vector>.");vecInit(t,I,it.p)}
    else if(t==="string"&&I&&I.args){const A=I.args,ts=A.map(a=>tc(a));
      if(!((A.length===2&&isNumT(ts[0])&&INTG.has(ts[1]))||(A.length===1&&(ts[0]==="string"||ts[0]==="cstr"))))throw new E2(it.p,`no matching function for call to 'std::string(${ts.map(tn).join(", ")})'`,"string khởi tạo bằng (n, 'c') để có n ký tự c, hoặc bằng một chuỗi khác.")}
    else if(I&&I.list)canTo(t,I.list);
    it.t=t;declare(it.name,{t,c:it.ptr?!!it.pconst:s.ty.c,pc:it.ptr?!!s.ty.c:false,ce:!!s.ty.ce,init:true,p:it.p,g:!!s.g,local:!s.g,cnt:isCont(t)})}
  /* hàm thành viên của vector và string */
  function memberT(e,t){const m=e.m,A=e.args,n=A.length,B=lvBase(e.o),cst=!!(B&&B.c);
    const bad=()=>{throw new E2(e.p,`no matching function for call to '${tn(t)}::${m}(${A.map(a=>a.k==="ilist"?"<brace-enclosed initializer list>":tn(tc(a))).join(", ")})'`,`Sai số lượng hoặc kiểu đối số khi gọi ${m}().`)};
    const mut=()=>{if(cst)throw new E2(e.p,`passing 'const ${tn(t)}' as 'this' argument discards qualifiers [-fpermissive]`,`${etxt(e.o)} là const (thường là tham số const ${tn(t)}&) nên không gọi được ${m}() làm thay đổi nó. Bỏ const ở tham số nếu hàm cần sửa.`);if(B){B.init=true;B.ref=true;B.used=true}};
    const num=k=>{const x=tc(A[k]);if(!isNumT(x))bad();return x};
    if(isVec(t)){const E=elemT(t),IT="iter<"+E+">";
      switch(m){
        case "size":if(n)bad();return "size_t";
        case "empty":if(n)bad();return "bool";
        case "push_back":case "emplace_back":if(n!==1)bad();mut();canTo(E,A[0]);return "void";
        case "pop_back":case "clear":if(n)bad();mut();return "void";
        case "back":case "front":if(n)bad();return E;
        case "at":if(n!==1)bad();num(0);return E;
        case "resize":if(n<1||n>2)bad();mut();num(0);if(n===2)canTo(E,A[1]);return "void";
        case "assign":if(n!==2)bad();mut();num(0);canTo(E,A[1]);return "void";
        case "begin":case "end":if(n)bad();return IT;
        case "insert":{if(n!==2)bad();mut();if(tc(A[0])!==IT)bad();canTo(E,A[1]);return IT}
        case "erase":{if(n<1||n>2)bad();mut();for(const a of A)if(tc(a)!==IT)bad();return IT}}
      throw new E2(e.p,`'class ${tn(t)}' has no member named '${m}'`,m==="length"?"vector dùng size() để lấy số phần tử (length() là hàm của string).":["push","add","append"].includes(m)?"Thêm phần tử vào cuối vector dùng push_back(x).":`vector không có hàm ${m}().`)}
    if(t==="string"){
      switch(m){
        case "size":case "length":if(n)bad();return "size_t";
        case "empty":if(n)bad();return "bool";
        case "substr":if(n<1||n>2)bad();num(0);if(n>1)num(1);return "string";
        case "find":case "rfind":{if(n<1||n>2)bad();const x=tc(A[0]);if(!["string","cstr","char"].includes(x))bad();if(n>1)num(1);return "size_t"}
        case "push_back":if(n!==1)bad();mut();if(!INTG.has(tc(A[0])))bad();return "void";
        case "pop_back":case "clear":if(n)bad();mut();return "void";
        case "back":case "front":if(n)bad();return "char";
        case "at":if(n!==1)bad();num(0);return "char";
        case "erase":if(n<1||n>2)bad();mut();num(0);if(n>1)num(1);return "string";
        case "insert":{if(n!==2)bad();mut();num(0);const x=tc(A[1]);if(!["string","cstr"].includes(x))bad();return "string"}
        case "append":{if(n!==1)bad();mut();const x=tc(A[0]);if(!["string","cstr"].includes(x))bad();return "string"}
        case "begin":case "end":if(n)bad();return "iter<char>";}
      throw new E2(e.p,`'std::string' {aka 'class std::__cxx11::basic_string<char>'} has no member named '${m}'`,["push","add"].includes(m)?"Thêm ký tự vào cuối chuỗi dùng push_back(c) hoặc s += c.":`string không có hàm ${m}().`)}
    if(isArr(t))throw new E2(e.p,`request for member '${m}' in '${etxt(e.o)}', which is of non-class type '${tn(t)}'`,"Mảng thường không có hàm thành viên như size(). Hãy lưu số phần tử trong một biến n, hoặc dùng vector.");
    return null}
  /* hàm thư viện <algorithm>, <numeric>, <string> */
  const LIBF={sort:["algorithm"],stable_sort:["algorithm"],reverse:["algorithm"],fill:["algorithm"],count:["algorithm"],find:["algorithm"],
    lower_bound:["algorithm"],upper_bound:["algorithm"],binary_search:["algorithm"],max_element:["algorithm"],min_element:["algorithm"],
    unique:["algorithm"],next_permutation:["algorithm"],prev_permutation:["algorithm"],accumulate:["numeric"],iota:["numeric"],gcd:["numeric"],__gcd:["algorithm"],
    swap:["algorithm","utility","iostream","string","vector"],max:["algorithm","iostream","string","vector"],min:["algorithm","iostream","string","vector"],
    to_string:["string","iostream"],stoi:["string","iostream"],stoll:["string","iostream"]};
  const CTYPE=["isalpha","isdigit","isalnum","isupper","islower","isspace","ispunct","toupper","tolower"];CTYPE.forEach(f=>LIBF[f]=["cctype","iostream"]);
  function libT(e){const f=e.f,A=e.args,n=A.length,H=LIBF[f];
    if(!H.some(has))throw new E2(e.p,`'${f}' was not declared in this scope`,`${f} nằm trong thư viện <${H[0]}>. Thêm #include <${H[0]}> ở đầu file.`);
    const argT=()=>A.map(a=>a.k==="ilist"?"<brace-enclosed initializer list>":a.k==="functor"?`std::${a.f}<${tnIn(a.t)}>`:a.k==="name"&&funcs.has(a.n)&&!sc.has(a.n)?`<hàm ${a.n}>`:tn(tc(a)));
    const noMatch=why=>{throw new E2(e.p,`no matching function for call to '${f}(${argT().join(", ")})'`,why||`Sai số lượng hoặc kiểu đối số của ${f}.`)};
    let ptrMode=false;const IT=E=>ptrMode?E+"*":"iter<"+E+">";   // mảng, con trỏ → kết quả là con trỏ; vector → iterator
    const rng=()=>{if(n<2)noMatch(`${f} cần một đoạn [đầu, cuối): ví dụ ${f}(v.begin(), v.end()) với vector, ${f}(a, a + n) với mảng.`);
      const T0=tc(A[0]),T1=tc(A[1]);const it=x=>isIter(x)||isArr(x)||isPtr(x);ptrMode=!isIter(T0);
      if(!it(T0)||!it(T1)){if(isVec(T0))noMatch(`${f} nhận hai vị trí (iterator) chứ không nhận cả vector: viết ${f}(${etxt(A[0])}.begin(), ${etxt(A[0])}.end()${n>2?", ...":""}).`);
        noMatch(`Hai đối số đầu của ${f} là vị trí đầu và vị trí cuối: ${f}(v.begin(), v.end()) với vector, ${f}(a, a + n) với mảng.`)}
      if(elemT(T0)!==elemT(T1))noMatch("Vị trí đầu và vị trí cuối phải thuộc cùng một mảng/vector.");
      return elemT(T0)};
    switch(f){
      case "sort":case "stable_sort":{const E=rng();if(n>3)noMatch();
        if(n===2&&isCls(E)){const r=methodsOf(E,"operator<"),fl=funcs.get("operator<")||[];let ok=null;
          if(r)for(const F of r.L)if(F.params.length===1&&(F.params[0].t===E)&&F.cnst){ok={E:F,mem:true};break}
          if(!ok)for(const F of fl)if(F.params.length===2&&F.params.every(q=>q.t===E&&(!q.ref||q.c))){ok={E:F,mem:false};break}
          if(!ok)throw new E2(e.p,`no match for 'operator<' (operand types are '${tn(E)}' and '${tn(E)}')`,`sort cần biết so sánh hai ${tn(E)}: hãy viết bool operator<(const ${tn(E)}& khac) const trong lớp, hoặc truyền hàm so sánh làm tham số thứ ba.`);
          e.ltFn=ok;if(ok.E.called==null)ok.E.called=e.p}
        if(n===3){const c=A[2];
          if(c.k==="functor"){tc(c);if(c.t!==E)noMatch(`Cách so sánh ${c.f}<${tn(c.t)}>() phải cùng kiểu với phần tử (${tn(E)}).`)}
          else if(c.k==="name"&&funcs.has(c.n)&&!sc.has(c.n)){const L=funcs.get(c.n);if(L.length!==1)noMatch("Hàm so sánh không được có nhiều phiên bản (nạp chồng).");const F=L[0];
            if(F.params.length!==2||!(F.ret==="bool"||INTG.has(F.ret)))noMatch(`Hàm so sánh phải nhận 2 tham số kiểu ${tn(E)} và trả về bool, ví dụ: bool cmp(int a, int b) { return a > b; }`);
            for(const P of F.params)if(P.ref&&!P.c?P.t!==E:rank(E,P.t)<0)noMatch(`Tham số của hàm so sánh phải có kiểu ${tn(E)}.`);
            c.cmpFn=F;if(F.called==null)F.called=c.p}
          else noMatch("Đối số thứ ba của sort là cách so sánh: greater<int>() để sắp giảm dần, hoặc tên một hàm bool cmp(a, b) (không có ngoặc ()).")}
        else if(!(isNumT(E)||E==="string"||isVec(E)||(isCls(E)&&e.ltFn)))noMatch(`Không so sánh được các phần tử kiểu ${tn(E)}.`);
        return "void"}
      case "reverse":case "next_permutation":case "prev_permutation":rng();if(n!==2)noMatch();return f==="reverse"?"void":"bool";
      case "max_element":case "min_element":case "unique":{const E=rng();if(n!==2)noMatch();return IT(E)}
      case "fill":case "iota":case "count":case "find":case "lower_bound":case "upper_bound":case "binary_search":case "accumulate":{const E=rng();if(n!==3)noMatch();
        if(f==="accumulate"){const T=tc(A[2]);if(!((isNumT(T)&&isNumT(E))||T===E))noMatch("Giá trị ban đầu của accumulate phải là số (thường viết 0, hoặc 0LL khi tổng có thể vượt int).");return T}
        canTo(E,A[2]);return f==="count"?"long long":f==="binary_search"?"bool":f==="fill"||f==="iota"?"void":IT(E)}
      case "swap":{if(n!==2)noMatch("swap(a, b) đổi chỗ giá trị của hai biến.");for(const a of A)if(!isLvE(a))noMatch("swap chỉ đổi chỗ hai biến (hoặc hai phần tử), không đổi chỗ giá trị tạm.");
        const T0=lv(A[0],"=",true).t,T1=lv(A[1],"=",true).t;if(T0!==T1)noMatch(`Hai biến đổi chỗ phải cùng kiểu (ở đây ${tn(T0)} và ${tn(T1)}).`);return "void"}
      case "max":case "min":{
        if(n===1&&A[0].k==="ilist"){const ts=A[0].items.map(x=>tc(x));if(!ts.length||ts.some(x=>x!==ts[0]))noMatch(`Các giá trị trong ${f}({...}) phải cùng kiểu.`);return ts[0]}
        if(n!==2)noMatch(`${f} nhận 2 giá trị: ${f}(a, b), hoặc một danh sách ${f}({a, b, c}).`);const T0=tc(A[0]),T1=tc(A[1]);
        if(T0!==T1)noMatch(`std::${f} yêu cầu hai đối số CÙNG kiểu, ở đây là ${tn(T0)} và ${tn(T1)}. Hãy ép kiểu cho khớp, ví dụ ${f}((long long)a, b) hoặc ${f}(a, 0LL).`);
        if(!(isNumT(T0)||T0==="string"))noMatch();return T0}
      case "gcd":case "__gcd":{if(n!==2)noMatch();const T0=tc(A[0]),T1=tc(A[1]);if(!INTG.has(T0)||!INTG.has(T1))noMatch("gcd chỉ dùng cho số nguyên.");return promo(T0,T1)}
      case "to_string":{if(n!==1)noMatch();const T=tc(A[0]);if(!isNumT(T))noMatch("to_string chuyển một số thành chuỗi.");return "string"}
      case "isalpha":case "isdigit":case "isalnum":case "isupper":case "islower":case "isspace":case "ispunct":case "toupper":case "tolower":{if(n!==1)noMatch();const T=tc(A[0]);if(!INTG.has(T))noMatch(`${f} nhận một ký tự (char).`);return "int"}
      case "stoi":case "stoll":{if(n!==1)noMatch();const T=tc(A[0]);if(!(T==="string"||T==="cstr"))noMatch(`${f} chuyển một chuỗi thành số.`);return f==="stoi"?"int":"long long"}}
    noMatch()}
  function chk(s){switch(s.k){
    case "empty":return;
    case "rfor":{const C=tc(s.e);
      if(!(isSeq(C)||C==="string"))throw new E2(s.e.p,`'begin' was not declared in this scope`,"Vòng for (x : danh_sách) dùng với mảng, vector hoặc chuỗi.");
      if(isArr(C)&&arrN(C)==null)throw new E2(s.e.p,`'begin' was not declared in this scope`,"Tham số mảng (int a[]) thực chất là con trỏ, không biết kích thước, nên không dùng for (x : a) được. Hãy dùng vòng for với chỉ số và truyền thêm số phần tử n, hoặc dùng vector.");
      if(cxMark(s.e))throw new E2(s.e.p,"duyệt kết quả của hàm bằng for (x : ...) chưa hỗ trợ","Hãy lưu kết quả vào một biến trước, rồi duyệt biến đó.","unsup");
      const E=C==="string"?"char":elemT(C);let t=s.ty.t;
      if(t==="auto")t=E;
      else if(s.ref&&t!==E)throw new E2(s.np,`invalid initialization of reference of type '${tn(t)}&' from expression of type '${tn(E)}'`,`Phần tử có kiểu ${tn(E)} nên biến tham chiếu cũng phải là ${tn(E)}& (hoặc auto&).`);
      else if(!s.ref&&!(isNumT(t)&&isNumT(E))&&t!==E)throw new E2(s.np,`conversion from '${tn(E)}' to '${tn(t)}' requested`,`Phần tử có kiểu ${tn(E)}, không gán được cho biến kiểu ${tn(t)}.`);
      if(s.ref&&!s.ty.c){const B=lvBase(s.e);if(B&&B.c)throw new E2(s.np,`binding reference of type '${tn(t)}&' to 'const ${tn(E)}' discards qualifiers`,"Danh sách là const nên biến lặp phải là const auto& (chỉ đọc).");if(B){B.ref=true;B.init=true}}
      s.et=t;s.ct=C;enter();declare(s.name,{t,c:s.ty.c,init:true,p:s.np,local:true,isRef:s.ref});loopD++;sub(s.body);loopD--;leave();return}
    case "block":enter();s.body.forEach(chk);misInd(s.body);leave();return;
    case "if":condCheck(s.c,"if");
      if(isEmpty(s.th))warns.push({p:s.th.p,msg:"suggest braces around empty body in an 'if' statement [-Wempty-body]",vi:"Dấu ; ngay sau if (...) tạo ra một câu lệnh rỗng: if không điều khiển gì cả, các lệnh phía sau luôn chạy. Xóa dấu ; này."});
      if(!s.el&&s.th.k==="if"&&s.th.el)warns.push({p:s.p,msg:"suggest explicit braces to avoid ambiguous 'else' [-Wdangling-else]",vi:"else luôn thuộc về if GẦN NHẤT phía trên (if bên trong), không phải if bên ngoài như cách thụt lề gợi ý. Dùng { } để nói rõ else thuộc if nào."});
      sub(s.th);if(s.el){if(isEmpty(s.el))warns.push({p:s.el.p,msg:"suggest braces around empty body in an 'else' statement [-Wempty-body]",vi:"Dấu ; ngay sau else tạo ra câu lệnh rỗng."});sub(s.el)}return;
    case "while":condCheck(s.c,"while");loopD++;sub(s.body);loopD--;return;
    case "do":loopD++;sub(s.body);loopD--;condCheck(s.c,"while");return;
    case "for":enter();if(s.init)chk(s.init);if(s.c)condCheck(s.c,"for");if(s.step){tc(s.step);seqCheck(s.step)}loopD++;sub(s.body);loopD--;leave();return;
    case "switch":{const t=tc(s.e);
      if(!INTG.has(t))throw new E2(s.e.p,"switch quantity not an integer",t==="string"||t==="cstr"?"switch chỉ dùng với số nguyên hoặc ký tự (char), không dùng với chuỗi. Với chuỗi, dùng if ... else if.":"switch chỉ dùng với số nguyên hoặc ký tự (char). Với số thực, dùng if ... else if.");
      enter();swD++;const seen=new Map();let hasDef=false,crossed=null,lastTerm=true,started=false;
      s.items.forEach((it,idx)=>{
        if(it.k==="case"||it.k==="default"){
          if(crossed)throw new E2(it.p,"jump to case label",`Biến ${crossed.n} (dòng ${lineOf(crossed.p)}) được khai báo kèm giá trị ngay trong switch, nên nhảy tới nhãn này sẽ bỏ qua việc khởi tạo nó. Hãy đặt các lệnh của case trong cặp { }.`);
          if(started&&!lastTerm)warns.push({p:it.p,msg:"this statement may fall through [-Wimplicit-fallthrough=]",vi:"case phía trên không có break, nên chương trình chạy tiếp xuống case này (fall-through). Nếu cố ý, thêm chú thích [[fallthrough]];. Nếu không, thêm break;"});
          lastTerm=true;
          if(it.k==="default"){if(hasDef)throw new E2(it.p,"multiple default labels in one switch","Mỗi switch chỉ có một default.");hasDef=true;return}
          const vt=tc(it.v);const v=constVal(it.v);
          if(!INTG.has(vt)||v===undefined){const bad=it.v.k==="name"?it.v.n:null;throw new E2(it.v.p,bad?`the value of '${bad}' is not usable in a constant expression`:vt==="cstr"?"case label does not reduce to an integer constant":"case label does not reduce to an integer constant",bad?`Giá trị sau case phải là hằng biết lúc biên dịch (số, ký tự 'A', hoặc hằng constexpr). ${bad} là biến thường.`:"Giá trị sau case phải là hằng số nguyên hoặc ký tự, ví dụ case 3: hay case 'A':")}
          const w=wrapTo(promo(t,t),v);if(seen.has(w))throw new E2(it.p,`duplicate case value`,`Giá trị ${v} đã có ở case dòng ${lineOf(seen.get(w))}. Mỗi giá trị chỉ được xuất hiện một lần.`);seen.set(w,it.p);it.cv=w;return}
        started=true;const st=it.s;chk(st);
        if(st.k==="decl"&&st.items.some(x=>x.init&&x.init.e))crossed={n:st.items[0].name,p:st.items[0].p};
        const term=x=>["break","ret","continue"].includes(x.k)||(x.k==="block"&&x.body.length>0&&term(x.body[x.body.length-1]));lastTerm=term(st)});
      swD--;leave();return}
    case "break":if(!loopD&&!swD)throw new E2(s.p,"break statement not within loop or switch","break chỉ dùng bên trong vòng lặp hoặc switch.");return;
    case "continue":if(!loopD)throw new E2(s.p,"continue statement not within a loop","continue chỉ dùng bên trong vòng lặp (while, do-while, for).");return;
  }
    if(s.k==="decl"){
      if(s.ty.needStd&&!prog.using){const N=s.ty.needStd===true?"string":s.ty.needStd;throw new E2(s.ty.p,`'${N}' was not declared in this scope; did you mean 'std::${N}'?`,`${N} nằm trong không gian tên std. Thêm using namespace std; ngay dưới các #include (hoặc viết std::${N}).`)}
      if(isCont(s.ty.t)&&!has("vector"))throw new E2(s.ty.p,`'vector' was not declared in this scope; note: 'std::vector' is defined in header '<vector>'; did you forget to '#include <vector>'?`,"Thiếu #include <vector> ở đầu file.");
      for(const it of s.items){
        if(frames[frames.length-1].names.has(it.name)){const V=sc.get(it.name);if(V.param)throw new E2(it.p,`declaration of '${tn(s.ty.t)} ${it.name}' shadows a parameter`,`${it.name} đã là tên tham số của hàm. Đổi tên biến khác, hoặc dùng luôn tham số ${it.name}.`);throw new E2(it.p,`redeclaration of '${tn(V.t)} ${it.name}'`,`Biến ${it.name} đã khai báo ở dòng ${lineOf(V.p)}. Mỗi tên chỉ khai báo một lần; muốn đổi giá trị thì gán: ${it.name} = ...;`)}
        let t=s.ty.t+"*".repeat(it.ptr||0);const pc=it.ptr?!!s.ty.c:false,vc=it.ptr?!!it.pconst:!!s.ty.c;
        if(it.ptr&&s.ty.ce)throw new E2(it.p,"constexpr con trỏ chưa hỗ trợ","Dùng const thay cho constexpr với con trỏ.","unsup");
        if(isCls(t)&&s.st)throw new E2(it.p,"biến static kiểu lớp chưa hỗ trợ","Hãy khai báo đối tượng thường.","unsup");
        if(isCls(t)&&!it.dims&&!s.ref){clsDecl(s,it,t);continue}
        if(isCls(t)&&it.dims){if(CLS.get(t).abstract)throw new E2(it.p,`cannot declare variable '${it.name}' to be of abstract type '${tn(t)}'`,"Không tạo được đối tượng của lớp trừu tượng.");if(!it.init)ctorCheck(t,[],it.p,false);it.ccx=true}
        if(isVec(t)&&isCls(elemT(t)))it.ccx=true;
        if(it.init&&it.init.e&&it.init.e.k==="ilist"&&!it.dims&&!isCont(t)&&!s.ref&&t!=="auto"){const L=it.init.e;
          if(L.items.length>1)throw new E2(L.items[1].p,`scalar object '${it.name}' requires one element in initializer`,"Biến đơn chỉ nhận một giá trị trong { }.");
          if(L.items.length&&L.items[0].k==="ilist")throw new E2(L.p,"braces around scalar initializer","Biến đơn không dùng { } lồng nhau.");
          it.init={s:"{}",e:L.items.length?L.items[0]:null}}
        const preR=t==="auto"&&!s.ref&&!it.dims&&it.init&&it.init.e&&it.init.e.k!=="ilist"?tc(it.init.e):null;
        if(s.ref||it.dims||isCont(t)||(it.init&&(it.init.list||it.init.args))||isCont(preR)){declCompound(s,it,t,preR);continue}
        if(it.init&&it.init.e){const R=preR??tc(it.init.e);const ie=it.init.e;
          if(R==="void")throw new E2(ie.p,"void value not ignored as it ought to be","Hàm kiểu void làm việc rồi kết thúc, không trả về giá trị nào để gán vào biến. Muốn lấy kết quả, đổi hàm sang kiểu trả về (ví dụ int) và dùng return.");
          if(t==="auto"){if(R==="cstr")throw new E2(it.p,"auto với chuỗi hằng chưa hỗ trợ","auto x = \"...\" cho kiểu const char*, không phải std::string. Hãy ghi rõ std::string.");if(isIter(R)){t=R;it.t=t;declare(it.name,{t,c:s.ty.c,init:true,p:it.p,g:!!s.g,local:!s.g});continue}
            if(isPtr(R)){t=R;it.t=t;const V={t,c:s.ty.c,pc:srcPc(ie),init:true,p:it.p,g:!!s.g,local:!s.g};ptrSrc(V,ie);declare(it.name,V);continue}
            if(R==="nullptr_t")throw new E2(it.p,"auto từ nullptr chưa hỗ trợ","Hãy ghi rõ kiểu con trỏ, ví dụ int* p = nullptr;","unsup");if(!isNumT(R)&&R!=="string")throw new E2(it.p,`unable to deduce 'auto' from '${tn(R)}'`,"auto không suy ra được kiểu từ giá trị này.");t=R}
          if(t==="string"){if(!(R==="string"||R==="cstr"))throw new E2(ie.p,`conversion from '${tn(R)}' to non-scalar type 'std::string' requested`,"Biến string phải khởi tạo bằng chuỗi trong nháy kép \"...\".")}
          else if(isPtr(t))ptrInit(t,ie,R,"initialization",pc);
          else if(isPtr(R)||R==="nullptr_t")throw new E2(ie.p,`invalid conversion from '${tn(R)}' to '${tn(t)}' [-fpermissive]`,`${etxt(ie)} là địa chỉ (con trỏ), không gán vào biến kiểu ${tn(t)} được. Muốn lấy giá trị tại địa chỉ đó, viết *${etxt(ie)}.`);
          else{
            if(!isNumT(R))throw new E2(ie.p,`invalid conversion from '${tn(R)}' to '${tn(t)}'`,`Không dùng ${R==="cstr"?"chuỗi \"...\"":"giá trị kiểu "+tn(R)} để khởi tạo biến kiểu ${tn(t)} được.${t==="char"&&R==="cstr"?" Ký tự đơn dùng nháy đơn: 'A'.":""}`);
            if(it.init.s==="{}"&&INTG.has(t)&&isFlT(R)&&ie.k!=="num")warns.push({p:ie.p,msg:`narrowing conversion of '${ie.raw||ie.n||"..."}' from '${tn(R)}' to '${tn(t)}' [-Wnarrowing]`,vi:"Khởi tạo bằng { } không được làm mất dữ liệu (số thực → số nguyên mất phần thập phân). Với giá trị lấy từ biến, g++ chỉ cảnh báo và vẫn cắt phần thập phân; Clang và MSVC báo lỗi luôn. Hãy coi cảnh báo này như lỗi và ép kiểu rõ ràng: int x{static_cast<int>(gia)};"});
            else if(it.init.s==="{}"&&INTG.has(t)&&isFlT(R))throw new E2(ie.p,`narrowing conversion of '${ie.raw||ie.n||"..."}' from '${tn(R)}' to '${tn(t)}' [-Wnarrowing]`,"Khởi tạo bằng { } cấm làm mất dữ liệu: ép số thực vào số nguyên sẽ mất phần thập phân. Đây chính là lý do nên dùng { }.");
            if(it.init.s==="{}"&&INTG.has(t)&&ie.k==="num"&&INTG.has(R)){const [lo,hi]=RANGE[t];if(ie.v<lo||ie.v>hi)throw new E2(ie.p,`narrowing conversion of '${ie.raw}' from '${tn(R)}' to '${tn(t)}' [-Wnarrowing]`,`Giá trị ${ie.raw} vượt quá phạm vi của kiểu ${tn(t)} (${lo} đến ${hi}).`)}
            if(it.init.s==="{}"&&t==="float"&&R==="double"&&ie.k!=="num")warns.push({p:ie.p,msg:`narrowing conversion of '${ie.n||"..."}' from 'double' to 'float' [-Wnarrowing]`,vi:"double → float có thể mất độ chính xác. g++ cảnh báo, các trình biên dịch khác có thể báo lỗi."});
            if(it.init.s==="{}"&&INTG.has(t)&&INTG.has(R)&&ie.k!=="num"&&!(ie.k==="un"&&ie.a.k==="num")&&R!==t&&(SIZES[R]>SIZES[t]||(R==="unsigned")!==(t==="unsigned"))&&R!=="bool"&&R!=="char")warns.push({p:ie.p,msg:`narrowing conversion of '${ie.n||"..."}' from '${R==="long long"?"long long int":R==="unsigned"?"unsigned int":R}' to '${t==="long long"?"long long int":t==="unsigned"?"unsigned int":t}' [-Wnarrowing]`,vi:`Giá trị kiểu ${tn(R)} có thể không vừa kiểu ${tn(t)}. Khởi tạo bằng { } không cho phép thu hẹp kiểu; g++ cảnh báo, các trình biên dịch khác có thể báo lỗi.`});
          }
        }else{
          if(t==="auto")throw new E2(it.p,`declaration of 'auto ${it.name}' has no initializer`,"auto cần giá trị khởi tạo để suy ra kiểu.");
          if(vc)throw new E2(it.p,`uninitialized 'const ${it.name}' [-fpermissive]`,it.ptr?"Con trỏ hằng (int* const p) phải được gán địa chỉ ngay lúc khai báo.":"Hằng const phải được gán giá trị ngay lúc khai báo.");
        }
        if(s.ty.ce){
          if(!it.init||!it.init.e)throw new E2(it.p,`uninitialized 'const ${it.name}'`,"constexpr phải được gán giá trị ngay khi khai báo.");
          const bad=ceBad(it.init.e);
          if(bad)throw new E2(bad.p,bad.k==="name"?`the value of '${bad.n}' is not usable in a constant expression`:`call to non-'constexpr' function`,bad.k==="name"?`constexpr chỉ nhận giá trị biết được lúc biên dịch. ${bad.n} là biến thường${sc.get(bad.n)&&!sc.get(bad.n).c?"":""}, giá trị chỉ có khi chương trình chạy. Dùng const nếu chỉ cần “không đổi sau khi gán”.`:"Giá trị này chỉ tính được khi chương trình chạy, không dùng cho constexpr được.")}
        if(it.init&&it.init.e)seqCheck(it.init.e);
        it.t=t;const cv=s.ty.c&&it.init&&it.init.e&&INTG.has(t)?constVal(it.init.e):undefined;
        if(it.init&&it.init.s!=="{}"&&it.init.e&&["char","short","int"].includes(t)){const ie=it.init.e,lit=ie.k==="num"?ie.v:ie.k==="un"&&ie.op==="-"&&ie.a.k==="num"?-ie.a.v:undefined;
          if(lit!==undefined&&typeof lit==="number"&&INTG.has(tc(ie))){const w=wrapTo(t,lit);if(w!==lit)warns.push({p:ie.p,msg:`overflow in conversion from 'int' to '${t==="short"?"short int":t==="unsigned"?"unsigned int":t}' changes value from '${lit}' to '${w}' [-Woverflow]`,vi:`${lit} nằm ngoài phạm vi của kiểu ${tn(t)} nên bị cắt thành ${w}.`})}}
        {const V={t,c:vc,pc,ce:!!s.ty.ce,init:!!it.init||t==="string"||!!s.g||!!s.st,p:it.p,cv,g:!!s.g,local:!s.g};if(isPtr(t))ptrSrc(V,it.init&&it.init.e);declare(it.name,V)}
      }
    }else if(s.k==="expr"){tc(s.e);seqCheck(s.e)}
    else if(s.k==="ret"){
      if(curFn&&!curFn.node.main){const R=curFn.ret;
        if(R==="void"){if(s.e){const t=tc(s.e);if(t!=="void")throw new E2(s.e.p,"return-statement with a value, in function returning 'void' [-fpermissive]","Hàm void không trả về giá trị. Chỉ viết return; (không kèm giá trị), hoặc đổi kiểu trả về của hàm.")}}
        else{if(!s.e)throw new E2(s.p,`return-statement with no value, in function returning '${tn(R)}' [-fpermissive]`,`Hàm khai báo trả về ${tn(R)} nên return phải kèm một giá trị: return giá_trị;`);
          const t=tc(s.e);seqCheck(s.e);
          if(curFn.rref&&(R==="ostream"||R==="istream")&&t===R){}
          else if(curFn.rref){
            if(!isLvE(s.e))throw new E2(s.e.p,`cannot bind non-const lvalue reference of type '${tn(R)}&' to an rvalue of type '${tn(t)}'`,`Hàm trả về tham chiếu ${tn(R)}& nên sau return phải là một biến (hoặc phần tử) còn sống sau khi hàm kết thúc, không phải giá trị tạm.`);
            if(t!==R)throw new E2(s.e.p,`invalid initialization of reference of type '${tn(R)}&' from expression of type '${tn(t)}'`,`Hàm trả về ${tn(R)}& nên phải trả về một biến kiểu ${tn(R)}.`);
            const V=s.e.k==="name"?sc.get(s.e.n):null;
            if(V&&!V.g&&!V.isRef&&!(V.param&&V.ref))warns.push({p:s.e.p,msg:`reference to local variable '${s.e.n}' returned [-Wreturn-local-addr]`,vi:`${s.e.n} là biến cục bộ (hoặc tham số truyền giá trị) của hàm: nó bị hủy ngay khi hàm kết thúc, nên tham chiếu trả về gắn vào vùng nhớ đã hết hạn (tham chiếu treo). Chỉ trả về tham chiếu tới thứ còn sống sau hàm: tham số kiểu tham chiếu, phần tử mảng truyền vào, biến toàn cục.`})}
          else if(isPtr(R)){if(!(t===R||t==="nullptr_t"||(isArr(t)&&elemT(t)===elemT(R))||(s.e.k==="num"&&Number(s.e.v)===0)))throw new E2(s.e.p,`invalid conversion from '${tn(t)}' to '${tn(R)}' [-fpermissive]`,`Hàm trả về con trỏ ${tn(R)} nhưng giá trị sau return có kiểu ${tn(t)}.`);
            const loc=s.e.k==="addr"&&s.e.a.k==="name"?s.e.a.n:s.e.k==="name"&&isArr(t)?s.e.n:null,LV=loc&&sc.get(loc);
            if(LV&&LV.local&&!(LV.param&&isArr(LV.t)))warns.push({p:s.e.p,msg:`address of local variable '${loc}' returned [-Wreturn-local-addr]`,vi:`${loc} là biến cục bộ của hàm: nó nằm trên stack và bị hủy ngay khi hàm kết thúc. Địa chỉ trả về trỏ tới vùng nhớ đã hết hạn (con trỏ treo). Hãy trả về giá trị, dùng vector, hoặc cấp phát bằng new.`})}
          else if(rank(t,R)<0)throw new E2(s.e.p,`could not convert from '${tn(t)}' to '${tn(R)}'`,`Hàm trả về ${tn(R)} nhưng giá trị sau return có kiểu ${tn(t)}.`)}}
      else if(s.e){const t=tc(s.e);if(!isNumT(t))throw new E2(s.e.p,`invalid conversion from '${tn(t)}' to 'int'`,"main phải trả về một số nguyên.")}}
  }
  /* ---------- hàm tự viết ---------- */
  function callUser(e){
    if(!curFn)throw new E2(e.p,"gọi hàm khi khởi tạo biến toàn cục chưa hỗ trợ","Trình mô phỏng chỉ cho khởi tạo biến toàn cục bằng giá trị cố định.");
    const list=funcs.get(e.f);
    const AT=e.args.map(a=>{if(a.k==="name")a.lhs=true;const t=tc(a);if(t==="void")throw new E2(a.p,"invalid use of void expression","Hàm void không trả về giá trị nên không dùng làm đối số được.");return t});
    const lvOf=(a,k)=>a.k==="name"&&(a.r==="var"||a.r==="gvar")?sc.get(a.n):isLvE(a)&&a.k!=="name"?{t:AT[k],c:!!(lvBase(a)||{}).c,init:true,elem:true}:null;
    const score=E=>{const n=e.args.length,P=E.params,need=P.filter(p=>!p.def).length;
      if(n>P.length)return{bad:"many"};if(n<need)return{bad:"few"};
      const r=[];for(let k=0;k<n;k++){const p=P[k],a=e.args[k];
        if(p.ref&&!p.c){const V=lvOf(a,k);if(!V||V.t!==p.t)return{bad:"ref",k,why:V?"ty":"rv"};if(V.c)return{bad:"cref",k};r.push(3);continue}
        const s=rank(AT[k],p.t);if(s<0)return{bad:"conv",k};r.push(s)}
      return{r}};
    const cand=list.map(E=>Object.assign({E},score(E))),ok=cand.filter(c=>c.r);
    if(!ok.length){
      if(list.length===1){const c=cand[0],E=c.E,sg=sigOf(E),need=E.params.filter(p=>!p.def).length;
        if(c.bad==="many"||c.bad==="few")throw new E2(e.p,`too ${c.bad} arguments to function '${sg}'`,`Hàm ${e.f} cần ${need===E.params.length?E.params.length:`từ ${need} đến ${E.params.length}`} đối số, nhưng chỗ gọi này truyền ${e.args.length}.`);
        const p=E.params[c.k],a=e.args[c.k];
        if(c.bad==="ref")throw new E2(a.p,`cannot bind non-const lvalue reference of type '${tn(p.t)}&' to an rvalue of type '${tn(AT[c.k])}'`,c.why==="rv"?`Tham số ${p.name||""} là tham chiếu ${tn(p.t)}&: nó phải gắn vào một BIẾN có sẵn để hàm sửa được biến đó. Số 5, biểu thức a + 1 hay kết quả của một hàm là giá trị tạm, không có chỗ để sửa. Hãy truyền một biến, hoặc đổi tham số thành const ${tn(p.t)}& hay ${tn(p.t)}.`:`Tham chiếu ${tn(p.t)}& chỉ gắn được vào biến kiểu ${tn(p.t)}, còn ${a.n} có kiểu ${tn(AT[c.k])}.`);
        if(c.bad==="cref")throw new E2(a.p,`binding reference of type '${tn(p.t)}&' to 'const ${tn(p.t)}' discards qualifiers`,`${a.n} là hằng nên không được truyền vào tham chiếu thường (hàm có thể sửa nó). Đổi tham số thành const ${tn(p.t)}&.`);
        throw new E2(a.p,`cannot convert '${tn(AT[c.k])}' to '${tn(p.t)}'`,`Đối số thứ ${c.k+1} có kiểu ${tn(AT[c.k])}, không chuyển được sang kiểu ${tn(p.t)} của tham số ${p.name||""}.`)}
      throw new E2(e.p,`no matching function for call to '${e.f}(${argList(AT)})'`,`Có ${list.length} phiên bản ${e.f} nhưng không phiên bản nào nhận được đối số (${argList(AT)}). Các phiên bản: ${list.map(sigOf).join("; ")}.`)}
    const better=(x,y)=>{let gt=false;for(let k=0;k<x.r.length;k++){if(x.r[k]<y.r[k])return false;if(x.r[k]>y.r[k])gt=true}return gt};
    const best=ok.filter(x=>ok.every(y=>y===x||better(x,y)));
    if(best.length!==1)throw new E2(e.p,`call of overloaded '${e.f}(${argList(AT)})' is ambiguous`,`Có nhiều phiên bản ${e.f} phù hợp ngang nhau với đối số (${argList(AT)}): ${ok.map(c=>sigOf(c.E)).join("; ")}. Trình biên dịch không tự chọn được. Hãy ép kiểu đối số cho khớp hẳn một phiên bản, ví dụ static_cast<double>(x).`);
    const E=best[0].E;e.fn=E;if(E.called==null)E.called=e.p;
    e.args.forEach((a,k)=>{const p=E.params[k],V=lvOf(a,k);if(!V)return;V.ref=true;if(isArr(p.t)||(p.ref&&!p.c))V.init=true;
      if(p.ref&&!p.c)V.init=true;
      else if(!V.init&&!warned.has(a.n)){warned.add(a.n);warns.push({p:a.p,msg:`'${a.n}' is used uninitialized [-Wuninitialized]`,vi:`Biến ${a.n} được truyền vào hàm khi chưa có giá trị, nên hàm nhận “giá trị rác”.`})}});
    return E.ret}
  const isTrue=c=>!c||(c.k==="bool"&&c.v===1)||(c.k==="num"&&c.v!==0);
  const hasBrk=s=>{if(!s||typeof s!=="object")return false;if(s.k==="break")return true;if(["while","do","for","switch"].includes(s.k))return false;
    if(s.k==="block")return s.body.some(hasBrk);if(s.k==="if")return hasBrk(s.th)||hasBrk(s.el);return false};
  const term=s=>{if(!s)return false;switch(s.k){case "ret":return true;case "block":return retAll(s.body);case "if":return !!s.el&&term(s.th)&&term(s.el);
    case "while":case "for":case "do":return isTrue(s.c)&&!hasBrk(s.body);
    case "switch":{const L=s.items[s.items.length-1];return s.items.some(i=>i.k==="default")&&!s.items.some(i=>i.k==="stmt"&&hasBrk(i.s))&&!!L&&L.k==="stmt"&&term(L.s)}
    default:return false}};
  const retAll=list=>list.some(term);
  const hasRet=x=>{if(!x||typeof x!=="object")return false;if(Array.isArray(x))return x.some(hasRet);if(x.k==="ret")return true;return ["th","el","body","s"].some(k=>hasRet(x[k]))||(x.items?x.items.some(i=>i.k==="stmt"&&hasRet(i.s)):false)};
  function register(F){
    F.params.forEach(P=>{if(P.adims){let t=P.t+"[]";
      P.adims.slice(1).forEach(d=>{if(!d)throw new E2(P.p,`declaration of '${P.name}' as multidimensional array must have bounds for all dimensions except the first`,"Tham số mảng nhiều chiều phải ghi kích thước các chiều sau, ví dụ int a[][100].");
        const cv=constVal(d);if(cv===undefined){tc(d);throw new E2(d.p,"array bound is not an integer constant before ']' token","Kích thước các chiều sau của tham số mảng phải là hằng số, ví dụ int a[][100].")}t+=`[${cv}]`});
      P.t=t;P.adims=null}});
    F.params.forEach(P=>{if(P.t==="auto")throw new E2(P.p,"'auto' parameter not permitted in this context","Tham số phải ghi rõ kiểu, không dùng auto.");
      if(P.ty.needStd&&!prog.using)throw new E2(P.ty.p,"'string' was not declared in this scope; did you mean 'std::string'?","string nằm trong không gian tên std. Thêm using namespace std; ngay dưới các #include (hoặc viết std::string).");
      if(P.def){const T=tc(P.def);if(rank(T,P.t)<0)throw new E2(P.def.p,`could not convert default argument from '${tn(T)}' to '${tn(P.t)}'`,"Giá trị mặc định phải cùng loại với tham số.")}});
    if(F.rty&&F.rty.needStd&&!prog.using)throw new E2(F.rty.p,"'string' does not name a type; did you mean 'std::string'?","string nằm trong không gian tên std. Thêm using namespace std; ngay dưới các #include (hoặc viết std::string).");
    if(F.ret==="auto")throw new E2(F.p,"kiểu trả về auto chưa hỗ trợ","Hãy ghi rõ kiểu trả về, ví dụ int hoặc double.");
    let seen=false;F.params.forEach((P,k)=>{if(P.def)seen=true;else if(seen)throw new E2(P.p,`default argument missing for parameter ${k+1} of '${sigOf(F)}'`,"Tham số có giá trị mặc định phải nằm ở CUỐI danh sách: sau một tham số có giá trị mặc định, mọi tham số phía sau cũng phải có.")});
    const key=F.params.map(P=>P.ref?(P.c?"const ":"")+P.t+"&":P.t).join(",");
    const list=funcs.get(F.name)||[];funcs.set(F.name,list);
    const old=list.find(E=>E.key===key);
    if(old){
      if(old.ret!==F.ret)throw new E2(F.p,`ambiguating new declaration of '${sigOf(F)}'`,`Đã có ${sigOf(old)} (dòng ${lineOf(old.p)}) với cùng danh sách tham số. Hai hàm chỉ khác kiểu trả về thì không nạp chồng được: trình biên dịch phân biệt các phiên bản bằng số lượng và kiểu của tham số.`);
      if(old.body&&F.body)throw new E2(F.p,`redefinition of '${sigOf(F)}'`,`Hàm này đã được viết thân ở dòng ${lineOf(old.bp)}. Mỗi hàm (cùng tên, cùng danh sách tham số) chỉ được định nghĩa một lần.`);
      F.params.forEach((P,k)=>{if(P.def&&old.params[k].def)throw new E2(P.def.p,`default argument given for parameter ${k+1} of '${sigOf(F)}' [-fpermissive]`,"Giá trị mặc định chỉ ghi một lần, thường ở nguyên mẫu phía trên. Phần định nghĩa không ghi lại.");if(!P.def&&old.params[k].def)P.def=old.params[k].def});
      if(F.body){old.params=F.params;old.body=F.body;old.bp=F.p;old.e=F.e;old.node=F}
      else old.params.forEach((P,k)=>{if(F.params[k].def)P.def=F.params[k].def});
      return old}
    const E={name:F.name,ret:F.ret,rref:!!F.rref,params:F.params,key,p:F.p,body:F.body||null,bp:F.body?F.p:null,e:F.e,node:F,called:null};
    list.push(E);return E}
  function checkFn(F,E){
    curFn=E;allDecl.clear();gone.clear();warned.clear();loopD=0;swD=0;
    F.body.forEach(s=>{if(s.k==="decl")s.items.forEach(it=>{if(!allDecl.has(it.name))allDecl.set(it.name,it.p)})});
    enter();const pin=[];
    F.params.forEach(P=>{if(!P.name)return;
      if(frames[frames.length-1].names.has(P.name))throw new E2(P.p,`redefinition of '${tn(P.t)} ${P.name}'`,`Hai tham số trùng tên ${P.name}.`);
      const I={t:P.t,c:P.c,pc:!!P.pc,init:true,p:P.p,param:true,ref:P.ref,used:false};declare(P.name,I);pin.push([P,I])});
    if(E.kind==="ctor")ctorInits(F,E);
    F.body.forEach(chk);misInd(F.body);
    if(!F.main&&pathRec(F.body,E))warns.push({p:F.p,msg:"infinite recursion detected [-Winfinite-recursion]",vi:`Mọi đường chạy của ${F.name} đều gọi lại chính nó trước khi kịp return, nên hàm không bao giờ dừng và sẽ làm tràn ngăn xếp. Cần một trường hợp cơ sở trả về mà không gọi đệ quy.`});
    leave();
    pin.forEach(([P,I])=>{if(!I.used)warns.push({p:P.p,msg:`unused parameter '${P.name}' [-Wunused-parameter]`,vi:`Tham số ${P.name} không được dùng trong thân hàm. Nếu không cần thì bỏ tham số; nếu cố ý giữ, có thể chỉ ghi kiểu mà không ghi tên.`})});
    if(!F.main&&E.ret!=="void"&&!retAll(F.body)){const any=hasRet(F.body);
      warns.push({p:F.e,msg:any?"control reaches end of non-void function [-Wreturn-type]":"no return statement in function returning non-void [-Wreturn-type]",
        vi:any?"Có đường chạy đi tới dấu } cuối hàm mà không gặp return. Khi đó hàm trả về giá trị rác (hành vi không xác định). Hãy bảo đảm mọi nhánh if / else đều có return.":`Hàm khai báo trả về ${tn(E.ret)} nhưng không có lệnh return nào. Thêm return giá_trị; hoặc đổi kiểu trả về thành void nếu hàm không cần trả về gì.`})}
    curFn=null}
  for(const it of prog.items){const w0=warns.length;let fsig="";
    try{
      if(it.k==="gdecl")chk(it.s);
      else if(it.k==="class"){fsig="";classDecl(it.D)}
      else if(it.ocls){const D=CLS.get(it.ocls);const key=normParams(it);let E;
        if(it.kind==="ctor")E=D.ctorE.find(x=>x.key===key);else if(it.kind==="dtor")E=D.dtorE;else{const L=D.mt.get(it.name)||[];E=L.find(x=>x.key===key&&x.cnst===!!it.cnst)}
        const what=`${it.kind==="method"?tn(it.ret)+" ":""}${D.name}::${it.name}(${it.params.map(P=>(P.c&&P.ref?"const ":"")+tn(P.t)+(P.ref?"&":"")).join(", ")})${it.cnst?" const":""}`;
        fsig=what;
        if(!E)throw new E2(it.p,`no declaration matches '${what}'`,`${D.kind} ${D.name} không khai báo hàm này. Hãy khai báo nguyên mẫu bên trong ${D.kind} trước (cùng tên, cùng kiểu tham số${it.cnst?", có const":""}).`);
        if(E.body)throw new E2(it.p,`redefinition of '${sigM(E)}'`,`Hàm này đã được viết thân ở dòng ${lineOf(E.bp)}.`);
        if(it.kind==="method"&&(E.ret!==it.ret||E.rref!==!!it.rref))throw new E2(it.p,`no declaration matches '${what}'`,`Kiểu trả về khác với khai báo trong lớp (${tn(E.ret)}${E.rref?"&":""}).`);
        it.params.forEach((P,k)=>{if(P.def&&E.params[k].def)throw new E2(P.def.p,`default argument given for parameter ${k+1} of '${sigM(E)}' [-fpermissive]`,"Giá trị mặc định chỉ ghi một lần, ở khai báo trong lớp.");if(!P.def&&E.params[k].def)P.def=E.params[k].def});
        if(it.kind==="ctor"&&E.inits.length&&it.inits&&it.inits.length)throw new E2(it.p,"redefinition","Danh sách khởi tạo chỉ viết một lần.");
        E.params=it.params;E.body=it.body;E.bp=it.p;E.e=it.e;E.node=it;it.cls=D.id;it.cnst=E.cnst;if(it.kind==="ctor"&&it.inits&&it.inits.length)E.inits=it.inits;
        if(it.body)checkFn(it,E)}
      else if(it.main){fsig="int main()";const E={name:"main",ret:"int",params:[],node:it,p:it.p};checkFn(it,E)}
      else{fsig=sigOf(it);const E=register(it);if(it.body)checkFn(it,E)}
    }catch(x){if(x instanceof E2&&x.fn===undefined)x.fn=fsig;throw x}
    for(let k=w0;k<warns.length;k++)if(warns[k].fn===undefined)warns[k].fn=fsig}
  for(const list of funcs.values())for(const E of list)if(E.called!=null&&!E.body)
    throw new E2(-1,`undefined reference to \`${E.name}(${E.params.map(P=>(P.c&&P.ref?"const ":"")+tn(P.t)+(P.ref?"&":"")).join(", ")})'`,`Hàm ${E.name} mới có nguyên mẫu (dòng ${lineOf(E.p)}) mà chưa được viết thân { ... } ở đâu cả, nên trình liên kết không tìm thấy mã của nó.`,"link");
  for(const E of MEMS)if(E.called!=null&&!E.body&&!E.pure&&!E.dflt)throw new E2(-1,`undefined reference to \`${sigM(E)}'`,`Hàm ${sigM(E)} mới được khai báo trong lớp (dòng ${lineOf(E.p)}) mà chưa được viết thân ở đâu cả.`,"link");
  prog.funcs=[...funcs.values()].flat().concat(MEMS);
  return warns;
}
function mayRead(n){if(!n||typeof n!=="object")return false;if((n.k==="bin"&&n.io==="in")||(n.k==="call"&&n.f==="getline")||(n.k==="mc"&&n.m==="ignore"))return true;
  for(const k of ["a","b","c","e","o","i"])if(n[k]&&typeof n[k]==="object"&&mayRead(n[k]))return true;
  if(n.items)for(const it of n.items)if(it.init&&it.init.e&&mayRead(it.init.e))return true;
  if(n.args)for(const x of n.args)if(mayRead(x))return true;return false}
/* biên dịch cây câu lệnh thành danh sách lệnh phẳng có lệnh nhảy */
let RFID=0;
function genCode(stmts){
  const code=[],loops=[];let depth=0;
  const emit=x=>{code.push(x);return code.length-1};
  const patch=(arr,to)=>arr.forEach(i=>code[i].to=to);
  function sub(s){if(s.k==="block"){blockOf(s)}else if(s.k==="decl"){emit({op:"enter"});depth++;st(s);emit({op:"leave",p:s.p});depth--}else st(s)}
  function blockOf(s){emit({op:"enter"});depth++;s.body.forEach(st);emit({op:"leave",p:s.e});depth--}
  function st(s){switch(s.k){
    case "decl":case "expr":case "ret":case "cinit":emit({op:"stmt",s,p:s.p});return;
    case "empty":return;
    case "block":blockOf(s);return;
    case "if":{const j=emit({op:"jf",e:s.c,p:s.p,kw:"if"});sub(s.th);
      if(s.el){const j2=emit({op:"jmp"});code[j].to=code.length;sub(s.el);code[j2].to=code.length}else code[j].to=code.length;return}
    case "while":{const top=code.length;const j=emit({op:"jf",e:s.c,p:s.p,kw:"while"});const L={brk:[],cont:[],depth};loops.push(L);
      sub(s.body);emit({op:"jmp",to:top});loops.pop();code[j].to=code.length;patch(L.brk,code.length);patch(L.cont,top);return}
    case "do":{const top=code.length;const L={brk:[],cont:[],depth};loops.push(L);sub(s.body);const ca=code.length;
      emit({op:"jt",e:s.c,to:top,p:s.cp,kw:"do-while"});loops.pop();patch(L.brk,code.length);patch(L.cont,ca);return}
    case "for":{emit({op:"enter"});depth++;if(s.init)st(s.init);const top=code.length;
      const j=s.c?emit({op:"jf",e:s.c,p:s.p,kw:"for"}):null;const L={brk:[],cont:[],depth};loops.push(L);sub(s.body);const ca=code.length;
      if(s.step)emit({op:"stmt",s:{k:"expr",e:s.step,p:s.sp},p:s.sp,forStep:true});emit({op:"jmp",to:top});loops.pop();
      const end=code.length;if(j!==null)code[j].to=end;patch(L.brk,end);patch(L.cont,ca);emit({op:"leave",p:s.p});depth--;return}
    case "switch":{emit({op:"enter"});depth++;const sw=emit({op:"switch",e:s.e,p:s.p,cases:[],def:null});const L={brk:[],sw:true,depth};loops.push(L);
      for(const it of s.items){if(it.k==="case")code[sw].cases.push({v:it.cv,to:code.length});else if(it.k==="default")code[sw].def=code.length;else st(it.s)}
      loops.pop();const end=code.length;if(code[sw].def===null)code[sw].def=end;patch(L.brk,end);emit({op:"leave",p:s.p});depth--;return}
    case "break":{const L=loops[loops.length-1];L.brk.push(emit({op:"jmp",pops:depth-L.depth,p:s.p,vis:"break"}));return}
    case "continue":{let k=loops.length-1;while(loops[k].sw)k--;const L=loops[k];L.cont.push(emit({op:"jmp",pops:depth-L.depth,p:s.p,vis:"continue"}));return}
    case "rfor":{emit({op:"enter"});depth++;const hid="__rf"+(++RFID);emit({op:"rinit",s,hid,p:s.p});const top=code.length;
      const j=emit({op:"rtest",s,hid,p:s.p,kw:"for"});const L={brk:[],cont:[],depth};loops.push(L);depth++;
      sub(s.body);emit({op:"leave",p:s.p});depth--;const ca=code.length;emit({op:"rnext",hid,p:s.p});emit({op:"jmp",to:top});loops.pop();
      const end=code.length;code[j].to=end;patch(L.brk,end);patch(L.cont,ca);emit({op:"leave",p:s.p});depth--;return}
  }}
  stmts.forEach(st);
  code.forEach(I=>{if(I.op==="stmt"){const S=I.s;I.cx=S.k==="cinit"?true:S.k==="decl"?S.items.map(it=>[(it.init?(it.init.e?cxMark(it.init.e):it.init.list?cxMark(it.init.list):it.init.args?it.init.args.map(cxMark).some(Boolean):false):false)||(it.vla?cxMark(it.vla):false),!!it.ccx].some(Boolean)).some(Boolean):!!(S.e&&cxMark(S.e))}else if(I.e)I.cx=cxMark(I.e)});
  return code;
}
/* đánh dấu biểu thức cần chạy từng bước (có gọi hàm tự viết hoặc đọc cin) */
function cxMark(e){if(!e||typeof e!=="object")return false;let c=false;
  for(const k of ["a","b","c","o","i","list"])if(e[k]&&typeof e[k]==="object"&&e[k].k&&cxMark(e[k]))c=true;
  if(e.args)for(const a of e.args)if(cxMark(a))c=true;
  if(e.items)for(const a of e.items)if(cxMark(a))c=true;
  if(e.k==="new"){if(e.n&&cxMark(e.n))c=true;if(e.init&&e.init.args)for(const a of e.init.args)if(cxMark(a))c=true;if(e.init&&e.init.e&&cxMark(e.init.e))c=true;if(e.init&&e.init.list&&cxMark(e.init.list))c=true}
  if((e.k==="call"&&(e.fn||e.f==="getline"))||(e.k==="bin"&&e.io==="in")||(e.k==="mc"&&e.m==="ignore"))c=true;
  if(e.fn&&e.args)for(const P of e.fn.params.slice(e.args.length))if(P.def&&cxMark(P.def))c=true;
  if(e.fn||e.ovl||e.k==="octor"||e.cE||(e.k==="new"&&isCls(e.t))||(e.k==="del"&&isPtr(e.a.tt||"")&&isCls(elemT(e.a.tt))))c=true;
  if(c)e.cx=true;return c}
function compile2(src){const {toks,inc}=lex2(src);const prog=new P2(toks,src).program();prog.inc=inc;const warns=check2(prog,src,inc);
  if(prog.dupUse)throw new E2(prog.dupUse.p,`đối tượng có hai phần ${clsName(prog.dupUse.b)} (kế thừa hình kim cương không dùng virtual) chưa chạy được`,`Trình mô phỏng kiểm tra được lỗi biên dịch của kiểu kế thừa này nhưng chưa chạy được đối tượng có hai bản sao lớp cha. Dùng kế thừa ảo (virtual public ${clsName(prog.dupUse.b)}) để chỉ có một bản, hoặc chạy trên máy thật.`,"unsup");
  for(const it of prog.items)if(it.k==="class")for(const F of it.D.fields||[])if(F.init){if(F.init.e)cxMark(F.init.e);if(F.init.list)cxMark(F.init.list)}
  for(const E of prog.funcs||[])if(E.kind==="ctor")for(const I of E.inits||[])I.args.forEach(cxMark);
  prog.code=genCode(prog.main);(prog.funcs||[]).forEach(E=>{if(E.body)E.code=genCode(E.kind==="ctor"?[{k:"cinit",E,p:E.p}].concat(E.body):E.body)});prog.hasFns=(prog.funcs||[]).length>0;
  return{prog,warns}}

/* ---------- máy chạy ---------- */
const LIM={int:[2147483647,-2147483648],"long long":[9223372036854775807n,-9223372036854775808n],short:[32767,-32768],char:[127,-128],unsigned:[4294967295,0],bool:[1,0],double:[1.7976931348623157e308,2.2250738585072014e-308],float:[3.4028234663852886e38,1.1754943508222875e-38]};
const NEED={need:true};
const LIB_RT=new Set(["isalpha","isdigit","isalnum","isupper","islower","isspace","ispunct","toupper","tolower","sort","stable_sort","reverse","fill","count","find","lower_bound","upper_bound","binary_search","max_element","min_element","unique","next_permutation","prev_permutation","accumulate","iota","gcd","__gcd","swap","max","min","to_string","stoi","stoll"]);
const NPOS=18446744073709551615n;
const isAscii=s=>/^[\x00-\x7f]*$/.test(s);
const blen=s=>isAscii(s)?s.length:u8(s).length;
const fromBytes=b=>{for(const x of b)if(x>127)return new TextDecoder("utf-8").decode(b instanceof Uint8Array?b:new Uint8Array(b));return String.fromCharCode(...b)};
function runSync(g){const r=g.next();if(!r.done)throw new Error("runSync: yield");return r.value}
/* so sánh hai giá trị cùng kiểu (sắp xếp, so sánh vector) */
function cmpV(a,b){if(a&&typeof a==="object"&&a.a){const n=Math.min(a.a.length,b.a.length);for(let k=0;k<n;k++){const c=cmpV(a.a[k].v,b.a[k].v);if(c)return c}return a.a.length-b.a.length}
  if(typeof a==="string"){if(isAscii(a)&&isAscii(b))return a<b?-1:a>b?1:0;const x=u8(a),y=u8(b),n=Math.min(x.length,y.length);for(let k=0;k<n;k++)if(x[k]!==y[k])return x[k]-y[k];return x.length-y.length}
  if(typeof a==="bigint"||typeof b==="bigint"){a=toBig(a);b=toBig(b)}return a<b?-1:a>b?1:0}
class M2{
  constructor(prog,src,{input="",interactive=true}={}){
    this.src=src;this.st=prog.code||genCode(prog.main);this.i=0;this.vars=new Map();this.order=[];this.buf=input;this.pos=0;
    this.failed=false;this.eof=false;this.out=[];this.fmt={fixed:false,prec:6,ba:false,w:0,left:false};
    this.inter=interactive;this.done=false;this.exit=0;this.addr=0x7ffd7ffd5c50;this.reads=[];this.notes=[];this.crash=null;
    this.frames=[];this.count=0;this.outLen=0;this.eofIn=false;this.last=null;
    /* ngăn xếp lời gọi hàm: khung hiện tại nằm ngay trên this (vars, order, st, i...), các khung đang chờ nằm trong calls */
    this.calls=[];this.fn=prog.mainFn||{name:"main",ret:"int",e:src.length};this.title="main()";this.refs=new Map();
    this.gen=null;this.curI=null;this.before=new Map();this.resumeVal=undefined;this.retv=null;this.lastRet=null;
    this.hasFns=!!prog.hasFns;this.maxDepth=0;this.nCalls=0;this.ctree=[];this.cnode=-1;
    this.rd=new Set();this.wr=new Set();this.wrRoot=new Set();this.cost=0;
    this.globals=new Map();this.gorder=[];
    this.statics=new Map();this.saddr=0x55d0c3a05010;
    this.dq=[];this.temps=[];this.pendRet=null;this.dgen=null;this.ending=false;
    this.heap=[];this.haddr=0x55d0c3a062b0;this.hid=0;this.memNotes=[];
    if(prog.globals&&prog.globals.length){let ga=0x55d0c3a04010;
      for(const S of prog.globals)for(const it of S.items){const t=it.t,r=runSync(this.initG(S,it));
        if(r&&r.done){const V=r.C,al=Math.min(alignOfT(t),8);ga=Math.ceil(ga/al)*al;V.addr=ga;V.g=true;this.globals.set(it.name,V);this.gorder.push(it.name);ga+=sizeOfT(t);continue}
        const mk=this.mkVal(S,it,r,true),sz=Math.max(1,mk.sz),al=Math.min(SIZES[t]||8,8);ga=Math.ceil(ga/al)*al;
        const V={t:mk.t,v:mk.v,init:true,c:S.ty.c,ce:S.ty.ce,addr:ga,g:true};this.adopt(V);this.globals.set(it.name,V);this.gorder.push(it.name);ga+=sz}}
    this.flush();
  }
  static LIMIT=1000000;
  static DEPTH=3000;
  static STACK=8*1024*1024;
  static TREE=300;
  L(x){return x.r==="gvar"?this.globals.get(x.n):this.vars.get(x.n)}
  scopeLeave(){const f=this.frames.pop();if(!f)return;
    {const L=[];for(const n of f.names.slice().reverse()){const V=this.vars.get(n);if(V&&!this.refs.has(n)&&!V.st&&this.needD(V.t))L.push(V)}if(L.length)this.dq.push(...L)}
    for(const n of f.names){const V=this.vars.get(n);if(V&&!this.refs.has(n)&&!V.st&&!this.needD(V.t))V.dead=true;this.vars.delete(n);const k=this.order.lastIndexOf(n);if(k>=0)this.order.splice(k,1)}
    for(const [n,V,idx] of f.shadow.reverse()){this.vars.set(n,V);this.order.splice(Math.min(idx,this.order.length),0,n)}
    this.addr=f.addr}
  flush(){let g=0;while(this.i<this.st.length&&g++<100000){const I=this.st[this.i];
      if(I.op==="enter"){this.frames.push({names:[],shadow:[],addr:this.addr});this.i++}
      else if(I.op==="leave"){this.dpos=I.p;this.scopeLeave();this.i++}
      else if(I.op==="jmp"&&!I.vis){for(let k=0;k<(I.pops||0);k++)this.scopeLeave();this.i=I.to}
      else if(I.op==="rinit"||I.op==="rnext")this.run(I);
      else break}}
  truth(x){return x.t==="ostream"||x.t==="istream"?!this.failed:isPtr(x.t)||x.t==="nullptr_t"?!!(x.v&&(x.v.h||x.v.ad)):!!x.v}
  run(I){switch(I.op){
    case "stmt":this.exec(I.s);this.i++;return;
    case "jf":{const c=this.truth(this.ev(I.e));this.i=c?this.i+1:I.to;return c}
    case "jt":{const c=this.truth(this.ev(I.e));this.i=c?I.to:this.i+1;return c}
    case "switch":{const v=this.ev(I.e).v;const k=I.cases.find(x=>x.v===v||(typeof x.v==="bigint"&&toBig(v)===x.v));this.i=k?k.to:I.def;return{sw:v,hit:!!k}}
    case "jmp":for(let k=0;k<(I.pops||0);k++)this.scopeLeave();this.i=I.to;return;
    case "rinit":{const C=this.baseOf(I.s.e);const F=this.frames[this.frames.length-1];if(F)F.names.push(I.hid);
      this.vars.set(I.hid,{t:"__rf",v:{c:C,k:0,lb:I.s.e.k==="name"?I.s.e.n:"phần tử"},init:true});this.i++;return}
    case "rnext":this.vars.get(I.hid).v.k++;this.i++;return;
    case "rtest":{const R=this.vars.get(I.hid).v,C=R.c,n=C.t==="string"?blen(C.v):C.v.a.length;
      if(R.k>=n){this.i=I.to;return false}
      this.frames.push({names:[],shadow:[],addr:this.addr});const s=I.s,cell=C.t==="string"?this.chCell(C,R.k,null):C.v.a[R.k];this.rd.add(cell);
      if(s.ref){this.bindName(s.name,cell);this.refs.set(s.name,`${R.lb}[${R.k}]`)}
      else{const sz=sizeOfT(s.et);this.addr-=sz;this.addr-=this.addr%Math.min(sz,8);const V={t:s.et,v:this.conv({t:cell.t,v:cell.v},s.et),init:cell.init,c:s.ty.c,addr:this.addr};this.adopt(V);this.bindName(s.name,V)}
      this.i++;return true}
  }}
  bindName(n,V){const F=this.frames[this.frames.length-1];
    if(F){if(this.vars.has(n)&&!F.names.includes(n))F.shadow.push([n,this.vars.get(n),this.order.indexOf(n)]);if(this.vars.has(n)){const k=this.order.indexOf(n);if(k>=0)this.order.splice(k,1)}F.names.push(n)}
    this.vars.set(n,V);this.order.push(n)}
  *runG(I){switch(I.op){
    case "stmt":yield* this.execG(I.s);this.i++;return;
    case "jf":{const c=this.truth(yield* this.evG(I.e));this.i=c?this.i+1:I.to;return c}
    case "jt":{const c=this.truth(yield* this.evG(I.e));this.i=c?I.to:this.i+1;return c}
    case "switch":{const v=(yield* this.evG(I.e)).v;const k=I.cases.find(x=>x.v===v||(typeof x.v==="bigint"&&toBig(v)===x.v));this.i=k?k.to:I.def;return{sw:v,hit:!!k}}
    default:return this.run(I)}}
  line(p){return this.src.slice(0,Math.max(0,p)).split("\n").length}
  nextLine(){if(this.done)return 0;if(this.gen&&this.curI)return this.line(this.curI.p);if(this.i<this.st.length)return this.line(this.st[this.i].p);if(this.calls.length)return this.line(this.fn.e);return 0}
  write(s){if(!s)return;this.outLen+=s.length;if(this.outLen>200000)throw new RunErr("Output limit exceeded","Chương trình in ra quá nhiều (hơn 200 000 ký tự), có thể do vòng lặp vô hạn.",124);const L=this.out[this.out.length-1];if(L&&L.k==="o")L.s+=s;else this.out.push({k:"o",s})}
  feed(line){this.buf+=line+"\n";this.out.push({k:"i",s:line+"\n"})}
  text(){return this.out.filter(x=>x.k==="o").map(x=>x.s).join("")}
  tle(p){this.done=true;this.gen=null;this.crash=new RunErr("Time limit exceeded","Chương trình đã chạy hơn 1 000 000 bước, vượt giới hạn của trình mô phỏng. Nguyên nhân thường gặp là vòng lặp vô hạn (điều kiện lặp không bao giờ sai) hoặc đệ quy không dừng. Nếu thuật toán của bạn đúng nhưng cần nhiều bước, hãy thử với dữ liệu nhỏ hơn hoặc chạy bằng g++ trên máy thật.",124);this.exit=124;return{s:"crash",line:this.line(p)}}
  step(){
    if(this.done)return{s:"done"};
    if(!this.gen&&(this.dgen||this.dq.length)){   // đang hủy đối tượng: hết phạm vi, hàm sắp trả về, main kết thúc
      if(!this.dgen){const L=this.dq;this.dq=[];this.dgen=this.destroyAll(L)}
      if(++this.count>M2.LIMIT)return this.tle(this.fn.e);
      let res;const rv=this.resumeVal;this.resumeVal=undefined;const dp=this.dpos||0;
      try{res=this.dgen.next(rv)}catch(x){this.dgen=null;if(x instanceof RunErr){this.done=true;this.crash=x;this.exit=x.code;return{s:"crash",line:this.line(dp)}}throw x}
      if(!res.done){this.pushCall(res.value,{p:dp});return{s:"ran",line:this.line(dp),op:"call",kw:"call",fn:this.fn.name,ch:new Set(this.order)}}
      this.dgen=null;return this.step()}
    if(!this.gen&&this.pendRet){const {rv}=this.pendRet;this.pendRet=null;
      if(this.calls.length){const nm=this.fn.name,ln=this.line(this.fn.e);this.doReturn(rv);return{s:"ran",line:ln,op:"ret",kw:"ret",fn:nm,rv:this.lastRet.v,ch:new Set()}}
      this.done=true;return{s:"done"}}
    if(!this.gen&&this.i>=this.st.length){
      if(!this.calls.length){if(this.endFn(null))return this.step();this.done=true;return{s:"done"}}
      if(++this.count>M2.LIMIT)return this.tle(this.fn.e);
      const ln=this.line(this.fn.e),nm=this.fn.name;
      if(this.fn.ret&&this.fn.ret!=="void"){this.done=true;this.gen=null;this.crash=new RunErr("Illegal instruction (core dumped)",`Hàm ${nm} chạy tới dấu } cuối mà không gặp return. Với hàm trả về giá trị, g++ (từ bản 8) chèn lệnh dừng khẩn cấp vào chỗ này, nên hệ điều hành dừng chương trình ngay. Hãy bảo đảm mọi nhánh đều có return.`,132);this.exit=132;return{s:"crash",line:ln}}
      if(this.endFn(null)){this.dpos=this.fn.e;return this.step()}
      this.doReturn(null);
      return{s:"ran",line:ln,op:"ret",kw:"ret",fn:nm,rv:this.lastRet.v,ch:new Set()}}
    const resuming=!!this.gen,I=resuming?this.curI:this.st[this.i];
    if(++this.count>M2.LIMIT)return this.tle(I.p);
    this.cost++;
    if(!resuming){this.curI=I;this.rd=new Set();this.wr=new Set();this.wrRoot=new Set();if(this.snap!==false)this.before=new Map([...this.vars].map(([k,v])=>[k,v.v+"|"+v.init]))}
    const vars0=this.vars;let res;
    try{
      if(resuming){const rv=this.resumeVal;this.resumeVal=undefined;res=this.gen.next(rv)}
      else if(!I.cx)res={done:true,value:this.run(I)};
      else{this.gen=this.runG(I);res=this.gen.next()}
      if(!res.done&&res.value.call)this.pushCall(res.value,I);
    }catch(x){this.gen=null;
      if(x instanceof RunErr){this.done=true;this.crash=x;this.exit=x.code;return{s:"crash",line:this.line(I.p)}}
      throw x}
    if(!res.done){
      if(res.value===NEED){this.count--;return{s:"need",line:this.line(I.p)}}
      return{s:"ran",line:this.line(I.p),op:"call",kw:"call",fn:this.fn.name,ch:new Set(this.order)}}
    this.gen=null;this.curI=null;const cond=res.value;this.last=I;
    if(this.temps.length){this.dq.push(...this.temps.reverse());this.temps=[];this.dpos=I.p}
    if(I.op==="stmt"&&I.s.k==="ret"){this.dpos=I.p;
      if(this.calls.length){if(this.endFn(this.retv))return{s:"ran",line:this.line(I.p),ch:new Set(),op:I.op,kw:"ret"};
        if(this.dq.length){this.pendRet={rv:this.retv};return{s:"ran",line:this.line(I.p),ch:new Set(),op:I.op,kw:"ret"}}
        const nm=this.fn.name;this.doReturn(this.retv);return{s:"ran",line:this.line(I.p),op:"ret",kw:"ret",fn:nm,rv:this.lastRet.v,ch:new Set()}}
      this.i=this.st.length;if(!this.endFn(null)&&!this.dq.length)this.done=true;else if(!this.pendRet)this.pendRet={rv:null}}
    else this.flush();
    if(!this.calls.length&&this.i>=this.st.length&&!this.dq.length&&!this.pendRet&&!this.done){if(this.endFn(null))this.dpos=I.p;else this.done=true}
    const ch=new Set();if(this.vars===vars0&&this.snap!==false)this.vars.forEach((v,k)=>{if(this.before.get(k)!==v.v+"|"+v.init||this.wrRoot.has(v))ch.add(k)});
    return{s:this.done?"done":"ran",line:this.line(I.p),ch,cond,op:I.op,kw:I.kw||I.vis};
  }
  runAll(max=M2.LIMIT+5){let r;for(let k=0;k<max;k++){r=this.step();if(r.s!=="ran")break}return r}
  argTxt(r){const t=r.t;if(r.v&&r.v.o&&r.v.f)return objTxt(r.v,1);if(isPtr(t))return this.ptrTxt(r.v);if(t==="string"||t==="cstr")return JSON.stringify(r.v);if(isSeq(t))return `{${r.v.a.slice(0,6).map(c=>this.argTxt({t:c.t,v:c.v})).join(", ")}${r.v.a.length>6?", …":""}}`;if(t==="char"){const c=((r.v%256)+256)%256;return c>=32&&c<127?`'${String.fromCharCode(c)}'`:String(r.v)}
    if(t==="bool")return r.v?"true":"false";if(isFlT(t))return gfmt(r.v,6);if(t==="void")return "";return llStr(r.v)}
  pushCall(y,I){const F=y.call;
    if(this.calls.length>=M2.DEPTH)throw new RunErr("Segmentation fault (core dumped)",`Tràn ngăn xếp (stack overflow): hàm gọi lồng nhau hơn ${M2.DEPTH} tầng nên vùng nhớ stack đã dùng hết. Với đệ quy, nguyên nhân thường là thiếu trường hợp dừng, hoặc trường hợp dừng không bao giờ đạt tới (ví dụ quên giảm n).`,139);
    this.calls.push({fn:this.fn,st:this.st,i:this.i,vars:this.vars,order:this.order,frames:this.frames,gen:this.gen,curI:this.curI,addr:this.addr,refs:this.refs,before:this.before,title:this.title,callLine:this.line(I.p),cn:this.cnode,dq:this.dq,temps:this.temps,pendRet:this.pendRet,dgen:this.dgen,ending:this.ending});
    this.fn=F;this.st=F.code;this.i=0;this.vars=new Map();this.order=[];this.frames=[];this.gen=null;this.curI=null;this.refs=new Map();this.before=new Map();
    this.dq=[];this.temps=[];this.pendRet=null;this.dgen=null;this.ending=false;
    this.addr-=16;this.addr-=this.addr%16;
    const parts=[];
    if(y.self){this.addr-=8;const C=y.self;this.vars.set("this",{t:F.cls+"*",v:{h:this.wrapOf(C),k:0},init:true,c:!!F.cnst,addr:this.addr});this.order.push("this")}
    F.params.forEach((P,k)=>{const a=y.args[k];
      if(a.ref){parts.push("&"+a.from);if(P.name){this.vars.set(P.name,a.ref);this.refs.set(P.name,`${a.from} của ${a.fr}`);this.order.push(P.name)}}
      else{parts.push(this.argTxt(a.val));if(P.name){const sz=sizeOfT(P.t);this.addr-=sz;this.addr-=this.addr%Math.min(sz,8);const V={t:P.t,v:a.val.v,init:true,c:P.c,addr:this.addr};this.adopt(V);this.vars.set(P.name,V);this.order.push(P.name)}}});
    this.title=F.cls?`${clsName(F.cls)}::${F.name}(${parts.join(", ")})`:`${F.name}(${parts.join(", ")})`;this.nCalls++;
    /* cây lời gọi cho hình động (giới hạn số nút để không tốn bộ nhớ khi chạy nhanh) */
    if(this.ctree.length<M2.TREE){this.ctree.push({l:this.title,f:F.name,par:this.cnode,ret:null,done:false});this.cnode=this.ctree.length-1}else this.cnode=-2;
    this.maxDepth=Math.max(this.maxDepth,this.calls.length);
    this.flush()}
  doReturn(r){const F=this.fn;let rv;
    if(F.ret==="void")rv={t:"void"};
    else if(F.rref&&r&&r.cell)rv={t:F.ret,v:r.cell.v,cell:r.cell};
    else if(isCls(F.ret)&&r&&r.v&&r.v.o)rv={t:F.ret,v:r.tc||(r.cell&&r.cell.nrvo)?(r.v.o===F.ret?r.v:this.cloneObj(r.v,F.ret)):this.cloneObj(r.v,F.ret)};
    else if(r)rv={t:F.ret,v:this.conv(r,F.ret)};
    else{rv={t:F.ret,v:F.ret==="string"?"":this.garbage(F.ret)};const nk="noret:"+F.name;if(!this.notes.includes(nk))this.notes.push(nk)}
    const nd=this.cnode>=0?this.ctree[this.cnode]:null;if(nd){nd.done=true;if(rv.t!=="void")nd.ret=this.argTxt(rv)}
    this.vars.forEach((V,n)=>{if(!this.refs.has(n)&&!V.st)V.dead=true});   // biến cục bộ của hàm vừa xong: hết hạn (con trỏ tới chúng thành con trỏ treo)
    if(isCls(F.ret)&&!F.rref&&rv.v&&rv.v.o){const tc={t:F.ret,v:rv.v,init:true};rv.tc=tc}
    const s=this.calls.pop();for(const k of ["fn","st","i","vars","order","frames","gen","curI","addr","refs","before","title","dq","temps","pendRet","dgen","ending"])this[k]=s[k];this.cnode=s.cn;
    if(rv.tc&&CLS.get(F.ret).hasDtor)this.temps.push(rv.tc);
    this.resumeVal=rv;this.lastRet={fn:F.name,v:rv};this.retv=null}
  view(){const fr=[{title:this.title,vars:this.vars,order:this.order,refs:this.refs,top:true,line:0}];
    for(let k=this.calls.length-1;k>=0;k--){const c=this.calls[k];fr.push({title:c.title,vars:c.vars,order:c.order,refs:c.refs,top:false,line:c.callLine})}
    return fr}
  garbage(t){if(t==="size_t")return 140737488355328n;const g=[32767,21845,-858993460,4199040,32764,-1530494976,1,22015][((this.addr>>>2)+this.order.length)%8];
    if(isFlT(t))return t==="float"?Math.fround(4.59163e-41):6.9533558078350043e-310;if(t==="bool")return 1;return wrapTo(t,g)}
  exec(S){
    if(S.k==="decl"){for(const it of S.items)this.declItem(S,it,runSync(this.initG(S,it)));return}
    if(S.k==="expr"){this.ev(S.e);return}
    if(S.k==="cinit")runSync(this.ctorInitG(S.E));
    if(S.k==="ret"&&S.e&&this.fn.rref&&(this.fn.ret==="ostream"||this.fn.ret==="istream")){this.ev(S.e);this.setRet({t:this.fn.ret,v:0,cell:{t:this.fn.ret,v:0,init:true}});return}
    if(S.k==="ret")this.setRet(S.e?(this.fn.rref?this.retRef(S.e):this.ev(S.e)):null)}
  /* return trong hàm trả về tham chiếu: trả về chính ô nhớ; ô của biến cục bộ sắp bị hủy là tham chiếu treo */
  retRef(e){const C=this.LV(e);let own=false;this.vars.forEach((V,n)=>{if(V===C&&!this.refs.has(n))own=true});
    if(own)throw new RunErr("Segmentation fault (core dumped)",`Hàm ${this.fn.name} trả về tham chiếu tới biến cục bộ ${this.lvTxt(e)}, nhưng biến này bị hủy ngay khi hàm kết thúc. Nơi gọi nhận một tham chiếu treo (dangling reference); g++ biên dịch nó thành địa chỉ 0 nên dùng tới là chương trình bị dừng. Chỉ trả về tham chiếu tới thứ còn sống sau hàm (tham số kiểu tham chiếu, phần tử của mảng truyền vào, biến toàn cục).`,139);
    return{t:C.t,v:C.v,cell:C}}
  *execG(S){
    if(S.k==="decl"){for(const it of S.items)this.declItem(S,it,yield* this.initG(S,it));return}
    if(S.k==="expr"){yield* this.evG(S.e);return}
    if(S.k==="cinit"){yield* this.ctorInitG(S.E);return}
    if(S.k==="ret"&&S.e&&this.fn.rref&&(this.fn.ret==="ostream"||this.fn.ret==="istream")){yield* this.evG(S.e);this.setRet({t:this.fn.ret,v:0,cell:{t:this.fn.ret,v:0,init:true}});return}
    if(S.k==="ret"){if(S.e&&this.fn.rref){if(S.e.k==="call"){const x=yield* this.evG(S.e);this.setRet(x)}else this.setRet(this.retRef(S.e))}else this.setRet(S.e?(yield* this.evG(S.e)):null)}}
  setRet(r){if(r&&this.fn&&isCls(this.fn.ret)&&r.v&&r.v.o){if(r.tc)this.untemp(r.tc);else if(r.cell)for(const [n,V] of this.vars)if(V===r.cell&&!this.refs.has(n)&&n!=="this"){V.nrvo=true;break}}
    if(this.calls.length||this.isSub)this.retv=r;else this.exit=r?wrapTo("int",r.v):0}
  /* giá trị dùng để khởi tạo một biến: biểu thức, danh sách { }, tham số ( ), tham chiếu, kích thước VLA */
  /* khai báo đối tượng: cấp chỗ, gắn tên, rồi mới chạy hàm tạo (để thấy đối tượng trong khung của nơi gọi) */
  *objDeclG(S,it){const t=it.t,glob=!!S.g;const C={t,v:this.mkObj(t,glob),init:true,c:!!S.ty.c};
    if(!glob){const sz=sizeOfT(t);this.addr-=sz;this.addr-=this.addr%Math.min(alignOfT(t),8);C.addr=this.addr;
      if(0x7ffd7ffd5c50-this.addr>M2.STACK)throw new RunErr("Segmentation fault (core dumped)",`Tràn stack: đối tượng ${it.name} quá lớn so với vùng stack.`,139);
      this.adopt(C);this.bindName(it.name,C)}
    else this.adopt(C);
    const cf=it.cf;
    if(cf==="brace"||cf==="value")yield* this.constructG(C,null,it.cargs||[],true,t);
    else if(cf==="copy")yield* this.constructG(C,null,it.cargs,false,t);
    else yield* this.constructG(C,it.ctorE,it.cargs||[],false,t);
    return{done:true,C}}
  /* mảng đối tượng: mỗi phần tử được dựng bằng hàm tạo (theo danh sách { } nếu có) */
  *objArrG(S,it){const t=it.t,et=elemT(t),I=it.init,L=I&&(I.list||(I.e&&I.e.k==="ilist"?I.e:null)),items=L?L.items:[];
    const N=arrN(t)||items.length,es=sizeOfT(et);const V={t:`${et}[${N}]`,v:{a:[]},init:true,c:!!S.ty.c};
    for(let k=0;k<N;k++)V.v.a.push({t:et,v:this.mkObj(et,!!L),init:true});
    const sz=Math.max(1,N*es);this.addr-=sz;this.addr-=this.addr%Math.min(alignOfT(et),8);V.addr=this.addr;
    if(0x7ffd7ffd5c50-this.addr>M2.STACK)throw new RunErr("Segmentation fault (core dumped)",`Tràn stack: mảng ${it.name} chiếm ${(sz/1048576).toFixed(1)} MB, vượt vùng stack.`,139);
    V.v.a.forEach((c,i)=>{c.par=V;c.off=i*es});this.adopt(V);this.bindName(it.name,V);
    for(let k=0;k<N;k++){const c=V.v.a[k],x=items[k];
      if(x===undefined){if(L)yield* this.constructG(c,null,[],true,et);else yield* this.defaultG(c,et)}
      else if(x.k==="ilist")yield* this.constructG(c,x.cE||null,x.items,true,et);
      else yield* this.constructG(c,x.cE||null,[x],false,et)}
    return{done:true}}
  *initG(S,it){const I=it.init;let r=null;
    if(!S.ref&&isCls(it.t)&&!it.dims)return yield* this.objDeclG(S,it);
    if(!S.ref&&isCls(elemT(it.t))&&isArr(it.t)&&!isArr(elemT(it.t))&&it.ccx&&!S.g)return yield* this.objArrG(S,it);
    if(S.ref){const e=I.e;if(it.tmp){const x=yield* this.evG(e);
        if(isCls(it.t)&&x.v&&x.v.o&&x.v.o!==it.t&&isBaseOf0(it.t,x.v.o)){if(x.tc)this.untemp(x.tc);return{ref:{t:it.t,v:x.v,init:true}}}   // const Cha& r = Con(...): giữ nguyên đối tượng Con, không cắt lát
        return{ref:{t:it.t,v:this.conv(x,it.t),init:true}}}
      if((e.k==="call"||e.k==="mc")&&e.fn&&e.fn.rref){const x=yield* this.evG(e);return{ref:x.cell,label:`${e.f}(…)`}}
      return{ref:this.LV(e),label:this.lvTxt(e)}}
    if(I){if(I.list)r=yield* this.listG(I.list);else if(I.args){const items=[];for(const a of I.args)items.push(a.k==="ilist"?yield* this.listG(a):yield* this.evG(a));r={t:"args",items}}else if(I.e)r=yield* this.evG(I.e)}
    if(it.vla){const n=toNum((yield* this.evG(it.vla)).v);if(n<0)throw new RunErr("Lỗi chạy: kích thước mảng âm",`Mảng ${it.name} được khai báo với kích thước ${n} (âm). Kiểm tra lại giá trị đọc vào.`,139);
      if(n>20000000)throw new RunErr("Lỗi chạy: mảng quá lớn",`Mảng ${it.name} có ${n} phần tử, vượt giới hạn của trình mô phỏng (và có thể làm tràn stack trên máy thật). Dùng vector cho mảng lớn.`,139);r=Object.assign(r||{},{vlaN:n})}
    return r}
  *listG(L){const items=[];for(const x of L.items)items.push(x.k==="ilist"?yield* this.listG(x):yield* this.evG(x));return{t:"ilist",items}}
  lvTxt(e){if(e.k==="name")return `${e.n}${this.calls.length?" của "+this.fn.name:""}`;if(e.k==="idx"){try{return `${this.lvTxt(e.a).split(" ")[0]}[${toNum(this.ev(e.i).v)}]`}catch(x){return "phần tử"}}return "phần tử"}
  /* ================= đối tượng struct / class lúc chạy =================
     giá trị đối tượng: {o: mã lớp động, f: {"Lop@n.ten": ô}}; ô thành viên có par (ô đối tượng chứa nó) và off (độ lệch byte) */
  fkey(F){return F.owner+"."+F.name}
  mkObj(id,zero){const f={};for(const e of this.objLay(id))for(const F of CLS.get(e.cls).fields)f[this.fkey(F)]=this.mkFld(F,zero,e.off);return{o:id,f}}
  /* các phần của đối tượng theo thứ tự địa chỉ (lớp cha trước, lớp cơ sở ảo ở cuối) */
  objLay(id){return layoutOf(id).slice().sort((a,b)=>a.off-b.off||(clsChain(a.cls).includes(b.cls)?1:-1))}
  mkFld(F,zero,base){const t=F.t;let c;
    if(isCls(t))c={t,v:this.mkObj(t,zero),init:true};
    else if(isArr(t))c={t,v:this.mkArr(t,arrN(t),null,zero),init:true};
    else{const z=zero||t==="string"||isVec(t);c={t,v:z?this.zero(t):this.garb(t,F.off>>2),init:z}}
    c.off=(base||0)+F.off;c.fname=F.name;return c}
  cloneObj(v,id){const o=id||v.o,f={};
    for(const e of this.objLay(o))for(const F of CLS.get(e.cls).fields){const k=this.fkey(F),c=v.f[k];if(!c)continue;f[k]={t:c.t,v:this.clone(c.t,c.v),init:c.init,off:e.off+F.off,fname:c.fname}}
    return{o,f}}
  /* gán a = b giữa hai đối tượng: chép từng thành viên vào ô sẵn có (con trỏ tới thành viên vẫn đúng) */
  assignObj(V,src){const s=src.v;for(const k in V.v.f){const d=V.v.f[k],x=s.f[k];if(!x)continue;
      if(isCls(d.t))this.assignObj(d,x);else{d.v=this.clone(d.t,x.v);d.init=x.init;if(isSeq(d.t))this.adopt(d,d.own)}}
    this.wrote(V)}
  objCell(C){if(C&&C.v&&C.v.f)return C;return null}
  selfCell(){const T=this.vars.get("this");return T.v.h.one}
  memCell(e,O){let C;
    if(e.arrow){const r=O||this.ev(e.o);C=this.ptrCell(r.v,e,`${e.o.k==="this"?"this":this.pname(e.o)}->${e.m}`)}
    else C=O?(O.cell||{t:O.t,v:O.v,init:true,tmp:true}):this.baseOf(e.o);
    const F=C.v&&C.v.f&&C.v.f[this.fkey(e.fld)];
    if(!F)throw new RunErr("Lỗi chạy: truy cập thành viên không hợp lệ",`Đối tượng không có thành viên ${e.m}.`,139);
    return F}
  /* đối số khi gọi hàm F (hàm thường, hàm thành viên, hàm tạo, toán tử) */
  *argsG(F,argEs){const args=[];
    for(let k=0;k<F.params.length;k++){const P=F.params[k],a=k<argEs.length?argEs[k]:P.def;
      if(P.t==="ostream"||P.t==="istream"){yield* this.evG(a);args.push({ref:{t:P.t,v:0,init:true},from:P.t==="ostream"?"cout":"cin",fr:this.fn.name});continue}
      const lvE=a.k==="name"&&(a.r==="var"||a.r==="gvar")||a.k==="idx"||a.k==="deref"||a.k==="mem";
      if(P.ref&&!P.c&&(a.k==="call"||a.k==="mc")&&a.fn&&a.fn.rref){const x=yield* this.evG(a);args.push({ref:x.cell,from:(a.f||a.m)+"(…)",fr:this.fn.name});continue}
      if((P.ref||isArr(P.t))&&lvE&&!(a.k==="idx"&&a.i.cx)&&!(a.k==="mem"&&a.o.cx)&&!(a.k==="deref"&&a.cx)){const C=this.LV(a);if(isArr(P.t)||C.t===P.t||isBaseOf0(P.t,C.t)){args.push({ref:C,from:a.k==="name"?a.n:this.lvTxt(a),fr:a.r==="gvar"?"vùng toàn cục":this.fn.name});continue}}
      if(isCls(P.t)){
        if(a.k==="ilist"){const C={t:P.t,v:this.mkObj(P.t,true),init:true};yield* this.constructG(C,a.cE||null,a.items,true,P.t);args.push(P.ref?{ref:C,from:"{...}",fr:this.fn.name}:{val:{t:P.t,v:C.v},own:true});continue}
        const r=yield* this.evG(a);
        if(r.tc&&!P.ref){this.untemp(r.tc);args.push({val:{t:P.t,v:r.v},own:true});continue}
        if(P.ref){if(r.cell&&(r.cell.t===P.t||isBaseOf0(P.t,r.cell.t))){args.push({ref:r.cell,from:"(…)",fr:this.fn.name});continue}
          if(a.cE||a.cv){const C={t:P.t,v:this.mkObj(P.t,true),init:true};yield* this.constructG(C,a.cE,[a],false,P.t);args.push({ref:C,from:"(…)",fr:this.fn.name});continue}
          const C={t:P.t,v:r.tc?r.v:this.cloneObj(r.v),init:true};args.push({ref:C,from:"(…)",fr:this.fn.name});continue}
        const D=CLS.get(P.t),cc=D.ctorE&&D.ctorE.find(E=>E.params.length===1&&E.params[0].t===P.t&&E.params[0].ref);
        if(cc&&r.v&&r.v.o){const C={t:P.t,v:this.mkObj(P.t,false),init:true};const A=[{ref:r.cell||{t:r.t,v:r.v,init:true},from:"(…)",fr:this.fn.name}];yield{call:cc,args:A,self:C,ctor:true};args.push({val:{t:P.t,v:C.v},own:true});continue}
        if(!(r.v&&r.v.o)&&(a.cE||a.cv)){const C={t:P.t,v:this.mkObj(P.t,true),init:true};yield* this.constructG(C,a.cE,[a],false,P.t);args.push({val:{t:P.t,v:C.v},own:true});continue}
        args.push({val:{t:P.t,v:this.conv(r,P.t)},own:true});continue}
      args.push({val:{t:P.t,v:this.conv(yield* this.evG(a),P.t)}})}
    return args}
  *tmpObjG(a){const C={t:a.cT,v:this.mkObj(a.cT,true),init:true};this.adopt(C);yield* this.constructG(C,a.cE||null,a.items,true,a.cT);return{t:a.cT,v:C.v}}
  incr(e,V){const old=V.v;
      if(isPtr(V.t)){const d=e.op==="++"?1:-1;V.v={h:old.h,k:old.k+d,ad:old.ad&&old.ad+d*sizeOfT(elemT(V.t)),bad:old.bad};V.init=true;this.wrote(V);return{t:V.t,v:e.k==="pre"?V.v:old}}
      V.v=V.t==="bool"?(e.op==="++"?1:0):wrapTo(V.t,typeof old==="bigint"?old+(e.op==="++"?1n:-1n):old+(e.op==="++"?1:-1));V.init=true;this.wrote(V);return{t:V.t,v:e.k==="pre"?V.v:old}}
  untemp(C){const k=this.temps.indexOf(C);if(k>=0)this.temps.splice(k,1)}
  /* hàm ảo: tìm bản ghi đè theo kiểu thật của đối tượng */
  virt(E,C){if(!E.virt||!C||!C.v||!C.v.o)return E;for(const x of clsChain(C.v.vp||C.v.o)){if(x!==E.cls&&!clsChain(x).includes(E.cls))continue;const L=CLS.get(x).mt.get(E.name);const o=L&&L.find(y=>y.key===E.key&&y.cnst===E.cnst);if(o){if(o.pure)break;return o}}
    if(E.pure)throw new RunErr("pure virtual method called\nterminate called without an active exception\nAborted (core dumped)",`Gọi hàm ảo thuần túy ${clsName(E.cls)}::${E.name} (chưa có thân), thường xảy ra khi gọi hàm ảo trong hàm tạo/hàm hủy của lớp cha.`,134);return E}
  /* dựng đối tượng C kiểu id: E là hàm tạo đã chọn lúc kiểm tra (null: không có hàm tạo người viết) */
  *constructG(C,E,args,br,id){const D=CLS.get(id);
    if(E){const A=yield* this.argsG(E,args);yield{call:E,args:A,self:C,ctor:true};return}
    if(!br&&args.length===1){const r=yield* this.evG(args[0]);
      if(r.v&&r.v.o){if(r.tc&&r.v.o===id&&C.v!==r.v){this.untemp(r.tc);for(const k in r.v.f)C.v.f[k]=r.v.f[k];this.adopt(C,C.own);return}this.assignObj(C,r);return}
      return}
    if(br||args.length){C.v=this.mkObj(id,true);this.adopt(C,C.own);
      const fs=D.fields;for(let k=0;k<fs.length;k++){const F=fs[k],fc=C.v.f[this.fkey(F)],a=args[k];
        if(a===undefined){if(F.init)yield* this.fieldInitG(fc,F,F.init);else if(isCls(F.t))yield* this.defaultG(fc,F.t);continue}
        if(isCls(F.t)){if(a.k==="ilist")yield* this.constructG(fc,a.cE||null,a.items,true,F.t);else yield* this.constructG(fc,a.cE||null,[a],false,F.t);continue}
        if(a.k==="ilist"){const L=yield* this.listG(a);fc.v=isArr(F.t)?this.mkArr(F.t,arrN(F.t),L.items,true):this.conv(L.items[0]||{t:"int",v:0},F.t);this.adopt(fc,fc.own);fc.init=true;continue}
        fc.v=this.conv(yield* this.evG(a),F.t);fc.init=true}
      return}
    yield* this.defaultG(C,id)}
  /* hàm tạo mặc định (người viết hoặc tự sinh) */
  *defaultG(C,id){const D=CLS.get(id);const E=D.ctorE&&D.ctorE.find(x=>x.params.every(q=>q.def));
    if(E){const A=yield* this.argsG(E,[]);yield{call:E,args:A,self:C,ctor:true};return}
    const top=C.v&&C.v.o===id;   // đối tượng hoàn chỉnh (không phải phần lớp cha của một đối tượng lớn hơn): tự dựng lớp cơ sở ảo
    if(top)for(const v of vbasesOf(id))yield* this.defaultG(C,v);
    for(const b of D.bases)if(!b.virt)yield* this.defaultG(C,b.id);
    if(D.poly&&C.v)C.v.vp=id;
    for(const F of D.fields){const fc=C.v.f[this.fkey(F)];if(F.init)yield* this.fieldInitG(fc,F,F.init);else if(isCls(F.t))yield* this.defaultG(fc,F.t);else if(isArr(F.t)&&isCls(elemT(F.t)))for(const c of fc.v.a)yield* this.defaultG(c,elemT(F.t))}}
  *fieldInitG(fc,F,I){
    if(isCls(F.t)){if(I.list)yield* this.constructG(fc,I.list.cE||null,I.list.items,true,F.t);else if(I.e)yield* this.constructG(fc,I.e.cE||null,[I.e],false,F.t);return}
    if(I.list||(I.e&&I.e.k==="ilist")){const L=yield* this.listG(I.list||I.e);fc.v=isArr(F.t)||isVec(F.t)?(isArr(F.t)?this.mkArr(F.t,arrN(F.t),L.items,true):this.fromList(F.t,L.items)):this.conv(L.items[0]||{t:"int",v:0},F.t);this.adopt(fc,fc.own);fc.init=true;return}
    fc.v=this.conv(yield* this.evG(I.e),F.t);fc.init=true;if(isSeq(F.t))this.adopt(fc,fc.own)}
  /* phần đầu của hàm tạo (chạy trong khung của hàm tạo): lớp cha, rồi các thành viên theo thứ tự khai báo */
  *ctorInitG(E){const C=this.selfCell(),D=CLS.get(E.cls);
    const top=C.v&&C.v.o===E.cls;
    const one=function*(b){const I=E.inits.find(x=>x.base===b);if(I)yield* this.constructG(C,I.ctorE||null,I.args,I.br,b);else yield* this.defaultG(C,b)}.bind(this);
    if(top)for(const v of vbasesOf(E.cls))yield* one(v);
    for(const b of D.bases)if(!b.virt)yield* one(b.id);
    if(D.poly&&C.v)C.v.vp=E.cls;
    for(const F of D.fields){const fc=C.v.f[this.fkey(F)];const I=E.inits.find(x=>x.fld===F);
      if(I){if(isCls(F.t))yield* this.constructG(fc,I.ctorE||null,I.args,I.br,F.t);
        else if(I.args.length){const a=I.args[0];if(a.k==="ilist"){const L=yield* this.listG(a);fc.v=this.conv(L.items[0]||{t:"int",v:0},F.t)}else fc.v=this.conv(yield* this.evG(a),F.t);fc.init=true;if(isSeq(F.t))this.adopt(fc,fc.own)}
        else{fc.v=this.zero(F.t);fc.init=true}
        this.wrote(fc);continue}
      if(F.init){yield* this.fieldInitG(fc,F,F.init);this.wrote(fc)}
      else if(isCls(F.t))yield* this.defaultG(fc,F.t);
      else if(isArr(F.t)&&isCls(elemT(F.t)))for(const c of fc.v.a)yield* this.defaultG(c,elemT(F.t))}}
  /* hủy đối tượng: thân hàm hủy, rồi các thành viên (ngược thứ tự khai báo), rồi lớp cha */
  *destroyG(C,id){const D=CLS.get(id);
    if(D.poly&&C.v)C.v.vp=id;
    if(D.dtorE)yield{call:D.dtorE,args:[],self:C,dtor:true};
    for(const F of D.fields.slice().reverse()){const fc=C.v.f[this.fkey(F)];if(!fc)continue;
      if(isCls(F.t)&&CLS.get(F.t).hasDtor)yield* this.destroyG(fc,F.t);
      else if(isArr(F.t)&&isCls(elemT(F.t))&&CLS.get(elemT(F.t)).hasDtor)for(const c of fc.v.a.slice().reverse())yield* this.destroyG(c,elemT(F.t))}
    for(const b of D.bases.slice().reverse())if(!b.virt&&CLS.get(b.id).hasDtor)yield* this.destroyG(C,b.id);
    if(C.v&&C.v.o===id)for(const v of vbasesOf(id).reverse())if(CLS.get(v).hasDtor)yield* this.destroyG(C,v)}
  *destroyAll(L){for(const C of L){if(C.v&&C.v.a){for(const c of isVec(C.t)?C.v.a.slice():C.v.a.slice().reverse())if(c.v&&c.v.o)yield* this.destroyG(c,c.t)}else if(C.v&&C.v.o)yield* this.destroyG(C,C.t);C.dead=true}}
  needD(t){const b=isArr(t)?t.replace(/\[.*$/,""):isVec(t)?elemT(t):t;return isCls(b)&&CLS.get(b).hasDtor}
  /* hàm sắp trả về: hủy các đối tượng cục bộ trước (ngược thứ tự khai báo) */
  endFn(rv){if(this.ending)return false;this.ending=true;const L=[];
    for(const n of [...this.order].reverse()){if(n==="this"||this.refs.has(n))continue;const V=this.vars.get(n);if(!V||V.st||V.nrvo||V.dead)continue;if(this.needD(V.t))L.push(V)}
    if(!L.length)return false;this.dq.push(...L);this.pendRet={rv};return true}
  /* tạo giá trị ban đầu cho biến (cục bộ hoặc toàn cục) */
  mkVal(S,it,r,glob){let t=it.t;
    if(isArr(t)){const N=it.vla?r.vlaN:arrN(t);if(it.vla)t=t.replace("[]",`[${N}]`);
      const v=this.mkArr(t,N,r&&r.t==="ilist"?r.items:null,glob||!!r);return{t,v,init:true,sz:N*sizeOfT(elemT(t))}}
    if(isVec(t)){let v;if(!r)v={a:[]};else if(r.t==="args"){const A=r.items,E=elemT(t);
        if(A.length===1&&A[0].t==="ilist")v=this.fromList(t,A[0].items);
        else if(A.length===1&&A[0].t===t)v=this.clone(t,A[0].v);
        else{const n=toNum(A[0].v);if(n<0||n>20000000)throw new RunErr("terminate called after throwing an instance of 'std::length_error'\n  what():  cannot create std::vector larger than max_size()\nAborted (core dumped)",`Tạo vector với ${n} phần tử là không hợp lệ (số âm bị đổi thành số rất lớn).`,134);
          v={a:Array.from({length:n},()=>({t:E,v:A[1]?this.conv(A[1],E):this.zero(E),init:true}))};this.cost+=n}}
      else v=this.conv(r,t);return{t,v,init:true,sz:24}}
    if(t==="string"&&r&&r.t==="args"){const A=r.items;return{t,v:A.length===2?String.fromCharCode(((toNum(A[1].v)%256)+256)%256).repeat(Math.max(0,toNum(A[0].v))):A[0].v,init:true,sz:32}}
    let v,init=true;
    if(r)v=this.conv(r,t);
    else if(isPtr(t)){if(it.init||glob)v={h:null,k:0};else{v=this.badPtr();init=false}}
    else if(it.init||t==="string"||glob)v=t==="string"?"":wrapTo(t,0);
    else{v=this.garbage(t);init=false}
    return{t,v,init,sz:SIZES[t]||sizeOfT(t)}}
  declItem(S,it,r){
    if(r&&r.done)return;
    if(S.ref){this.bindName(it.name,r.ref);if(r.label)this.refs.set(it.name,r.label);return}
    if(S.st){let V=this.statics.get(it);   // static cục bộ: tạo một lần ở vùng dữ liệu, lần sau chỉ gắn lại tên
      if(!V){const mk=this.mkVal(S,it,r,true),al=Math.min(SIZES[it.t]||8,8);this.saddr=Math.ceil(this.saddr/al)*al;V={t:mk.t,v:mk.v,init:true,c:S.ty.c,addr:this.saddr,st:true};this.saddr+=Math.max(1,mk.sz);this.adopt(V);this.statics.set(it,V)}
      this.bindName(it.name,V);return}
    const mk=this.mkVal(S,it,r,false);const sz=Math.max(1,mk.sz);this.addr-=sz;this.addr-=this.addr%Math.min(SIZES[it.t]||8,8);
    if(0x7ffd7ffd5c50-this.addr>M2.STACK)throw new RunErr("Segmentation fault (core dumped)",`Tràn stack: ${it.name} chiếm ${(sz/1048576).toFixed(1)} MB, cộng với các biến khác vượt quá vùng stack (thường chỉ 8 MB trên Linux, 1 MB trên Windows). Biến cục bộ lớn nên đặt trên heap: dùng vector<${elemT(mk.t)||it.t}> ${it.name}(n) hoặc new, hoặc khai báo mảng ở ngoài hàm (biến toàn cục).`,139);
    const V={t:mk.t,v:mk.v,init:mk.init,c:S.ty.c,ce:S.ty.ce,addr:this.addr};this.adopt(V);this.bindName(it.name,V)}
  /* ---------- mảng, vector, chuỗi lúc chạy: ô nhớ {t, v, init}; mảng/vector có v = {a: [ô, ...]} ---------- */
  zero(t){if(isPtr(t))return{h:null,k:0};if(isCls(t))return this.mkObj(t,true);return isVec(t)?{a:[]}:isArr(t)?this.mkArr(t,arrN(t),null,true):t==="string"?"":wrapTo(t,0)}
  garb(t,k){if(isPtr(t))return this.badPtr(k);if(isCls(t))return this.mkObj(t,false);if(t==="string"||isVec(t))return this.zero(t);const g=[32767,0,-858993460,4199040,0,21845,1,-1530494976,0,22015,7,32764][k%12];return isFlT(t)?(k%3?0:6.9533558078350043e-310):t==="bool"?k%2:wrapTo(t,g)}
  mkArr(t,N,L,zero){const et=elemT(t),a=new Array(N);
    for(let k=0;k<N;k++){const x=L&&k<L.length?L[k]:undefined;
      if(isArr(et))a[k]={t:et,v:this.mkArr(et,arrN(et),x&&x.t==="ilist"?x.items:null,zero||!!L),init:true};
      else if(x!==undefined)a[k]={t:et,v:this.conv(x,et),init:true};
      else{const z=zero||et==="string"||isVec(et);a[k]={t:et,v:z?this.zero(et):this.garb(et,k),init:z}}}
    this.cost+=N>64?Math.ceil(N/64):0;return{a}}
  fromList(t,items){const E=elemT(t);if(isArr(t))return this.mkArr(t,arrN(t),items,true);return{a:items.map(x=>({t:E,v:this.conv(x,E),init:true}))}}
  clone(t,v){if(v&&typeof v==="object"&&v.o&&v.f)return this.cloneObj(v);if(v&&typeof v==="object"&&v.a){this.cost+=v.a.length>64?Math.ceil(v.a.length/64):0;return{a:v.a.map(c=>({t:c.t,v:this.clone(c.t,c.v),init:c.init}))}}return v}
  /* ô gốc (biến) của mỗi ô phần tử: dùng để biết biến nào vừa thay đổi */
  adopt(V,own){own=own||V;
    if(V.v&&typeof V.v==="object"&&V.v.f){for(const k in V.v.f){const c=V.v.f[k];c.own=own;c.par=V;if(c.v&&typeof c.v==="object"){if(c.v.f)this.adopt(c,own);else if(c.v.a){const es=sizeOfT(elemT(c.t));c.v.a.forEach((x,i)=>{x.par=c;x.off=i*es});this.adopt(c,own)}}}return}
    if(V.v&&typeof V.v==="object"&&V.v.a)for(const c of V.v.a){c.own=own;if(c.v&&typeof c.v==="object"&&(c.v.a||c.v.f))this.adopt(c,own)}}
  wrote(c){this.wr.add(c);this.wrRoot.add(c.own||c)}
  baseOf(a){if(a.k==="name"||a.k==="idx"||a.k==="deref"||a.k==="mem"||(a.k==="mc"&&!a.fn&&["back","front","at"].includes(a.m)))return this.LV(a);const r=this.ev(a);return{t:r.t,v:r.v,init:true,tmp:true}}
  LV(e,iv){switch(e.k){
    case "name":return this.L(e);
    case "mem":return this.memCell(e);
    case "idx":{const B=this.baseOf(e.a),i=toNum((iv||this.ev(e.i)).v);
      if(isPtr(B.t)){const v=B.v;return this.ptrCell({h:v.h,k:v.k+i,ad:v.ad,bad:v.bad},e,`${this.pname(e.a)}[${i}]`)}
      if(B.t==="string"||B.t==="cstr")return this.chCell(B,i,e);
      const A=B.v.a;if(!(i>=0&&i<A.length))throw this.oob(e,B,i,A.length);return A[i]}
    case "deref":{const r=this.ev(e.a);if(isPtr(r.t))return this.ptrCell(r.v,e,"*"+this.pname(e.a));return this.itCell(r.v,e)}
    case "mc":{const O=this.baseOf(e.o);
      if(O.t==="string"){const n=blen(O.v);if(e.m==="at"){const i=toNum(this.ev(e.args[0]).v);if(!(i>=0&&i<n))throw this.atErr(`basic_string::at: __n (which is ${i}) >= this->size() (which is ${n})`);return this.chCell(O,i,null)}
        if(!n)throw this.emptyErr(e,"chuỗi");return this.chCell(O,e.m==="back"?n-1:0,null)}
      const A=O.v.a;if(e.m==="at"){const i=toNum(this.ev(e.args[0]).v);if(!(i>=0&&i<A.length))throw this.atErr(`vector::_M_range_check: __n (which is ${i}) >= this->size() (which is ${A.length})`);return A[i]}
      if(!A.length)throw this.emptyErr(e,"vector");return A[e.m==="back"?A.length-1:0]}
    default:{const r=this.ev(e);if(r.cell&&e.k==="call")return r.cell;return{t:r.t,v:r.v,init:true,tmp:true}}}}
  itCell(I,e){const H=I.h;if(H.t==="string"||H.t==="cstr")return this.chCell(H,I.k,e);const A=H.v.a;if(!(I.k>=0&&I.k<A.length))throw new RunErr("Lỗi chạy: dùng * với vị trí nằm ngoài dãy",`Vị trí (iterator) này đang ở chỉ số ${I.k}, ngoài dãy ${A.length} phần tử (thường là v.end(): vị trí SAU phần tử cuối, không có phần tử nào ở đó). Kiểm tra kết quả của find/lower_bound với v.end() trước khi dùng *.`,139);return A[I.k]}
  chCell(B,i,e){const n=blen(B.v);if(!(i>=0&&i<=n))throw this.oob(e,B,i,n);
    return{t:"char",init:true,own:B.own||B,get v(){const s=B.v;if(i>=blen(s))return 0;const c=isAscii(s)?s.charCodeAt(i):u8(s)[i];return c>127?c-256:c},
      set v(x){const s=B.v,c=((toNum(x)%256)+256)%256;if(isAscii(s)&&c<128)B.v=s.slice(0,i)+String.fromCharCode(c)+s.slice(i+1);else{const b=u8(s).slice();b[i]=c;B.v=fromBytes(b)}}}}
  oob(e,B,i,n){const nm=e&&e.a&&e.a.k==="name"?e.a.n:e&&e.a&&e.a.k==="idx"&&e.a.a.k==="name"?e.a.a.n+"[…]":"dãy";const kind=isVec(B.t)?"vector":B.t==="string"?"chuỗi":"mảng";
    return new RunErr(`Lỗi chạy: truy cập ${nm}[${i}] nằm ngoài ${kind} (${kind} có ${n} phần tử)`,`Chỉ số hợp lệ của ${nm} là ${n?`từ 0 đến ${n-1}`:"không có (đang rỗng)"}, nhưng chương trình dùng chỉ số ${i}. Lỗi hay gặp: vòng lặp chạy tới i <= n thay vì i < n, quên trừ 1, hoặc chưa kiểm tra rỗng. Trình mô phỏng dừng ngay để bạn thấy lỗi; trên máy thật C++ KHÔNG kiểm tra chỉ số: chương trình có thể in giá trị rác, ghi đè biến khác, hoặc dừng với “Segmentation fault”.`,139)}
  atErr(w){return new RunErr(`terminate called after throwing an instance of 'std::out_of_range'\n  what():  ${w}\nAborted (core dumped)`,"at() có kiểm tra chỉ số: chỉ số không hợp lệ thì ném ngoại lệ out_of_range và chương trình dừng (khác với [ ] không kiểm tra gì).",134)}
  emptyErr(e,kind){return new RunErr(`Lỗi chạy: gọi ${e.m}() trên ${kind} rỗng`,`${kind==="chuỗi"?"Chuỗi":"vector"} đang không có phần tử nào nên không có phần tử ${e.m==="front"?"đầu":"cuối"} để ${e.m==="pop_back"?"xóa":"lấy"}. Trên máy thật đây là hành vi không xác định (có thể in rác hoặc dừng chương trình). Hãy kiểm tra !${kind==="chuỗi"?"s":"v"}.empty() trước.`,139)}
  conv(r,t){
    if(isCls(t)){if(r&&r.v&&r.v.o)return r.v.o===t?this.cloneObj(r.v):this.cloneObj(r.v,t);
      const o=this.mkObj(t,true);if(r&&r.t==="ilist"){const fs=CLS.get(t).fields;r.items.forEach((x,k)=>{const F=fs[k];if(F){const c=o.f[this.fkey(F)];c.v=this.conv(x,F.t);c.init=true}})}return o}
    if(isPtr(t)){if(isPtr(r.t)&&r.v&&r.v.h&&isCls(elemT(t))&&isCls(elemT(r.t))&&elemT(t)!==elemT(r.t)&&isBaseOf0(elemT(t),elemT(r.t))){const d=baseOff(elemT(r.t),elemT(t));if(d)return Object.assign({},r.v,{sub:(r.v.sub||0)+d})}
      if(isPtr(r.t)||isIter(r.t))return r.v;if(isArr(r.t))return{h:r.cell||{t:r.t,v:r.v},k:0};if(r.t==="ilist")return r.items.length?this.conv(r.items[0],t):{h:null,k:0};return{h:null,k:0}}
    if(isSeq(t)){if(r.t==="ilist")return this.fromList(t,r.items);return this.clone(t,r.v)}
    if(isIter(t)||t==="functor")return r.v;
    if(r.t==="ilist")return r.items.length?this.conv(r.items[0],t):this.zero(t);
    if(t==="string"){if(r.t==="string"||r.t==="cstr")return r.v;const c=toNum(r.v);return String.fromCharCode(((c%256)+256)%256)}
    if(isFlT(r.t)&&INTG.has(t)&&t!=="bool"){const R=RANGE[t==="unsigned"||t==="size_t"?"long long":t==="char"||t==="short"?"int":t];
      if(!(r.v>=R[0]&&r.v<=R[1]))return wrapTo(t,t==="long long"?-9223372036854775808:-2147483648)}
    return wrapTo(t,r.v);
  }
  condRes(e,r){if(isPtr(e.rt))return{t:e.rt,v:this.conv(r,e.rt)};if(e.rt==="string"||e.rt==="cstr")return{t:e.rt,v:r.t==="char"?String.fromCharCode(r.v):r.v};return{t:e.rt,v:this.conv(r,e.rt)}}
  assign(e,r,iv,cell){const V=cell||this.LV(e.a,iv);
    if(isCls(V.t)&&e.op==="="){if(r.v&&r.v.o)this.assignObj(V,r);V.init=true;return{t:V.t,v:V.v,cell:V}}
    if(e.op!=="="){if(V.t==="string"){V.v+=r.t==="char"?String.fromCharCode(((r.v%256)+256)%256):r.v;this.wrote(V);return{t:"string",v:V.v}}
      r=this.arith(e.op.slice(0,-1),{t:V.t,v:V.v},r)}
    V.v=this.conv(r,V.t);V.init=true;if(isSeq(V.t))this.adopt(V,V.own);this.wrote(V);return{t:V.t,v:V.v}}
  builtin(f,a){
    if(f==="abs"){const x=a[0];const t=isFlT(x.t)?"double":promo(x.t,x.t);if(t==="long long"){const b=toBig(x.v);return{t,v:BigInt.asIntN(64,b<0n?-b:b)}}return{t,v:wrapTo(t,Math.abs(x.v))}}
    a=a.map(x=>x&&typeof x.v==="bigint"?{t:x.t,v:Number(x.v)}:x);
    if(f==="setprecision")return{t:"manip",m:"prec",n:a[0].v};
    if(f==="setw")return{t:"manip",m:"w",n:a[0].v};
    if(f==="sqrt")return{t:"double",v:Math.sqrt(a[0].v)};
    if(f==="pow")return{t:"double",v:Math.pow(a[0].v,a[1].v)};
    if(f==="round"){const v=a[0].v;return{t:"double",v:Math.sign(v)*Math.round(Math.abs(v))}}
    if(f==="floor")return{t:"double",v:Math.floor(a[0].v)};
    if(f==="ceil")return{t:"double",v:Math.ceil(a[0].v)};
    if(f==="trunc")return{t:"double",v:Math.trunc(a[0].v)};
    if(f==="fmod")return{t:"double",v:a[0].v%a[1].v};
    return{t:"void"}}
  member(e,o){
    if(e.m==="fail")return{t:"bool",v:this.failed?1:0};
    if(e.m==="good")return{t:"bool",v:this.failed||this.eof?0:1};
    if(e.m==="eof")return{t:"bool",v:this.eof?1:0};
    if(e.m==="clear"){this.failed=false;this.eof=false;return{t:"void"}}
    return{t:"void"}}
  /* ---------- hàm thành viên của vector và string ---------- */
  memberCall(e,A){const O=this.baseOf(e.o);if(isVec(O.t))return this.vecM(e,O,A);if(O.t==="string"||O.t==="cstr")return this.strM(e,O,A);return this.member(e,O)}
  vecM(e,O,A){const m=e.m,a=O.v.a,E=elemT(O.t),own=O.own||O,IT="iter<"+E+">";
    const mk=x=>{const c={t:E,v:this.conv(x,E),init:true,own};this.adopt(c,own);this.wrote(c);return c};
    switch(m){
      case "size":return{t:"size_t",v:BigInt(a.length)};
      case "empty":return{t:"bool",v:a.length?0:1};
      case "push_back":case "emplace_back":a.push(mk(A[0]));this.wrRoot.add(own);return{t:"void"};
      case "pop_back":if(!a.length)throw this.emptyErr(e,"vector");a.pop();this.wrRoot.add(own);return{t:"void"};
      case "back":case "front":case "at":{const c=this.LV(e);this.rd.add(c);return{t:c.t,v:c.v}}
      case "clear":this.cost+=a.length;a.length=0;this.wrRoot.add(own);return{t:"void"};
      case "resize":{const n=toNum(A[0].v);if(n<0||n>20000000)throw new RunErr("terminate called after throwing an instance of 'std::length_error'\n  what():  vector::_M_default_append\nAborted (core dumped)",`resize(${n}) không hợp lệ.`,134);
        this.cost+=Math.abs(n-a.length);if(n<a.length)a.length=n;else while(a.length<n)a.push(mk(A[1]||{t:E,v:this.zero(E)}));this.wrRoot.add(own);return{t:"void"}}
      case "assign":{const n=toNum(A[0].v);a.length=0;for(let k=0;k<n;k++)a.push(mk(A[1]));this.cost+=n;this.wrRoot.add(own);return{t:"void"}}
      case "begin":return{t:IT,v:{h:O,k:0}};
      case "end":return{t:IT,v:{h:O,k:a.length}};
      case "insert":{const k=A[0].v.k;if(k<0||k>a.length)throw new RunErr("Lỗi chạy: insert ở vị trí ngoài vector",`Vị trí chèn ${k} nằm ngoài vector ${a.length} phần tử.`,139);a.splice(k,0,mk(A[1]));this.cost+=a.length-k;this.wrRoot.add(own);return{t:IT,v:{h:O,k}}}
      case "erase":{const k1=A[0].v.k,k2=A[1]?A[1].v.k:k1+1;if(k1<0||k1>=a.length&&!A[1]||k2>a.length||k2<k1)throw new RunErr("Lỗi chạy: erase ở vị trí ngoài vector",`Vị trí xóa nằm ngoài vector ${a.length} phần tử (thường do xóa v.end() hoặc vector rỗng).`,139);
        a.splice(k1,k2-k1);this.cost+=a.length-k1+1;this.wrRoot.add(own);return{t:IT,v:{h:O,k:k1}}}}
    return{t:"void"}}
  strM(e,O,A){const m=e.m,s=O.v,asc=isAscii(s),n=blen(s);
    const sub=(a,b)=>asc?s.slice(a,b):fromBytes(u8(s).slice(a,b));
    const set=v=>{O.v=v;this.wrote(O)};const chOf=x=>String.fromCharCode(((toNum(x.v)%256)+256)%256);
    const strOf=x=>x.t==="char"?chOf(x):x.v;
    const oor=w=>{throw this.atErr(w)};
    switch(m){
      case "size":case "length":return{t:"size_t",v:BigInt(n)};
      case "empty":return{t:"bool",v:n?0:1};
      case "substr":{const p=toNum(A[0].v),L=A[1]?toNum(A[1].v):Infinity;if(p>n)oor(`basic_string::substr: __pos (which is ${p}) > this->size() (which is ${n})`);
        const r=sub(p,Math.min(n,p+(L<0?Infinity:L)));this.cost+=Math.ceil(blen(r)/8);return{t:"string",v:r}}
      case "find":case "rfind":{const x=strOf(A[0]),p=A[1]?toNum(A[1].v):(m==="find"?0:Infinity);let k;
        if(asc&&isAscii(x))k=m==="find"?(p>n?-1:s.indexOf(x,p)):s.lastIndexOf(x,p);
        else{const B=u8(s),X=u8(x);const ok=i=>{for(let j=0;j<X.length;j++)if(B[i+j]!==X[j])return false;return true};k=-1;
          if(m==="find"){for(let i=p;i+X.length<=B.length;i++)if(ok(i)){k=i;break}}else{for(let i=Math.min(p,B.length-X.length);i>=0;i--)if(ok(i)){k=i;break}}}
        this.cost+=Math.ceil(n/8);return{t:"size_t",v:k<0?NPOS:BigInt(k)}}
      case "push_back":set(s+chOf(A[0]));return{t:"void"};
      case "pop_back":if(!n)throw this.emptyErr(e,"chuỗi");set(sub(0,n-1));return{t:"void"};
      case "back":case "front":case "at":{const c=this.LV(e);return{t:"char",v:c.v}}
      case "clear":set("");return{t:"void"};
      case "erase":{const p=toNum(A[0].v),L=A[1]?toNum(A[1].v):Infinity;if(p>n)oor(`basic_string::erase: __pos (which is ${p}) > this->size() (which is ${n})`);set(sub(0,p)+sub(Math.min(n,p+L),n));this.cost+=Math.ceil(n/8);return{t:"string",v:O.v}}
      case "insert":{const p=toNum(A[0].v);if(p>n)oor(`basic_string::insert: __pos (which is ${p}) > this->size() (which is ${n})`);set(sub(0,p)+A[1].v+sub(p,n));this.cost+=Math.ceil(n/8);return{t:"string",v:O.v}}
      case "append":set(s+A[0].v);return{t:"string",v:O.v};
      case "begin":return{t:"iter<char>",v:{h:O,k:0}};
      case "end":return{t:"iter<char>",v:{h:O,k:n}}}
    return{t:"void"}}
  /* ---------- <algorithm>, <numeric>, <string> ---------- */
  rangeOf(A,B){const I=A.v,J=B.v;const H=I.h;if(J.h.v!==H.v&&J.h!==H)throw new RunErr("Lỗi chạy: hai vị trí không cùng một dãy","Vị trí đầu và vị trí cuối phải thuộc cùng một mảng/vector.",139);
    const len=H.t==="string"?blen(H.v):H.v.a.length;if(I.k<0||J.k>len||I.k>J.k)throw new RunErr("Lỗi chạy: đoạn [đầu, cuối) không hợp lệ",`Đoạn từ chỉ số ${I.k} tới ${J.k} không nằm trong dãy ${len} phần tử${J.k>len?" (thường do a + n với n lớn hơn số phần tử)":""}.`,139);
    return{H,k1:I.k,k2:J.k}}
  /* các ô trong đoạn: chuỗi thì đổi tạm sang mảng byte rồi ghi lại */
  cellsOf(R){if(R.H.t==="string"){const b=Array.from(u8(R.H.v));const cells=b.slice(R.k1,R.k2).map(x=>({t:"char",v:x>127?x-256:x,init:true}));
      return{cells,commit:()=>{for(let k=0;k<cells.length;k++)b[R.k1+k]=((cells[k].v%256)+256)%256;R.H.v=fromBytes(new Uint8Array(b));this.wrote(R.H)}}}
    return{cells:R.H.v.a.slice(R.k1,R.k2),commit:()=>{}}}
  callSync(F,args,self){const sub=new M2({code:F.code,mainFn:{name:F.name,ret:F.ret,e:F.e,cls:F.cls,rref:F.rref},globals:[]},this.src,{input:"",interactive:false});
    if(self){sub.vars.set("this",{t:F.cls+"*",v:{h:this.wrapOf(self),k:0},init:true});sub.order.push("this")}
    sub.globals=this.globals;sub.gorder=this.gorder;sub.out=this.out;sub.fmt=this.fmt;sub.isSub=true;sub.snap=false;sub.count=this.count;
    F.params.forEach((P,k)=>{if(!P.name)return;sub.vars.set(P.name,P.ref?args[k]:{t:P.t,v:this.conv(args[k],P.t),init:true,addr:0});sub.order.push(P.name)});
    sub.flush();let r;for(;;){r=sub.step();if(r.s!=="ran")break}
    this.cost+=sub.cost;this.count=sub.count;if(this.count>M2.LIMIT)throw new RunErr("Time limit exceeded","Chương trình đã chạy hơn 1 000 000 bước (tính cả các lần gọi hàm so sánh).",124);
    if(r.s==="crash")throw sub.crash;return sub.retv?this.conv(sub.retv,F.ret):this.garbage(F.ret)}
  lib(e,pre){const f=e.f,A=e.args;const V=k=>pre&&pre[k]!==undefined&&pre[k]!==null?pre[k]:A[k].k==="ilist"?runSync(this.listG(A[k])):this.ev(A[k]);
    const log=n=>n>1?Math.ceil(Math.log2(n)):1;
    switch(f){
      case "swap":{const X=this.LV(A[0]),Y=this.LV(A[1]);const t=[X.v,X.init];X.v=Y.v;X.init=Y.init;Y.v=t[0];Y.init=t[1];if(isSeq(X.t)){this.adopt(X,X.own);this.adopt(Y,Y.own)}this.wrote(X);this.wrote(Y);this.rd.add(X);this.rd.add(Y);return{t:"void"}}
      case "max":case "min":{let xs;if(A.length===1){xs=V(0).items}else xs=[V(0),V(1)];let best=xs[0];
        for(const x of xs.slice(1)){const c=cmpV(x.v,best.v);if(f==="max"?c>0:c<0)best=x}return{t:best.t,v:best.v}}
      case "gcd":case "__gcd":{const a=V(0),b=V(1),t=promo(a.t,b.t);let x=toBig(a.v),y=toBig(b.v);if(f==="gcd"){x=x<0n?-x:x;y=y<0n?-y:y}while(y!==0n){[x,y]=[y,x%y]}this.cost+=log(Number(toBig(a.v)<0n?-toBig(a.v):toBig(a.v))+1);return{t,v:wrapTo(t,x)}}
      case "isalpha":case "isdigit":case "isalnum":case "isupper":case "islower":case "isspace":case "ispunct":case "toupper":case "tolower":{
        const c=toNum(V(0).v),u=c>=65&&c<=90,l=c>=97&&c<=122,d=c>=48&&c<=57,sp=c===32||(c>=9&&c<=13),pu=c>32&&c<127&&!u&&!l&&!d;
        const v={isalpha:u||l?1024:0,isdigit:d?1:0,isalnum:u||l||d?8:0,isupper:u?256:0,islower:l?512:0,isspace:sp?8192:0,ispunct:pu?4:0,toupper:l?c-32:c,tolower:u?c+32:c}[f];return{t:"int",v}}
      case "to_string":{const x=V(0);return{t:"string",v:isFlT(x.t)?ffmt(x.v,6):llStr(x.v)}}
      case "stoi":case "stoll":{const x=String(V(0).v),m=/^\s*([+-]?\d+)/.exec(x);
        if(!m)throw new RunErr(`terminate called after throwing an instance of 'std::invalid_argument'\n  what():  ${f}\nAborted (core dumped)`,`${f} không đổi được chuỗi “${x}” thành số vì chuỗi không bắt đầu bằng chữ số.`,134);
        const v=BigInt(m[1]);if(f==="stoi"&&(v>2147483647n||v<-2147483648n)||v>I64MAX||v<I64MIN)throw new RunErr(`terminate called after throwing an instance of 'std::out_of_range'\n  what():  ${f}\nAborted (core dumped)`,`Số “${m[1]}” vượt phạm vi của kiểu kết quả.`,134);
        return f==="stoi"?{t:"int",v:Number(v)}:{t:"long long",v}}}
    const itV=x=>isIter(x.t)?x:{t:"iter<"+elemT(x.t)+">",v:this.itOf(x)};
    const a0=V(0),R=this.rangeOf(itV(a0),itV(V(1))),C=this.cellsOf(R),cs=C.cells,n=cs.length,E=R.H.t==="string"?"char":R.H.one?R.H.one.t:elemT(R.H.t),IT=isIter(a0.t)?"iter<"+E+">":E+"*";
    const it=k=>({t:IT,v:{h:R.H,k:R.k1+k}});cs.forEach(c=>this.rd.add(c));
    switch(f){
      case "sort":case "stable_sort":{let cmp;const c3=A[2];
        if(!c3&&e.ltFn){const L=e.ltFn;cmp=(x,y)=>{const call=(a,b)=>L.mem?this.callSync(L.E,[b],a):this.callSync(L.E,[a,b]);if(toNum(call(x,y)))return -1;return toNum(call(y,x))?1:0}}
        else if(!c3)cmp=(x,y)=>cmpV(x.v,y.v);
        else if(c3.k==="functor")cmp=c3.f==="greater"?(x,y)=>cmpV(y.v,x.v):(x,y)=>cmpV(x.v,y.v);
        else{const F=c3.cmpFn;cmp=(x,y)=>{const r1=this.callSync(F,[x,y]);if(toNum(r1))return -1;const r2=this.callSync(F,[y,x]);return toNum(r2)?1:0}}
        const vals=cs.map(c=>({t:c.t,v:c.v,init:c.init}));vals.sort(cmp);vals.forEach((x,k)=>{cs[k].v=x.v;cs[k].init=x.init;if(x.v&&x.v.f)this.adopt(cs[k],cs[k].own);this.wrote(cs[k])});C.commit();this.cost+=n*log(n);return{t:"void"}}
      case "reverse":{const vals=cs.map(c=>[c.v,c.init]).reverse();vals.forEach((x,k)=>{cs[k].v=x[0];cs[k].init=x[1];this.wrote(cs[k])});C.commit();this.cost+=n;return{t:"void"}}
      case "fill":{const x=V(2);cs.forEach(c=>{c.v=this.conv(x,c.t);c.init=true;if(isSeq(c.t))this.adopt(c,c.own);this.wrote(c)});C.commit();this.cost+=n;return{t:"void"}}
      case "iota":{let x=V(2);cs.forEach(c=>{c.v=this.conv(x,c.t);c.init=true;this.wrote(c);x={t:x.t,v:this.arith("+",x,{t:"int",v:1}).v}});C.commit();this.cost+=n;return{t:"void"}}
      case "accumulate":{let acc=V(2);for(const c of cs)acc={t:acc.t,v:this.conv(this.arith("+",acc,{t:c.t,v:c.v}),acc.t)};this.cost+=n;return acc}
      case "count":{const x=V(2);this.cost+=n;return{t:"long long",v:BigInt(cs.filter(c=>cmpV(c.v,this.conv(x,c.t))===0).length)}}
      case "find":{const x=V(2);for(let k=0;k<n;k++)if(cmpV(cs[k].v,this.conv(x,cs[k].t))===0){this.cost+=k+1;return it(k)}this.cost+=n;return it(n)}
      case "max_element":case "min_element":{if(!n)return it(0);let b=0;for(let k=1;k<n;k++){const c=cmpV(cs[k].v,cs[b].v);if(f==="max_element"?c>0:c<0)b=k}this.cost+=n;return it(b)}
      case "lower_bound":case "upper_bound":case "binary_search":{const x=V(2),xv=this.conv(x,E);let lo=0,hi=n;
        while(lo<hi){const mid=(lo+hi)>>1,c=cmpV(cs[mid].v,xv);if(f==="upper_bound"?c<=0:c<0)lo=mid+1;else hi=mid}
        this.cost+=log(n+1);if(f==="binary_search")return{t:"bool",v:lo<n&&cmpV(cs[lo].v,xv)===0?1:0};return it(lo)}
      case "unique":{if(!n)return it(0);let w=0;for(let k=1;k<n;k++)if(cmpV(cs[k].v,cs[w].v)!==0){w++;cs[w].v=cs[k].v;cs[w].init=cs[k].init;this.wrote(cs[w])}C.commit();this.cost+=n;return it(w+1)}
      case "next_permutation":case "prev_permutation":{const sg=f==="next_permutation"?1:-1,vs=cs.map(c=>c.v);let i=n-2;
        while(i>=0&&sg*cmpV(vs[i],vs[i+1])>=0)i--;
        if(i<0){vs.reverse()}else{let j=n-1;while(sg*cmpV(vs[j],vs[i])<=0)j--;[vs[i],vs[j]]=[vs[j],vs[i]];const tail=vs.splice(i+1).reverse();vs.push(...tail)}
        vs.forEach((v,k)=>{if(cs[k].v!==v){cs[k].v=v;this.wrote(cs[k])}});C.commit();this.cost+=n;return{t:"bool",v:i<0?0:1}}}
    return{t:"void"}}
  ev(e){switch(e.k){
    case "this":return{t:this.vars.get("this").t,v:this.vars.get("this").v};
    case "mem":{const C=this.memCell(e);this.rd.add(C);if(!C.init){const nm=e.m;if(!this.notes.includes(nm))this.notes.push(nm)}return{t:C.t,v:C.v,cell:C}}
    case "octor":return runSync(this.evG(Object.assign({},e,{cx:true})));
    case "num":return{t:e.t,v:e.v};case "str":return{t:"cstr",v:e.v};case "chr":return{t:"char",v:e.v};case "bool":return{t:"bool",v:e.v};
    case "nullptr":return{t:"nullptr_t",v:{h:null,k:0}};
    case "addr":return this.addrOf(e);
    case "new":return this.newE(e,e.n?this.ev(e.n):null,e.init&&e.init.e?this.ev(e.init.e):e.init&&e.init.list?runSync(this.listG(e.init.list)):null);
    case "del":{const r=this.ev(e.a);this.del(r.v,e);return{t:"void"}}
    case "name":{
      if(e.r==="null")return{t:"nullptr_t",v:{h:null,k:0}};
      if(e.r==="var"||e.r==="gvar"){const V=this.L(e);if(!V.init&&!this.notes.includes(e.n))this.notes.push(e.n);return{t:V.t,v:V.v,cell:V}}
      if(e.r==="macro")return{t:MACRO[e.n][1],v:MACRO[e.n][0]};
      const S=STDN[e.n];return S.t==="manip"?{t:"manip",m:e.n}:{t:S.t}}
    case "bin":return this.bin(e);
    case "un":return this.unop(e.op,this.ev(e.a));
    case "cond":{const c=this.ev(e.c);const yes=this.truth(c);return this.condRes(e,this.ev(yes?e.a:e.b))}
    case "pre":case "post":return this.incr(e,this.LV(e.a));
    case "idx":case "deref":{const C=this.LV(e);this.rd.add(C);if(!C.init){const nm=this.lvTxt(e);if(!this.notes.includes(nm))this.notes.push(nm)}return{t:C.t,v:C.v,cell:C}}
    case "ilist":return runSync(this.listG(e));
    case "npos":return{t:"size_t",v:NPOS};
    case "functor":return{t:"functor",v:e.f};
    case "ctor":{if(e.list)return{t:e.t,v:this.fromList(e.t,runSync(this.listG(e.list)).items)};const items=e.args.map(a=>a.k==="ilist"?runSync(this.listG(a)):this.ev(a));return{t:e.t,v:this.mkVal({},{t:e.t},{t:"args",items},true).v}}
    case "as":return this.assign(e,this.ev(e.b));
    case "cast":{const a=this.ev(e.a);return{t:e.ty.t,v:this.conv(a,e.ty.t)}}
    case "sizeof":{if(e.st==="cstr")return{t:"size_t",v:BigInt(u8(e.a.v).length+1)};if(e.par)return{t:"size_t",v:8n};let t=e.ty?e.ty.t:e.st;if(e.a&&e.a.k==="name"&&isArr(t))t=this.L(e.a).t;return{t:"size_t",v:BigInt(sizeOfT(t)||8)}}
    case "lim":{const L=LIM[e.ty.t]||[0,0];let v=e.w==="max"?L[0]:L[1];if(e.w==="lowest")v=isFlT(e.ty.t)?-L[0]:L[1];return{t:e.ty.t,v}}
    case "call":{
      if(e.f==="getline"){this.getline(e.args[1]);return{t:"istream"}}
      if(LIB_RT.has(e.f))return this.lib(e);
      return this.builtin(e.f,e.args.map(a=>this.ev(a)))}
    case "mc":{
      if(e.m==="ignore"){const a=e.args.map(x=>this.ev(x));this.ignore(a[0]?a[0].v:1,a[1]?a[1].v:-1);return{t:"istream"}}
      if(["fail","good","eof","clear"].includes(e.m)&&e.o.k==="name"&&e.o.r==="std")return this.member(e,null);
      return this.memberCall(e,e.args.map(a=>a.k==="ilist"?runSync(this.listG(a)):this.ev(a)))}
  }}
  /* bản chạy từng bước: dừng lại được khi gọi hàm tự viết hoặc khi cin cần dữ liệu */
  /* toán tử nạp chồng: a.operator op(b) hoặc operator op(a, b) */
  *opG(e){const F0=e.fn,un=e.k==="un",rhs=e.k==="idx"?e.i:e.b;
    if(e.ovl.mem){const a=e.a;let C;if(a.cx){const R=yield* this.evG(a);C=R.cell||R.tc||{t:R.t,v:R.v,init:true}}else C=this.baseOf(a);
      const F=this.virt(F0,C);const A=yield* this.argsG(F,un?[]:[rhs]);return yield{call:F,args:A,self:C}}
    const A=yield* this.argsG(F0,un?[e.a]:[e.a,rhs]);return yield{call:F0,args:A}}
  *evG(e){if(!e.cx)return this.ev(e);
    switch(e.k){
      case "mem":{const O=e.o.cx?yield* this.evG(e.o):null;const C=this.memCell(e,O);this.rd.add(C);return{t:C.t,v:C.v,cell:C}}
      case "octor":{const C={t:e.t,v:this.mkObj(e.t,false),init:true};this.adopt(C);yield* this.constructG(C,e.ctorE||null,e.args,!!e.br,e.t);
        if(CLS.get(e.t).hasDtor)this.temps.push(C);return{t:e.t,v:C.v,tc:C,cell:C}}
      case "del":{const r=yield* this.evG(e.a);const v=r.v,H=v&&v.h;
        if(H&&H.heap&&!H.heap.freed&&v.k===0&&isCls(elemT(H.t))){const st=isPtr(r.t)&&isCls(elemT(r.t))?elemT(r.t):elemT(H.t);
          const vd=clsChain(st).some(x=>CLS.get(x).dtorE&&CLS.get(x).dtorE.virt);const cells=H.v.a.slice();if(e.arr)cells.reverse();
          this.dpos=e.p;for(const c of cells){const id=vd?c.v.o:st;if(CLS.get(id).hasDtor)yield* this.destroyG(c,id)}}
        this.del(v,e);return{t:"void"}}
      case "bin":{if(e.ovl)return yield* this.opG(e);
        if(e.io==="out"){yield* this.evG(e.a);this.put(yield* this.evG(e.b));return{t:"ostream"}}
        if(e.io==="in"){yield* this.evG(e.a);while(this.needTok())yield NEED;this.read(e.b);return{t:"istream"}}
        const tr=x=>this.truth(x);
        if(e.op==="&&"){if(!tr(yield* this.evG(e.a)))return{t:"bool",v:0};return{t:"bool",v:tr(yield* this.evG(e.b))?1:0}}
        if(e.op==="||"){if(tr(yield* this.evG(e.a)))return{t:"bool",v:1};return{t:"bool",v:tr(yield* this.evG(e.b))?1:0}}
        const A=yield* this.evG(e.a),B=yield* this.evG(e.b);return this.arith(e.op,A,B)}
      case "un":if(e.ovl)return yield* this.opG(e);return this.unop(e.op,yield* this.evG(e.a));
      case "idx":{if(e.ovl)return yield* this.opG(e);const iv=yield* this.evG(e.i);const C=this.LV(e,iv);this.rd.add(C);return{t:C.t,v:C.v}}
      case "ilist":return yield* this.listG(e);
      case "ctor":{if(e.list)return{t:e.t,v:this.fromList(e.t,(yield* this.listG(e.list)).items)};const items=[];for(const a of e.args)items.push(a.k==="ilist"?yield* this.listG(a):yield* this.evG(a));return{t:e.t,v:this.mkVal({},{t:e.t},{t:"args",items},true).v}}
      case "pre":case "post":if(e.a.cx){const x=yield* this.evG(e.a);return this.incr(e,x.cell)}return this.ev(e);
      case "cond":{const c=yield* this.evG(e.c);const yes=this.truth(c);return this.condRes(e,yield* this.evG(yes?e.a:e.b))}
      case "new":if(isCls(e.t)){const n=e.n?yield* this.evG(e.n):null;const r=this.newE(e,n,null);const H=r.v.h;
          for(const c of H.v.a){c.v=this.mkObj(e.t,!!(e.init&&e.init.s));this.adopt(c,H);yield* this.constructG(c,e.ctorE||null,e.n?[]:e.init.args,e.n?false:e.init.s==="{}",e.t)}
          return r}
        {const n=e.n?yield* this.evG(e.n):null;const init=e.init&&e.init.e?yield* this.evG(e.init.e):e.init&&e.init.list?yield* this.listG(e.init.list):null;return this.newE(e,n,init)}
      case "as":{if(e.ovl)return yield* this.opG(e);
        if(e.cE||(e.cv&&e.cT)){const C={t:e.cT,v:this.mkObj(e.cT,true),init:true};yield* this.constructG(C,e.cE,[e.b],false,e.cT);const V=this.LV(e.a);this.assignObj(V,{v:C.v});return{t:V.t,v:V.v,cell:V}}
        const r=yield* this.evG(e.b);let iv;if(e.a.k==="idx"&&e.a.i.cx)iv=yield* this.evG(e.a.i);
        if((e.a.k==="call"||e.a.k==="mc")&&e.a.fn&&e.a.fn.rref){const x=yield* this.evG(e.a);return this.assign(e,r,iv,x.cell)}
        if(e.a.k==="mem"&&e.a.o.cx){const O=yield* this.evG(e.a.o);return this.assign(e,r,iv,this.memCell(e.a,O))}
        if(e.a.k==="idx"&&e.a.ovl){const x=yield* this.evG(e.a);return this.assign(e,r,iv,x.cell)}
        return this.assign(e,r,iv)}
      case "cast":{const a=yield* this.evG(e.a);return{t:e.ty.t,v:this.conv(a,e.ty.t)}}
      case "call":{
        if(e.fn){const F=e.fn,args=yield* this.argsG(F,e.args);return yield{call:F,args}}
        if(e.f==="getline"){yield* this.evG(e.args[0]);while(this.needLine())yield NEED;this.getline(e.args[1]);return{t:"istream"}}
        const vals=[];for(const a of e.args)vals.push(a.k==="ilist"?yield* this.listG(a):a.k==="functor"||(a.k==="name"&&!a.r)?null:yield* this.evG(a));
        if(LIB_RT.has(e.f))return this.lib(e,vals);
        return this.builtin(e.f,vals)}
      case "mc":{
        if(e.fn){let C;
          if(e.arrow){const P=yield* this.evG(e.o);C=this.ptrCell(P.v,e,`${e.o.k==="this"?"this":this.pname(e.o)}->${e.m}()`)}
          else if(e.o.cx){const R=yield* this.evG(e.o);C=R.cell||R.tc||{t:R.t,v:R.v,init:true}}
          else C=this.baseOf(e.o);
          const F=e.vcall?this.virt(e.fn,C):e.fn;const A=yield* this.argsG(F,e.args);return yield{call:F,args:A,self:C}}
        if(e.m==="ignore"){const a=[];for(const x of e.args)a.push(yield* this.evG(x));yield* this.ignoreG(a[0]?a[0].v:1,a[1]?a[1].v:-1);return{t:"istream"}}
        if(["fail","good","eof","clear"].includes(e.m)&&e.o.k==="name"&&e.o.r==="std")return this.member(e,null);
        const args=[];for(const a of e.args)args.push(a.k==="ilist"?(a.cT?yield* this.tmpObjG(a):yield* this.listG(a)):yield* this.evG(a));return this.memberCall(e,args)}
      default:return this.ev(e)}}
  needTok(){return this.inter&&!this.eofIn&&!this.failed&&/^\s*$/.test(this.buf.slice(this.pos))}
  needLine(){return this.inter&&!this.eofIn&&!this.failed&&this.pos>=this.buf.length}
  *ignoreG(cnt,delim){if(this.failed)return;const start=this.pos;let k=0;
    while(k<cnt){if(this.pos>=this.buf.length){if(this.inter&&!this.eofIn){yield NEED;continue}this.eof=true;break}
      const c=this.buf[this.pos++];k++;if(delim>=0&&c.charCodeAt(0)===delim)break}
    this.reads.push({n:"(ignore)",a:start,b:this.pos,ok:true,ign:true})}
  bin(e){
    if(e.io==="out"){this.ev(e.a);this.put(this.ev(e.b));return{t:"ostream"}}
    if(e.io==="in"){this.ev(e.a);this.read(e.b);return{t:"istream"}}
    const tr=x=>this.truth(x);
    if(e.op==="&&"){if(!tr(this.ev(e.a)))return{t:"bool",v:0};return{t:"bool",v:tr(this.ev(e.b))?1:0}}
    if(e.op==="||"){if(tr(this.ev(e.a)))return{t:"bool",v:1};return{t:"bool",v:tr(this.ev(e.b))?1:0}}
    const A=this.ev(e.a),B=this.ev(e.b);
    return this.arith(e.op,A,B);
  }
  unop(op,a){if(op==="!")return{t:"bool",v:this.truth(a)?0:1};const t=promo(a.t,a.t);
    if(t==="size_t"){const x=toBig(a.v);return{t,v:BigInt.asUintN(64,op==="~"?~x:op==="-"?-x:x)}}
    if(t==="long long"){const x=toBig(a.v);return{t,v:BigInt.asIntN(64,op==="~"?~x:op==="-"?-x:x)}}
    if(op==="~")return{t,v:t==="long long"?Number(BigInt.asIntN(64,~BigInt(a.v))):wrapTo(t,~a.v)};
    return{t,v:isFlT(t)?(op==="-"?-a.v:a.v):wrapTo(t,op==="-"?-a.v:a.v)}}
  itOf(X){return isIter(X.t)||isPtr(X.t)?X.v:{h:X.cell||{t:X.t,v:X.v},k:0}}
  arith(op,A,B){
    if(isPtr(A.t)||isPtr(B.t)||A.t==="nullptr_t"||B.t==="nullptr_t"||((isArr(A.t)||isArr(B.t))&&!isIter(A.t)&&!isIter(B.t)))return this.parith(op,A,B);
    if(isIter(A.t)||isArr(A.t)||isIter(B.t)||isArr(B.t)){
      if(op==="+"||op==="-"){if(INTG.has(B.t)){const I=this.itOf(A),d=toNum(B.v);return{t:"iter<"+elemT(A.t)+">",v:{h:I.h,k:op==="+"?I.k+d:I.k-d}}}
        if(INTG.has(A.t)){const I=this.itOf(B);return{t:"iter<"+elemT(B.t)+">",v:{h:I.h,k:I.k+toNum(A.v)}}}
        return{t:"long long",v:BigInt(this.itOf(A).k-this.itOf(B).k)}}
      const a=this.itOf(A).k,b=this.itOf(B).k;return{t:"bool",v:({"==":a===b,"!=":a!==b,"<":a<b,"<=":a<=b,">":a>b,">=":a>=b})[op]?1:0}}
    if(isVec(A.t)){const c=cmpV(A.v,B.v);this.cost+=Math.min(A.v.a.length,B.v.a.length);return{t:"bool",v:({"==":c===0,"!=":c!==0,"<":c<0,"<=":c<=0,">":c>0,">=":c>=0})[op]?1:0}}
    const str=x=>x.t==="char"?String.fromCharCode(((x.v%256)+256)%256):x.v;
    if(["string","cstr"].includes(A.t)||["string","cstr"].includes(B.t)){
      if(op==="+")return{t:"string",v:str(A)+str(B)};
      const a=str(A),b=str(B);return{t:"bool",v:({"==":a===b,"!=":a!==b,"<":a<b,"<=":a<=b,">":a>b,">=":a>=b})[op]?1:0}}
    if(op==="<<"||op===">>"){const t=promo(A.t,A.t),W=t==="long long"||t==="size_t"?64:32,cnt=((toNum(B.v)%W)+W)%W;
      if(t==="size_t"){const x=toBig(A.v);return{t,v:BigInt.asUintN(64,op==="<<"?x<<BigInt(cnt):x>>BigInt(cnt))}}
      if(t==="long long"){const x=toBig(A.v);return{t,v:BigInt.asIntN(64,op==="<<"?x<<BigInt(cnt):x>>BigInt(cnt))}}
      if(t==="unsigned")return{t,v:op==="<<"?wrapTo(t,A.v*2**cnt):(A.v>>>cnt)};
      return{t,v:op==="<<"?wrapTo(t,A.v*2**cnt):Math.floor(A.v/2**cnt)}}
    const t=promo(A.t,B.t);let a=A.v,b=B.v;
    if(t==="long long"||t==="size_t"){const W=t==="size_t"?x=>BigInt.asUintN(64,x):x=>BigInt.asIntN(64,x);a=W(toBig(a));b=W(toBig(b));
      if(CMP.includes(op))return{t:"bool",v:({"==":a===b,"!=":a!==b,"<":a<b,"<=":a<=b,">":a>b,">=":a>=b})[op]?1:0};
      if((op==="/"||op==="%")&&b===0n)throw new RunErr("Floating point exception (core dumped)","Chia số nguyên cho 0: hệ điều hành dừng chương trình ngay lập tức.",136);
      const v=op==="+"?a+b:op==="-"?a-b:op==="*"?a*b:op==="/"?a/b:op==="%"?a%b:op==="&"?a&b:op==="|"?a|b:a^b;
      return{t,v:W(v)}}
    a=toNum(a);b=toNum(b);
    if(t==="unsigned"){a=wrapTo("unsigned",a);b=wrapTo("unsigned",b)}
    if(CMP.includes(op))return{t:"bool",v:({"==":a===b,"!=":a!==b,"<":a<b,"<=":a<=b,">":a>b,">=":a>=b})[op]?1:0};
    if(isFlT(t)){let v=op==="+"?a+b:op==="-"?a-b:op==="*"?a*b:a/b;if(t==="float")v=Math.fround(v);return{t,v}}
    if(op==="&"||op==="|"||op==="^"){let v;if(t==="long long")v=Number(BigInt.asIntN(64,op==="&"?BigInt(a)&BigInt(b):op==="|"?BigInt(a)|BigInt(b):BigInt(a)^BigInt(b)));else{v=op==="&"?a&b:op==="|"?a|b:a^b}return{t,v:wrapTo(t,v)}}
    if((op==="/"||op==="%")&&b===0)throw new RunErr("Floating point exception (core dumped)","Chia số nguyên cho 0: hệ điều hành dừng chương trình ngay lập tức.",136);
    let v;
    if(op==="*"){if(t==="int")v=Math.imul(a,b);else if(t==="unsigned")v=Math.imul(a,b)>>>0;else v=Number(BigInt.asIntN(64,BigInt(a)*BigInt(b)))}
    else if(op==="/")v=Math.trunc(a/b);else if(op==="%")v=a%b;else v=op==="+"?a+b:a-b;
    if(t==="long long"&&(op==="+"||op==="-")&&Math.abs(v)>Number.MAX_SAFE_INTEGER)v=Number(BigInt.asIntN(64,op==="+"?BigInt(a)+BigInt(b):BigInt(a)-BigInt(b)));
    return{t,v:wrapTo(t,v)};
  }
  /* ---------- con trỏ và vùng nhớ động (Chương 7) ---------- */
  badPtr(k){const g=[0x7ffd5c4e8a30,0x55d0c3a04f10,0x400786,0x7ffd5c4e8b58,0x1][(k||this.order.length)%5];return{h:null,k:0,ad:g,bad:true}}
  wrapOf(C){return C.__w||(C.__w={t:C.t+"[1]",v:{a:[C]},one:C})}
  vecBase(V){const o=V.v;if(!o.base){o.base=this.haddr;this.haddr+=Math.max(32,Math.ceil((Math.max(o.a.length,4)*sizeOfT(elemT(V.t))+8)/16)*16)}return o.base}
  cAddr(c){if(c.addr!=null&&c.addr!==0)return c.addr;if(c.par&&c.off!=null){const P=c.par;return(isVec(P.t)?this.vecBase(P):this.cAddr(P))+c.off}const R=c.own;if(!R||R===c)return c.addr||0;const base=isVec(R.t)?this.vecBase(R):(this.cAddr(R)||0),off=this.offIn(R,c);return off==null?base:base+off}
  offIn(R,c){const es=sizeOfT(elemT(R.t)),a=R.v.a;for(let k=0;k<a.length;k++){if(a[k]===c)return k*es;if(isArr(a[k].t)){const o=this.offIn(a[k],c);if(o!=null)return k*es+o}}return null}
  hAddr(h){if(h.heap)return h.addr;if(h.one)return this.cAddr(h.one);if(isVec(h.t))return this.vecBase(h);return this.cAddr(h)}
  ptrAddr(v){if(!v||!v.h)return v&&v.ad||0;const h=v.h,es=h.one?sizeOfT(h.one.t):sizeOfT(elemT(h.t));return this.hAddr(h)+v.k*es+(v.sub||0)}
  ptrTxt(v){return v&&(v.h||v.ad)?"0x"+this.ptrAddr(v).toString(16):"0"}
  pname(e){return e&&e.k==="name"?e.n:e&&e.k==="idx"&&e.a.k==="name"?`${e.a.n}[…]`:"con trỏ"}
  /* tên biến đang chứa ô C (để hiện “p → x”) */
  nameOf(C){const find=(vars,order)=>{for(const n of order){const V=vars.get(n);if(V===C)return n}return null};
    let n=find(this.vars,this.order);if(n)return n;for(let k=this.calls.length-1;k>=0;k--){n=find(this.calls[k].vars,this.calls[k].order);if(n)return n+" của "+this.calls[k].fn.name}
    return find(this.globals,this.gorder)}
  ptrLabel(v){if(!v||!v.h)return v&&v.bad?"(chưa khởi tạo)":"nullptr";const H=v.h;
    if(H.heap)return `heap #${H.heap.id}${H.heap.arr||v.k?`[${v.k}]`:""}${H.heap.freed?" (đã delete)":""}`;
    if(H.one)return (this.nameOf(H.one)||"biến")+(H.one.dead?" (đã hết phạm vi)":"")+(v.k?` + ${v.k}`:"");
    return `${this.nameOf(H)||"mảng"}[${v.k}]${H.dead?" (đã hết phạm vi)":""}`}
  ptrCell(v,e,what){
    if(!v.h){if(v.bad)throw new RunErr("Segmentation fault (core dumped)",`${what}: con trỏ chưa được khởi tạo nên đang chứa một địa chỉ rác (0x${(v.ad||0).toString(16)}). Dùng * với nó là đọc hoặc ghi vào một chỗ bất kỳ trong bộ nhớ: thường hệ điều hành dừng chương trình (Segmentation fault), có khi lại âm thầm ghi đè dữ liệu khác. Luôn khởi tạo con trỏ: int* p = nullptr; hoặc gán một địa chỉ hợp lệ trước khi dùng.`,139);
      throw new RunErr("Segmentation fault (core dumped)",`${what}: con trỏ đang là nullptr (không trỏ tới đâu) nên không có giá trị nào để đọc hay ghi. Hệ điều hành chặn truy cập địa chỉ 0 và dừng chương trình. Hãy kiểm tra if (p != nullptr) trước khi dùng *p.`,139)}
    const H=v.h;
    if(H.heap&&H.heap.freed)throw new RunErr("Lỗi chạy: dùng vùng nhớ đã delete (use-after-free)",`${what}: vùng nhớ heap #${H.heap.id} đã được giải phóng bằng delete ở dòng ${H.heap.fl}. Con trỏ vẫn giữ địa chỉ cũ (con trỏ treo, dangling pointer) nhưng vùng đó không còn thuộc về chương trình. Trên máy thật, đọc hoặc ghi qua nó là hành vi không xác định: có thể ra giá trị cũ, giá trị rác, ghi đè dữ liệu khác hoặc dừng chương trình. Trình mô phỏng dừng ngay để bạn thấy lỗi. Sau delete hãy gán p = nullptr;`,139);
    const tgt=H.one||H;if(tgt.dead)throw new RunErr("Lỗi chạy: dùng con trỏ tới biến đã hết phạm vi (dangling pointer)",`${what}: con trỏ trỏ tới một biến cục bộ đã bị hủy (hàm chứa nó đã kết thúc, hoặc khối { } chứa nó đã đóng). Vùng stack đó đã được dùng lại cho việc khác. Trên máy thật đây là hành vi không xác định: có khi vẫn in ra giá trị cũ, có khi ra rác. Đừng giữ địa chỉ của biến cục bộ sau khi nó hết phạm vi.`,139);
    const A=H.v.a;if(!(v.k>=0&&v.k<A.length)){const kind=H.heap?`vùng nhớ heap #${H.heap.id} (${A.length} phần tử)`:H.one?`biến ${this.nameOf(H.one)||""} (chỉ có 1 ô)`:`mảng ${this.nameOf(H)||""} (${A.length} phần tử)`;
      throw new RunErr(`Lỗi chạy: con trỏ đi ra ngoài ${H.heap?"vùng nhớ đã cấp":H.one?"biến":"mảng"}`,`${what}: con trỏ đang ở vị trí ${v.k} tính từ đầu ${kind}, tức là nằm ngoài vùng hợp lệ. C++ không kiểm tra điều này: trên máy thật chương trình sẽ đọc/ghi vào ô nhớ của biến khác hoặc dừng với “Segmentation fault”. Trình mô phỏng dừng ngay để bạn thấy lỗi.`,139)}
    return A[v.k]}
  addrOf(e){const a=e.a;
    if(a.k==="idx"){const B=this.baseOf(a.a),i=toNum(this.ev(a.i).v);
      if(isPtr(B.t)){const v=B.v;return{t:e.t,v:{h:v.h,k:v.k+i,ad:v.ad,bad:v.bad}}}
      const n=B.v.a.length;if(!(i>=0&&i<=n))throw this.oob(a,B,i,n);return{t:e.t,v:{h:B,k:i}}}
    if(a.k==="deref"){const r=this.ev(a.a);if(isPtr(r.t))return{t:e.t,v:r.v}}
    const C=this.LV(a);return{t:e.t,v:{h:this.wrapOf(C),k:0}}}
  /* cộng/trừ/so sánh con trỏ: cùng một mảng thì theo chỉ số, khác thì theo địa chỉ */
  parith(op,A,B){const pv=X=>isPtr(X.t)||isIter(X.t)?X.v:X.t==="nullptr_t"?{h:null,k:0}:isArr(X.t)?{h:X.cell||{t:X.t,v:X.v},k:0}:null;
    const P=X=>isPtr(X.t)||isArr(X.t),ty=X=>isPtr(X.t)?X.t:elemT(X.t)+"*";
    if((op==="+"||op==="-")&&P(A)&&INTG.has(B.t)){const v=pv(A),d=toNum(B.v)*(op==="+"?1:-1);return{t:ty(A),v:{h:v.h,k:v.k+d,ad:v.ad&&v.ad+d*sizeOfT(elemT(ty(A))),bad:v.bad}}}
    if(op==="+"&&INTG.has(A.t)&&P(B)){const v=pv(B),d=toNum(A.v);return{t:ty(B),v:{h:v.h,k:v.k+d,ad:v.ad&&v.ad+d*sizeOfT(elemT(ty(B))),bad:v.bad}}}
    const a=pv(A),b=pv(B);
    if(op==="-"){const es=sizeOfT(elemT(ty(A)));if(a.h&&a.h===b.h)return{t:"long long",v:BigInt(a.k-b.k)};return{t:"long long",v:BigInt(Math.round((this.ptrAddr(a)-this.ptrAddr(b))/es))}}
    const x=a&&a.h&&b&&b.h&&a.h===b.h?a.k:this.ptrAddr(a),y=a&&a.h&&b&&b.h&&a.h===b.h?b.k:this.ptrAddr(b);
    return{t:"bool",v:({"==":x===y,"!=":x!==y,"<":x<y,"<=":x<=y,">":x>y,">=":x>=y})[op]?1:0}}
  newE(e,nv,init){const T=e.t,arr=!!e.n;let N=1;
    if(arr){N=toNum(nv.v);if(N<0)throw new RunErr("terminate called after throwing an instance of 'std::bad_array_new_length'\n  what():  std::bad_array_new_length\nAborted (core dumped)",`new ${tn(T)}[${N}]: số phần tử âm nên không cấp phát được; chương trình dừng.`,134);
      if(N>20000000)throw new RunErr("terminate called after throwing an instance of 'std::bad_alloc'\n  what():  std::bad_alloc\nAborted (core dumped)",`Xin ${N} phần tử vượt giới hạn của trình mô phỏng. Trên máy thật, khi không còn đủ bộ nhớ, new ném ngoại lệ bad_alloc và chương trình dừng.`,134)}
    if(this.heap.length>=100000)throw new RunErr("terminate called after throwing an instance of 'std::bad_alloc'\n  what():  std::bad_alloc\nAborted (core dumped)","Chương trình gọi new hơn 100 000 lần mà không trả lại (thường là new trong vòng lặp mà quên delete). Trình mô phỏng dừng để tránh hết bộ nhớ.",134);
    const items=init&&init.t==="ilist"?init.items:null;
    if(items&&arr&&items.length>N)throw new RunErr("terminate called after throwing an instance of 'std::bad_array_new_length'\n  what():  std::bad_array_new_length\nAborted (core dumped)",`Danh sách khởi tạo có ${items.length} giá trị nhưng chỉ xin ${N} phần tử.`,134);
    const zero=!!(e.init&&((e.init.s==="()"&&!e.init.e)||e.init.s==="{}"));
    const es=sizeOfT(T),addr=this.haddr;this.haddr+=Math.max(32,Math.ceil((N*es+8)/16)*16);
    const H={t:T+"["+N+"]",v:{a:[]},addr,heap:{id:++this.hid,n:N,arr,line:this.line(e.p),freed:false}};
    for(let k=0;k<N;k++){let c;
      if(items&&k<items.length)c={t:T,v:this.conv(items[k],T),init:true};
      else if(!arr&&init&&!items)c={t:T,v:this.conv(init,T),init:true};
      else if(zero)c={t:T,v:this.zero(T),init:true};
      else c={t:T,v:this.garb(T,k+3),init:false};
      c.addr=addr+k*es;c.own=H;H.v.a.push(c)}
    this.cost+=N>64?Math.ceil(N/64):0;this.heap.push(H);this.wrRoot.add(H);
    return{t:T+"*",v:{h:H,k:0}}}
  del(v,e){const what=`${e.arr?"delete[]":"delete"} ${this.pname(e.a)}`;
    if(!v.h&&!v.bad)return;   // delete nullptr: không làm gì
    const H=v.h;
    if(!H||!H.heap)throw new RunErr("free(): invalid pointer\nAborted (core dumped)",`${what}: delete chỉ dùng cho vùng nhớ cấp bằng new. Con trỏ này ${v.bad?"chưa được khởi tạo (chứa địa chỉ rác)":`trỏ tới ${this.ptrLabel(v)}, một biến bình thường (trên stack hoặc vùng toàn cục) tự được giải phóng`}. Thư viện quản lý bộ nhớ phát hiện địa chỉ lạ và dừng chương trình (Aborted).`,134);
    if(H.heap.freed)throw new RunErr("free(): double free detected in tcache 2\nAborted (core dumped)",`${what}: vùng nhớ heap #${H.heap.id} đã được delete ở dòng ${H.heap.fl}. Giải phóng hai lần (double free) làm hỏng cấu trúc quản lý heap; thư viện phát hiện và dừng chương trình. Sau delete hãy gán p = nullptr; vì delete nullptr thì không làm gì cả.`,134);
    if(v.k!==0)throw new RunErr("free(): invalid pointer\nAborted (core dumped)",`${what}: con trỏ đang trỏ vào giữa vùng nhớ (phần tử thứ ${v.k}), không phải địa chỉ đầu do new trả về. delete phải nhận đúng địa chỉ mà new đã trả về.`,134);
    if(H.heap.arr!==!!e.arr){const nk=`${H.heap.arr?"new[]":"new"}:${H.heap.line}:${this.line(e.p)}`;if(!this.memNotes.includes(nk))this.memNotes.push(nk)}
    H.heap.freed=true;H.heap.fl=this.line(e.p);this.wrRoot.add(H);this.cost++}
  /* vùng nhớ cấp bằng new mà tới cuối chương trình chưa delete */
  leaks(){return this.heap.filter(H=>!H.heap.freed)}
  put(r){
    if(r.t==="manip"){const m=r.m,F=this.fmt;
      if(m==="endl")this.write("\n");else if(m==="fixed")F.fixed=true;else if(m==="scientific")F.fixed=false;
      else if(m==="boolalpha")F.ba=true;else if(m==="noboolalpha")F.ba=false;else if(m==="prec")F.prec=r.n;else if(m==="w")F.w=r.n;
      else if(m==="left")F.left=true;else if(m==="right")F.left=false;return}
    let s=this.fmtv(r);
    const bl=u8(s).length;if(this.fmt.w>bl){const pad=" ".repeat(this.fmt.w-bl);s=this.fmt.left?s+pad:pad+s}
    this.fmt.w=0;this.write(s);
  }
  fmtv(r){const t=r.t;
    if(isPtr(t))return this.ptrTxt(r.v);
    if(isArr(t))return "0x"+(r.cell?this.cAddr(r.cell):0).toString(16);   // cout << a: in địa chỉ phần tử đầu
    if(t==="cstr"||t==="string")return r.v;
    if(t==="char")return String.fromCharCode(((r.v%256)+256)%256);
    if(t==="bool")return this.fmt.ba?(r.v?"true":"false"):String(r.v);
    if(isFlT(t))return this.fmt.fixed?ffmt(r.v,this.fmt.prec):gfmt(r.v,this.fmt.prec);
    return llStr(r.v)}
  needOrEof(){this.eof=true}
  read(x){const V=this.LV(x),n=x.k==="name"?x.n:this.lvTxt(x);if(this.failed)return;const t=V.t;this.wrote(V);
    while(this.pos<this.buf.length&&/\s/.test(this.buf[this.pos]))this.pos++;
    if(this.pos>=this.buf.length){this.needOrEof();this.failed=true;if(isNumT(t)){V.v=0;V.init=true}this.reads.push({n,a:this.pos,b:this.pos,ok:false});return}
    const rest=this.buf.slice(this.pos),start=this.pos;let m;
    const fail=()=>{V.v=0;V.init=true;this.failed=true;this.reads.push({n,a:start,b:start,ok:false})};
    if(t==="string"){m=/^\S+/.exec(rest);V.v=m[0]}
    else if(t==="char"){const ch=rest[0];const b=u8(ch);V.v=wrapTo("char",b[0]);m=[ch];if(b.length>1&&!this.notes.includes("utf8"))this.notes.push("utf8")}
    else if(isFlT(t)){m=/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(rest);if(!m)return fail();V.v=wrapTo(t,parseFloat(m[0]))}
    else if(t==="size_t"){m=/^[+-]?\d+/.exec(rest);if(!m)return fail();let v=BigInt(m[0]);if(v>18446744073709551615n){V.v=18446744073709551615n;V.init=true;this.failed=true;this.pos+=m[0].length;this.reads.push({n,a:start,b:this.pos,ok:false});return}V.v=BigInt.asUintN(64,v)}
    else if(t==="long long"){m=/^[+-]?\d+/.exec(rest);if(!m)return fail();const v=BigInt(m[0]);
      if(v>I64MAX||v<I64MIN){V.v=v>I64MAX?I64MAX:I64MIN;V.init=true;this.failed=true;this.pos+=m[0].length;this.reads.push({n,a:start,b:this.pos,ok:false});return}V.v=v}
    else{m=/^[+-]?\d+/.exec(rest);if(!m)return fail();const v=Number(m[0]);
      if(t==="unsigned"&&v<0&&v>=-4294967295)V.v=wrapTo("unsigned",v);
      else{const R=RANGE[t];if(v<R[0]||v>R[1]){V.v=t==="bool"?1:(v<R[0]?R[0]:R[1]);V.init=true;this.failed=true;this.pos+=m[0].length;this.reads.push({n,a:start,b:this.pos,ok:false});return}V.v=wrapTo(t,v)}}
    this.pos+=m[0].length;V.init=true;this.reads.push({n,a:start,b:this.pos,ok:true})}
  getline(x){const V=this.LV(x),n=x.k==="name"?x.n:this.lvTxt(x);if(this.failed)return;this.wrote(V);
    if(this.pos>=this.buf.length){this.needOrEof();this.failed=true;this.reads.push({n,a:this.pos,b:this.pos,ok:false});return}
    const j=this.buf.indexOf("\n",this.pos),start=this.pos;
    if(j<0){V.v=this.buf.slice(this.pos);this.pos=this.buf.length;this.eof=true}else{V.v=this.buf.slice(this.pos,j);this.pos=j+1}
    V.init=true;this.reads.push({n,a:start,b:this.pos,ok:true,line:true})}
  ignore(cnt,delim){if(this.failed)return;const start=this.pos;
    if(this.pos>=this.buf.length){this.needOrEof();return}
    let k=0;while(k<cnt){if(this.pos>=this.buf.length){if(this.inter&&!this.eofIn)throw new NeedIn();this.eof=true;break}const c=this.buf[this.pos++];k++;if(delim>=0&&c.charCodeAt(0)===delim)break}
    this.reads.push({n:"(ignore)",a:start,b:this.pos,ok:true,ign:true})}
}
function fmtE2(src,err,warn){
  if(err.kind==="link")return `<span class="e">/usr/bin/ld: (.text+0x1b): ${esc(err.message)}\ncollect2: error: ld returned 1 exit status</span>`;
  const p=Math.max(0,Math.min(err.p,src.length));const ln=src.slice(0,p).split("\n").length,col=p-src.lastIndexOf("\n",p-1);const lt=src.split("\n")[ln-1]||"";
  const cls=warn?"w":"e";
  return `main.cpp:${ln}:${col}: <span class="${cls}">${warn?"warning":"error"}: ${esc(err.message||err.msg)}</span>\n${String(ln).padStart(5)} | ${esc(lt)}\n      | ${" ".repeat(Math.max(0,col-1))}<span class="${cls}">^</span>`;
}
/* ================= NGÔN NGỮ =================
   C++ là mặc định. Python (41-py.js) và C# (42-cs.js) đăng ký thêm vào LANGS; khóa nào có nhiều ngôn ngữ
   thì 40-lang.js cho học viên chọn, lưu lựa chọn và đổi LANG_CUR. Mọi trình mô phỏng, bài tập dùng ngôn ngữ đang chọn. */
const LANGS={cpp:{id:"cpp",name:"C++",file:"main.cpp",
  compile:src=>compile2(src),Machine:M2,isErr:e=>e instanceof E2,
  head:(src,warns)=>{let lf=null;return '<span class="sys">$ g++ -Wall -Wextra main.cpp -o main</span>\n'+warns.map(w=>{let hd="";if(w.fn&&w.fn!==lf){hd=`main.cpp: In function '${esc(w.fn)}':\n`;lf=w.fn}return hd+fmtE2(src,w,true)+"\n"}).join("")+'<span class="sys">$ ./main</span>\n'},
  errHead:(src,err,uns)=>'<span class="sys">$ g++ -Wall -Wextra main.cpp -o main</span>\n'+(uns?fmtE2(src,{p:err.p,message:err.message},true).replace("warning:","chưa hỗ trợ:"):(err.kind==="link"||err.fn===""?"":`main.cpp: In function '${esc(err.fn||"int main()")}':\n`)+fmtE2(src,err)),
  errTitle:err=>err.kind==="link"?"Lỗi liên kết":"Lỗi biên dịch",unsupNote:"Đây không phải lỗi C++: code có thể vẫn đúng với g++ trên máy thật.",
  inLabel:"Dữ liệu đầu vào cho cin",inHelp:"Gõ sẵn các giá trị chương trình sẽ đọc, cách nhau bằng dấu cách hoặc xuống dòng (ví dụ: <code>4 5</code>). Để trống thì khi chạy, chương trình sẽ hỏi bạn ở khung Kết quả.",
  bufTab:"Bộ đệm nhập",bufHead:"Bộ đệm nhập (cin)",bufEmpty:"Dữ liệu bạn gõ sẽ vào đây trước, rồi cin mới lấy ra.",noOut:"Chương trình không in gì ra màn hình (chưa có lệnh cout nào chạy).",okTitle:"Biên dịch và chạy thành công",noBuild:"không tạo được file chạy"}};
let LANG_CUR="cpp";
const curLang=()=>LANG_CUR;
const langOf=l=>LANGS[l]||LANGS.cpp;
/* ví dụ / bài tập theo ngôn ngữ: phần chung ở gốc (bản C++), bản khác ngôn ngữ ở p.py, p.cs */
function presetFor(p,l){if(!l||l==="cpp")return p;const x=p[l];if(!x)return null;return Object.assign({},p,x,{label:x.label||p.label,lang:l})}
function exF(e,k,l){l=l||LANG_CUR;if(l==="cpp")return e[k];const x=e[l];if(x&&x[k]!==undefined)return x[k];if(k==="need"||k==="needMsg"||k==="start")return k==="start"&&!x?e[k]:undefined;return e[k]}
/* ngôn ngữ thực sự dùng cho một bài tập: bài chưa có bản của ngôn ngữ đang chọn thì làm bằng C++ */
const exLang=e=>LANG_CUR==="cpp"||(e&&e[LANG_CUR]&&e[LANG_CUR].start)?LANG_CUR:"cpp";
function runTests(code,tests,lang){const L=langOf(lang||LANG_CUR);
  let c;try{c=L.compile(code)}catch(err){if(L.isErr(err))return{err};throw err}
  return{res:tests.map(T=>{const M=new L.Machine(c.prog,code,{input:T.in,interactive:false});const r=M.runAll();
    const got=M.text(),norm=s=>s.replace(/[ \t]+$/gm,"").replace(/\s+$/,"");
    return{ok:!r||r.s!=="crash"?norm(got)===norm(T.out):false,got,crash:r&&r.s==="crash"?M.crash:null,T}})};
}

/* ================= TRÌNH MÔ PHỎNG 2 (Bài 3+) ================= */
const REDUCE=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep=ms=>new Promise(r=>setTimeout(r,REDUCE()?0:ms));
/* mảng / vector trong khung Bộ nhớ: mỗi phần tử một ô có chỉ số; ô vừa ghi tô cam, ô vừa đọc viền xanh */
function cellTxt(c){if(c.v&&c.v.f&&c.v.o)return objTxt(c.v,0);if(isPtr(c.t))return c.v&&(c.v.h||c.v.ad)?(c.v.h?"→":"?"):"null";if(!c.init)return "?";const t=c.t;if(t==="string")return JSON.stringify(c.v);if(t==="char"){const x=((c.v%256)+256)%256;return x>=32&&x<127?`'${String.fromCharCode(x)}'`:String(c.v)}
  if(t==="bool")return c.v?"true":"false";if(isFlT(t))return gfmt(c.v,6);if(isSeq(t))return `[${c.v.a.length}]`;return llStr(c.v)}
function showSeq(V,M){const a=V.v.a;
  const cls=c=>"ac"+(M&&M.wr&&M.wr.has(c)?" w":"")+(M&&M.rd&&M.rd.has(c)?" r":"")+(c.init?"":" g");
  const row=(arr,lim)=>arr.slice(0,lim).map((c,i)=>`<span class="${cls(c)}"${c.init?"":' title="chưa khởi tạo (giá trị rác)"'}><i>${i}</i><b>${esc(cellTxt(c))}</b></span>`).join("")+(arr.length>lim?`<span class="ac more"><i>…</i><b>+${arr.length-lim}</b></span>`:"");
  const head=isVec(V.t)?`<small class="ac-n">size = ${a.length}</small>`:"";
  if(a.length&&isSeq(a[0].t))return `${head}<span class="mx">${a.slice(0,16).map((r,i)=>`<span class="mx-r"><span class="mx-i">${i}</span><span class="ar">${r.v.a.length?row(r.v.a,24):'<span class="ac-e">(rỗng)</span>'}</span></span>`).join("")}${a.length>16?`<span class="mx-more">… còn ${a.length-16} hàng</span>`:""}</span>`;
  return `${head}<span class="ar">${a.length?row(a,48):'<span class="ac-e">(rỗng)</span>'}</span>`}
function showVal(V,M){
  if(isCls(V.t)&&V.v&&V.v.f){const parts=[];for(const k in V.v.f){const c=V.v.f[k];parts.push(`<span class="of"><i>${esc(c.fname)}</i> ${isCls(c.t)||isSeq(c.t)||isPtr(c.t)?showVal(c,M):!c.init?`<span class="garb">${esc(cellTxt(Object.assign({},c,{init:true})))}</span>`:esc(cellTxt(c))}</span>`)}return `<span class="ob">${parts.join("")||"<small>(không có thành viên)</small>"}</span>`}
  if(isSeq(V.t))return showSeq(V,M);
  if(isPtr(V.t)){const v=V.v;if(!M||!M.ptrLabel)return "";if(!V.init||(v&&v.bad))return `<span class="garb">0x${((v&&v.ad)||0).toString(16)} <small>(rác, chưa khởi tạo)</small></span>`;
    if(!v||!v.h)return `<span class="pnull">nullptr</span>`;
    const lb=M.ptrLabel(v),bad=/hết phạm vi|đã delete/.test(lb);return `<span class="pv${bad?" bad":""}">${esc(M.ptrTxt(v))}</span> <small class="pto">→ ${esc(lb)}</small>`}
  if(isIter(V.t))return `vị trí ${V.v.k}`;
  if(!V.init)return `<span class="garb">${esc(String(isFlT(V.t)?gfmt(V.v,6):V.v))} <small>(rác)</small></span>`;
  if(V.t==="string")return esc(JSON.stringify(V.v));
  if(V.t==="char"){const c=((V.v%256)+256)%256;const g=c>=32&&c<127?`'${String.fromCharCode(c)}'`:c===10?"'\\n'":c===32?"' '":"'?'";return `${esc(g)} <small>(${V.v})</small>`}
  if(V.t==="bool")return V.v?"true":"false";
  if(V.t==="float")return gfmt(V.v,9);
  if(V.t==="double")return gfmt(V.v,17);
  return llStr(V.v);
}
function bufCells(buf,reads,pos,opt={}){
  const own=new Array(buf.length).fill(null);
  reads.forEach((r,i)=>{for(let k=r.a;k<r.b;k++)own[k]={i,r}});
  const lastI=reads.length-1;
  let h="";const from=Math.max(0,buf.length-(opt.max||80));
  for(let k=from;k<buf.length;k++){const c=buf[k],o=own[k];
    const sym=c==="\n"?"↵":c===" "?"·":c==="\t"?"→":c;
    let cls="cell";
    if(c==="\n"||c===" "||c==="\t")cls+=" ws";
    if(o){cls+=o.r.ign?" ign":opt.colors?` v${o.r.color??(o.i%3)}`:(o.i===lastI?" last":" used")}
    else if(k<pos)cls+=" used skip";
    if(k===pos)cls+=" next";
    h+=`<span class="${cls}" title="${o?esc(o.r.n):""}">${esc(sym)}</span>`}
  if(pos>=buf.length)h+=`<span class="cell next end">${buf.length?"":"(trống)"}</span>`;
  return h;
}
function makeSim2(root,cfg){
  root.classList.add("sim","sim2");
  const multi=typeof LANG_LIST!=="undefined"&&LANG_LIST.length>1;
  root.innerHTML=`<div class="sim-bar"><div class="left"><span class="fname">main.cpp</span>
   ${cfg.presets.length>1?`<label class="pre-l"><span class="vh">Chọn ví dụ</span><select class="s-pre" id="${cfg.id}-pre">${cfg.presets.map((p,i)=>`<option value="${i}">${esc(p.label)}</option>`).join("")}</select></label>`:`<select class="s-pre" id="${cfg.id}-pre" hidden><option value="0">${esc(cfg.presets[0].label)}</option></select>`}
   <span class="s-chip idle" role="status" aria-live="polite">Chưa chạy</span></div>
   <div class="right"><button class="btn s-back" disabled title="Lùi lại một bước">← Lùi bước</button><button class="btn s-step">Từng bước</button><button class="btn pri s-run">▶ Chạy</button></div></div>
  <div class="s-note" role="note" hidden></div>
  <div class="s-viz" hidden></div>
  <div class="sim-body">
   <div class="lcol"><div class="editor"><div class="gutter"></div><div class="ed-wrap"><pre class="ed-hl" aria-hidden="true"></pre><textarea class="ed-ta" id="${cfg.id}-ed" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Mã nguồn C++"></textarea></div></div>
    <div class="sim-in"><label for="${cfg.id}-in"><b class="s-inl">Dữ liệu đầu vào cho cin</b><small class="s-inh">Gõ sẵn các giá trị chương trình sẽ đọc, cách nhau bằng dấu cách hoặc xuống dòng (ví dụ: <code>4 5</code>). Để trống thì khi chạy, chương trình sẽ hỏi bạn ở khung Kết quả.</small></label><textarea class="s-in" id="${cfg.id}-in" rows="2" spellcheck="false" placeholder="Không bắt buộc"></textarea></div></div>
   <div class="rp">
    <div class="rp-tabs" role="tablist" aria-label="Khung theo dõi"><button type="button" role="tab" id="${cfg.id}-tmem" aria-controls="${cfg.id}-pmem" data-tab="mem" aria-selected="false" tabindex="-1">Bộ nhớ</button><button type="button" role="tab" id="${cfg.id}-tbuf" aria-controls="${cfg.id}-pbuf" data-tab="buf" aria-selected="false" tabindex="-1" class="s-buft">Bộ đệm nhập</button><button type="button" role="tab" id="${cfg.id}-tout" aria-controls="${cfg.id}-pout" data-tab="out" aria-selected="true">Kết quả</button></div>
    <div class="rp-sec" data-sec="mem" id="${cfg.id}-pmem" role="tabpanel" aria-labelledby="${cfg.id}-tmem"><div class="pane-h"><span class="mem-h">Bộ nhớ</span><span class="s-line"></span></div>
    <div class="mem"></div></div>
    <div class="rp-sec" data-sec="buf" id="${cfg.id}-pbuf" role="tabpanel" aria-labelledby="${cfg.id}-tbuf"><div class="pane-h"><span class="s-bufh">Bộ đệm nhập (cin)</span><span class="s-cst"></span></div>
    <div class="bufw"><div class="cells"></div></div></div>
    <div class="rp-sec on" data-sec="out" id="${cfg.id}-pout" role="tabpanel" aria-labelledby="${cfg.id}-tout"><div class="pane-h"><span>Console</span><span class="s-exit"></span></div>
    <div class="con" tabindex="-1"></div>
    <div class="s-wait" hidden><label for="${cfg.id}-cin"><b>Chương trình đang chờ bạn nhập</b><small>Gõ giá trị rồi bấm Gửi (hoặc Enter). Nhiều giá trị thì cách nhau bằng dấu cách.</small></label>
     <div class="s-wrow"><input class="con-in" id="${cfg.id}-cin" autocomplete="off" spellcheck="false" autocapitalize="off" enterkeyhint="send"><button type="button" class="btn pri s-send">Gửi</button><button type="button" class="btn eof-btn" title="Báo cho chương trình là đã hết dữ liệu nhập (EOF)">Kết thúc nhập</button></div></div>
    <div class="explain" hidden></div></div>
   </div></div>
  <div class="sim-foot"><span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> trong khung code để chạy</span></div>
  <div class="s-float" hidden><button type="button" class="btn sf-back" aria-label="Lùi lại một bước">←</button><span class="sf-st" aria-live="off"></span><button type="button" class="btn pri sf-step">Bước tiếp →</button></div>
  <details class="sim-scope"><summary>Trình mô phỏng hỗ trợ những gì?</summary><div class="scope-cpp">
    <p><b>Đây là trình mô phỏng để học</b>, chạy một phần của C++ ngay trên trình duyệt, không phải trình biên dịch đầy đủ. Thông báo lỗi được viết theo g++ nhưng có thể khác đôi chút.</p>
    <p><b>Có:</b> int, unsigned, short, long long (64 bit chính xác), size_t, char, bool, float, double, std::string; const, constexpr, auto; cin, cout, getline, &lt;iomanip&gt;, &lt;cmath&gt;, &lt;climits&gt;, &lt;limits&gt;; mọi toán tử số học, so sánh, logic, bit; if, switch, while, do-while, for, for (x : danh_sách), break, continue; hàm, nguyên mẫu, tham chiếu &amp;, nạp chồng, tham số mặc định, đệ quy, biến toàn cục, biến static cục bộ; mảng một và hai chiều, vector (kể cả vector con trỏ), s[i] và các hàm của string; &lt;algorithm&gt;, &lt;numeric&gt;; con trỏ, new/delete, new[]/delete[]; struct/class: hàm tạo, hàm hủy, const, this, quyền truy cập, friend, nạp chồng toán tử; kế thừa (một hoặc nhiều lớp cha, kế thừa ảo), hàm ảo, override, lớp trừu tượng.</p>
    <p><b>Chưa có:</b> thành viên static của lớp, template tự viết, lambda, các thư viện STL khác (map, set, stack, queue…), printf/scanf, đọc ghi file; chạy đối tượng có hai bản sao cùng một lớp cha (kế thừa hình kim cương không dùng virtual: lỗi biên dịch vẫn được kiểm tra). Code dùng các phần này sẽ được báo là “chưa hỗ trợ”, không phải lỗi C++. Truy cập ngoài mảng, dùng con trỏ sai được báo lỗi ngay (máy thật thường không báo).</p>
    <p><b>Giới hạn:</b> 1 000 000 bước chạy, 3 000 tầng gọi hàm, 200 000 ký tự đầu ra.</p></div>${multi?LANG_LIST.filter(l=>l!=="cpp").map(l=>`<div class="scope-${l}" hidden>${langOf(l).scope||""}</div>`).join(""):""}</details>`;
  const $=s=>root.querySelector(s);
  const ed=$(".ed-ta"),hl=$(".ed-hl"),gut=$(".gutter"),con=$(".con"),mem=$(".mem"),cells=$(".cells"),exp=$(".explain"),inp=$(".s-in"),btnStep=$(".s-step"),btnRun=$(".s-run"),btnBack=$(".s-back");
  const S={M:null,tok:0,cur:0,bad:0,head:"",tail:"",waiting:null,ch:new Set(),mode:null,warns:[],k:0,feeds:[],pending:[],running:false,vz:null,pr:null,prOn:false,ask:null,fb:null,pick:null,picks:null,pi:0,speed:150};
  const vbox=$(".s-viz");
  const chip=$(".s-chip");
  /* chữ trên khung đổi theo ngôn ngữ đang chọn */
  /* ngôn ngữ của khung này: ngôn ngữ đang chọn, trừ khi ví dụ chưa có bản ngôn ngữ đó (khi ấy dùng C++), hoặc bị đặt cứng bằng forceLang */
  const effL=()=>{if(S.forceL)return S.forceL;const p=cfg.presets[S.pi];return LANG_CUR==="cpp"||cfg.keepOnLang||!p||presetFor(p,LANG_CUR)?LANG_CUR:"cpp"};
  const LG=()=>langOf(effL());
  function langText(){const L=LG();$(".fname").textContent=L.file;ed.setAttribute("aria-label","Mã nguồn "+L.name);$(".s-inl").textContent=L.inLabel;$(".s-inh").innerHTML=L.inHelp;
    $(".s-buft").textContent=L.bufTab;$(".s-bufh").textContent=L.bufHead;const lg=effL();
    root.querySelectorAll(".sim-scope > div").forEach(d=>d.hidden=!d.classList.contains("scope-"+lg));root.dataset.lang=lg;
    const sp=$(".s-pre");if(sp)[...sp.options].forEach((o,i)=>{const q=PR(i);if(q)o.textContent=q.label})}
  const PR=i=>presetFor(cfg.presets[i],LANG_CUR)||cfg.presets[i];
  function feedNow(eof){const w=S.waiting;if(!w)return;const ci=$(".con-in");S.waiting=null;
    if(eof){if(S.mode==="step")applyFeed({eof:true});else S.M.eofIn=true}else{if(S.mode==="step")applyFeed({v:ci.value});else S.M.feed(ci.value)}
    ci.value="";w()}
  $(".con-in").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();feedNow(false)}else if((e.key==="d"||e.key==="z")&&e.ctrlKey){e.preventDefault();feedNow(true)}});
  $(".s-send").onclick=()=>feedNow(false);$(".eof-btn").onclick=()=>feedNow(true);
  /* giải thích ví dụ: ví dụ này minh họa gì, cần quan sát gì */
  const lessonId=cfg.lesson||String(cfg.id||"").replace(/^s/,"l");
  function showNote(i){const p=PR(i)||{},miss=LANG_CUR!=="cpp"&&!cfg.keepOnLang&&cfg.presets[i]&&!presetFor(cfg.presets[i],LANG_CUR)?`Ví dụ này chưa có bản ${langOf(LANG_CUR).name}, đang hiện bản C++. `:"",n=p.note||((typeof PRESET_NOTES!=="undefined"?PRESET_NOTES:{})[lessonId]||{})[p.label]||"",el=$(".s-note");
    el.hidden=!n&&!miss;el.innerHTML=n||miss?`<b>${/^Lỗi|^Cảnh báo|^Bẫy/.test(p.label)?"Ví dụ này cho thấy":"Ví dụ này minh họa"}</b><p>${esc(miss+n)}</p>`:""}
  function setChip(k,t){chip.className="s-chip "+k;chip.textContent=t}
  /* điện thoại: tab Bộ nhớ / Bộ đệm nhập / Kết quả (máy tính hiện cả ba) */
  const tabs=[...root.querySelectorAll(".rp-tabs [role=tab]")];
  function tab(k,focus){tabs.forEach(b=>{const on=b.dataset.tab===k;b.setAttribute("aria-selected",on);b.tabIndex=on?0:-1;if(on&&focus)b.focus()});
    root.querySelectorAll(".rp-sec").forEach(x=>x.classList.toggle("on",x.dataset.sec===k))}
  tabs.forEach((b,i)=>{b.onclick=()=>tab(b.dataset.tab);b.onkeydown=e=>{const d=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;if(!d)return;e.preventDefault();tab(tabs[(i+d+tabs.length)%tabs.length].dataset.tab,true)}});
  function setRunning(on){S.running=on;btnRun.textContent=on?"■ Dừng":"▶ Chạy";btnRun.classList.toggle("stop",on);btnStep.disabled=on;if(on)btnBack.disabled=true}
  function applyFeed(f){if(f.eof)S.M.eofIn=true;else S.M.feed(f.v);S.feeds.push(f)}
  function paint(){const L=highlightLines(ed.value,effL());
    hl.innerHTML=L.map((s,i)=>`<span class="row${i+1===S.cur?" cur":""}${i+1===S.bad?" bad":""}">${s||" "}</span>`).join("");
    gut.innerHTML=L.map((_,i)=>`<div class="${i+1===S.bad?"err":""}${i+1===S.cur?" cur":""}">${i+1}</div>`).join("");sync()}
  function sync(){hl.scrollTop=ed.scrollTop;hl.scrollLeft=ed.scrollLeft;gut.scrollTop=ed.scrollTop}
  function keepCur(){if(!S.cur)return;const lh=parseFloat(getComputedStyle(ed).lineHeight)||22;const y=(S.cur-1)*lh;if(y<ed.scrollTop||y>ed.scrollTop+ed.clientHeight-lh*2){ed.scrollTop=Math.max(0,y-lh*3);sync()}}
  const seqRow=(V,cls)=>isSeq(V.t)?`<tr class="seqrow${cls}"><td colspan="5">${showSeq(V,S.M)}</td></tr>`:"";
  const seqTxt=V=>isSeq(V.t)?`<small class="seq-n">${isVec(V.t)?`${V.v.a.length} phần tử`:`mảng ${V.v.a.length} phần tử`} ↓</small>`:showVal(V,S.M);
  function memRows(F){return F.order.map(n=>{const V=F.vars.get(n),rf=F.refs&&F.refs.get(n),cls=F.top&&S.ch.has(n)?" chg":"";
      return `<tr class="${cls.trim()}${rf?" ref":""}"><td><b>${esc(n)}</b></td><td>${V.ce?"constexpr ":V.c?"const ":""}${esc(tn(V.t))}${rf?"&amp;":""}</td><td>${rf?"—":V.addr==null?"—":sizeOfT(V.t)}</td><td>${rf&&isSeq(V.t)?"":seqTxt(V)}${rf?`<small class="refto">↔ ${esc(rf)}</small>`:""}</td><td class="addr">${V.addr==null?"":"0x"+V.addr.toString(16)}</td></tr>${rf?"":seqRow(V,cls)}`}).join("")}
  function heapHTML(M){const H=M&&M.heap;if(!H||!H.length)return "";const L=H.slice(-16);
    return `<div class="fr heap"><div class="fr-h"><b>Vùng nhớ động (heap)</b><span>cấp bằng new · trả lại bằng delete${H.length>L.length?` · hiện ${L.length}/${H.length} khối mới nhất`:""}</span></div><table><tbody>${L.map(B=>{const b=B.heap,et=elemT(B.t),cls=(b.freed?"freed":"")+(M.wrRoot&&M.wrRoot.has(B)?" chg":"");
      return `<tr class="${cls.trim()}"><td><b>#${b.id}</b></td><td>${esc(tn(et))}${b.arr?`[${b.n}]`:""}</td><td>${b.n*sizeOfT(et)}</td><td>${b.freed?`<small class="hp-free">đã delete (dòng ${b.fl})</small>`:b.arr?`<small class="seq-n">${b.n} phần tử ↓</small>`:showVal(B.v.a[0],M)}</td><td class="addr">0x${B.addr.toString(16)}</td></tr>${b.arr&&!b.freed?`<tr class="seqrow"><td colspan="5">${showSeq(B,M)}</td></tr>`:""}`}).join("")}</tbody></table></div>`}
  function renderMem(){const M=S.M;
    if(M&&M.memHTML){root.querySelector(".mem-h").textContent=M.frames.length>1?"Bộ nhớ · ngăn xếp lời gọi":"Bộ nhớ";mem.innerHTML=M.memHTML(S.ch);return}
    const hp=M&&M.heap&&M.heap.length;
    root.querySelector(".mem-h").textContent=M&&(M.hasFns||M.gorder.length)?"Bộ nhớ · ngăn xếp lời gọi":hp?"Bộ nhớ · stack và heap":"Bộ nhớ";
    if(M&&(M.hasFns||M.gorder.length||hp)){const fr=M.view(),many=fr.length>1;
      mem.innerHTML=`<div class="stk">${fr.map(F=>`<div class="fr${F.top?" top":""}"><div class="fr-h"><b>${esc(F.title)}</b><span>${F.top?(many?"đang chạy · đỉnh stack":"đang chạy"):`đang chờ ở dòng ${F.line}`}</span></div>${F.order.length?`<table><tbody>${memRows(F)}</tbody></table>`:`<p class="mem-empty">Chưa có biến.</p>`}</div>`).join("")}${M.gorder.length?`<div class="fr glob"><div class="fr-h"><b>Biến toàn cục</b><span>vùng dữ liệu tĩnh</span></div><table><tbody>${memRows({order:M.gorder,vars:M.globals,refs:null,top:true})}</tbody></table></div>`:""}${heapHTML(M)}</div>`;return}
    if(!M||!M.order.length){mem.innerHTML=`<p class="mem-empty">${M?"Chưa có biến nào được khai báo.":"Các biến sẽ hiện ở đây khi chương trình chạy."}</p>`;return}
    mem.innerHTML=`<table><thead><tr><th>Tên</th><th>Kiểu</th><th>Byte</th><th>Giá trị</th><th class="addr">Địa chỉ</th></tr></thead><tbody>${memRows({order:M.order,vars:M.vars,refs:M.refs,top:true})}</tbody></table>`}
  function renderBuf(){const M=S.M;const st=root.querySelector(".s-cst");
    if(!M){cells.innerHTML=`<span class="mem-empty">${LG().bufEmpty}</span>`;st.textContent="";return}
    cells.innerHTML=bufCells(M.buf,M.reads,M.pos);
    st.innerHTML=M.bufStatus?M.bufStatus():M.failed?`<span class="bad-t">cin: lỗi${M.eof?" (hết dữ liệu)":" (fail)"}</span>`:`<span class="ok-t">cin: bình thường</span>`}
  function renderCon(){const M=S.M;
    let h=S.head;if(M)h+=M.out.map(x=>x.k==="i"?`<span class="in">${esc(x.s)}</span>`:esc(x.s)).join("");h+=S.tail;
    con.innerHTML=h||'<span class="con-empty">Chưa có kết quả. Bấm Chạy hoặc Từng bước để xem chương trình in ra gì.</span>';
    const wb=root.querySelector(".s-wait");
    if(S.waiting){if(wb.hidden){wb.hidden=false;const ci=wb.querySelector(".con-in");ci.value="";tab("out");ci.focus({preventScroll:true});
      if(window.matchMedia&&matchMedia("(max-width:900px)").matches&&wb.scrollIntoView)wb.scrollIntoView({block:"nearest",behavior:REDUCE()?"auto":"smooth"})}}
    else wb.hidden=true;
    con.scrollTop=con.scrollHeight}
  /* hình động: vẽ lại sau mỗi bước; chế độ "Đoán trước" hỏi học viên trước khi chạy dòng có câu hỏi */
  const predOk=()=>!!S.pr&&ed.value===PR(S.pi).code;
  function renderViz(){if(!S.vz){vbox.hidden=true;return}vbox.hidden=false;
    VIZ.draw(vbox,S.vz,S.M,{predict:predOk(),predOn:S.prOn,ask:S.ask&&S.ask.q,askKind:S.ask&&S.ask.kind,fb:S.fb,pick:S.pick});
    const pb=vbox.querySelector(".vz-pred");if(pb)pb.onclick=()=>{S.prOn=!S.prOn;S.ask=null;S.fb=S.prOn?{ok:true,t:"Đã bật Đoán trước. Bấm Từng bước: tới dòng có câu hỏi, chương trình dừng để bạn đoán rồi mới chạy."}:null;renderViz()};
    vbox.querySelectorAll("[data-k]").forEach(b=>{b.tabIndex=S.ask?0:-1;b.onclick=()=>{if(S.ask)answer(+b.dataset.k)}});
    if(!vbox.querySelector(".vz-speed")){const h=vbox.querySelector(".vz-h");if(h){h.insertAdjacentHTML("beforeend",`<label class="vz-speed"><span>Tốc độ</span><select aria-label="Tốc độ chạy hình động"><option value="420">Chậm</option><option value="150">Vừa</option><option value="40">Nhanh</option></select></label>`);const sel=h.querySelector(".vz-speed select");sel.value=String(S.speed);sel.onchange=()=>{S.speed=+sel.value}}}}
  async function answer(k){const rule=S.ask;if(!rule)return;
    if(rule.kind==="swap"){S.picks=(S.picks||[]).filter(x=>x!==k).concat(k);S.pick=k;if(S.picks.length<2){renderViz();return}}else S.pick=k;
    const picks=S.picks||[k];S.ask=null;await step0();
    let ok,t;const sp=(Array.isArray(S.vz)?S.vz:[S.vz]).find(x=>x.of)||{};
    if(rule.kind==="swap"){const V=VIZ.look(S.M,sp.of),A=V&&V.v&&V.v.a?V.v.a:[];const w=A.map((c,i)=>S.M&&S.M.wr.has(c)?i:-1).filter(i=>i>=0);
      ok=w.length===picks.length&&picks.every(x=>w.includes(x));t=ok?`Đúng! Hai ô ${w.join(" và ")} đổi chỗ.`:`Chưa đúng: ${w.length?`ô ${w.join(" và ")} vừa đổi chỗ`:"không có ô nào đổi chỗ"} (bạn chọn ${picks.join(" và ")}).`}
    else if(rule.val){const a=VIZ.val(S.M,rule.v),V=VIZ.look(S.M,sp.of),c=V&&V.v&&V.v.a?V.v.a[k]:null,pv=c?Number(c.v):null;ok=a===pv;t=ok?`Đúng! ${rule.v} = ${a}.`:`Chưa đúng: ${rule.v} = ${a} (bạn chọn ô có giá trị ${pv}).`}
    else{const a=VIZ.val(S.M,rule.v);ok=a===k;t=ok?`Đúng! ${rule.v} = ${a}.`:`Chưa đúng: ${rule.v} = ${a} (bạn chọn ${k}).`}
    if(rule.why)t+=" "+rule.why;S.fb={ok,t};S.pick=null;S.picks=null;renderViz()}
  /* điện thoại: khi đang chạy từng bước mà thanh nút đã cuộn khỏi màn hình, hiện thanh nút nổi ở đáy */
  const flo=$(".s-float");let barVis=true,simVis=false;
  if(window.IntersectionObserver){new IntersectionObserver(es=>{es.forEach(x=>{if(x.target===root)simVis=x.isIntersecting;else barVis=x.isIntersecting});paintFloat()}).observe(root);
    new IntersectionObserver(es=>{es.forEach(x=>{barVis=x.isIntersecting});paintFloat()}).observe($(".sim-bar"))}
  function paintFloat(){const on=S.mode==="step"&&S.M&&!S.M.done&&!S.running&&simVis&&!barVis&&matchMedia("(max-width:900px)").matches;flo.hidden=!on;
    if(on){flo.querySelector(".sf-st").textContent=S.waiting?"đang chờ nhập":S.cur?`dòng ${S.cur}`:"";flo.querySelector(".sf-back").disabled=btnBack.disabled}}
  flo.querySelector(".sf-step").onclick=()=>step();flo.querySelector(".sf-back").onclick=()=>back();
  function renderAll(){btnBack.disabled=S.running||!(S.M&&S.mode==="step"&&S.k>0);renderViz();paintFloat();
    if(S.M&&!S.M.done){if(S.waiting)setChip("wait","Đang chờ nhập dữ liệu");else if(S.running)setChip("run","Đang chạy…");else if(S.mode==="step"&&S.cur)setChip("step",`Dừng ở dòng ${S.cur}`)}paint();renderMem();renderBuf();renderCon();root.querySelector(".s-line").textContent=(S.cur&&S.M&&!S.M.done?`dòng ${S.cur}`:"")+(S.cond&&S.M&&!S.M.done?` · ${S.cond}`:"")+(S.M&&!S.M.done&&S.M.calls.length?` · sâu ${S.M.calls.length+1} tầng`:"");keepCur()}
  function reset(){S.tok++;setRunning(false);setChip("idle","Chưa chạy");S.M=null;S.cur=0;S.waiting=null;S.head="";S.tail="";S.ch=new Set();exp.hidden=true;btnStep.textContent="Từng bước";root.querySelector(".s-exit").textContent="";renderAll()}
  function load(i){const p=PR(i);S.pi=i;S.vz=p.viz||cfg.viz||null;S.pr=p.predict||null;S.ask=null;S.fb=null;showNote(i);ed.value=p.code;inp.value=p.input||"";ed.scrollTop=0;S.bad=0;reset();
    if(p.input)fitIn()}
  function fitIn(){inp.rows=Math.min(4,Math.max(1,inp.value.split("\n").length))}
  function compileStart(){
    S.tok++;S.waiting=null;S.bad=0;S.ch=new Set();S.cond="";S.fast=false;exp.hidden=true;root.querySelector(".s-exit").textContent="";
    const src=ed.value,L=LG();
    try{const c=L.compile(src);S.warns=c.warns;
      S.head=L.head(src,c.warns);S.tail="";
      S.M=new L.Machine(c.prog,src,{input:inp.value?inp.value.replace(/\r/g,"")+(inp.value.endsWith("\n")?"":"\n"):"",interactive:true});
      if(!inp.value)S.M.buf="";
      return true}
    catch(err){if(!L.isErr(err))throw err;S.M=null;
      const ln=err.p<0?0:ed.value.slice(0,err.p).split("\n").length;S.bad=err.kind==="link"?0:ln;S.cur=0;
      const uns=err.kind==="unsup"||/chưa (được |có trong trình mô phỏng|hỗ trợ)|chưa hỗ trợ/.test(err.message);
      S.head=L.errHead(src,err,uns);S.tail="";
      renderAll();
      exp.hidden=false;exp.className="explain"+(uns?" warn":"");exp.innerHTML=uns?`<b>Trình mô phỏng chưa hỗ trợ tính năng này${S.bad?` (dòng ${S.bad})`:""}</b><span>${esc(err.vi)}</span><span>${L.unsupNote} Xem mục “Trình mô phỏng hỗ trợ những gì?” bên dưới.</span>`:`<b>${L.errTitle(err)}${S.bad?` ở dòng ${S.bad}`:""}</b><span>${esc(err.vi)}</span>`;
      root.querySelector(".s-exit").textContent=uns?"chưa mô phỏng được":L.noBuild;
      setRunning(false);setChip(uns?"unsup":"err",uns?"Chưa hỗ trợ":L.errTitle(err));tab("out");
      cfg.onResult&&cfg.onResult(null);return false}
  }
  function finish(r){const M=S.M;S.cur=0;S.waiting=null;setRunning(false);
    setChip(r.s==="crash"?"err":"ok",r.s==="crash"?`Lỗi khi chạy · dòng ${r.line}`:"Đã chạy xong");
    const out=M.out.map(x=>x.s).join("");const nl=out&&!out.endsWith("\n")?"\n":"";
    if(r.s==="crash"){S.tail=nl+`<span class="e">${esc(M.crash.msg)}</span>`;S.bad=r.line}
    else S.tail=nl+`<span class="${M.exit===0?"ok":"e"}">[Chương trình kết thúc, mã thoát ${M.exit}]</span>`;
    root.querySelector(".s-exit").textContent=r.s==="crash"?"dừng bất thường":effL()==="cpp"?`return ${M.exit}`:`mã thoát ${M.exit}`;
    btnStep.textContent="Từng bước";renderAll();
    exp.hidden=false;
    const tips=[];
    if(r.s==="crash"){exp.className="explain";exp.innerHTML=`<b>Lỗi khi chạy ở dòng ${r.line}</b><span>${esc(M.crash.vi)}</span>`;cfg.onResult&&cfg.onResult(null);return}
    const un=M.notes.filter(n=>n!=="utf8"&&!n.startsWith("noret:")),nr=M.notes.filter(n=>n.startsWith("noret:")).map(n=>n.slice(6));
    if(un.length)tips.push(`Chương trình đã đọc biến chưa khởi tạo (${un.join(", ")}): giá trị in ra là rác, mỗi lần chạy có thể khác.`);
    if(nr.length)tips.push(`Hàm ${nr.join(", ")} chạy tới dấu } cuối mà không gặp return, nên giá trị trả về là rác (hành vi không xác định).`);
    if(M.notes.includes("utf8"))tips.push("Bạn nhập chữ có dấu vào biến char: char chỉ giữ 1 byte đầu của ký tự UTF-8.");
    if(M.failed&&!M.eof)tips.push("cin đã vào trạng thái lỗi vì dữ liệu nhập không khớp kiểu biến. Biến nhận giá trị 0 và mọi lệnh cin sau đó bị bỏ qua.");
    if(M.failed&&M.eof)tips.push("Hết dữ liệu nhập: các lệnh cin cuối không đọc được gì.");
    {const left=String(M.buf||"").slice(M.pos||0).trim();if(left&&!M.failed)tips.push(`Còn dữ liệu nhập chưa được đọc: “${left.length>40?left.slice(0,40)+"…":left}”. Chương trình chưa có (đủ) lệnh cin để đọc chúng.`)}
    if(!M.out.some(x=>x.k!=="i"&&String(x.s).trim()))tips.push(LG().noOut);
    if(M.leaks){const lk=M.leaks();if(lk.length){const by=lk.slice(0,4).map(B=>`#${B.heap.id} (${B.heap.arr?`new ${tn(elemT(B.t))}[${B.heap.n}]`:`new ${tn(elemT(B.t))}`}, dòng ${B.heap.line})`).join(", "),bytes=lk.reduce((a,B)=>a+B.heap.n*sizeOfT(elemT(B.t)),0);
        tips.push(`Rò rỉ bộ nhớ (memory leak): còn ${lk.length} vùng nhớ cấp bằng new chưa được delete, tổng ${bytes} byte: ${by}${lk.length>4?", …":""}. Chương trình nhỏ chạy xong thì hệ điều hành thu hồi hết, nhưng chương trình chạy lâu (máy chủ, trò chơi) mà rò rỉ trong vòng lặp sẽ ăn dần hết bộ nhớ. Mỗi new cần đúng một delete (new[] đi với delete[]).`)}}
    if(M.memNotes&&M.memNotes.length)M.memNotes.forEach(n=>{const [k,l1,l2]=n.split(":");tips.push(k==="new[]"?`Vùng nhớ cấp bằng new[] ở dòng ${l1} lại được trả bằng delete (thiếu []) ở dòng ${l2}. Với kiểu số, chương trình thường vẫn chạy, nhưng đây là hành vi không xác định: new[] phải đi với delete[].`:`Vùng nhớ cấp bằng new (một phần tử) ở dòng ${l1} lại được trả bằng delete[] ở dòng ${l2}. Đây là hành vi không xác định: new đi với delete, new[] đi với delete[].`)});
    if(S.warns&&S.warns.length)tips.push(`Trình biên dịch có ${S.warns.length} cảnh báo (chữ cam trong khung Kết quả). Cảnh báo không làm chương trình dừng nhưng thường báo code chưa xong hoặc dễ sai: ${S.warns[0].vi||S.warns[0].msg}`);
    exp.className="explain"+(tips.length?" warn":" good");
    exp.innerHTML=tips.length?`<b>Chạy xong, có điều cần chú ý</b>${tips.map(t=>`<span>${esc(t)}</span>`).join("")}`:`<b>${LG().okTitle}</b><span>${M.nCalls?`${M.nCalls} lần gọi hàm, ngăn xếp sâu nhất ${M.maxDepth+1} tầng (tính cả ${MAIN_NAME()})`:`${(M.lastOrder||M.order).length} biến trong bộ nhớ`}${M.reads.length?`, ${M.reads.filter(x=>!x.ign).length} lần đọc từ ${LG().readWord||"cin"}`:""}.</span>`;
    cfg.onResult&&cfg.onResult(M);
  }
  function waitInput(){return new Promise(res=>{S.waiting=res;renderAll()})}
  async function run(){
    if(S.running){S.tok++;S.waiting=null;setRunning(false);S.cur=0;renderAll();setChip("idle","Đã dừng · bấm Chạy để chạy lại");root.querySelector(".s-exit").textContent="đã dừng";return}
    if(!compileStart())return;const tok=S.tok;S.mode="run";setRunning(true);renderAll();
    for(let k=0;;k++){
      if(tok!==S.tok)return;
      const r=S.M.step();S.ch=r.ch||new Set();S.cur=r.line||0;noteCond(r);
      if(r.s==="need"){renderAll();await waitInput();if(tok!==S.tok)return;continue}
      if(r.s!=="ran"){finish(r);return}
      if(S.vz&&k<3000&&!REDUCE()){renderAll();await sleep(S.speed)}
      else if(k<60){renderAll();await sleep(k<30?110:40)}
      else if(k%2000===0){S.fast=true;renderAll();await sleep(0)}}
  }
  function noteCond(r){if(r&&r.cond!==undefined&&r.op){S.cond=r.op==="switch"?`switch dòng ${r.line}: giá trị ${r.cond.sw}${r.cond.hit?"":" → default"}`:`${r.kw} dòng ${r.line}: ${r.cond?"đúng":"sai"}`}else if(r&&r.kw&&(r.kw==="break"||r.kw==="continue"))S.cond=`${r.kw} dòng ${r.line}`;
    else if(r&&r.kw==="call")S.cond=`vào hàm ${r.fn}()`;
    else if(r&&r.kw==="ret")S.cond=`${r.fn}() trả về${r.rv&&r.rv.t!=="void"?" "+S.M.argTxt(r.rv):" (void)"}`}
  async function step(){
    if(S.ask){S.ask=null;S.pick=null;S.picks=null;S.fb=null;return step0()}
    if(S.prOn&&predOk()&&S.M&&S.mode==="step"&&!S.M.done&&!S.waiting){const rule=S.pr.find(r=>r.line===S.cur);if(rule){S.ask=rule;S.fb=null;renderViz();return}}
    S.fb=null;return step0()}
  async function step0(){
    if(S.waiting)return;
    if(!S.M||S.M.done||S.mode!=="step"){if(!compileStart())return;S.mode="step";S.k=0;S.feeds=[];S.pending=[];S.cur=S.M.nextLine();btnStep.textContent="Bước tiếp →";renderAll();if(!S.cur)finish({s:"done"});return}
    const tok=S.tok;let r=S.M.step();
    while(r.s==="need"&&S.pending.length){applyFeed(S.pending.shift());r=S.M.step()}
    if(r.s==="need"){S.cur=r.line;renderAll();await waitInput();if(tok!==S.tok)return;r=S.M.step()}
    if(r.s!=="need")S.k++;
    S.ch=r.ch||new Set();noteCond(r);
    if(r.s==="ran"){S.cur=S.M.nextLine();renderAll();if(!S.cur)finish({s:"done"})}
    else if(r.s==="need"){S.cur=r.line;renderAll();step()}
    else finish(r)}
  ed.addEventListener("input",()=>{if(S.M||S.bad){S.bad=0;reset()}else paint()});
  ed.addEventListener("scroll",sync);
  ed.addEventListener("keydown",e=>{
    if(e.key==="Tab"){e.preventDefault();ed.setRangeText("    ",ed.selectionStart,ed.selectionEnd,"end");ed.dispatchEvent(new Event("input"))}
    if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();run()}});
  inp.addEventListener("input",fitIn);
  $(".s-pre").onchange=e=>load(+e.target.value);
  document.addEventListener("amts-lang",()=>{const keep=cfg.keepOnLang&&ed.value;langText();if(cfg.keepOnLang){reset();paint()}else load(S.pi)});
  /* lùi một bước: chạy lại từ đầu tới bước trước đó (dữ liệu đã nhập được dùng lại) */
  function back(){
    if(!S.M||S.mode!=="step"||!S.k)return;
    const target=S.k-1,feeds=S.feeds.concat(S.pending);
    if(!compileStart())return;
    S.mode="step";S.k=0;S.feeds=[];S.pending=[];let fi=0,r=null;
    while(S.k<target){r=S.M.step();
      if(r.s==="need"){if(fi>=feeds.length)break;applyFeed(feeds[fi++]);continue}
      S.k++;noteCond(r);if(r.s!=="ran")break}
    S.pending=feeds.slice(fi);
    S.ch=r&&r.ch||new Set();S.cur=S.M.nextLine();btnStep.textContent="Bước tiếp →";renderAll()}
  btnBack.onclick=back;
  btnRun.onclick=run;btnStep.onclick=step;
  langText();load(0);
  return{forceLang:l=>{S.forceL=l||null;langText();reset()},get lang(){return effL()},get:()=>ed.value,set:c=>{ed.value=c;S.bad=0;reset()},setInput:v=>{inp.value=v;fitIn()},el:root,run,step,load,stepTo:()=>{if(!S.M||S.mode!=="step"||S.M.done)step()}};
}

/* ---------- bài tập chấm tự động (gọn): danh sách tên bài · chọn bài hiện đề · 3 nút dùng chung ----------
   Danh sách mọi bài tập được ghi vào EXERCISES (dùng cho trang Thực hành). */
const EXERCISES={};
function exStateOf(id){return window.TRACK&&TRACK.exOf?TRACK.exOf(id):null}
function exResultHTML(e,R,ok,pass,srcOk){
  const show=v=>esc(JSON.stringify(v).slice(1,-1))||'<i class="ex-none">(trống)</i>';
  if(R.err)return `<div class="res bad"><b>✗ Chưa đạt: code chưa biên dịch được</b><span>${esc(R.err.message)}. Bấm Chạy ở trình mô phỏng để xem dòng lỗi.</span></div>`;
  const fails=R.res.map((x,k)=>[x,k]).filter(([x])=>!x.ok);
  return `<div class="res ${ok?"ok":"bad"}"><b>${ok?"✓ Đạt":"✗ Chưa đạt"}: ${pass}/${R.res.length} test đúng</b>`+
    (fails.length?`<div class="tbl ex-t"><table><thead><tr><th scope="col">Test</th><th scope="col">Input</th><th scope="col">Expected</th><th scope="col">Actual</th></tr></thead><tbody>${fails.slice(0,3).map(([x,k])=>`<tr><th scope="row">Test ${k+1}</th><td data-h="Input"><code>${show(x.T.in)}</code></td><td data-h="Expected"><code>${show(x.T.out)}</code></td><td data-h="Actual"><code>${x.crash?esc(x.crash.short||x.crash.msg):show(x.got)}</code></td></tr>`).join("")}</tbody></table></div>${fails.length>3?`<p class="ex-more">Còn ${fails.length-3} test sai khác. Sửa các test trên trước rồi nộp lại.</p>`:""}`:"")+
    (srcOk?"":`<div class="fail"><span>${esc(exF(e,"needMsg")||"")}</span></div>`)+"</div>"}
/* Chạy thử: so kết quả với ví dụ nhập đầu tiên để học viên biết đã đúng ví dụ hay chưa */
function tryExHTML(e,code,lang){const R=runTests(code,[e.tests[0]],lang);const show=v=>esc(String(v).replace(/\s+$/,""))||'<i class="ex-none">(không in gì)</i>';
  if(R.err)return `<div class="res bad"><b>Chạy thử: code chưa biên dịch được</b><span>${esc(R.err.message)}. Xem dòng lỗi trong khung Kết quả của trình mô phỏng.</span></div>`;
  const x=R.res[0];if(x.ok)return `<div class="res ok try"><b>✓ Chạy thử: đúng với ví dụ</b><span>Bấm <b>Nộp bài</b> để chấm đủ ${e.tests.length} test.</span></div>`;
  return `<div class="res bad try"><b>Chạy thử: chưa khớp ví dụ</b><div class="tbl ex-t"><table><tbody><tr><th scope="row">Ví dụ</th><td data-h="Input"><code>${show(e.tests[0].in)}</code></td><td data-h="Expected"><code>${show(e.tests[0].out)}</code></td><td data-h="Actual"><code>${x.crash?esc(x.crash.short||x.crash.msg):show(x.got)}</code></td></tr></tbody></table></div><span>Đây chỉ là chạy thử, chưa tính điểm. Sửa code rồi chạy thử lại hoặc Nộp bài.</span></div>`}
/* ---------- chấm độ hiệu quả: chạy với dữ liệu lớn dần, đếm số bước, ước lượng bậc tăng ----------
   e.perf = {gen:n=>"dữ liệu nhập", ns:[250,500,1000], need:"n"|"nlogn"|"n2"|"logn", limit:n=>số bước tối đa cho phép, why:"gợi ý khi chưa đạt"} */
const PERF_TXT={"1":"O(1)","logn":"O(log n)","sqrt":"O(√n)","n":"O(n)","nlogn":"O(n log n)","n2":"O(n²)","n3":"O(n³)"};
function perfOf(code,P,lang){lang=lang||LANG_CUR;const L=langOf(lang);let c;try{c=L.compile(code)}catch(err){return null}
  const kf=(P.k&&P.k[lang])||1,lim=P.limit?(n=>Math.round(P.limit(n)*kf)):null;
  const rows=[];for(const n of P.ns){const M=new L.Machine(c.prog,code,{input:P.gen(n),interactive:false});M.snap=false;const r=M.runAll();
    rows.push({n,cost:M.cost,tle:r&&r.s==="crash"&&M.exit===124,crash:r&&r.s==="crash"&&M.exit!==124?M.crash:null});if(r&&r.s==="crash")break}
  const ok=rows.filter(x=>!x.tle&&!x.crash);let k=null;
  if(ok.length>=2){const a=ok[0],b=ok[ok.length-1];k=Math.log(Math.max(1,b.cost)/Math.max(1,a.cost))/Math.log(b.n/a.n)}
  const cls=k==null?null:k<0.12?"1":k<0.33?"logn":k<0.72?"sqrt":k<1.35?(P.need==="nlogn"&&k>=1.05?"nlogn":"n"):k<1.7?"nlogn":k<2.6?"n2":"n3";
  const within=rows.every(x=>!x.tle&&!x.crash&&(!lim||x.cost<=lim(x.n)));
  return{rows,k,cls,ok:within,lim}}
function perfHTML(P,F){if(!F)return "";const mx=Math.max(...F.rows.map(x=>x.cost),...(F.lim?P.ns.map(F.lim):[1]));
  const bars=F.rows.map(x=>{const lim=F.lim?F.lim(x.n):null,over=x.tle||(lim!=null&&x.cost>lim);
    return `<div class="pf-r"><span class="pf-n">n = ${x.n.toLocaleString("vi-VN")}</span><span class="pf-b"><span class="pf-bar${over?" over":""}" style="width:${Math.max(2,Math.min(100,x.cost/mx*100)).toFixed(1)}%"></span>${lim!=null?`<span class="pf-lim" style="left:${Math.min(100,lim/mx*100).toFixed(1)}%" title="giới hạn"></span>`:""}</span><span class="pf-c">${x.tle?"quá 1 000 000 bước":x.crash?"lỗi khi chạy":x.cost.toLocaleString("vi-VN")+" bước"}</span></div>`}).join("");
  const ORD=["1","logn","sqrt","n","nlogn","n2","n3"],better=F.cls&&ORD.indexOf(F.cls)<=ORD.indexOf(P.need);
  const est=F.cls?(F.ok&&better?`${PERF_TXT[P.need]} hoặc tốt hơn`:PERF_TXT[F.cls]):"chưa ước lượng được";
  return `<div class="perf ${F.ok?"ok":"bad"}"><b>${F.ok?"✓":"✗"} Độ hiệu quả: ${F.ok?"đạt":"chưa đạt"} yêu cầu ${PERF_TXT[P.need]||""}</b>
    <div class="pf-rows">${bars}</div>
    <span class="pf-k">Khi n tăng gấp ${(P.ns[P.ns.length-1]/P.ns[0])} lần, số bước tăng khoảng ${F.k==null?"?":(Math.pow(P.ns[P.ns.length-1]/P.ns[0],F.k)).toFixed(1)} lần → ước lượng <b>${est}</b>.${P.limit?" Vạch đứng là số bước tối đa cho phép.":""}</span>
    ${F.ok?"":`<span class="pf-why">${esc(P.why||"Cách làm hiện tại cần quá nhiều bước khi dữ liệu lớn. Xem lại gợi ý của bài để tìm cách làm nhanh hơn.")}</span>`}</div>`}
function gradeEx(e,code,lang){lang=lang||LANG_CUR;const R=runTests(code,e.tests,lang);if(R.err)return{R,ok:false,pass:0,srcOk:true,d:"lỗi biên dịch",lang};
  const pass=R.res.filter(x=>x.ok).length,need=exF(e,"need",lang),srcOk=!need||need.test(code);
  const F=e.perf&&pass===R.res.length?perfOf(code,e.perf,lang):null;const pfOk=!e.perf||(F&&F.ok);
  return{R,ok:pass===R.res.length&&srcOk&&pfOk,pass,srcOk,F,lang,d:`${lang!=="cpp"?langOf(lang).name+" · ":""}${pass}/${R.res.length} test${e.perf?(F?` · ${F.ok?"đạt":"chưa đạt"} độ hiệu quả`:" · chưa đo độ hiệu quả"):""}`}}
function makeEx2(el,sim,list,opt){
  opt=opt||{};const L=el.id.replace("ex-","");EXERCISES[L]=list;
  const st=list.map(()=>null);let cur=0;
  const mark=i=>{const x=exStateOf(L+"-"+i);return x?(x.pass?["ok","✓","đạt"]:["bad","✗","chưa đạt"]):["","","chưa nộp"]};
  el.classList.add("exw");
  el.innerHTML=`<div class="ex-list" role="tablist" aria-label="Chọn bài tập">${list.map((e,i)=>`<button type="button" role="tab" id="${el.id}-t${i}" aria-controls="${el.id}-p" data-pick="${i}" aria-selected="${i===0}" tabindex="${i===0?0:-1}"><span class="ex-i" aria-hidden="true"></span><span class="ex-n">${i+1}. ${esc(e.t)}</span><span class="vh ex-s"></span></button>`).join("")}</div>
    <div class="ex ex-panel" role="tabpanel" id="${el.id}-p" aria-labelledby="${el.id}-t0"></div>
    <div class="ex-btns"><button type="button" class="btn" data-act="load">Nạp code mẫu</button><button type="button" class="btn" data-act="try">Chạy thử</button><button type="button" class="btn pri" data-act="grade">Nộp bài</button>${opt.extraBtns||""}</div>
    <div class="ex-st" role="status" aria-live="polite"></div>`;
  const tabs=[...el.querySelectorAll("[data-pick]")],panel=el.querySelector(".ex-panel"),stEl=el.querySelector(".ex-st");
  function paintList(){tabs.forEach((b,i)=>{const [c,ic,t]=mark(i);b.querySelector(".ex-i").className="ex-i "+c;b.querySelector(".ex-i").textContent=ic;b.querySelector(".ex-s").textContent=" ("+t+")"})}
  function render(){const e=list[cur];
    tabs.forEach((b,i)=>{b.setAttribute("aria-selected",i===cur);b.tabIndex=i===cur?0:-1});panel.setAttribute("aria-labelledby",`${el.id}-t${cur}`);
    panel.innerHTML=`<h4>Bài ${cur+1}. ${esc(e.t)}</h4><p>${esc(exF(e,"d"))}</p>${e.perf?`<p class="ex-perf">Yêu cầu độ hiệu quả: <b>${PERF_TXT[e.perf.need]||""}</b>. Khi nộp, bài được chạy thêm với n = ${e.perf.ns.map(x=>x.toLocaleString("vi-VN")).join(", ")} để đếm số bước.</p>`:""}
      <div class="io"><div><div class="pane-h" style="padding:0 0 4px">Ví dụ nhập</div><pre>${esc(e.tests[0].in||"(không có)")}</pre></div><div><div class="pane-h" style="padding:0 0 4px">Kết quả đúng</div><pre>${esc(e.tests[0].out)}</pre></div></div>
      ${opt.panelExtra?opt.panelExtra(cur,e):""}`;
    stEl.innerHTML=st[cur]||`<p class="ex-todo">Chưa nộp bài này · ${e.tests.length} test sẽ được chấm.</p>`;paintList();opt.onSelect&&opt.onSelect(cur,e)}
  tabs.forEach((b,i)=>{b.onclick=()=>{cur=i;render()};b.onkeydown=ev=>{const d=ev.key==="ArrowRight"||ev.key==="ArrowDown"?1:ev.key==="ArrowLeft"||ev.key==="ArrowUp"?-1:0;if(!d)return;ev.preventDefault();cur=(cur+d+list.length)%list.length;render();tabs[cur].focus()}});
  el.querySelector('[data-act="load"]').onclick=()=>{const e=list[cur];sim.set(exF(e,"start",exLang(e)));sim.setInput(e.tests[0].in);sim.el.scrollIntoView({behavior:REDUCE()?"auto":"smooth",block:"start"})};
  el.querySelector('[data-act="try"]').onclick=()=>{const e=list[cur];stEl.innerHTML=tryExHTML(e,sim.get(),sim.lang);sim.setInput(e.tests[0].in);sim.run()};
  el.querySelector('[data-act="grade"]').onclick=()=>grade(cur);
  function grade(i){const e=list[i],g=gradeEx(e,sim.get(),sim.lang);
    if(window.TRACK)TRACK.ex(L+"-"+i,g.ok,g.d);
    st[i]=exResultHTML(e,g.R,g.ok,g.pass,g.srcOk)+(e.perf?(g.F?perfHTML(e.perf,g.F):`<div class="perf"><span class="pf-k">Độ hiệu quả sẽ được đo khi code đúng hết các test.</span></div>`):"");opt.onGrade&&opt.onGrade(i,g);cur=i;render()}
  document.addEventListener("amts-progress",paintList);
  document.addEventListener("amts-lang",()=>{st.fill(null);render()}); // kết quả chấm thuộc về ngôn ngữ cũ
  render();
  return{select:i=>{cur=i;render()},grade,get cur(){return cur}};
}

const INC="#include <iostream>\n";/* ================= HÌNH ĐỘNG GẮN VỚI TRÌNH MÔ PHỎNG (khóa Giải thuật, chương Mảng của C++) =================
   Mỗi ví dụ (preset) của makeSim2 có thể khai báo viz: một hoặc nhiều "khung nhìn" vẽ trực tiếp từ bộ nhớ của chương trình
   sau từng bước chạy, nên hình luôn khớp với dòng code đang sáng.
     {type:"bars",  of:"a", ptr:["lo","mid","hi"], range:["lo","hi"], sorted:{from:"n-i"}, label:"Mảng a"}   cột cao theo giá trị
     {type:"cells", of:"a", ptr:["i","j"], range:["l","r"], label:"..."}                                    ô có giá trị
     {type:"grid",  of:"dp", cur:["i","j"], label:"Bảng dp"}                                                 bảng hai chiều
     {type:"vars",  names:["tong","dem"]}                                                                    vài biến đơn, chữ lớn
     {type:"calls", fns:["fib"], label:"..."}                                                               cây lời gọi đệ quy
     {type:"mem", names:["x","p"]}   stack (các khung hàm) và heap; mỗi ô ghi địa chỉ; con trỏ vẽ mũi tên tới ô nó trỏ (Chương 7)
   ptr / range / sorted nhận tên biến hoặc biểu thức đơn giản (n-i, mid+1). Ô vừa đọc viền xanh, ô vừa ghi tô cam.
   predict (tùy chọn, trong preset): [{line:12, v:"mid", q:"mid sẽ trỏ vào ô nào?"}, {line:9, kind:"swap", q:"..."}]
   → bật "Đoán trước" thì trước khi chạy dòng đó, học viên bấm chọn ô, rồi mới xem kết quả. */
const VIZ=(()=>{
  /* tìm biến theo tên: khung hàm hiện tại → các khung đang chờ → biến toàn cục */
  function look(M,n){if(!M)return null;if(M.vizLook)return M.vizLook(n);if(M.vars.has(n))return M.vars.get(n);
    for(let k=M.calls.length-1;k>=0;k--){const c=M.calls[k];if(c.vars.has(n))return c.vars.get(n)}
    return M.globals.has(n)?M.globals.get(n):null}
  const num=V=>V&&V.init!==false&&!(V.v&&typeof V.v==="object")?Number(V.v):null;
  /* biểu thức nhỏ: tên biến, số, + - * / ( ) */
  function val(M,ex){if(ex==null)return null;if(typeof ex==="number")return ex;
    const toks=String(ex).match(/[A-Za-z_]\w*|\d+|[-+*/()]/g)||[];let i=0;
    const atom=()=>{const t=toks[i++];if(t==="("){const v=add();i++;return v}if(t==="-")return -atom();if(/^\d/.test(t))return +t;const V=look(M,t);const x=num(V);return x==null?NaN:x};
    const mul=()=>{let v=atom();while(toks[i]==="*"||toks[i]==="/"){const o=toks[i++],r=atom();v=o==="*"?v*r:Math.trunc(v/r)}return v};
    const add=()=>{let v=mul();while(toks[i]==="+"||toks[i]==="-"){const o=toks[i++],r=mul();v=o==="+"?v+r:v-r}return v};
    try{const v=add();return Number.isFinite(v)?v:null}catch(e){return null}}
  const seqOf=V=>V&&V.v&&typeof V.v==="object"&&V.v.a?V.v.a:V&&V.t==="string"?Array.from(u8(V.v),x=>({t:"char",v:x>127?x-256:x,init:true})):null;
  const txt=c=>c?(c.txt!=null?c.txt:cellTxt(c)):"";
  function cls(c,M,k,sp,mm){let s="";if(M&&M.rd&&M.rd.has(c))s+=" r";if(M&&M.wr&&M.wr.has(c))s+=" w";if(!c.init)s+=" g";
    if(mm.range&&k>=mm.range[0]&&k<=mm.range[1])s+=" in";if(mm.range&&(k<mm.range[0]||k>mm.range[1]))s+=" out";
    if(mm.sorted!=null&&k>=mm.sorted)s+=" ok";if(mm.pick===k)s+=" pick";return s}
  /* hàng mũi tên chỉ vị trí (lo, mid, hi...); vị trí ngoài mảng ghi ở hai đầu kèm ← / → */
  function ptrRow(M,sp,n){const P=(sp.ptr||[]).map(p=>typeof p==="string"?{v:p,l:p}:p);const at={};if(!n)return "";
    P.forEach(p=>{const k=val(M,p.v);if(k==null)return;const col=Math.max(0,Math.min(n-1,k)),pre=k<0?"←":"",suf=k>=n?"→":"";(at[col]=at[col]||[]).push(`${pre}${p.l||p.v}${k<0||k>=n?`=${k}`:""}${suf}`)});
    if(!Object.keys(at).length)return "";
    return `<div class="vz-ptr" style="--n:${n}">${Array.from({length:n},(_,k)=>`<span class="vp">${at[k]?`<b aria-hidden="true">▲</b>${at[k].map(x=>`<i>${esc(x)}</i>`).join("")}`:""}</span>`).join("")}</div>`}
  function rng(M,sp){if(!sp.range)return null;const a=val(M,sp.range[0]),b=val(M,sp.range[1]);return a==null||b==null?null:[a,b]}
  function drawSeq(M,sp,pick){const V=look(M,sp.of),A=seqOf(V);const lab=sp.label||sp.of;
    if(!A)return `<div class="vz-one"><div class="vz-lb">${esc(lab)}</div><p class="vz-empty">${M?`Chưa có ${esc(sp.of)} trong bộ nhớ.`:"Bấm Từng bước hoặc Chạy để xem hình động."}</p></div>`;
    const lim=sp.max||40,n=Math.min(A.length,lim),mm={range:rng(M,sp),sorted:sp.sorted?val(M,sp.sorted.from):null,pick};
    const vals=A.slice(0,n).map(c=>c.init&&!(c.v&&typeof c.v==="object")?Number(c.v):0);
    const lo=Math.min(0,...vals),hi=Math.max(1,...vals);const dense=n>16?" dense":"";
    const cols=`style="--n:${n}"`;
    let body;
    if(sp.type==="bars")body=`<div class="vz-bars${dense}" ${cols}>${A.slice(0,n).map((c,k)=>`<button type="button" class="vb${cls(c,M,k,sp,mm)}" data-k="${k}" tabindex="-1" aria-label="${esc(sp.of)}[${k}] = ${esc(txt(c))}" style="--h:${((vals[k]-lo)/(hi-lo||1)*0.86+0.1).toFixed(3)}"><span>${esc(txt(c))}</span></button>`).join("")}</div>`;
    else body=`<div class="vz-cells${dense}" ${cols}>${A.slice(0,n).map((c,k)=>`<button type="button" class="vc${cls(c,M,k,sp,mm)}" data-k="${k}" tabindex="-1" aria-label="${esc(sp.of)}[${k}] = ${esc(txt(c))}"><span>${esc(txt(c))}</span></button>`).join("")}</div>`;
    const idx=`<div class="vz-idx${dense}" ${cols}>${A.slice(0,n).map((c,k)=>`<span>${k}</span>`).join("")}</div>`;
    return `<div class="vz-one"><div class="vz-lb">${esc(lab)}${isVec(V.t)||V.t==="string"||V.t==="list"?` <small>${V.t==="list"?"len":"size"} = ${A.length}</small>`:""}${A.length>n?` <small>(hiện ${n}/${A.length} phần tử)</small>`:""}</div>${body}${idx}${ptrRow(M,sp,n)}</div>`}
  function drawGrid(M,sp){const V=look(M,sp.of),A=seqOf(V);const lab=sp.label||sp.of;
    if(!A)return `<div class="vz-one"><div class="vz-lb">${esc(lab)}</div><p class="vz-empty">${M?`Chưa có ${esc(sp.of)} trong bộ nhớ.`:"Bấm Từng bước hoặc Chạy để xem hình động."}</p></div>`;
    const ci=sp.cur?val(M,sp.cur[0]):null,cj=sp.cur?val(M,sp.cur[1]):null;const R=Math.min(A.length,sp.maxR||14);
    const W=Math.min(Math.max(0,...A.slice(0,R).map(r=>(seqOf(r)||[]).length)),sp.maxC||16);
    const head=(sp.cols||[]).length?sp.cols:null;
    let h=`<table class="vz-grid"><thead><tr><th></th>${Array.from({length:W},(_,j)=>`<th scope="col">${head&&head[j]!=null?esc(String(head[j])):j}</th>`).join("")}</tr></thead><tbody>`;
    for(let i=0;i<R;i++){const row=seqOf(A[i])||[];h+=`<tr><th scope="row">${sp.rows&&sp.rows[i]!=null?esc(String(sp.rows[i])):i}</th>`;
      for(let j=0;j<W;j++){const c=row[j];h+=c?`<td class="${(cls(c,M,j,sp,{})+(i===ci&&j===cj?" cur":"")).trim()}">${esc(txt(c))}</td>`:"<td class=\"na\"></td>"}h+="</tr>"}
    return `<div class="vz-one"><div class="vz-lb">${esc(lab)}</div><div class="vz-gw">${h}</tbody></table></div></div>`}
  function drawVars(M,sp){return `<div class="vz-one"><div class="vz-vars">${sp.names.map(n=>{const V=look(M,n);return `<span class="vv${V&&(V.w||M.wrRoot&&M.wrRoot.has(V))?" w":""}"><small>${esc(n)}</small><b>${V?esc(V.txt!=null?V.txt:isSeq(V.t)?`[${V.v.a.length}]`:showValTxt(V)):"–"}</b></span>`}).join("")}</div></div>`}
  /* cây lời gọi đệ quy: danh sách lồng nhau (vừa màn hình điện thoại), nút đang chạy sáng, nút đã xong ghi giá trị trả về */
  function drawCalls(M,sp){const lab=sp.label||"Cây lời gọi";
    if(!M)return `<div class="vz-one"><div class="vz-lb">${esc(lab)}</div><p class="vz-empty">Bấm Từng bước hoặc Chạy để xem cây lời gọi mọc ra.</p></div>`;
    const T=M.ctree||[],kids=new Map();T.forEach((n,i)=>{if(sp.fns&&!sp.fns.includes(n.f))return;let p=n.par;while(p>=0&&sp.fns&&!sp.fns.includes(T[p].f))p=T[p].par;(kids.get(p)||kids.set(p,[]).get(p)).push(i)});
    const live=new Set();for(let c=M.cnode;c>=0;c=T[c].par)live.add(c);
    const node=i=>{const n=T[i],ch=kids.get(i)||[];const st=i===M.cnode?" cur":live.has(i)?" live":n.done?" done":"";
      return `<li class="vt${st}"><span class="vt-n">${esc(n.l)}${n.done&&n.ret!=null?` <b>→ ${esc(n.ret)}</b>`:""}</span>${ch.length?`<ul>${ch.map(node).join("")}</ul>`:""}</li>`};
    const top=kids.get(-1)||[];
    return `<div class="vz-one"><div class="vz-lb">${esc(lab)} <small>${T.length} lời gọi${T.length>=M2.TREE?" (chỉ vẽ "+M2.TREE+" lời gọi đầu)":""} · sâu nhất ${M.maxDepth} tầng</small></div>
      <div class="vz-tw">${top.length?`<ul class="vz-tree"><li class="vt root${M.cnode<0?" cur":" live"}"><span class="vt-n">${MAIN_NAME()==="chương trình chính"?"chương trình chính":MAIN_NAME()+"()"}</span><ul>${top.map(node).join("")}</ul></li></ul>`:`<p class="vz-empty">Chưa có lời gọi hàm nào.</p>`}</div></div>`}
  function showValTxt(V){return txt({t:V.t,v:V.v,init:V.init})}
  /* ---------- bộ nhớ: stack và heap, con trỏ là mũi tên ---------- */
  const hx=a=>"0x"+Number(a||0).toString(16);
  function memCell(M,c,lab,cls){const p=isPtr(c.t);let val,to="";
    if(p){const v=c.v;if(!c.init||(v&&v.bad))val=`<b class="vm-v g">?</b>`;else if(!v||!v.h)val=`<b class="vm-v n">nullptr</b>`;
      else{const tgt=v.h.one||v.h,dead=tgt.dead||(v.h.heap&&v.h.heap.freed);val=`<b class="vm-v p${dead?" bad":""}">${hx(M.ptrAddr(v))}</b>`;to=` data-to="${M.ptrAddr(v)}"${dead?' data-bad="1"':""}`}}
    else val=`<b class="vm-v${c.init?"":" g"}">${esc(c.init?txt(c):"?")}</b>`;
    const w=M.wr&&M.wr.has(c)||M.wrRoot&&M.wrRoot.has(c)?" w":"",r=M.rd&&M.rd.has(c)?" r":"";
    return `<span class="vm-c${p?" ptr":""}${w}${r}${cls||""}" data-a="${M.cAddr(c)}"${to}>${lab?`<i class="vm-n">${esc(lab)}</i>`:""}${val}<small class="vm-a">${hx(M.cAddr(c))}</small></span>`}
  /* tham chiếu: không có ô riêng, chỉ là mũi tên về ô gốc */
  function refCell(M,n,C){const T=(isArr(C.t)||isVec(C.t))&&C.v&&C.v.a&&C.v.a.length?C.v.a[0]:C;let a=0;try{a=M.cAddr(T)}catch(e){}
    return `<span class="vm-c ref"${a?` data-to="${a}"`:""}${T.dead?' data-bad="1"':""}><i class="vm-n">${esc(n)}</i><b class="vm-v rf">${isArr(C.t)?"mảng":"&amp;"}</b><small class="vm-a">tham chiếu</small></span>`}
  /* đối tượng struct/class: một khung chứa các thành viên (thành viên là đối tượng thì lồng vào) */
  let VT=null,VT_OFF=false;   // VT_OFF: đang vẽ khối đã delete (không còn đối tượng, không vẽ mũi tên vptr)   // các lớp có vtable gặp khi vẽ (để vẽ bảng hàm ảo ở cột bên phải)
  const vtId=id=>"vt-"+String(id).replace(/[^\w-]/g,"_");
  function memObj(M,n,V,d){const parts=[];const id=V.v.o,D=CLS.get(id),dyn=V.v.vp||id,base=M.cAddr(V);
    const vptr=fam=>{const k=fam===id?dyn:dyn+"|"+fam,off=VT_OFF;if(VT&&!off)VT.add(k);
      return `<span class="vm-c ptr vptr"${off?"":` data-to="${vtId(k)}"`}><i class="vm-n">vptr</i><b class="vm-v p">vtable ${esc(tn(dyn))}${fam===id||fam===dyn?"":` <small>(phần ${esc(tn(fam))})</small>`}</b><small class="vm-a">ẩn · 8 byte</small></span>`};
    const cell=c=>c.v&&c.v.f&&d<3?memObj(M,c.fname,c,d+1):isArr(c.t)&&c.v&&c.v.a?memVar(M,c.fname,c):memCell(M,c,c.fname);
    const fieldsOf=x=>CLS.get(x).fields.map(F=>V.v.f[F.owner+"."+F.name]).filter(Boolean).map(cell);
    if(D&&D.dyn)parts.push(vptr(id));
    const lay=D&&M.objLay?M.objLay(id):[];const prim=[];for(let x=id;x;x=CLS.get(x).prim)prim.push(x);
    if(lay.some(e=>!prim.includes(e.cls))){   // đa kế thừa: vẽ từng phần lớp cha thành một khung riêng, đúng địa chỉ của phần đó
      for(const e of lay){if(e.cls===id)continue;const X=CLS.get(e.cls),own=prim.includes(e.cls),fs=fieldsOf(e.cls);
        if(!fs.length&&(own||!X.dyn))continue;
        parts.push(`<div class="vm-obj vm-sub" data-a="${base+e.off}"><i class="vm-n">phần ${esc(tn(e.cls))}${basesOf(id).some(b=>b.id===e.cls&&b.virt)||vbasesOf(id).includes(e.cls)?" <small>lớp cơ sở ảo, dùng chung</small>":""}</i><span class="vm-row">${!own&&X.dyn?vptr(e.cls):""}${fs.join("")||(!own&&X.dyn?"":'<span class="vm-e">(không có thành viên)</span>')}</span><small class="vm-a">${hx(base+e.off)}</small></div>`)}
      parts.push(...fieldsOf(id))}
    else for(const k in V.v.f)parts.push(cell(V.v.f[k]));
    const w=M.wrRoot&&M.wrRoot.has(V)&&!d?" w":"";
    return `<div class="vm-obj${w}" data-a="${base}"><i class="vm-n">${esc(n)}${n?" ":""}<small>${esc(tn(V.v.o||V.t))}</small></i><span class="vm-row">${parts.join("")||'<span class="vm-e">(trống)</span>'}</span><small class="vm-a">${hx(base)}</small></div>`}
  function memVar(M,n,V,isRef){
    if(isRef)return refCell(M,n,V);
    if(V&&V.v&&V.v.f&&V.v.o)return memObj(M,n,V,0);
    if((isArr(V.t)||isVec(V.t))&&V.v&&V.v.a&&!isSeq(elemT(V.t))&&elemT(V.t)!=="string"){const A=V.v.a.slice(0,12);
      return `<div class="vm-arr"><i class="vm-n">${esc(n)}${isVec(V.t)?` <small>vector, ${V.v.a.length} phần tử</small>`:""}</i><span class="vm-row">${A.map((c,k)=>c.v&&c.v.f?memObj(M,`[${k}]`,c,1):memCell(M,c,`[${k}]`)).join("")}${V.v.a.length>12?`<span class="vm-more">… ${V.v.a.length-12}</span>`:""}</span></div>`}
    if(isSeq(V.t)||V.t==="string")return `<span class="vm-c x"><i class="vm-n">${esc(n)}</i><b class="vm-v">${esc(isSeq(V.t)?`[${V.v.a.length}]`:JSON.stringify(V.v))}</b><small class="vm-a">${hx(V.addr)}</small></span>`;
    return memCell(M,V,n)}
  function drawMem(M,sp){const lab=sp.label||"Bộ nhớ";
    if(!M||!M.view)return `<div class="vz-one"><div class="vz-lb">${esc(lab)}</div><p class="vz-empty">${M?"Hình này dành cho chương trình C++.":"Bấm Từng bước hoặc Chạy để xem các biến nằm ở đâu trong bộ nhớ."}</p></div>`;
    const want=sp.names?new Set(sp.names):null;VT=new Set();
    const fr=M.view().reverse();   // main ở trên cùng, hàm được gọi sau nằm dưới (stack lớn dần xuống địa chỉ thấp)
    const stack=fr.map(F=>{const vs=F.order.filter(n=>(!want||want.has(n))&&!n.startsWith("__")&&F.vars.get(n)&&!F.vars.get(n).st);
      return `<div class="vm-fr${F.top?" cur":""}"><div class="vm-ft">${esc(F.title)}</div>${vs.length?`<div class="vm-vars">${vs.map(n=>memVar(M,n,F.vars.get(n),!!(F.refs&&F.refs.get(n)))).join("")}</div>`:`<p class="vm-e">(chưa có biến)</p>`}</div>`}).join("");
    /* vùng dữ liệu tĩnh: biến toàn cục và biến static (sống suốt chương trình) */
    const gl=(M.gorder||[]).filter(n=>!want||want.has(n)).map(n=>memVar(M,n,M.globals.get(n)));
    if(M.statics)M.statics.forEach((V,it)=>{if(!want||want.has(it.name))gl.push(memVar(M,"static "+it.name,V))});
    const data=gl.length?`<div class="vm-fr data"><div class="vm-ft">Toàn cục / static</div><div class="vm-vars">${gl.join("")}</div></div>`:"";
    const H=(M.heap||[]).slice(-6);
    const heap=H.length?H.map(B=>{const b=B.heap,A=B.v.a.slice(0,12);VT_OFF=!!b.freed;
      return `<div class="vm-blk${b.freed?" freed":""}${M.wrRoot&&M.wrRoot.has(B)?" w":""}"><div class="vm-ft">#${b.id} · new ${esc(tn(elemT(B.t)))}${b.arr?`[${b.n}]`:""}${b.freed?" · đã delete":""}</div><span class="vm-row">${A.map((c,k)=>c.v&&c.v.f?memObj(M,b.arr?`[${k}]`:"",c,1):memCell(M,c,b.arr?`[${k}]`:"")).join("")}${B.v.a.length>12?`<span class="vm-more">… ${B.v.a.length-12}</span>`:""}</span></div>`}).join(""):`<p class="vm-e">Chưa cấp phát gì bằng new.</p>`;
    VT_OFF=false;const vt=drawVt(M,VT);VT=null;
    return `<div class="vz-one"><div class="vz-lb">${esc(lab)}</div><div class="vz-mem"><div class="vm-col"><div class="vm-h">Stack <small>biến cục bộ, tự hủy khi hết phạm vi</small></div>${data}${stack}</div><div class="vm-col hp"><div class="vm-h">Heap <small>cấp bằng new, trả bằng delete</small></div>${heap}${vt}</div><svg class="vm-svg" aria-hidden="true"></svg></div></div>`}
  /* bảng hàm ảo: mỗi lớp một bảng (dùng chung cho mọi đối tượng của lớp đó); ô đang được gọi sáng lên */
  function drawVt(M,set){if(!set||!set.size)return "";const run=new Set([M.fn]);
    return `<div class="vm-h">Bảng hàm ảo <small>vtable: mỗi lớp một bảng, nằm ở vùng chỉ đọc</small></div>`+[...set].map(key=>{const [id,fam]=key.split("|");const S=vtableOf(id,fam);
      return `<div class="vm-vt" data-a="${vtId(key)}"><div class="vm-ft">vtable ${esc(tn(id))}${fam?` (phần ${esc(tn(fam))})`:""}</div><ol class="vt-rows">${S.map((z,k)=>{const E=z.impl,own=E.cls===id,cur=run.has(E);
        return `<li class="${own?"own":"inh"}${E.pure?" pure":""}${cur?" cur":""}"><span class="vt-k">[${k}]</span><code>${esc(E.kind==="dtor"?"~"+tn(E.cls)+"()":E.name+"()")}</code><span class="vt-to">${E.pure?"= 0 (thuần ảo)":"→ "+esc(tn(E.cls))+"::"+esc(E.kind==="dtor"?"~"+tn(E.cls):E.name)}</span>${E.implicit?`<small>tự sinh</small>`:own?"":`<small>thừa kế</small>`}</li>`}).join("")||'<li class="inh">(không có hàm ảo; bảng chỉ ghi vị trí phần lớp cơ sở ảo)</li>'}</ol></div>`}).join("")}
  /* vẽ mũi tên từ ô con trỏ tới ô nó trỏ (sau khi trình duyệt đã xếp chỗ) */
  function arrows(box){box.querySelectorAll(".vz-mem").forEach(W=>{const svg=W.querySelector(".vm-svg");if(!svg)return;const R=W.getBoundingClientRect();
    if(!R.width){svg.innerHTML="";return}
    svg.setAttribute("viewBox",`0 0 ${R.width} ${R.height}`);svg.setAttribute("width",R.width);svg.setAttribute("height",R.height);
    let h=`<defs><marker id="vm-ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="currentColor"/></marker><marker id="vm-ahv" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="var(--ok)"/></marker></defs>`;
    W.querySelectorAll("[data-to]").forEach(src=>{const t=W.querySelector(`[data-a="${src.dataset.to}"]`);if(!t||t===src)return;
      const a=src.getBoundingClientRect(),b=t.getBoundingClientRect();
      const ax=a.left-R.left,ay=a.top-R.top,bx=b.left-R.left,by=b.top-R.top,acy=ay+a.height/2,bcy=by+b.height/2;let d;
      if(b.left>a.right+12){const x1=ax+a.width,y1=acy,x2=bx,y2=bcy,k=Math.max(24,(x2-x1)/2);d=`M${x1} ${y1} C${x1+k} ${y1} ${x2-k} ${y2} ${x2} ${y2}`}
      else if(b.right<a.left-12){const x1=ax,y1=acy,x2=bx+b.width,y2=bcy,k=Math.max(24,(x1-x2)/2);d=`M${x1} ${y1} C${x1-k} ${y1} ${x2+k} ${y2} ${x2} ${y2}`}
      else{const x1=ax+a.width/2,x2=bx+b.width/2,same=Math.abs(bcy-acy)<a.height/2,up=same||bcy<acy;
        const y1=up?ay:ay+a.height,y2=same?by:up?by+b.height:by,k=same?26:Math.max(20,Math.abs(y2-y1)/2);
        d=`M${x1} ${y1} C${x1} ${up?y1-k:y1+k} ${x2} ${same?y2-k:up?y2+k:y2-k} ${x2} ${y2}`}
      d=d.replace(/-?\d+\.\d+/g,m=>(+m).toFixed(1));
      const vt=src.classList.contains("vptr");
      h+=`<path class="vm-ar${src.dataset.bad?" bad":""}${vt?" vt":""}" d="${d}" marker-end="url(#vm-ah${vt?"v":""})"/>`});
    svg.innerHTML=h})}
  function draw(box,specs,M,o){o=o||{};const list=Array.isArray(specs)?specs:[specs];
    const steps=M?M.cost:0;
    const body=list.map(sp=>sp.type==="grid"?drawGrid(M,sp):sp.type==="vars"?drawVars(M,sp):sp.type==="calls"?drawCalls(M,sp):sp.type==="mem"?drawMem(M,sp):drawSeq(M,sp,o.pick)).join("");
    box.innerHTML=`<div class="vz-h"><b>Hình động</b><span class="vz-st" aria-live="off">${M?`${steps.toLocaleString("vi-VN")} bước`:"chưa chạy"}</span>${o.predict?`<button type="button" class="vz-pred" aria-pressed="${!!o.predOn}">${o.predOn?"✓ Đang đoán trước":"Đoán trước"}</button>`:""}</div>
      ${o.ask?`<div class="vz-ask" role="status"><b>Đoán trước:</b> ${esc(o.ask)}<small>Bấm vào một ô${o.askKind==="swap"?" (chọn 2 ô)":""}, hoặc bấm “Bước tiếp” để bỏ qua.</small></div>`:""}
      ${o.fb?`<div class="vz-fb ${o.fb.ok?"ok":"bad"}" role="status">${esc(o.fb.t)}</div>`:""}
      <div class="vz-body">${body}</div>
      <div class="vz-leg" aria-hidden="true">${list.some(s=>s.type!=="calls")?'<span class="lg r">đang đọc</span><span class="lg w">vừa ghi</span>':""}${list.some(s=>s.type==="mem")?'<span class="lg pa">con trỏ → ô nó trỏ tới</span>':""}${body.includes('class="vm-vt"')?'<span class="lg vt">vptr → bảng hàm ảo</span>':""}${list.some(s=>s.type==="calls")?'<span class="lg tc">đang chạy</span><span class="lg tl">đang chờ</span><span class="lg td">đã trả về</span>':""}${list.some(s=>s.range)?'<span class="lg in">đoạn đang xét</span>':""}${list.some(s=>s.sorted)?'<span class="lg ok">đã đúng chỗ</span>':""}</div>`;
    box.classList.toggle("asking",!!o.ask);
    if(box.querySelector(".vz-mem")){arrows(box);requestAnimationFrame(()=>arrows(box));
      if(!box.__ro&&window.ResizeObserver){box.__ro=new ResizeObserver(()=>arrows(box));box.__ro.observe(box)}}
    const cur=box.querySelector(".vz-tw .vt.cur > .vt-n"),tw=cur&&cur.closest(".vz-tw");if(tw){const y=cur.offsetTop;if(y<tw.scrollTop||y>tw.scrollTop+tw.clientHeight-30)tw.scrollTop=Math.max(0,y-tw.clientHeight/2)}}
  return{draw,look,val}
})();
/* ================= CÔNG CỤ MINH HỌA DÙNG CHUNG CHO KHÓA GIẢI THUẬT =================
   makeGrowth(el, {fns:["logn","n","nlogn","n2","2n"]})   so sánh tốc độ tăng của các hàm độ phức tạp theo n
   makeStepRace(el, {variants:[{label, code}], gen:n=>"dữ liệu", ns:[...], note})   chạy nhiều cách giải bằng trình mô phỏng,
                                                                                   đếm số bước với n tăng dần */
const GROWTH={
  "1":{t:"O(1)",f:()=>1},"logn":{t:"O(log n)",f:n=>Math.max(1,Math.log2(n))},"sqrt":{t:"O(√n)",f:n=>Math.sqrt(n)},
  "n":{t:"O(n)",f:n=>n},"nlogn":{t:"O(n log n)",f:n=>n*Math.max(1,Math.log2(n))},"n2":{t:"O(n²)",f:n=>n*n},"n3":{t:"O(n³)",f:n=>n*n*n},"2n":{t:"O(2ⁿ)",f:n=>Math.pow(2,n)}};
function fmtBig(x){if(!isFinite(x)||x>1e300)return "quá lớn";if(x<1e6)return Math.round(x).toLocaleString("vi-VN");const e=Math.floor(Math.log10(x));return `${(x/Math.pow(10,e)).toFixed(1)}·10^${e}`}
function fmtTime(ops){const s=ops/1e8;if(!isFinite(s)||s>1e15)return "lâu hơn tuổi vũ trụ";if(s<1e-3)return "< 1 ms";if(s<1)return Math.round(s*1000)+" ms";if(s<60)return s.toFixed(1)+" giây";if(s<3600)return Math.round(s/60)+" phút";if(s<86400)return Math.round(s/3600)+" giờ";if(s<3.15e7)return Math.round(s/86400)+" ngày";return fmtBig(s/3.15e7)+" năm"}
function makeGrowth(el,cfg){cfg=cfg||{};const fns=cfg.fns||["logn","n","nlogn","n2","2n"];const NS=cfg.ns||[10,20,50,100,1000,10000,100000,1000000];
  el.classList.add("grw");
  el.innerHTML=`<label class="grw-l"><span>Kích thước dữ liệu n =</span><input type="range" min="0" max="${NS.length-1}" value="${cfg.start??3}" aria-label="Chọn n"><output></output></label>
    <div class="grw-rows" role="list"></div><p class="grw-note">Số phép tính ước lượng và thời gian chạy nếu máy làm khoảng 10<sup>8</sup> phép tính mỗi giây. Thanh dài theo thang logarit: mỗi vạch là gấp 10 lần.</p>`;
  const inp=el.querySelector("input"),out=el.querySelector("output"),rows=el.querySelector(".grw-rows");
  function draw(){const n=NS[+inp.value];out.textContent=n.toLocaleString("vi-VN");
    const vals=fns.map(k=>GROWTH[k].f(n)),mx=Math.log10(Math.max(10,...vals.filter(isFinite).map(v=>Math.min(v,1e30))));
    rows.innerHTML=fns.map((k,i)=>{const v=vals[i],w=Math.max(2,Math.min(100,Math.log10(Math.max(1,Math.min(v,1e30)))/Math.max(1,mx)*100));const slow=v/1e8>1;
      return `<div class="grw-r${slow?" slow":""}" role="listitem"><span class="grw-k">${GROWTH[k].t}</span><span class="grw-b"><span style="width:${w.toFixed(1)}%"></span></span><span class="grw-v">${fmtBig(v)} phép · ${fmtTime(v)}</span></div>`}).join("")}
  inp.addEventListener("input",draw);draw()}
/* bản code theo ngôn ngữ khác cho bảng đua: RACE_X["race-a5"] = {py:[code cách 1, code cách 2, …]} (khai báo trong lesson.js) */
const RACE_X={};
function makeStepRace(el,cfg){el.classList.add("race");const ns=cfg.ns;
  const pick=i=>{const x=typeof LANG_CUR!=="undefined"&&LANG_CUR!=="cpp"&&(RACE_X[el.id]||{})[LANG_CUR];return x&&x[i]?{code:x[i],lang:LANG_CUR}:{code:cfg.variants[i].code,lang:"cpp"}};
  el.innerHTML=`<div class="race-h"><button type="button" class="btn pri race-go">▶ Chạy và đếm bước</button><span class="race-st" role="status" aria-live="polite"></span></div>
    <div class="race-t"></div>${cfg.note?`<p class="race-note">${cfg.note}</p>`:""}`;
  const t=el.querySelector(".race-t"),st=el.querySelector(".race-st");
  function empty(){t.innerHTML=`<p class="race-empty">Bấm nút để chạy ${cfg.variants.length} cách làm với n = ${ns.map(x=>x.toLocaleString("vi-VN")).join(", ")}.</p>`}
  async function go(){st.textContent="Đang chạy…";const res=[];
    for(let vi=0;vi<cfg.variants.length;vi++){const V=pick(vi),Lg=langOf(V.lang);let c;try{c=Lg.compile(V.code)}catch(e){res.push(ns.map(()=>null));continue}
      const row=[];for(const n of ns){await new Promise(r=>setTimeout(r,0));const M=new Lg.Machine(c.prog,V.code,{input:cfg.gen(n),interactive:false});M.snap=false;const r=M.runAll();row.push(r&&r.s==="crash"?{tle:true}:{cost:M.cost,out:M.text().trim()})}res.push(row)}
    const mx=Math.max(1,...res.flat().filter(x=>x&&x.cost).map(x=>x.cost));
    t.innerHTML=`<div class="race-g" style="--c:${ns.length}"><span></span>${ns.map(n=>`<b class="race-n">n = ${n.toLocaleString("vi-VN")}</b>`).join("")}
      ${cfg.variants.map((V,i)=>`<span class="race-lb">${esc(V.label)}</span>${res[i].map(x=>!x?`<span class="race-c">lỗi</span>`:x.tle?`<span class="race-c tle">quá 1 000 000 bước</span>`:`<span class="race-c"><span class="race-bar" style="width:${Math.max(3,x.cost/mx*100).toFixed(1)}%"></span><b>${x.cost.toLocaleString("vi-VN")}</b></span>`).join("")}`).join("")}</div>`;
    st.textContent="Xong: số bước của từng cách làm.";}
  el.querySelector(".race-go").onclick=go;empty();
  document.addEventListener("amts-lang",()=>{empty();st.textContent=""})}
/* ================= CHỌN NGÔN NGỮ LẬP TRÌNH (khóa có nhiều ngôn ngữ, ví dụ Giải thuật) =================
   course.json có "langs": ["cpp","py","cs"]. Học viên chọn một ngôn ngữ cho cả khóa: ví dụ trong trình mô phỏng,
   code mẫu, lời giải, trắc nghiệm riêng và các đoạn chữ riêng (class="lo l-py") đều theo ngôn ngữ đó.
   Lựa chọn lưu trên trình duyệt (amts-lang-<khóa>) và trong tiến độ của tài khoản (courses.<khóa>.lang). */
/* trình mô phỏng Python/C# là file riêng (LANG_SRC, do build ghi), chỉ tải khi học viên chọn ngôn ngữ đó */
const LANG_SRC=typeof LANG_FILES!=="undefined"&&LANG_FILES||{};
const LANG_LIST=((typeof CMETA!=="undefined"&&CMETA.langs)||["cpp"]).filter(l=>LANGS[l]||LANG_SRC[l]);
const LANG_LOADING={};
function ensureLang(l){if(!l||LANGS[l]||!LANG_SRC[l])return Promise.resolve();
  return LANG_LOADING[l]||(LANG_LOADING[l]=new Promise((ok,no)=>{const s=document.createElement("script");s.src=LANG_SRC[l];s.async=false;
    s.onload=()=>LANGS[l]?ok():no(new Error("lang "+l));s.onerror=()=>{delete LANG_LOADING[l];s.remove();no(new Error("Không tải được trình mô phỏng "+l))};document.head.appendChild(s)}))}
const LANG_INFO={
  cpp:{name:"C++",d:"Chạy nhanh, sát với máy. Ngôn ngữ chính của thi học sinh giỏi Tin và ICPC.",ex:"for (int i = 0; i < n; i++)"},
  py:{name:"Python",d:"Ngắn gọn, dễ đọc, dễ bắt đầu. Hay dùng khi phỏng vấn và làm dữ liệu.",ex:"for i in range(n):"},
  cs:{name:"C#",d:"Kiểu dữ liệu chặt chẽ như C++, thư viện đầy đủ. Dùng nhiều trong phần mềm doanh nghiệp, Unity.",ex:"for (int i = 0; i < n; i++)"}};
const LANG_KEY="amts-lang-"+(typeof CID!=="undefined"?CID:"x");
function langStored(){try{const o=JSON.parse(localStorage.getItem(LANG_KEY)||"null");return o&&LANG_LIST.includes(o.l)?o:null}catch(e){return null}}
function langBody(){const b=document.body;if(!b)return;LANG_LIST.concat(["cpp"]).forEach(x=>b.classList.remove("L-"+x));b.classList.add("L-"+LANG_CUR)}
/* đổi ngôn ngữ: lưu, tô lại giao diện, báo cho trình mô phỏng / bài tập / trắc nghiệm */
function LANG_SET(l,opt){opt=opt||{};if(!LANG_LIST.includes(l))l=LANG_LIST[0]||"cpp";
  if(!LANGS[l]){ensureLang(l).then(()=>LANG_SET(l,opt),e=>{console.error(e);paintLang()});return}
  const changed=l!==LANG_CUR;LANG_CUR=l;const at=opt.at||Date.now();
  try{localStorage.setItem(LANG_KEY,JSON.stringify({l,at}))}catch(e){}
  langBody();paintLang();
  if(!opt.fromSync&&window.TRACK&&TRACK.setLang)TRACK.setLang(l,at);
  if(changed)document.dispatchEvent(new Event("amts-lang"))}
/* tiến độ trên máy chủ có lựa chọn mới hơn (học trên thiết bị khác) */
function LANG_FROM_SYNC(l,at){const cur=langStored();if(l&&LANG_LIST.includes(l)&&(!cur||(at||0)>cur.at)){LANG_SET(l,{fromSync:true,at});const d=document.getElementById("lang-dlg");if(d&&d.dataset.first)d.remove()}}
function paintLang(){
  const box=document.getElementById("lang-pick");
  if(box){box.hidden=LANG_LIST.length<2;box.innerHTML=`<span class="lp-l" id="lp-l">Học bằng ngôn ngữ</span><div class="lp-seg" role="group" aria-labelledby="lp-l">${LANG_LIST.map(l=>`<button type="button" data-lang="${l}" aria-pressed="${l===LANG_CUR}">${esc(LANG_INFO[l].name)}</button>`).join("")}</div>`;
    box.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>LANG_SET(b.dataset.lang))}
  const mb=document.getElementById("m-lang");if(mb){mb.hidden=LANG_LIST.length<2;mb.textContent=LANG_INFO[LANG_CUR].name;mb.setAttribute("aria-label",`Ngôn ngữ đang học: ${LANG_INFO[LANG_CUR].name}. Bấm để đổi`)}}
/* hộp chọn ngôn ngữ (lần đầu vào khóa, hoặc bấm nút ngôn ngữ trên thanh đầu trang điện thoại) */
function langDialog(first){
  let d=document.getElementById("lang-dlg");if(d)d.remove();
  d=document.createElement("div");d.id="lang-dlg";d.className="lang-dlg";if(first)d.dataset.first="1";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-labelledby","lang-dlg-h");
  d.innerHTML=`<div class="ld-box"><button type="button" class="ld-x" aria-label="Đóng">×</button>
    <h2 id="lang-dlg-h">${first?"Bạn muốn học khóa này bằng ngôn ngữ nào?":"Đổi ngôn ngữ lập trình"}</h2>
    <p class="ld-sub">Giải thuật thì giống nhau ở mọi ngôn ngữ. Ngôn ngữ bạn chọn được dùng cho ví dụ, bài tập, code mẫu và lời giải.</p>
    <div class="ld-list">${LANG_LIST.map(l=>`<button type="button" class="ld-c${l===LANG_CUR&&!first?" on":""}" data-lang="${l}"><b>${esc(LANG_INFO[l].name)}</b><span>${esc(LANG_INFO[l].d)}</span><code>${esc(LANG_INFO[l].ex)}</code></button>`).join("")}</div>
    <p class="ld-note">Đổi lại lúc nào cũng được: mục <b>Học bằng ngôn ngữ</b> ở danh sách bài học (trên điện thoại: nút tên ngôn ngữ ở đầu trang). Kết quả bài tập đã đạt vẫn được giữ; bản nháp của mỗi ngôn ngữ được lưu riêng.</p></div>`;
  document.body.appendChild(d);
  const close=()=>{d.remove();document.removeEventListener("keydown",esc_);if(first&&!langStored())LANG_SET(LANG_CUR)};
  const esc_=e=>{if(e.key==="Escape")close()};document.addEventListener("keydown",esc_);
  d.querySelector(".ld-x").onclick=close;d.onclick=e=>{if(e.target===d)close()};
  d.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>{LANG_SET(b.dataset.lang);d.remove();document.removeEventListener("keydown",esc_)});
  (d.querySelector(".ld-c.on")||d.querySelector(".ld-c")).focus()}
{const st=langStored();if(st)LANG_CUR=st.l;else if(LANG_LIST.length)LANG_CUR=LANG_LIST.includes("cpp")?"cpp":LANG_LIST[0];
  langBody();
  READY.push(()=>{paintLang();const mb=document.getElementById("m-lang");if(mb)mb.onclick=()=>langDialog(false);
    if(LANG_LIST.length>1&&!langStored())setTimeout(()=>langDialog(true),400)})}
/* Công cụ minh họa dùng chung cho nhiều bài. Công cụ chỉ dùng trong một bài nằm trong lesson.js của bài đó. */
/* ================= WIDGET BÀI 6–8 ================= */
/* Đoán: biên dịch được hay báo lỗi? */
function makeCompileGuess(el,items){
  const pre="#include <iostream>\nusing namespace std;\nint main() {\n";
  el.innerHTML=items.map((it,i)=>`<div class="cg" data-i="${i}">
    <div class="code">${highlightLines(it.code).map((l,k)=>`<span class="ln" data-n="${k+1}">${l||" "}</span>`).join("")}</div>
    <div class="cg-btns"><button class="btn" data-a="ok">Biên dịch được</button><button class="btn" data-a="err">Báo lỗi</button></div>
    <div class="cg-res" aria-live="polite"></div></div>`).join("");
  el.querySelectorAll(".cg").forEach(card=>{const it=items[+card.dataset.i];
    card.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{
      const src=pre+it.code.split("\n").map(l=>"    "+l).join("\n")+"\n}";
      let err=null;try{compile2(src)}catch(e){if(e instanceof E2)err=e;else throw e}
      const truth=err?"err":"ok",right=b.dataset.a===truth;
      card.querySelectorAll("[data-a]").forEach(x=>{x.disabled=true;x.classList.toggle("pick-ok",x.dataset.a===truth);x.classList.toggle("pick-bad",x===b&&!right)});
      const r=card.querySelector(".cg-res");r.className="cg-res "+(right?"ok":"bad");
      r.innerHTML=`<b>${right?"Đúng.":"Chưa đúng."}</b> ${err?`Trình biên dịch báo: <code>${esc(err.message)}</code><span>${esc(err.vi)}</span>`:`Đoạn code hợp lệ.${it.why?` <span>${esc(it.why)}</span>`:""}`}`});
  });
}

/* Cây biểu thức tính từng bước (hỗ trợ ngắn mạch &&, ||, toán tử ?:, gán, ++/--) */
function makeExprTree(el,opts={}){
  const P=opts.id||"et";
  const DECL=opts.decl||[["int","a","7"],["int","b","2"],["double","x","1.5"]];
  const EX=opts.examples||["2 + 3 * 4","(2 + 3) * 4","20 - 6 - 4","7 / 2 * 2.0","7.0 / 2 * 2","a / b * b + a % b","-a % b","x * 2 + a / 4","a * 100 / 3","2 ^ 3"];
  const INIT=opts.initial||"7 / 2 * 2.0";
  el.innerHTML=`<div class="et-vars">${DECL.map(d=>`<code>${esc(d[0])} ${esc(d[1])} = ${esc(d[2])};</code>`).join("")}</div>
   <label class="stdin-row"><span>Biểu thức</span><input id="${P}-in" value="${esc(INIT)}" spellcheck="false" autocomplete="off"></label>
   <div class="chips">${EX.map(x=>`<button class="chip-btn" data-x="${esc(x)}">${esc(x)}</button>`).join("")}</div>
   ${opts.fullParen?`<div class="et-full" id="${P}-full"></div>`:""}
   <div class="et-svg" id="${P}-svg"></div>
   <div class="et-lines" id="${P}-lines"></div>
   <div class="pipe-ctl"><button class="btn" id="${P}-prev">← Lùi</button><button class="btn pri" id="${P}-next">Tính bước tiếp</button><button class="btn" id="${P}-all">Tính hết</button><button class="btn" id="${P}-reset">Làm lại</button><span class="crumb" id="${P}-k"></span></div>`;
  const $=s=>el.querySelector("#"+P+"-"+s);
  const inp=$("in");let S=null,cnt=0;
  const NAME={"+":"+","-":"−","*":"×","/":"÷","%":"%","^":"^","&":"&","|":"|","&&":"&&","||":"||","==":"==","!=":"!=","<":"<","<=":"≤",">":">",">=":"≥","<<":"<<",">>":">>"};
  const KIDS=n=>n.k==="bin"?[n.a,n.b]:n.k==="un"||n.k==="cast"||n.k==="pre"||n.k==="post"?[n.a]:n.k==="cond"?[n.c,n.a,n.b]:n.k==="as"?[n.a,n.b]:[];
  const inner=n=>KIDS(n).length>0;
  const vtxt=V=>{if(!V)return"?";if(V.t==="double"||V.t==="float"){const s=gfmt(V.v,6);return /[.e]|inf|nan/.test(s)?s:s+".0"}if(V.t==="bool")return V.v?"true":"false";if(V.t==="char")return`'${String.fromCharCode(((V.v%256)+256)%256)}'`;if(V.t==="cstr"||V.t==="string")return JSON.stringify(V.v);return llStr(V.v)};
  const hasIO=n=>!!n&&typeof n==="object"&&((n.k==="bin"&&n.io)||KIDS(n).some(hasIO));
  function build(){
    cnt=0;
    const expr=inp.value.trim();
    const src=`#include <iostream>\n#include <cmath>\n#include <string>\nint main() {\n${DECL.map(d=>`${d[0]} ${d[1]} = ${d[2]};`).join("\n")}\n${expr};\n}`;
    try{
      if(!expr)throw new E2(0,"Hãy nhập một biểu thức","Ví dụ: a + b * 2");
      const c=compile2(src);const st=c.prog.main[DECL.length];
      if(!st||st.k!=="expr")throw new E2(0,"Chỉ nhập một biểu thức, không khai báo biến","Ví dụ: a > 0 && b > 0");
      const root=st.e;if(hasIO(root))throw new E2(0,"Cây biểu thức không vẽ cout / cin","Hãy nhập biểu thức tính toán, ví dụ (a + b) * 2.");
      const M=new M2(c.prog,src,{interactive:false});for(let k=0;k<DECL.length;k++)M.step();
      const par=new Map(),val=new Map(),order=[];
      (function walk(n){KIDS(n).forEach(k=>{par.set(k,n);walk(k)});if(inner(n))order.push(n);else val.set(n,M.ev(n))})(root);
      S={root,par,val,order,M,k:0,lines:[],note:"",err:null,warn:c.warns.map(w=>w.msg),fx:hasFx(root)};
      S.lines.push(pr(root,0));render();
      if(opts.fullParen)$("full").innerHTML=`Đặt ngoặc đầy đủ theo thứ tự ưu tiên: <code>${esc(full(root,true))}</code>`;
    }catch(e){if(!(e instanceof E2)&&!(e instanceof RunErr))throw e;S=null;
      $("svg").innerHTML=`<p class="et-err"><b>Lỗi biên dịch:</b> ${esc(e.message||e.msg)}<br>${esc(e.vi||"")}</p>`;$("lines").innerHTML="";$("k").textContent="";
      if(opts.fullParen)$("full").innerHTML="";
      ["next","all"].forEach(s=>$(s).disabled=true)}
  }
  const hasFx=n=>!!n&&typeof n==="object"&&(n.k==="as"||n.k==="pre"||n.k==="post"||KIDS(n).some(hasFx));
  /* nút n có nằm trong nhánh bị bỏ qua (ngắn mạch) không? */
  function skipped(n){let cur=n;
    while(S.par.has(cur)){const A=S.par.get(cur);
      if(A.k==="bin"&&(A.op==="&&"||A.op==="||")&&cur===A.b&&S.val.has(A.a)){const l=!!S.val.get(A.a).v;if((A.op==="&&"&&!l)||(A.op==="||"&&l))return A}
      if(A.k==="cond"&&cur!==A.c&&S.val.has(A.c)){const y=!!S.val.get(A.c).v;if((cur===A.a&&!y)||(cur===A.b&&y))return A}
      cur=A}
    return null}
  function prec(n){return n.k==="bin"?PREC[n.op]:n.k==="cond"?5:n.k==="as"?2:n.k==="post"?95:90}
  function pr(n,pp,right){
    if(S&&S.val.has(n)&&inner(n))return `<mark>${esc(vtxt(S.val.get(n)))}</mark>`;
    const p=prec(n);let s;
    switch(n.k){
      case "num":return esc(n.raw||String(n.v));case "name":return esc(n.n);case "str":return esc(JSON.stringify(n.v));
      case "chr":case "bool":return esc(vtxt(S.val.get(n)));
      case "call":return esc(n.f)+"("+n.args.map(x=>pr(x,0)).join(", ")+")";
      case "un":s=esc(n.op)+pr(n.a,90);break;
      case "pre":s=esc(n.op)+pr(n.a,90);break;
      case "post":s=pr(n.a,95)+esc(n.op);break;
      case "cast":s=`static_cast&lt;${esc(n.ty.t)}&gt;(${pr(n.a,0)})`;break;
      case "bin":s=`${pr(n.a,p)} ${esc(n.op)} ${pr(n.b,p,true)}`;if(p<pp||(right&&p===pp))s=`(${s})`;return s;
      case "cond":s=`${pr(n.c,6)} ? ${pr(n.a,0)} : ${pr(n.b,5)}`;if(p<pp)s=`(${s})`;return s;
      case "as":s=`${pr(n.a,3)} ${esc(n.op)} ${pr(n.b,2)}`;if(p<pp)s=`(${s})`;return s;
      default:return "…"}
    if(p<pp)s=`(${s})`;return s}
  function full(n,top){
    const w=s=>top?s:`(${s})`;
    switch(n.k){
      case "num":return n.raw||String(n.v);case "name":return n.n;case "str":return JSON.stringify(n.v);
      case "chr":return vtxt({t:"char",v:n.v});case "bool":return n.v?"true":"false";
      case "call":return n.f+"("+n.args.map(x=>full(x,true)).join(", ")+")";
      case "un":return w(n.op+full(n.a));case "pre":return w(n.op+full(n.a));case "post":return w(full(n.a)+n.op);
      case "cast":return `static_cast<${n.ty.t}>(${full(n.a,true)})`;
      case "bin":return w(`${full(n.a)} ${n.op} ${full(n.b)}`);
      case "cond":return w(`${full(n.c)} ? ${full(n.a)} : ${full(n.b)}`);
      case "as":return w(`${full(n.a)} ${n.op} ${full(n.b)}`);
      default:return "…"}}
  function compute(n){const M=S.M,V=x=>S.val.get(x);
    if(n.k==="bin"){
      if(n.op==="&&"){const a=V(n.a);return a.v?{t:"bool",v:V(n.b).v?1:0}:{t:"bool",v:0}}
      if(n.op==="||"){const a=V(n.a);return a.v?{t:"bool",v:1}:{t:"bool",v:V(n.b).v?1:0}}
      return M.arith(n.op,V(n.a),V(n.b))}
    if(n.k==="un")return M.unop(n.op,V(n.a));
    if(n.k==="cast")return{t:n.ty.t,v:M.conv(V(n.a),n.ty.t)};
    if(n.k==="cond"){const y=!!V(n.c).v,br=V(y?n.a:n.b);return n.rt==="string"||n.rt==="cstr"?{t:n.rt,v:br.v}:{t:n.rt,v:M.conv(br,n.rt)}}
    if(n.k==="as"){const X=M.vars.get(n.a.n);let r=V(n.b);if(n.op!=="=")r=M.arith(n.op.slice(0,-1),{t:X.t,v:X.v},r);X.v=M.conv(r,X.t);X.init=true;return{t:X.t,v:X.v}}
    if(n.k==="pre"||n.k==="post"){const X=M.vars.get(n.a.n),old=X.v;X.v=X.t==="bool"?(n.op==="++"?1:0):wrapTo(X.t,typeof old==="bigint"?old+(n.op==="++"?1n:-1n):old+(n.op==="++"?1:-1));return{t:X.t,v:n.k==="pre"?X.v:old}}
    return M.ev(n)}
  function stepOnce(){if(!S||S.k>=S.order.length||S.err)return;S.note="";
    while(S.k<S.order.length&&skipped(S.order[S.k])){const A=skipped(S.order[S.k]);S.k++;
      S.note=A.k==="cond"?"Nhánh không được chọn của ?: không được tính.":`Ngắn mạch: vế trái của ${A.op} đã quyết định kết quả nên vế phải không được tính.`}
    if(S.k>=S.order.length){render();return}
    const n=S.order[S.k];
    try{const r=compute(n);S.val.set(n,r);S.k++;S.cur=n;S.lines.push(pr(S.root,0));
      if(n.k==="bin"&&(n.op==="&&"||n.op==="||")){const l=!!S.val.get(n.a).v;if((n.op==="&&"&&!l)||(n.op==="||"&&l))S.note=`Ngắn mạch: vế trái của ${n.op} là ${l?"true":"false"} nên kết quả là ${l?"true":"false"}, không cần tính vế phải.`}
    }catch(e){if(e instanceof RunErr){S.err=e;S.cur=n}else throw e}
    render()}
  function layout(root){let leaf=0;const pos=new Map();let depth=0;
    (function go(n,d){depth=Math.max(depth,d);const ks=KIDS(n);
      if(!ks.length){pos.set(n,{x:leaf++,y:d});return}
      ks.forEach(k=>go(k,d+1));const xs=ks.map(k=>pos.get(k).x);pos.set(n,{x:(Math.min(...xs)+Math.max(...xs))/2,y:d})})(root,0);
    return{pos,leaves:leaf,depth}}
  function label(n){if(n.k==="bin")return NAME[n.op]||n.op;if(n.k==="un")return n.op==="-"?"−":n.op;if(n.k==="cast")return`(${n.ty.t})`;if(n.k==="cond")return"? :";if(n.k==="as")return n.op;
    if(n.k==="pre")return n.op+(n.a.n||"");if(n.k==="post")return(n.a.n||"")+n.op;if(n.k==="name")return n.n;if(n.k==="call")return n.f+"()";return vtxt(S.val.get(n))}
  function render(){
    const {pos,leaves,depth}=layout(S.root);const CW=92,RH=78,W=Math.max(leaves*CW,260),H=(depth+1)*RH+10;
    const X=p=>p.x*CW+CW/2+(W-leaves*CW)/2,Y=p=>p.y*RH+34;
    let lines="",nodes="";
    pos.forEach((p,n)=>{KIDS(n).forEach(k=>{const q=pos.get(k);lines+=`<line x1="${X(p)}" y1="${Y(p)+18}" x2="${X(q)}" y2="${Y(q)-20}" stroke="var(--line)" stroke-width="1.5"/>`})});
    pos.forEach((p,n)=>{const isIn=inner(n);const v=S.val.get(n);const cur=S.cur===n;const sk=!!skipped(n);const pending=isIn&&!v;
      const cls=sk?"skip":cur?(S.err?"err":"cur"):pending?"pend":isIn?"done":"leaf";
      const lab=label(n),showV=isIn&&v&&!sk;
      nodes+=`<g class="tn ${cls}"><rect x="${X(p)-38}" y="${Y(p)-20}" width="76" height="38" rx="${isIn?19:7}"/>
        <text x="${X(p)}" y="${Y(p)+(showV?-3:5)}" class="lab${showV?" small":""}">${esc(lab)}</text>
        ${showV?`<text x="${X(p)}" y="${Y(p)+12}" class="val">${esc(vtxt(v))}</text>`:""}
        ${sk?`<text x="${X(p)}" y="${Y(p)+32}" class="ty">bỏ qua</text>`:v?`<text x="${X(p)}" y="${Y(p)+32}" class="ty">${esc(tn(v.t))}${n.k==="name"?" · "+esc(vtxt(v)):""}</text>`:""}</g>`});
    $("svg").innerHTML=`<svg viewBox="0 0 ${W} ${H}" style="min-width:${Math.min(W,560)}px" role="img" aria-label="Cây biểu thức">${lines}${nodes}</svg>`;
    const fin=S.k>=S.order.length;const R=S.val.get(S.root);
    const vars=S.fx&&fin?`<p class="et-done">Giá trị biến sau khi tính: ${DECL.map(d=>`<code>${esc(d[1])} = ${esc(vtxt(S.M.vars.get(d[1])))}</code>`).join(" ")}</p>`:"";
    $("lines").innerHTML=S.lines.map((l,i)=>`<div><span>${i?"=":"&nbsp;"}</span><code>${l}</code></div>`).join("")+
      (S.note?`<p class="et-note">${esc(S.note)}</p>`:"")+
      (S.err?`<p class="et-err"><b>${esc(S.err.msg)}</b><br>${esc(S.err.vi)}</p>`:fin&&R?`<p class="et-done">Kết quả: <b>${esc(vtxt(R))}</b>, kiểu <code>${esc(tn(R.t))}</code>${R.t==="double"?`. <code>cout</code> sẽ in <code>${esc(gfmt(R.v,6))}</code>`:R.t==="bool"?`. <code>cout</code> in <code>${R.v}</code> (hoặc <code>${R.v?"true":"false"}</code> nếu dùng boolalpha)`:""}.</p>`:"")+vars+
      (S.warn.length?`<p class="et-warn">Cảnh báo của trình biên dịch: <code>${esc(S.warn[0])}</code></p>`:"");
    const comp=S.order.filter(n=>S.val.has(n)).length,skc=S.order.filter(n=>skipped(n)).length;
    $("k").textContent=S.order.length?`Đã tính ${comp} / ${S.order.length} phép${skc?` · bỏ qua ${skc}`:""}`:"Không có phép tính nào";
    $("next").disabled=fin||!!S.err;$("all").disabled=fin||!!S.err;$("prev").disabled=cnt<=0}
  $("next").onclick=()=>{cnt++;stepOnce()};
  $("all").onclick=()=>{let g=0;while(S&&S.k<S.order.length&&!S.err&&g++<200){cnt++;stepOnce()}};
  $("prev").onclick=()=>{if(cnt<=0)return;const t=cnt-1;build();for(let i=0;i<t;i++){cnt++;stepOnce()}};
  $("reset").onclick=build;
  let t;inp.addEventListener("input",()=>{clearTimeout(t);t=setTimeout(build,350)});
  el.querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>{inp.value=b.dataset.x;build()});
  build();
}
/* Vết đường chạy: chạy thật chương trình, đánh dấu các dòng đã chạy theo thứ tự */
function makeLineRun(el,{id,variants,values,label}){
  let vi=0,val=values[Math.min(2,values.length-1)];
  el.innerHTML=`<div class="lr-top"><div class="seg" role="group" aria-label="Phiên bản">${variants.map((v,i)=>`<button data-v="${i}" aria-pressed="${i===0}">${esc(v.label)}</button>`).join("")}</div>
    <div class="lr-vals" role="group" aria-label="${esc(label)}"><span>${esc(label)}</span>${values.map(v=>`<button class="chip-btn" data-x="${esc(String(v))}">${esc(String(v))}</button>`).join("")}</div></div>
    <div class="lr-body"><div class="code lr-code"></div><div class="lr-side"><div class="pane-h" style="padding:0">Thứ tự các dòng đã chạy</div><div class="lr-path"></div><div class="pane-h" style="padding:0">Console</div><pre class="lr-out"></pre></div></div>`;
  function render(){
    const v=variants[vi];const src=v.code.replace(/\{\{N\}\}/g,String(val));
    el.querySelectorAll("[data-v]").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.v===vi)));
    el.querySelectorAll("[data-x]").forEach(b=>b.classList.toggle("sel",b.dataset.x===String(val)));
    let c;try{c=compile2(src)}catch(e){el.querySelector(".lr-path").textContent=e.message;return}
    const M=new M2(c.prog,src,{interactive:false});const seq=[];let r;
    for(let k=0;k<400;k++){r=M.step();if(r.line)seq.push(r.line);if(r.s!=="ran")break}
    const order=new Map();seq.forEach((l,i)=>{if(!order.has(l))order.set(l,[]);order.get(l).push(i+1)});
    const L=highlightLines(src);
    el.querySelector(".lr-code").innerHTML=L.map((s,i)=>{const o=order.get(i+1);return `<span class="ln${o?" hl":" dim"}" data-n="${i+1}">${s||" "}${o?`<b class="lr-badge">${o.slice(0,4).join(",")}${o.length>4?"…":""}</b>`:""}</span>`}).join("");
    el.querySelector(".lr-path").innerHTML=seq.map(l=>`<span>${l}</span>`).join("<i>→</i>");
    el.querySelector(".lr-out").textContent=M.text()||"(không in gì)";
  }
  el.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{vi=+b.dataset.v;render()});
  el.querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>{val=b.dataset.x;render()});
  render();
}
/* Ngăn xếp lời gọi: chạy từng bước, xem khung được đặt lên và gỡ xuống */
function makeCallStack(el,{variants}){
  let vi=0,snaps=[],k=0;
  el.innerHTML=`<div class="seg cs-seg" role="group" aria-label="Ví dụ">${variants.map((v,i)=>`<button data-v="${i}" aria-pressed="${i===0}">${esc(v.label)}</button>`).join("")}</div>
    <div class="cs-body"><div class="code cs-code"></div>
      <div class="cs-side"><div class="pane-h" style="padding:0"><span>Ngăn xếp lời gọi (stack)</span><span class="cs-depth"></span></div>
        <div class="cs-stack"></div><p class="cs-ev" aria-live="polite"></p>
        <div class="pane-h" style="padding:0">Console</div><pre class="lr-out cs-out"></pre></div></div>
    <div class="cs-ctl"><button class="btn cs-prev" aria-label="Lùi một bước">←</button><input type="range" class="cs-r" min="0" value="0" aria-label="Chọn bước"><span class="cs-k"></span><button class="btn pri cs-next">Bước tiếp →</button></div>`;
  const $=s=>el.querySelector(s),R=$(".cs-r");
  function build(){const v=variants[vi];
    el.querySelectorAll("[data-v]").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.v===vi)));
    const c=compile2(v.code);const M=new M2(c.prog,v.code,{input:v.input||"",interactive:false});snaps=[];
    const snap=(line,ev,ch)=>snaps.push({line,ev,out:M.text(),frames:M.view().map(F=>({title:F.title,top:F.top,line:F.line,
      vars:F.order.map(n=>{const V=F.vars.get(n),rf=F.refs&&F.refs.get(n);return{n,v:showVal(V),addr:V.addr,ref:rf,ch:F.top&&ch&&ch.has(n)}})}))});
    snap(M.nextLine(),"Chương trình bắt đầu: hệ điều hành gọi <code>main()</code>. Ngăn xếp có một khung.");
    for(let g=0;g<500;g++){const r=M.step();if(r.s==="need")break;
      let ev;
      if(r.kw==="call")ev=`Gọi <code>${esc(M.title)}</code>: một khung mới được đặt lên <b>đỉnh</b> stack, đối số được chép vào tham số${M.refs.size?" (tham số tham chiếu thì gắn thẳng vào biến gốc)":""}. Hàm gọi tạm dừng ở dòng ${r.line}.`;
      else if(r.kw==="ret")ev=`<code>${esc(r.fn)}()</code> chạy xong${r.rv&&r.rv.t!=="void"?`, trả về <b>${esc(M.argTxt(r.rv))}</b>`:""}. Khung của nó bị gỡ khỏi stack, biến cục bộ của nó biến mất.`;
      else if(r.s==="crash")ev=`<b class="bad-t">${esc(M.crash.msg)}</b> ${esc(M.crash.vi)}`;
      else ev=`Chạy dòng ${r.line}${r.cond!==undefined&&r.kw?`: điều kiện ${r.cond?"đúng":"sai"}`:""}.`;
      if(M.done&&r.s!=="crash")ev+=" <code>main()</code> kết thúc, chương trình dừng.";
      snap(M.done?0:M.nextLine(),ev,r.ch);if(r.s!=="ran")break}
    k=0;R.max=snaps.length-1;render()}
  function render(){const S=snaps[k],v=variants[vi];
    const wait=new Set(S.frames.filter(f=>!f.top).map(f=>f.line));
    $(".cs-code").innerHTML=highlightLines(v.code).map((s,i)=>`<span class="ln${i+1===S.line?" hl":wait.has(i+1)?" wait":""}" data-n="${i+1}">${s||" "}</span>`).join("");
    $(".cs-stack").innerHTML=S.frames.map(F=>`<div class="csf${F.top?" top":""}"><div class="csf-h"><b>${esc(F.title)}</b><span>${F.top?(S.frames.length>1?"đỉnh · đang chạy":"đang chạy"):`chờ ở dòng ${F.line}`}</span></div>${F.vars.length?`<div class="csf-v">${F.vars.map(x=>`<div class="${x.ref?"ref":""}${x.ch?" chg":""}"><code>${esc(x.n)}</code><b>${x.v}</b><small>${x.ref?`↔ ${esc(x.ref)}`:"0x"+x.addr.toString(16)}</small></div>`).join("")}</div>`:`<div class="csf-e">chưa có biến</div>`}</div>`).join("");
    $(".cs-depth").textContent=`${S.frames.length} khung`;
    $(".cs-ev").innerHTML=S.ev;$(".cs-out").textContent=S.out||" ";
    R.value=k;$(".cs-k").textContent=`${k} / ${snaps.length-1}`;$(".cs-prev").disabled=k===0;$(".cs-next").disabled=k>=snaps.length-1}
  $(".cs-prev").onclick=()=>{if(k>0){k--;render()}};
  $(".cs-next").onclick=()=>{if(k<snaps.length-1){k++;render()}};
  R.addEventListener("input",()=>{k=+R.value;render()});
  el.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{vi=+b.dataset.v;build()});
  build();
}
/* ---------- khởi động: tải phần bài học (bản site) sau khi có trình mô phỏng của ngôn ngữ đang chọn ---------- */
if(COURSE_BODY_SRC){const go=()=>{const s=document.createElement("script");s.src=COURSE_BODY_SRC;s.async=false;
    s.onerror=()=>{const p=document.createElement("p");p.className="boot-err";p.setAttribute("role","alert");p.textContent="Chưa tải được trang (mạng chập chờn). Hãy tải lại trang.";document.body.prepend(p)};
    document.head.appendChild(s)};
  ensureLang(LANG_CUR).catch(e=>{console.error(e);LANG_CUR="cpp";langBody()}).then(go)}
