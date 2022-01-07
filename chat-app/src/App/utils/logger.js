const logger = (...message) => {
    const time = new Date();
    const [hour, minutes, seconds, milliseconds] = [time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds()];
    const ddHour = hour < 10 ? "0" + hour : hour;
    const ddMinutes = minutes < 10 ? "0" + minutes : minutes;
    const ddSeconds = seconds < 10 ? "0" + seconds : seconds;
    const mseconds = milliseconds < 10 ?  "00" + milliseconds : milliseconds < 100 ? "0" + milliseconds : milliseconds;
    const timeInformation = "[ " + ddHour + ":" + ddMinutes + "." + ddSeconds + "." + mseconds + " ] ::: ";
    console.log(timeInformation, ...message);
}

export default logger;