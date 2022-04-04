/**
 * Initialise log4js first, so we don't miss any log messages
 */
let log4js = require('log4js');
let today = new Date();
let hours = today.getUTCHours(); 
let minutes = today.getUTCMinutes(); 
let seconds = today.getUTCSeconds(); 
let timeString: string = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0'); 
  
let file: string = "_log/sport-meetings-debug_" + String(today.getDate()).padStart(2, '0') + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + today.getFullYear() + "_" + timeString + ".log";
log4js.configure({
    "appenders": {
        "app": {
            "type": "file",
            "filename": file,
            "keepFileExt": true,
            "layout": {
                "type": "basic",
                "pattern": '%d %[%p%] -- %X{user} %f{1} [line %l] -- %m%n'
            },
            "flags": "w"
        },
        "errors": {
            "type": "stderr",
            "level": "ERROR",
            "appender": "app",
            "layout": {
                "type": "basic",
                "pattern": '%d %[%p%] -- %X{user} %f{1} [ %l ]%m%n'
            },
            "flags": "w"
        }
    },
    "categories": {
        "default": {
            "appenders": ["app", "errors"],
            "level": "DEBUG",
            "enableCallStack": true
        }

    }
});

export default log4js;