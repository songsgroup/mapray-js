// webpack configuration object
// see https://webpack.github.io/docs/configuration.html

var path = require( "path" );
var outdir = "dist";

// configuration for mapray library
mapray_config = (env, args) => {

    console.log('env ' + env);
    console.log('mode:' + args.mode);

    var fsuffix = ( args.mode == "production" ) ? "" : "-dev";

    return {
        // base directory for resolving the entry option
        context: path.join( __dirname, "src" ),

        // entry point for the bundle
        entry: "./index.js",

        devtool: args.mode === "development" ? "source-map" : "none",

        // options affecting the output of the compilation
        output: {
            // output directory as an absolute path (required)
            path: path.join( __dirname, outdir ),

            // specifies the name of each output file on disk
            filename: "mapray" + fsuffix + ".js",
            library: "mapray",
            libraryTarget: "umd",
            umdNamedDefine: true,
            globalObject : 'this'
        },

        // options affecting the normal modules (NormalModuleFactory)
        module: {
            // array of automatically applied loaders
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        }
                    ]
                },
                {
                    test: /\.(vert|frag|glsl)$/,
                    loader: 'raw-loader'
                }
            ]
        }
    }
};


// configuration for tests
var tests_config = (env, args) => {

    return {
        // base directory for resolving the entry option
        context: path.join( __dirname, "src" ),

        // entry point for the bundle
        entry: "./tests/index.js",

        // options affecting the output of the compilation
        output: {
            // output directory as an absolute path (required)
            path: path.join( __dirname, outdir ),

            // specifies the name of each output file on disk
            filename: "tests.js"
        },

        // options affecting the normal modules (NormalModuleFactory)
        module: {
            // array of automatically applied loaders
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
                                presets: [
                                    "@babel/preset-env", {
                                        "targets": { "chrome": 75 } 
                                    } 
                                ]
                            }
                        }
                    ]
                }
            ]
        }
    }
};

module.exports = (env, args) => {
    switch ( env && env.NODE_ENV ) {
        case "tests":
            return tests_config(env, args);
            break;
    }
    return mapray_config(env, args);
}

