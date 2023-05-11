var os = require('os');

//devuelve el IP donde esta corriendo ServerMonitor
function getIp(){
    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }
    return(addresses);
}

module.exports = {
    getIp
}