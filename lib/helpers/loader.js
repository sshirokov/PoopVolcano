var fs = require('fs'),
    path = require('path');

exports.PathLoader = function(base) {
    var loader = this;
    base = base || __dirname;

    this.registry = [];

    this.use = function(dir) {
        require.paths.unshift(dir || base);
        if(dir) base = dir;
        return loader;
    };

    this.add_path = function(full_path) {
        var add = function(path) { require.paths.unshift(path); },
        meta = undefined;

        try {
            meta = JSON.parse(fs.readFileSync(path.join(full_path, "package.json")) + "");
        } catch(e) { }

        if(meta && meta.name) {
            if(loader.registry.indexOf(meta.name) != -1) return;
            else loader.registry.unshift(meta.name);
        }

        try {
            add(full_path);
            if(fs.statSync(path.join(full_path, "lib")).isDirectory())
                add(path.join(full_path, "lib"));
        } catch(e) { }
    };

    this.scan_dir = function(dir) {
        var self = arguments.callee;
        self.chain = self.chain || [];
        dir = dir || base;

        fs.readdirSync(dir).forEach(function(p) {
                                        var full_path = path.join(dir, p),
                                        info = fs.statSync(full_path);

                                        if(info.isDirectory()) loader.add_path(full_path);

                                        if(p == "vendor")
                                            self.chain.push(path.join(full_path));

                                        try {
                                            if(fs.statSync(path.join(full_path, "support")).isDirectory())
                                                self.chain.push(path.join(full_path, "support"));
                                        } catch(e) { }
                                    });

        if(self.chain.length) self(self.chain.shift());
    };

    return this;
}
