import config from 'config';

module.exports = {

    getSystemI18N() {
        let systemI18N = localStorage.getItem(config.DEFAULT_LOCALSTORAGE_I18NKEY);
        if(systemI18N){
            return systemI18N;
        }else{
            this.setSystemI18N(config.DEFAULT_SYSTEM_I18N);
            return config.DEFAULT_SYSTEM_I18N;
        }
    },

    setSystemI18N (value) {
        localStorage.setItem(config.DEFAULT_LOCALSTORAGE_I18NKEY, value);
    },

    /**@ignore
     * I18N format message
     */
    format(message, ...args) {
        $.each(args, function (index, element) {
            message = message.replace("{" + index + "}", element);
        });

        return message;
    },
    /**@ignore
     * I18N format object message
     */
    formatObject(message, ...args) {
        var elementArray = [];
        $.each(args, function (index, element) {
            var msgArray = message.split("{" + index + "}");

            if (msgArray.length == 2) {
                elementArray.push(msgArray[0]);
                elementArray.push(element);
                message = msgArray[1];
            }
        });
        elementArray.push(message);
        return elementArray;
    },
    /**@ignore
     * Get i18n message
     */
    getMessage(message) {
        if (message == null || message == undefined) {
            return "MSG Not Found";//i18n.MSG_NOT_FOUND;
        }

        return message;
    }

}
 


    

    

    