// Thanks to https://ethereum.stackexchange.com/questions/48627/how-to-catch-revert-error-in-truffle-test-javascript
module.exports.errTypes = {
    revert            : "revert",
    outOfGas          : "out of gas",
    invalidJump       : "invalid JUMP",
    invalidOpcode     : "invalid opcode",
    stackOverflow     : "stack overflow",
    stackUnderflow    : "stack underflow",
    staticStateChange : "static state change"
}

module.exports.tryCatch = async function(promise, errType) {
    try {
        await promise;
        throw null;
    }
    catch (error) {
        assert(error, "Expected an error but did not get one");
        assert(error.message.startsWith(PREFIX + errType), "Expected an error starting with '" + PREFIX + errType + "' but got '" + error.message + "' instead");
    }
};

const PREFIX = "VM Exception while processing transaction: ";
