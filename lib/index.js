var loader = new require('./helpers/loader').PathLoader();

//Adjust path
loader.
    use(__dirname).
    scan_dir();