const moment = require('moment');

const invalid = () => {
    return "INVALID";
}

const getPeriod = (date) => {
    //const result = moment(date).subtract(1, 'hours').format("MM-YYYY");
    const result = moment(date).format("MM-YYYY");
    console.log(result);
    return result;
}

const validatePeriod = (period) => {
    let result = "";
    const now = moment();
    const momPeriod = moment(period, "MM-YYYY"); //.add(1, 'months');
    result = (momPeriod.isValid()) ? momPeriod.format(global.gConfig.timeFormat) : invalid();
    if (momPeriod.diff(now, 'days') > 31) result = invalid();
    console.log(result);
    return result;
}

const getDateTime = (date) => {
    //formatea la salida de la fecha 
    const fullFecha = moment(date, "DD-MM-YYYY");
    const fullTime = moment(date, "HH:mm:SS");
    return {fecha: fullFecha, hora: fullTime};
}

module.exports = {
    invalid,
    getPeriod,
    validatePeriod,
    getDateTime
}