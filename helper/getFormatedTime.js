 function getFormateTime() {
    const d =  new Date();
    var hour = d.getHours();
    var minute = d.getMinutes();
    var ampm = hour >= 12 ? 'PM' : 'AM';
    var strTime = `${hour}:${minute} ${ampm}`;
    return strTime;
 }

 module.exports = getFormateTime();