import I18NUtil from "./I18NUtil";
try {
	module.exports = require("./reactjs-tag.i18n." + I18NUtil.getSystemI18N());
} catch(exception) {
	console.error("i18n file read error.");
	module.exports = require("./reactjs-tag.i18n.en_US");
}
