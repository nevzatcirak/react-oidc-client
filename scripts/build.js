#!/usr/bin/env node
const { buildSync } = require("esbuild");
const { join } = require("path");

const { dependencies, peerDependencies } = require("../package.json");

const opts = {
    entryPoints: ["src/index.ts"],
    absWorkingDir: join(__dirname, ".."),
    bundle: true,
    sourcemap: true,
};

const external = Object.keys({ ...dependencies, ...peerDependencies });

try {
    // esm
    buildSync({
        ...opts,
        platform: "neutral",
        outfile: "dist/esm/react-oidc-client.js",
        external,
    });
    // node
    buildSync({
        ...opts,
        platform: "node",
        outfile: "dist/umd/react-oidc-client.js",
        external,
    });

    // browser (self contained)
    buildSync({
        ...opts,
        platform: "browser",
        outfile: "dist/browser/react-oidc-client.js",
        globalName: "reactoidcclient",
    });
    // browser-min (self contained)
    buildSync({
        ...opts,
        platform: "browser",
        outfile: "dist/browser/react-oidc-client.min.js",
        globalName: "reactoidcclient",
        minify: true,
    });
} catch (err) {
    // esbuild handles error reporting
    process.exitCode = 1;
}
