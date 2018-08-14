let didEventOccur = function (tx, event) {
    for (var logIndex = 0; logIndex < tx.logs.length; logIndex++) {
        var log = tx.logs[logIndex];
        return  JSON.stringify(log.args) === JSON.stringify(event);
    }
    return false;
}

export default didEventOccur
