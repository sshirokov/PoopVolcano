module.exports.$0 = $0;

//Lightly adapted from https://github.com/substack/node-optimist
function $0() {
    var cwd = process.cwd();
    return (
        process.argv
            .slice(0,2)
            .map(function (x) {
                     var b = require('helpers').path.rebase(cwd, x);
                     return x.match(/^\//) &&
                         b.length < x.length ? b : x;
                 })
            .join(' ')
    );
}