const logger = (...message) => {
    const time = new Date();
    const [hour, minutes, seconds] = [time.getHours(), time.getMinutes(), time.getSeconds()];
    const ddHour = hour < 10 ? "0" + hour : hour;
    const ddMinutes = minutes < 10 ? "0" + minutes : minutes;
    const ddSeconds = seconds < 10 ? "0" + seconds : seconds;
    const timeInformation = "[ " + ddHour + ":" + ddMinutes + "." + ddSeconds + " ] ::: ";
    console.log(timeInformation, ...message);
}

export default logger;